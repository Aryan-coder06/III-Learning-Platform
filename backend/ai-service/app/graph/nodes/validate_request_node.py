from typing import Dict
from app.graph.state import RagGraphState

def validate_request_node(state: RagGraphState) -> Dict:
    """Validate the incoming RAG request."""
    errors = []
    if not state.get("room_id"):
        errors.append("Missing room_id")
    if not state.get("query") or len(state["query"]) < 3:
        errors.append("Invalid or too short query")
        
    return {
        "errors": errors,
        "status": "validated" if not errors else "error"
    }
