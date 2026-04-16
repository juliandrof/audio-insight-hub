import os
import json
import datetime
import traceback
from typing import Optional

from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.responses import Response, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .database import get_cursor, init_database
from .ai_service import transcribe_audio, analyze_transcription, generate_detailed_report
from .pdf_service import generate_analysis_pdf, generate_batch_pdf

app = FastAPI(title="Audio Insight Hub API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    try:
        init_database()
        print("Database initialized successfully")
    except Exception as e:
        print(f"Warning: Could not initialize database: {e}")


# ---- Models ----

class CategoryCreate(BaseModel):
    name: str
    color: str = "#6366f1"
    icon: str = "tag"


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None


class SettingUpdate(BaseModel):
    key: str
    value: str


# ---- Health ----

@app.get("/api/health")
async def health():
    db_ok = False
    try:
        with get_cursor() as cur:
            cur.execute("SELECT 1")
            db_ok = True
    except Exception:
        pass
    return {"status": "ok", "database": db_ok, "version": "1.0.0"}


# ---- Categories ----

@app.get("/api/categories")
async def list_categories():
    with get_cursor() as cur:
        cur.execute("SELECT * FROM categories ORDER BY name")
        return cur.fetchall()


@app.post("/api/categories")
async def create_category(cat: CategoryCreate):
    with get_cursor() as cur:
        cur.execute(
            "INSERT INTO categories (name, color, icon) VALUES (%s, %s, %s) RETURNING *",
            (cat.name, cat.color, cat.icon),
        )
        return cur.fetchone()


@app.put("/api/categories/{cat_id}")
async def update_category(cat_id: int, cat: CategoryUpdate):
    updates = []
    values = []
    if cat.name is not None:
        updates.append("name = %s")
        values.append(cat.name)
    if cat.color is not None:
        updates.append("color = %s")
        values.append(cat.color)
    if cat.icon is not None:
        updates.append("icon = %s")
        values.append(cat.icon)
    if not updates:
        raise HTTPException(400, "No fields to update")
    values.append(cat_id)
    with get_cursor() as cur:
        cur.execute(f"UPDATE categories SET {', '.join(updates)} WHERE id = %s RETURNING *", values)
        row = cur.fetchone()
        if not row:
            raise HTTPException(404, "Category not found")
        return row


@app.delete("/api/categories/{cat_id}")
async def delete_category(cat_id: int):
    with get_cursor() as cur:
        cur.execute("DELETE FROM categories WHERE id = %s", (cat_id,))
        return {"deleted": True}


# ---- Audio Processing ----

@app.post("/api/audio/upload")
async def upload_and_process(file: UploadFile = File(...)):
    """Upload an audio file, transcribe it, and analyze."""
    if not file.filename:
        raise HTTPException(400, "No file provided")

    audio_bytes = await file.read()
    file_size = len(audio_bytes)

    try:
        # Step 1: Transcribe
        transcript_result = transcribe_audio(audio_bytes, file.filename)
        transcription = transcript_result["text"]

        # Step 2: Get categories for analysis
        with get_cursor() as cur:
            cur.execute("SELECT name FROM categories ORDER BY name")
            categories = [r["name"] for r in cur.fetchall()]

        # Step 3: Analyze
        analysis = analyze_transcription(transcription, categories)

        # Step 4: Find category ID
        category_id = None
        with get_cursor() as cur:
            cur.execute("SELECT id FROM categories WHERE name = %s", (analysis.get("category", ""),))
            row = cur.fetchone()
            if row:
                category_id = row["id"]

        # Step 5: Save to database
        with get_cursor() as cur:
            cur.execute(
                """INSERT INTO audio_analyses
                (file_name, file_size, transcription, summary, category_id,
                 sentiment, sentiment_score, key_topics, urgency_level,
                 language_detected, speaker_count, action_items, processed_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING *""",
                (
                    file.filename,
                    file_size,
                    transcription,
                    analysis.get("summary", ""),
                    category_id,
                    analysis.get("sentiment", "neutral"),
                    analysis.get("sentiment_score", 0.5),
                    analysis.get("key_topics", []),
                    analysis.get("urgency_level", "normal"),
                    analysis.get("language_detected", "pt"),
                    analysis.get("speaker_count", 1),
                    analysis.get("action_items", []),
                    datetime.datetime.now(),
                ),
            )
            saved = cur.fetchone()

        return {
            **dict(saved),
            "category_name": analysis.get("category", ""),
            "created_at": str(saved["created_at"]) if saved.get("created_at") else None,
            "processed_at": str(saved["processed_at"]) if saved.get("processed_at") else None,
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(500, f"Processing error: {str(e)}")


@app.post("/api/audio/process-volume")
async def process_from_volume(
    volume_path: str = Query(..., description="Databricks Volume path e.g. /Volumes/catalog/schema/volume"),
):
    """List and process audio files from a Databricks Volume."""
    from databricks.sdk import WorkspaceClient

    w = WorkspaceClient()
    results = []

    try:
        files = w.files.list_directory_contents(volume_path)
        audio_extensions = {".wav", ".mp3", ".ogg", ".flac", ".m4a", ".webm"}

        for f in files:
            if not f.path:
                continue
            ext = "." + f.path.rsplit(".", 1)[-1].lower() if "." in f.path else ""
            if ext not in audio_extensions:
                continue

            # Download file
            resp = w.files.download(f.path)
            audio_bytes = resp.contents.read()

            file_name = f.path.rsplit("/", 1)[-1]

            # Transcribe
            transcript_result = transcribe_audio(audio_bytes, file_name)
            transcription = transcript_result["text"]

            # Get categories
            with get_cursor() as cur:
                cur.execute("SELECT name FROM categories ORDER BY name")
                categories = [r["name"] for r in cur.fetchall()]

            # Analyze
            analysis = analyze_transcription(transcription, categories)

            # Find category ID
            category_id = None
            with get_cursor() as cur:
                cur.execute("SELECT id FROM categories WHERE name = %s", (analysis.get("category", ""),))
                row = cur.fetchone()
                if row:
                    category_id = row["id"]

            # Save
            with get_cursor() as cur:
                cur.execute(
                    """INSERT INTO audio_analyses
                    (file_name, file_path, file_size, transcription, summary, category_id,
                     sentiment, sentiment_score, key_topics, urgency_level,
                     language_detected, speaker_count, action_items, processed_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING *""",
                    (
                        file_name, f.path, len(audio_bytes),
                        transcription, analysis.get("summary", ""), category_id,
                        analysis.get("sentiment", "neutral"),
                        analysis.get("sentiment_score", 0.5),
                        analysis.get("key_topics", []),
                        analysis.get("urgency_level", "normal"),
                        analysis.get("language_detected", "pt"),
                        analysis.get("speaker_count", 1),
                        analysis.get("action_items", []),
                        datetime.datetime.now(),
                    ),
                )
                saved = cur.fetchone()
                results.append({
                    **dict(saved),
                    "category_name": analysis.get("category", ""),
                    "created_at": str(saved["created_at"]) if saved.get("created_at") else None,
                    "processed_at": str(saved["processed_at"]) if saved.get("processed_at") else None,
                })

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(500, f"Volume processing error: {str(e)}")

    return {"processed": len(results), "results": results}


# ---- Analyses ----

@app.get("/api/analyses")
async def list_analyses(
    category_id: Optional[int] = None,
    sentiment: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
):
    conditions = []
    params = []
    if category_id:
        conditions.append("a.category_id = %s")
        params.append(category_id)
    if sentiment:
        conditions.append("a.sentiment = %s")
        params.append(sentiment)
    if search:
        conditions.append("(a.file_name ILIKE %s OR a.transcription ILIKE %s OR a.summary ILIKE %s)")
        params.extend([f"%{search}%"] * 3)

    where = f"WHERE {' AND '.join(conditions)}" if conditions else ""

    with get_cursor() as cur:
        cur.execute(f"SELECT COUNT(*) as total FROM audio_analyses a {where}", params)
        total = cur.fetchone()["total"]

        cur.execute(
            f"""SELECT a.*, c.name as category_name, c.color as category_color, c.icon as category_icon
                FROM audio_analyses a
                LEFT JOIN categories c ON a.category_id = c.id
                {where}
                ORDER BY a.created_at DESC
                LIMIT %s OFFSET %s""",
            params + [limit, offset],
        )
        rows = cur.fetchall()

    return {"total": total, "items": _serialize_rows(rows)}


@app.get("/api/analyses/{analysis_id}")
async def get_analysis(analysis_id: int):
    with get_cursor() as cur:
        cur.execute(
            """SELECT a.*, c.name as category_name, c.color as category_color, c.icon as category_icon
               FROM audio_analyses a
               LEFT JOIN categories c ON a.category_id = c.id
               WHERE a.id = %s""",
            (analysis_id,),
        )
        row = cur.fetchone()
        if not row:
            raise HTTPException(404, "Analysis not found")
        return _serialize_row(row)


@app.delete("/api/analyses/{analysis_id}")
async def delete_analysis(analysis_id: int):
    with get_cursor() as cur:
        cur.execute("DELETE FROM audio_analyses WHERE id = %s", (analysis_id,))
        return {"deleted": True}


# ---- Dashboard Stats ----

@app.get("/api/dashboard/stats")
async def dashboard_stats():
    with get_cursor() as cur:
        cur.execute("SELECT COUNT(*) as total FROM audio_analyses")
        total = cur.fetchone()["total"]

        cur.execute(
            """SELECT sentiment, COUNT(*) as count
               FROM audio_analyses GROUP BY sentiment"""
        )
        sentiments = {r["sentiment"]: r["count"] for r in cur.fetchall()}

        cur.execute(
            """SELECT c.name, c.color, COUNT(a.id) as count
               FROM categories c
               LEFT JOIN audio_analyses a ON a.category_id = c.id
               GROUP BY c.name, c.color
               ORDER BY count DESC"""
        )
        categories = cur.fetchall()

        cur.execute(
            """SELECT urgency_level, COUNT(*) as count
               FROM audio_analyses GROUP BY urgency_level"""
        )
        urgency = {r["urgency_level"]: r["count"] for r in cur.fetchall()}

        cur.execute("SELECT AVG(sentiment_score) as avg_score FROM audio_analyses")
        avg_sentiment = cur.fetchone()["avg_score"]

        cur.execute(
            """SELECT DATE(created_at) as date, COUNT(*) as count
               FROM audio_analyses
               WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
               GROUP BY DATE(created_at)
               ORDER BY date"""
        )
        timeline = cur.fetchall()

        # Top topics
        cur.execute(
            """SELECT unnest(key_topics) as topic, COUNT(*) as count
               FROM audio_analyses
               GROUP BY topic
               ORDER BY count DESC
               LIMIT 10"""
        )
        top_topics = cur.fetchall()

    return {
        "total_analyses": total,
        "sentiments": sentiments,
        "categories": [dict(r) for r in categories],
        "urgency": urgency,
        "avg_sentiment_score": float(avg_sentiment) if avg_sentiment else 0.5,
        "timeline": [{"date": str(r["date"]), "count": r["count"]} for r in timeline],
        "top_topics": [dict(r) for r in top_topics],
    }


# ---- PDF Export ----

@app.get("/api/export/pdf/{analysis_id}")
async def export_single_pdf(analysis_id: int):
    with get_cursor() as cur:
        cur.execute(
            """SELECT a.*, c.name as category_name
               FROM audio_analyses a
               LEFT JOIN categories c ON a.category_id = c.id
               WHERE a.id = %s""",
            (analysis_id,),
        )
        row = cur.fetchone()
        if not row:
            raise HTTPException(404, "Analysis not found")

    data = dict(row)
    data["category"] = data.pop("category_name", "N/A")
    pdf_bytes = generate_analysis_pdf(data)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="analise_{analysis_id}.pdf"'},
    )


@app.post("/api/export/pdf/batch")
async def export_batch_pdf(analysis_ids: list[int]):
    analyses = []
    with get_cursor() as cur:
        for aid in analysis_ids:
            cur.execute(
                """SELECT a.*, c.name as category_name
                   FROM audio_analyses a
                   LEFT JOIN categories c ON a.category_id = c.id
                   WHERE a.id = %s""",
                (aid,),
            )
            row = cur.fetchone()
            if row:
                data = dict(row)
                data["category"] = data.pop("category_name", "N/A")
                analyses.append(data)

    if not analyses:
        raise HTTPException(404, "No analyses found")

    pdf_bytes = generate_batch_pdf(analyses)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="relatorio_consolidado.pdf"'},
    )


