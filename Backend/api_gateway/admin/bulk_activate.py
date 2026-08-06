# INTERN 2 CHECKPOINT: Bulk admin operations endpoint
# Provides API endpoint for bulk user activation/deactivation
# This endpoint allows admins to update multiple users at once

from fastapi import APIRouter, Body
from services import bulk_admin_service
from pydantic import BaseModel

router = APIRouter()

class BulkStatusRequest(BaseModel):
    user_ids: list[int]
    active: bool

@router.put("/admin/users/bulk-status")
def bulk_activate(request: BulkStatusRequest):
    return bulk_admin_service.bulk_activate_deactivate(request.user_ids, request.active)
