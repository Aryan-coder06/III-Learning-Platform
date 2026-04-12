from typing import Dict
from app.graph.state import RagGraphState
from app.services.vector_store_service import vector_store_service
from app.services.bm25_store import bm25_store

def dense_retrieve_node(state: RagGraphState) -> Dict:
    """Run dense retrieval using FAISS."""
    if state.get("status") == "error":
        return {}
        
    results = vector_store_service.search(
        room_id=state["room_id"],
        query=state["query"],
        top_k=state["top_k"]
    )
    
    return {"dense_results": results}

def sparse_retrieve_node(state: RagGraphState) -> Dict:
    """Run sparse retrieval using BM25."""
    if state.get("status") == "error":
        return {}
        
    results = bm25_store.search(
        room_id=state["room_id"],
        query=state["query"],
        top_k=state["top_k"]
    )
    
    return {"sparse_results": results}