@app.get("/api/export/pdf/all")
async def export_all_pdf():
    with get_cursor() as cur:
        cur.execute(
            """SELECT a.*, c.name as category_name
               FROM audio_analyses a
               LEFT JOIN categories c ON a.category_id = c.id
               ORDER BY a.created_at DESC"""
        )
        rows = cur.fetchall()

    if not rows:
        raise HTTPException(404, "No analyses found")

    analyses = []
    for row in rows:
        data = dict(row)
        data["category"] = data.pop("category_name", "N/A")
        analyses.append(data)

    pdf_bytes = generate_batch_pdf(analyses)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="relatorio_completo.pdf"'},
    )


# ---- Settings ----

@app.get("/api/settings")
async def get_settings():
    with get_cursor() as cur:
        cur.execute("SELECT * FROM app_settings")
        return {r["key"]: r["value"] for r in cur.fetchall()}


@app.put("/api/settings")
async def update_setting(setting: SettingUpdate):
    with get_cursor() as cur:
        cur.execute(
            """INSERT INTO app_settings (key, value, updated_at)
               VALUES (%s, %s, CURRENT_TIMESTAMP)
               ON CONFLICT (key) DO UPDATE SET value = %s, updated_at = CURRENT_TIMESTAMP""",
            (setting.key, setting.value, setting.value),
        )
        return {"key": setting.key, "value": setting.value}


# ---- Serve Frontend ----

frontend_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
if os.path.isdir(frontend_dir):
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")


# ---- Helpers ----

def _serialize_row(row):
    d = dict(row)
    for k, v in d.items():
        if isinstance(v, (datetime.datetime, datetime.date)):
            d[k] = v.isoformat()
    return d


def _serialize_rows(rows):
    return [_serialize_row(r) for r in rows]
