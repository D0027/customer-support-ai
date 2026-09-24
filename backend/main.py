"""
Multi-Agent AI Customer Support Assistant - Backend Entrypoint.

Run locally:
    uvicorn main:app --reload --port 8000

Docs available at http://localhost:8000/docs
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import settings
from database.db import ping_db
from api import auth, chat, analytics, admin

app = FastAPI(
    title=settings.APP_NAME,
    description="A multi-agent, RAG-powered customer support assistant.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(analytics.router)
app.include_router(admin.router)


@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    db_ok = await ping_db()
    return {"status": "ok" if db_ok else "degraded", "database_connected": db_ok}