"""Schemas for Code Generation, Codebase Manifests, and Test Execution."""

from typing import List, Dict, Optional
from pydantic import BaseModel, Field


class GeneratedFile(BaseModel):
    """Single generated file in the codebase."""
    filepath: str = Field(description="Relative path of the file (e.g. app/routers/auth.py)")
    content: str = Field(description="Complete executable code content for the file")
    description: str = Field(description="Brief summary of the file's role")


class CodebasePlan(BaseModel):
    """Plan for building the codebase files in dependency order."""
    files_to_generate: List[str] = Field(description="Ordered list of filepaths to generate")
    implementation_notes: str = Field(description="Special guidelines for testing, mocking, and dependencies")


class GeneratedCodebase(BaseModel):
    """Complete generated codebase bundle."""
    files: List[GeneratedFile] = Field(description="All generated source files and test files")


class TestExecutionResult(BaseModel):
    """Result of running tests in E2B Sandbox microVM."""
    __test__ = False
    
    passed: bool = Field(description="Whether all tests passed successfully (exit code 0)")
    exit_code: int = Field(default=0, description="Process exit code")
    stdout: str = Field(default="", description="Standard output from test runner")
    stderr: str = Field(default="", description="Standard error / traceback output from test runner")
    test_count: int = Field(default=0, description="Total number of tests executed")
    failed_count: int = Field(default=0, description="Number of failed tests")
    error_summary: Optional[str] = Field(default=None, description="Extracted actionable error summary for developer agent")
