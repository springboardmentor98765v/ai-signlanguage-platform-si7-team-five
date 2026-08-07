from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from logger.logger import logger
import traceback

async def exception_handler(
    request: Request,
    exc: Exception
):
    logger.error(f"Error: {str(exc)}")
    logger.error(f"Traceback: {traceback.format_exc()}")

    # Handle HTTP exceptions with their status codes
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "status": "failed",
                "message": exc.detail,
                "status_code": exc.status_code
            }
        )

    # Handle 404 Not Found
    if "not found" in str(exc).lower():
        return JSONResponse(
            status_code=404,
            content={
                "status": "failed",
                "message": "Resource not found",
                "status_code": 404
            }
        )

    # Handle 401 Unauthorized
    if "unauthorized" in str(exc).lower() or "auth" in str(exc).lower():
        return JSONResponse(
            status_code=401,
            content={
                "status": "failed",
                "message": "Unauthorized access",
                "status_code": 401
            }
        )

    # Handle all other exceptions as 500 Internal Server Error
    return JSONResponse(
        status_code=500,
        content={
            "status": "failed",
            "message": "Internal Server Error",
            "status_code": 500
        }
    )