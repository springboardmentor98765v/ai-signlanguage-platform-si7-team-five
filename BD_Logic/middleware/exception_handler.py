from fastapi import Request
from fastapi.responses import JSONResponse

from logger.logger import logger


async def exception_handler(
    request: Request, 
    exc: Exception
):
    logger.error(str(exc))
    return JSONResponse(
        status_code=500,
        content={
            "status": "failed",
            "message": "Internal Server Error"
        }
    )