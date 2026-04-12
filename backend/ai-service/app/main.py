from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.logging import configure_logging, get_logger
from app.core.settings import get_settings
from app.db.mongo import mongo_service

configure_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
  settings = get_settings()
  settings.storage_root.mkdir(parents=True, exist_ok=True)

  try:
    mongo_service.ensure_indexes()
    logger.info("MongoDB indexes ensured for StudySync AI service.")
  except Exception as exc:  # pragma: no cover - defensive startup logging
    logger.warning("MongoDB index bootstrap skipped: %s", exc)

  yield


settings = get_settings()

app = FastAPI(
  title=settings.app_name,
  version=settings.app_version,
  lifespan=lifespan,
)

app.add_middleware(
  CORSMiddleware,
  allow_origins=settings.allowed_origins,
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

app.include_router(api_router)
