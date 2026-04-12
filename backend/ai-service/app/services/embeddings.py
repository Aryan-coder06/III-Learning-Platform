import hashlib
import re

import numpy as np
import google.generativeai as genai
from fastapi import HTTPException

from app.core.settings import get_settings


class GeminiEmbeddings:
  def __init__(self):
    self.settings = get_settings()
    self.model_name = self.settings.embedding_model
    if self.settings.google_api_key:
      genai.configure(api_key=self.settings.google_api_key)
      self.client = genai

  def embed_texts(self, texts: list[str]) -> np.ndarray:
    if not self.settings.google_api_key:
      return self._fallback_embed_texts(texts)

    try:
      response = self.client.embed_content(
        model=self.model_name,
        content=texts,
        task_type="retrieval_document",
      )
      return np.array(response["embeddings"], dtype="float32")
    except Exception as e:
      print(f"Gemini embedding error: {e}")
      return self._fallback_embed_texts(texts)

  def embed_query(self, query: str) -> np.ndarray:
    if not self.settings.google_api_key:
      return self._fallback_embed_query(query)

    try:
      response = self.client.embed_content(
        model=self.model_name,
        content=query,
        task_type="retrieval_query",
      )
      return np.array(response["embedding"], dtype="float32")
    except Exception as e:
      print(f"Gemini embedding error: {e}")
      return self._fallback_embed_query(query)

  def _fallback_embed_texts(self, texts: list[str]) -> np.ndarray:
    vectors = np.vstack([self._fallback_embed(text) for text in texts]).astype("float32")
    return vectors

  def _fallback_embed_query(self, query: str) -> np.ndarray:
    return self._fallback_embed(query).astype("float32")

  def _fallback_embed(self, text: str) -> np.ndarray:
    # Use the same dimension as Gemini (768) if possible, or settings.dense_vector_size
    dim = self.settings.dense_vector_size
    vector = np.zeros(dim, dtype=np.float32)
    tokens = re.findall(r"[a-z0-9]+", text.lower())

    if not tokens:
      return vector

    for token in tokens:
      digest = hashlib.blake2b(token.encode("utf-8"), digest_size=16).digest()
      for offset in range(0, 16, 4):
        index = int.from_bytes(digest[offset : offset + 2], "big") % dim
        sign = 1.0 if digest[offset + 2] % 2 == 0 else -1.0
        magnitude = 1.0 + (digest[offset + 3] / 255.0)
        vector[index] += sign * magnitude

    norm = np.linalg.norm(vector)
    if norm > 0:
      vector /= norm

    return vector


embedding_service = GeminiEmbeddings()
