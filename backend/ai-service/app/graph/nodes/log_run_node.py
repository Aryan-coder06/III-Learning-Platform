from datetime import datetime, timezone
from typing import Dict
from uuid import uuid4

from app.graph.state import RagGraphState
from app.db.mongo import mongo_service

def log_retrieval_run_node(state: RagGraphState) -> Dict:
    """Log the retrieval run to MongoDB."""
    run_id = f"run_{uuid4().hex[:12]}"
    
    record = {
        "retrieval_run_id": run_id,
        "room_id": state["room_id"],
        "query": state["query"],
        "answer": state.get("answer", ""),
        "sources": state.get("sources", []),
        "top_k": state["top_k"],
        "created_at": datetime.now(timezone.utc)
    }
    
    if mongo_service.is_available():
        mongo_service.retrieval_runs.insert_one(record)
        
    return {"retrieval_run_id": run_id}
