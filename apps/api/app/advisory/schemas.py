from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, Field


class DiseaseSummary(BaseModel):
    id: UUID
    slug: str
    crop: str
    name: str
    pathogen: str
    severity: str


class DiseaseDetailResponse(BaseModel):
    id: UUID
    slug: str
    crop: str
    name: str
    pathogen: str
    severity: str
    symptoms: List[str] = Field(default_factory=list)
    management_organic: List[str] = Field(default_factory=list)
    management_chemical: List[str] = Field(default_factory=list)
    prevention: List[str] = Field(default_factory=list)
    source_name: str
    source_url: str
    disclaimer: str = (
        "Advisory content is retrieved solely from certified agricultural research sources (ICAR / KVK). "
        "Consult local agricultural extension officers for region-specific spray schedules."
    )
