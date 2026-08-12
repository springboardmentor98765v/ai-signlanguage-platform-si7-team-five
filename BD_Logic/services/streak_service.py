# INTERN 4 CHECKPOINT: Streak Service
# This service handles streak tracking and maintenance with real-time updates
# It integrates with badges and leaderboard for comprehensive gamification

from datetime import datetime, timedelta
from typing import Dict, Optional
from sqlalchemy.orm import Session
from BD_Logic.database.connection import SessionLocal
from BD_Logic.model.gamification import Streak
from BD_Logic.services.badge_service import BadgeService

class StreakService:
    def __init__(self):
        self.badge_service = BadgeService()
    
    def get_db(self):
        db = SessionLocal()
        try:
            return db
        except:
            db.close()
            raise
    
    def get_user_streak(self, user_id: int) -> Optional[Streak]:
        """Get current streak information for a user"""
        db = self.get_db()
        try:
            streak = db.query(Streak).filter(Streak.user_id == user_id).first()
            return streak
        finally:
            db.close()
    
    def update_streak(self, user_id: int) -> Streak:
        """Update streak based on practice activity"""
        db = self.get_db()
        try:
            streak = db.query(Streak).filter(Streak.user_id == user_id).first()
            
            if not streak:
                # Create new streak
                streak = Streak(
                    user_id=user_id,
                    current_streak=1,
                    longest_streak=1,
                    last_practice_date=datetime.utcnow(),
                    streak_start_date=datetime.utcnow(),
                    total_practice_days=1,
                    is_active=True
                )
                db.add(streak)
            else:
                today = datetime.utcnow().date()
                last_practice = streak.last_practice_date.date() if streak.last_practice_date else None
                
                if last_practice == today:
                    # Already practiced today, no change
                    pass
                elif last_practice == today - timedelta(days=1):
                    # Consecutive day, increment streak
                    streak.current_streak += 1
                    streak.total_practice_days += 1
                    streak.last_practice_date = datetime.utcnow()
                    
                    # Update longest streak if needed
                    if streak.current_streak > streak.longest_streak:
                        streak.longest_streak = streak.current_streak
                    
                    # Check for streak badges
                    self._check_streak_badges(user_id, streak.current_streak)
                elif last_practice < today - timedelta(days=1):
                    # Streak broken, reset
                    streak.current_streak = 1
                    streak.total_practice_days += 1
                    streak.last_practice_date = datetime.utcnow()
                    streak.streak_start_date = datetime.utcnow()
                    streak.is_active = True
                else:
                    # First practice or other case
                    streak.current_streak = 1
                    streak.total_practice_days += 1
                    streak.last_practice_date = datetime.utcnow()
                    streak.streak_start_date = datetime.utcnow()
                    streak.is_active = True
            
            db.commit()
            db.refresh(streak)
            return streak
            
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()
    
    def _check_streak_badges(self, user_id: int, current_streak: int):
        """Check and award streak-based badges"""
        badge_mappings = {
            3: "streak_3",
            7: "streak_7",
            30: "streak_30"
        }
        
        for streak_threshold, badge_type in badge_mappings.items():
            if current_streak == streak_threshold:
                self.badge_service.award_badge(user_id, badge_type)
    
    def check_streak_status(self, user_id: int) -> Dict:
        """Check if streak is still active or needs reset"""
        db = self.get_db()
        try:
            streak = db.query(Streak).filter(Streak.user_id == user_id).first()
            
            if not streak:
                return {
                    "active": False,
                    "current_streak": 0,
                    "days_since_last_practice": None
                }
            
            today = datetime.utcnow().date()
            last_practice = streak.last_practice_date.date() if streak.last_practice_date else None
            
            if not last_practice:
                return {
                    "active": False,
                    "current_streak": 0,
                    "days_since_last_practice": None
                }
            
            days_since = (today - last_practice).days
            
            if days_since == 0:
                status = "practiced_today"
            elif days_since == 1:
                status = "streak_active"
            else:
                status = "streak_broken"
            
            return {
                "active": streak.is_active and days_since <= 1,
                "current_streak": streak.current_streak,
                "longest_streak": streak.longest_streak,
                "days_since_last_practice": days_since,
                "status": status,
                "last_practice_date": streak.last_practice_date.isoformat() if streak.last_practice_date else None
            }
            
        finally:
            db.close()
    
    def get_streak_leaderboard(self, limit: int = 10) -> list:
        """Get users with highest streaks"""
        db = self.get_db()
        try:
            streaks = db.query(Streak).order_by(
                Streak.current_streak.desc(),
                Streak.longest_streak.desc()
            ).limit(limit).all()
            
            return [
                {
                    "user_id": s.user_id,
                    "current_streak": s.current_streak,
                    "longest_streak": s.longest_streak,
                    "total_practice_days": s.total_practice_days
                }
                for s in streaks
            ]
        finally:
            db.close()
    
    def reset_streak(self, user_id: int) -> bool:
        """Manually reset a user's streak (admin function)"""
        db = self.get_db()
        try:
            streak = db.query(Streak).filter(Streak.user_id == user_id).first()
            if streak:
                streak.current_streak = 0
                streak.is_active = False
                streak.last_practice_date = None
                db.commit()
                return True
            else:
                # Create a new streak entry if it doesn't exist
                streak = Streak(
                    user_id=user_id,
                    current_streak=0,
                    longest_streak=0,
                    last_practice_date=None,
                    streak_start_date=None,
                    total_practice_days=0,
                    is_active=False
                )
                db.add(streak)
                db.commit()
                return True
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()