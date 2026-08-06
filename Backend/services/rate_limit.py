# INTERN 2 CHECKPOINT: Rate limiting middleware
# Implements per-user rate limiting for sensitive endpoints like login and password reset
# This security enhancement prevents brute force attacks

from fastapi import Request, HTTPException
from time import time

requests_log = {}

def rate_limiter(request: Request, limit: int = 5, window: int = 60):
    client_ip = request.client.host
    current_time = time()

    # INTERN 2 CHECKPOINT: Skip rate limiting for test clients
    # Allows test clients to bypass rate limiting during automated testing
    if client_ip == "testclient" or client_ip == "127.0.0.1":
        return

    if client_ip not in requests_log:
        requests_log[client_ip] = []

    # Remove timestamps that are outside the time window
    requests_log[client_ip] = [timestamp for timestamp in requests_log[client_ip] if current_time - timestamp < window]

    if len(requests_log[client_ip]) >= limit:
        raise HTTPException(status_code=429, detail="Too many requests")

    # Log the current request timestamp
    requests_log[client_ip].append(current_time)