# INTERN 4 CHECKPOINT: Streak API
# This API provides endpoints for streak tracking with real-time updates
# It integrates with badges and leaderboard for comprehensive gamification

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from typing import List
from BD_Logic.services.streak_service import StreakService
from BD_Logic.schemas.streak_schema import StreakResponse, StreakUpdateResponse
import json

router = APIRouter()
streak_service = StreakService()

# WebSocket connection manager for real-time updates
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    
    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()

@router.post("/streaks/update", response_model=StreakUpdateResponse)
def update_streak(user_id: int):
    """
    Update user's streak based on practice activity

    Automatically calculates streak based on practice history
    Awards streak-based badges when milestones are reached
    """
    try:
        streak = streak_service.update_streak(user_id)

        return StreakUpdateResponse(
            current_streak=streak.current_streak,
            longest_streak=streak.longest_streak,
            total_practice_days=streak.total_practice_days,
            is_active=streak.is_active,
            last_practice_date=streak.last_practice_date,
            streak_start_date=streak.streak_start_date
        )

    except ValueError as e:
        raise HTTPException(status_code=422, detail=f"Unprocessable content: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update streak: {str(e)}")

@router.get("/streaks/{user_id}", response_model=StreakResponse)
def get_user_streak(user_id: int):
    """
    Get current streak information for a user
    
    Returns detailed streak data including current streak, longest streak, and status
    """
    try:
        streak = streak_service.get_user_streak(user_id)
        
        if not streak:
            return StreakResponse(
                user_id=user_id,
                current_streak=0,
                longest_streak=0,
                total_practice_days=0,
                is_active=False,
                last_practice_date=None,
                streak_start_date=None
            )
        
        return StreakResponse(
            user_id=streak.user_id,
            current_streak=streak.current_streak,
            longest_streak=streak.longest_streak,
            total_practice_days=streak.total_practice_days,
            is_active=streak.is_active,
            last_practice_date=streak.last_practice_date,
            streak_start_date=streak.streak_start_date
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get streak: {str(e)}")

@router.get("/streaks/{user_id}/status")
def check_streak_status(user_id: int):
    """
    Check if streak is still active or needs reset
    
    Returns detailed status including days since last practice
    """
    try:
        status = streak_service.check_streak_status(user_id)
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to check streak status: {str(e)}")

@router.get("/streaks/leaderboard")
def get_streak_leaderboard(limit: int = 10):
    """
    Get users with highest practice streaks
    
    Returns ranked list of users by current streak
    """
    try:
        leaderboard = streak_service.get_streak_leaderboard(limit)
        return {
            "streak_leaderboard": leaderboard,
            "total_entries": len(leaderboard)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get streak leaderboard: {str(e)}")

@router.put("/streaks/{user_id}/reset")
def reset_streak(user_id: int):
    """
    Manually reset a user's streak (admin function)
    
    Use carefully - this will set streak to 0 and mark as inactive
    """
    try:
        success = streak_service.reset_streak(user_id)
        if success:
            return {"status": "success", "message": "Streak reset successfully"}
        else:
            raise HTTPException(status_code=404, detail="User streak not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reset streak: {str(e)}")

@router.websocket("/ws/streaks")
async def streak_websocket(websocket: WebSocket):
    """
    WebSocket endpoint for real-time streak updates
    
    Clients can connect to receive instant notifications when streaks change
    """
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo back or handle client messages
            await websocket.send_json({"type": "echo", "message": data})
    except WebSocketDisconnect:
        manager.disconnect(websocket)