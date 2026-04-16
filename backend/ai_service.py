import os
import io
import json
import httpx
import speech_recognition as sr


def _get_host():
    host = os.environ.get("DATABRICKS_HOST", "")
    if host and not host.startswith("http"):
        host = f"https://{host}"
    return host


def _get_token():
    token = os.environ.get("DATABRICKS_TOKEN", "")
    if token:
        return token
    client_id = os.environ.get("DATABRICKS_CLIENT_ID", "")
    client_secret = os.environ.get("DATABRICKS_CLIENT_SECRET", "")
    host = _get_host()
    if client_id and client_secret and host:
        try:
            resp = httpx.post(f"{host}/oidc/v1/token",
                data={"grant_type": "client_credentials", "scope": "all-apis"},
                auth=(client_id, client_secret), timeout=15)
            resp.raise_for_status()
            return resp.json()["access_token"]
        except Exception as e:
            print(f"OAuth token error: {e}")
    return ""


def _get_model():
    try:
        from .database import get_cursor
        with get_cursor() as cur:
            cur.execute("SELECT value FROM app_settings WHERE key = 'llm_model'")
            row = cur.fetchone()
            if row:
                return row["value"]
    except Exception:
        pass
    return os.environ.get("LLM_MODEL", "databricks-claude-sonnet-4-6")


def _call_llm(prompt: str, max_tokens: int = 2048, temperature: float = 0.1) -> str:
    host = _get_host()
    token = _get_token()
    model = _get_model()
    url = f"{host}/serving-endpoints/{model}/invocations"
    payload = {
        "anthropic_version": "2023-06-01",
        "max_tokens": max_tokens, "temperature": temperature,
        "messages": [{"role": "user", "content": prompt}],
    }
    resp = httpx.post(url, json=payload,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"}, timeout=120)
    if resp.status_code != 200:
        print(f"FMAPI error {resp.status_code}: {resp.text[:500]}")
        resp.raise_for_status()
    data = resp.json()
    if "content" in data and isinstance(data["content"], list):
        return "\n".join(b["text"] for b in data["content"] if b.get("type") == "text")
    if "choices" in data:
        return data["choices"][0]["message"]["content"]
    return str(data)


def transcribe_audio(audio_bytes: bytes, file_name: str) -> dict:
    """Transcribe audio using Google Speech Recognition.

    Accepts WAV files natively. For MP3/other formats, attempts pydub conversion
    (requires ffmpeg) or returns error suggesting WAV format.
    """
    recognizer = sr.Recognizer()

    # If not WAV, try converting with pydub/ffmpeg
    if audio_bytes[:4] != b'RIFF':
        try:
            from pydub import AudioSegment
            ext = file_name.rsplit(".", 1)[-1].lower() if "." in file_name else "mp3"
            audio = AudioSegment.from_file(io.BytesIO(audio_bytes), format=ext)
            buf = io.BytesIO()
            audio.export(buf, format="wav", parameters=["-ar", "16000", "-ac", "1"])
            audio_bytes = buf.getvalue()
        except Exception as e:
            print(f"Cannot convert {file_name} to WAV: {e}")
            return {"text": f"[Formato nao suportado: {file_name}. Use arquivos WAV.]"}

    # Read WAV with SpeechRecognition
    try:
        with sr.AudioFile(io.BytesIO(audio_bytes)) as source:
            total_duration = source.DURATION
    except Exception as e:
        print(f"Cannot read audio {file_name}: {e}")
        return {"text": f"[Erro ao ler audio: {file_name}]"}

    # Transcribe in chunks of ~55s (Google API limit)
    chunk_seconds = 55
    parts = []
    offset = 0

    while offset < total_duration:
        dur = min(chunk_seconds, total_duration - offset)
        with sr.AudioFile(io.BytesIO(audio_bytes)) as source:
            audio_data = recognizer.record(source, offset=offset, duration=dur)
        try:
            text = recognizer.recognize_google(audio_data, language="pt-BR")
            parts.append(text)
        except sr.UnknownValueError:
            pass
        except sr.RequestError as e:
            print(f"Google STT error: {e}")
            parts.append("[erro de transcricao]")
        offset += chunk_seconds

    full_text = " ".join(parts)
    if not full_text.strip():
        return {"text": f"[Audio sem fala reconhecida: {file_name}]"}

    return {"text": full_text}


def analyze_transcription(transcription: str, categories: list[str]) -> dict:
    categories_str = ", ".join(categories)
    prompt = f"""Analyze the following customer service call transcription and provide a structured analysis.

Available categories: {categories_str}

Transcription:
---
{transcription}
---

Respond ONLY with a valid JSON object (no markdown, no code blocks) with these exact fields:
{{
    "summary": "A concise 2-3 sentence summary of the call in Portuguese",
    "category": "One of the available categories that best fits",
    "sentiment": "positive, negative, or neutral",
    "sentiment_score": 0.0 to 1.0 (0=very negative, 0.5=neutral, 1=very positive),
    "key_topics": ["topic1", "topic2", "topic3"],
    "urgency_level": "low, normal, high, or critical",
    "language_detected": "pt, en, or es",
    "speaker_count": estimated number of speakers,
    "action_items": ["action1", "action2"]
}}"""
    text = _call_llm(prompt, max_tokens=2048, temperature=0.1).strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
    return json.loads(text)


def generate_detailed_report(transcription: str, summary: str, category: str) -> str:
    prompt = f"""Based on this customer service call analysis, write a professional detailed report in Portuguese (Brazil).

Category: {category}
Summary: {summary}
Full Transcription:
{transcription}

Write a structured report with these sections:
1. Resumo Executivo
2. Detalhes da Interacao
3. Pontos Principais Identificados
4. Analise de Sentimento
5. Recomendacoes e Proximos Passos

Be professional and concise. Use bullet points where appropriate."""
    return _call_llm(prompt, max_tokens=3000, temperature=0.3)
