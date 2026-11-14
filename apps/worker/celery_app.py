import os
from celery import Celery
from celery.schedules import crontab

redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "cropguard_worker",
    broker=redis_url,
    backend=redis_url,
    include=["apps.worker.tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    beat_schedule={
        "ingest-crop-news-every-30-mins": {
            "task": "apps.worker.tasks.ingest_news_task",
            "schedule": crontab(minute="*/30"),
        },
        "cleanup-unregistered-scans-daily": {
            "task": "apps.worker.tasks.cleanup_expired_scans",
            "schedule": crontab(hour="3", minute="0"),
        },
    },
)
