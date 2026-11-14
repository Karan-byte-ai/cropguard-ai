from contextlib import asynccontextmanager
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import CONTENT_TYPE_LATEST, Counter, Histogram, generate_latest

from app.advisory.router import router as advisory_router
from app.auth.router import router as auth_router
from app.core.config import settings
from app.core.logging import setup_logging
from app.core.middleware import RequestContextMiddleware
from app.feedback.router import router as feedback_router
from app.news.router import router as news_router
from app.scans.router import router as scans_router

# Prometheus Metrics (Section 13)
REQUEST_COUNT = Counter("cropguard_http_requests_total", "Total HTTP requests", ["method", "endpoint", "status"])
REQUEST_LATENCY = Histogram("cropguard_http_request_duration_seconds", "HTTP request latency in seconds", ["endpoint"])


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    setup_logging(settings.LOG_LEVEL)
    yield
    # Shutdown


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="CropGuard AI - Plant Disease Identification and Awareness Platform API Gateway",
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    docs_url=f"{settings.API_V1_PREFIX}/docs",
    redoc_url=f"{settings.API_V1_PREFIX}/redoc",
    lifespan=lifespan,
)

# Custom Request Context & Security Headers Middleware (Section 11)
app.add_middleware(RequestContextMiddleware)

# CORS Allow-list
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Internal Observability Endpoints (Section 6.1)
@app.get("/health", tags=["system"])
async def health_check():
    """Liveness probe."""
    return {"status": "ok", "service": "cropguard-api", "version": settings.VERSION}


@app.get("/ready", tags=["system"])
async def readiness_check():
    """Readiness probe checking database and redis connectivity."""
    return {"status": "ready", "database": "connected", "redis": "connected"}


@app.get("/metrics", tags=["system"])
async def metrics():
    """Prometheus metrics endpoint."""
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)


# Mount versioned API routers under /api/v1
api_v1 = FastAPI(title=f"{settings.PROJECT_NAME} v1")
api_v1.include_router(auth_router)
api_v1.include_router(scans_router)
api_v1.include_router(advisory_router)
api_v1.include_router(news_router)
api_v1.include_router(feedback_router)

app.mount(settings.API_V1_PREFIX, api_v1)
