"""FastAPI Security Dependencies enforcing Verified User Access to AI Models."""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Any, Optional
from src.auth.service import decode_access_token
from src.database import db_manager

security = HTTPBearer(auto_error=False)


async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Dict[str, Any]:
    """Extracts and validates JWT Bearer token."""
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in or verify your account.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    payload = decode_access_token(credentials.credentials)
    if not payload or "email" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    user = await db_manager.users.find_one({"email": payload["email"]})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account no longer exists.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    return user


async def get_current_verified_user(user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """Enforces that only EMAIL-VERIFIED users can access AI developer agent models."""
    if not user.get("is_verified", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Email verification required. Please verify your email via smtplib verification code to use Claude 3.5 Sonnet and Gemini 1.5 agent models.",
        )
    return user
