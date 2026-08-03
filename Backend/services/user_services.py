from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
import smtplib, os
from utils.rate_limiter import check_rate_limit
r = APIRouter()

class UpdateProfileRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

@r.put("/user/update-profile")
def update_profile(request: UpdateProfileRequest):
    check_rate_limit(user_id=request.email, endpoint="/user/update-profile")
    return {"message": f"Profile updated for {request.email}"}

class ForgotPasswordRequest(BaseModel):
    email: EmailStr
    
@r.post("/user/forgot-password")
def forgot_password(request: ForgotPasswordRequest):    
    reset_link = f"http://localhost:8000/reset-password?email={request.email}"
    print(f"[DEBUG] Reset link : {reset_link}")
    return {"message": "Password reset link generated."}


@r.post("/user/reset-password")

def change_password(email: str, old_password: str, new_password: str):
    return {"message": "Password changed successfully."} 

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@r.post("/auth/login")
def login(request: LoginRequest):
    # Apply per-user rate limiting
    check_rate_limit(user_id=request.email, endpoint="login", limit=5, window=60)
    if request.password != "password123":  # Dummy check
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"message": "Login successful"}

