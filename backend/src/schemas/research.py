"""Schemas for Market Research and Demand Analysis."""

from typing import List, Optional
from pydantic import BaseModel, Field


class FeatureRequirement(BaseModel):
    """Specific feature derived from global marketplace demand."""
    name: str = Field(description="Name of the feature")
    priority: str = Field(description="Priority tier: P0 (Essential MVP), P1 (High Value), P2 (Nice to Have)")
    description: str = Field(description="Detailed explanation of the feature functionality")
    market_demand_reason: str = Field(description="Evidence of why clients/users actively pay for or demand this feature")
    monetization_potential: str = Field(description="How this feature contributes to revenue or retention")


class CompetitorInsight(BaseModel):
    """Insight into existing market offerings and feature gaps."""
    competitor_or_product: str = Field(description="Competitor product or existing market standard")
    strengths: List[str] = Field(default_factory=list, description="What they do well")
    market_gaps: List[str] = Field(default_factory=list, description="Common complaints or missing capabilities we can capitalize on")


class MarketResearchReport(BaseModel):
    """Structured report produced by the ResearcherAgent."""
    project_domain: str = Field(description="Primary industry or vertical (e.g., FinTech, SaaS, Healthcare)")
    target_audience: str = Field(description="Primary ideal customer profile (ICP)")
    core_value_proposition: str = Field(description="Unique selling proposition for the application")
    demanded_features: List[FeatureRequirement] = Field(description="High-demand features extracted from market research")
    competitor_analysis: List[CompetitorInsight] = Field(default_factory=list, description="Insights on competitor features and gaps")
    recommended_tech_stack_rationale: str = Field(description="Justification for chosen backend/database technologies")
    security_and_compliance_needs: List[str] = Field(default_factory=list, description="Regulatory and security requirements (e.g. JWT Auth, HIPAA, GDPR, Rate Limiting)")
    source_citations: List[str] = Field(default_factory=list, description="Search queries or marketplace URLs used")
