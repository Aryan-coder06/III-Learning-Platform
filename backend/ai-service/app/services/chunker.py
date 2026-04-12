import re
from collections.abc import Iterable


def normalize_text(text: str) -> str:
  return re.sub(r"\s+", " ", text).strip().lower()


class ParagraphChunker:
  def __init__(self, max_chars: int = 900, min_chars: int = 240):
    self.max_chars = max_chars
    self.min_chars = min_chars

  def chunk_pages(self, room_id: str, document_id: str, pages: Iterable[dict]) -> list[dict]:
    chunks: list[dict] = []
    chunk_index = 0

    for page in pages:
      raw_paragraphs = [
        re.sub(r"\s+", " ", paragraph).strip()
        for paragraph in re.split(r"\n\s*\n", page["text"])
        if paragraph and paragraph.strip()
      ]
      paragraphs: list[str] = []
      for paragraph in raw_paragraphs:
        paragraphs.extend(self._split_oversized_paragraph(paragraph))

      buffer = ""
      for paragraph in paragraphs:
        if not buffer:
          buffer = paragraph
          continue

        if len(buffer) + len(paragraph) + 1 <= self.max_chars:
          buffer = f"{buffer} {paragraph}"
          continue

        if len(buffer) >= self.min_chars:
          chunks.append(
            self._build_chunk(
              room_id=room_id,
              document_id=document_id,
              page_number=page["page_number"],
              chunk_index=chunk_index,
              text=buffer,
            )
          )
          chunk_index += 1
          buffer = paragraph
        else:
          buffer = f"{buffer} {paragraph}"

      if buffer:
        chunks.append(
          self._build_chunk(
            room_id=room_id,
            document_id=document_id,
            page_number=page["page_number"],
            chunk_index=chunk_index,
            text=buffer,
          )
        )
        chunk_index += 1

    return chunks

  def _build_chunk(
    self,
    room_id: str,
    document_id: str,
    page_number: int,
    chunk_index: int,
    text: str,
  ) -> dict:
    cleaned = re.sub(r"\s+", " ", text).strip()
    return {
      "chunk_id": f"chunk_{document_id}_{chunk_index:04d}",
      "document_id": document_id,
      "room_id": room_id,
      "page_number": page_number,
      "chunk_index": chunk_index,
      "text": cleaned,
      "normalized_text": normalize_text(cleaned),
    }

  def _split_oversized_paragraph(self, paragraph: str) -> list[str]:
    if len(paragraph) <= self.max_chars:
      return [paragraph]

    sentence_candidates = re.split(r"(?<=[.!?])\s+", paragraph)
    chunks: list[str] = []
    current = ""

    for sentence in sentence_candidates:
      sentence = sentence.strip()
      if not sentence:
        continue

      if not current:
        current = sentence
        continue

      if len(current) + len(sentence) + 1 <= self.max_chars:
        current = f"{current} {sentence}"
        continue

      chunks.append(current)
      current = sentence

    if current:
      chunks.append(current)

    if chunks and all(len(chunk) <= self.max_chars for chunk in chunks):
      return chunks

    # Fallback for long OCR/webpage blobs with poor sentence boundaries.
    fallback_chunks = []
    start = 0
    while start < len(paragraph):
      end = start + self.max_chars
      fallback_chunks.append(paragraph[start:end].strip())
      start = end

    return [chunk for chunk in fallback_chunks if chunk]


chunker = ParagraphChunker()
