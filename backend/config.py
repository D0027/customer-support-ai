"""
Central configuration for the Multi-Agent AI Customer Support Assistant.
All values are loaded from environment variables (.env file).
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # --- App ---
    APP_NAME: str = "Multi-Agent AI Customer Support Assistant"
    ENV: str = "development"
    DEBUG: bool = True

    # --- Security ---
    SECRET_KEY: str = "change-this-secret-key-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # --- Database ---
    MONGO_URI: str = "mongodb://localhost:27017"
    MONGO_DB_NAME: str = "customer_support_ai"

    SMTP_EMAIL: str = ""
    SMTP_APP_PASSWORD: str = ""

    # --- LLM Provider (Groq / Llama 3) ---
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "openai/gpt-oss-120b"
    GROQ_VISION_MODEL: str = "qwen/qwen3.6-27b"

    # Optional alternate providers (bonus flexibility, not required)
    OPENAI_API_KEY: str = ""
    GOOGLE_API_KEY: str = ""


    RESEND_API_KEY: str = ""

    # --- Embeddings ---
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"

    # --- Vector Store ---
    VECTORSTORE_DIR: str = "vectorstore/faiss_index"
    KNOWLEDGE_BASE_DIR: str = "../knowledge_base"

    # --- RAG ---
    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 50
    TOP_K_RESULTS: int = 4

    # --- CORS ---
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000"]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
