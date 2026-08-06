# INTERN 4 CHECKPOINT: Leaderboard Schema
# This schema defines the data structures for leaderboard operations

from pydantic import BaseModel, Field
from typing import Dict, Optional

class LeaderboardEntry(BaseModel):
    rank: int
    user_id: int
    username: str
    total_points: int
    weekly_points: int
    average_accuracy: float
    total_practices: int
    previous_rank: Optional[int]

class LeaderboardUpdateRequest(BaseModel):
    user_id: int = Field(..., description="User ID to update")
    practice_data: Dict = Field(..., description="Practice session data")
