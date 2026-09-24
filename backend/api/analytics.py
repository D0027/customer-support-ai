"""
Module 9: Analytics Dashboard (Optional) + Bonus: satisfaction feedback.
"""

from fastapi import APIRouter
from database.db import conversations_collection, messages_collection, feedback_collection, reactions_collection
from models.schemas import AnalyticsSummary, FeedbackIn, ReactionIn
from datetime import datetime, timezone, timedelta

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/summary", response_model=AnalyticsSummary)
async def summary():
    total_conversations = await conversations_collection.count_documents({})

    agent_usage: dict[str, int] = {}
    cursor = messages_collection.find({"role": "assistant", "agent": {"$ne": None}})
    async for doc in cursor:
        for agent in (doc.get("agent") or "").split(","):
            agent = agent.strip()
            if agent:
                agent_usage[agent] = agent_usage.get(agent, 0) + 1

    ratings = [doc["rating"] async for doc in feedback_collection.find({})]
    avg_satisfaction = sum(ratings) / len(ratings) if ratings else None
    thumbs_up = await reactions_collection.count_documents({"reaction": "up"})
    thumbs_down = await reactions_collection.count_documents({"reaction": "down"})

    return AnalyticsSummary(
    total_conversations=total_conversations,
    agent_usage=agent_usage,
    avg_response_time_ms=0.0,
    avg_satisfaction=avg_satisfaction,
    thumbs_up=thumbs_up,
    thumbs_down=thumbs_down,
)


@router.post("/feedback")
async def submit_feedback(payload: FeedbackIn):
    await feedback_collection.insert_one(payload.model_dump())
    return {"status": "recorded"}


@router.post("/reaction")
async def submit_reaction(payload: ReactionIn):
    await reactions_collection.update_one(
        {"session_id": payload.session_id, "message_index": payload.message_index},
        {"$set": {"reaction": payload.reaction}},
        upsert=True,
    )

    from database.db import ab_test_results_collection
    await ab_test_results_collection.update_one(
        {"session_id": payload.session_id},
        {"$set": {"reaction": payload.reaction}},
        sort=[("timestamp", -1)],
    )
    return {"status": "recorded"}


@router.get("/response-times")
async def response_time_trend():
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    cursor = messages_collection.find({
        "role": "assistant",
        "response_time_ms": {"$exists": True},
        "timestamp": {"$gte": seven_days_ago},
    })

    daily_times: dict[str, list[float]] = {}
    async for doc in cursor:
        day_key = doc["timestamp"].strftime("%Y-%m-%d")
        daily_times.setdefault(day_key, []).append(doc["response_time_ms"])

    result = [
        {"date": day, "avg_ms": round(sum(times) / len(times))}
        for day, times in sorted(daily_times.items())
    ]
    return result