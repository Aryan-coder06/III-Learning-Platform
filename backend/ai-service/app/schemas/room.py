from datetime import datetime

from pydantic import BaseModel, Field


class CreatePrivateRoomRequest(BaseModel):
  room_id: str | None = None
  title: str = Field(min_length=2, max_length=120)
  description: str = Field(min_length=8, max_length=600)
  created_by: str = Field(min_length=2, max_length=120)
  member_ids: list[str] = Field(default_factory=list)
  tags: list[str] = Field(default_factory=list)


class RoomRecord(BaseModel):
  room_id: str
  title: str
  description: str
  room_type: str
  visibility: str
  created_by: str
  member_ids: list[str]
  tags: list[str]
  created_at: datetime
  updated_at: datetime
