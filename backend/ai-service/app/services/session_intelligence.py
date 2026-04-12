import json
import re
import urllib.error
import urllib.request

import google.generativeai as genai
from fastapi import HTTPException

from app.core.settings import get_settings


def _extract_transcript_from_sarvam_response(payload: dict) -> str:
  candidates = [
    payload.get("transcript"),
    payload.get("text"),
    payload.get("output_text"),
  ]
  results = payload.get("results")
  if isinstance(results, list):
    candidates.extend(
      [item.get("transcript") or item.get("text") for item in results if isinstance(item, dict)]
    )

  merged = " ".join([value.strip() for value in candidates if isinstance(value, str) and value.strip()])
  return merged.strip()


def _transcribe_with_sarvam(audio_url: str) -> str:
  settings = get_settings()
  if not settings.sarvam_api_key:
    raise HTTPException(
      status_code=400,
      detail="SARVAM_API_KEY is not configured. Provide transcript_text or configure Sarvam.",
    )

  body = json.dumps(
    {
      "audio_url": audio_url,
      "language_code": "en-IN",
      "diarization": True,
      "enable_punctuation": True,
    }
  ).encode("utf-8")
  request = urllib.request.Request(
    settings.sarvam_asr_url,
    method="POST",
    data=body,
    headers={
      "Content-Type": "application/json",
      "Authorization": f"Bearer {settings.sarvam_api_key}",
    },
  )
  try:
    with urllib.request.urlopen(request, timeout=45) as response:
      payload = json.loads(response.read().decode("utf-8"))
  except urllib.error.HTTPError as exc:
    detail = exc.read().decode("utf-8", errors="ignore") if exc.fp else str(exc)
    raise HTTPException(status_code=502, detail=f"Sarvam ASR request failed: {detail}") from exc
  except urllib.error.URLError as exc:
    raise HTTPException(status_code=502, detail=f"Sarvam ASR network error: {exc}") from exc

  transcript = _extract_transcript_from_sarvam_response(payload)
  if not transcript:
    raise HTTPException(status_code=422, detail="Sarvam ASR returned no transcript text.")
  return transcript


def _heuristic_analysis(transcript_text: str, attendees: list[dict], session_id: str):
  cleaned = re.sub(r"\s+", " ", transcript_text).strip()
  sentences = [part.strip() for part in re.split(r"(?<=[.!?])\s+", cleaned) if part.strip()]
  summary = " ".join(sentences[:4]) if sentences else "No meaningful transcript content detected."

  key_points = []
  for sentence in sentences[:10]:
    if len(key_points) >= 5:
      break
    if len(sentence) >= 24:
      key_points.append(sentence)
  if not key_points and summary:
    key_points = [summary]

  action_items = []
  action_phrases = ("todo", "to do", "action", "next", "follow up", "implement", "finish", "complete")
  fallback_owner = attendees[0] if attendees else {"user_id": "unassigned", "name": "Unassigned"}
  idx = 1
  for sentence in sentences:
    lower = sentence.lower()
    if any(phrase in lower for phrase in action_phrases) or lower.startswith(("we should", "let's", "need to")):
      action_items.append(
        {
          "item_id": f"act_{session_id}_{idx:02d}",
          "text": sentence[:260],
          "owner_user_id": fallback_owner["user_id"],
          "owner_name": fallback_owner["name"],
          "priority": "medium",
          "suggested_status": "todo",
          "confidence": 0.56,
          "rationale": "Extracted from explicit action-oriented phrase in transcript.",
          "source_excerpt": sentence[:180],
        }
      )
      idx += 1
    if len(action_items) >= 8:
      break

  return {
    "summary": summary,
    "key_points": key_points,
    "action_items": action_items,
  }


def _model_analysis(transcript_text: str, attendees: list[dict], session_id: str):
  settings = get_settings()
  if not settings.google_api_key:
    return _heuristic_analysis(transcript_text, attendees, session_id)

  genai.configure(api_key=settings.google_api_key)
  model = genai.GenerativeModel(settings.generation_model)

  attendees_text = "\n".join(
    [f"- {attendee['name']} ({attendee['user_id']}, {attendee['email']})" for attendee in attendees]
  ) or "- No attendees provided."

  prompt = f"""
You are StudySync AI session analyst.
Given the transcript, return STRICT JSON with this shape:
{{
  "summary": "2-4 paragraph concise meeting summary",
  "key_points": ["point1", "point2", "..."],
  "action_items": [
    {{
      "item_id": "act_{session_id}_01",
      "text": "clear action task",
      "owner_user_id": "must match attendee user_id when possible else 'unassigned'",
      "owner_name": "attendee name or 'Unassigned'",
      "priority": "low|medium|high",
      "suggested_status": "todo|in_progress|done|needs_clarification",
      "confidence": 0.0,
      "rationale": "why this action exists",
      "source_excerpt": "short quote from transcript"
    }}
  ]
}}

Rules:
- Be practical and student-focused.
- If someone says task is done clearly, suggested_status can be "done".
- If uncertain assignment, owner_user_id must be "unassigned" and owner_name "Unassigned".
- Keep action_items at most 8.
- Output valid JSON only; no markdown.

Attendees:
{attendees_text}

Transcript:
{transcript_text[:120000]}
"""
  try:
    response = model.generate_content(prompt)
    raw_text = (response.text or "").strip()
    parsed = json.loads(raw_text)
  except Exception:
    return _heuristic_analysis(transcript_text, attendees, session_id)

  if not isinstance(parsed, dict):
    return _heuristic_analysis(transcript_text, attendees, session_id)

  parsed.setdefault("summary", "")
  parsed.setdefault("key_points", [])
  parsed.setdefault("action_items", [])
  if not isinstance(parsed["key_points"], list):
    parsed["key_points"] = []
  if not isinstance(parsed["action_items"], list):
    parsed["action_items"] = []
  return parsed


def analyze_session_payload(
  session_id: str,
  transcript_text: str,
  sarvam_audio_url: str,
  attendees: list[dict],
):
  source = "provided_text"
  text = transcript_text.strip()

  if not text and sarvam_audio_url.strip():
    text = _transcribe_with_sarvam(sarvam_audio_url.strip())
    source = "sarvam_asr"

  if not text:
    raise HTTPException(
      status_code=400,
      detail="transcript_text is empty. Provide transcript text or sarvam_audio_url.",
    )

  analyzed = _model_analysis(text, attendees, session_id)
  analyzed["transcript_source"] = source
  return analyzed

