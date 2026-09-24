"""
Module 8: Conversation Memory.
Stores user messages + AI responses with timestamp and session ID.
"""

from datetime import datetime, timezone
from database.db import messages_collection, conversations_collection


async def save_message(session_id: str, role: str, content: str, agent: str = None, user_id: str = None, response_time_ms: float = None, ticket_id: str = None):
    doc = {
        "session_id": session_id,
        "role": role,
        "content": content,
        "agent": agent,
        "timestamp": datetime.now(timezone.utc),
    }
    if user_id:
        doc["user_id"] = user_id
    if response_time_ms is not None:
        doc["response_time_ms"] = response_time_ms
    if ticket_id:
        doc["ticket_id"] = ticket_id

    await messages_collection.insert_one(doc)

    update_fields = {"session_id": session_id, "last_active": doc["timestamp"]}
    if user_id:
        update_fields["user_id"] = user_id

    await conversations_collection.update_one(
        {"session_id": session_id},
        {
            "$set": update_fields,
            "$setOnInsert": {"created_at": doc["timestamp"]},
        },
        upsert=True,
    )


async def get_history(session_id: str, limit: int = 20) -> list[dict]:
    cursor = (
        messages_collection.find({"session_id": session_id})
        .sort("timestamp", 1)
        .limit(limit)
    )
    return [doc async for doc in cursor]


async def get_history_text(session_id: str, limit: int = 10) -> str:
    """Formatted history string for prompting the LLM with recent context."""
    history = await get_history(session_id, limit)
    lines = [f"{m['role']}: {m['content']}" for m in history[-limit:]]
    return "\n".join(lines)


async def get_user_sessions(user_id: str, limit: int = 30) -> list[dict]:
    """List a user's past conversations, most recently active first, with a short preview."""
    cursor = (
        conversations_collection.find({"user_id": user_id})
        .sort("last_active", -1)
        .limit(limit)
    )
    sessions = []
    async for conv in cursor:
        first_msg = await messages_collection.find_one(
            {"session_id": conv["session_id"], "role": "user"},
            sort=[("timestamp", 1)],
        )
        sessions.append({
            "session_id": conv["session_id"],
            "last_active": conv["last_active"],
            "preview": (first_msg["content"][:60] if first_msg else "New conversation"),
            "pinned": conv.get("pinned", False),
            "tag": conv.get("tag", ""),
        })
    return sessions

async def delete_session(session_id: str, user_id: str) -> bool:
    """Permanently delete a conversation's messages and its session record."""
    conv = await conversations_collection.find_one({"session_id": session_id, "user_id": user_id})
    if not conv:
        return False
    await messages_collection.delete_many({"session_id": session_id})
    await conversations_collection.delete_one({"session_id": session_id})
    return True


async def toggle_pin(session_id: str, user_id: str) -> bool:
    conv = await conversations_collection.find_one({"session_id": session_id, "user_id": user_id})
    if not conv:
        return False
    new_pinned = not conv.get("pinned", False)
    await conversations_collection.update_one(
        {"session_id": session_id},
        {"$set": {"pinned": new_pinned}},
    )
    return new_pinned


async def update_session_tag(session_id: str, user_id: str, tag: str) -> bool:
    conv = await conversations_collection.find_one({"session_id": session_id, "user_id": user_id})
    if not conv:
        return False
    await conversations_collection.update_one(
        {"session_id": session_id},
        {"$set": {"tag": tag}},
    )
    return True