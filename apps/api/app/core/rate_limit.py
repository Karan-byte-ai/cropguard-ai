import time
import logging
from typing import Optional
import redis.asyncio as aioredis
from fastapi import HTTPException, Request, status
from app.core.config import settings
from app.core.security import hash_ip

logger = logging.getLogger("cropguard.ratelimit")

_redis_client: Optional[aioredis.Redis] = None


async def get_redis_client() -> Optional[aioredis.Redis]:
    global _redis_client
    if _redis_client is None:
        try:
            _redis_client = aioredis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True,
                socket_timeout=2.0
            )
            await _redis_client.ping()
        except Exception as e:
            logger.warning(f"Could not connect to Redis for rate limiting: {e}")
            _redis_client = None
    return _redis_client


class RateLimiter:
    """Token-bucket rate limiter backed by Redis."""

    def __init__(self, requests_per_minute: int = 60, prefix: str = "rl"):
        self.rpm = requests_per_minute
        self.prefix = prefix

    async def __call__(self, request: Request) -> bool:
        client_ip = request.client.host if request.client else "127.0.0.1"
        ip_digest = hash_ip(client_ip)
        
        # Check user auth if present
        user_id = getattr(request.state, "user_id", None)
        key_target = f"user:{user_id}" if user_id else f"ip:{ip_digest}"
        key = f"{self.prefix}:{key_target}:{int(time.time() // 60)}"

        r = await get_redis_client()
        if r is None:
            # Degrade gracefully if cache is down
            return True

        try:
            current_count = await r.incr(key)
            if current_count == 1:
                await r.expire(key, 60)
            if current_count > self.rpm:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Rate limit exceeded. Please try again shortly."
                )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Redis rate limiting error: {e}")
            return True
        return True
