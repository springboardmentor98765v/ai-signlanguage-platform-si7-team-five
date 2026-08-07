# INTERN 4 CHECKPOINT: Badge API
# This API provides endpoints for badge management with real-time updates
# It integrates with streaks and leaderboard for comprehensive gamification

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from typing import List
from BD_Logic.services.badge_service import BadgeService
from BD_Logic.schemas.badge_schema import BadgeAwardRequest, BadgeResponse
import json

router = APIRouter()
badge_service = BadgeService()

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

@router.post("/badges/award")
def award_badge(request: BadgeAwardRequest):
    """
    Award a badge to a user

    Automatically checks eligibility and awards badge if criteria met
    Badge type can be any string - not restricted to specific types
    Triggers real-time update via WebSocket
    """
    try:
        badge = badge_service.award_badge(
            request.user_id,
            request.badge_type
        )

        if not badge:
            raise HTTPException(status_code=400, detail="Badge could not be awarded - may already exist or user not found")

        return {
            "status": "success",
            "badge": {
                "id": badge.id,
                "type": badge.badge_type,
                "name": badge.badge_name,
                "description": badge.badge_description,
                "icon": badge.badge_icon,
                "earned_at": badge.earned_at.isoformat()
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to award badge: {str(e)}")

@router.get("/badges/{user_id}", response_model=List[BadgeResponse])
def get_user_badges(user_id: int):
    """
    Get all badges for a specific user
    
    Returns list of badges ordered by most recently earned
    """
    try:
        badges = badge_service.get_user_badges(user_id)
        return [
            BadgeResponse(
                id=badge.id,
                user_id=badge.user_id,
                badge_type=badge.badge_type,
                badge_name=badge.badge_name,
                badge_description=badge.badge_description,
                badge_icon=badge.badge_icon,
                earned_at=badge.earned_at,
                is_displayed=badge.is_displayed
            )
            for badge in badges
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get badges: {str(e)}")

@router.post("/badges/check")
def check_and_award_badges(user_id: int, practice_data: dict):
    """
    Check practice data and award eligible badges
    
    Automatically evaluates practice session and awards all eligible badges
    """
    try:
        awarded_badges = badge_service.check_and_award_badges(user_id, practice_data)
        
        return {
            "status": "success",
            "awarded_badges": [
                {
                    "id": badge.id,
                    "type": badge.badge_type,
                    "name": badge.badge_name,
                    "icon": badge.badge_icon
                }
                for badge in awarded_badges
            ],
            "total_awarded": len(awarded_badges)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to check badges: {str(e)}")

@router.put("/badges/{badge_id}/hide")
def hide_badge(user_id: int, badge_id: int):
    """
    Hide a badge from user's display
    
    Allows users to customize which badges are shown on their profile
    """
    try:
        success = badge_service.hide_badge(user_id, badge_id)
        if success:
            return {"status": "success", "message": "Badge hidden"}
        else:
            raise HTTPException(status_code=404, detail="Badge not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to hide badge: {str(e)}")

@router.websocket("/ws/badges")
async def badge_websocket(websocket: WebSocket):
    """
    WebSocket endpoint for real-time badge updates
    
    Clients can connect to receive instant notifications when badges are awarded
    """
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo back or handle client messages
            await websocket.send_json({"type": "echo", "message": data})
    except WebSocketDisconnect:
        manager.disconnect(websocket)