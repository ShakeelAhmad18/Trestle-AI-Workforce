"""Agent State Definition for LangGraph StateGraph."""

from typing import Dict, List, Optional, Annotated, Any
from pydantic import BaseModel, Field
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

from src.schemas.research import MarketResearchReport
from src.schemas.architecture import SystemArchitecture
from src.schemas.developer import TestExecutionResult
from src.schemas.delivery import DeliveryInfo


class AgentState(BaseModel):
    """Complete State for the Enterprise Software Developer Agent Graph.
    
    Maintains workflow context across:
    1. Supervisor / Router
    2. Market Researcher Agent
    3. System Architect Agent
    4. Human Review & Approval Interrupt
    5. Clean Architecture Developer Agent
    6. E2B Sandbox Tester & Fix Loop
    7. PyGithub Delivery Agent
    """
    
    # Client input & conversation
    client_prompt: str = Field(default="", description="Client high-level business idea or requirements")
    messages: Annotated[List[BaseMessage], add_messages] = Field(default_factory=list, description="Chat/event message history")
    
    # Stage 1: Market Research
    research_report: Optional[MarketResearchReport] = Field(default=None, description="Market demand report")
    
    # Stage 2: System Architecture
    architecture_spec: Optional[SystemArchitecture] = Field(default=None, description="System architecture specification")
    
    # Stage 3: Human-in-the-Loop Review
    human_approval: Optional[bool] = Field(default=None, description="Human approval decision")
    human_feedback: Optional[str] = Field(default=None, description="Human requested revisions")
    
    # Stage 4: Code Generation
    generated_codebase: Dict[str, str] = Field(default_factory=dict, description="Generated application code files")
    test_suite: Dict[str, str] = Field(default_factory=dict, description="Generated Pytest test files")
    
    # Stage 5: E2B Sandbox Testing & Fix Loop
    test_results: Optional[TestExecutionResult] = Field(default=None, description="Latest test execution results")
    retry_count: int = Field(default=0, description="Number of test fix attempts executed")
    max_retries: int = Field(default=3, description="Maximum test fix attempts allowed")
    error_logs: List[str] = Field(default_factory=list, description="Historical test tracebacks")
    
    # Stage 6: Final Delivery
    delivery_info: Optional[DeliveryInfo] = Field(default=None, description="GitHub repository and handoff details")
    
    # Graph execution metadata
    current_step: str = Field(default="supervisor", description="Current workflow step")
    status: str = Field(default="running", description="Status: running, paused_for_approval, testing, fixing, delivered, failed")

    def __getitem__(self, item: str) -> Any:
        """Allow subscript read access."""
        return getattr(self, item)

    def __setitem__(self, key: str, value: Any) -> None:
        """Allow subscript write access."""
        setattr(self, key, value)

    def __contains__(self, item: str) -> bool:
        """Allow 'in' membership check."""
        return hasattr(self, item) and getattr(self, item) is not None

    def get(self, item: str, default: Any = None) -> Any:
        """Allow dict-style .get() access."""
        return getattr(self, item, default)

    def update(self, *args, **kwargs) -> None:
        """Allow dict-style .update() operations."""
        for k, v in dict(*args, **kwargs).items():
            setattr(self, k, v)


def create_initial_state(client_prompt: str, max_retries: int = 3) -> AgentState:
    """Helper to initialize a clean AgentState for a new client prompt."""
    return AgentState(
        client_prompt=client_prompt,
        messages=[],
        research_report=None,
        architecture_spec=None,
        human_approval=None,
        human_feedback=None,
        generated_codebase={},
        test_suite={},
        test_results=None,
        retry_count=0,
        max_retries=max_retries,
        error_logs=[],
        delivery_info=None,
        current_step="supervisor",
        status="running",
    )
