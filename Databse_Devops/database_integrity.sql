-- =====================================================
-- Milestone 3 Database Integrity
-- AI-Powered Sign Language Learning Platform
-- =====================================================

BEGIN;

-- =====================================================
-- CERTIFICATES → COURSES
-- =====================================================

ALTER TABLE public.certificates
DROP CONSTRAINT IF EXISTS fk_certificate_course;

ALTER TABLE public.certificates
ADD CONSTRAINT fk_certificate_course
FOREIGN KEY (course_id)
REFERENCES public.courses(id)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- =====================================================
-- RECOMMENDATIONS → LESSONS
-- =====================================================

ALTER TABLE public.recommendations
DROP CONSTRAINT IF EXISTS fk_recommendation_lesson;

ALTER TABLE public.recommendations
ADD CONSTRAINT fk_recommendation_lesson
FOREIGN KEY (lesson_id)
REFERENCES public.lessons(id)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- =====================================================
-- USER BADGES → ACHIEVEMENT BADGES
-- =====================================================

ALTER TABLE public.user_badges
DROP CONSTRAINT IF EXISTS fk_user_badges_badge;

ALTER TABLE public.user_badges
ADD CONSTRAINT fk_user_badges_badge
FOREIGN KEY (badge_id)
REFERENCES public.achievement_badges(id)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- =====================================================
-- VALIDATION
-- =====================================================

ALTER TABLE public.notifications
DROP CONSTRAINT IF EXISTS chk_notification_type;

ALTER TABLE public.notifications
ADD CONSTRAINT chk_notification_type
CHECK (
notification_type IN
(
'System',
'Achievement',
'Reminder',
'Warning'
)
);

ALTER TABLE public.streaks
DROP CONSTRAINT IF EXISTS chk_current_streak;

ALTER TABLE public.streaks
ADD CONSTRAINT chk_current_streak
CHECK (current_streak >= 0);

ALTER TABLE public.streaks
DROP CONSTRAINT IF EXISTS chk_longest_streak;

ALTER TABLE public.streaks
ADD CONSTRAINT chk_longest_streak
CHECK (longest_streak >= current_streak);

ALTER TABLE public.leaderboard_cache
DROP CONSTRAINT IF EXISTS chk_accuracy;

ALTER TABLE public.leaderboard_cache
ADD CONSTRAINT chk_accuracy
CHECK (
accuracy >= 0
AND
accuracy <= 100
);

-- =====================================================
-- DATA CLEANUP QUERIES
-- =====================================================

DELETE FROM public.user_badges
WHERE badge_id IS NULL;

DELETE FROM public.notifications
WHERE title IS NULL;

DELETE FROM public.streaks
WHERE user_id IS NULL;

COMMIT;