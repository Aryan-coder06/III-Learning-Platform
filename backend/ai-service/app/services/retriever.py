import re
from collections import defaultdict

from fastapi import HTTPException
from rank_bm25 import BM25Okapi

from app.core.settings import get_settings
from app.db.mongo import mongo_service
from app.services.embeddings import embedding_service
from app.services.vector_store import vector_store


class HybridRoomRetriever:
  def __init__(self):
    self.settings = get_settings()

  def query(self, room_id: str, query: str, top_k: int) -> list[dict]:
    if not mongo_service.is_available():
      raise HTTPException(status_code=503, detail="MongoDB is unavailable.")

    chunks = list(
      mongo_service.document_chunks.find(
        {"room_id": room_id},
        {"_id": 0},
      )
    )
    if not chunks:
      return []

    dense_results = self._dense_retrieve(room_id, query)
    sparse_results = self._sparse_retrieve(chunks, query)
    merged_scores: dict[str, dict] = defaultdict(
      lambda: {
        "dense_score": 0.0,
        "sparse_score": 0.0,
        "final_score": 0.0,
      }
    )

    chunk_lookup = {chunk["chunk_id"]: chunk for chunk in chunks}

    for chunk_id, score in dense_results.items():
      merged_scores[chunk_id]["dense_score"] = score

    for chunk_id, score in sparse_results.items():
      merged_scores[chunk_id]["sparse_score"] = score

    ranked_results = []
    for chunk_id, scores in merged_scores.items():
      chunk = chunk_lookup.get(chunk_id)
      if not chunk:
        continue

      final_score = (
        self.settings.dense_weight * scores["dense_score"]
        + self.settings.sparse_weight * scores["sparse_score"]
      )
      ranked_results.append(
        {
          "chunk_id": chunk["chunk_id"],
          "document_id": chunk["document_id"],
          "filename": self._document_filename(chunk["document_id"]),
          "page_number": chunk["page_number"],
          "text": chunk["text"],
          "dense_score": scores["dense_score"],
          "sparse_score": scores["sparse_score"],
          "final_score": final_score,
        }
      )

    ranked_results.sort(key=lambda item: item["final_score"], reverse=True)
    return ranked_results[:top_k]

  def _dense_retrieve(self, room_id: str, query: str) -> dict[str, float]:
    query_embedding = embedding_service.embed_query(query)
    vector_hits = vector_store.search(room_id, query_embedding, self.settings.dense_top_k)
    if not vector_hits:
      return {}

    max_score = max(max(score, 0.0) for _, score in vector_hits) or 1.0
    chunk_by_vector_id = {
      chunk["vector_id"]: chunk["chunk_id"]
      for chunk in mongo_service.document_chunks.find(
        {"room_id": room_id, "vector_id": {"$in": [vector_id for vector_id, _ in vector_hits]}},
        {"vector_id": 1, "chunk_id": 1, "_id": 0},
      )
    }

    return {
      chunk_by_vector_id[vector_id]: max(score, 0.0) / max_score
      for vector_id, score in vector_hits
      if vector_id in chunk_by_vector_id
    }

  def _sparse_retrieve(self, chunks: list[dict], query: str) -> dict[str, float]:
    tokenized_corpus = [self._tokenize(chunk["normalized_text"]) for chunk in chunks]
    if not any(tokenized_corpus):
      return {}

    bm25 = BM25Okapi(tokenized_corpus)
    tokenized_query = self._tokenize(query)
    if not tokenized_query:
      return {}

    raw_scores = bm25.get_scores(tokenized_query)
    max_score = max(raw_scores) if len(raw_scores) > 0 else 0.0
    if max_score <= 0:
      return {}

    sparse_scores = {}
    for index, score in enumerate(raw_scores):
      if score <= 0:
        continue

      sparse_scores[chunks[index]["chunk_id"]] = float(score / max_score)

    return dict(
      sorted(sparse_scores.items(), key=lambda item: item[1], reverse=True)[
        : self.settings.sparse_top_k
      ]
    )

  def _tokenize(self, text: str) -> list[str]:
    return re.findall(r"[a-z0-9]+", text.lower())

  def _document_filename(self, document_id: str) -> str:
    document = mongo_service.documents.find_one(
      {"document_id": document_id},
      {"filename": 1, "_id": 0},
    )
    return document["filename"] if document else document_id


retriever = HybridRoomRetriever()
