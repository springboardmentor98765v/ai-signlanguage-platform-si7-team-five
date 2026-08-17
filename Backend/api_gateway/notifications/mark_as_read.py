from fastapi import APIRouter
from services import notification_services

router = APIRouter(include_in_schema=False)

@router.put("/notifications/{notification_id}/read")
def mark_as_read(notification_id: int):
    return notification_services.mark_as_read(notification_id)
