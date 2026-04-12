from datetime import datetime

from pydantic import BaseModel, Field


class RagQueryRequest(BaseModel):
  query: str = Field(min_length=3, max_length=2000)
  top_k: int = Field(default=5, ge=1, le=12)


class RagResult(BaseModel):
  chunk_id: str
  document_id: str
  filename: str
  page_number: int
  text: str
  dense_score: float
  sparse_score: float
  final_score: float


class RagQueryResponse(BaseModel):
  room_id: str
  query: str
  results: list[RagResult]
  answer: str
  retrieval_run_id: str = ""


class RetrievalRunRecord(BaseModel):
  retrieval_run_id: str
  room_id: str
  query: str
  top_k: int
  results: list[dict]
  created_at: datetime
