from fastapi import APIRouter
from services import notification_service

router = APIRouter()

@router.get("/notifications")
def list_notifications(user_id: int):
    return notification_service.list_notifications(user_id)
