from pymongo import ASCENDING, MongoClient

from app.core.settings import get_settings


class MongoService:
  def __init__(self):
    self.settings = get_settings()
    self._client: MongoClient | None = None

  @property
  def client(self) -> MongoClient:
    if self._client is None:
      self._client = MongoClient(
        self.settings.mongo_uri,
        serverSelectionTimeoutMS=1500,
        uuidRepresentation="standard",
      )

    return self._client

  @property
  def database(self):
    return self.client[self.settings.mongo_db_name]

  @property
  def rooms(self):
    return self.database["rooms"]

  @property
  def documents(self):
    return self.database["documents"]

  @property
  def document_chunks(self):
    return self.database["document_chunks"]

  @property
  def retrieval_runs(self):
    return self.database["retrieval_runs"]

  @property
  def messages(self):
    return self.database["messages"]

  @property
  def agent_runs(self):
    return self.database["agent_runs"]

  def is_available(self) -> bool:
    try:
      self.client.admin.command("ping")
      return True
    except Exception:
      return False

  def ensure_indexes(self):
    self.rooms.create_index([("room_id", ASCENDING)], unique=True)
    self.documents.create_index([("document_id", ASCENDING)], unique=True)
    self.documents.create_index([("room_id", ASCENDING)])
    self.document_chunks.create_index([("chunk_id", ASCENDING)], unique=True)
    self.document_chunks.create_index([("room_id", ASCENDING)])
    self.document_chunks.create_index([("document_id", ASCENDING)])
    self.document_chunks.create_index([("vector_id", ASCENDING)], unique=True)
    self.retrieval_runs.create_index([("retrieval_run_id", ASCENDING)], unique=True)
    self.retrieval_runs.create_index([("room_id", ASCENDING)])
    self.messages.create_index([("message_id", ASCENDING)], unique=True)
    self.messages.create_index([("room_id", ASCENDING)])
    self.agent_runs.create_index([("agent_run_id", ASCENDING)], unique=True)
    self.agent_runs.create_index([("room_id", ASCENDING)])


mongo_service = MongoService()
