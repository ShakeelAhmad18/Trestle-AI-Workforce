"""Tests for individual agent nodes in isolation."""

import pytest
from src.state import create_initial_state
from src.nodes.supervisor import supervisor_node
from src.nodes.researcher import researcher_node
from src.nodes.architect import architect_node
from src.nodes.human_review import human_review_node
from src.nodes.developer import developer_node
from src.nodes.sandbox_tester import sandbox_tester_node
from src.nodes.delivery import delivery_node


def test_supervisor_node():
    state = create_initial_state(client_prompt="Build an AI meeting summarizer API")
    result = supervisor_node(state)
    assert result["current_step"] == "researcher"
    assert result["status"] == "running"
    assert len(result["messages"]) == 1


def test_researcher_node():
    state = create_initial_state(client_prompt="Build an AI meeting summarizer API")
    result = researcher_node(state)
    assert result["current_step"] == "architect"
    assert "research_report" in result
    assert len(result["research_report"].demanded_features) > 0


def test_architect_node_and_feedback():
    state = create_initial_state(client_prompt="Build an AI meeting summarizer API")
    research_res = researcher_node(state)
    state["research_report"] = research_res["research_report"]
    
    # 1. Standard architecture generation
    arch_res = architect_node(state)
    assert arch_res["current_step"] == "human_review"
    assert len(arch_res["architecture_spec"].database_schema.tables) >= 2
    
    # 2. Architecture with human feedback
    state["human_feedback"] = "Add a webhooks table and rate limit to 100/min."
    arch_res_feedback = architect_node(state)
    assert arch_res_feedback["architecture_spec"] is not None


def test_developer_and_sandbox_nodes():
    state = create_initial_state(client_prompt="Build an AI meeting summarizer API")
    arch_res = architect_node(state)
    state["architecture_spec"] = arch_res["architecture_spec"]
    
    # Developer generates codebase
    dev_res = developer_node(state)
    assert "app/main.py" in dev_res["generated_codebase"]
    assert "tests/test_health.py" in dev_res["test_suite"]
    
    # Sandbox executes tests
    state["generated_codebase"] = dev_res["generated_codebase"]
    state["test_suite"] = dev_res["test_suite"]
    test_res = sandbox_tester_node(state)
    
    assert test_res["test_results"].passed is True
    assert test_res["current_step"] == "delivery"


def test_delivery_node():
    state = create_initial_state(client_prompt="Build an AI meeting summarizer API")
    dev_res = developer_node(state)
    state["generated_codebase"] = dev_res["generated_codebase"]
    state["test_suite"] = dev_res["test_suite"]
    
    del_res = delivery_node(state)
    assert del_res["current_step"] == "completed"
    assert del_res["status"] == "delivered"
    assert del_res["delivery_info"].repo_name is not None
