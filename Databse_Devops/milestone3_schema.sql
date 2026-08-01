-- =====================================================
-- Milestone 3 Database Schema
-- AI-Powered Sign Language Learning Platform
-- =====================================================

BEGIN;

-- =====================================================
-- NOTIFICATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(30) DEFAULT 'System',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user
ON public.notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_read
ON public.notifications(is_read);

-- =====================================================
-- ACHIEVEMENT BADGES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.achievement_badges (
    id SERIAL PRIMARY KEY,
    badge_name VARCHAR(100) UNIQUE NOT NULL,
    badge_description TEXT,
    badge_icon TEXT,
    xp_reward INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- USER BADGES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_badges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    badge_id INTEGER NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_user_badge
    UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user
ON public.user_badges(user_id);

-- =====================================================
-- STREAKS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.streaks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_practice_date DATE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_streak_user
ON public.streaks(user_id);

-- =====================================================
-- LEADERBOARD CACHE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.leaderboard_cache (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL,
    total_score NUMERIC(8,2) DEFAULT 0,
    total_lessons INTEGER DEFAULT 0,
    accuracy NUMERIC(5,2) DEFAULT 0,
    rank_position INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_score
ON public.leaderboard_cache(total_score DESC);

-- =====================================================
-- SAMPLE BADGES
-- =====================================================

INSERT INTO public.achievement_badges
(badge_name, badge_description, badge_icon, xp_reward)

VALUES

('First Lesson',
'Complete your first lesson',
'book',
50),

('7 Day Streak',
'Maintain a learning streak for seven days',
'flame',
100),

('Accuracy Master',
'Achieve 95% accuracy',
'target',
200),

('Lesson Champion',
'Complete 50 lessons',
'trophy',
300),

('Leaderboard Hero',
'Reach Top 10',
'crown',
500)

ON CONFLICT (badge_name) DO NOTHING;

COMMIT;