import os
import json
import base64
import httpx
from openai import OpenAI


def get_openai_client():
    """Get OpenAI-compatible client pointing to Databricks Foundation Model API."""
    host = os.environ.get("DATABRICKS_HOST", "")
    token = os.environ.get("DATABRICKS_TOKEN", "")
    return OpenAI(
        api_key=token,
        base_url=f"{host}/serving-endpoints",
    )


def transcribe_audio(audio_bytes: bytes, file_name: str) -> dict:
    """Transcribe audio using Databricks Foundation Model API (Whisper)."""
    host = os.environ.get("DATABRICKS_HOST", "")
    token = os.environ.get("DATABRICKS_TOKEN", "")

    audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")

    # Determine MIME type
    ext = file_name.rsplit(".", 1)[-1].lower() if "." in file_name else "wav"
    mime_map = {
        "wav": "audio/wav", "mp3": "audio/mpeg", "ogg": "audio/ogg",
        "flac": "audio/flac", "m4a": "audio/mp4", "webm": "audio/webm",
    }
    mime_type = mime_map.get(ext, "audio/wav")

    # Use Claude with audio input for transcription
    client = get_openai_client()
    response = client.chat.completions.create(
        model="databricks-claude-sonnet-4",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "input_audio",
                        "input_audio": {
                            "data": audio_b64,
                            "format": ext if ext in ["wav", "mp3"] else "wav",
                        },
                    },
                    {
                        "type": "text",
                        "text": (
                            "Please transcribe this audio recording word-for-word. "
                            "Include speaker changes if detectable. "
                            "Output ONLY the transcription text, no extra commentary."
                        ),
                    },
                ],
            }
        ],
        max_tokens=4096,
    )
    transcription = response.choices[0].message.content
    return {"text": transcription}


def analyze_transcription(transcription: str, categories: list[str]) -> dict:
    """Analyze transcription for summary, sentiment, category, topics, action items."""
    client = get_openai_client()

    categories_str = ", ".join(categories)
    prompt = f"""Analyze the following customer service call transcription and provide a structured analysis.

Available categories: {categories_str}

Transcription:
---
{transcription}
---

Respond ONLY with a valid JSON object (no markdown, no code blocks) with these exact fields:
{{
    "summary": "A concise 2-3 sentence summary of the call",
    "category": "One of the available categories that best fits",
    "sentiment": "positive, negative, or neutral",
    "sentiment_score": 0.0 to 1.0 (0=very negative, 0.5=neutral, 1=very positive),
    "key_topics": ["topic1", "topic2", "topic3"],
    "urgency_level": "low, normal, high, or critical",
    "language_detected": "pt, en, or es",
    "speaker_count": estimated number of speakers,
    "action_items": ["action1", "action2"]
}}"""

    response = client.chat.completions.create(
        model="databricks-claude-sonnet-4",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=2048,
        temperature=0.1,
    )

    text = response.choices[0].message.content.strip()
    # Try to parse JSON, handle potential markdown wrapping
    if text.startswith("```"):
        text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
    return json.loads(text)


def generate_detailed_report(transcription: str, summary: str, category: str) -> str:
    """Generate a detailed narrative report for PDF export."""
    client = get_openai_client()

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

    response = client.chat.completions.create(
        model="databricks-claude-sonnet-4",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=3000,
        temperature=0.3,
    )
    return response.choices[0].message.content
