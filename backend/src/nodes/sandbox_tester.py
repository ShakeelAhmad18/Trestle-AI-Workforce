"""Node 6: SandboxTester (E2B) Node."""

import logging
from typing import Dict, Any
from langchain_core.messages import SystemMessage
from src.state import AgentState
from src.tools.sandbox_tools import execute_in_e2b_sandbox

logger = logging.getLogger(__name__)


def sandbox_tester_node(state: AgentState) -> Dict[str, Any]:
    """Executes the test suite in an isolated E2B microVM or isolated sandbox environment.
    
    Routes stdout/stderr and triggers the fix loop if errors occur.
    """
    retry_count = state.get("retry_count", 0)
    generated_codebase = state.get("generated_codebase", {})
    test_suite = state.get("test_suite", {})
    error_logs = list(state.get("error_logs", []))
    
    # Merge all codebase and test files
    all_files = {**generated_codebase, **test_suite}
    
    # Run in sandbox
    test_result = execute_in_e2b_sandbox(all_files)
    
    if test_result.passed:
        logger.info(f"Sandbox tests passed successfully! ({test_result.test_count} tests passed)")
        return {
            "test_results": test_result,
            "current_step": "delivery",
            "status": "passed",
            "messages": [
                SystemMessage(
                    content=f"[SandboxTester] ✔ All {test_result.test_count} tests PASSED with 0 errors in sandbox microVM."
                )
            ],
        }
    else:
        new_retry = retry_count + 1
        err_msg = test_result.error_summary or test_result.stderr or test_result.stdout
        error_logs.append(f"Retry {new_retry} error: {err_msg}")
        
        logger.warning(f"Sandbox tests failed ({test_result.failed_count} failures). Triggering fix loop {new_retry}...")
        
        return {
            "test_results": test_result,
            "retry_count": new_retry,
            "error_logs": error_logs,
            "current_step": "developer",
            "status": "fixing",
            "messages": [
                SystemMessage(
                    content=f"[SandboxTester] ✘ Tests FAILED (exit code {test_result.exit_code}). Routing stderr back to DeveloperAgent (Fix Attempt #{new_retry})."
                )
            ],
        }
