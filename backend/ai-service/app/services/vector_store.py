import hashlib
from pathlib import Path

import faiss
import numpy as np

from app.core.settings import get_settings


def vector_id_from_chunk_id(chunk_id: str) -> int:
  digest = hashlib.blake2b(chunk_id.encode("utf-8"), digest_size=8).digest()
  vector_id = int.from_bytes(digest, "big") & ((1 << 63) - 1)
  return vector_id or 1


class FaissRoomVectorStore:
  def __init__(self):
    self.settings = get_settings()
    self.dimension = self.settings.dense_vector_size

  def add_embeddings(self, room_id: str, chunk_ids: list[str], embeddings: np.ndarray):
    index = self._load_or_create_index(room_id)
    ids = np.array([vector_id_from_chunk_id(chunk_id) for chunk_id in chunk_ids], dtype=np.int64)
    index.add_with_ids(embeddings.astype("float32"), ids)
    self._persist_index(room_id, index)

  def remove_embeddings(self, room_id: str, chunk_ids: list[str]):
    index_path = self._index_path(room_id)
    if not index_path.exists() or not chunk_ids:
      return

    index = faiss.read_index(str(index_path))
    ids = np.array([vector_id_from_chunk_id(chunk_id) for chunk_id in chunk_ids], dtype=np.int64)
    index.remove_ids(ids)
    self._persist_index(room_id, index)

  def search(self, room_id: str, query_embedding: np.ndarray, top_k: int) -> list[tuple[int, float]]:
    index_path = self._index_path(room_id)
    if not index_path.exists():
      return []

    index = faiss.read_index(str(index_path))
    if index.ntotal == 0:
      return []

    scores, ids = index.search(query_embedding.reshape(1, -1).astype("float32"), top_k)
    results: list[tuple[int, float]] = []
    for vector_id, score in zip(ids[0].tolist(), scores[0].tolist(), strict=False):
      if vector_id == -1:
        continue
      results.append((int(vector_id), float(score)))

    return results

  def _load_or_create_index(self, room_id: str):
    index_path = self._index_path(room_id)
    if index_path.exists():
      return faiss.read_index(str(index_path))

    base_index = faiss.IndexFlatIP(self.dimension)
    return faiss.IndexIDMap2(base_index)

  def _persist_index(self, room_id: str, index):
    index_path = self._index_path(room_id)
    index_path.parent.mkdir(parents=True, exist_ok=True)
    faiss.write_index(index, str(index_path))

  def _index_path(self, room_id: str) -> Path:
    return self.settings.vector_storage_root / self.settings.workspace_id / room_id / "room.index"


vector_store = FaissRoomVectorStore()
