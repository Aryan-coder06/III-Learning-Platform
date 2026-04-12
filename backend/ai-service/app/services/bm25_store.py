import re
from typing import List, Dict

from rank_bm25 import BM25Okapi

from app.db.mongo import mongo_service

class BM25Store:
    def _tokenize(self, text: str) -> List[str]:
        return re.findall(r"[a-z0-9]+", text.lower())

    def search(self, room_id: str, query: str, top_k: int) -> List[Dict]:
        """Sparse retrieval from room chunks in MongoDB."""
        chunks = list(mongo_service.document_chunks.find(
            {"room_id": room_id},
            {"_id": 0}
        ))
        
        if not chunks:
            return []

        tokenized_corpus = [self._tokenize(chunk["text"]) for chunk in chunks]
        bm25 = BM25Okapi(tokenized_corpus)
        
        tokenized_query = self._tokenize(query)
        scores = bm25.get_scores(tokenized_query)
        
        # Merge scores back to chunks
        max_score = max(scores) if len(scores) > 0 else 0.0
        
        results = []
        for i, score in enumerate(scores):
            if score > 0:
                results.append({
                    "text": chunks[i]["text"],
                    "metadata": {
                        "chunk_id": chunks[i]["chunk_id"],
                        "document_id": chunks[i]["document_id"],
                        "filename": chunks[i]["filename"],
                        "page_number": chunks[i]["page_number"]
                    },
                    "sparse_score": float(score / max_score) if max_score > 0 else 0.0
                })
        
        results.sort(key=lambda x: x["sparse_score"], reverse=True)
        return results[:top_k]

bm25_store = BM25Store()
