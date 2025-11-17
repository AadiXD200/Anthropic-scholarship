from pydantic import BaseModel, Field
from typing import List, Dict

class KeywordBlock(BaseModel):
    high_intensity: List[str]
    medium_intensity: List[str]
    low_intensity: List[str]
    negative: List[str]

class Weights(BaseModel):
    academics: float
    leadership: float
    community_service: float
    financial_need: float
    innovation: float
    research: float
    resilience: float
    extracurriculars: float
    dei: float
    creativity: float

class Explanations(BaseModel):
    academics: List[str]
    leadership: List[str]
    community_service: List[str]
    financial_need: List[str]
    innovation: List[str]
    research: List[str]
    resilience: List[str]
    extracurriculars: List[str]
    dei: List[str]
    creativity: List[str]

class ScholarshipDescriptionOutput(BaseModel):
    explicit_requirements: List[str]
    implicit_values: List[str]
    keywords: KeywordBlock
    tone: str
    story_style: str
    comparative_insights: List[str]
    weights: Weights
    explanations: Explanations
    scholarship_personality: str
