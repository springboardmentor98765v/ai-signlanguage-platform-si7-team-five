from fastapi import APIRouter
from services import bulk_admin_service

router = APIRouter()

@router.put("/admin/users/bulk-status")
def bulk_activate(user_ids: list[int], active: bool):
    return bulk_admin_service.bulk_activate_deactivate(user_ids, active)
