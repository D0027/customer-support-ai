<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0ea5e9,50:14b8a6,100:8b5cf6&height=180&section=header&text=Your%20Text%20Here&fontSize=42&fontColor=ffffff&fontAlignY=40&animation=fadeIn&desc=Your%20small%20tagline%20here&descAlignY=62&descSize=16" width="100%" />

<a href="https://git.io/typing-svg">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&pause=1000&color=14B8A6&center=true&vCenter=true&width=750&lines=Smarter+Agents+%E2%86%92+Better+Answers+%E2%86%92+Real+Support+%E2%9C%A8;Intent+detection+that+routes+like+magic+%F0%9F%A7%AD;5+specialized+agents+working+together+%F0%9F%A4%96;Every+answer+verified+and+source-cited+%F0%9F%9B%A1%EF%B8%8F" alt="Typing SVG" />
</a>

<br/><br/>

<img src="Customer support AI.png" alt="Customer Support AI - Multi-Agent, RAG, Source-Cited Answers" width="100%" />

<br/><br/>

![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![LangGraph](https://img.shields.io/badge/LangGraph-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-F55036?style=for-the-badge&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

![Stars](https://img.shields.io/github/stars/D0027/YOUR_REPO?style=social)
![Forks](https://img.shields.io/github/forks/D0027/YOUR_REPO?style=social)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
![Status](https://img.shields.io/badge/status-production--ready-success?style=flat-square)

**An intelligent multi-agent customer support platform that understands intent, routes to the right specialist, searches your knowledge base, and answers with sources.**

[📖 API Docs](http://localhost:8000/docs) · [🐛 Report Bug](https://github.com/D0027/YOUR_REPO/issues) · [✨ Request Feature](https://github.com/D0027/YOUR_REPO/issues)

</div>

---

## 📑 Table of Contents

- [✨ Highlights](#-highlights)
- [🏗️ Architecture](#️-architecture)
- [🤖 Meet the Agents](#-meet-the-agents)
- [🧰 Tech Stack](#-tech-stack)
- [🚀 Quick Start](#-quick-start)
- [🌐 Deployment](#-deployment)
- [📊 Module Coverage](#-module-coverage)
- [🔑 Environment Variables](#-environment-variables)
- [👨‍💻 Author](#-author)

---

## ✨ Highlights

<table>
<tr>
<td width="50%">

### 🎯 Smart Routing
Intent detection sends every message to the best of **5 specialized agents**.

### 📚 RAG Pipeline
FAISS-powered search over your own knowledge base. Rebuild the index anytime from the admin panel.

### 🌐 Web Search Fallback
When the docs aren't enough, the web agent steps in.

</td>
<td width="50%">

### 🛡️ Verified Answers
A verifier step checks every draft against the retrieved evidence.

### 🔗 Source Citations
Answers come with file names and page numbers, so users see exactly where info came from.

### 💬 Conversation Memory
Context-aware replies that remember the whole conversation.

</td>
</tr>
<tr>
<td colspan="2" align="center">

### 📈 Analytics Dashboard · 🔐 JWT Auth · 🛠️ Admin Panel · **+ 45 bonus features**

</td>
</tr>
</table>

---

## 🏗️ Architecture

```mermaid
flowchart TD
    Q([👤 User Query]) --> I{🧠 Intent Detection + Router}
    I --> R[📄 Retriever Agent<br/>Search Docs - RAG]
    I --> S[🗃️ SQL Agent<br/>Database Queries]
    I --> W[🌐 Web Agent<br/>Live Web Search]
    I --> P[🎯 Specialist Agent<br/>Product / Billing / Technical]
    I --> G[💬 Support Agent<br/>General Queries]
    R --> V{🛡️ Verifier<br/>Checks Accuracy}
    S --> V
    W --> V
    P --> V
    G --> V
    V --> Y[✨ Synthesizer<br/>Final Answer + Sources]
    Y --> A([✅ Answer + Sources])
    R -.-> K[(📚 Vector Store - FAISS)]
    Y -.-> M[(🍃 MongoDB Atlas)]
```

---

## 🤖 Meet the Agents

| Agent | Handles | Powered by |
|---|---|---|
| 📄 **Retriever Agent** | Search your docs (RAG) | FAISS vector store |
| 🗃️ **SQL Agent** | Database queries | MongoDB Atlas |
| 🌐 **Web Agent** | Live web search | Web search fallback |
| 🎯 **Specialist Agent** | Product, billing and technical questions | Groq LLM |
| 💬 **Support Agent** | General queries | Groq LLM |

After the agents finish, the **🛡️ Verifier** checks accuracy and the **✨ Synthesizer** writes the final answer with sources.

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| 🎨 Frontend | Next.js · React |
| ⚙️ Backend | FastAPI · Python |
| 🕸️ Orchestration | LangGraph |
| 🧠 LLM | Groq (`gpt-oss-120b`, vision model) |
| 🔎 Retrieval | FAISS vector store |
| 🗄️ Database | MongoDB Atlas |
| 📧 Email | SMTP (Gmail) |
| 🐳 DevOps | Docker · Vercel · Railway / Render |

---

## 🚀 Quick Start

<details open>
<summary><b>⚙️ Backend</b></summary>

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python -m vectorstore.store
uvicorn main:app --reload --port 8000
```
📄 API docs: `http://localhost:8000/docs`

</details>

<details open>
<summary><b>🎨 Frontend</b></summary>

```bash
cd frontend
npm install
npm run dev
```
🌍 App: `http://localhost:3000` · 🛠️ Admin: `http://localhost:3000/admin`

</details>

<details>
<summary><b>🐳 Or with Docker</b></summary>

```bash
docker-compose up --build
```

</details>

---

## 🌐 Deployment

| Layer | Host | Config |
|---|---|---|
| 🎨 Frontend | ![Vercel](https://img.shields.io/badge/Vercel-000?logo=vercel&logoColor=white) | `frontend/vercel.json` |
| ⚙️ Backend | ![Railway](https://img.shields.io/badge/Railway%20/%20Render-0B0D0E?logo=railway&logoColor=white) | `backend/Dockerfile` |
| 🗄️ Database | ![MongoDB](https://img.shields.io/badge/MongoDB%20Atlas-47A248?logo=mongodb&logoColor=white) | `MONGO_URI` in `.env` |

1. ✅ Push to GitHub
2. 🎨 Deploy `frontend/` on Vercel and set `NEXT_PUBLIC_API_URL`
3. ⚙️ Deploy `backend/` on Railway/Render and set env vars
4. 🗄️ Connect MongoDB Atlas
5. 🔄 Call `POST /admin/knowledge-base/rebuild-index` once

---

## 📊 Module Coverage

| Module | Status |
|---|:---:|
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

> ⚠️ Never commit your real `.env` file. Keep secrets out of Git!

---

## 👨‍💻 Author

<div align="center">

**Deepak Yadav**

[![GitHub](https://img.shields.io/badge/GitHub-D0027-181717?style=for-the-badge&logo=github)](https://github.com/D0027)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-deepakyadav027-0A66C2?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/deepakyadav027)
[![Portfolio](https://img.shields.io/badge/Portfolio-d0027.github.io-14B8A6?style=for-the-badge&logo=googlechrome&logoColor=white)](https://d0027.github.io)

⭐ **If you like this project, drop a star, it really helps!** ⭐

**Built with FastAPI · Next.js · LangGraph · Groq · FAISS · MongoDB**

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:8b5cf6,50:14b8a6,100:0ea5e9&height=120&section=footer" width="100%" />

</div>
