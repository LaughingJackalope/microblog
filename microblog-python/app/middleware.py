"""Middleware for observability: request logging, tracing, error tracking."""

import time
import uuid
from typing import Callable

import structlog
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

logger = structlog.get_logger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware for logging all HTTP requests with timing and tracing.

    Adds:
    - Request ID for tracing
    - Timing information
    - Request/response logging
    - Error logging
    """

    def __init__(self, app: ASGIApp):
        super().__init__(app)

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Generate request ID for tracing
        request_id = str(uuid.uuid4())

        # Add request ID to structlog context
        structlog.contextvars.bind_contextvars(
            request_id=request_id,
            path=request.url.path,
            method=request.method,
        )

        # Add request ID to request state for access in endpoints
        request.state.request_id = request_id

        # Log incoming request
        logger.info(
            "request_started",
            client_host=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
        )

        # Time the request
        start_time = time.time()

        try:
            # Process request
            response = await call_next(request)

            # Calculate duration
            duration = time.time() - start_time

            # Add request ID to response headers for client-side tracing
            response.headers["X-Request-ID"] = request_id

            # Log successful request
            logger.info(
                "request_completed",
                status_code=response.status_code,
                duration_ms=round(duration * 1000, 2),
            )

            return response

        except Exception as exc:
            # Calculate duration even for errors
            duration = time.time() - start_time

            # Log error
            logger.error(
                "request_failed",
                error=str(exc),
                error_type=type(exc).__name__,
                duration_ms=round(duration * 1000, 2),
                exc_info=True,
            )

            # Re-raise to let FastAPI's exception handlers deal with it
            raise

        finally:
            # Clear context vars for next request
            structlog.contextvars.clear_contextvars()


class HealthCheckFilter:
    """
    Filter to reduce noise from health check logs.

    Health checks happen frequently and don't need detailed logging.
    """

    def __init__(self, app: ASGIApp, paths: list[str] | None = None):
        self.app = app
        self.health_check_paths = paths or ["/health", "/healthz", "/"]

    async def __call__(self, request: Request, call_next: Callable) -> Response:
        # Skip detailed logging for health checks
        if request.url.path in self.health_check_paths:
            return await call_next(request)

        # For other paths, use normal middleware
        return await RequestLoggingMiddleware(self.app).dispatch(request, call_next)
