"""FastAPI Backend Server connecting LangGraph AI Developer Agent to the Frontend with smtplib Email Verification, MongoDB Multi-Session Persistence, Checkpoint Resumption, and ZIP Downloads."""

import os
import sys
import uuid
import logging
import io
import zipfile
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends, status
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, EmailStr

# Ensure src is importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.state import create_initial_state
from src.graph import create_developer_agent_graph, create_default_checkpointer
from src.database import db_manager
from src.auth.service import AuthService
from src.auth.dependencies import get_current_user, get_current_verified_user

logger = logging.getLogger("api_server")
logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes MongoDB and resources upon startup."""
    logger.info("Initializing Trestle AI Backend Server and MongoDB connection...")
    await db_manager.initialize()
    yield
    logger.info("Shutting down Trestle AI Backend Server...")


app = FastAPI(
    title="Trestle Enterprise AI Developer Agency API",
    version="1.0.0",
    description="Autonomous multi-agent software engineering studio API with smtplib email verification, MongoDB multi-session persistence, and verified-user model access.",
    lifespan=lifespan,
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory execution store & checkpointer
memory_checkpointer = create_default_checkpointer()
agent_graph = create_developer_agent_graph(checkpointer=memory_checkpointer)

# Active run sessions registry (in-memory cache)
ACTIVE_SESSIONS: Dict[str, Dict[str, Any]] = {}


# ==============================================================================
# SCHEMAS
# ==============================================================================

class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, description="Password (minimum 6 characters)")
    full_name: Optional[str] = Field(default="", description="User full name")


class UserVerifyRequest(BaseModel):
    email: EmailStr
    code: str = Field(min_length=6, max_length=6, description="6-digit email verification code")


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class ResendCodeRequest(BaseModel):
    email: EmailStr


class WorkflowStartRequest(BaseModel):
    prompt: str = Field(description="Client high-level software requirements or business idea")
    auto_approve: bool = Field(default=False, description="Whether to automatically approve architecture without pausing")
    max_retries: int = Field(default=3, description="Max self-healing test retry cycles")


class HumanApprovalRequest(BaseModel):
    approved: bool = Field(description="Whether the architecture was approved")
    feedback: Optional[str] = Field(default=None, description="Custom feedback for revisions if rejected")


class AgentProfile(BaseModel):
    id: str
    name: str
    role: str
    tagline: str
    avatar: str
    color: str
    model: str
    skills: List[str]
    description: str


AGENT_WORKFORCE: List[AgentProfile] = [
    AgentProfile(
        id="planner",
        name="Planner",
        role="PLANNER",
        tagline="Optimizes workflow & scoping.",
        avatar="/avatars/planner.png",
        color="#a855f7",
        model="Gemini 2.5 Flash",
        skills=["Workflow Routing", "Scope Decomposition", "Dependency Mapping"],
        description="Analyzes client business requirements, validates complexity, and orchestrates the multi-agent graph.",
    ),
    AgentProfile(
        id="orchestrator",
        name="Orchestrator",
        role="ORCHESTRATOR",
        tagline="Manages the swarm.",
        avatar="/avatars/orchestrator.png",
        color="#ec4899",
        model="Gemini 2.5 Flash",
        skills=["Agent State Management", "Routing Decisions", "Interrupt Control"],
        description="Coordinates data flow between market intelligence, architecture, and code synthesis agents.",
    ),
    AgentProfile(
        id="architect",
        name="Architect",
        role="ARCHITECT",
        tagline="Designs robust systems.",
        avatar="/avatars/architect.png",
        color="#3b82f6",
        model="Claude Sonnet 4.6",
        skills=["SQLAlchemy 2.0 ERD", "OpenAPI 3.1 Specs", "Clean Architecture"],
        description="Drafts database entity relationship schemas, REST endpoints, and security layers using strict Pydantic v2 schemas.",
    ),
    AgentProfile(
        id="coder",
        name="Coder",
        role="CODER",
        tagline="Writes production code.",
        avatar="/avatars/coder.png",
        color="#ff6b35",
        model="Claude Sonnet 4.6",
        skills=["FastAPI Clean Architecture", "Pydantic v2 Validation", "Pytest TestClient"],
        description="Generates modular Python backend code (Routers, Services, CRUD, Models) with 100% test coverage.",
    ),
    AgentProfile(
        id="sentry",
        name="Sentry",
        role="SENTRY",
        tagline="Protects the network.",
        avatar="/avatars/sentry.png",
        color="#06b6d4",
        model="Claude Sonnet 4.6",
        skills=["CORS Middleware", "PBKDF2-HMAC Auth", "Slowapi Rate Limiting"],
        description="Enforces enterprise zero-trust security controls, authentication tokens, and SQL injection prevention.",
    ),
    AgentProfile(
        id="researcher",
        name="Researcher",
        role="RESEARCHER",
        tagline="Gathers market intelligence.",
        avatar="/avatars/researcher.png",
        color="#10b981",
        model="Gemini 2.5 Flash",
        skills=["Tavily Search API", "Marketplace Feature Discovery", "Pricing Analysis"],
        description="Scrapes global marketplace demand patterns to identify features users actively pay for.",
    ),
    AgentProfile(
        id="tester",
        name="QA Tester",
        role="SANDBOX TESTER",
        tagline="Executes microVM tests.",
        avatar="/avatars/tester.png",
        color="#eab308",
        model="E2B Firecracker VM",
        skills=["E2B MicroVM Sandbox", "Pytest Runner", "Traceback Parser"],
        description="Runs test suites inside isolated Firecracker microVMs and routes failure logs back to the Coder agent in a self-healing loop.",
    ),
    AgentProfile(
        id="delivery",
        name="Delivery",
        role="DELIVERY AGENT",
        tagline="Ships to GitHub & Client.",
        avatar="/avatars/delivery.png",
        color="#f97316",
        model="PyGithub API",
        skills=["Private Repo Creation", "Commit Publishing", "Executive Handoff"],
        description="Packages verified code, pushes to a private GitHub repository, and generates an executive client handoff summary.",
    ),
]


# ==============================================================================
# WORKFLOW EXECUTION WORKER (SAVES TO MONGODB ON EVERY NODE STEP)
# ==============================================================================

async def persist_session_to_db(thread_id: str, session_data: Dict[str, Any]):
    """Persists workflow state snapshot into MongoDB asynchronously."""
    try:
        data_to_save = session_data.copy()
        data_to_save["thread_id"] = thread_id
        await db_manager.workflows.update_one(
            {"thread_id": thread_id},
            {"$set": data_to_save},
            upsert=True,
        )
    except Exception as e:
        logger.warning(f"[{thread_id}] Failed to persist session to MongoDB: {e}")


def sync_persist(thread_id: str, session_data: Dict[str, Any]):
    """Synchronous bridge to run async persistence in background worker."""
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            asyncio.create_task(persist_session_to_db(thread_id, session_data))
        else:
            loop.run_until_complete(persist_session_to_db(thread_id, session_data))
    except Exception:
        pass


import asyncio

def execute_workflow_sync(thread_id: str, prompt: str, auto_approve: bool, max_retries: int, user_email: str):
    """Executes the graph in a background thread, persisting state at every single node step."""
    config = {"configurable": {"thread_id": thread_id}}
    initial_state = create_initial_state(client_prompt=prompt, max_retries=max_retries)
    
    session_data = {
        "thread_id": thread_id,
        "user_email": user_email,
        "prompt": prompt,
        "auto_approve": auto_approve,
        "status": "running",
        "current_step": "supervisor",
        "events": [],
        "research_report": None,
        "architecture_spec": None,
        "generated_codebase": {},
        "test_suite": {},
        "test_results": None,
        "delivery_info": None,
        "error_logs": [],
        "retry_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    ACTIVE_SESSIONS[thread_id] = session_data
    sync_persist(thread_id, session_data)
    
    try:
        # Run until first interrupt (human_review)
        for event in agent_graph.stream(initial_state, config=config, stream_mode="updates"):
            for node_name, state_update in event.items():
                logger.info(f"[{thread_id}] Executed node: {node_name}")
                session_data["current_step"] = node_name
                session_data["events"].append({
                    "node": node_name,
                    "update": {k: v for k, v in state_update.items() if k != "messages"},
                })
                
                # Update accumulated state fields
                for key in ["research_report", "architecture_spec", "generated_codebase", "test_suite", "test_results", "delivery_info", "status", "retry_count"]:
                    if key in state_update:
                        session_data[key] = state_update[key]
                session_data["updated_at"] = datetime.now(timezone.utc).isoformat()
                sync_persist(thread_id, session_data)
                        
        snapshot = agent_graph.get_state(config)
        
        if snapshot.next and "human_review" in snapshot.next:
            if auto_approve:
                logger.info(f"[{thread_id}] Auto-approving architecture...")
                agent_graph.update_state(config, {"human_approval": True, "human_feedback": None})
                
                # Resume execution
                for event in agent_graph.stream(None, config=config, stream_mode="updates"):
                    for node_name, state_update in event.items():
                        session_data["current_step"] = node_name
                        session_data["events"].append({
                            "node": node_name,
                            "update": {k: v for k, v in state_update.items() if k != "messages"},
                        })
                        for key in ["research_report", "architecture_spec", "generated_codebase", "test_suite", "test_results", "delivery_info", "status", "retry_count"]:
                            if key in state_update:
                                session_data[key] = state_update[key]
                        session_data["updated_at"] = datetime.now(timezone.utc).isoformat()
                        sync_persist(thread_id, session_data)
                                
                final_snapshot = agent_graph.get_state(config)
                session_data["status"] = final_snapshot.values.get("status", "delivered")
                session_data["delivery_info"] = final_snapshot.values.get("delivery_info")
                session_data["test_results"] = final_snapshot.values.get("test_results")
                session_data["generated_codebase"] = final_snapshot.values.get("generated_codebase", {})
                session_data["test_suite"] = final_snapshot.values.get("test_suite", {})
            else:
                session_data["status"] = "paused_for_approval"
                session_data["architecture_spec"] = snapshot.values.get("architecture_spec")
        else:
            final_snapshot = agent_graph.get_state(config)
            session_data["status"] = final_snapshot.values.get("status", "completed")
            session_data["delivery_info"] = final_snapshot.values.get("delivery_info")
            session_data["test_results"] = final_snapshot.values.get("test_results")
            session_data["generated_codebase"] = final_snapshot.values.get("generated_codebase", {})
            session_data["test_suite"] = final_snapshot.values.get("test_suite", {})
    except Exception as e:
        logger.error(f"[{thread_id}] Workflow failed: {e}", exc_info=True)
        session_data["status"] = "failed"
        session_data["error"] = str(e)
    finally:
        session_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        sync_persist(thread_id, session_data)


# ==============================================================================
# AUTHENTICATION ENDPOINTS (smtplib & MongoDB)
# ==============================================================================

@app.post("/api/auth/register")
async def register_user(req: UserRegisterRequest):
    """Registers new user account and dispatches 6-digit verification code via smtplib."""
    try:
        result = await AuthService.register_user(
            email=req.email,
            password=req.password,
            full_name=req.full_name or "",
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/auth/verify-email")
async def verify_email(req: UserVerifyRequest):
    """Verifies 6-digit email code sent via smtplib and activates account with JWT token."""
    try:
        result = await AuthService.verify_user_email(
            email=req.email,
            code=req.code,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/auth/login")
async def login_user(req: UserLoginRequest):
    """Authenticates credentials. Only verified users receive an active JWT token."""
    try:
        result = await AuthService.authenticate_user(
            email=req.email,
            password=req.password,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@app.post("/api/auth/resend-code")
async def resend_verification_code(req: ResendCodeRequest):
    """Resends a fresh 6-digit verification code to the user's email via smtplib."""
    try:
        result = await AuthService.resend_verification_code(email=req.email)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/auth/me")
