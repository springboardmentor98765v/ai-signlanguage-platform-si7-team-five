from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
def health():
    return{
        "status": "healthy",
        "bd_logic": "Running",
        "database": "Connected"
    }