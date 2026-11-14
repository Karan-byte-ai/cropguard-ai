import time
import uuid
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("cropguard.middleware")


class RequestContextMiddleware(BaseHTTPMiddleware):
    """
    Middleware that assigns a unique request-id to every incoming request,
    attaches security headers to responses, and logs request timing.
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        request.state.request_id = request_id

        start_time = time.perf_counter()
        response: Response = await call_next(request)
        process_time_ms = (time.perf_counter() - start_time) * 1000

        # Security Headers (Section 11)
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(self), microphone=(), geolocation=()"
        response.headers["X-Process-Time"] = f"{process_time_ms:.2f}ms"

        # Log request info
        extra = {"request_id": request_id}
        logger.info(
            f"{request.method} {request.url.path} -> {response.status_code} ({process_time_ms:.2f}ms)",
            extra=extra
        )

        return response
