import shutil
from pathlib import Path

from fastapi import UploadFile

from app.core.settings import get_settings


class LocalStorageService:
  def __init__(self):
    self.settings = get_settings()

  def save_pdf(self, workspace_id: str, room_id: str, document_id: str, upload: UploadFile) -> str:
    destination_dir = self.settings.pdf_storage_root / workspace_id / room_id
    destination_dir.mkdir(parents=True, exist_ok=True)
    destination_path = destination_dir / f"{document_id}.pdf"

    upload.file.seek(0)
    with destination_path.open("wb") as output_file:
      shutil.copyfileobj(upload.file, output_file)

    return str(destination_path.relative_to(self.settings.storage_root.parent))

  def resolve_path(self, relative_path: str) -> Path:
    return self.settings.storage_root.parent / relative_path


storage_service = LocalStorageService()
