class RoomContextBuilder:
  def build_context(self, query: str, results: list[dict]) -> str:
    if not results:
      return ""

    lines = [f"Query: {query}", "Grounded room context:"]
    for index, result in enumerate(results, start=1):
      lines.append(
        f"[{index}] {result['filename']} page {result['page_number']}: {result['text']}"
      )

    return "\n".join(lines)


room_context_builder = RoomContextBuilder()
