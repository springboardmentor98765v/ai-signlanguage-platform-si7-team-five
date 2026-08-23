from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List

from db import get_db
from models.users import User
from services.auth import get_current_user

r = APIRouter()

VALID_ROLES = {"Learner", "Instructor", "Admin", "Accessibility Trainer"}


class UserSummary(BaseModel):
    user_id: int
    name: str
    email: str
    role: str
    active: bool


class StatusUpdateResponse(BaseModel):
    message: str


def _admin(token: dict, db: Session) -> User:
    admin = db.query(User).filter_by(username=token.get("sub")).first()
    if not admin:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authenticated user no longer exists")
    if admin.role != "Admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access is required")
    return admin


@r.get("/users", response_model=List[UserSummary])
def view_users(db: Session = Depends(get_db), token: dict = Depends(get_current_user)):
    """Real, live list of every user account. Admin only."""
    _admin(token, db)
    users = db.query(User).order_by(User.username).all()
    return [
        UserSummary(user_id=u.id, name=u.username, email=u.email, role=u.role, active=u.is_active)
        for u in users
    ]


@r.put("/users/{user_id}/role")
def update_user_role(user_id: int, new_role: str, db: Session = Depends(get_db), token: dict = Depends(get_current_user)):
    _admin(token, db)
    if new_role not in VALID_ROLES:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of: {', '.join(sorted(VALID_ROLES))}")
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = new_role
    db.commit()
    return {"message": f"User role changed to {new_role} for user {user_id}"}


@r.put("/users/{user_id}/status", response_model=StatusUpdateResponse)
def activate_deactivate(user_id: int, active: bool, db: Session = Depends(get_db), token: dict = Depends(get_current_user)):
    _admin(token, db)
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = active
    db.commit()
    return {"message": f"User {user_id} status updated to {'Active' if active else 'Inactive'}"}