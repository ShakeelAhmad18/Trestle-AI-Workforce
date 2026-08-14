"""Schemas for GitHub Repository Delivery and Handoff."""

from typing import List, Optional
from pydantic import BaseModel, Field


class DeliveryInfo(BaseModel):
    """Details of the deployed GitHub repository."""
    repo_name: str = Field(description="GitHub repository name")
    repo_url: str = Field(description="Full HTTPS URL to the GitHub repository")
    is_private: bool = Field(default=True, description="Whether the repository is private")
    commit_sha: Optional[str] = Field(default=None, description="Head commit SHA pushed to GitHub")
    files_delivered: List[str] = Field(default_factory=list, description="List of files committed")
    readme_content: str = Field(description="Generated README.md markdown")
    handoff_email: str = Field(description="Executive handoff email text for the client")


class HandoffSummary(BaseModel):
    """Summary of the delivery for CLI and report output."""
    project_name: str
    repo_url: str
    status: str
    features_delivered: List[str]
    test_summary: str
    handoff_message: str
