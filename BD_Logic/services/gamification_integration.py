# INTERN 4 CHECKPOINT: Gamification Integration Service
# This service integrates badges, streaks, and leaderboard for real-time updates
# It coordinates all gamification activities and ensures consistency

from BD_Logic.services.badge_service import BadgeService
from BD_Logic.services.streak_service import StreakService
from BD_Logic.services.leaderboard_service import LeaderboardService
from typing import Dict, List

class GamificationIntegration:
    def __init__(self):
        self.badge_service = BadgeService()
        self.streak_service = StreakService()
        self.leaderboard_service = LeaderboardService()
    
    def process_practice_complete(self, user_id: int, practice_data: Dict) -> Dict:
        """
        Process a completed practice session and update all gamification systems
        
        This is the main integration point that coordinates:
        1. Streak updates
        2. Badge eligibility checks
        3. Leaderboard updates
        4. XP calculations
        """
        results = {
            "user_id": user_id,
            "streak_update": None,
            "badges_awarded": [],
            "leaderboard_update": None,
            "total_xp_earned": 0
        }
        
        # Update streak
        try:
            streak = self.streak_service.update_streak(user_id)
            results["streak_update"] = {
                "current_streak": streak.current_streak,
                "longest_streak": streak.longest_streak,
                "total_practice_days": streak.total_practice_days
            }
            
            # Add streak bonus to practice data for leaderboard
            practice_data["streak_bonus"] = streak.current_streak
        except Exception as e:
            results["streak_error"] = str(e)
        
        # Check and award badges
        try:
            # Update practice data with streak info for badge checks
            practice_data["current_streak"] = results["streak_update"]["current_streak"] if results["streak_update"] else 0
            
            awarded_badges = self.badge_service.check_and_award_badges(user_id, practice_data)
            results["badges_awarded"] = [
                {
                    "id": badge.id,
                    "type": badge.badge_type,
                    "name": badge.badge_name,
                    "icon": badge.badge_icon
                }
                for badge in awarded_badges
            ]
            
            # Calculate XP from badges
            badge_definitions = self.badge_service.get_badge_definitions()
            for badge_info in results["badges_awarded"]:
                badge_type = badge_info["type"]
                if badge_type in badge_definitions:
                    results["total_xp_earned"] += badge_definitions[badge_type].get("points", 0)
        except Exception as e:
            results["badge_error"] = str(e)
        
        # Update leaderboard
        try:
            leaderboard_entry = self.leaderboard_service.update_leaderboard(user_id, practice_data)
            results["leaderboard_update"] = {
                "total_points": leaderboard_entry.total_points,
                "weekly_points": leaderboard_entry.weekly_points,
                "average_accuracy": leaderboard_entry.average_accuracy,
                "current_rank": leaderboard_entry.current_rank
            }
            
            # Add base practice points
            results["total_xp_earned"] += 10  # Base practice completion points
        except Exception as e:
            results["leaderboard_error"] = str(e)
        
        return results
    
    def get_user_gamification_summary(self, user_id: int) -> Dict:
        """
        Get comprehensive gamification summary for a user
        
        Includes badges, streak, and leaderboard information
        """
        summary = {
            "user_id": user_id,
            "badges": [],
            "streak": None,
            "leaderboard": None
        }
        
        # Get badges
        try:
            badges = self.badge_service.get_user_badges(user_id)
            summary["badges"] = [
                {
                    "id": badge.id,
                    "type": badge.badge_type,
                    "name": badge.badge_name,
                    "description": badge.badge_description,
                    "icon": badge.badge_icon,
                    "earned_at": badge.earned_at.isoformat()
                }
                for badge in badges
            ]
        except Exception as e:
            summary["badges_error"] = str(e)
        
        # Get streak
        try:
            streak = self.streak_service.get_user_streak(user_id)
            if streak:
                summary["streak"] = {
                    "current_streak": streak.current_streak,
                    "longest_streak": streak.longest_streak,
                    "total_practice_days": streak.total_practice_days,
                    "is_active": streak.is_active,
                    "last_practice_date": streak.last_practice_date.isoformat() if streak.last_practice_date else None
                }
        except Exception as e:
            summary["streak_error"] = str(e)
        
        # Get leaderboard entry
        try:
            leaderboard_entry = self.leaderboard_service.get_user_rank(user_id)
            if leaderboard_entry:
                summary["leaderboard"] = leaderboard_entry
        except Exception as e:
            summary["leaderboard_error"] = str(e)
        
        return summary
    
    def get_global_leaderboard(self, limit: int = 10, time_range: str = "all") -> Dict:
        """
        Get global leaderboard with integrated gamification data
        
        Includes badge counts and streak information for top users
        """
        leaderboard = self.leaderboard_service.get_leaderboard(limit, time_range)
        
        # Enhance with badge counts and streak info
        enhanced_leaderboard = []
        for entry in leaderboard:
            enhanced_entry = entry.copy()
            
            try:
                badges = self.badge_service.get_user_badges(entry["user_id"])
                enhanced_entry["badge_count"] = len(badges)
            except:
                enhanced_entry["badge_count"] = 0
            
            try:
                streak = self.streak_service.get_user_streak(entry["user_id"])
                enhanced_entry["current_streak"] = streak.current_streak if streak else 0
            except:
                enhanced_entry["current_streak"] = 0
            
            enhanced_leaderboard.append(enhanced_entry)
        
        return {
            "leaderboard": enhanced_leaderboard,
            "time_range": time_range,
            "total_entries": len(enhanced_leaderboard)
        }