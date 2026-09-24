"""
Module 7: RAG - Document ingestion & chunking.
Loads PDFs from knowledge_base/, splits into chunks.
"""

import os
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document

from config import settings


def load_documents(kb_dir: str = None) -> list[Document]:
    """Load every PDF in the knowledge_base directory."""
    kb_dir = kb_dir or settings.KNOWLEDGE_BASE_DIR
    documents: list[Document] = []

    if not os.path.isdir(kb_dir):
        return documents

    for filename in sorted(os.listdir(kb_dir)):
        if filename.lower().endswith(".pdf"):
            path = os.path.join(kb_dir, filename)
            loader = PyPDFLoader(path)
            docs = loader.load()
            for d in docs:
                d.metadata["source"] = filename
            documents.extend(docs)

    return documents


def chunk_documents(documents: list[Document]) -> list[Document]:
    """Split loaded documents into overlapping chunks for embedding."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.CHUNK_SIZE,
        chunk_overlap=settings.CHUNK_OVERLAP,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    return splitter.split_documents(documents)


if __name__ == "__main__":
    docs = load_documents()
    print(f"Loaded {len(docs)} raw pages")
    chunks = chunk_documents(docs)
    print(f"Split into {len(chunks)} chunks")
