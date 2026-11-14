"""initial schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-11-13 14:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import pgvector
import geoalchemy2

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Users Table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('language', sa.String(length=10), nullable=False, server_default='en'),
        sa.Column('region', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)

    # 2. Diseases Table
    op.create_table(
        'diseases',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('slug', sa.String(length=100), nullable=False),
        sa.Column('crop', sa.String(length=100), nullable=False),
        sa.Column('name_en', sa.String(length=200), nullable=False),
        sa.Column('name_hi', sa.String(length=200), nullable=False),
        sa.Column('name_mr', sa.String(length=200), nullable=False),
        sa.Column('pathogen', sa.String(length=100), nullable=False),
        sa.Column('severity_default', sa.String(length=20), nullable=False, server_default='medium'),
    )
    op.create_index('ix_diseases_slug', 'diseases', ['slug'], unique=True)
    op.create_index('ix_diseases_crop', 'diseases', ['crop'], unique=False)

    # 3. Disease Content Table
    op.create_table(
        'disease_content',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('disease_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('diseases.id', ondelete='CASCADE'), nullable=False),
        sa.Column('lang', sa.String(length=10), nullable=False),
        sa.Column('symptoms', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('management_organic', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('management_chemical', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('prevention', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('source_name', sa.String(length=100), nullable=False),
        sa.Column('source_url', sa.String(length=500), nullable=False),
        sa.Column('reviewed_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_disease_content_disease_id', 'disease_content', ['disease_id'])
    op.create_index('ix_disease_content_lang', 'disease_content', ['lang'])

    # 4. KB Chunks Table (pgvector)
    op.create_table(
        'kb_chunks',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('disease_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('diseases.id', ondelete='CASCADE'), nullable=False),
        sa.Column('lang', sa.String(length=10), nullable=False),
        sa.Column('text', sa.Text(), nullable=False),
        sa.Column('embedding', pgvector.sqlalchemy.Vector(768), nullable=True),
    )
    op.create_index('ix_kb_chunks_disease_id', 'kb_chunks', ['disease_id'])
    op.create_index('ix_kb_chunks_lang', 'kb_chunks', ['lang'])
    # Optional IVF-Flat / HNSW index for vector cosine distance
    op.execute("CREATE INDEX IF NOT EXISTS ix_kb_chunks_embedding ON kb_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);")

    # 5. Scans Table (PostGIS)
    op.create_table(
        'scans',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('session_id', sa.String(length=100), nullable=True),
        sa.Column('image_key', sa.String(length=255), nullable=False),
        sa.Column('image_hash', sa.String(length=64), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='processing'),
        sa.Column('model_version', sa.String(length=50), nullable=False),
        sa.Column('leaf_detected', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('top_disease_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('diseases.id', ondelete='SET NULL'), nullable=True),
        sa.Column('confidence', sa.Float(), nullable=True),
        sa.Column('heatmap_key', sa.String(length=255), nullable=True),
        sa.Column('locale', sa.String(length=10), nullable=False, server_default='en'),
        sa.Column('geo', geoalchemy2.Geometry(geometry_type='POINT', srid=4326), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_scans_user_id', 'scans', ['user_id'])
    op.create_index('ix_scans_session_id', 'scans', ['session_id'])
    op.create_index('ix_scans_image_hash', 'scans', ['image_hash'])
    op.create_index('ix_scans_created_at', 'scans', ['created_at'])

    # 6. Scan Predictions Table
    op.create_table(
        'scan_predictions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('scan_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('scans.id', ondelete='CASCADE'), nullable=False),
        sa.Column('disease_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('diseases.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('rank', sa.Integer(), nullable=False),
        sa.Column('confidence', sa.Float(), nullable=False),
    )
    op.create_index('ix_scan_predictions_scan_id', 'scan_predictions', ['scan_id'])

    # 7. Feedback Table
    op.create_table(
        'feedback',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('scan_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('scans.id', ondelete='CASCADE'), nullable=False),
        sa.Column('is_correct', sa.Boolean(), nullable=False),
        sa.Column('corrected_disease_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('diseases.id', ondelete='SET NULL'), nullable=True),
        sa.Column('note', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_feedback_scan_id', 'feedback', ['scan_id'], unique=True)

    # 8. News Articles Table
    op.create_table(
        'news_articles',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('url_hash', sa.String(length=64), nullable=False),
        sa.Column('title', sa.String(length=500), nullable=False),
        sa.Column('summary', sa.Text(), nullable=False),
        sa.Column('source', sa.String(length=100), nullable=False),
        sa.Column('url', sa.String(length=1000), nullable=False),
        sa.Column('published_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('language', sa.String(length=10), nullable=False, server_default='en'),
        sa.Column('crops', postgresql.ARRAY(sa.String()), nullable=False, server_default='{}'),
        sa.Column('diseases', postgresql.ARRAY(sa.String()), nullable=False, server_default='{}'),
        sa.Column('state', sa.String(length=100), nullable=True),
        sa.Column('relevance_score', sa.Float(), nullable=False, server_default='1.0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_news_articles_url_hash', 'news_articles', ['url_hash'], unique=True)
    op.create_index('ix_news_articles_state', 'news_articles', ['state'])
    op.create_index('ix_news_articles_published_at_desc', 'news_articles', [sa.text('published_at DESC')])
    op.execute("CREATE INDEX IF NOT EXISTS ix_news_articles_crops_gin ON news_articles USING gin (crops);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_news_articles_diseases_gin ON news_articles USING gin (diseases);")

    # 9. Alerts Table
    op.create_table(
        'alerts',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('article_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('news_articles.id', ondelete='CASCADE'), nullable=True),
        sa.Column('state', sa.String(length=100), nullable=False),
        sa.Column('crop', sa.String(length=100), nullable=False),
        sa.Column('disease', sa.String(length=200), nullable=False),
        sa.Column('severity', sa.String(length=20), nullable=False, server_default='medium'),
        sa.Column('active_until', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_alerts_state', 'alerts', ['state'])

    # 10. Audit Log Table
    op.create_table(
        'audit_log',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('actor', sa.String(length=100), nullable=False),
        sa.Column('action', sa.String(length=100), nullable=False),
        sa.Column('entity', sa.String(length=100), nullable=False),
        sa.Column('ip_hash', sa.String(length=64), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_audit_log_created_at', 'audit_log', ['created_at'])


def downgrade() -> None:
    op.drop_table('audit_log')
    op.drop_table('alerts')
    op.drop_table('news_articles')
    op.drop_table('feedback')
    op.drop_table('scan_predictions')
    op.drop_table('scans')
    op.drop_table('kb_chunks')
    op.drop_table('disease_content')
    op.drop_table('diseases')
    op.drop_table('users')
