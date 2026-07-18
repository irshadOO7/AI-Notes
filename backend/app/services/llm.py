from __future__ import annotations

import httpx

from app.config import settings


def _fallback_summary(title: str, content: str) -> str:
    text = f"{title}. {content}".strip()
    if not text:
        return "No content to summarize."
    words = text.split()
    if len(words) <= 30:
        return text
    return " ".join(words[:30]) + "..."


async def generate_summary(title: str, content: str) -> tuple[str, str]:
    prompt = (
        "Summarize the following note in 2-3 concise sentences. "
        "Focus on the key points only.\n\n"
        f"Title: {title or 'Untitled'}\n"
        f"Content: {content or 'No content'}"
    )

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{settings.ollama_base_url}/api/generate",
                json={
                    "model": settings.ollama_model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {"temperature": 0.3},
                },
            )
            response.raise_for_status()
            data = response.json()
            summary = data.get("response", "").strip()
            if summary:
                return summary, "ollama"
    except (httpx.HTTPError, httpx.TimeoutException):
        pass

    return _fallback_summary(title, content), "fallback"
