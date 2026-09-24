"""
Chat API - Module 2 (Chat Interface backend) + orchestration entrypoint.
"""

import os
import time as time_module
import time
import json
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from models.schemas import ChatRequest, ChatResponse, ConversationHistory, MessageOut, SourceChunk
from agents.router import route_query, _AGENT_MAP
from agents.intent_detector import detect_intent
from agents.llm_client import chat_completion_stream, chat_completion, analyze_image
from database.memory import (
    save_message, get_history, get_history_text, get_user_sessions,
    delete_session, toggle_pin, update_session_tag,
)
from database.tickets import create_ticket, tickets_collection
from api.auth import get_current_user
from collections import defaultdict
from agents.sentiment import analyze_sentiment, should_escalate
from database.db import kb_gaps_collection, ab_test_results_collection

router = APIRouter(prefix="/chat", tags=["Chat"])
_last_request_time: dict[str, float] = defaultdict(float)
_MIN_INTERVAL_SECONDS = 1.5

UPLOAD_DIR = "uploads"


class TagUpdate(BaseModel):
    tag: str


@router.post("", response_model=ChatResponse)
async def chat(payload: ChatRequest, current_user: dict = Depends(get_current_user)):
    start = time.time()

    history_text = await get_history_text(payload.session_id)
    await save_message(payload.session_id, "user", payload.message, user_id=current_user["_id"])

    result = route_query(payload.message, history_text)

    ticket_id = None
    if result["escalated"]:
        ticket_id = await create_ticket(
            session_id=payload.session_id,
            subject=f"Escalated: {', '.join(result['agents_invoked'])}",
            description=payload.message,
            priority="high",
        )

    elapsed_ms = (time.time() - start) * 1000

    await save_message(
        payload.session_id, "assistant", result["reply"],
        agent=",".join(result["agents_invoked"]), user_id=current_user["_id"],
        response_time_ms=elapsed_ms, ticket_id=ticket_id,
    )

    return ChatResponse(
        session_id=payload.session_id,
        reply=result["reply"],
        agents_invoked=result["agents_invoked"],
        sentiment=result["sentiment"],
        escalated=result["escalated"],
        ticket_id=ticket_id,
        sources=[SourceChunk(**s) for s in result["sources"]],
    )


@router.post("/stream")
async def chat_stream(payload: ChatRequest, current_user: dict = Depends(get_current_user)):
    """Word-by-word streamed reply from a single primary agent (simplified, no multi-agent aggregation)."""
    user_id = current_user["_id"]
    now = time_module.time()
    if now - _last_request_time[user_id] < _MIN_INTERVAL_SECONDS:
        raise HTTPException(status_code=429, detail="Too many requests — please slow down")
    _last_request_time[user_id] = now

    start_time = time_module.time()

    history_text = await get_history_text(payload.session_id)
    await save_message(payload.session_id, "user", payload.message, user_id=current_user["_id"])

    intents = detect_intent(payload.message)
    agent = _AGENT_MAP.get(intents[0], _AGENT_MAP["general_faq"])
    context, sources = agent.build_context(payload.message)

    prompt_parts = []
    if history_text:
        prompt_parts.append(f"Conversation so far:\n{history_text}")
    if context:
        prompt_parts.append(f"Relevant company documents:\n{context}")

    past_user_msgs = [m for m in history_text.split("\n") if m.startswith("user:")]
    is_repeat = any(payload.message.strip().lower() in m.lower() for m in past_user_msgs)
    if is_repeat:
        prompt_parts.append("Note: The customer appears to be asking this again — acknowledge that and check if their previous answer didn't help, or if they need something different this time.")

    prompt_parts.append(f"Customer question:\n{payload.message}")
    user_prompt = "\n\n".join(prompt_parts)

    async def event_generator():
        full_reply = ""
        yield f"data: {json.dumps({'type': 'meta', 'agents_invoked': [agent.name]})}\n\n"
        ab_variant = getattr(agent, "variant", None)
        sentiment = analyze_sentiment(payload.message)
        yield f"data: {json.dumps({'type': 'sentiment', 'level': sentiment})}\n\n"
        yield f"data: {json.dumps({'type': 'sources', 'items': sources})}\n\n"

        for chunk in chat_completion_stream(agent.system_prompt, user_prompt):
            full_reply += chunk
            yield f"data: {json.dumps({'type': 'chunk', 'text': chunk})}\n\n"

        sentiment_for_ticket = analyze_sentiment(payload.message)
        should_esc = should_escalate(sentiment_for_ticket, intents)
        ticket_id = None
        if should_esc:
            ticket_id = await create_ticket(
                session_id=payload.session_id,
                subject=f"Escalated: {agent.name}",
                description=payload.message,
                priority="high",
            )
            yield f"data: {json.dumps({'type': 'escalated', 'ticket_id': ticket_id})}\n\n"

        response_time_ms = (time_module.time() - start_time) * 1000
        await save_message(
            payload.session_id, "assistant", full_reply,
            agent=agent.name, user_id=current_user["_id"], response_time_ms=response_time_ms,
            ticket_id=ticket_id,
        )


        if ab_variant:
                await ab_test_results_collection.insert_one({
        "session_id": payload.session_id,
        "variant": ab_variant,
        "reaction": None,
        "timestamp": time_module.time(),
       })

        suggestion_prompt = f"""Based on this support reply, suggest exactly 3 short natural follow-up questions
the customer might ask next. Each under 8 words. Respond ONLY as a JSON array of strings, nothing else.
Assistant's reply: {full_reply[:300]}"""

        try:
            raw = chat_completion(suggestion_prompt, "Generate the suggestions now.", temperature=0.5)
            cleaned = raw.replace("```json", "").replace("```", "").strip()
            suggestions = json.loads(cleaned)[:3]
        except Exception:
            suggestions = []

        confidence_prompt = f"""Rate how confident you are in the accuracy of this support reply, based on whether
it was grounded in retrieved company documents versus general knowledge. Respond with ONLY one word:
"high", "medium", or "low".
Reply: {full_reply[:300]}
Had document context: {"yes" if context else "no"}"""

        try:
            confidence_raw = chat_completion(confidence_prompt, "Rate now.", temperature=0.0)
            confidence = confidence_raw.strip().lower().split()[0]
            if confidence not in ("high", "medium", "low"):
                confidence = "medium"
        except Exception:
            confidence = "medium"

        # Only check for KB gaps on substantive questions — skip casual/short messages
        msg_lower = payload.message.strip().lower()
        casual_phrases = {"ok", "okay", "thanks", "thank you", "ok thank you", "ok thanks", "yes", "no", "hi", "hello", "hey", "bye", "goodbye", "great", "good", "cool", "nice", "alright", "sure"}
        is_casual = msg_lower in casual_phrases or len(msg_lower) < 8

        is_gap = False
        if not is_casual:
            gap_check_prompt = f"""Was this customer question answerable using the company's actual documents/policies,
or did the assistant have to give a generic answer, say "we don't have that", or admit uncertainty?
Only classify as "gap" if the customer asked a genuine, specific question that needed a factual answer.
Casual remarks, thanks, greetings, or vague follow-ups are NEVER a gap.
Respond with ONLY one word: "covered" or "gap".
Question: {payload.message}
Reply given: {full_reply[:400]}"""

            try:
                gap_check = chat_completion(gap_check_prompt, "Answer now.", temperature=0.0)
                is_gap = "gap" in gap_check.strip().lower()
            except Exception:
                is_gap = False

        if is_gap:
            await kb_gaps_collection.insert_one({
                "query": payload.message,
                "agent": agent.name,
                "had_context": bool(context),
                "confidence": confidence,
                "timestamp": time_module.time(),
            })

        yield f"data: {json.dumps({'type': 'confidence', 'level': confidence})}\n\n"
        yield f"data: {json.dumps({'type': 'suggestions', 'items': suggestions})}\n\n"
        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.post("/upload")
