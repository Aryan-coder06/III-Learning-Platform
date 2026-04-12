import os
import tempfile
from datetime import datetime, timezone
from uuid import uuid4

import httpx
import pdfplumber
from fastapi import HTTPException, UploadFile

from app.core.logging import get_logger
from app.core.settings import get_settings
from app.db.mongo import mongo_service
from app.services.chunker import chunker
from app.services.embeddings import embedding_service
from app.services.storage import storage_service
from app.services.vector_store import vector_id_from_chunk_id, vector_store
from app.services.room_service import room_service
from app.schemas.document import DocumentRecord

logger = get_logger(__name__)


class DocumentService:
  def __init__(self):
    self.settings = get_settings()

  def sync_document(self, room_id: str, payload: DocumentRecord) -> dict:
    if not mongo_service.is_available():
      raise HTTPException(status_code=503, detail="MongoDB is unavailable.")

    room_service.get_room(room_id)
    
    # Use the existing data from payload
    record = payload.model_dump()
    
    # Ensure upload_time is a datetime object for MongoDB
    if not record.get("upload_time"):
      record["upload_time"] = datetime.now(timezone.utc)
    elif isinstance(record["upload_time"], str):
      try:
        record["upload_time"] = datetime.fromisoformat(record["upload_time"].replace("Z", "+00:00"))
      except ValueError:
        record["upload_time"] = datetime.now(timezone.utc)

    mongo_service.documents.update_one(
      {"document_id": record["document_id"]},
      {"$set": record},
      upsert=True
    )
    
    mongo_service.rooms.update_one(
      {"room_id": room_id},
      {"$set": {"updated_at": datetime.now(timezone.utc)}},
    )
    
    logger.info("Synced document %s for room %s", record["document_id"], room_id)
    return record

  def upload_document(self, room_id: str, upload: UploadFile, uploaded_by: str) -> dict:
    if not mongo_service.is_available():
      raise HTTPException(status_code=503, detail="MongoDB is unavailable.")

    room_service.get_room(room_id)

    if upload.content_type not in {"application/pdf", "application/octet-stream"}:
      raise HTTPException(status_code=400, detail="Only PDF uploads are supported.")

    document_id = f"doc_{uuid4().hex[:12]}"
    relative_path = storage_service.save_pdf(
      workspace_id=self.settings.workspace_id,
      room_id=room_id,
      document_id=document_id,
      upload=upload,
    )

    now = datetime.now(timezone.utc)
    record = {
      "document_id": document_id,
      "room_id": room_id,
      "workspace_id": self.settings.workspace_id,
      "filename": upload.filename or f"{document_id}.pdf",
      "file_path": relative_path,
      "mime_type": upload.content_type or "application/pdf",
      "uploaded_by": uploaded_by,
      "upload_time": now,
      "processing_status": "uploaded",
      "index_status": "pending",
      "page_count": 0,
      "chunk_count": 0,
      "version": 1,
    }

    mongo_service.documents.insert_one(record)
    mongo_service.rooms.update_one(
      {"room_id": room_id},
      {"$set": {"updated_at": now}},
    )
    logger.info("Uploaded document %s for room %s", document_id, room_id)
    return record

  def process_document(self, room_id: str, document_id: str) -> dict:
    if not mongo_service.is_available():
      raise HTTPException(status_code=503, detail="MongoDB is unavailable.")

    room_service.get_room(room_id)
    document = self._get_document(room_id, document_id)

    mongo_service.documents.update_one(
      {"document_id": document_id},
      {"$set": {"processing_status": "processing", "index_status": "processing"}},
    )

    try:
      pages = self._extract_pdf_pages(document["file_path"])
      chunks = chunker.chunk_pages(room_id=room_id, document_id=document_id, pages=pages)
      self._clear_existing_chunks(room_id=room_id, document_id=document_id)

      if chunks:
        embeddings = embedding_service.embed_texts(
          [chunk["normalized_text"] or chunk["text"] for chunk in chunks]
        )
        chunk_records = []
        for position, chunk in enumerate(chunks):
          vector_id = vector_id_from_chunk_id(chunk["chunk_id"])
          chunk_records.append(
            {
              **chunk,
              "embedding_model": embedding_service.model_name,
              "vector_id": vector_id,
              "created_at": datetime.now(timezone.utc),
            }
          )

        mongo_service.document_chunks.insert_many(chunk_records)
        vector_store.add_embeddings(
          room_id=room_id,
          chunk_ids=[chunk["chunk_id"] for chunk in chunks],
          embeddings=embeddings,
        )

      updated_document = {
        **document,
        "processing_status": "indexed",
        "index_status": "indexed",
        "page_count": len(pages),
        "chunk_count": len(chunks),
      }

      mongo_service.documents.update_one(
        {"document_id": document_id},
        {
          "$set": {
            "processing_status": updated_document["processing_status"],
            "index_status": updated_document["index_status"],
            "page_count": updated_document["page_count"],
            "chunk_count": updated_document["chunk_count"],
          }
        },
      )
      mongo_service.rooms.update_one(
        {"room_id": room_id},
        {"$set": {"updated_at": datetime.now(timezone.utc)}},
      )
      logger.info(
        "Processed document %s for room %s with %s chunks",
        document_id,
        room_id,
        len(chunks),
      )
      return updated_document
    except Exception as exc:
      mongo_service.documents.update_one(
        {"document_id": document_id},
        {"$set": {"processing_status": "failed", "index_status": "failed"}},
      )
      logger.exception("Document processing failed for %s: %s", document_id, exc)
      raise HTTPException(status_code=500, detail=f"Document processing failed: {exc}") from exc

  def list_room_documents(self, room_id: str) -> list[dict]:
    if not mongo_service.is_available():
      raise HTTPException(status_code=503, detail="MongoDB is unavailable.")

    room_service.get_room(room_id)
    return list(
      mongo_service.documents.find({"room_id": room_id}, {"_id": 0}).sort("upload_time", -1)
    )

  def _get_document(self, room_id: str, document_id: str) -> dict:
    document = mongo_service.documents.find_one(
      {"room_id": room_id, "document_id": document_id},
      {"_id": 0},
    )
    if not document:
      raise HTTPException(status_code=404, detail=f"Document {document_id} was not found.")

    return document

  def _extract_pdf_pages(self, file_path_or_url: str) -> list[dict]:
    pages: list[dict] = []

    if file_path_or_url.startswith(("http://", "https://")):
      # Handle Cloudinary URL
      with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp_path = tmp.name
        try:
          with httpx.stream("GET", file_path_or_url) as response:
            if response.status_code != 200:
              raise HTTPException(status_code=400, detail=f"Failed to download PDF from {file_path_or_url}")
            for chunk in response.iter_bytes():
              tmp.write(chunk)
          tmp.close() # Ensure content is flushed
          pages = self._parse_pdf_file(tmp_path)
        finally:
          if os.path.exists(tmp_path):
            os.remove(tmp_path)
    else:
      # Handle local file path
      file_path = storage_service.resolve_path(file_path_or_url)
      pages = self._parse_pdf_file(str(file_path))

    if not pages:
      raise HTTPException(status_code=400, detail="No extractable text found in the PDF.")

    return pages

  def _parse_pdf_file(self, file_path: str) -> list[dict]:
    pages: list[dict] = []
    with pdfplumber.open(file_path) as pdf:
      for index, page in enumerate(pdf.pages, start=1):
        text = page.extract_text() or ""
        if text.strip():
          pages.append({"page_number": index, "text": text})
    return pages

  def _clear_existing_chunks(self, room_id: str, document_id: str):
    existing_chunks = list(
      mongo_service.document_chunks.find(
        {"room_id": room_id, "document_id": document_id},
        {"chunk_id": 1, "_id": 0},
      )
    )
    if existing_chunks:
      vector_store.remove_embeddings(
        room_id=room_id,
        chunk_ids=[chunk["chunk_id"] for chunk in existing_chunks],
      )
      mongo_service.document_chunks.delete_many(
        {"room_id": room_id, "document_id": document_id}
      )


document_service = DocumentService()


document_service = DocumentService()
