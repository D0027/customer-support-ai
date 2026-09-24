"""
Bonus Enhancement: Admin dashboard endpoints -
upload new knowledge base docs, rebuild the vector index, view tickets.
"""

import os
import uuid as uuid_lib
from fastapi import APIRouter, UploadFile, File, Depends

from config import settings
from vectorstore.store import build_and_save_index
from database.tickets import list_tickets, update_ticket_status, log_action
from models.schemas import TicketOut, CannedResponseIn
from pydantic import BaseModel
from database.db import canned_responses_collection, audit_log_collection, kb_gaps_collection, users_collection, messages_collection, feedback_collection, admin_presence_collection, ab_test_results_collection
from datetime import datetime, timezone, timedelta
from api.auth import get_current_user


router = APIRouter(prefix="/admin", tags=["Admin"])


@router.post("/knowledge-base/upload")
async def upload_kb_document(file: UploadFile = File(...)):
    os.makedirs(settings.KNOWLEDGE_BASE_DIR, exist_ok=True)
    dest_path = os.path.join(settings.KNOWLEDGE_BASE_DIR, file.filename)
    with open(dest_path, "wb") as f:
        f.write(await file.read())
    return {"status": "uploaded", "filename": file.filename}


@router.post("/knowledge-base/rebuild-index")
async def rebuild_index():
    chunk_count = build_and_save_index()
    return {"status": "rebuilt", "chunks_indexed": chunk_count}


@router.get("/tickets")
async def get_tickets(status: str = None):
    docs = await list_tickets(status)
    return [
        {
            "ticket_id": d["ticket_id"],
            "session_id": d["session_id"],
            "subject": d["subject"],
            "description": d["description"],
            "status": d["status"],
            "priority": d["priority"],
            "created_at": d["created_at"].isoformat(),
            "sla_deadline": d.get("sla_deadline").isoformat() if d.get("sla_deadline") else None,
        }
        for d in docs
    ]

class TicketStatusUpdate(BaseModel):
    status: str  # "open" | "in_progress" | "resolved"

@router.patch("/tickets/{ticket_id}/status")
async def change_ticket_status(ticket_id: str, payload: TicketStatusUpdate):
    valid_statuses = {"open", "in_progress", "resolved"}
    if payload.status not in valid_statuses:
        return {"status": "invalid_status"}
    updated = await update_ticket_status(ticket_id, payload.status)
    if updated:
        await log_action("ticket_status_change", f"Ticket #{ticket_id} → {payload.status}")
    return {"status": "updated" if updated else "not_found"}


@router.delete("/canned-responses/{response_id}")
async def delete_canned_response(response_id: str):
    await canned_responses_collection.delete_one({"_id": response_id})
    await log_action("canned_response_deleted", f"id={response_id}")
    return {"status": "deleted"}


@router.get("/canned-responses")
async def list_canned_responses():
    docs = canned_responses_collection.find({})
    return [{"id": d["_id"], "title": d["title"], "content": d["content"]} async for d in docs]



@router.get("/audit-log")
async def get_audit_log():
    cursor = audit_log_collection.find({}).sort("timestamp", -1).limit(30)
    return [
        {
            "action": d["action"],
            "details": d["details"],
            "actor": d["actor"],
            "timestamp": d["timestamp"].isoformat(),
        }
        async for d in cursor
    ]


@router.get("/kb-gaps")
async def get_kb_gaps():
    cursor = kb_gaps_collection.find({}).sort("timestamp", -1).limit(20)
    return [
        {"query": d["query"], "agent": d["agent"], "confidence": d["confidence"], "had_context": d["had_context"]}
        async for d in cursor
    ]

@router.get("/customer-health")
async def get_customer_health():
    users_cursor = users_collection.find({})
    results = []

    async for user in users_cursor:
        user_id = user["_id"]

        # Count negative/angry messages from this user
        angry_count = await messages_collection.count_documents({
            "user_id": user_id, "role": "user"
        })
        total_msgs = await messages_collection.count_documents({"user_id": user_id})


        # Get their feedback ratings
        user_sessions = await messages_collection.distinct("session_id", {"user_id": user_id})
        ratings = [
            f["rating"] async for f in feedback_collection.find({"session_id": {"$in": user_sessions}})
        ]
        avg_rating = sum(ratings) / len(ratings) if ratings else None

        # Simple health score: starts at 100, docked for low ratings
        score = 100
        if avg_rating is not None:
            score = int((avg_rating / 5) * 100)

        risk = "low" if score >= 70 else "medium" if score >= 40 else "high"

        results.append({
            "name": user.get("name", "Unknown"),
            "email": user.get("email", ""),
            "total_messages": total_msgs,
            "avg_rating": round(avg_rating, 1) if avg_rating else None,
            "score": score,
            "risk": risk,
        })

    results.sort(key=lambda x: x["score"])
    return results[:20]

@router.post("/presence/ping")
async def ping_presence(current_user: dict = Depends(get_current_user)):
    await admin_presence_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": {
            "name": current_user.get("name", "Unknown"),
            "last_seen": datetime.now(timezone.utc),
        }},
        upsert=True,
    )
    return {"status": "ok"}


@router.get("/presence/online")
async def get_online_admins():
    cutoff = datetime.now(timezone.utc) - timedelta(seconds=30)
    cursor = admin_presence_collection.find({"last_seen": {"$gte": cutoff}})
    return [{"name": d["name"], "last_seen": d["last_seen"].isoformat()} async for d in cursor]


@router.get("/ab-test-results")
async def get_ab_test_results():
    results = {"A": {"total": 0, "up": 0, "down": 0}, "B": {"total": 0, "up": 0, "down": 0}}
    cursor = ab_test_results_collection.find({})
    async for d in cursor:
        v = d.get("variant")
        if v not in results:
            continue
        results[v]["total"] += 1
        if d.get("reaction") == "up":
            results[v]["up"] += 1
        elif d.get("reaction") == "down":
            results[v]["down"] += 1
    return results