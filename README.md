<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:6366f1,50:8b5cf6,100:06b6d4&height=220&section=header&text=Customer%20Support%20AI&fontSize=52&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Multi-Agent%20%E2%80%A2%20RAG%20%E2%80%A2%20Real-Time%20Support&descAlignY=58&descSize=18" width="100%" />

<a href="https://git.io/typing-svg">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&pause=1000&color=8B5CF6&center=true&vCenter=true&width=700&lines=Intent+detection+that+routes+like+magic+%E2%9C%A8;5+specialized+AI+agents+working+together+%F0%9F%A4%96;RAG+knowledge+base+powered+by+FAISS+%F0%9F%93%9A;Blazing+fast+inference+with+Groq+%E2%9A%A1" alt="Typing SVG" />
</a>

<br/>

![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-F55036?style=for-the-badge&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

![Stars](https://img.shields.io/github/stars/D0027/YOUR_REPO?style=social)
![Forks](https://img.shields.io/github/forks/D0027/YOUR_REPO?style=social)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
![Status](https://img.shields.io/badge/status-production--ready-success?style=flat-square)

**An intelligent, multi-agent customer support platform that understands intent, routes to the right specialist, and answers from your own knowledge base.**

[🚀 Live Demo](YOUR_DEMO_URL) · [📖 API Docs](YOUR_API_URL/docs) · [🐛 Report Bug](https://github.com/D0027/YOUR_REPO/issues) · [✨ Request Feature](https://github.com/D0027/YOUR_REPO/issues)

</div>

---

## 📑 Table of Contents

- [✨ Highlights](#-highlights)
- [🏗️ Architecture](#️-architecture)
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

### 🧠 Smart Routing
Intent detection classifies every message and hands it to the best of **5 specialized agents**.

### 📚 RAG Knowledge Base
FAISS-powered retrieval grounds answers in your docs. Rebuild the index anytime from the admin panel.

</td>
<td width="50%">

### 💬 Conversation Memory
Context-aware replies that remember the whole conversation.

### 📈 Analytics Dashboard
Track conversations, intents, and agent performance in real time.

</td>
</tr>
<tr>
<td colspan="2" align="center">

### 🔐 Secure by Default
JWT authentication · role-based admin panel · **+ 45 bonus features**

</td>
</tr>
</table>

---

## 🏗️ Architecture

```mermaid
flowchart LR
    U([👤 User]) --> F[⚛️ Next.js Frontend]
    F -->|REST + JWT| B[⚡ FastAPI Backend]
    B --> I{🎯 Intent Detection}
    I --> R[🧭 Multi-Agent Router]
    R --> A1[🤖 Agent 1]
    R --> A2[🤖 Agent 2]
    R --> A3[🤖 Agent 3]
    R --> A4[🤖 Agent 4]
    R --> A5[🤖 Agent 5]
    A1 & A2 & A3 & A4 & A5 --> K[(📚 FAISS Knowledge Base)]
    A1 & A2 & A3 & A4 & A5 --> L[🚀 Groq LLM]
    B <--> M[(🍃 MongoDB Atlas)]
```

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| 🎨 Frontend | Next.js · React |
| ⚙️ Backend | FastAPI · Python |
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
[![Portfolio](https://img.shields.io/badge/Portfolio-d0027.github.io-8B5CF6?style=for-the-badge&logo=googlechrome&logoColor=white)](https://d0027.github.io)

⭐ **If you like this project, drop a star, it really helps!** ⭐

</div>

<div align="center">

**Built with FastAPI · Next.js · Groq · FAISS · MongoDB**

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:06b6d4,50:8b5cf6,100:6366f1&height=120&section=footer" width="100%" />

</div>
