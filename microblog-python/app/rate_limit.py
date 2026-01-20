"""Rate limiting middleware using token bucket algorithm."""

import time
from collections import defaultdict
from typing import Callable

import structlog
from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

logger = structlog.get_logger(__name__)


class TokenBucket:
    """
    Token bucket for rate limiting.
    
    Allows bursts up to max_tokens, then refills at rate tokens/second.
    """

    def __init__(self, rate: float, max_tokens: int):
        """
        Initialize token bucket.
        
        Args:
            rate: Tokens added per second
            max_tokens: Maximum tokens in bucket (burst capacity)
        """
        self.rate = rate
        self.max_tokens = max_tokens
        self.tokens = max_tokens
        self.last_update = time.time()

    def consume(self, tokens: int = 1) -> bool:
        """
        Try to consume tokens from the bucket.
        
        Args:
            tokens: Number of tokens to consume
            
        Returns:
            True if tokens were consumed, False if insufficient tokens
        """
        now = time.time()
        elapsed = now - self.last_update
        
        # Refill tokens based on elapsed time
        self.tokens = min(self.max_tokens, self.tokens + elapsed * self.rate)
        self.last_update = now

        if self.tokens >= tokens:
            self.tokens -= tokens
            return True
        return False


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Rate limiting middleware.
    
    Limits requests per IP address using token bucket algorithm.
    Configurable rate and burst capacity.
    """

    def __init__(
        self,
        app: ASGIApp,
        requests_per_second: float = 10.0,
        burst: int = 20,
    ):
        """
        Initialize rate limiter.
        
        Args:
            app: ASGI application
            requests_per_second: Sustained request rate per IP
            burst: Maximum burst size (tokens in bucket)
        """
        super().__init__(app)
        self.requests_per_second = requests_per_second
        self.burst = burst
        self.buckets: dict[str, TokenBucket] = defaultdict(
            lambda: TokenBucket(requests_per_second, burst)
        )
        logger.info(
            "rate_limiter_initialized",
            requests_per_second=requests_per_second,
            burst=burst,
        )

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Get client IP
        client_ip = request.client.host if request.client else "unknown"
        
        # Skip rate limiting for health checks
        if request.url.path in ["/health", "/healthz", "/"]:
            return await call_next(request)

        # Get or create bucket for this IP
        bucket = self.buckets[client_ip]

        # Try to consume a token
        if not bucket.consume():
            logger.warning(
                "rate_limit_exceeded",
                client_ip=client_ip,
                path=request.url.path,
            )
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "error": "Rate limit exceeded",
                    "message": f"Too many requests. Limit: {self.requests_per_second} requests/second",
                },
                headers={
                    "Retry-After": "1",
                    "X-RateLimit-Limit": str(int(self.requests_per_second)),
                    "X-RateLimit-Remaining": "0",
                },
            )

        # Process request
        response = await call_next(request)
        
        # Add rate limit headers
        response.headers["X-RateLimit-Limit"] = str(int(self.requests_per_second))
        response.headers["X-RateLimit-Remaining"] = str(int(bucket.tokens))
        
        return response
