from fastapi import APIRouter

from app.core.settings import get_settings
from app.db.mongo import mongo_service

router = APIRouter(tags=["health"])


@router.get("/health")
def health():
  settings = get_settings()
  mongo_status = "connected" if mongo_service.is_available() else "unavailable"
  storage_ready = settings.storage_root.exists()

  return {
    "status": "ok" if mongo_status == "connected" else "degraded",
    "mongo": mongo_status,
    "storage": "ready" if storage_ready else "missing",
    "embedding_model": settings.embedding_model,
  }
