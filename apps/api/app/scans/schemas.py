from typing import List, Literal, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class AdvisorySource(BaseModel):
    name: str
    url: str


class AdvisoryManagement(BaseModel):
    organic: List[str] = Field(default_factory=list)
    chemical: List[str] = Field(default_factory=list)


class AdvisoryDetail(BaseModel):
    symptoms: List[str] = Field(default_factory=list)
    management: AdvisoryManagement = Field(default_factory=AdvisoryManagement)
    prevention: List[str] = Field(default_factory=list)
    sources: List[AdvisorySource] = Field(default_factory=list)


class PredictionItem(BaseModel):
    disease: str
    label: str
    crop: str
    confidence: float


class ScanResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    scanId: UUID
    status: Literal["processing", "done", "failed"] = "done"
    modelVersion: str = "v1.3.0"
    leafDetected: bool = True
    confidenceLevel: Literal["high", "medium", "low"]
    predictions: List[PredictionItem] = Field(default_factory=list)
    heatmapUrl: Optional[str] = None
    advisory: AdvisoryDetail = Field(default_factory=AdvisoryDetail)
    disclaimer: str = (
        "AI-assisted guidance only, not a replacement for an agronomist. "
        "Always confirm severe cases with a local Krishi Vigyan Kendra (KVK) or agriculture officer."
    )


class ScanSummary(BaseModel):
    id: UUID
    status: str
    created_at: str
    crop: Optional[str] = None
    top_disease: Optional[str] = None
    confidence: Optional[float] = None
    image_url: Optional[str] = None


class ScanListResponse(BaseModel):
    items: List[ScanSummary]
    total: int
    page: int
    size: int
