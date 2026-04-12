from datetime import datetime, timezone
from uuid import uuid4

from fastapi import HTTPException

from app.db.mongo import mongo_service
from app.graph.rag_flow import room_rag_flow
from app.schemas.rag import RagQueryResponse
from app.services.retriever import retriever
from app.services.room_context_builder import room_context_builder
from app.services.room_service import room_service


class RoomRagAgent:
  def run(self, room_id: str, query: str, top_k: int) -> RagQueryResponse:
    room_service.get_room(room_id)
    results = retriever.query(room_id=room_id, query=query, top_k=top_k)
    state = room_rag_flow.run(room_id=room_id, query=query, top_k=top_k, results=results)

    retrieval_run = {
      "retrieval_run_id": f"retrieval_{uuid4().hex[:12]}",
      "room_id": room_id,
      "query": query,
      "top_k": top_k,
      "results": results,
      "created_at": datetime.now(timezone.utc),
    }
    agent_run = {
      "agent_run_id": f"agent_{uuid4().hex[:12]}",
      "room_id": room_id,
      "agent_type": "room_rag_answer",
      "input": {
        "query": query,
        "top_k": top_k,
        "context": room_context_builder.build_context(query, results),
      },
      "output": {
        "answer": state["answer"],
        "result_count": len(results),
      },
      "status": "completed",
      "created_at": datetime.now(timezone.utc),
    }

    if mongo_service.is_available():
      mongo_service.retrieval_runs.insert_one(retrieval_run)
      mongo_service.agent_runs.insert_one(agent_run)
    else:
      raise HTTPException(status_code=503, detail="MongoDB is unavailable.")

    return RagQueryResponse(
      room_id=room_id,
      query=query,
      results=results,
      answer=state["answer"],
    )


rag_agent = RoomRagAgent()
