from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
import smtplib, os

r = APIRouter()

class UpdateProfileRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

@r.put("/user/update-profile")
def update_profile(request: UpdateProfileRequest):
   
    return {"message": f"Profile updated for {request.email}"}

class ForgotPasswordRequest(BaseModel):
    email: EmailStr
    
@r.post("/user/forgot-password")
def forgot_password(request: ForgotPasswordRequest):    
    reset_link = f"http://localhost:8000/reset-password?email={request.email}"
    print(f"[DEBUG] Reset link : {reset_link}")
    return {"message": "Password reset link generated."}