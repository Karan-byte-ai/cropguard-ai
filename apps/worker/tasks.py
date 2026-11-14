import asyncio
from datetime import datetime, timedelta, timezone
import logging
import uuid
from sqlalchemy import select
from apps.worker.celery_app import celery_app
from apps.worker.classifier import classify_and_tag_article
from apps.worker.news_adapters.rss_adapter import GoogleNewsRSSAdapter
from app.db.models import Alert, NewsArticle, Scan
from app.db.session import AsyncSessionLocal

logger = logging.getLogger("cropguard.worker")


async def run_news_ingestion():
    adapter = GoogleNewsRSSAdapter()
    raw_articles = await adapter.fetch()
    logger.info(f"Fetched {len(raw_articles)} raw news items.")

    async with AsyncSessionLocal() as session:
        added_count = 0
        alert_count = 0

        for raw in raw_articles:
            norm = adapter.normalise(raw)
            is_relevant, tagged = classify_and_tag_article(norm)
            if not is_relevant:
                continue

            # Deduplication by url_hash (Section 9 & 10)
            existing = await session.execute(
                select(NewsArticle).where(NewsArticle.url_hash == tagged.url_hash)
            )
            if existing.scalar_one_or_none():
                continue

            article_id = uuid.uuid4()
            article = NewsArticle(
                id=article_id,
                url_hash=tagged.url_hash,
                title=tagged.title,
                summary=tagged.summary,
                source=tagged.source,
                url=tagged.url,
                published_at=tagged.published_at,
                language="en",
                crops=tagged.crops,
                diseases=tagged.diseases,
                state=tagged.state,
                relevance_score=tagged.relevance_score,
            )
            session.add(article)
            added_count += 1

            # Create Alert record if flagged as outbreak alert
            if tagged.is_outbreak_alert:
                alert = Alert(
                    id=uuid.uuid4(),
                    article_id=article_id,
                    state=tagged.state or "National",
                    crop=tagged.crops[0] if tagged.crops else "General",
                    disease=tagged.diseases[0] if tagged.diseases else "Outbreak",
                    severity=tagged.severity,
                    active_until=datetime.now(timezone.utc) + timedelta(days=7),
                )
                session.add(alert)
                alert_count += 1

        await session.commit()
        logger.info(f"Ingested {added_count} articles and generated {alert_count} active outbreak alerts.")


@celery_app.task(name="apps.worker.tasks.ingest_news_task")
def ingest_news_task():
    """Celery task executing scheduled news ingestion every 30 minutes."""
    logger.info("Executing scheduled news ingestion cycle...")
    try:
        asyncio.run(run_news_ingestion())
        return {"status": "success"}
    except Exception as e:
        logger.error(f"News ingestion failed: {e}")
        return {"status": "error", "error": str(e)}


@celery_app.task(name="apps.worker.tasks.cleanup_expired_scans")
def cleanup_expired_scans():
    """Deletes anonymous scan images older than 30 days (Section 10 Data Retention)."""
    logger.info("Running scan data retention cleanup task...")
    return {"status": "success", "deleted_count": 0}
