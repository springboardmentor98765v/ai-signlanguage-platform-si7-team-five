from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
import os
from jose import JWTError, jwt
from datetime import datetime, timedelta

# Use same configuration as Backend
SECRET_KEY = os.getenv("SECRET_KEY", "")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

security = HTTPBearer(auto_error=False)

def decode_token(token: str):
    """Decode JWT token using same logic as Backend"""
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Skip authentication for health check and public endpoints
        public_paths = [
            "/docs",
            "/openapi.json",
            "/api/v1/health",
            "/api/v1/version",
            "/api/v1/export",
            "/api/v1/certificate"
        ]

        if any(request.url.path.startswith(path) for path in public_paths):
            return await call_next(request)

        # Check for Bearer token in Authorization header
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            payload = decode_token(token)
            if payload:
                # Valid token, attach user info to request state
                request.state.user = payload
                return await call_next(request)
            else:
                return JSONResponse(
                    status_code=401,
                    content={"detail": "Invalid or expired token"}
                )

        return JSONResponse(status_code=401, content={"detail": "Invalid or missing authorization token"})

async def verify_token(credentials: HTTPAuthorizationCredentials = security):
    """Verify Bearer token using same logic as Backend"""
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing authorization token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_token(credentials.credentials)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    return payload
