# INTERN 4 CHECKPOINT: Badge Schema
# This schema defines the data structures for badge operations

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class BadgeAwardRequest(BaseModel):
    user_id: int = Field(..., description="User ID to award badge to")
    badge_type: str = Field(..., description="Type of badge to award")

class BadgeResponse(BaseModel):
    id: int
    user_id: int
    badge_type: str
    badge_name: str
    badge_description: Optional[str]
    badge_icon: Optional[str]
    earned_at: datetime
    is_displayed: bool
    
    class Config:
        from_attributes = True

class BadgeCheckRequest(BaseModel):
    user_id: int = Field(..., description="User ID to check badges for")
    practice_data: dict = Field(..., description="Practice session data to evaluate")