async def get_me(user: Dict[str, Any] = Depends(get_current_user)):
    """Returns current authenticated user profile and verification status."""
    return {
        "email": user.get("email"),
        "full_name": user.get("full_name", ""),
        "is_verified": user.get("is_verified", False),
        "created_at": user.get("created_at"),
        "last_login": user.get("last_login"),
    }


# ==============================================================================
# GENERAL & AGENT ROSTER ENDPOINTS (Public)
# ==============================================================================

@app.get("/api/health")
def health_check():
    """Health status endpoint."""
    return {
        "status": "healthy",
        "service": "trestle-agent-api",
        "version": "1.0.0",
        "mongodb": "connected" if db_manager.is_connected else "in-memory-fallback",
    }


@app.get("/api/agents", response_model=List[AgentProfile])
def get_agents():
    """Returns the full autonomous agent workforce roster."""
    return AGENT_WORKFORCE


# ==============================================================================
# PROJECT SESSIONS & HISTORY (MongoDB Persistence)
# ==============================================================================

@app.get("/api/workflows/history")
async def get_workflow_history(current_user: Dict[str, Any] = Depends(get_current_verified_user)):
    """Returns all past project sessions created by the verified user."""
    user_email = current_user["email"]
    cursor = db_manager.workflows.find({"user_email": user_email}).sort("created_at", -1)
    sessions = await cursor.to_list(length=100)
    
    history_items = []
    for s in sessions:
        codebase = s.get("generated_codebase") or {}
        test_results = s.get("test_results") or {}
        history_items.append({
            "thread_id": s.get("thread_id"),
            "prompt": s.get("prompt"),
            "status": s.get("status"),
            "current_step": s.get("current_step"),
            "file_count": len(codebase),
            "test_passed": test_results.get("passed", False),
            "created_at": s.get("created_at"),
            "updated_at": s.get("updated_at"),
            "has_delivery": s.get("delivery_info") is not None,
        })
    return history_items


