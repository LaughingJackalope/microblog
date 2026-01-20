#!/usr/bin/env python3
"""
Stress test script to verify rate limiting is working correctly.

Tests the token bucket algorithm by sending bursts of requests
and verifying we get 429 responses when rate limits are exceeded.
"""

import asyncio
import time
from collections import Counter

import httpx


async def make_request(client: httpx.AsyncClient, url: str) -> tuple[int, dict]:
    """Make a single request and return status code and headers."""
    try:
        response = await client.get(url)
        return response.status_code, dict(response.headers)
    except Exception as e:
        return 0, {"error": str(e)}


async def burst_test(url: str, num_requests: int, delay: float = 0.0):
    """
    Send a burst of requests and analyze results.
    
    Args:
        url: URL to test
        num_requests: Number of requests to send
        delay: Delay between requests in seconds
    """
    print(f"\n{'='*60}")
    print(f"Burst Test: {num_requests} requests")
    if delay:
        print(f"Delay: {delay}s between requests")
    print(f"{'='*60}\n")
    
    async with httpx.AsyncClient(timeout=5.0) as client:
        start_time = time.time()
        
        # Send requests
        tasks = []
        for i in range(num_requests):
            if delay:
                await asyncio.sleep(delay)
            tasks.append(make_request(client, url))
        
        results = await asyncio.gather(*tasks)
        
        elapsed = time.time() - start_time
        
        # Analyze results
        status_codes = [r[0] for r in results]
        status_counter = Counter(status_codes)
        
        print(f"Results:")
        print(f"  Total requests: {num_requests}")
        print(f"  Time elapsed: {elapsed:.2f}s")
        print(f"  Effective rate: {num_requests/elapsed:.2f} req/s")
        print(f"\nStatus codes:")
        for code, count in sorted(status_counter.items()):
            code_name = {
                200: "OK",
                429: "Rate Limited",
                0: "Error/Timeout",
            }.get(code, "Unknown")
            print(f"  {code} ({code_name}): {count} ({count/num_requests*100:.1f}%)")
        
        # Check rate limit headers from first successful response
        for status, headers in results:
            if status == 200:
                if "x-ratelimit-limit" in headers:
                    print(f"\nRate Limit Headers:")
                    print(f"  Limit: {headers.get('x-ratelimit-limit')}")
                    print(f"  Remaining: {headers.get('x-ratelimit-remaining')}")
                break
        
        # Check if rate limiting is working
        if status_counter.get(429, 0) > 0:
            print(f"\n✓ Rate limiting is working! {status_counter[429]} requests were throttled.")
        else:
            print(f"\n✗ No rate limiting detected. All requests succeeded.")
        
        return status_counter


async def main():
    """Run multiple stress tests."""
    base_url = "http://localhost:8000"
    test_url = f"{base_url}/metrics"
    
    print(f"Testing rate limiter at: {test_url}")
    print(f"Expected limits: 10 req/s sustained, burst of 20")
    
    # Test 1: Rapid burst (should hit rate limit)
    print("\n" + "="*60)
    print("TEST 1: Rapid Burst (30 requests instantly)")
    print("Expected: ~20 success, ~10 rate limited")
    await burst_test(test_url, 30, delay=0.0)
    
    # Wait for tokens to refill
    print("\nWaiting 3s for token bucket to refill...")
    await asyncio.sleep(3)
    
    # Test 2: Sustained rate (should mostly succeed)
    print("\n" + "="*60)
    print("TEST 2: Sustained Rate (30 requests at 0.08s intervals)")
    print("Expected: Most requests succeed at ~12.5 req/s")
    await burst_test(test_url, 30, delay=0.08)
    
    # Wait for tokens to refill
    print("\nWaiting 3s for token bucket to refill...")
    await asyncio.sleep(3)
    
    # Test 3: Slow rate (should all succeed)
    print("\n" + "="*60)
    print("TEST 3: Slow Rate (20 requests at 0.15s intervals)")
    print("Expected: All requests succeed at ~6.7 req/s")
    await burst_test(test_url, 20, delay=0.15)
    
    print("\n" + "="*60)
    print("Stress testing complete!")
    print("="*60)


if __name__ == "__main__":
    asyncio.run(main())
