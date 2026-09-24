<div align="center">

<img src="docs/banner.png" alt="TechMart Support Banner" width="100%" />

# TechMart Support — Multi-Agent AI Customer Support Assistant

**Ask anything → Get accurate answers.** A production-grade AI support system with intent-aware multi-agent routing, RAG-grounded answers, and a fully-featured admin console — built for TechMart Electronics.

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js-000000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Groq](https://img.shields.io/badge/LLM-Groq-F55036?style=flat-square)](https://groq.com/)
[![FAISS](https://img.shields.io/badge/Vector%20DB-FAISS-4B8BBE?style=flat-square)](https://github.com/facebookresearch/faiss)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)]()

</div>

---

## What this is

A customer support assistant that doesn't just chat — it **understands intent**, **routes to the right specialist agent(s)**, **retrieves answers from real company documents (RAG)**, and **escalates unhappy customers automatically**. Built as an industry-style capstone, then pushed well past spec with 45+ production-grade features.

## Architecture
Customer
↓
Web Chat (Next.js)
↓
Backend API (FastAPI)
↓
Intent Detection + Memory
↓
Agent Router (+ Sentiment)
↓
Billing / Technical / Product
Complaint / FAQ
↓
RAG → FAISS → Company PDFs
↓
Streamed Answer + Sources


---

## ✨ Highlights

<table>
<tr>
<td width="33%" valign="top">

### 🧠 Intelligence
- Multi-agent routing (5 specialists)
- RAG over real company PDFs
- Sentiment-based auto-escalation
- Duplicate-query detection
- AI-generated conversation summaries
- Confidence scoring per reply
- A/B testing on agent prompts

</td>
<td width="33%" valign="top">

### 💬 Chat Experience
- Real-time streaming responses
- Voice input & voice output
- Image upload with AI vision analysis
- Drag-and-drop file upload
- Markdown-rendered replies
- Quick-reply suggestions
- Message reactions & regenerate

</td>
<td width="33%" valign="top">

### 🛠️ Operations
- Full admin analytics dashboard
- SLA timers per ticket
- Audit log & knowledge-gap detector
- Customer health / churn score
- Real-time admin presence
- Canned response library
- Rate limiting & session timeout

</td>
</tr>
</table>

---

## 🖥️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js, React, Tailwind CSS, Framer Motion |
| **Backend** | FastAPI, Python 3.11 |
| **LLM** | Groq (Llama 3 / GPT-OSS) |
| **RAG** | LangChain, FAISS, sentence-transformers |
| **Database** | MongoDB (Atlas) |
| **Auth** | JWT, bcrypt |
| **Email** | SMTP (Gmail) for password reset |
| **Deployment** | Vercel (frontend), Railway/Render (backend) |

---

## 📁 Project Structure
customer-support-ai/
├── frontend/ Next.js app
│ ├── components/ UI components
│ ├── pages/ chat, login,
│ │ admin, welcome
│ ├── hooks/ useChat etc.
│ ├── context/ providers
│ └── services/api.js
│
├── backend/ FastAPI app
│ ├── api/ routes
│ ├── agents/ 5 agents
│ ├── rag/ ingestion
│ ├── embeddings/
│ ├── vectorstore/ FAISS
│ ├── database/ Mongo
│ └── models/schemas.py
│
├── knowledge_base/ 8 policy PDFs
├── datasets/ eval refs
└── docker-compose.yml


---

## 🚀 Quick Start

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python -m vectorstore.store
uvicorn main:app --reload --port 8000
```
API docs: `http://localhost:8000/docs`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
App: `http://localhost:3000` · Admin: `http://localhost:3000/admin`

### Or with Docker
```bash
docker-compose up --build
```

---

## 🌐 Deployment

| Layer | Host | Config |
|---|---|---|
| Frontend | Vercel | `frontend/vercel.json` |
| Backend | Railway / Render | `backend/Dockerfile` |
| Database | MongoDB Atlas | `MONGO_URI` in `.env` |

1. Push to GitHub (done ✅)
2. Deploy `frontend/` on Vercel — set `NEXT_PUBLIC_API_URL`
3. Deploy `backend/` on Railway/Render — set env vars
4. Connect MongoDB Atlas
5. Call `POST /admin/knowledge-base/rebuild-index` once

---

## 📊 Module Coverage

| Module | Status |
|---|---|
| Authentication (JWT) | ✅ |
| Chat Interface | ✅ |
| Intent Detection | ✅ |
| Multi-Agent Router | ✅ |
| 5 Specialized Agents | ✅ |
| Knowledge Base (RAG) | ✅ |
| Conversation Memory | ✅ |
| Analytics Dashboard | ✅ |
| **+ 45 bonus features** | ✅ |

---

## 🔑 Environment Variables

```env
GROQ_API_KEY=your_groq_key
GROQ_MODEL=openai/gpt-oss-120b
GROQ_VISION_MODEL=qwen/qwen3.6-27b

MONGO_URI=your_mongodb_atlas_uri
MONGO_DB_NAME=customer_support_ai

SMTP_EMAIL=your_gmail_address
SMTP_APP_PASSWORD=your_gmail_app_password

SECRET_KEY=your_jwt_secret
```

---

<div align="center">

**Built with FastAPI · Next.js · Groq · FAISS · MongoDB**

</div>
