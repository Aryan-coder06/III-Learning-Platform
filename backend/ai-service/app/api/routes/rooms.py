from fastapi import APIRouter, File, Form, UploadFile, BackgroundTasks

from app.schemas.document import DocumentRecord
from app.schemas.rag import RagQueryRequest, RagQueryResponse
from app.schemas.room import CreatePrivateRoomRequest, RoomRecord
from app.services.document_service import document_service
from app.graph.rag_graph import rag_graph
from app.services.room_service import room_service

router = APIRouter(prefix="/api/rooms", tags=["rooms"])


@router.post("/private", response_model=RoomRecord)
def create_private_room(payload: CreatePrivateRoomRequest):
  return room_service.create_private_room(payload)


@router.post("/private/sync", response_model=RoomRecord)
def sync_private_room(payload: CreatePrivateRoomRequest):
  return room_service.create_private_room(payload)


@router.get("", response_model=list[RoomRecord])
def list_rooms():
  return room_service.list_rooms()


@router.get("/{room_id}", response_model=RoomRecord)
def get_room_detail(room_id: str):
  return room_service.get_room(room_id)


@router.post("/{room_id}/documents/upload", response_model=DocumentRecord)
def upload_room_document(
  room_id: str,
  file: UploadFile = File(...),
  uploaded_by: str = Form(...),
):
  # Keep the existing upload logic
  return document_service.upload_document(
    room_id=room_id,
    upload=file,
    uploaded_by=uploaded_by,
  )


@router.post("/{room_id}/documents/sync", response_model=DocumentRecord)
def sync_document(room_id: str, payload: DocumentRecord):
  return document_service.sync_document(room_id, payload)


@router.post("/{room_id}/documents/{document_id}/process", response_model=DocumentRecord)
def process_room_document(room_id: str, document_id: str, background_tasks: BackgroundTasks):
  document = document_service._get_document(room_id, document_id)
  background_tasks.add_task(document_service.process_document, room_id, document_id)

  return {
    **document,
    "processing_status": "processing",
    "index_status": "processing",
  }


@router.get("/{room_id}/documents", response_model=list[DocumentRecord])
def list_room_documents(room_id: str):
  return document_service.list_room_documents(room_id)


@router.post("/{room_id}/rag/query", response_model=RagQueryResponse)
def query_room_knowledge(room_id: str, payload: RagQueryRequest):
  initial_state = {
      "room_id": room_id,
      "query": payload.query,
      "top_k": payload.top_k,
      "requested_by": payload.requested_by,
      "recent_messages": payload.recent_messages,
      "dense_results": [],
      "sparse_results": [],
      "merged_results": [],
      "context_documents": [],
      "formatted_context": "",
      "answer": "",
      "sources": [],
      "query_intent": "",
      "retrieval_run_id": "",
      "errors": []
  }
  
  final_state = rag_graph.invoke(initial_state)
  
  if final_state.get("status") == "error":
      from fastapi import HTTPException
      raise HTTPException(status_code=400, detail=", ".join(final_state["errors"]))
  
  return RagQueryResponse(
    room_id=room_id,
    query=payload.query,
    results=final_state.get("sources", []),
    answer=final_state.get("answer", ""),
    intent=final_state.get("query_intent", ""),
    retrieval_run_id=final_state.get("retrieval_run_id", "")
  )
