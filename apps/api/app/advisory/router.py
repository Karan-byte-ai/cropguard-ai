import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.advisory.schemas import DiseaseDetailResponse, DiseaseSummary
from app.db.models import Disease, DiseaseContent
from app.db.session import get_db

router = APIRouter(prefix="/diseases", tags=["diseases"])


@router.get("", response_model=List[DiseaseSummary])
async def list_diseases(
    crop: Optional[str] = Query(default=None, description="Filter by crop name"),
    q: Optional[str] = Query(default=None, description="Search keyword in disease name"),
    lang: str = Query(default="en", description="Language: en, hi, mr"),
    db: AsyncSession = Depends(get_db),
):
    """List and search crop diseases in the knowledge base."""
    stmt = select(Disease)
    if crop:
        stmt = stmt.where(Disease.crop.ilike(f"%{crop}%"))
    if q:
        stmt = stmt.where(
            or_(
                Disease.name_en.ilike(f"%{q}%"),
                Disease.name_hi.ilike(f"%{q}%"),
                Disease.name_mr.ilike(f"%{q}%"),
            )
        )
    result = await db.execute(stmt)
    diseases = result.scalars().all()

    items = []
    for d in diseases:
        name = d.name_hi if lang == "hi" else (d.name_mr if lang == "mr" else d.name_en)
        items.append(
            DiseaseSummary(
                id=d.id,
                slug=d.slug,
                crop=d.crop,
                name=name,
                pathogen=d.pathogen,
                severity=d.severity_default,
            )
        )
    return items


@router.get("/{slug}", response_model=DiseaseDetailResponse)
async def get_disease_detail(
    slug: str,
    lang: str = Query(default="en", description="Language code: en, hi, mr"),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve grounded disease advisory and management details by slug."""
    stmt = select(Disease).where(Disease.slug == slug)
    result = await db.execute(stmt)
    disease = result.scalar_one_or_none()
    if not disease:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Disease not found in knowledge base.")

    content_stmt = select(DiseaseContent).where(
        DiseaseContent.disease_id == disease.id,
        DiseaseContent.lang == lang
    )
    content_result = await db.execute(content_stmt)
    content = content_result.scalar_one_or_none()

    # Fallback to English if translation missing
    if not content and lang != "en":
        en_stmt = select(DiseaseContent).where(
            DiseaseContent.disease_id == disease.id,
            DiseaseContent.lang == "en"
        )
        en_result = await db.execute(en_stmt)
        content = en_result.scalar_one_or_none()

    name = disease.name_hi if lang == "hi" else (disease.name_mr if lang == "mr" else disease.name_en)

    return DiseaseDetailResponse(
        id=disease.id,
        slug=disease.slug,
        crop=disease.crop,
        name=name,
        pathogen=disease.pathogen,
        severity=disease.severity_default,
        symptoms=content.symptoms if content else ["Symptoms information being updated."],
        management_organic=content.management_organic if content else [],
        management_chemical=content.management_chemical if content else [],
        prevention=content.prevention if content else [],
        source_name=content.source_name if content else "ICAR / Agriculture Ministry",
        source_url=content.source_url if content else "https://icar.org.in",
    )
