# INTERN 4 CHECKPOINT: Streak Schema
# This schema defines the data structures for streak operations

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class StreakResponse(BaseModel):
    user_id: int
    current_streak: int
    longest_streak: int
    total_practice_days: int
    is_active: bool
    last_practice_date: Optional[datetime]
    streak_start_date: Optional[datetime]
    
    class Config:
        from_attributes = True

class StreakUpdateResponse(BaseModel):
    current_streak: int
    longest_streak: int
    total_practice_days: int
    is_active: bool
    last_practice_date: Optional[datetime]
    streak_start_date: Optional[datetime]
