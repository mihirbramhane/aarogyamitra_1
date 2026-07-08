"""Build the RAG vector store from official scheme guideline PDFs.

Usage (from backend/):
    python -m app.rag.ingest

Place official scheme PDFs (PM-JAY, Aarogyasri, etc.) in data/scheme_docs/ first.

Note: this intentionally avoids langchain_text_splitters / langchain_community,
because on some Windows setups those pull in `transformers` -> `torch`, which can
fail to load (e.g. "paging file is too small"). We only need simple PDF text
extraction + character chunking, so we do that directly with pypdf.
"""
import glob
import os

try:
    import truststore

    truststore.inject_into_ssl()
except ImportError:
    pass

from pypdf import PdfReader
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma

from app.config import get_settings


def _load_pdf_as_documents(path: str) -> list[Document]:
    reader = PdfReader(path)
    docs = []
    for i, page in enumerate(reader.pages):
        text = (page.extract_text() or "").strip()
        if text:
            docs.append(Document(page_content=text, metadata={"source": path, "page": i + 1}))
    return docs


def _chunk_documents(docs: list[Document], chunk_size: int = 1000, overlap: int = 150) -> list[Document]:
    """Simple character-based chunker with overlap — no heavy ML deps needed."""
    chunks: list[Document] = []
    for doc in docs:
        text = doc.page_content
        start = 0
        while start < len(text):
            end = start + chunk_size
            piece = text[start:end]
            chunks.append(Document(page_content=piece, metadata=dict(doc.metadata)))
            if end >= len(text):
                break
            start = end - overlap
    return chunks


def build_store() -> None:
    s = get_settings()
    pdfs = glob.glob(os.path.join(s.scheme_docs_dir, "*.pdf"))
    if not pdfs:
        print(f"No PDFs found in {s.scheme_docs_dir}. Add scheme guideline PDFs and re-run.")
        return

    docs = []
    for path in pdfs:
        print(f"Loading {path} ...")
        docs.extend(_load_pdf_as_documents(path))

    chunks = _chunk_documents(docs)
    print(f"Split into {len(chunks)} chunks. Embedding...")

    embeddings = OpenAIEmbeddings(model=s.embedding_model, api_key=s.openai_api_key)
    Chroma.from_documents(chunks, embeddings, persist_directory=s.chroma_dir)
    print(f"Vector store written to {s.chroma_dir}")


if __name__ == "__main__":
    build_store()

