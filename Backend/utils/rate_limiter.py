import time
from fastapi import HTTPException

# Simple in-memory store {user_id: [(timestamp1, endpoint), (timestamp2, endpoint)]}
REQUEST_LOG = {}

def check_rate_limit(user_id: str, endpoint: str, limit: int = 5, window: int = 60):
    """
    Enforce per-user rate limiting.
    - user_id: unique identifier (username/email)
    - endpoint: sensitive endpoint name
    - limit: max requests allowed
    - window: time window in seconds
    """
    now = time.time()
    if user_id not in REQUEST_LOG:
        REQUEST_LOG[user_id] = []
    # Keep only recent requests within window
    REQUEST_LOG[user_id] = [req for req in REQUEST_LOG[user_id] if now - req[0] < window]
    if len([req for req in REQUEST_LOG[user_id] if req[1] == endpoint]) >= limit:
        raise HTTPException(status_code=429, detail=f"Too many requests to {endpoint}. Try again later.")
    REQUEST_LOG[user_id].append((now, endpoint))
    return True
