"""
Stage 1 FastAPI placeholder for future AI capabilities.
No AI endpoints are implemented yet.
"""

from fastapi import FastAPI

app = FastAPI(title="StudySync AI Service", version="0.1.0")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "reserved-for-future-ai"}