@app.get("/api/workflow/{thread_id}/download-zip")
async def download_project_zip(
    thread_id: str,
    current_user: Dict[str, Any] = Depends(get_current_verified_user),
):
    """Generates an in-memory ZIP archive of all Clean Architecture files and streams it."""
    session = ACTIVE_SESSIONS.get(thread_id)
    if not session:
        session = await db_manager.workflows.find_one({"thread_id": thread_id})
    if not session:
        raise HTTPException(status_code=404, detail="Workflow project session not found.")
        
    codebase: Dict[str, str] = session.get("generated_codebase") or {}
    test_suite: Dict[str, str] = session.get("test_suite") or {}
    research: Optional[Dict[str, Any]] = session.get("research_report")
    architecture: Optional[Dict[str, Any]] = session.get("architecture_spec")

    if not codebase and not test_suite:
        raise HTTPException(status_code=400, detail="No generated codebase found for this session yet.")

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        # Write codebase files
        for filepath, content in codebase.items():
            clean_path = filepath.lstrip("/\\")
            zf.writestr(clean_path, content)

        # Write test suite files
        for filepath, content in test_suite.items():
            clean_path = filepath.lstrip("/\\")
            zf.writestr(clean_path, content)

        # Add requirements.txt if not present
        if "requirements.txt" not in codebase:
            req_content = "fastapi>=0.110.0\nuvicorn>=0.28.0\nsqlalchemy>=2.0.28\npydantic>=2.7.0\npytest>=8.0.0\nhttpx>=0.27.0\n"
            zf.writestr("requirements.txt", req_content)

        # Add README.md with executive handoff summary
        project_title = (architecture.get("database_schema", {}).get("project_name") if architecture else "Autonomous Generated Project") or "Trestle Project"
        readme_content = f"# {project_title}\n\nGenerated autonomously by **Trestle Enterprise AI Agent Studio**.\n\n## Client Requirements\n> {session.get('prompt')}\n\n## Quickstart\n```bash\npip install -r requirements.txt\nuvicorn app.main:app --reload\n```\n\n## Run Tests\n```bash\npytest tests/ -v\n```\n"
        zf.writestr("README.md", readme_content)

    zip_buffer.seek(0)
    filename = f"trestle-project-{thread_id[:8]}.zip"
    
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


