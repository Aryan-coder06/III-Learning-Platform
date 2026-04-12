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

    chunks = self._room_chunks(room_id)
    if not chunks:
      return []

    dense_results = {
      result["metadata"]["chunk_id"]: result["dense_score"]
      for result in self.dense_retrieve(room_id, query, self.settings.dense_top_k)
    }
    sparse_results = {
      result["metadata"]["chunk_id"]: result["sparse_score"]
      for result in self.sparse_retrieve(room_id, query, self.settings.sparse_top_k)
    }

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
          "excerpt": self._excerpt(chunk["text"]),
          "dense_score": scores["dense_score"],
          "sparse_score": scores["sparse_score"],
          "final_score": final_score,
        }
      )

    ranked_results.sort(key=lambda item: item["final_score"], reverse=True)
    return ranked_results[:top_k]

  def dense_retrieve(self, room_id: str, query: str, top_k: int | None = None) -> list[dict]:
    query_embedding = embedding_service.embed_query(query)
    vector_hits = vector_store.search(room_id, query_embedding, top_k or self.settings.dense_top_k)
    if not vector_hits:
      return []

    max_score = max(max(score, 0.0) for _, score in vector_hits) or 1.0
    chunk_by_vector_id = {
      chunk["vector_id"]: chunk
      for chunk in mongo_service.document_chunks.find(
        {"room_id": room_id, "vector_id": {"$in": [vector_id for vector_id, _ in vector_hits]}},
        {"vector_id": 1, "chunk_id": 1, "document_id": 1, "page_number": 1, "text": 1, "_id": 0},
      )
    }

    results = []
    for vector_id, score in vector_hits:
      chunk = chunk_by_vector_id.get(vector_id)
      if not chunk:
        continue
      results.append(
        {
          "text": chunk["text"],
          "metadata": {
            "chunk_id": chunk["chunk_id"],
            "document_id": chunk["document_id"],
            "filename": self._document_filename(chunk["document_id"]),
            "page_number": chunk["page_number"],
          },
          "dense_score": max(score, 0.0) / max_score,
        }
      )

    return results

  def sparse_retrieve(self, room_id: str, query: str, top_k: int | None = None) -> list[dict]:
    chunks = self._room_chunks(room_id)
    if not chunks:
      return []

    sparse_scores = self._sparse_retrieve_scores(chunks, query)
    results = []
    for chunk_id, score in list(sparse_scores.items())[: (top_k or self.settings.sparse_top_k)]:
      chunk = next((candidate for candidate in chunks if candidate["chunk_id"] == chunk_id), None)
      if not chunk:
        continue
      results.append(
        {
          "text": chunk["text"],
          "metadata": {
            "chunk_id": chunk["chunk_id"],
            "document_id": chunk["document_id"],
            "filename": self._document_filename(chunk["document_id"]),
            "page_number": chunk["page_number"],
          },
          "sparse_score": score,
        }
      )

    return results

  def _room_chunks(self, room_id: str) -> list[dict]:
    return list(
      mongo_service.document_chunks.find(
        {"room_id": room_id},
        {"_id": 0},
      )
    )

  def _sparse_retrieve_scores(self, chunks: list[dict], query: str) -> dict[str, float]:
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

  def _excerpt(self, text: str, max_length: int = 240) -> str:
    cleaned = re.sub(r"\s+", " ", text).strip()
    if len(cleaned) <= max_length:
      return cleaned
    return f"{cleaned[:max_length].strip()}..."


retriever = HybridRoomRetriever()
