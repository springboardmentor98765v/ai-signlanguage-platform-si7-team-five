from fastapi import APIRouter, HTTPException
from pydantic import BaseModel 
from typing import List

r  = APIRouter()

class UserSummary(BaseModel):
    user_id: int
    name: str
    role : str
    active: bool

class StatusUpdateResponse(BaseModel):
    message: str
    
@r.get("/users", response_model=List[UserSummary])
def view_users():
    return [
        UserSummary(user_id=1, name="Amala", role="Learner", active=False),
        UserSummary(user_id=2, name="Bharath", role="Instructor", active=True),
    ]
    
@r.put("/users/{user_id}/role")
def update_user_role(user_id: int, new_role: str):
    if new_role not in ["Learner", "Instructor", "Admin"]:
        raise HTTPException(status_code=400, detail="Invalid role")
   
    return {"message": f"User role changed to {new_role} for user {user_id}"}

@r.put("/users/{user_id}/status", response_model=StatusUpdateResponse)
def activate_deactivate(user_id: int, active: bool):
    
    return {"message": f"User {user_id} status updated to {'Active' if active else 'Inactive'}"}