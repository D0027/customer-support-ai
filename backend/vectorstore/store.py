"""
FAISS vector store: build from knowledge base, load for retrieval.
"""

import os
from langchain_community.vectorstores import FAISS

from config import settings
from embeddings.embedder import get_embedder
from rag.ingest import load_documents, chunk_documents


def build_and_save_index(kb_dir: str = None, save_dir: str = None) -> int:
    """Ingest knowledge_base PDFs, embed them, and persist a FAISS index. Returns chunk count."""
    save_dir = save_dir or settings.VECTORSTORE_DIR
    docs = load_documents(kb_dir)
    chunks = chunk_documents(docs)

    if not chunks:
        print("No documents found in knowledge_base/. Skipping index build.")
        return 0

    embedder = get_embedder()
    index = FAISS.from_documents(chunks, embedder)
    os.makedirs(save_dir, exist_ok=True)
    index.save_local(save_dir)
    print(f"Saved FAISS index with {len(chunks)} chunks -> {save_dir}")
    return len(chunks)


_index_cache: FAISS | None = None


def load_index(save_dir: str = None) -> FAISS | None:
    """Load the persisted FAISS index (cached in memory after first load)."""
    global _index_cache
    if _index_cache is not None:
        return _index_cache

    save_dir = save_dir or settings.VECTORSTORE_DIR
    if not os.path.isdir(save_dir):
        return None

    embedder = get_embedder()
    _index_cache = FAISS.load_local(save_dir, embedder, allow_dangerous_deserialization=True)
    return _index_cache


def retrieve(query: str, k: int = None) -> list[dict]:
    """Retrieve top-k relevant chunks for a query. Returns [] if no index exists yet."""
    index = load_index()
    if index is None:
        return []

    k = k or settings.TOP_K_RESULTS
    results = index.similarity_search(query, k=k)
    return [{"source": r.metadata.get("source", "unknown"), "text": r.page_content} for r in results]


if __name__ == "__main__":
    build_and_save_index()
