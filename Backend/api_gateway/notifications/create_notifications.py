from fastapi import APIRouter
from services import notification_services

router = APIRouter()

@router.post("/notifications")
def create_notification(user_id: int, message: str):
    return notification_services.create_notification(user_id, message)
