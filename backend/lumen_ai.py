import os
import requests

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
MODEL = "gemini-2.0-flash"
GEMINI_API_URL = (
    f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"
)

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

    Uses Google's Gemini API (has a free tier). Get a key at
    https://aistudio.google.com/app/apikey and set it as GEMINI_API_KEY.
    """
    if not GEMINI_API_KEY:
        return (
            "Lumen isn't connected to its AI service yet "
            "(the server is missing a GEMINI_API_KEY). "
            "I'm still here once that's set up!"
        )

    # Gemini uses "user"/"model" roles instead of "user"/"assistant",
    # and takes "contents" with "parts" instead of a flat messages list.
    contents = [
        {
            "role": "model" if m["role"] == "assistant" else "user",
            "parts": [{"text": m["content"]}],
        }
        for m in history
    ]

    response = requests.post(
        GEMINI_API_URL,
        params={"key": GEMINI_API_KEY},
        headers={"content-type": "application/json"},
        json={
            "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
            "contents": contents,
            "generationConfig": {"maxOutputTokens": 400},
        },
        timeout=30,
    )
    response.raise_for_status()
    data = response.json()

    try:
        parts = data["candidates"][0]["content"]["parts"]
        text = "".join(p.get("text", "") for p in parts).strip()
    except (KeyError, IndexError):
        text = ""

    return text or "I'm here, even if I'm a little lost for words right now."
