"""Configuration and LLM Provider Factory."""

import os
from typing import Optional
from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

load_dotenv()


class Settings(BaseSettings):
    """Application and Agent Settings."""
    
    # LLM API Keys
    anthropic_api_key: Optional[str] = Field(default=None, alias="ANTHROPIC_API_KEY")
    google_api_key: Optional[str] = Field(default=None, alias="GOOGLE_API_KEY")
    
    # Integration API Keys
    tavily_api_key: Optional[str] = Field(default=None, alias="TAVILY_API_KEY")
    e2b_api_key: Optional[str] = Field(default=None, alias="E2B_API_KEY")
    github_token: Optional[str] = Field(default=None, alias="GITHUB_TOKEN")
    
    # LangSmith Observability
    langsmith_tracing: bool = Field(default=False, alias="LANGSMITH_TRACING")
    langsmith_endpoint: str = Field(default="https://api.smith.langchain.com", alias="LANGSMITH_ENDPOINT")
    langsmith_api_key: Optional[str] = Field(default=None, alias="LANGSMITH_API_KEY")
    langsmith_project: str = Field(default="enterprise-dev-agent", alias="LANGSMITH_PROJECT")
    
    # MongoDB Database Settings
    mongodb_uri: str = Field(default="mongodb://localhost:27017", alias="MONGODB_URI")
    mongodb_db_name: str = Field(default="trestle_agency", alias="MONGODB_DB_NAME")

    # JWT Authentication
    jwt_secret_key: str = Field(default="trestle-enterprise-secret-jwt-signing-key-2026-auth-secure", alias="JWT_SECRET_KEY")
    jwt_algorithm: str = Field(default="HS256", alias="JWT_ALGORITHM")
    access_token_expire_minutes: int = Field(default=60 * 24 * 7, alias="ACCESS_TOKEN_EXPIRE_MINUTES") # 7 days

    # SMTP Email Verification Settings (smtplib)
    smtp_host: str = Field(default="smtp.gmail.com", alias="SMTP_HOST")
    smtp_port: int = Field(default=587, alias="SMTP_PORT")
    smtp_username: Optional[str] = Field(default=None, alias="SMTP_USERNAME")
    smtp_password: Optional[str] = Field(default=None, alias="SMTP_PASSWORD")
    smtp_from_email: str = Field(default="auth@trestle.ai", alias="SMTP_FROM_EMAIL")
    smtp_use_tls: bool = Field(default=True, alias="SMTP_USE_TLS")

    # Execution Parameters
    default_max_retries: int = Field(default=3, alias="DEFAULT_MAX_RETRIES")
    sandbox_timeout_seconds: int = Field(default=120, alias="SANDBOX_TIMEOUT_SECONDS")
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()


def get_router_llm():
    """Returns Gemini 2.5 Flash for high-speed routing and supervisor decisions."""
    from langchain_google_genai import ChatGoogleGenerativeAI
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=settings.google_api_key,
        temperature=0.1,
    )


def get_researcher_llm():
    """Returns Gemini 2.5 Flash for comprehensive market analysis and synthesis."""
    from langchain_google_genai import ChatGoogleGenerativeAI
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=settings.google_api_key,
        temperature=0.2,
    )


def get_architect_llm():
    """Returns Claude Sonnet 4.6 (or Gemini 2.5 Flash) for structured system design."""
    if settings.anthropic_api_key:
        from langchain_anthropic import ChatAnthropic
        return ChatAnthropic(
            model="claude-sonnet-4-6",
            anthropic_api_key=settings.anthropic_api_key,
            temperature=0.1,
        )
    from langchain_google_genai import ChatGoogleGenerativeAI
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=settings.google_api_key,
        temperature=0.1,
    )


def get_coder_llm():
    """Returns Claude Sonnet 4.6 for production-grade clean architecture code generation."""
    if settings.anthropic_api_key:
        from langchain_anthropic import ChatAnthropic
        return ChatAnthropic(
            model="claude-sonnet-4-6",
            anthropic_api_key=settings.anthropic_api_key,
            temperature=0.1,
            max_tokens=8192,
        )
    from langchain_google_genai import ChatGoogleGenerativeAI
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=settings.google_api_key,
        temperature=0.1,
        max_output_tokens=8192,
    )
