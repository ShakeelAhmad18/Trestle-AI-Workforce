"""Market research tools powered by Tavily Search and marketplace intelligence."""

import logging
from typing import List
from langchain_core.tools import tool
from src.config import settings

logger = logging.getLogger(__name__)


@tool
def search_marketplace_demand(query: str) -> str:
    """Searches freelance marketplaces (Upwork, Fiverr, GitHub discussions) to identify
    what features clients actively demand, pay for, and encounter issues with.
    
    Args:
        query: Market or feature topic to research (e.g. 'FastAPI SaaS multi-tenant auth Upwork demand').
        
    Returns:
        Summary of search results containing client requirements and pricing trends.
    """
    api_key = settings.tavily_api_key
    if not api_key:
        logger.warning("TAVILY_API_KEY not configured. Using high-signal marketplace heuristic.")
        return (
            f"Market Intelligence for '{query}':\n"
            "- Clients consistently require JWT/OAuth2 authentication with role-based access control.\n"
            "- High demand for PostgreSQL with SQLAlchemy 2.0 ORM and Alembic migrations.\n"
            "- Core requirements: Clean CRUD operations, pagination, filtering, and OpenAPI documentation.\n"
            "- Security prerequisites: Rate limiting (Slowapi), CORS middleware, and input sanitization via Pydantic v2.\n"
            "- Testing prerequisite: Pytest unit & integration test coverage (>85%)."
        )
    
    try:
        from tavily import TavilyClient
        client = TavilyClient(api_key=api_key)
        response = client.search(
            query=f"{query} features requirements Upwork Fiverr software specifications",
            search_depth="advanced",
            max_results=5,
        )
        
        results = []
        for r in response.get("results", []):
            title = r.get("title", "")
            content = r.get("content", "")
            url = r.get("url", "")
            results.append(f"Source: {title} ({url})\nInsight: {content}\n")
            
        return "\n".join(results) if results else "No specific marketplace results found."
    except Exception as e:
        logger.error(f"Error executing Tavily search: {e}")
        return f"Tavily search failed ({e}). Proceeding with enterprise standard requirements."


@tool
def search_tech_standards(domain: str) -> str:
    """Researches architectural and compliance standards for a specific business domain.
    
    Args:
        domain: Industry vertical or business domain (e.g. 'Healthcare HIPAA backend', 'FinTech Stripe payments').
        
    Returns:
        Technical recommendations, regulatory constraints, and standard architectural patterns.
    """
    api_key = settings.tavily_api_key
    if not api_key:
        return (
            f"Tech standards for '{domain}':\n"
            "- Layered Clean Architecture (Routers -> Services -> Repositories -> Models).\n"
            "- Strict validation using Pydantic v2 BaseModels.\n"
            "- Asynchronous database connection pooling with SQLAlchemy.\n"
            "- Centralized exception handling with RFC 7807 problem details.\n"
            "- Environment-based configuration with Pydantic BaseSettings."
        )
        
    try:
        from tavily import TavilyClient
        client = TavilyClient(api_key=api_key)
        response = client.search(
            query=f"{domain} backend architecture security compliance best practices FastAPI",
            search_depth="advanced",
            max_results=3,
        )
        results = [r.get("content", "") for r in response.get("results", [])]
        return "\n".join(results)
    except Exception as e:
        logger.error(f"Error querying tech standards: {e}")
        return f"Tech standards fallback for {domain}: Enforce Clean Architecture, JWT auth, and Pytest coverage."


research_tools_list = [search_marketplace_demand, search_tech_standards]
