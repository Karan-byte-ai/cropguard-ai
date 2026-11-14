import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from geoalchemy2 import Geometry
from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    language = Column(String(10), default="en", nullable=False)
    region = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    scans = relationship("Scan", back_populates="user", cascade="all, delete-orphan")


class Disease(Base):
    __tablename__ = "diseases"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    crop = Column(String(100), nullable=False, index=True)
    name_en = Column(String(200), nullable=False)
    name_hi = Column(String(200), nullable=False)
    name_mr = Column(String(200), nullable=False)
    pathogen = Column(String(100), nullable=False)  # fungal, bacterial, viral, pest, healthy
    severity_default = Column(String(20), default="medium", nullable=False)

    contents = relationship("DiseaseContent", back_populates="disease", cascade="all, delete-orphan")
    chunks = relationship("KBChunk", back_populates="disease", cascade="all, delete-orphan")


class DiseaseContent(Base):
    __tablename__ = "disease_content"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    disease_id = Column(UUID(as_uuid=True), ForeignKey("diseases.id", ondelete="CASCADE"), nullable=False, index=True)
    lang = Column(String(10), nullable=False, index=True)  # en, hi, mr
    symptoms = Column(JSONB, nullable=False, default=list)
    management_organic = Column(JSONB, nullable=False, default=list)
    management_chemical = Column(JSONB, nullable=False, default=list)
    prevention = Column(JSONB, nullable=False, default=list)
    source_name = Column(String(100), nullable=False)  # e.g., ICAR, KVK
    source_url = Column(String(500), nullable=False)
    reviewed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    disease = relationship("Disease", back_populates="contents")


class KBChunk(Base):
    __tablename__ = "kb_chunks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    disease_id = Column(UUID(as_uuid=True), ForeignKey("diseases.id", ondelete="CASCADE"), nullable=False, index=True)
    lang = Column(String(10), nullable=False, index=True)
    text = Column(Text, nullable=False)
    embedding = Column(Vector(768), nullable=True)  # sentence-transformers multilingual-e5

    disease = relationship("Disease", back_populates="chunks")

    __table_args__ = (
        Index("ix_kb_chunks_embedding_ivfflat", "embedding", postgresql_using="ivfflat", postgresql_ops={"embedding": "vector_cosine_ops"}),
    )


class Scan(Base):
    __tablename__ = "scans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    session_id = Column(String(100), nullable=True, index=True)
    image_key = Column(String(255), nullable=False)
    image_hash = Column(String(64), nullable=False, unique=False, index=True)
    status = Column(String(20), default="processing", nullable=False)  # processing, done, failed
    model_version = Column(String(50), nullable=False)
    leaf_detected = Column(Boolean, default=True, nullable=False)
    top_disease_id = Column(UUID(as_uuid=True), ForeignKey("diseases.id", ondelete="SET NULL"), nullable=True)
    confidence = Column(Float, nullable=True)
    heatmap_key = Column(String(255), nullable=True)
    locale = Column(String(10), default="en", nullable=False)
    geo = Column(Geometry("POINT", srid=4326), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    user = relationship("User", back_populates="scans")
    predictions = relationship("ScanPrediction", back_populates="scan", cascade="all, delete-orphan")
    feedback = relationship("Feedback", back_populates="scan", uselist=False, cascade="all, delete-orphan")


class ScanPrediction(Base):
    __tablename__ = "scan_predictions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scan_id = Column(UUID(as_uuid=True), ForeignKey("scans.id", ondelete="CASCADE"), nullable=False, index=True)
    disease_id = Column(UUID(as_uuid=True), ForeignKey("diseases.id", ondelete="RESTRICT"), nullable=False)
    rank = Column(Integer, nullable=False)  # 1, 2, 3
    confidence = Column(Float, nullable=False)

    scan = relationship("Scan", back_populates="predictions")
    disease = relationship("Disease")


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scan_id = Column(UUID(as_uuid=True), ForeignKey("scans.id", ondelete="CASCADE"), nullable=False, unique=True)
    is_correct = Column(Boolean, nullable=False)
    corrected_disease_id = Column(UUID(as_uuid=True), ForeignKey("diseases.id", ondelete="SET NULL"), nullable=True)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    scan = relationship("Scan", back_populates="feedback")


class NewsArticle(Base):
    __tablename__ = "news_articles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    url_hash = Column(String(64), unique=True, nullable=False, index=True)
    title = Column(String(500), nullable=False)
    summary = Column(Text, nullable=False)
    source = Column(String(100), nullable=False)
    url = Column(String(1000), nullable=False)
    published_at = Column(DateTime(timezone=True), nullable=False, index=True)
    language = Column(String(10), default="en", nullable=False)
    crops = Column(ARRAY(String), nullable=False, default=list)
    diseases = Column(ARRAY(String), nullable=False, default=list)
    state = Column(String(100), nullable=True, index=True)
    relevance_score = Column(Float, default=1.0, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    alerts = relationship("Alert", back_populates="article", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_news_articles_crops_gin", "crops", postgresql_using="gin"),
        Index("ix_news_articles_diseases_gin", "diseases", postgresql_using="gin"),
        Index("ix_news_articles_published_at_desc", published_at.desc()),
    )


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    article_id = Column(UUID(as_uuid=True), ForeignKey("news_articles.id", ondelete="CASCADE"), nullable=True)
    state = Column(String(100), nullable=False, index=True)
    crop = Column(String(100), nullable=False)
    disease = Column(String(200), nullable=False)
    severity = Column(String(20), default="medium", nullable=False)  # low, medium, high
    active_until = Column(DateTime(timezone=True), nullable=False)

    article = relationship("NewsArticle", back_populates="alerts")


class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    actor = Column(String(100), nullable=False)
    action = Column(String(100), nullable=False)
    entity = Column(String(100), nullable=False)
    ip_hash = Column(String(64), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