# ==============================================================================
# PROTECTED AGENT WORKFLOW ENDPOINTS (Verified Users Only)
# ==============================================================================

@app.post("/api/workflow/start")
def start_workflow(
    req: WorkflowStartRequest,
    background_tasks: BackgroundTasks,
    current_user: Dict[str, Any] = Depends(get_current_verified_user),
):
    """Starts a new agent workflow execution session (Gated to verified users)."""
    thread_id = str(uuid.uuid4())
    user_email = current_user["email"]
    logger.info(f"Verified user {user_email} starting workflow session {thread_id} for prompt: {req.prompt[:60]}...")
    
    background_tasks.add_task(
        execute_workflow_sync,
        thread_id=thread_id,
        prompt=req.prompt,
        auto_approve=req.auto_approve,
        max_retries=req.max_retries,
        user_email=user_email,
    )
    
    return {
        "thread_id": thread_id,
        "status": "initiated",
        "message": "Workflow started in background for verified user.",
    }


@app.get("/api/workflow/{thread_id}")
async def get_workflow_status(
    thread_id: str,
    current_user: Dict[str, Any] = Depends(get_current_verified_user),
):
    """Retrieves execution status, architecture, code files, and test results from memory or MongoDB."""
    session = ACTIVE_SESSIONS.get(thread_id)
    if not session:
        session = await db_manager.workflows.find_one({"thread_id": thread_id})
        if session:
            ACTIVE_SESSIONS[thread_id] = session
    if not session:
        raise HTTPException(status_code=404, detail="Workflow session not found.")
    return session


