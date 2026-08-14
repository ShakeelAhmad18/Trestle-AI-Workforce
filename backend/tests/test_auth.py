"""Tests for smtplib email verification, MongoDB user repository, and protected endpoints."""

import pytest
import asyncio
from src.auth.service import (
    hash_password,
    verify_password,
    generate_otp_code,
    create_access_token,
    decode_access_token,
    AuthService,
)
from src.auth.email import send_verification_email
from src.database import db_manager


def test_password_hashing_and_verification():
    password = "SuperSecretPassword123!"
    hashed = hash_password(password)
    assert hashed != password
    assert "$" in hashed
    assert verify_password(password, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False


def test_jwt_token_generation_and_decoding():
    payload = {"sub": "developer@trestle.ai", "email": "developer@trestle.ai", "is_verified": True}
    token = create_access_token(payload)
    assert isinstance(token, str)
    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded["email"] == "developer@trestle.ai"
    assert decoded["is_verified"] is True


def test_otp_generation():
    otp = generate_otp_code()
    assert len(otp) == 6
    assert otp.isdigit()


def test_smtplib_email_dispatcher():
    # Dev-mode fallback / smtplib test
    res = send_verification_email(
        to_email="test.developer@example.com",
        verification_code="849201",
        user_name="Alice Developer",
    )
    assert res is True


@pytest.mark.asyncio
async def test_auth_service_registration_and_verification_flow():
    email = "newuser.test@trestle.ai"
    password = "SecurePassword2026!"
    
    # 1. Register User
    reg_result = await AuthService.register_user(
        email=email,
        password=password,
        full_name="Test Developer",
    )
    assert reg_result["email"] == email
    assert reg_result["is_verified"] is False
    dev_code = reg_result["dev_code"]
    assert len(dev_code) == 6

    # 2. Attempt Login Before Email Verification (Should Fail / Prompt Verification)
    login_unverified = await AuthService.authenticate_user(email, password)
    assert login_unverified["is_verified"] is False
    assert login_unverified["token"] is None

    # 3. Verify Email with Valid Code
    active_code = login_unverified.get("dev_code") or dev_code
    verify_result = await AuthService.verify_user_email(email, active_code)
    assert verify_result["is_verified"] is True
    assert "token" in verify_result
    assert verify_result["token"] is not None

    # 4. Login After Email Verification (Should Succeed with JWT)
    login_verified = await AuthService.authenticate_user(email, password)
    assert login_verified["is_verified"] is True
    assert login_verified["token"] is not None
