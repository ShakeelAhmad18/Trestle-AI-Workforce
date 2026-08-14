"""LangGraph StateGraph Definition for Enterprise AI Developer Agent."""

from typing import Literal, Optional
from langgraph.graph import StateGraph, START, END
from langgraph.graph.state import CompiledStateGraph
from langgraph.checkpoint.memory import MemorySaver

from src.state import AgentState
from src.nodes.supervisor import supervisor_node
from src.nodes.researcher import researcher_node
from src.nodes.architect import architect_node
from src.nodes.human_review import human_review_node
from src.nodes.developer import developer_node
from src.nodes.sandbox_tester import sandbox_tester_node
from src.nodes.delivery import delivery_node


def route_human_review(state: AgentState) -> Literal["developer", "architect"]:
    """Conditional routing after human review."""
    approval = state.get("human_approval")
    if approval is True:
        return "developer"
    return "architect"


def route_sandbox_test(state: AgentState) -> Literal["delivery", "developer", "__end__"]:
    """Conditional routing based on E2B sandbox test results."""
    test_results = state.get("test_results")
    retry_count = state.get("retry_count", 0)
    max_retries = state.get("max_retries", 3)
    
    if test_results and test_results.passed:
        return "delivery"
    
    if retry_count < max_retries:
        return "developer"
        
    return "__end__"


def create_default_checkpointer() -> MemorySaver:
    """Creates a MemorySaver with registered custom Pydantic schemas for warning-free serialization."""
    from langgraph.checkpoint.serde.jsonplus import JsonPlusSerializer
    serde = JsonPlusSerializer(
        allowed_msgpack_modules=[
            ("src.state", "AgentState"),
            ("src.schemas.research", "MarketResearchReport"),
            ("src.schemas.architecture", "SystemArchitecture"),
            ("src.schemas.developer", "TestExecutionResult"),
            ("src.schemas.delivery", "DeliveryInfo"),
        ]
    )
    return MemorySaver(serde=serde)


def create_developer_agent_graph(checkpointer: Optional[MemorySaver] = None) -> CompiledStateGraph:
    """Builds and compiles the full multi-agent LangGraph workflow.
    
    Workflow Topology:
    [START] -> supervisor -> researcher -> architect -> human_review (interrupt)
                                               ^             |
                                               | (reject)    | (approved)
                                               +-------------+
                                                             |
                                                             v
                                             +--------> developer <-------+
                                             |              |             | (tests failed)
                                             |              v             |
                                             |       sandbox_tester ------+
                                             |              |
                                             |              | (tests passed)
                                             |              v
                                             +---------> delivery -> [END]
    """
    builder = StateGraph(AgentState)
    
    # 1. Register Nodes
    builder.add_node("supervisor", supervisor_node)
    builder.add_node("researcher", researcher_node)
    builder.add_node("architect", architect_node)
    builder.add_node("human_review", human_review_node)
    builder.add_node("developer", developer_node)
    builder.add_node("sandbox_tester", sandbox_tester_node)
    builder.add_node("delivery", delivery_node)
    
    # 2. Linear Edges
    builder.add_edge(START, "supervisor")
    builder.add_edge("supervisor", "researcher")
    builder.add_edge("researcher", "architect")
    builder.add_edge("architect", "human_review")
    
    # 3. Conditional Edge 1: Human Approval Checkpoint
    builder.add_conditional_edges(
        "human_review",
        route_human_review,
        {
            "developer": "developer",
            "architect": "architect",
        },
    )
    
    # 4. Developer -> Sandbox Tester
    builder.add_edge("developer", "sandbox_tester")
    
    # 5. Conditional Edge 2: Sandbox Pytest Execution & Self-Healing Fix Loop
    builder.add_conditional_edges(
        "sandbox_tester",
        route_sandbox_test,
        {
            "delivery": "delivery",
            "developer": "developer",
            "__end__": END,
        },
    )
    
    # 6. Delivery -> END
    builder.add_edge("delivery", END)
    
    # Compile with checkpointer and human-in-the-loop interrupt
    cp = checkpointer if checkpointer is not None else create_default_checkpointer()
    compiled_graph = builder.compile(
        checkpointer=cp,
        interrupt_before=["human_review"],
    )
    
    return compiled_graph
