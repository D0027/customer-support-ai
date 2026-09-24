"""
Shared LLM client (Groq / Llama 3). All agents call through here.
"""

import base64
import re
from functools import lru_cache
from groq import Groq
from config import settings


@lru_cache(maxsize=1)
def get_client() -> Groq:
    return Groq(api_key=settings.GROQ_API_KEY)


def chat_completion(system_prompt: str, user_prompt: str, temperature: float = 0.3) -> str:
    client = get_client()
    try:
        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=temperature,
            max_tokens=800,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"[LLM error: unable to generate a response right now. Details: {e}]"


def chat_completion_stream(system_prompt: str, user_prompt: str, temperature: float = 0.3):
    """Yields text chunks as they arrive from the LLM."""
    client = get_client()
    try:
        stream = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=temperature,
            max_tokens=800,
            stream=True,
        )
        for chunk in stream:
            delta = chunk.choices[0].delta.content
            if delta:
                yield delta
    except Exception as e:
        yield f"[LLM error: {e}]"


def analyze_image(image_path: str, question: str) -> str:
    """Send an image + question to a vision-capable model and return the answer."""
    client = get_client()
    try:
        with open(image_path, "rb") as f:
            image_b64 = base64.b64encode(f.read()).decode("utf-8")

        response = client.chat.completions.create(
            model=settings.GROQ_VISION_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": question or "Describe what you see in this image and note anything relevant to a customer support issue."},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"}},
                    ],
                }
            ],
            temperature=0.3,
            max_tokens=500,
        )
        raw = response.choices[0].message.content.strip()
        cleaned = re.sub(r"<think>.*?</think>", "", raw, flags=re.DOTALL).strip()
        return cleaned or raw
    except Exception as e:
        return f"[Unable to analyze image: {e}]"