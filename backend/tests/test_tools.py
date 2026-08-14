"""Tests for Research, Sandbox, and GitHub tools."""

import pytest
from src.tools.research_tools import search_marketplace_demand, search_tech_standards
from src.tools.sandbox_tools import parse_pytest_output, execute_in_e2b_sandbox
from src.tools.github_tools import create_and_push_github_repo


def test_research_tools_invocation():
    """Verifies that research tools execute without crashing even without API keys."""
    res1 = search_marketplace_demand.invoke({"query": "E-Commerce backend"})
    assert isinstance(res1, str)
    assert len(res1) > 0
    
    res2 = search_tech_standards.invoke({"domain": "Healthcare SaaS"})
    assert isinstance(res2, str)
    assert len(res2) > 0


def test_parse_pytest_output_success():
    """Verifies parsing of successful pytest output."""
    stdout = "test_main.py::test_one PASSED\ntest_main.py::test_two PASSED\n=== 2 passed in 0.12s ==="
    stderr = ""
    result = parse_pytest_output(stdout, stderr, exit_code=0)
    
    assert result.passed is True
    assert result.exit_code == 0
    assert result.test_count == 2
    assert result.failed_count == 0
    assert result.error_summary is None


def test_parse_pytest_output_failure():
    """Verifies parsing of failing pytest output."""
    stdout = "test_main.py::test_fail FAILED\n=== 1 failed, 1 passed in 0.15s ==="
    stderr = "AssertionError: assert 401 == 200"
    result = parse_pytest_output(stdout, stderr, exit_code=1)
    
    assert result.passed is False
    assert result.exit_code == 1
    assert result.test_count == 2
    assert result.failed_count == 1
    assert result.error_summary is not None


def test_github_tools_fallback_creation():
    """Verifies GitHub delivery tool generation."""
    files = {"app/main.py": "print('hello')", "requirements.txt": "fastapi"}
    readme = "# Test Readme"
    delivery = create_and_push_github_repo("test-repo", files, readme, is_private=True)
    
    assert delivery.repo_name == "test-repo"
    assert "github.com" in delivery.repo_url
    assert delivery.is_private is True
    assert len(delivery.files_delivered) >= 2
    assert "Subject:" in delivery.handoff_email
