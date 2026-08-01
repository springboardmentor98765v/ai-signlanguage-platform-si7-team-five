from fastapi import APIRouter
from services import notification_service

router = APIRouter()

@router.put("/notifications/{notification_id}/read")
def mark_as_read(notification_id: int):
    return notification_service.mark_as_read(notification_id)
