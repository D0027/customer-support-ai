"""
Module 3: Intent Detection Agent.
Classifies a customer query into one or more categories:
billing, refund, product, technical, complaint, general_faq.
"""

import json
from agents.llm_client import chat_completion

INTENT_LABELS = ["billing", "refund", "product", "technical", "complaint", "general_faq"]

SYSTEM_PROMPT = f"""You are an intent classification engine for a customer support system.
Classify the user's message into one or more of these intents: {", ".join(INTENT_LABELS)}.
A message can belong to more than one intent (e.g. "I paid but the feature is locked" is both billing and technical).
Respond ONLY with valid JSON in this exact format, no extra text:
{{"intents": ["intent1", "intent2"]}}
"""


def detect_intent(message: str) -> list[str]:
    raw = chat_completion(SYSTEM_PROMPT, message, temperature=0.0)
    try:
        # Strip markdown fences if the model adds them
        cleaned = raw.replace("```json", "").replace("```", "").strip()
        parsed = json.loads(cleaned)
        intents = [i for i in parsed.get("intents", []) if i in INTENT_LABELS]
        return intents or ["general_faq"]
    except Exception:
        return _keyword_fallback(message)


def _keyword_fallback(message: str) -> list[str]:
    """Simple keyword-based fallback if the LLM output isn't parseable JSON."""
    msg = message.lower()
    intents = []
    if any(w in msg for w in ["pay", "payment", "invoice", "subscription", "bill", "charge"]):
        intents.append("billing")
    if any(w in msg for w in ["refund", "money back", "return"]):
        intents.append("refund")
    if any(w in msg for w in ["price", "feature", "compare", "available", "plan"]):
        intents.append("product")
    if any(w in msg for w in ["login", "password", "error", "bug", "install", "not working", "locked"]):
        intents.append("technical")
    if any(w in msg for w in ["complaint", "angry", "unhappy", "worst", "disappointed", "escalate"]):
        intents.append("complaint")
    return intents or ["general_faq"]
