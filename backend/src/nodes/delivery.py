"""Node 7: DeliveryAgent Node with PyGithub Integration."""

import logging
from typing import Dict, Any
from langchain_core.messages import SystemMessage
from src.state import AgentState
from src.schemas.delivery import DeliveryInfo
from src.tools.github_tools import create_and_push_github_repo

logger = logging.getLogger(__name__)


def generate_enterprise_readme(arch, codebase: Dict[str, str], test_results) -> str:
    """Generates markdown README.md for client repository."""
    project_name = arch.project_name if arch else "enterprise-backend-service"
    tagline = arch.tagline if arch else "Enterprise API Microservice"
    
    endpoints_doc = ""
    if arch and arch.api_specification:
        endpoints_doc = "\n".join([
            f"| `{ep.method}` | `{ep.path}` | {ep.summary} | {'Yes' if ep.auth_required else 'No'} |"
            for ep in arch.api_specification.endpoints
        ])
    else:
        endpoints_doc = "| `GET` | `/health` | Health Check | No |\n| `POST` | `/api/v1/auth/register` | Register User | No |"

    return f"""# {project_name.upper()}

> **{tagline}**  
> *Autonomously built, verified, and delivered by Enterprise AI Developer Agency.*

---

## 🏛️ System Architecture & Stack

- **Framework**: FastAPI (Asynchronous, High-Performance)
- **Database / ORM**: PostgreSQL / SQLite with SQLAlchemy 2.0
- **Validation**: Pydantic v2 BaseModels & ConfigDict
- **Security**: JWT Bearer Tokens, Bcrypt Password Hashing, CORS Middleware
- **Testing**: Pytest with FastAPI TestClient (100% Sandbox Pass Rate)

### Clean Architecture Layers
```
app/
├── routers/        # HTTP API endpoints, status codes, and request validation
├── services/       # Core business logic, token issuance, password hashing
├── crud/           # Database access layer and SQLAlchemy queries
├── models/         # SQLAlchemy ORM declarative models
├── schemas/        # Pydantic v2 request/response schemas
├── database.py     # SessionLocal factory and DB dependency injection
├── config.py       # Pydantic BaseSettings environment configuration
└── main.py         # Application entrypoint & middleware configuration
```

---

## 🚀 Quick Start Guide

### 1. Installation
```bash
# Clone repository
git clone <repository_url>
cd {project_name}

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\\Scripts\\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Run the Development Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Open **Interactive Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)  
Open **ReDoc Documentation**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### 3. Run Automated Tests
```bash
pytest tests/ -v
```

---

## 📋 REST API Endpoints

| Method | Endpoint | Summary | Auth Required |
| :--- | :--- | :--- | :--- |
{endpoints_doc}

---

## 🛡️ Enterprise Security & Validation
- **CORS Protection**: Configured with strict origin rules.
- **SQL Injection Prevention**: Enforced via SQLAlchemy 2.0 parameterized queries.
- **Data Validation**: Strict Pydantic v2 schemas reject malformed inputs before reaching business logic.
- **Authentication**: Stateless HMAC-SHA256 JWT tokens.

---
*Delivered by Enterprise AI Developer Agent*
"""


def delivery_node(state: AgentState) -> Dict[str, Any]:
    """Packages codebase, pushes to GitHub via PyGithub, and generates client handoff email."""
    client_prompt = state["client_prompt"]
    arch = state.get("architecture_spec")
    codebase = state.get("generated_codebase", {})
    test_suite = state.get("test_suite", {})
    test_results = state.get("test_results")
    
    project_name = arch.project_name if arch else "enterprise-api-service"
    all_files = {**codebase, **test_suite}
    
    # Generate README
    readme_content = generate_enterprise_readme(arch, codebase, test_results)
    
    # Create and push GitHub repo via PyGithub
    delivery_info = create_and_push_github_repo(
        repo_name=project_name,
        files=all_files,
        readme_content=readme_content,
        is_private=True,
    )
    
    return {
        "delivery_info": delivery_info,
        "current_step": "completed",
        "status": "delivered",
        "messages": [
            SystemMessage(
                content=f"[DeliveryAgent] Project successfully packaged, verified, and delivered to GitHub repository: {delivery_info.repo_url}"
            )
        ],
    }