async def upload_file(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(file.filename)[1]
    safe_name = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(UPLOAD_DIR, safe_name)

    with open(path, "wb") as f:
        f.write(await file.read())

    image_description = None
    if ext.lower() in [".png", ".jpg", ".jpeg", ".webp"]:
        image_description = analyze_image(
            path,
            "Briefly describe this image in one or two sentences, focusing on anything relevant to a customer support issue (error messages, product, damage, etc)."
        )

    return {
        "filename": file.filename,
        "url": f"/uploads/{safe_name}",
        "description": image_description,
    }


@router.get("/history/{session_id}", response_model=ConversationHistory)
async def history(session_id: str, current_user: dict = Depends(get_current_user)):
    docs = await get_history(session_id, limit=100)
    messages = [
        MessageOut(
            role=d["role"], content=d["content"], timestamp=d["timestamp"],
            agent=d.get("agent"), ticket_id=d.get("ticket_id"),
        )
        for d in docs
    ]
    return ConversationHistory(session_id=session_id, messages=messages)


@router.get("/sessions")
async def sessions(current_user: dict = Depends(get_current_user)):
    return await get_user_sessions(current_user["_id"])


@router.delete("/sessions/{session_id}")
async def remove_session(session_id: str, current_user: dict = Depends(get_current_user)):
    deleted = await delete_session(session_id, current_user["_id"])
    if not deleted:
        return {"status": "not_found"}
    return {"status": "deleted"}


@router.get("/ticket/{ticket_id}")
async def get_ticket_status(ticket_id: str, current_user: dict = Depends(get_current_user)):
    ticket = await tickets_collection.find_one({"ticket_id": ticket_id})
    if not ticket:
        return {"found": False}
    return {
        "found": True,
        "ticket_id": ticket["ticket_id"],
        "subject": ticket["subject"],
        "status": ticket["status"],
        "priority": ticket["priority"],
        "created_at": ticket["created_at"].isoformat(),
    }


@router.post("/sessions/{session_id}/pin")
async def pin_session(session_id: str, current_user: dict = Depends(get_current_user)):
    new_state = await toggle_pin(session_id, current_user["_id"])
    return {"pinned": new_state}


@router.post("/sessions/{session_id}/tag")
async def set_session_tag(session_id: str, payload: TagUpdate, current_user: dict = Depends(get_current_user)):
    updated = await update_session_tag(session_id, current_user["_id"], payload.tag)
    return {"status": "updated" if updated else "not_found"}


@router.get("/sessions/{session_id}/summary")
async def summarize_session(session_id: str, current_user: dict = Depends(get_current_user)):
    docs = await get_history(session_id, limit=50)
    if not docs:
        return {"summary": "No conversation to summarize yet."}

    conversation_text = "\n".join([f"{d['role']}: {d['content']}" for d in docs])

    summary_prompt = """Summarize this customer support conversation in 2-3 short sentences.
Focus on: what the customer needed, what was resolved or is pending, and any ticket/escalation status.
Be concise and factual."""

    summary = chat_completion(summary_prompt, conversation_text[:3000], temperature=0.3)
    return {"summary": summary}