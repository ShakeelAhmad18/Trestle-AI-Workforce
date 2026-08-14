"""Node 4: Human-in-the-Loop Review Node."""

from typing import Dict, Any
from langchain_core.messages import SystemMessage
from src.state import AgentState


def human_review_node(state: AgentState) -> Dict[str, Any]:
    """Human Review & Approval Node.
    
    Pauses execution at this breakpoint for the human supervisor to review
    the architecture spec.
    """
    approval = state.get("human_approval")
    feedback = state.get("human_feedback")
    
    if approval is True:
        return {
            "status": "running",
            "current_step": "developer",
            "messages": [SystemMessage(content="[HumanReview] Architecture approved by human supervisor. Proceeding to code generation.")],
        }
    elif approval is False:
        return {
            "status": "running",
            "current_step": "architect",
            "messages": [SystemMessage(content=f"[HumanReview] Architecture rejected with feedback: '{feedback}'. Returning to ArchitectAgent for revisions.")],
        }
    
    # Paused state waiting for input
    return {
        "status": "paused_for_approval",
        "current_step": "human_review",
        "messages": [SystemMessage(content="[HumanReview] Execution paused. Awaiting human approval or feedback.")],
    }
