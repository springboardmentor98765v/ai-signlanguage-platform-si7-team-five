-- =====================================================
-- Milestone 3 Database Optimization
-- AI-Powered Sign Language Learning Platform
-- =====================================================

BEGIN;

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_lessons_category
ON public.lessons(category);

CREATE INDEX IF NOT EXISTS idx_certificates_user
ON public.certificates(user_id);

CREATE INDEX IF NOT EXISTS idx_certificates_course
ON public.certificates(course_id);

CREATE INDEX IF NOT EXISTS idx_recommendations_user
ON public.recommendations(user_id);

CREATE INDEX IF NOT EXISTS idx_recommendations_lesson
ON public.recommendations(lesson_id);

CREATE INDEX IF NOT EXISTS idx_instructor_students_instructor
ON public.instructor_students(instructor_id);

CREATE INDEX IF NOT EXISTS idx_instructor_students_student
ON public.instructor_students(student_id);

-- =====================================================
-- UNIQUE CONSTRAINTS
-- =====================================================

ALTER TABLE public.instructor_students
DROP CONSTRAINT IF EXISTS uq_instructor_student;

ALTER TABLE public.instructor_students
ADD CONSTRAINT uq_instructor_student
UNIQUE(instructor_id, student_id);

-- =====================================================
-- DATA VALIDATION
-- =====================================================

ALTER TABLE public.certificates
DROP CONSTRAINT IF EXISTS chk_certificate_score;

ALTER TABLE public.certificates
ADD CONSTRAINT chk_certificate_score
CHECK (
score >= 0
AND score <=100
);

ALTER TABLE public.recommendations
DROP CONSTRAINT IF EXISTS chk_priority;

ALTER TABLE public.recommendations
ADD CONSTRAINT chk_priority
CHECK (
priority IN ('Low','Medium','High')
OR priority IS NULL
);

-- =====================================================
-- PERFORMANCE
-- =====================================================

ANALYZE public.lessons;
ANALYZE public.certificates;
ANALYZE public.recommendations;
ANALYZE public.instructor_students;

COMMIT;