import feedparser
from datetime import datetime, timezone
import logging
from typing import List
from apps.worker.news_adapters.base import BaseNewsAdapter, RawArticle

logger = logging.getLogger("cropguard.worker.rss")


class GoogleNewsRSSAdapter(BaseNewsAdapter):
    """Fetches crop disease outbreak news via Google News RSS queries."""

    def __init__(self, queries: List[str] = None):
        super().__init__(source_name="Google News Agriculture RSS")
        self.queries = queries or [
            "crop disease India",
            "wheat yellow rust Punjab",
            "tomato blight Maharashtra",
            "locust alert India",
        ]

    async def fetch(self) -> List[RawArticle]:
        articles: List[RawArticle] = []
        for q in self.queries:
            rss_url = f"https://news.google.com/rss/search?q={q.replace(' ', '+')}&hl=en-IN&gl=IN&ceid=IN:en"
            try:
                feed = feedparser.parse(rss_url)
                for entry in feed.entries[:5]:
                    title = entry.get("title", "")
                    link = entry.get("link", "")
                    summary = entry.get("summary", "")
                    pub_parsed = entry.get("published_parsed")

                    if pub_parsed:
                        pub_dt = datetime(*pub_parsed[:6], tzinfo=timezone.utc)
                    else:
                        pub_dt = datetime.now(timezone.utc)

                    articles.append(
                        RawArticle(
                            title=title,
                            summary=summary,
                            url=link,
                            source="Google News (ICAR/Agri)",
                            published_at=pub_dt,
                        )
                    )
            except Exception as e:
                logger.warning(f"Error fetching RSS for query '{q}': {e}")
        return articles
