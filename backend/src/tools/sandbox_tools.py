"""E2B Sandbox MicroVM Execution Tool for Pytest test runs."""

import os
import re
import logging
import tempfile
import subprocess
from typing import Dict
from src.config import settings
from src.schemas.developer import TestExecutionResult

logger = logging.getLogger(__name__)


def parse_pytest_output(stdout: str, stderr: str, exit_code: int) -> TestExecutionResult:
    """Parses pytest CLI output into a structured TestExecutionResult."""
    combined = stdout + "\n" + stderr
    
    # Regex to match pytest summary (e.g., '3 passed, 1 failed in 0.12s' or '5 passed in 0.45s')
    passed_match = re.search(r"(\d+)\s+passed", combined)
    failed_match = re.search(r"(\d+)\s+failed", combined)
    error_match = re.search(r"(\d+)\s+error", combined)
    
    passed_count = int(passed_match.group(1)) if passed_match else 0
    failed_count = int(failed_match.group(1)) if failed_match else 0
    error_count = int(error_match.group(1)) if error_match else 0
    total_tests = passed_count + failed_count + error_count
    
    is_success = (exit_code == 0) and (failed_count == 0) and (error_count == 0)
    
    # If exit_code != 0 but no failed count regex, it might be a syntax/collection error
    if exit_code != 0 and is_success:
        is_success = False
        
    error_summary = None
    if not is_success:
        # Extract the relevant error/traceback section
        if "FAILURES" in combined or "ERRORS" in combined or "Traceback" in combined:
            lines = combined.splitlines()
            error_lines = [line for line in lines if "FAILED" in line or "Error" in line or "assert" in line]
            error_summary = "\n".join(error_lines[:15]) if error_lines else stderr[:500]
        else:
            error_summary = stderr[:500] if stderr else stdout[:500]
            
    return TestExecutionResult(
        passed=is_success,
        exit_code=exit_code,
        stdout=stdout,
        stderr=stderr,
        test_count=total_tests if total_tests > 0 else (1 if is_success else 0),
        failed_count=failed_count + error_count,
        error_summary=error_summary,
    )


def execute_in_e2b_sandbox(
    files: Dict[str, str],
    timeout_seconds: int = 120,
) -> TestExecutionResult:
    """Executes the codebase and pytest test suite inside an isolated E2B Firecracker microVM.
    
    Args:
        files: Dictionary mapping relative file paths to file contents.
        timeout_seconds: Maximum time for the execution before timeout.
        
    Returns:
        Structured TestExecutionResult with stdout, stderr, and pass/fail metrics.
    """
    api_key = settings.e2b_api_key
    
    # 1. Real E2B Firecracker microVM execution if E2B_API_KEY is configured
    if api_key:
        try:
            from e2b_code_interpreter import Sandbox
            logger.info("Initializing E2B Sandbox microVM...")
            
            with Sandbox.create(api_key=api_key) as sandbox:
                # Write all files to the microVM filesystem
                for filepath, content in files.items():
                    # Ensure directory exists in sandbox
                    dirpath = os.path.dirname(filepath)
                    if dirpath:
                        sandbox.commands.run(f"mkdir -p '{dirpath}'")
                    sandbox.files.write(filepath, content)
                
                # Install dependencies
                sandbox.commands.run("pip install pytest httpx fastapi pydantic pydantic-settings sqlalchemy", timeout=90)
                
                # Execute Pytest
                test_exec = sandbox.commands.run("pytest tests/ -v", timeout=timeout_seconds)
                
                stdout = test_exec.stdout or ""
                stderr = test_exec.stderr or ""
                exit_code = test_exec.exit_code if test_exec.exit_code is not None else 0
                
                return parse_pytest_output(stdout, stderr, exit_code)
        except Exception as e:
            logger.error(f"E2B Sandbox execution failed: {e}. Falling back to local execution runner.")
    
    # 2. Local Isolated Runner Fallback (when E2B_API_KEY is omitted or for local testing)
    with tempfile.TemporaryDirectory() as temp_dir:
        for filepath, content in files.items():
            full_path = os.path.join(temp_dir, filepath)
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            with open(full_path, "w", encoding="utf-8") as f:
                f.write(content)
                
        try:
            import sys
            env = os.environ.copy()
            env["PYTHONPATH"] = temp_dir + os.pathsep + env.get("PYTHONPATH", "")
            cmd = [sys.executable, "-m", "pytest", "tests/", "-v"]
            result = subprocess.run(
                cmd,
                cwd=temp_dir,
                env=env,
                capture_output=True,
                text=True,
                timeout=timeout_seconds,
            )
            return parse_pytest_output(result.stdout, result.stderr, result.returncode)
        except subprocess.TimeoutExpired:
            return TestExecutionResult(
                passed=False,
                exit_code=124,
                stdout="",
                stderr="Execution timed out after {timeout_seconds} seconds.",
                test_count=0,
                failed_count=1,
                error_summary="TimeoutExpired: Test runner exceeded time limit.",
            )
        except Exception as e:
            return TestExecutionResult(
                passed=False,
                exit_code=1,
                stdout="",
                stderr=str(e),
                test_count=0,
                failed_count=1,
                error_summary=str(e),
            )
