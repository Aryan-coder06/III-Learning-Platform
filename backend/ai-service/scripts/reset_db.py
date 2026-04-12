import sys
import os
from pathlib import Path

# Add app directory to path so we can import mongo_service
sys.path.append(str(Path(__file__).resolve().parents[1]))

try:
    from app.db.mongo import mongo_service
    from app.core.logging import configure_logging
    configure_logging()
except ImportError:
    print("Error: Could not import app modules. Run this from the backend/ai-service directory.")
    sys.exit(1)

def reset_faulty_data():
    if not mongo_service.is_available():
        print("MongoDB is not available. check your connection.")
        return

    print("--- Starting Database Cleanup ---")
    
    # 1. Clear document chunks (where vector_id is null or causing issues)
    chunk_count = mongo_service.document_chunks.delete_many({}).deleted_count
    print(f"Deleted {chunk_count} document chunks.")

    # 2. Reset document statuses to pending/uploaded so they can be re-processed
    doc_result = mongo_service.documents.update_many(
        {},
        {
            "$set": {
                "processing_status": "uploaded",
                "index_status": "pending",
                "page_count": 0,
                "chunk_count": 0
            }
        }
    )
    print(f"Reset {doc_result.modified_count} documents to 'pending' status.")

    # 3. Drop faulty indexes if necessary (optional but safe)
    try:
        mongo_service.document_chunks.drop_index("vector_id_1")
        print("Dropped old vector_id index to allow regeneration.")
    except Exception:
        print("Index vector_id_1 did not exist or already dropped.")

    # 4. Re-ensure indexes
    mongo_service.ensure_indexes()
    print("Re-ensured correct MongoDB indexes.")

    print("--- Cleanup Complete ---")
    print("You can now re-trigger indexing from the UI.")

if __name__ == "__main__":
    reset_faulty_data()
