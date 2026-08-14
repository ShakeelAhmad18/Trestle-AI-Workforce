"""SMTP Email Dispatcher using Python's smtplib for User Verification."""

import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from src.config import settings

logger = logging.getLogger("auth_email")


def generate_verification_email_html(verification_code: str, user_name: str) -> str:
    """Generates a responsive HTML email template for verification."""
    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0a0a0c; color: #f1f5f9; padding: 20px; }}
    .container {{ max-width: 540px; margin: 0 auto; background: #14141c; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); padding: 32px; }}
    .logo {{ font-size: 24px; font-weight: bold; color: #ffffff; letter-spacing: -0.5px; }}
    .logo span {{ color: #ff6b35; }}
    .badge {{ display: inline-block; padding: 4px 12px; background: rgba(255,107,53,0.15); border: 1px solid rgba(255,107,53,0.3); border-radius: 9999px; color: #ff8c5a; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-top: 12px; }}
    .title {{ font-size: 20px; font-weight: bold; color: #ffffff; margin-top: 16px; }}
    .text {{ font-size: 14px; color: #94a3b8; line-height: 1.6; margin-top: 12px; }}
    .code-box {{ background: #0c0c10; border: 1px solid rgba(255,107,53,0.4); border-radius: 12px; padding: 18px; text-align: center; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #ff6b35; margin: 24px 0; font-family: monospace; }}
    .footer {{ font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid rgba(255,255,255,0.08); pt: 16px; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">Trestle<span>.ai</span></div>
    <div class="badge">Security Verification</div>
    <div class="title">Verify Your Developer Account</div>
    <p class="text">Hello {user_name or 'Developer'},</p>
    <p class="text">You have registered for the <strong>Trestle Autonomous AI Engineering Studio</strong>. To authorize access to our Claude 3.5 Sonnet and Gemini 1.5 agent models, please use the 6-digit verification code below:</p>
    
    <div class="code-box">{verification_code}</div>
    
    <p class="text">This code will expire in <strong>15 minutes</strong>. If you did not request this verification, you can safely ignore this email.</p>
    
    <div class="footer">
      © {2026} Trestle AI Systems Inc. Autonomous Software Development Agency.
    </div>
  </div>
</body>
</html>"""


def send_verification_email(to_email: str, verification_code: str, user_name: str = "Developer") -> bool:
    """Dispatches verification code via smtplib with TLS encryption or dev fallback."""
    subject = f"[Trestle AI] Your Verification Code: {verification_code}"
    
    # 1. Attempt real SMTP delivery if configured
    if settings.smtp_username and settings.smtp_password:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = settings.smtp_from_email
            msg["To"] = to_email
            
            text_content = f"Your Trestle AI verification code is: {verification_code}. It expires in 15 minutes."
            html_content = generate_verification_email_html(verification_code, user_name)
            
            msg.attach(MIMEText(text_content, "plain"))
            msg.attach(MIMEText(html_content, "html"))
            
            with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as server:
                if settings.smtp_use_tls:
                    server.starttls()
                server.login(settings.smtp_username, settings.smtp_password)
                server.sendmail(settings.smtp_from_email, [to_email], msg.as_string())
                
            logger.info(f"Verification email successfully sent via SMTP to {to_email}")
            return True
        except Exception as e:
            logger.error(f"SMTP delivery failed: {e}. Falling back to console output.")
            
    # 2. Local Development Fallback: output cleanly to server logs
    logger.warning("==================================================================")
    logger.warning(f"  [DEV-MODE EMAIL SIMULATION via smtplib]")
    logger.warning(f"  To:                {to_email}")
    logger.warning(f"  VERIFICATION CODE: {verification_code}")
    logger.warning(f"  Expires in:        15 Minutes")
    logger.warning("==================================================================")
    return True
