"""Schemas for Database, OpenAPI, and System Architecture."""

from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field


class ColumnDefinition(BaseModel):
    """Database column specification."""
    name: str = Field(description="Column name in snake_case")
    data_type: str = Field(description="SQL/SQLAlchemy data type (e.g. String, Integer, UUID, DateTime, Boolean)")
    primary_key: bool = Field(default=False, description="Whether this column is the primary key")
    nullable: bool = Field(default=True, description="Whether null values are allowed")
    unique: bool = Field(default=False, description="Whether unique constraint applies")
    foreign_key: Optional[str] = Field(default=None, description="Referenced table.column (e.g. users.id)")
    default: Optional[str] = Field(default=None, description="Default value expression")
    description: Optional[str] = Field(default=None, description="Documentation for the column")


class TableDefinition(BaseModel):
    """Database table specification."""
    table_name: str = Field(description="Database table name in snake_case (plural)")
    description: str = Field(description="Purpose of this entity in the domain")
    columns: List[ColumnDefinition] = Field(description="List of column definitions")
    indexes: List[str] = Field(default_factory=list, description="Indexed column names or composite index definitions")


class DatabaseSchema(BaseModel):
    """Complete relational database schema design."""
    database_engine: str = Field(default="PostgreSQL", description="Underlying database engine")
    orm: str = Field(default="SQLAlchemy 2.0", description="ORM framework used")
    tables: List[TableDefinition] = Field(description="All database entity tables")
    relationships_summary: str = Field(description="Summary of 1:1, 1:N, and N:M relationships")


class APIEndpoint(BaseModel):
    """REST API endpoint definition."""
    path: str = Field(description="URL path (e.g., /api/v1/projects/{id})")
    method: str = Field(description="HTTP method (GET, POST, PUT, PATCH, DELETE)")
    summary: str = Field(description="Short summary of the endpoint")
    description: str = Field(description="Detailed business logic and behavioral notes")
    request_body_schema: Optional[str] = Field(default=None, description="Pydantic request model name")
    response_schema: str = Field(description="Pydantic response model name")
    status_code: int = Field(default=200, description="Default HTTP status code")
    auth_required: bool = Field(default=True, description="Whether authentication is required")
    rate_limit: Optional[str] = Field(default="60/minute", description="Rate limiting rule")


class OpenAPISpec(BaseModel):
    """OpenAPI / REST Interface Specification."""
    title: str = Field(description="API Title")
    version: str = Field(default="1.0.0", description="API Version")
    base_prefix: str = Field(default="/api/v1", description="Base URL prefix")
    auth_strategy: str = Field(default="JWT Bearer Authentication", description="Authentication mechanism")
    endpoints: List[APIEndpoint] = Field(description="List of all exposed REST endpoints")


class SystemArchitecture(BaseModel):
    """Complete System Architecture output produced by ArchitectAgent."""
    project_name: str = Field(description="Formal project identifier in kebab-case")
    tagline: str = Field(description="One-sentence project summary")
    tech_stack: Dict[str, str] = Field(
        default_factory=lambda: {
            "language": "Python 3.11+",
            "framework": "FastAPI",
            "orm": "SQLAlchemy 2.0 (Async/Sync)",
            "validation": "Pydantic v2",
            "database": "PostgreSQL",
            "testing": "Pytest + FastAPI TestClient",
            "security": "Passlib/Bcrypt, PyJWT, Slowapi Rate Limiter",
        },
        description="Technology stack breakdown",
    )
    clean_architecture_layers: Dict[str, str] = Field(
        default_factory=lambda: {
            "api_layer": "Routers & Controllers handling HTTP, Pydantic DTO validation, and Status Codes",
            "service_layer": "Domain business logic, authorization rules, and transactional flows",
            "repository_layer": "Data access, SQLAlchemy queries, and database persistence",
            "model_layer": "SQLAlchemy ORM models & table definitions",
            "core_layer": "Settings, DB session factories, security utilities, and exception handlers",
        },
        description="Clean architecture responsibility mapping",
    )
    database_schema: DatabaseSchema = Field(description="Database ERD and table models")
    api_specification: OpenAPISpec = Field(description="REST API endpoints and models")
    security_controls: List[str] = Field(
        default_factory=lambda: [
            "Strict CORS configuration",
            "Rate limiting on all public & sensitive endpoints",
            "Pydantic v2 input validation & SQL injection prevention via ORM",
            "Password hashing with bcrypt",
            "JWT token expiration and signature validation",
        ],
        description="Enterprise security mechanisms",
    )
    directory_structure: List[str] = Field(description="List of relative file paths that comprise the application")
