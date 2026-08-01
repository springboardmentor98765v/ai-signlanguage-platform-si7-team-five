from fastapi import APIRouter
from services import notification_service

router = APIRouter()

@router.post("/notifications")
def create_notification(user_id: int, message: str):
    return notification_service.create_notification(user_id, message)
