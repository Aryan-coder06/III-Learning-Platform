from langgraph.graph import StateGraph, END
from app.graph.state import RagGraphState
from app.graph.nodes.validate_request_node import validate_request_node
from app.graph.nodes.classify_query_intent_node import classify_query_intent_node
from app.graph.nodes.retrieve_nodes import dense_retrieve_node, sparse_retrieve_node
from app.graph.nodes.merge_rank_node import merge_and_rank_node
from app.graph.nodes.generate_answer_node import generate_grounded_answer_node
from app.graph.nodes.log_run_node import log_retrieval_run_node

def create_rag_graph():
    workflow = StateGraph(RagGraphState)

    # Add Nodes
    workflow.add_node("validate", validate_request_node)
    workflow.add_node("classify", classify_query_intent_node)
    workflow.add_node("dense_retrieve", dense_retrieve_node)
    workflow.add_node("sparse_retrieve", sparse_retrieve_node)
    workflow.add_node("merge_rank", merge_and_rank_node)
    workflow.add_node("generate", generate_grounded_answer_node)
    workflow.add_node("log", log_retrieval_run_node)

    # Build Edges
    workflow.set_entry_point("validate")
    
    workflow.add_edge("validate", "classify")
    workflow.add_edge("classify", "dense_retrieve")
    workflow.add_edge("classify", "sparse_retrieve")
    
    # Join parallel retrieval nodes to merge_rank
    workflow.add_edge("dense_retrieve", "merge_rank")
    workflow.add_edge("sparse_retrieve", "merge_rank")
    
    # Proceed to generation
    workflow.add_edge("merge_rank", "generate")
    
    # Log the results
    workflow.add_edge("generate", "log")
    
    # End
    workflow.add_edge("log", END)

    return workflow.compile()

rag_graph = create_rag_graph()
