from datetime import datetime

from pydantic import BaseModel


class DocumentRecord(BaseModel):
  document_id: str
  room_id: str
  workspace_id: str
  filename: str
  file_path: str
  mime_type: str
  uploaded_by: str
  upload_time: datetime
  processing_status: str
  index_status: str
  page_count: int
  chunk_count: int
  version: int
