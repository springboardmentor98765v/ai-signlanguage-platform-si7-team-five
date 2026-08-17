from fastapi import APIRouter
from services import notification_services

router = APIRouter(include_in_schema=False)

@router.get("/notifications")
def list_notifications(user_id: int):
    return notification_services.list_notifications(user_id)
