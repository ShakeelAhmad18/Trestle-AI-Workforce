"""Tests for AgentState creation and Pydantic schemas."""

import pytest
from src.state import create_initial_state, AgentState
from src.schemas.research import MarketResearchReport, FeatureRequirement
from src.schemas.architecture import SystemArchitecture, DatabaseSchema, OpenAPISpec
from src.schemas.developer import TestExecutionResult
from src.schemas.delivery import DeliveryInfo


def test_create_initial_state():
    prompt = "Create a real-time collaborative whiteboard backend."
    state = create_initial_state(client_prompt=prompt, max_retries=5)
    
    assert state["client_prompt"] == prompt
    assert state["retry_count"] == 0
    assert state["max_retries"] == 5
    assert state["messages"] == []
    assert state["research_report"] is None
    assert state["architecture_spec"] is None
    assert state["generated_codebase"] == {}
    assert state["status"] == "running"


def test_research_schema_validation():
    report = MarketResearchReport(
        project_domain="EdTech",
        target_audience="Teachers and Students",
        core_value_proposition="Automated grading and quiz management",
        demanded_features=[
            FeatureRequirement(
                name="Quiz Generator",
                priority="P0",
                description="AI-generated quiz questions from PDF uploads",
                market_demand_reason="High demand in marketplace posts",
                monetization_potential="Premium tier feature",
            )
        ],
        recommended_tech_stack_rationale="FastAPI + PostgreSQL",
    )
    
    assert report.project_domain == "EdTech"
    assert len(report.demanded_features) == 1
    assert report.demanded_features[0].priority == "P0"


def test_test_execution_result_schema():
    result = TestExecutionResult(
        passed=True,
        exit_code=0,
        stdout="5 passed in 0.42s",
        stderr="",
        test_count=5,
        failed_count=0,
    )
    
    assert result.passed is True
    assert result.exit_code == 0
    assert result.failed_count == 0
