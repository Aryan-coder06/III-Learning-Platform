from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
  app_name: str = "StudySync AI Service"
  app_version: str = "0.2.0"
  allowed_origins_raw: str = Field(
    default="http://localhost:3000,http://127.0.0.1:3000",
    validation_alias="AI_SERVICE_ALLOWED_ORIGINS",
  )
  mongo_uri: str = Field(
    default="mongodb://localhost:27017",
    validation_alias="AI_SERVICE_MONGO_URI",
  )
  mongo_db_name: str = Field(
    default="studysync_ai",
    validation_alias="AI_SERVICE_MONGO_DB_NAME",
  )
  workspace_id: str = Field(
    default="main-workspace",
    validation_alias="AI_SERVICE_WORKSPACE_ID",
  )
  storage_root: Path = Field(
    default=Path(__file__).resolve().parents[2] / "storage",
    validation_alias="AI_SERVICE_STORAGE_ROOT",
  )
  embedding_model: str = Field(
    default="models/gemini-embedding-001",
    validation_alias="EMBEDDING_MODEL",
  )
  generation_model: str = Field(
    default="gemini-2.5-flash",
    validation_alias="GENERATION_MODEL",
  )
  google_api_key: str | None = Field(
    default=None,
    validation_alias="GOOGLE_API_KEY",
  )
  sarvam_api_key: str | None = Field(
    default=None,
    validation_alias="SARVAM_API_KEY",
  )
  sarvam_asr_url: str = Field(
    default="https://api.sarvam.ai/speech-to-text",
    validation_alias="SARVAM_ASR_URL",
  )
  dense_vector_size: int = 3072
  dense_top_k: int = 12
  sparse_top_k: int = 12
  dense_weight: float = 0.65
  sparse_weight: float = 0.35

  model_config = SettingsConfigDict(
    env_file=".env",
    env_file_encoding="utf-8",
    case_sensitive=False,
    extra="ignore",
  )

  @property
  def allowed_origins(self) -> list[str]:
    return [origin.strip() for origin in self.allowed_origins_raw.split(",") if origin.strip()]

  @property
  def pdf_storage_root(self) -> Path:
    return self.storage_root / "pdfs"

  @property
  def vector_storage_root(self) -> Path:
    return self.storage_root / "vector_indexes"


@lru_cache(maxsize=1)
def get_settings():
  return Settings()
