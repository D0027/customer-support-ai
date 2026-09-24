# Multi-Agent AI Customer Support Assistant (RAG + LLMs)

An industry-style capstone project: a web-based customer support assistant that
routes customer queries to specialized AI agents (Billing, Technical, Product,
Complaint, FAQ), grounds every answer in a real company knowledge base using
Retrieval-Augmented Generation (RAG), and remembers conversation history per session.

Built for a fictional company: **TechMart Electronics**.

---

## Architecture

```
Customer → Web Chat (Next.js) → Backend API (FastAPI)
              │
     ┌────────┴─────────┐
     ▼                   ▼
Intent Detection   Conversation Memory (MongoDB)
     │
     ▼
 Agent Router  ── Sentiment Analysis (bonus: escalation trigger)
     │
 ┌───┼──────┬──────────┬───────────┐
 ▼   ▼      ▼          ▼           ▼
Billing  Technical  Product   Complaint   FAQ
     │
     ▼
RAG Retrieval → FAISS Vector DB → Company PDFs (knowledge_base/)
     │
     ▼
Response Aggregator → Final Answer (+ optional auto-ticket, human handoff)
```

## Features implemented (maps to the project spec)

| Module | Status |
|---|---|
| 1. User Authentication (register/login/JWT sessions) | ✅ |
| 2. Chat Interface (Next.js, history, typing indicator) | ✅ |
| 3. Intent Detection Agent | ✅ |
| 4. Agent Router (multi-agent invocation + aggregation) | ✅ |
| 5. Specialized Agents — Billing, Technical, Product, Complaint, FAQ | ✅ |
| 6. Knowledge Base (8 TechMart PDFs, auto-generated) | ✅ |
| 7. RAG pipeline (chunk → embed → FAISS → retrieve) | ✅ |
| 8. Conversation Memory (MongoDB) | ✅ |
| 9. Analytics Dashboard (agent usage, satisfaction) | ✅ |

**Bonus enhancements included:**
- Sentiment analysis for routing frustrated customers
- Automatic ticket creation on escalation
- Human-agent handoff signal in chat responses
- Admin dashboard (`/admin` page) with live analytics + ticket list
- Admin API to upload new KB docs and rebuild the vector index at runtime
- Customer satisfaction feedback (1–5 rating after each reply)
- Multilingual field on chat requests (`language`) ready for translation middleware
- Sample public dataset guide for tuning intent detection further

Not included out of the box (left as extension points, noted in code/comments):
voice input, WhatsApp/email channel integration, AI-generated conversation
summaries — these need external provider accounts (Twilio, etc.) so they're
documented but not wired to a specific paid API key.

---

## Project structure

```
customer-support-ai/
├── frontend/                Next.js + Tailwind chat UI
│   ├── components/          MessageBubble, ChatInput, TypingIndicator, MetaPanel
│   ├── pages/                index (chat), login, register, admin
│   ├── hooks/useChat.js
│   └── services/api.js
│
├── backend/                 FastAPI app
│   ├── api/                 auth.py, chat.py, analytics.py, admin.py, security.py
│   ├── agents/               billing, technical, product, complaint, faq,
│   │                         intent_detector, sentiment, router, llm_client
│   ├── rag/ingest.py         PDF loading + chunking
│   ├── embeddings/embedder.py
│   ├── vectorstore/store.py  FAISS build/load/retrieve
│   ├── database/             db.py, memory.py, tickets.py
│   ├── models/schemas.py
│   ├── main.py
│   └── requirements.txt
│
├── knowledge_base/          8 TechMart Electronics PDFs (FAQ, Refund, Shipping,
│                             Warranty, Pricing, Products, Installation, Manual)
├── datasets/                Public dataset guide (Banking77, SQuAD, MS MARCO, etc.)
├── docker-compose.yml        Local dev: backend + MongoDB
└── README.md
```

---

## Setup — Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env: add your free Groq API key from https://console.groq.com

# Start MongoDB locally, or use docker-compose (see below)

# Build the RAG index from knowledge_base/ (run once, and again after adding docs)
python -m vectorstore.store

# Start the API
uvicorn main:app --reload --port 8000
```

API docs (Swagger UI): **http://localhost:8000/docs**

## Setup — Frontend

```bash
cd frontend
npm install
npm run dev
```

Chat UI: **http://localhost:3000**
Admin dashboard: **http://localhost:3000/admin**

## Run everything with Docker

```bash
docker-compose up --build
```

This starts MongoDB + the backend API together. Run the frontend separately
with `npm run dev` (or containerize it too — see `frontend/vercel.json` for
the recommended Vercel deployment instead).

---

## Deployment

| Layer | Recommended host | Config file included |
|---|---|---|
| Frontend | Vercel | `frontend/vercel.json` |
| Backend | Railway or Render | `backend/Dockerfile`, `backend/railway.json` |
| Database | MongoDB Atlas | set `MONGO_URI` in backend `.env` |

Steps:
1. Push this repo to GitHub.
2. Deploy `frontend/` to Vercel, set env var `NEXT_PUBLIC_API_URL` to your backend's public URL.
3. Deploy `backend/` to Railway/Render as a Docker service, set env vars from `.env.example`.
4. Create a free MongoDB Atlas cluster, put its connection string in `MONGO_URI`.
5. After first deploy, call `POST /admin/knowledge-base/rebuild-index` once to build the FAISS index on the server (or bake it into the Docker image before deploying).

---

## Testing checklist (Module: Testing & Evaluation)

- [ ] Register + login a test user
- [ ] Send a billing-only query → confirm only Billing agent invoked
- [ ] Send a mixed query ("I paid but Premium is locked") → confirm Billing + Technical both invoked
- [ ] Send an angry/complaint message → confirm `escalated: true` and a ticket is created
- [ ] Ask a FAQ question covered in `knowledge_base/FAQ.pdf` → confirm the answer cites real policy details
- [ ] Reload the page → confirm conversation history persists (same session_id)
- [ ] Rate a response → confirm it shows up in `/admin` analytics
- [ ] Upload a new PDF via `/admin/knowledge-base/upload` → rebuild index → ask a question about it

---

## Evaluation criteria mapping (100 marks, per spec)

| Component | Marks | Where in this repo |
|---|---|---|
| Frontend Design | 10 | `frontend/` — Tailwind design system, chat UI |
| Backend APIs | 15 | `backend/api/` |
| Multi-Agent Architecture | 20 | `backend/agents/router.py` + 5 agent files |
| RAG Implementation | 20 | `backend/rag/`, `backend/embeddings/`, `backend/vectorstore/` |
| LLM Integration | 15 | `backend/agents/llm_client.py` (Groq/Llama 3) |
| Database Design | 10 | `backend/database/` (MongoDB collections) |
| Documentation & Deployment | 10 | this README, Dockerfile, railway.json, vercel.json |

---

## Tech stack

**Frontend:** Next.js, React, Tailwind CSS, Axios
**Backend:** FastAPI, LangChain, Groq (Llama 3.3 70B)
**Embeddings:** sentence-transformers/all-MiniLM-L6-v2
**Vector DB:** FAISS
**Database:** MongoDB
**Deployment:** Vercel (frontend), Railway/Render (backend), MongoDB Atlas (DB)
