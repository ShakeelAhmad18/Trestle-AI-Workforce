"""Node 1: Supervisor / Router Node."""

from typing import Dict, Any
from langchain_core.messages import SystemMessage, HumanMessage
from src.state import AgentState


def supervisor_node(state: AgentState) -> Dict[str, Any]:
    """Supervises and validates the incoming client prompt, preparing state for research.
    
    Args:
        state: Current AgentState.
        
    Returns:
        Updated state dictionary with step progression and log messages.
    """
    client_prompt = state.get("client_prompt", "").strip()
    if not client_prompt:
        raise ValueError("Cannot execute workflow without a client_prompt in AgentState.")
        
    supervisor_msg = (
        f"[Supervisor] Initiating project workflow for prompt: '{client_prompt[:80]}...'. "
        "Routing task to ResearcherAgent for global market demand analysis."
    )
    
    return {
        "current_step": "researcher",
        "status": "running",
        "messages": [SystemMessage(content=supervisor_msg)],
    }
