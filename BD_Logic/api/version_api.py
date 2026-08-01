from fastapi import APIRouter
router = APIRouter()

@router.get("/version")

def version():
    return {
        "application": "AI Sign Language Learning and Assessment Platform",
        "module": "BD_Logic",
        "version": "2.0.0",
        "status": "stable",
    }