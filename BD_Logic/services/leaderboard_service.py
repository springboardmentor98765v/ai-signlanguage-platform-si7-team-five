# INTERN 4 CHECKPOINT: Leaderboard Service
# This service handles real-time leaderboard management and rankings
# It integrates with badges and streaks for comprehensive gamification

from datetime import datetime, timedelta
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from BD_Logic.database.connection import SessionLocal
from BD_Logic.model.gamification import LeaderboardEntry

class LeaderboardService:
    def __init__(self):
        self.points_system = {
            "practice_completion": 10,
            "perfect_score": 20,
            "streak_day": 5,
            "badge_earned": 50,
            "level_up": 100
        }
    
    def get_db(self):
        db = SessionLocal()
        try:
            return db
        except:
            db.close()
            raise
    
    def get_leaderboard(self, limit: int = 10, time_range: str = "all") -> List[Dict]:
        """Get leaderboard entries with optional time range filtering"""
        db = self.get_db()
        try:
            query = db.query(LeaderboardEntry)
            
            if time_range == "week":
                # Filter by weekly points
                cutoff_date = datetime.utcnow() - timedelta(days=7)
                query = query.filter(LeaderboardEntry.last_updated >= cutoff_date)
                query = query.order_by(desc(LeaderboardEntry.weekly_points))
            elif time_range == "month":
                # Filter by monthly activity
                cutoff_date = datetime.utcnow() - timedelta(days=30)
                query = query.filter(LeaderboardEntry.last_updated >= cutoff_date)
                query = query.order_by(desc(LeaderboardEntry.total_points))
            else:
                # All time
                query = query.order_by(desc(LeaderboardEntry.total_points))
            
            entries = query.limit(limit).all()
            
            # Update ranks
            self._update_ranks(db, entries)
            
            return [
                {
                    "rank": entry.current_rank,
                    "user_id": entry.user_id,
                    "username": f"User {entry.user_id}",
                    "total_points": entry.total_points,
                    "weekly_points": entry.weekly_points,
                    "average_accuracy": entry.average_accuracy,
                    "total_practices": entry.total_practices,
                    "previous_rank": entry.previous_rank
                }
                for entry in entries
            ]
        finally:
            db.close()
    
    def _update_ranks(self, db: Session, entries: List[LeaderboardEntry]):
        """Update current and previous ranks"""
        for index, entry in enumerate(entries, 1):
            if entry.current_rank != index:
                entry.previous_rank = entry.current_rank
                entry.current_rank = index
                entry.last_updated = datetime.utcnow()
        
        db.commit()
    
    def get_user_rank(self, user_id: int) -> Optional[Dict]:
        """Get a specific user's leaderboard entry"""
        db = self.get_db()
        try:
            entry = db.query(LeaderboardEntry).filter(
                LeaderboardEntry.user_id == user_id
            ).first()
            
            if not entry:
                return None
            
            # Calculate current rank
            total_users = db.query(LeaderboardEntry).count()
            higher_scored = db.query(LeaderboardEntry).filter(
                LeaderboardEntry.total_points > entry.total_points
            ).count()
            current_rank = higher_scored + 1
            
            return {
                "rank": current_rank,
                "user_id": entry.user_id,
                "total_points": entry.total_points,
                "weekly_points": entry.weekly_points,
                "average_accuracy": entry.average_accuracy,
                "total_practices": entry.total_practices,
                "total_users": total_users,
                "previous_rank": entry.previous_rank
            }
        finally:
            db.close()
    
    def update_leaderboard(self, user_id: int, practice_data: Dict) -> LeaderboardEntry:
        """Update leaderboard entry after practice"""
        db = self.get_db()
        try:
            entry = db.query(LeaderboardEntry).filter(
                LeaderboardEntry.user_id == user_id
            ).first()
            
            if not entry:
                # Create new entry
                entry = LeaderboardEntry(
                    user_id=user_id,
                    total_points=0,
                    weekly_points=0,
                    average_accuracy=practice_data.get("accuracy", 0),
                    total_practices=1,
                    current_rank=None,
                    previous_rank=None
                )
                db.add(entry)
            
            # Update points based on practice
            points_earned = self._calculate_points(practice_data)
            entry.total_points += points_earned
            entry.weekly_points += points_earned
            entry.total_practices += 1
            
            # Update average accuracy
            current_total = entry.average_accuracy * (entry.total_practices - 1)
            new_accuracy = practice_data.get("accuracy", 0)
            entry.average_accuracy = (current_total + new_accuracy) / entry.total_practices
            
            entry.last_updated = datetime.utcnow()
            
            db.commit()
            db.refresh(entry)
            return entry
            
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()
    
    def _calculate_points(self, practice_data: Dict) -> int:
        """Calculate points earned from practice"""
        points = 0
        
        # Base completion points
        points += self.points_system["practice_completion"]
        
        # Perfect score bonus
        if practice_data.get("accuracy", 0) == 100:
            points += self.points_system["perfect_score"]
        
        # Speed bonus (if completed quickly)
        if practice_data.get("speed_bonus", False):
            points += 5
        
        # Streak bonus
        if practice_data.get("streak_bonus", 0) > 0:
            points += practice_data["streak_bonus"] * self.points_system["streak_day"]
        
        return points
    
    def add_bonus_points(self, user_id: int, bonus_type: str, amount: int) -> bool:
        """Add bonus points for achievements"""
        db = self.get_db()
        try:
            entry = db.query(LeaderboardEntry).filter(
                LeaderboardEntry.user_id == user_id
            ).first()
            
            if entry:
                entry.total_points += amount
                entry.weekly_points += amount
                entry.last_updated = datetime.utcnow()
                db.commit()
                return True
            return False
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()
    
    def reset_weekly_points(self) -> int:
        """Reset weekly points for all users (call weekly)"""
        db = self.get_db()
        try:
            count = db.query(LeaderboardEntry).update({
                "weekly_points": 0
            })
            db.commit()
            return count
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()
    
    def get_leaderboard_summary(self) -> Dict:
        """Get summary statistics for the leaderboard"""
        db = self.get_db()
        try:
            total_users = db.query(LeaderboardEntry).count()
            total_points = db.query(func.sum(LeaderboardEntry.total_points)).scalar() or 0
            avg_accuracy = db.query(func.avg(LeaderboardEntry.average_accuracy)).scalar() or 0
            
            return {
                "total_users": total_users,
                "total_points_awarded": total_points,
                "average_accuracy": round(avg_accuracy, 2),
                "top_score": db.query(func.max(LeaderboardEntry.total_points)).scalar() or 0
            }
        finally:
            db.close()