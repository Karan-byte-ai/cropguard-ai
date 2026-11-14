from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field


class FeedbackCreateRequest(BaseModel):
    is_correct: bool = Field(description="Whether the AI diagnosis was correct")
    corrected_disease_id: Optional[UUID] = Field(default=None, description="Correct disease UUID if known")
    note: Optional[str] = Field(default=None, max_length=1000, description="Farmer or expert remarks")


class FeedbackResponse(BaseModel):
    id: UUID
    scan_id: UUID
    is_correct: bool
    status: str = "received"
    message: str = "Thank you for contributing to improve CropGuard AI models."
