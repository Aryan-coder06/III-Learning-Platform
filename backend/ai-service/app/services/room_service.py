from datetime import datetime, timezone
from uuid import uuid4

from fastapi import HTTPException

from app.core.logging import get_logger
from app.db.mongo import mongo_service
from app.schemas.room import CreatePrivateRoomRequest

logger = get_logger(__name__)


class RoomService:
  def create_private_room(self, payload: CreatePrivateRoomRequest) -> dict:
    if not mongo_service.is_available():
      raise HTTPException(status_code=503, detail="MongoDB is unavailable.")

    now = datetime.now(timezone.utc)
    room_id = payload.room_id or f"room_{uuid4().hex[:12]}"
    room_record = {
      "room_id": room_id,
      "title": payload.title,
      "description": payload.description,
      "room_type": "private",
      "visibility": "private",
      "created_by": payload.created_by,
      "member_ids": list(dict.fromkeys([payload.created_by, *payload.member_ids])),
      "tags": payload.tags,
      "updated_at": now,
    }

    existing_room = mongo_service.rooms.find_one({"room_id": room_id}, {"_id": 0, "created_at": 1})
    if existing_room:
      mongo_service.rooms.update_one(
        {"room_id": room_id},
        {"$set": room_record},
      )
      logger.info("Updated private room %s", room_id)
      return {
        **room_record,
        "created_at": existing_room["created_at"],
      }

    room_record["created_at"] = now
    mongo_service.rooms.insert_one(room_record)
    logger.info("Created private room %s", room_id)
    return room_record

  def list_rooms(self) -> list[dict]:
    if not mongo_service.is_available():
      raise HTTPException(status_code=503, detail="MongoDB is unavailable.")

    rooms = list(mongo_service.rooms.find({}, {"_id": 0}).sort("updated_at", -1))
    return rooms

  def get_room(self, room_id: str) -> dict:
    if not mongo_service.is_available():
      raise HTTPException(status_code=503, detail="MongoDB is unavailable.")

    room = mongo_service.rooms.find_one({"room_id": room_id}, {"_id": 0})
    if not room:
      raise HTTPException(status_code=404, detail=f"Room {room_id} was not found.")

    return room


room_service = RoomService()
