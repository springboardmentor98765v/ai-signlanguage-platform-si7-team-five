from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
import os

security = HTTPBearer()

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Skip authentication for health check and public endpoints
        public_paths = [
            "/docs",
            "/openapi.json",
            "/api/v1/health",
            "/api/v1/version"
        ]

        if any(request.url.path.startswith(path) for path in public_paths):
            return await call_next(request)

        # Check for API key in headers (optional - for practice/testing)
        api_key = request.headers.get("X-API-Key")
        if api_key and api_key == os.getenv("API_KEY", "dev-api-key"):
            return await call_next(request)

        # For development/testing, allow requests without auth
        # In production, uncomment the following line to enforce authentication
        # raise HTTPException(status_code=401, detail="Unauthorized")

        return await call_next(request)

async def verify_token(credentials: HTTPAuthorizationCredentials = security):
    """Verify Bearer token (placeholder for actual JWT verification)"""
    token = credentials.credentials
    # Add actual token verification logic here
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return token