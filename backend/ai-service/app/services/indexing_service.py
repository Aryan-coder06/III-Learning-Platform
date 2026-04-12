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

class IndexingService:
    def __init__(self):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=100,
            separators=["\n\n", "\n", " ", ""]
        )

    def process_document(self, room_id: str, document_id: str, file_path: str, filename: str):
        """Full document ingestion flow."""
        logger.info(f"Processing doc {document_id} for room {room_id}")
        
        # 1. Parse PDF
        pages = self._extract_pdf_pages(file_path)
        
        # 2. Create chunks
        langchain_docs = []
        mongo_chunks = []
        
        for page in pages:
            page_text = page["text"]
            page_num = page["page_number"]
            
            chunks = self.text_splitter.split_text(page_text)
            
            for i, chunk_text in enumerate(chunks):
                chunk_id = f"chunk_{uuid4().hex[:12]}"
                
                metadata = {
                    "chunk_id": chunk_id,
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
        
        # 3. Store in MongoDB
        if mongo_chunks:
            mongo_service.document_chunks.insert_many(mongo_chunks)
            
        # 4. Store in FAISS (Incremental)
        if langchain_docs:
            vector_store_service.add_documents(room_id, langchain_docs)
            
        # 5. Update MongoDB document status
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

    def _extract_pdf_pages(self, file_path: str) -> List[dict]:
        pages = []
        with pdfplumber.open(file_path) as pdf:
            for i, page in enumerate(pdf.pages, start=1):
                text = page.extract_text()
                if text and text.strip():
                    pages.append({"page_number": i, "text": text})
        return pages

indexing_service = IndexingService()
