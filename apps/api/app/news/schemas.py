from datetime import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, Field


class NewsArticleItem(BaseModel):
    id: UUID
    title: str
    summary: str
    source: str
    url: str
    published_at: datetime
    crops: List[str] = Field(default_factory=list)
    diseases: List[str] = Field(default_factory=list)
    state: Optional[str] = None
    relevance_score: float


class NewsListResponse(BaseModel):
    items: List[NewsArticleItem]
    total: int
    page: int
    size: int


class AlertItem(BaseModel):
    id: UUID
    state: str
    crop: str
    disease: str
    severity: str
    active_until: datetime


class TrendingDiseaseItem(BaseModel):
    disease: str
    crop: str
    mention_count: int
    trend: str  # "rising", "stable", "declining"
