from fastapi import APIRouter
from utils import security

router = APIRouter()

@router.post("/auth/login")
def login(username: str, password: str):
    return security.login(username, password)
