-- ===========================================
-- Milestone 2 Database
-- AI-Powered Sign Language Learning and Assessment Platform
-- ===========================================

-- Add category column to lessons
ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS category TEXT;

-- Create certificates table
CREATE TABLE IF NOT EXISTS public.certificates (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    score NUMERIC(5,2),
    issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pdf_url TEXT
);

-- Create recommendations table
CREATE TABLE IF NOT EXISTS public.recommendations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    lesson_id UUID NOT NULL,
    recommendation_text TEXT NOT NULL,
    priority VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create instructor_students table
CREATE TABLE IF NOT EXISTS public.instructor_students (
    id SERIAL PRIMARY KEY,
    instructor_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample courses
INSERT INTO public.courses (title, letter, instructor_id)
VALUES
('Alphabet Basics','A-Z',2),
('Numbers','0-9',2),
('Greetings','Hello',2),
('Daily Conversation','Words',2);