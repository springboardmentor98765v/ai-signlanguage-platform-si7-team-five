#day7

from fastapi import Request, HTTPException

from fastapi.responses import JSONResponse

def init_error_handlers(app):
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": True, "messagae": exc.detail},
        )
    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=500,
            content={"error": True, "message": str(exc)},
        )