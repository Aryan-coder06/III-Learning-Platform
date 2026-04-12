import os
import hashlib
from pathlib import Path
from typing import List

import faiss
import numpy as np
from langchain_community.vectorstores import FAISS
from langchain_community.docstore.in_memory import InMemoryDocstore
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_core.documents import Document

from app.core.settings import get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)

class VectorStoreService:
    def __init__(self):
        self.settings = get_settings()
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model=self.settings.embedding_model,
            google_api_key=self.settings.google_api_key
        )
        # Directory for room vectors
        self.vector_base_path = Path("storage/vectors")
        self.vector_base_path.mkdir(parents=True, exist_ok=True)

    def _get_room_index_path(self, room_id: str) -> Path:
        return self.vector_base_path / room_id / "faiss_index"

    def add_documents(self, room_id: str, documents: List[Document]):
        """Incremental indexing: Add docs to room FAISS index."""
        index_path = self._get_room_index_path(room_id)
        
        # Check actual embedding size vs setting
        test_embed = self.embeddings.embed_query("test")
        actual_dim = len(test_embed)
        if actual_dim != self.settings.dense_vector_size:
            logger.error(f"Dimension mismatch! Config: {self.settings.dense_vector_size}, Actual: {actual_dim}")
            # We will proceed but log the warning as per mission
            
        if index_path.exists():
            vector_store = FAISS.load_local(
                str(index_path), 
                self.embeddings, 
                allow_dangerous_deserialization=True
            )
            vector_store.add_documents(documents)
        else:
            index_path.parent.mkdir(parents=True, exist_ok=True)
            vector_store = FAISS.from_documents(documents, self.embeddings)
            
        vector_store.save_local(str(index_path))
        logger.info(f"Added {len(documents)} docs to room {room_id} index.")

    def search(self, room_id: str, query: str, top_k: int) -> List[dict]:
        """Dense retrieval from room index."""
        index_path = self._get_room_index_path(room_id)
        if not index_path.exists():
            return []

        vector_store = FAISS.load_local(
            str(index_path), 
            self.embeddings, 
            allow_dangerous_deserialization=True
        )
        
        results = vector_store.similarity_search_with_score(query, k=top_k)
        
        formatted_results = []
        for doc, score in results:
            formatted_results.append({
                "text": doc.page_content,
                "metadata": doc.metadata,
                "dense_score": float(1.0 / (1.0 + score)) # Simple normalization
            })
            
        return formatted_results

vector_store_service = VectorStoreService()
