# INTERN 4 CHECKPOINT: Gamification Integration API
# This API provides integrated endpoints for badges, streaks, and leaderboard
# It coordinates all gamification activities for real-time updates

from fastapi import APIRouter, HTTPException
from typing import Dict
from BD_Logic.services.gamification_integration import GamificationIntegration
from BD_Logic.schemas.gamification_schema import PracticeCompleteRequest

router = APIRouter()
gamification_service = GamificationIntegration()

@router.post("/gamification/practice-complete")
def process_practice_complete(request: PracticeCompleteRequest):
    """
    Process a completed practice session and update all gamification systems
    
    This is the main integration endpoint that coordinates:
    - Streak updates
    - Badge eligibility checks and awards
    - Leaderboard updates
    - XP calculations
    
    Returns comprehensive results from all gamification systems
    """
    try:
        results = gamification_service.process_practice_complete(
            request.user_id,
            request.practice_data
        )
        return {
            "status": "success",
            "results": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process practice: {str(e)}")

@router.get("/gamification/summary/{user_id}")
def get_user_gamification_summary(user_id: int):
    """
    Get comprehensive gamification summary for a user
    
    Includes badges, streak, and leaderboard information in a single call
    """
    try:
        summary = gamification_service.get_user_gamification_summary(user_id)
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get gamification summary: {str(e)}")

@router.get("/gamification/leaderboard")
def get_global_leaderboard(
    limit: int = 10,
    time_range: str = "all"
):
    """
    Get global leaderboard with integrated gamification data
    
    Includes badge counts and streak information for top users
    """
    try:
        leaderboard = gamification_service.get_global_leaderboard(limit, time_range)
        return leaderboard
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get global leaderboard: {str(e)}")