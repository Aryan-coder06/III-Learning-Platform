from app.graph.nodes.generate_grounded_answer import generate_grounded_answer
from app.graph.state import RagGraphState
from app.services.room_context_builder import room_context_builder


class RoomRagFlow:
  def run(self, room_id: str, query: str, top_k: int, results: list[dict]) -> RagGraphState:
    context = room_context_builder.build_context(query, results)
    # Pass the query to the generation node
    answer = generate_grounded_answer(query, results)

    return {
      "room_id": room_id,
      "query": query,
      "top_k": top_k,
      "results": results,
      "context": context,
      "answer": answer,
    }


room_rag_flow = RoomRagFlow()
