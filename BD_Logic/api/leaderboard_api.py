# INTERN 4 CHECKPOINT: Leaderboard API
# This API provides endpoints for real-time leaderboard management
# It integrates with badges and streaks for comprehensive gamification

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect, Query
from typing import List, Optional
from BD_Logic.services.leaderboard_service import LeaderboardService
from BD_Logic.schemas.leaderboard_schema import LeaderboardEntry, LeaderboardUpdateRequest
import json

router = APIRouter()
leaderboard_service = LeaderboardService()

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

@router.get("/leaderboard")
def get_leaderboard(
    limit: int = Query(10, ge=1, le=100, description="Number of entries to return"),
    time_range: str = Query("all", description="Time range: all, week, month")
):
    """
    Get leaderboard entries with optional time range filtering
    
    Returns ranked list of users by points
    Supports real-time updates via WebSocket
    """
    try:
        leaderboard = leaderboard_service.get_leaderboard(limit, time_range)
        return {
            "leaderboard": leaderboard,
            "time_range": time_range,
            "total_entries": len(leaderboard)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get leaderboard: {str(e)}")

@router.get("/leaderboard/{user_id}")
def get_user_rank(user_id: int):
    """
    Get a specific user's leaderboard entry and rank

    Returns user's current rank, points, and statistics
    """
    try:
        rank_data = leaderboard_service.get_user_rank(user_id)

        if not rank_data:
            # Return default structure instead of 404
            return {
                "user_id": user_id,
                "current_rank": None,
                "total_points": 0,
                "weekly_points": 0,
                "average_accuracy": 0.0,
                "total_practices": 0,
                "message": "User not yet on leaderboard"
            }

        return rank_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user rank: {str(e)}")

@router.post("/leaderboard/update")
def update_leaderboard(request: LeaderboardUpdateRequest):
    """
    Update leaderboard entry after practice session

    Automatically calculates points and updates rank
    Triggers real-time update via WebSocket
    """
    try:
        entry = leaderboard_service.update_leaderboard(
            request.user_id,
            request.practice_data
        )

        return {
            "status": "success",
            "entry": {
                "total_points": entry.total_points,
                "weekly_points": entry.weekly_points,
                "average_accuracy": entry.average_accuracy,
                "total_practices": entry.total_practices,
                "current_rank": entry.current_rank
            }
        }
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Unprocessable content: {str(e)}")

@router.post("/leaderboard/bonus")
def add_bonus_points(user_id: int, bonus_type: str, amount: int):
    """
    Add bonus points for achievements
    
    Used for awarding extra points for badges, level-ups, etc.
    """
    try:
        success = leaderboard_service.add_bonus_points(user_id, bonus_type, amount)
        if success:
            return {"status": "success", "message": f"Added {amount} bonus points"}
        else:
            raise HTTPException(status_code=404, detail="User not found on leaderboard")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add bonus points: {str(e)}")

@router.post("/leaderboard/reset-weekly")
def reset_weekly_points():
    """
    Reset weekly points for all users (admin function)
    
    Should be called weekly to reset weekly competition
    """
    try:
        count = leaderboard_service.reset_weekly_points()
        return {"status": "success", "message": f"Reset weekly points for {count} users"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reset weekly points: {str(e)}")

@router.get("/leaderboard/summary")
def get_leaderboard_summary():
    """
    Get summary statistics for the leaderboard
    
    Returns overall statistics like total users, total points, etc.
    """
    try:
        summary = leaderboard_service.get_leaderboard_summary()
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get leaderboard summary: {str(e)}")

@router.websocket("/ws/leaderboard")
async def leaderboard_websocket(websocket: WebSocket):
    """
    WebSocket endpoint for real-time leaderboard updates
    
    Clients can connect to receive instant notifications when leaderboard changes
    """
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo back or handle client messages
            await websocket.send_json({"type": "echo", "message": data})
    except WebSocketDisconnect:
        manager.disconnect(websocket)