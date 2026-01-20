"""FastAPI application entry point with observability."""

import asyncio
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from prometheus_fastapi_instrumentator import Instrumentator
from sqlalchemy import text

from app import __version__
from app.config import settings
from app.database import engine
from app.logging_config import configure_logging
from app.middleware import RequestLoggingMiddleware
from app.rate_limit import RateLimitMiddleware
from app.routers import auth, posts, users

# Configure structured logging
configure_logging()
logger = structlog.get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup/shutdown events."""
    # Startup
    logger.info(
        "application_starting",
        version=__version__,
        environment=settings.environment,
        python_version="3.12",
    )

    # Check database connection
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        logger.info("database_connection_ok")
    except Exception as e:
        logger.error("database_connection_failed", error=str(e))
        # Don't fail startup - let health check handle it

    logger.info("application_started")

    yield

    # Shutdown
    logger.info("application_shutting_down")
    await engine.dispose()
    logger.info("application_stopped")


app = FastAPI(
    title="Microblog API",
    description="Modern Python backend demonstrating FastAPI + SQLAlchemy patterns",
    version=__version__,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Add rate limiting (before logging for better performance)
app.add_middleware(RateLimitMiddleware, requests_per_second=10.0, burst=20)

# Add observability middleware
app.add_middleware(RequestLoggingMiddleware)

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(posts.router)

# Prometheus metrics instrumentation
Instrumentator().instrument(app).expose(app, endpoint="/prometheus")


@app.get("/")
async def root() -> dict[str, str]:
    """Root endpoint - returns basic status."""
    return {"status": "healthy", "version": __version__}


@app.get("/health")
async def health() -> JSONResponse:
    """
    Health check endpoint with database connectivity test.

    Returns:
    - 200: Service is healthy
    - 503: Service is unhealthy (database down)
    """
    import os
    import psutil
    
    health_status = {
        "status": "healthy",
        "version": __version__,
        "environment": settings.environment,
        "checks": {},
        "system": {},
    }

    # Check database connectivity
    try:
        start = asyncio.get_event_loop().time()
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        db_latency = (asyncio.get_event_loop().time() - start) * 1000
        health_status["checks"]["database"] = {
            "status": "ok",
            "latency_ms": round(db_latency, 2),
        }
    except Exception as e:
        logger.error("health_check_db_failed", error=str(e))
        health_status["status"] = "unhealthy"
        health_status["checks"]["database"] = {
            "status": "error",
            "error": str(e),
        }
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content=health_status,
        )
    
    # Add system metrics
    try:
        process = psutil.Process(os.getpid())
        health_status["system"] = {
            "cpu_percent": process.cpu_percent(interval=0.1),
            "memory_mb": round(process.memory_info().rss / 1024 / 1024, 2),
            "threads": process.num_threads(),
        }
    except Exception:
        pass  # System metrics are optional

    return JSONResponse(status_code=status.HTTP_200_OK, content=health_status)


@app.get("/metrics")
async def metrics(request: Request):
    """
    Basic metrics endpoint.

    In production, this would integrate with Prometheus/StatsD.
    For now, returns request metadata for demonstration.
    """
    return {
        "request_id": getattr(request.state, "request_id", None),
        "environment": settings.environment,
        "version": __version__,
    }
