from pydantic import BaseModel, Field


class SessionAttendee(BaseModel):
  user_id: str = Field(min_length=1, max_length=120)
  name: str = Field(min_length=1, max_length=120)
  email: str = Field(min_length=3, max_length=200)


class SessionAnalyzeRequest(BaseModel):
  session_id: str = Field(min_length=4, max_length=120)
  room_id: str = Field(default="")
  room_code: str = Field(default="")
  room_title: str = Field(default="", max_length=200)
  transcript_text: str = Field(default="", max_length=300000)
  sarvam_audio_url: str = Field(default="", max_length=2000)
  attendees: list[SessionAttendee] = Field(default_factory=list)


class SessionActionItem(BaseModel):
  item_id: str
  text: str
  owner_user_id: str
  owner_name: str
  priority: str = "medium"
  suggested_status: str = "todo"
  confidence: float = 0.5
  rationale: str = ""
  source_excerpt: str = ""


class SessionAnalyzeResponse(BaseModel):
  session_id: str
  summary: str
  key_points: list[str]
  action_items: list[SessionActionItem]
  transcript_source: str = "provided_text"