@app.post("/api/workflow/{thread_id}/resume")
async def resume_interrupted_workflow(
    thread_id: str,
    background_tasks: BackgroundTasks,
    current_user: Dict[str, Any] = Depends(get_current_verified_user),
):
    """Resumes an interrupted or paused workflow session from its last checkpoint position."""
    session = ACTIVE_SESSIONS.get(thread_id)
    if not session:
        session = await db_manager.workflows.find_one({"thread_id": thread_id})
        if session:
            ACTIVE_SESSIONS[thread_id] = session
    if not session:
        raise HTTPException(status_code=404, detail="Workflow session not found.")
        
    config = {"configurable": {"thread_id": thread_id}}
    session["status"] = "running"
    
    def resume_stream_sync(target_session: Dict[str, Any]):
        try:
            for event in agent_graph.stream(None, config=config, stream_mode="updates"):
                for node_name, state_update in event.items():
                    logger.info(f"[{thread_id}] Resumed node execution: {node_name}")
                    target_session["current_step"] = node_name
                    target_session["events"].append({
                        "node": node_name,
                        "update": {k: v for k, v in state_update.items() if k != "messages"},
                    })
                    for key in ["research_report", "architecture_spec", "generated_codebase", "test_suite", "test_results", "delivery_info", "status", "retry_count"]:
                        if key in state_update:
                            target_session[key] = state_update[key]
                    target_session["updated_at"] = datetime.now(timezone.utc).isoformat()
                    sync_persist(thread_id, target_session)
                            
            snapshot = agent_graph.get_state(config)
            if snapshot.next and "human_review" in snapshot.next:
                target_session["status"] = "paused_for_approval"
                target_session["architecture_spec"] = snapshot.values.get("architecture_spec")
            else:
                final_snapshot = agent_graph.get_state(config)
                target_session["status"] = final_snapshot.values.get("status", "delivered")
                target_session["delivery_info"] = final_snapshot.values.get("delivery_info")
                target_session["test_results"] = final_snapshot.values.get("test_results")
                target_session["generated_codebase"] = final_snapshot.values.get("generated_codebase", {})
                target_session["test_suite"] = final_snapshot.values.get("test_suite", {})
        except Exception as e:
            logger.error(f"[{thread_id}] Resumption failed: {e}", exc_info=True)
            target_session["status"] = "failed"
            target_session["error"] = str(e)
        finally:
            target_session["updated_at"] = datetime.now(timezone.utc).isoformat()
            sync_persist(thread_id, target_session)
            
    background_tasks.add_task(resume_stream_sync, target_session=session)
    return {"thread_id": thread_id, "status": "resumed", "message": "Resuming workflow from exact checkpoint position."}


