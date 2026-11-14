import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Feedback, Scan
from app.db.session import get_db
from app.feedback.schemas import FeedbackCreateRequest, FeedbackResponse

router = APIRouter(tags=["feedback"])


@router.post("/scans/{scan_id}/feedback", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
async def submit_scan_feedback(
    scan_id: uuid.UUID,
    data: FeedbackCreateRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Submit user validation (correct/incorrect) on a leaf scan diagnosis.
    Feeds the feedback loop for model retraining and validation (Section 4 & 7).
    """
    result = await db.execute(select(Scan).where(Scan.id == scan_id))
    scan = result.scalar_one_or_none()
    if not scan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found.")

    feedback_result = await db.execute(select(Feedback).where(Feedback.scan_id == scan_id))
    existing_feedback = feedback_result.scalar_one_or_none()

    if existing_feedback:
        existing_feedback.is_correct = data.is_correct
        existing_feedback.corrected_disease_id = data.corrected_disease_id
        existing_feedback.note = data.note
        await db.commit()
        await db.refresh(existing_feedback)
        return FeedbackResponse(
            id=existing_feedback.id,
            scan_id=scan.id,
            is_correct=existing_feedback.is_correct,
            message="Feedback updated successfully.",
        )

    feedback = Feedback(
        scan_id=scan.id,
        is_correct=data.is_correct,
        corrected_disease_id=data.corrected_disease_id,
        note=data.note,
    )
    db.add(feedback)
    await db.commit()
    await db.refresh(feedback)

    return FeedbackResponse(
        id=feedback.id,
        scan_id=scan.id,
        is_correct=feedback.is_correct,
    )
