-- =====================================================
-- Milestone 3 Backup & Restore Verification
-- AI-Powered Sign Language Learning Platform
-- =====================================================

BEGIN;

-- =====================================================
-- BACKUP VERIFICATION
-- =====================================================

SELECT COUNT(*) AS lessons_count
FROM public.lessons;

SELECT COUNT(*) AS courses_count
FROM public.courses;

SELECT COUNT(*) AS certificates_count
FROM public.certificates;

SELECT COUNT(*) AS recommendations_count
FROM public.recommendations;

SELECT COUNT(*) AS notifications_count
FROM public.notifications;

SELECT COUNT(*) AS achievement_badges_count
FROM public.achievement_badges;

SELECT COUNT(*) AS user_badges_count
FROM public.user_badges;

SELECT COUNT(*) AS streaks_count
FROM public.streaks;

SELECT COUNT(*) AS leaderboard_count
FROM public.leaderboard_cache;

-- =====================================================
-- DATA VALIDATION
-- =====================================================

SELECT *
FROM public.certificates
WHERE score < 0
OR score > 100;

SELECT *
FROM public.streaks
WHERE current_streak < 0;

SELECT *
FROM public.leaderboard_cache
WHERE accuracy < 0
OR accuracy > 100;

SELECT *
FROM public.notifications
WHERE title IS NULL;

-- =====================================================
-- INDEX VERIFICATION
-- =====================================================

SELECT
schemaname,
tablename,
indexname
FROM pg_indexes
WHERE schemaname='public';

-- =====================================================
-- TABLE SIZE REPORT
-- =====================================================

SELECT
relname AS table_name,
pg_size_pretty(pg_total_relation_size(relid)) AS total_size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;

COMMIT;