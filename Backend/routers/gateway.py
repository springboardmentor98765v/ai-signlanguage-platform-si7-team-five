from fastapi import APIRouter, Request
import time

r = APIRouter()

@r.middleware("http")
async def log_requests(request: Request, call_next):
    from services.rate_limit import rate_limiter
    rate_limiter(request)
    return await call_next(request)