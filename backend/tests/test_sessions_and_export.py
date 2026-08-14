"""Tests for multi-session persistence, history queries, zip export, and checkpoint resumption."""

import pytest
import io
import zipfile
from datetime import datetime, timezone
from src.database import db_manager
from src.server import app
from fastapi.testclient import TestClient
from src.auth.service import create_access_token


@pytest.fixture
def client():
    return TestClient(app)


def get_test_auth_headers(email: str = "enterprise.lead@trestle.ai"):
    token = create_access_token({"sub": email, "email": email, "is_verified": True})
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_session_mongodb_persistence_and_history_query(client):
    user_email = "enterprise.lead@trestle.ai"
    thread_id = "test-project-thread-999"
    
    # 1. Ensure user exists in db
    await db_manager.users.update_one(
        {"email": user_email},
        {"$set": {
            "email": user_email,
            "full_name": "Enterprise Lead",
            "is_verified": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }},
        upsert=True,
    )
    
    # 2. Insert session into DB
    session_data = {
        "thread_id": thread_id,
        "user_email": user_email,
        "prompt": "Build an AI Document Classifier API",
        "status": "delivered",
        "current_step": "delivery",
        "generated_codebase": {
            "app/main.py": "from fastapi import FastAPI\napp = FastAPI()",
            "app/routers/doc.py": "from fastapi import APIRouter\nrouter = APIRouter()",
        },
        "test_suite": {
            "tests/test_doc.py": "def test_doc(): assert True",
        },
        "test_results": {"passed": True, "total_tests": 5, "passed_tests": 5},
        "delivery_info": {"github_repo_url": "https://github.com/client/ai-doc-classifier"},
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    
    await db_manager.workflows.update_one(
        {"thread_id": thread_id},
        {"$set": session_data},
        upsert=True,
    )
    
    # 3. Query History Endpoint
    headers = get_test_auth_headers(user_email)
    response = client.get("/api/workflows/history", headers=headers)
    assert response.status_code == 200
    history = response.json()
    assert isinstance(history, list)
    
    matching = [h for h in history if h["thread_id"] == thread_id]
    assert len(matching) == 1
    assert matching[0]["prompt"] == "Build an AI Document Classifier API"
    assert matching[0]["file_count"] == 2
    assert matching[0]["test_passed"] is True


@pytest.mark.asyncio
async def test_download_project_zip_archive(client):
    user_email = "enterprise.lead@trestle.ai"
    thread_id = "test-project-thread-999"
    headers = get_test_auth_headers(user_email)
    
    response = client.get(f"/api/workflow/{thread_id}/download-zip", headers=headers)
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/zip"
    assert "attachment; filename=" in response.headers["content-disposition"]
    
    # Verify ZIP integrity and extracted files
    zip_bytes = io.BytesIO(response.content)
    with zipfile.ZipFile(zip_bytes, "r") as zf:
        namelist = zf.namelist()
        assert "app/main.py" in namelist
        assert "app/routers/doc.py" in namelist
        assert "tests/test_doc.py" in namelist
        assert "README.md" in namelist
        assert "requirements.txt" in namelist
        
        main_content = zf.read("app/main.py").decode("utf-8")
        assert "from fastapi import FastAPI" in main_content
