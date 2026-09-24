"""
Bonus Enhancement: Sentiment analysis for routing frustrated customers.
Used to decide whether to escalate / prioritize human handoff.
"""

from agents.llm_client import chat_completion

SYSTEM_PROMPT = """You are a sentiment classifier for customer support messages.
Classify the sentiment as exactly one word: positive, neutral, negative, or angry.
Respond with ONLY that single word, nothing else."""


def analyze_sentiment(message: str) -> str:
    raw = chat_completion(SYSTEM_PROMPT, message, temperature=0.0)
    label = raw.strip().lower().split()[0] if raw.strip() else "neutral"
    valid = {"positive", "neutral", "negative", "angry"}
    return label if label in valid else "neutral"


def should_escalate(sentiment: str, intents: list[str]) -> bool:
    """Bonus: Human-agent handoff trigger."""
    if sentiment == "angry":
        return True
    if sentiment == "negative" and "complaint" in intents:
        return True
    return False
