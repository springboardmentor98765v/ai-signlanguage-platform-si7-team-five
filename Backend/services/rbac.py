from fastapi import APIRouter, Depends, HTTPException, status
from functools import wraps

r = APIRouter()

def role_required(required_role: str):
    def get_current_user(user=None):
        if user is None or user.get("role") != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return user
    return get_current_user

@r.post("/courses/create")
def create_course(user=Depends(role_required("Instructor"))):
    return {"message": "Course created"}

@r.post("/courses/enroll")
def enroll_course(user=Depends(role_required("Learner"))):
    return {"message": "Enrolled successfully"}
