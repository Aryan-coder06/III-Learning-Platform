from typing import Annotated, Dict, List, TypedDict


def merge_results(left: List[Dict], right: List[Dict]) -> List[Dict]:
  return left + right


class RagGraphState(TypedDict):
  room_id: str
  query: str
  top_k: int
  requested_by: str
  recent_messages: List[Dict]

  dense_results: Annotated[List[Dict], merge_results]
  sparse_results: Annotated[List[Dict], merge_results]
  merged_results: List[Dict]

  context_documents: List[Dict]
  formatted_context: str
  query_intent: str

  answer: str
  sources: List[Dict]

  retrieval_run_id: str
  errors: List[str]
  status: str
