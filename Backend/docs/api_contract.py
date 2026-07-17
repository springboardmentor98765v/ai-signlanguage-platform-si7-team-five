
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Milestone 2 API Contract")

class UpdateProfileRequest(BaseModel):
    name: str
    email: str
    password: str

@app.put("/user/update-profile")
def update_profile(request: UpdateProfileRequest):
    return {"message": "Profile updated (stub)"}
