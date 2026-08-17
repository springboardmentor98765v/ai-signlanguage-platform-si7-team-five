from fastapi import APIRouter
from services import notification_services

router = APIRouter(include_in_schema=False)

@router.post("/notifications")
def create_notification(user_id: int, message: str):
    return notification_services.create_notification(user_id, message)
