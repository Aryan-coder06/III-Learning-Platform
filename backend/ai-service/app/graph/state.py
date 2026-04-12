from typing import Annotated, Dict, List, Optional, TypedDict

def merge_results(left: List[Dict], right: List[Dict]) -> List[Dict]:
    """Merge two lists of retrieval results."""
    return left + right

class RagGraphState(TypedDict):
    """The state of the RAG graph."""
    room_id: str
    query: str
    top_k: int
    
    dense_results: Annotated[List[Dict], merge_results]
    sparse_results: Annotated[List[Dict], merge_results]
    merged_results: List[Dict]
    
    context_documents: List[Dict]
    formatted_context: str
    
    answer: str
    sources: List[Dict]
    
    retrieval_run_id: str
    errors: List[str]
    status: str
