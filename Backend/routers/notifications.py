from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from db import get_db
from models.business_logic import Notification
from models.users import User
from services.auth import get_current_user
from services.notification_service import create_notification_record

r = APIRouter()


class NotificationCreate(BaseModel):
    user_id: int = Field(gt=0)
    event_type: str = Field(min_length=1, max_length=64)
    title: str = Field(min_length=1, max_length=160)
    message: str = Field(min_length=1, max_length=500)


def _current_db_user(token: dict, db: Session) -> User:
    user = db.query(User).filter(User.username == token.get("sub")).first()
    if not user:
        raise HTTPException(status_code=401, detail="Authenticated user no longer exists")
    return user


@r.post("/", status_code=201)
def create_notification(payload: NotificationCreate, db: Session = Depends(get_db)):
    """Internal event endpoint used by the business-logic service."""
    if not db.get(User, payload.user_id):
        raise HTTPException(status_code=404, detail="User not found")
    notification = create_notification_record(db, **payload.model_dump())
    db.commit()
    db.refresh(notification)
    return {"id": notification.id, "message": "Notification created"}


@r.get("/me")
def my_notifications(db: Session = Depends(get_db), token: dict = Depends(get_current_user)):
    user = _current_db_user(token, db)
    rows = db.query(Notification).filter(Notification.user_id == user.id).order_by(Notification.created_at.desc()).all()
    return [{"id": row.id, "event_type": row.event_type, "title": row.title, "message": row.message, "is_read": row.is_read, "created_at": row.created_at.isoformat()} for row in rows]


@r.put("/{notification_id}/read")
def mark_read(notification_id: int, db: Session = Depends(get_db), token: dict = Depends(get_current_user)):
    try:
        user = _current_db_user(token, db)
        row = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == user.id).first()
        if not row:
            raise HTTPException(status_code=404, detail="Notification not found")
        row.is_read = True
        db.commit()
        return {"id": row.id, "is_read": True, "updated_at": datetime.now(timezone.utc).isoformat()}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to mark notification as read: {str(e)}")
