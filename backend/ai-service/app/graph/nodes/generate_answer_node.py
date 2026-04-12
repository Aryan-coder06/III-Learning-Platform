from typing import Dict
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate

from app.graph.state import RagGraphState
from app.core.settings import get_settings

def generate_grounded_answer_node(state: RagGraphState) -> Dict:
    """Generate a grounded answer based on room context."""
    if state.get("status") == "error":
        return {}
        
    settings = get_settings()
    context_docs = state.get("context_documents", [])
    
    if not context_docs:
        return {
            "answer": "I could not find enough relevant information in this room's uploaded resources.",
            "sources": []
        }
        
    # Format context
    formatted_context = "\n\n".join([
        f"SOURCE: {doc['metadata']['filename']} (Page {doc['metadata']['page_number']})\nCONTENT: {doc['text']}"
        for doc in context_docs
    ])
    
    # LLM setup
    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        google_api_key=settings.google_api_key,
        temperature=0
    )
    
    prompt_template = ChatPromptTemplate.from_messages([
        ("system", "You are StudySync AI, a collaborative learning assistant. "
                   "Answer the student's question based ONLY on the provided room context. "
                   "If the answer is not in the context, say you don't know based on the current material. "
                   "Keep it professional, helpful, and grounded.\n\nROOM CONTEXT:\n{context}"),
        ("human", "STUDENT QUESTION: {query}")
    ])
    
    chain = prompt_template | llm
    
    try:
        response = chain.invoke({
            "context": formatted_context,
            "query": state["query"]
        })
        
        # Format sources
        sources = []
        for doc in context_docs:
            sources.append({
                "chunk_id": doc["metadata"]["chunk_id"],
                "document_id": doc["metadata"]["document_id"],
                "filename": doc["metadata"]["filename"],
                "page_number": doc["metadata"]["page_number"],
                "text": doc["text"],
                "dense_score": doc.get("dense_score", 0.0),
                "sparse_score": doc.get("sparse_score", 0.0),
                "final_score": doc.get("final_score", 0.0)
            })
            
        return {
            "answer": response.content.strip(),
            "sources": sources,
            "formatted_context": formatted_context
        }
    except Exception as e:
        return {
            "answer": f"Error generating answer: {str(e)}",
            "sources": []
        }
