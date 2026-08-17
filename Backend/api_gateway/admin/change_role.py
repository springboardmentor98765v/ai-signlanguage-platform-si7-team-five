from fastapi import APIRouter
from services import admin_services

router = APIRouter(include_in_schema=False)

@router.put("/admin/users/{user_id}/role")
def change_role(user_id: int, role: str):
    return admin_services.update_user_role(user_id, role)
