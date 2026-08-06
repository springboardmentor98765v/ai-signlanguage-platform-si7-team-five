# INTERN 4 CHECKPOINT: Gamification Models
# This file defines the data models for badges, streaks, and leaderboard
# These models support real-time gamification functionality

from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from BD_Logic.database.connection import Base

class Badge(Base):
    """Badge model for user achievements"""
    __tablename__ = "gamification_badges"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    badge_type = Column(String(50), nullable=False)  # first_practice, alphabet_master, etc.
    badge_name = Column(String(100), nullable=False)
    badge_description = Column(String(255))
    badge_icon = Column(String(100))  # URL or emoji
    earned_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    is_displayed = Column(Boolean, default=True)

class Streak(Base):
    """Streak model for tracking user practice consistency"""
    __tablename__ = "gamification_streaks"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, unique=True, index=True)
    current_streak = Column(Integer, default=0, nullable=False)
    longest_streak = Column(Integer, default=0, nullable=False)
    last_practice_date = Column(DateTime, nullable=True)
    streak_start_date = Column(DateTime, nullable=True)
    total_practice_days = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True)

class LeaderboardEntry(Base):
    """Leaderboard entry model for real-time rankings"""
    __tablename__ = "gamification_leaderboard"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, unique=True, index=True)
    total_points = Column(Integer, default=0, nullable=False, index=True)
    weekly_points = Column(Integer, default=0, nullable=False, index=True)
    average_accuracy = Column(Float, default=0.0, nullable=False)
    total_practices = Column(Integer, default=0, nullable=False)
    current_rank = Column(Integer, nullable=True)
    previous_rank = Column(Integer, nullable=True)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)