@app.post("/api/workflow/{thread_id}/approval")
def submit_human_approval(
    thread_id: str,
    req: HumanApprovalRequest,
    background_tasks: BackgroundTasks,
    current_user: Dict[str, Any] = Depends(get_current_verified_user),
):
    """Submits human approval or revision feedback to resume paused workflow (Gated to verified users)."""
    session = ACTIVE_SESSIONS.get(thread_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Workflow session not found.")
        
    config = {"configurable": {"thread_id": thread_id}}
    
    if req.approved:
        logger.info(f"[{thread_id}] Verified user {current_user['email']} APPROVED architecture.")
        agent_graph.update_state(config, {"human_approval": True, "human_feedback": None})
    else:
        logger.info(f"[{thread_id}] Verified user {current_user['email']} REQUESTED REVISIONS: {req.feedback}")
        agent_graph.update_state(config, {"human_approval": False, "human_feedback": req.feedback})
        
    session["status"] = "running"
    
    def resume_graph_sync(target_session: Dict[str, Any]):
        try:
            for event in agent_graph.stream(None, config=config, stream_mode="updates"):
                for node_name, state_update in event.items():
                    target_session["current_step"] = node_name
                    target_session["events"].append({
                        "node": node_name,
                        "update": {k: v for k, v in state_update.items() if k != "messages"},
                    })
                    for key in ["research_report", "architecture_spec", "generated_codebase", "test_suite", "test_results", "delivery_info", "status", "retry_count"]:
                        if key in state_update:
                            target_session[key] = state_update[key]
                    target_session["updated_at"] = datetime.now(timezone.utc).isoformat()
                    sync_persist(thread_id, target_session)
                            
            snapshot = agent_graph.get_state(config)
            if snapshot.next and "human_review" in snapshot.next:
                target_session["status"] = "paused_for_approval"
                target_session["architecture_spec"] = snapshot.values.get("architecture_spec")
            else:
                final_snapshot = agent_graph.get_state(config)
                target_session["status"] = final_snapshot.values.get("status", "delivered")
                target_session["delivery_info"] = final_snapshot.values.get("delivery_info")
                target_session["test_results"] = final_snapshot.values.get("test_results")
                target_session["generated_codebase"] = final_snapshot.values.get("generated_codebase", {})
                target_session["test_suite"] = final_snapshot.values.get("test_suite", {})
        except Exception as e:
            logger.error(f"[{thread_id}] Resumption failed: {e}", exc_info=True)
            target_session["status"] = "failed"
            target_session["error"] = str(e)
        finally:
            target_session["updated_at"] = datetime.now(timezone.utc).isoformat()
            sync_persist(thread_id, target_session)
            
    background_tasks.add_task(resume_graph_sync, target_session=session)
    
    return {
        "thread_id": thread_id,
        "status": "resumed",
        "approved": req.approved,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
