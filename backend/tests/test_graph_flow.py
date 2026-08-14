"""Tests for LangGraph StateGraph assembly, human-in-the-loop, and self-healing fix loop."""

import pytest
from langgraph.checkpoint.memory import MemorySaver
from src.state import create_initial_state
from src.graph import create_developer_agent_graph, create_default_checkpointer
from src.schemas.developer import TestExecutionResult


def test_graph_compilation():
    """Verifies that the LangGraph StateGraph compiles cleanly."""
    memory = create_default_checkpointer()
    graph = create_developer_agent_graph(checkpointer=memory)
    assert graph is not None


def test_graph_human_approval_flow():
    """Tests the full multi-agent flow when human approves architecture."""
    memory = create_default_checkpointer()
    graph = create_developer_agent_graph(checkpointer=memory)
    
    config = {"configurable": {"thread_id": "test-thread-approval"}}
    initial_state = create_initial_state(client_prompt="Build an IoT telemetry backend")
    
    # 1. Run until human_review interrupt
    events = list(graph.stream(initial_state, config=config, stream_mode="updates"))
    assert len(events) > 0
    
    state_snapshot = graph.get_state(config)
    assert "human_review" in state_snapshot.next
    assert state_snapshot.values["architecture_spec"] is not None
    
    # 2. Provide Human Approval
    graph.update_state(config, {"human_approval": True, "human_feedback": None})
    
    # 3. Resume graph execution to completion
    resume_events = list(graph.stream(None, config=config, stream_mode="updates"))
    assert len(resume_events) > 0
    
    final_state = graph.get_state(config)
    assert final_state.values["status"] == "delivered"
    assert final_state.values["delivery_info"] is not None
    assert "iot-telemetry-backend" in final_state.values["delivery_info"].repo_name


def test_graph_human_rejection_and_revision_flow():
    """Tests human requesting architectural revisions, looping back to architect, then approving."""
    memory = create_default_checkpointer()
    graph = create_developer_agent_graph(checkpointer=memory)
    
    config = {"configurable": {"thread_id": "test-thread-rejection"}}
    initial_state = create_initial_state(client_prompt="Build a video transcoding service")
    
    # 1. Run until interrupt
    list(graph.stream(initial_state, config=config, stream_mode="updates"))
    
    # 2. Reject with feedback
    graph.update_state(config, {
        "human_approval": False,
        "human_feedback": "Please add a webhook_url field and job status queue.",
    })
    
    # 3. Resume -> Loops to architect, then hits human_review again
    list(graph.stream(None, config=config, stream_mode="updates"))
    
    revised_snapshot = graph.get_state(config)
    assert "human_review" in revised_snapshot.next
    
    # 4. Now approve the revised architecture
    graph.update_state(config, {"human_approval": True, "human_feedback": None})
    list(graph.stream(None, config=config, stream_mode="updates"))
    
    final_state = graph.get_state(config)
    assert final_state.values["status"] == "delivered"
