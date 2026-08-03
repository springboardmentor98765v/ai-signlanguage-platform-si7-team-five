from fastapi import HTTPException
from utils.validation import validate_string
# Example schema (SQLite/Postgres)
NOTIFICATIONS = []

def create_notification(user_id: int, message: str):
    message = validate_string(message, "Notification message", max_length=200)
    notification = {
        "id": len(NOTIFICATIONS) + 1,
        "user_id": user_id,
        "message": message,
        "read": False
    }
    NOTIFICATIONS.append(notification)
    return {"message": "Notification created", "notification": notification}

def list_notifications(user_id: int):
    return [n for n in NOTIFICATIONS if n["user_id"] == user_id]

def mark_as_read(notification_id: int):
    for n in NOTIFICATIONS:
        if n["id"] == notification_id:
            n["read"] = True
            return {"message": "Notification marked as read"}
    raise HTTPException(status_code=404, detail="Notification not found")

def notify_event(user_id: int, event_type: str):
    from services.event_hooks import trigger_event
    return trigger_event(user_id, event_type)