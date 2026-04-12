from typing import Dict

from app.graph.state import RagGraphState


def classify_query_intent(query: str) -> str:
  normalized = query.strip().lower()

  if any(keyword in normalized for keyword in ["solve", "approach", "strategy", "codeforces", "problem", "constraints"]):
    return "problem_solving"
  if any(keyword in normalized for keyword in ["guide", "next step", "what should i do", "how do i", "how should i"]):
    return "guidance"
  if any(keyword in normalized for keyword in ["explain", "understand", "simply", "teach", "intuition"]):
    return "concept_explanation"
  if any(keyword in normalized for keyword in ["summarize", "summary", "key points", "overview", "brief"]):
    return "summary"
  return "factual_lookup"


def classify_query_intent_node(state: RagGraphState) -> Dict:
  if state.get("status") == "error":
    return {}

  return {
    "query_intent": classify_query_intent(state["query"]),
  }
