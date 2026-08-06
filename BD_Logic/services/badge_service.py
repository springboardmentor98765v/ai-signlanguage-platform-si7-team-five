# INTERN 4 CHECKPOINT: Badge Service
# This service handles badge awarding and management with real-time updates
# It integrates with streaks and leaderboard for comprehensive gamification

from datetime import datetime
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from BD_Logic.database.connection import SessionLocal
from BD_Logic.model.gamification import Badge

class BadgeService:
    def __init__(self):
        self.badge_definitions = {
            "first_practice": {
                "name": "First Steps",
                "description": "Completed your first sign language practice",
                "icon": "🎯",
                "points": 10
            },
            "streak_3": {
                "name": "On Fire",
                "description": "Maintained a 3-day practice streak",
                "icon": "🔥",
                "points": 50
            },
            "streak_7": {
                "name": "Week Warrior",
                "description": "Maintained a 7-day practice streak",
                "icon": "⚔️",
                "points": 100
            },
            "streak_30": {
                "name": "Monthly Master",
                "description": "Maintained a 30-day practice streak",
                "icon": "👑",
                "points": 500
            },
            "alphabet_master": {
                "name": "Alphabet Master",
                "description": "Achieved 80%+ accuracy on all alphabet letters",
                "icon": "🔤",
                "points": 200
            },
            "perfect_score": {
                "name": "Perfectionist",
                "description": "Achieved 100% accuracy in a practice session",
                "icon": "💯",
                "points": 150
            },
            "speed_demon": {
                "name": "Speed Demon",
                "description": "Completed 50 practices in a single day",
                "icon": "⚡",
                "points": 300
            },
            "night_owl": {
                "name": "Night Owl",
                "description": "Practiced between 10 PM and 6 AM",
                "icon": "🦉",
                "points": 75
            }
        }
    
    def get_db(self):
        db = SessionLocal()
        try:
            return db
        except:
            db.close()
            raise
    
    def award_badge(self, user_id: int, badge_type: str) -> Optional[Badge]:
        """Award a badge to a user"""
        db = self.get_db()
        try:
            # Check if badge type exists
            if badge_type not in self.badge_definitions:
                return None
            
            # Check if user already has this badge
            existing_badge = db.query(Badge).filter(
                Badge.user_id == user_id,
                Badge.badge_type == badge_type
            ).first()
            
            if existing_badge:
                return existing_badge
            
            # Create new badge
            badge_info = self.badge_definitions[badge_type]
            badge = Badge(
                user_id=user_id,
                badge_type=badge_type,
                badge_name=badge_info["name"],
                badge_description=badge_info["description"],
                badge_icon=badge_info["icon"],
                earned_at=datetime.utcnow()
            )
            
            db.add(badge)
            db.commit()
            db.refresh(badge)
            
            # Note: User XP update would be handled by a separate user service
            # This is a simplified implementation focusing on badge management
            
            return badge
            
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()
    
    def get_user_badges(self, user_id: int) -> List[Badge]:
        """Get all badges for a user"""
        db = self.get_db()
        try:
            badges = db.query(Badge).filter(
                Badge.user_id == user_id,
                Badge.is_displayed == True
            ).order_by(Badge.earned_at.desc()).all()
            return badges
        finally:
            db.close()
    
    def check_and_award_badges(self, user_id: int, practice_data: Dict) -> List[Badge]:
        """Check practice data and award eligible badges"""
        awarded_badges = []
        
        # Check for first practice
        if practice_data.get("total_practices", 0) == 1:
            badge = self.award_badge(user_id, "first_practice")
            if badge:
                awarded_badges.append(badge)
        
        # Check for perfect score
        if practice_data.get("accuracy", 0) == 100:
            badge = self.award_badge(user_id, "perfect_score")
            if badge:
                awarded_badges.append(badge)
        
        # Check for night owl
        current_hour = datetime.utcnow().hour
        if current_hour >= 22 or current_hour < 6:
            badge = self.award_badge(user_id, "night_owl")
            if badge:
                awarded_badges.append(badge)
        
        # Check for speed demon
        if practice_data.get("daily_practices", 0) >= 50:
            badge = self.award_badge(user_id, "speed_demon")
            if badge:
                awarded_badges.append(badge)
        
        return awarded_badges
    
    def get_badge_definitions(self) -> Dict:
        """Get all badge definitions"""
        return self.badge_definitions
    
    def hide_badge(self, user_id: int, badge_id: int) -> bool:
        """Hide a badge from display"""
        db = self.get_db()
        try:
            badge = db.query(Badge).filter(
                Badge.id == badge_id,
                Badge.user_id == user_id
            ).first()
            
            if badge:
                badge.is_displayed = False
                db.commit()
                return True
            return False
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()