from typing import Dict
from app.graph.state import RagGraphState
from app.core.settings import get_settings

def merge_and_rank_node(state: RagGraphState) -> Dict:
    """Merge dense and sparse results using weighted RRF or similar."""
    if state.get("status") == "error":
        return {}
        
    settings = get_settings()
    dense_results = state.get("dense_results", [])
    sparse_results = state.get("sparse_results", [])
    
    # Simple hybrid merge: combine by chunk_id and weight scores
    chunk_map = {}
    
    # Process dense
    for res in dense_results:
        cid = res["metadata"]["chunk_id"]
        chunk_map[cid] = {
            **res,
            "sparse_score": 0.0,
            "final_score": res["dense_score"] * settings.dense_weight
        }
        
    # Process sparse
    for res in sparse_results:
        cid = res["metadata"]["chunk_id"]
        if cid in chunk_map:
            chunk_map[cid]["sparse_score"] = res["sparse_score"]
            chunk_map[cid]["final_score"] += res["sparse_score"] * settings.sparse_weight
        else:
            chunk_map[cid] = {
                **res,
                "dense_score": 0.0,
                "final_score": res["sparse_score"] * settings.sparse_weight
            }
            
    merged = list(chunk_map.values())
    merged.sort(key=lambda x: x["final_score"], reverse=True)
    
    top_merged = merged[:state["top_k"]]
    
    return {
        "merged_results": top_merged,
        "context_documents": top_merged
    }
