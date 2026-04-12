import re
from typing import Dict

from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI

from app.core.logging import get_logger
from app.core.settings import get_settings
from app.graph.state import RagGraphState

logger = get_logger(__name__)


def _clean_text(text: str, max_length: int = 280) -> str:
  cleaned = re.sub(r"\s+", " ", text).strip()
  if len(cleaned) <= max_length:
    return cleaned
  return f"{cleaned[:max_length].strip()}..."


def _recent_chat_summary(recent_messages: list[dict]) -> str:
  if not recent_messages:
    return ""

  preview_lines = []
  for message in recent_messages[-4:]:
    sender = message.get("sender_name", "Room member")
    content = _clean_text(message.get("content", ""), 120)
    if content:
      preview_lines.append(f"- {sender}: {content}")

  return "\n".join(preview_lines)


def _deterministic_answer(state: RagGraphState, context_docs: list[dict]) -> str:
  query = state["query"].strip()
  intent = state.get("query_intent", "factual_lookup")
  room_hits = context_docs[:3]
  recent_chat = _recent_chat_summary(state.get("recent_messages", []))

  if not room_hits:
    return (
      "What I found in your room materials\n"
      "- I could not find enough indexed material in this room for that question yet.\n\n"
      "My explanation / guidance\n"
      "- Upload or finish indexing at least one room resource, then ask again.\n"
      "- If you were discussing something specific in chat, mention the topic more explicitly.\n\n"
      "What to try next\n"
      "- Upload a PDF or notes for this room.\n"
      "- Ask a narrower question tied to a topic, section, or page."
    )

  found_lines = [
    f"- {doc['metadata']['filename']} page {doc['metadata']['page_number']}: {_clean_text(doc['text'], 180)}"
    for doc in room_hits
  ]
  answer_lines = ["What I found in your room materials", *found_lines]

  if recent_chat:
    answer_lines.extend(["", "Recent room context", recent_chat])

  if intent == "summary":
    answer_lines.extend(
      [
        "",
        "My explanation / guidance",
        "- These passages point to the main themes the room materials currently emphasize.",
        "- Read the highlighted sections first, then align the examples or formulas that repeat across the sources.",
      ]
    )
  elif intent == "concept_explanation":
    answer_lines.extend(
      [
        "",
        "My explanation / guidance",
        f"- In simpler terms: the room materials describe {query.lower()} through the cited examples and definitions above.",
        "- Focus on the repeated terms, constraints, or cause-and-effect relationships across the top passages.",
      ]
    )
  elif intent == "guidance":
    answer_lines.extend(
      [
        "",
        "My explanation / guidance",
        "- The room materials give you enough context to decide the next study step or implementation direction.",
        "- Start from the highest-signal source above, extract the core rule or pattern, then test it against the examples you already discussed in the room.",
      ]
    )
  elif intent == "problem_solving":
    answer_lines.extend(
      [
        "",
        "My explanation / guidance",
        "- The room materials appear to provide the statement, constraints, and examples rather than a full editorial.",
        "- Use the constraints and repeated patterns in the retrieved passages to infer the solving direction before coding.",
        "- Break the problem into state transitions, invariants, or repeated move patterns, then validate them on the sample cases.",
      ]
    )
  else:
    answer_lines.extend(
      [
        "",
        "My explanation / guidance",
        "- The cited passages above are the strongest direct evidence available inside this room right now.",
        "- Use those lines as the factual basis for your answer or revision note.",
      ]
    )

  answer_lines.extend(
    [
      "",
      "What to try next",
      "- Open the cited pages and compare the terminology or examples directly.",
      "- If you need a tighter answer, ask about a specific page, formula, example, or constraint.",
    ]
  )

  return "\n".join(answer_lines)


def _llm_answer(state: RagGraphState, context_docs: list[dict]) -> str:
  settings = get_settings()
  llm = ChatGoogleGenerativeAI(
    model=settings.generation_model,
    google_api_key=settings.google_api_key,
    temperature=0.2,
  )

  formatted_context = "\n\n".join(
    [
      f"SOURCE: {doc['metadata']['filename']} (Page {doc['metadata']['page_number']})\nCONTENT: {doc['text']}"
      for doc in context_docs
    ]
  )
  recent_chat = _recent_chat_summary(state.get("recent_messages", []))

  prompt_template = ChatPromptTemplate.from_messages(
    [
      (
        "system",
        "You are StudySync AI, a grounded collaborative tutor inside a study room.\n"
        "Use room resources as primary evidence, recent chat as secondary context, and your own reasoning only after that.\n"
        "Do not invent document facts. If direct material is missing, say so clearly and still offer helpful next steps.\n"
        "Supported intents: factual_lookup, summary, concept_explanation, guidance, problem_solving.\n"
        "Respond with these sections when useful:\n"
        "1. What I found in your room materials\n"
        "2. My explanation / guidance\n"
        "3. What to try next\n"
        "Keep the answer student-friendly and precise.\n\n"
        "INTENT: {intent}\n"
        "RECENT ROOM CHAT:\n{recent_chat}\n\n"
        "ROOM CONTEXT:\n{context}"
      ),
      ("human", "QUESTION: {query}"),
    ]
  )

  chain = prompt_template | llm
  response = chain.invoke(
    {
      "intent": state.get("query_intent", "factual_lookup"),
      "recent_chat": recent_chat or "No recent chat context supplied.",
      "context": formatted_context,
      "query": state["query"],
    }
  )

  return response.content.strip()


def generate_grounded_answer_node(state: RagGraphState) -> Dict:
  if state.get("status") == "error":
    return {}

  context_docs = state.get("merged_results", [])[: state["top_k"]]
  sources = []
  for doc in context_docs:
    sources.append(
      {
        "chunk_id": doc["metadata"]["chunk_id"],
        "document_id": doc["metadata"]["document_id"],
        "filename": doc["metadata"]["filename"],
        "page_number": doc["metadata"]["page_number"],
        "text": doc["text"],
        "excerpt": _clean_text(doc["text"]),
        "dense_score": doc.get("dense_score", 0.0),
        "sparse_score": doc.get("sparse_score", 0.0),
        "final_score": doc.get("final_score", 0.0),
      }
    )

  settings = get_settings()
  if context_docs and settings.google_api_key:
    try:
      answer = _llm_answer(state, context_docs)
    except Exception as error:
      logger.warning("Falling back to deterministic answer writer: %s", error)
      answer = _deterministic_answer(state, context_docs)
  else:
    answer = _deterministic_answer(state, context_docs)

  return {
    "answer": answer,
    "sources": sources,
    "formatted_context": "\n\n".join(
      [
        f"{doc['metadata']['filename']} page {doc['metadata']['page_number']}: {_clean_text(doc['text'])}"
        for doc in context_docs
      ]
    ),
  }
