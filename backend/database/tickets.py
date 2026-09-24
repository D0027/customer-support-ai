"""
Bonus Enhancement: Automatic ticket creation for escalated / unresolved issues.
"""

import uuid
from datetime import datetime, timezone, timedelta
from database.db import tickets_collection, audit_log_collection


SLA_HOURS = {"high": 2, "medium": 8, "low": 24}

async def create_ticket(session_id: str, subject: str, description: str, priority: str = "medium") -> str:
    ticket_id = str(uuid.uuid4())[:8]
    now = datetime.now(timezone.utc)
    sla_hours = SLA_HOURS.get(priority, 8)
    doc = {
        "_id": ticket_id,
        "ticket_id": ticket_id,
        "session_id": session_id,
        "subject": subject,
        "description": description,
        "status": "open",
        "priority": priority,
        "created_at": now,
        "sla_deadline": now + timedelta(hours=sla_hours),
    }
    await tickets_collection.insert_one(doc)
    return ticket_id


async def list_tickets(status: str = None) -> list[dict]:
    query = {"status": status} if status else {}
    cursor = tickets_collection.find(query).sort("created_at", -1)
    return [doc async for doc in cursor]

async def update_ticket_status(ticket_id: str, status: str) -> bool:
    result = await tickets_collection.update_one(
        {"ticket_id": ticket_id},
        {"$set": {"status": status}},
    )
    return result.modified_count > 0

async def log_action(action: str, details: str, actor: str = "admin"):
    await audit_log_collection.insert_one({
        "action": action,
        "details": details,
        "actor": actor,
        "timestamp": datetime.now(timezone.utc),
    })