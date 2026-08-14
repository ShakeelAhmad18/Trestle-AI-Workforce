"""Node 3: ArchitectAgent Node with Structured Architecture Output."""

import logging
from typing import Dict, Any
from langchain_core.messages import SystemMessage, HumanMessage
from src.state import AgentState
from src.config import get_architect_llm, settings
from src.schemas.architecture import (
    SystemArchitecture,
    DatabaseSchema,
    TableDefinition,
    ColumnDefinition,
    OpenAPISpec,
    APIEndpoint,
)

logger = logging.getLogger(__name__)


def architect_node(state: AgentState) -> Dict[str, Any]:
    """Generates Database Schema, OpenAPI Specification, and System Architecture."""
    client_prompt = state["client_prompt"]
    research = state.get("research_report")
    human_feedback = state.get("human_feedback")
    
    # 1. Try LLM structured output if API keys are present
    if settings.anthropic_api_key or settings.google_api_key:
        try:
            llm = get_architect_llm()
            structured_llm = llm.with_structured_output(SystemArchitecture)
            
            research_summary = ""
            if research:
                features_str = "\n".join([f"- {f.name} ({f.priority}): {f.description}" for f in research.demanded_features])
                research_summary = (
                    f"Domain: {research.project_domain}\n"
                    f"Target Audience: {research.target_audience}\n"
                    f"Demanded Features:\n{features_str}\n"
                )
                
            prompt = (
                f"You are an Elite Principal AI Systems Architect.\n"
                f"Client Prompt: '{client_prompt}'\n\n"
                f"Market Research:\n{research_summary}\n\n"
            )
            
            if human_feedback:
                prompt += f"IMPORTANT - HUMAN FEEDBACK REVISION REQUIRED:\n'{human_feedback}'\nPlease adjust the architecture, schema, or endpoints according to this feedback.\n\n"
                
            prompt += (
                "Design a complete, production-grade SystemArchitecture specification with:\n"
                "1. Database Schema with detailed TableDefinitions (users table, domain entity tables, types, PKs, FKs, indexes).\n"
                "2. OpenAPI Specification with REST endpoints (auth, CRUD, filtering, health check, status codes, auth required).\n"
                "3. Clean Architecture layers (routers -> services -> crud/models -> core).\n"
                "4. Enterprise security controls (CORS, bcrypt, JWT, Rate Limiting).\n"
                "5. Complete list of relative filepaths for the directory structure."
            )
            
            arch = structured_llm.invoke([
                SystemMessage(content="You are a Principal Software Architect who designs robust, clean, scalable backends."),
                HumanMessage(content=prompt),
            ])
            
            if isinstance(arch, SystemArchitecture):
                return {
                    "architecture_spec": arch,
                    "current_step": "human_review",
                    "messages": [
                        SystemMessage(
                            content=f"[ArchitectAgent] Designed system architecture for '{arch.project_name}' with {len(arch.database_schema.tables)} tables and {len(arch.api_specification.endpoints)} endpoints."
                        )
                    ],
                }
        except Exception as e:
            logger.warning(f"LLM architecture generation failed ({e}). Using deterministic fallback architecture.")
            
    # Deterministic high-quality fallback
    project_slug = client_prompt.lower().replace(" ", "-")[:30].strip("-") or "enterprise-service"
    
    arch = SystemArchitecture(
        project_name=f"{project_slug}-api",
        tagline=f"High-Performance Enterprise Backend for {client_prompt[:60]}",
        database_schema=DatabaseSchema(
            database_engine="PostgreSQL (or SQLite for local test)",
            orm="SQLAlchemy 2.0",
            tables=[
                TableDefinition(
                    table_name="users",
                    description="User accounts and authentication credentials",
                    columns=[
                        ColumnDefinition(name="id", data_type="Integer", primary_key=True, nullable=False),
                        ColumnDefinition(name="email", data_type="String(255)", unique=True, nullable=False),
                        ColumnDefinition(name="hashed_password", data_type="String(255)", nullable=False),
                        ColumnDefinition(name="role", data_type="String(50)", default="'member'", nullable=False),
                        ColumnDefinition(name="is_active", data_type="Boolean", default="True", nullable=False),
                        ColumnDefinition(name="created_at", data_type="DateTime", nullable=False),
                    ],
                    indexes=["ix_users_email"],
                ),
                TableDefinition(
                    table_name="tasks",
                    description="Core domain task and project resources",
                    columns=[
                        ColumnDefinition(name="id", data_type="Integer", primary_key=True, nullable=False),
                        ColumnDefinition(name="title", data_type="String(255)", nullable=False),
                        ColumnDefinition(name="description", data_type="String(1000)", nullable=True),
                        ColumnDefinition(name="priority", data_type="String(50)", default="'medium'", nullable=False),
                        ColumnDefinition(name="status", data_type="String(50)", default="'pending'", nullable=False),
                        ColumnDefinition(name="owner_id", data_type="Integer", foreign_key="users.id", nullable=False),
                        ColumnDefinition(name="created_at", data_type="DateTime", nullable=False),
                    ],
                    indexes=["ix_tasks_owner_id", "ix_tasks_status"],
                ),
            ],
            relationships_summary="User has many Tasks (1:N); Task belongs to User.",
        ),
        api_specification=OpenAPISpec(
            title=f"{project_slug.capitalize()} API",
            version="1.0.0",
            base_prefix="/api/v1",
            auth_strategy="JWT Bearer Authentication",
            endpoints=[
                APIEndpoint(
                    path="/health",
                    method="GET",
                    summary="Service health check",
                    description="Returns operational status and uptime details",
                    response_schema="HealthResponse",
                    status_code=200,
                    auth_required=False,
                ),
                APIEndpoint(
                    path="/api/v1/auth/register",
                    method="POST",
                    summary="Register new user account",
                    description="Creates user, hashes password with bcrypt, and initializes profile",
                    request_body_schema="UserCreate",
                    response_schema="UserResponse",
                    status_code=201,
                    auth_required=False,
                ),
                APIEndpoint(
                    path="/api/v1/auth/login",
                    method="POST",
                    summary="Authenticate user and issue JWT",
                    description="Verifies email and password, returning JWT bearer token",
                    request_body_schema="UserLogin",
                    response_schema="TokenResponse",
                    status_code=200,
                    auth_required=False,
                ),
                APIEndpoint(
                    path="/api/v1/tasks",
                    method="GET",
                    summary="List tasks",
                    description="Returns paginated list of tasks filtered by status/priority",
                    response_schema="List[TaskResponse]",
                    status_code=200,
                    auth_required=True,
                ),
                APIEndpoint(
                    path="/api/v1/tasks",
                    method="POST",
                    summary="Create task",
                    description="Creates a new task assigned to authenticated user",
                    request_body_schema="TaskCreate",
                    response_schema="TaskResponse",
                    status_code=201,
                    auth_required=True,
                ),
            ],
        ),
        directory_structure=[
            "app/__init__.py",
            "app/config.py",
            "app/database.py",
            "app/main.py",
            "app/models/__init__.py",
            "app/models/user.py",
            "app/models/task.py",
            "app/schemas/__init__.py",
            "app/schemas/user.py",
            "app/schemas/task.py",
            "app/schemas/token.py",
            "app/crud/__init__.py",
            "app/crud/user.py",
            "app/crud/task.py",
            "app/routers/__init__.py",
            "app/routers/auth.py",
            "app/routers/tasks.py",
            "app/services/__init__.py",
            "app/services/auth_service.py",
            "tests/__init__.py",
            "tests/conftest.py",
            "tests/test_health.py",
            "tests/test_auth.py",
            "tests/test_tasks.py",
            "requirements.txt",
            "README.md",
        ],
    )
    
    return {
        "architecture_spec": arch,
        "current_step": "human_review",
        "messages": [
            SystemMessage(
                content=f"[ArchitectAgent] Designed system architecture for '{arch.project_name}' with {len(arch.database_schema.tables)} tables and {len(arch.api_specification.endpoints)} endpoints."
            )
        ],
    }
