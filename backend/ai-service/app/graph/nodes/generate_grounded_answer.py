import google.generativeai as genai
from app.core.settings import get_settings

def generate_grounded_answer(query: str, results: list[dict]) -> str:
  settings = get_settings()
  
  if not results:
    return (
      "No grounded answer was found in this room yet. Upload and index a room PDF "
      "or refine the question."
    )

  if not settings.google_api_key:
    # Fallback to the snippet-based answer if no API key
    lines = ["[MOCK MODE] I found relevant passages in this room's indexed material:"]
    for index, result in enumerate(results[:3], start=1):
      excerpt = result["text"].replace("\n", " ").strip()
      if len(excerpt) > 240:
        excerpt = f"{excerpt[:240].strip()}..."
      lines.append(
        f"{index}. {excerpt} ({result['filename']}, page {result['page_number']})"
      )
    return "\n".join(lines)

  # Real Gemini generation
  genai.configure(api_key=settings.google_api_key)
  model = genai.GenerativeModel("gemini-1.5-flash")
  
  context_text = "\n\n".join([
    f"SOURCE: {r['filename']} (Page {r['page_number']})\nCONTENT: {r['text']}"
    for r in results
  ])

  prompt = f"""You are StudySync AI, a collaborative learning assistant.
Answer the student's question based ONLY on the provided room context.
If the answer is not in the context, say you don't know based on the current material.
Keep it professional, helpful, and grounded.

STUDENT QUESTION: {query}

ROOM CONTEXT:
{context_text}

GROUNDED ANSWER:"""

  try:
    response = model.generate_content(prompt)
    return response.text.strip()
  except Exception as e:
    return f"Error generating answer with Gemini: {str(e)}"
