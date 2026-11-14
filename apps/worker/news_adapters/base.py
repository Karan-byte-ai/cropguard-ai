import abc
import hashlib
from datetime import datetime, timezone
from typing import List, Optional
from pydantic import BaseModel, Field


class RawArticle(BaseModel):
    title: str
    summary: str
    url: str
    source: str
    published_at: datetime
    image_url: Optional[str] = None


class NormalisedArticle(BaseModel):
    url_hash: str
    title: str
    summary: str
    url: str
    source: str
    published_at: datetime
    language: str = "en"
    crops: List[str] = Field(default_factory=list)
    diseases: List[str] = Field(default_factory=list)
    state: Optional[str] = None
    severity: str = "medium"
    is_outbreak_alert: bool = False
    relevance_score: float = 1.0


class BaseNewsAdapter(abc.ABC):
    """Abstract base class for news and advisory feed adapters (Section 9)."""

    def __init__(self, source_name: str):
        self.source_name = source_name

    @abc.abstractmethod
    async def fetch(self) -> List[RawArticle]:
        """Fetch raw articles from external feed or API."""
        pass

    def compute_url_hash(self, url: str) -> str:
        """Computes SHA-256 hash of URL for deduplication."""
        return hashlib.sha256(url.strip().lower().encode("utf-8")).hexdigest()

    def normalise(self, raw: RawArticle) -> NormalisedArticle:
        """Normalises raw article into uniform schema."""
        return NormalisedArticle(
            url_hash=self.compute_url_hash(raw.url),
            title=raw.title.strip(),
            summary=raw.summary.strip(),
            url=raw.url.strip(),
            source=self.source_name,
            published_at=raw.published_at or datetime.now(timezone.utc),
        )
