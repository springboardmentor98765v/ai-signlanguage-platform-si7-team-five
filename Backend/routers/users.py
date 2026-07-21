from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from schemas.user import UserCreate, UserLogin
from services.auth import hash_password, verify_password, create_access_token
from models.users import User
from db import get_db
from services.auth import get_current_user
from typing import Dict
r = APIRouter()

@r.get("/me")
def get_me(user: Dict = Depends(get_current_user)):
    return user
@r.post("/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    existing = (
        db.query(User)
        .filter((User.username == user.username) | (User.email == user.email))
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered",
        )

    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hash_password(user.password),
        role=user.role,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    token = create_access_token(data={"sub": db_user.username, "role": db_user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "username": db_user.username,
        "email": db_user.email,
        "role": db_user.role,
    }


@r.post("/login")
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    identifier = user.username
    db_user = (
        db.query(User)
        .filter((User.username == identifier) | (User.email == identifier))
        .first()
    )
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    token = create_access_token(data={"sub": db_user.username, "role": db_user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "username": db_user.username,
        "email": db_user.email,
        "role": db_user.role,
    }
