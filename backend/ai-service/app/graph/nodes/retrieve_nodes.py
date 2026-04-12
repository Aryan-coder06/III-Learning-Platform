from typing import Dict
from app.graph.state import RagGraphState
from app.services.retriever import retriever

def dense_retrieve_node(state: RagGraphState) -> Dict:
    """Run dense retrieval using room-scoped FAISS."""
    if state.get("status") == "error":
        return {}
        
    results = retriever.dense_retrieve(
        room_id=state["room_id"],
        query=state["query"],
        top_k=state["top_k"]
    )
    
    return {"dense_results": results}

def sparse_retrieve_node(state: RagGraphState) -> Dict:
    """Run sparse retrieval using room-scoped BM25."""
    if state.get("status") == "error":
        return {}
        
    results = retriever.sparse_retrieve(
        room_id=state["room_id"],
        query=state["query"],
        top_k=state["top_k"]
    )
    
    return {"sparse_results": results}
