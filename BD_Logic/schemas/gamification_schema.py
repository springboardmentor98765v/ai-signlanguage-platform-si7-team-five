# INTERN 4 CHECKPOINT: Gamification Schema
# This schema defines the data structures for integrated gamification operations

from pydantic import BaseModel, Field
from typing import Dict

class PracticeCompleteRequest(BaseModel):
    user_id: int = Field(..., description="User ID who completed the practice")
    practice_data: Dict = Field(..., description="Practice session data including accuracy, speed, etc.")