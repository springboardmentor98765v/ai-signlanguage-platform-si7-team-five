from fastapi import Request, HTTPException
from time import time

requests_log = {}

def rate_limiter(request: Request, limit: int = 5, window: int = 60):
    """Limit only sensitive auth routes; normal learning activity must not share one IP quota."""
    if request.url.path not in {"/auth/login", "/auth/user/forgot-password", "/auth/user/reset-password"}:
        return
    client_ip = request.headers.get("Authorization") or request.client.host
    current_time = time()

    if client_ip not in requests_log:
        requests_log[client_ip] = []

    # Remove timestamps that are outside the time window
    requests_log[client_ip] = [timestamp for timestamp in requests_log[client_ip] if current_time - timestamp < window]

    if len(requests_log[client_ip]) >= limit:
        raise HTTPException(status_code=429, detail="Too many requests")

    # Log the current request timestamp
    requests_log[client_ip].append(current_time)
