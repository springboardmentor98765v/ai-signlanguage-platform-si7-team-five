from fastapi import APIRouter
from services import admin_service

router = APIRouter()

@router.put("/admin/users/{user_id}/role")
def change_role(user_id: int, role: str):
    return admin_service.change_role(user_id, role)
