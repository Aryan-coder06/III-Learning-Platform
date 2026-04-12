import os
import tempfile
import requests
import hashlib
from datetime import datetime, timezone
from uuid import uuid4
from typing import List

import pdfplumber
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

from app.core.logging import get_logger
from app.db.mongo import mongo_service
from app.services.vector_store_service import vector_store_service

logger = get_logger(__name__)

def generate_vector_id(chunk_id: str) -> int:
    """Generate a consistent numeric ID for vector mapping."""
    digest = hashlib.blake2b(chunk_id.encode("utf-8"), digest_size=8).digest()
    vector_id = int.from_bytes(digest, "big") & ((1 << 63) - 1)
    return vector_id or 1

class IndexingService:
    def __init__(self):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=100,
            separators=["\n\n", "\n", " ", ""]
        )

    def process_document(self, room_id: str, document_id: str, file_path: str, filename: str):
        """Full document ingestion flow. Supports both local paths and remote URLs."""
        logger.info(f"Processing doc {document_id} for room {room_id} from {file_path}")
        
        temp_file_path = None
        try:
            # 1. Handle remote URL if file_path is a URL
            if file_path.startswith("http"):
                logger.info(f"Downloading remote file from {file_path}")
                headers = {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
                }
                response = requests.get(file_path, headers=headers, timeout=60)
                response.raise_for_status()
                
                suffix = os.path.splitext(filename)[1] or ".pdf"
                with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
                    temp_file.write(response.content)
                    temp_file_path = temp_file.name
                effective_path = temp_file_path
            else:
                effective_path = file_path

            # 2. Parse PDF
            pages = self._extract_pdf_pages(effective_path)
            
            # 3. Create chunks
            langchain_docs = []
            mongo_chunks = []
            
            for page in pages:
                page_text = page["text"]
                page_num = page["page_number"]
                
                chunks = self.text_splitter.split_text(page_text)
                
                for i, chunk_text in enumerate(chunks):
                    chunk_id = f"chunk_{uuid4().hex[:12]}"
                    vector_id = generate_vector_id(chunk_id)
                    
                    metadata = {
                        "chunk_id": chunk_id,
                        "vector_id": vector_id,
                        "document_id": document_id,
                        "room_id": room_id,
                        "filename": filename,
                        "page_number": page_num,
                        "chunk_index": i,
                        "created_at": datetime.now(timezone.utc)
                    }
                    
                    # For FAISS/LangChain
                    langchain_docs.append(Document(
                        page_content=chunk_text,
                        metadata=metadata
                    ))
                    
                    # For MongoDB
                    mongo_chunks.append({
                        **metadata,
                        "text": chunk_text
                    })
            
            # 4. Store in MongoDB
            if mongo_chunks:
                mongo_service.document_chunks.insert_many(mongo_chunks)
                
            # 5. Store in FAISS (Incremental)
            if langchain_docs:
                vector_store_service.add_documents(room_id, langchain_docs)
                
            # 6. Update MongoDB document status
            mongo_service.documents.update_one(
                {"document_id": document_id},
                {
                    "$set": {
                        "processing_status": "indexed",
                        "index_status": "indexed",
                        "page_count": len(pages),
                        "chunk_count": len(mongo_chunks),
                        "updated_at": datetime.now(timezone.utc)
                    }
                }
            )
            
            logger.info(f"Successfully indexed {len(mongo_chunks)} chunks for {filename}")

        except Exception as e:
            logger.error(f"Error processing document {document_id}: {str(e)}")
            mongo_service.documents.update_one(
                {"document_id": document_id},
                {
                    "$set": {
                        "processing_status": "failed",
                        "index_status": "failed",
                        "updated_at": datetime.now(timezone.utc)
                    }
                }
            )
            raise e
        finally:
            if temp_file_path and os.path.exists(temp_file_path):
                os.remove(temp_file_path)

    def _extract_pdf_pages(self, file_path: str) -> List[dict]:
        pages = []
        with pdfplumber.open(file_path) as pdf:
            for i, page in enumerate(pdf.pages, start=1):
                text = page.extract_text()
                if text and text.strip():
                    pages.append({"page_number": i, "text": text})
        return pages

indexing_service = IndexingService()
