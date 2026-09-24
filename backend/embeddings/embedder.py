"""
Embedding model wrapper (sentence-transformers/all-MiniLM-L6-v2).
"""

from functools import lru_cache
from langchain_community.embeddings import HuggingFaceEmbeddings
from config import settings


@lru_cache(maxsize=1)
def get_embedder() -> HuggingFaceEmbeddings:
    """Cached embedding model so it's only loaded into memory once."""
    return HuggingFaceEmbeddings(
        model_name=settings.EMBEDDING_MODEL,
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True},
    )
