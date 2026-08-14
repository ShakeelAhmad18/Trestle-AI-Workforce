"""Authentication Service, Cryptographic Hashing, JWT Tokens, and MongoDB User Management."""

import secrets
import hashlib
import jwt
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any
from src.config import settings
from src.database import db_manager
from src.auth.email import send_verification_email

logger = logging.getLogger("auth_service")


def hash_password(password: str) -> str:
    """NIST-compliant PBKDF2-HMAC-SHA256 password hashing with random salt."""
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
    return f"{salt}${key.hex()}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies plain password against salted PBKDF2-HMAC hash."""
    try:
        salt, key = hashed_password.split('$')
        recomputed = hashlib.pbkdf2_hmac('sha256', plain_password.encode('utf-8'), salt.encode('utf-8'), 100000)
        return secrets.compare_digest(recomputed.hex(), key)
    except Exception:
        return False


def generate_otp_code() -> str:
    """Generates a cryptographically secure 6-digit numeric OTP."""
    return f"{secrets.randbelow(900000) + 100000:06d}"


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Creates signed JWT token with expiration timestamp."""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    expire = now + (expires_delta or timedelta(minutes=settings.access_token_expire_minutes))
    to_encode.update({"exp": expire, "iat": now})
    return jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodes and verifies JWT access token signature."""
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        return payload
    except Exception as e:
        logger.warning(f"JWT verification failed: {e}")
        return None


class AuthService:
    """Handles User Registration, Email Verification, Login, and Session retrieval."""

    @staticmethod
    async def register_user(email: str, password: str, full_name: str = "") -> Dict[str, Any]:
        """Registers a new user, saves in MongoDB, and dispatches verification code via smtplib."""
        clean_email = email.lower().strip()
        
        # Check if user exists
        existing = await db_manager.users.find_one({"email": clean_email})
        if existing:
            if existing.get("is_verified", False):
                raise ValueError("An account with this email already exists and is verified. Please log in.")
            else:
                # User exists but is unverified; generate new OTP code and resend
                new_code = generate_otp_code()
                expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)
                await db_manager.users.update_one(
                    {"email": clean_email},
                    {"$set": {
                        "hashed_password": hash_password(password),
                        "full_name": full_name,
                        "verification_code": new_code,
                        "verification_expires_at": expires_at.isoformat(),
                    }}
                )
                send_verification_email(clean_email, new_code, full_name)
                return {
                    "email": clean_email,
                    "full_name": full_name,
                    "is_verified": False,
                    "message": "Verification code resent via email.",
                    "dev_code": new_code, # For dev mode testing
                }

        otp_code = generate_otp_code()
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)
        
        user_doc = {
            "email": clean_email,
            "hashed_password": hash_password(password),
            "full_name": full_name,
            "is_verified": False,
            "verification_code": otp_code,
            "verification_expires_at": expires_at.isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "last_login": None,
        }
        
        await db_manager.users.insert_one(user_doc)
        send_verification_email(clean_email, otp_code, full_name)
        
        return {
            "email": clean_email,
            "full_name": full_name,
            "is_verified": False,
            "message": "User registered. Verification code sent via email.",
            "dev_code": otp_code,
        }

    @staticmethod
    async def verify_user_email(email: str, code: str) -> Dict[str, Any]:
        """Verifies email OTP code and activates account."""
        clean_email = email.lower().strip()
        user = await db_manager.users.find_one({"email": clean_email})
        if not user:
            raise ValueError("No account found with this email.")

        if user.get("is_verified", False):
            token = create_access_token({"sub": clean_email, "email": clean_email, "is_verified": True})
            return {"email": clean_email, "is_verified": True, "token": token, "message": "Email is already verified."}

        stored_code = user.get("verification_code")
        expires_at_str = user.get("verification_expires_at")
        
        if not stored_code or stored_code != code.strip():
            raise ValueError("Invalid verification code. Please check your email or request a new code.")

        if expires_at_str:
            expires_at = datetime.fromisoformat(expires_at_str)
            if datetime.now(timezone.utc) > expires_at:
                raise ValueError("Verification code has expired. Please request a new code.")

        # Activate user
        await db_manager.users.update_one(
            {"email": clean_email},
            {"$set": {
                "is_verified": True,
                "verification_code": None,
                "verification_expires_at": None,
                "verified_at": datetime.now(timezone.utc).isoformat(),
            }}
        )

        token = create_access_token({"sub": clean_email, "email": clean_email, "is_verified": True})
        return {
            "email": clean_email,
            "is_verified": True,
            "token": token,
            "message": "Email successfully verified! Full access to AI developer models granted.",
        }

    @staticmethod
    async def authenticate_user(email: str, password: str) -> Dict[str, Any]:
        """Authenticates credentials and ensures account is email-verified."""
        clean_email = email.lower().strip()
        user = await db_manager.users.find_one({"email": clean_email})
        if not user:
            raise ValueError("Invalid email or password.")

        if not verify_password(password, user.get("hashed_password", "")):
            raise ValueError("Invalid email or password.")

        if not user.get("is_verified", False):
            # Resend code
            new_code = generate_otp_code()
            expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)
            await db_manager.users.update_one(
                {"email": clean_email},
                {"$set": {
                    "verification_code": new_code,
                    "verification_expires_at": expires_at.isoformat(),
                }}
            )
            send_verification_email(clean_email, new_code, user.get("full_name", ""))
            return {
                "email": clean_email,
                "is_verified": False,
                "token": None,
                "message": "Email is not verified. A new verification code has been sent to your email.",
                "dev_code": new_code,
            }

        # Update last login
        await db_manager.users.update_one(
            {"email": clean_email},
            {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}}
        )

        token = create_access_token({"sub": clean_email, "email": clean_email, "is_verified": True})
        return {
            "email": clean_email,
            "full_name": user.get("full_name", ""),
            "is_verified": True,
            "token": token,
            "message": "Authentication successful.",
        }

    @staticmethod
    async def resend_verification_code(email: str) -> Dict[str, Any]:
        """Generates a fresh OTP code and sends via smtplib."""
        clean_email = email.lower().strip()
        user = await db_manager.users.find_one({"email": clean_email})
        if not user:
            raise ValueError("No account found with this email.")

        if user.get("is_verified", False):
            return {"email": clean_email, "is_verified": True, "message": "Email is already verified."}

        new_code = generate_otp_code()
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)
        await db_manager.users.update_one(
            {"email": clean_email},
            {"$set": {
                "verification_code": new_code,
                "verification_expires_at": expires_at.isoformat(),
            }}
        )
        send_verification_email(clean_email, new_code, user.get("full_name", ""))
        return {
            "email": clean_email,
            "is_verified": False,
            "message": "Fresh verification code sent via email.",
            "dev_code": new_code,
        }
