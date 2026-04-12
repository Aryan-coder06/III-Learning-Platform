from fastapi import APIRouter

from app.schemas.session import SessionAnalyzeRequest, SessionAnalyzeResponse
from app.services.session_intelligence import analyze_session_payload

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


@router.post("/analyze", response_model=SessionAnalyzeResponse)
def analyze_session(request: SessionAnalyzeRequest):
  analyzed = analyze_session_payload(
    session_id=request.session_id,
    transcript_text=request.transcript_text,
    sarvam_audio_url=request.sarvam_audio_url,
    attendees=[attendee.model_dump() for attendee in request.attendees],
  )
  return SessionAnalyzeResponse(
    session_id=request.session_id,
    summary=analyzed.get("summary", ""),
    key_points=analyzed.get("key_points", []),
    action_items=analyzed.get("action_items", []),
    transcript_source=analyzed.get("transcript_source", "provided_text"),
  )

