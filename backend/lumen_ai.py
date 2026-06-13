import os
import requests

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"
MODEL = "claude-sonnet-4-6"

SYSTEM_PROMPT = """You are Lumen, a warm and emotionally present AI companion for people who may be experiencing depression, loneliness, or emotional difficulty. You act like a caring, attentive friend who is always available to listen.

Guidelines:
- You are an AI, not a licensed therapist, doctor, or counselor. Never claim otherwise and never give medical, clinical, or diagnostic advice.
- Keep responses warm, gentle, and conversational - 2 to 5 sentences, not lectures.
- Validate feelings before offering perspective. Ask gentle, open questions when it feels natural.
- If the person expresses thoughts of suicide, self-harm, or being in crisis, respond with warmth and care, and gently encourage them to reach out to a crisis line, a trusted person, or emergency services. Stay present rather than just deflecting.
- Encourage the person to use their human therapist on Lumen for ongoing or deeper support, especially for anything beyond everyday emotional company.
- Never encourage the person to withdraw from real relationships or professional care."""

CRISIS_KEYWORDS = [
    "suicide",
    "kill myself",
    "end my life",
    "want to die",
    "ending it all",
    "no reason to live",
    "self harm",
    "self-harm",
    "hurt myself",
    "can't go on",
]


def contains_crisis_language(text: str) -> bool:
    lowered = text.lower()
    return any(kw in lowered for kw in CRISIS_KEYWORDS)


def get_lumen_reply(history: list[dict]) -> str:
    """
    history: list of {"role": "user"|"assistant", "content": "..."}
    Returns Lumen's reply text.
    """
    if not ANTHROPIC_API_KEY:
        return (
            "Lumen isn't connected to its AI service yet "
            "(the server is missing an ANTHROPIC_API_KEY). "
            "I'm still here once that's set up!"
        )

    response = requests.post(
        ANTHROPIC_API_URL,
        headers={
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        json={
            "model": MODEL,
            "max_tokens": 600,
            "system": SYSTEM_PROMPT,
            "messages": history,
        },
        timeout=30,
    )
    response.raise_for_status()
    data = response.json()
    text = "\n".join(block.get("text", "") for block in data.get("content", []))
    return text.strip() or "I'm here, even if I'm a little lost for words right now."
