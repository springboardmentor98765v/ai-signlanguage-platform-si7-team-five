# AI Sign Language Learning and Assessment Platform

An AI-assisted web platform for learning sign language, practising signs through a camera, receiving assessment feedback, tracking progress, completing certification exams, and exporting reports.

## Current local services

| Component | Local address | Purpose |
| --- | --- | --- |
| Frontend | `http://127.0.0.1:5173` | React user interface |
| Backend Swagger | `http://127.0.0.1:8002/docs` | Authentication, lessons, business logic, trainer and admin APIs |
| Backend health | `http://127.0.0.1:8002/health` | Backend and database reachability |
| AI/ML Swagger | `http://127.0.0.1:8001/docs` | Sign prediction API |
| AI/ML health | `http://127.0.0.1:8001/health` | AI model readiness |

Docker maps the backend container to port `8002` and the AI service to port `8001`. The frontend defaults to those ports. A `503` response from backend health means the configured database is unavailable; it is not treated as a healthy system.

## Canonical vocabulary

The SRS describes four roles and uses the following canonical terms throughout the active system.

| Canonical term | Meaning | Historical synonym | Rule |
| --- | --- | --- | --- |
| `Learner` | A person taking lessons, practising, testing and viewing their own progress | Student | Use `learner`, `learner_id`, and the `Learner` role in new code and APIs. |
| `Lesson` | One learnable item, such as Letter A or Hello | Course | Use `lesson`, `lesson_id`, and `/lessons` in new public code. The physical legacy database table remains `courses` for migration compatibility. |
| `Instructor` | An educator who is assigned learners and can view their progress | Teacher | Cannot administer platform-wide settings. |
| `Accessibility Trainer` | A specialised role that views only explicitly assigned learners' engagement, development, assessment and certification status | Trainer | Cannot manage all users or platform settings. |
| `Admin` | A platform operator who manages users, roles, account status, lessons and trainer assignments | Administrator | Does not take learner assessments on behalf of a learner. |

There are no other active user roles. Role strings are case-sensitive: `Learner`, `Instructor`, `Accessibility Trainer`, and `Admin`.

### Compatibility rules

- `student_id` is accepted only by the deprecated instructor compatibility endpoint; it is normalised to `learner_id`.
- `course_id` is accepted only as a legacy input alias for a practice attempt; new clients send `lesson_id`.
- The database column named `course_id` is retained temporarily to avoid destructive migration of stored attempts. It represents the same Lesson identifier.
- The old `POST /instructors/assign-student` and `GET /instructors/students` routes are deprecated. New clients use `POST /instructors/assignments` and `GET /instructors/learners`.

## Shared objects and fields

This table documents the shared public objects and configuration variables used between domains. Private local variables inside components are intentionally not API contracts.

| Object / variable | Fields or values | Used by |
| --- | --- | --- |
| `User` | `id`, `username`, `email`, `hashed_password`, `role` | Backend authentication and RBAC |
| `Lesson` | `lesson_id`, `title`, `category`, `difficulty`, optional content metadata | Lesson catalogue, frontend lesson/practice screens |
| `PracticeAttempt` | `attempt_id`, authenticated learner, `lesson_id`, `expected_label`, `predicted_label`, `confidence`, `is_correct`, `created_at` | AI result to assessment, badges, streaks, analytics and reports |
| `InstructorLearnerAssignment` | `assignment_id`, `instructor_id`, `learner_id`, `assigned_at` | Instructor roster |
| `TrainerLearnerAssignment` | `assignment_id`, `trainer_id`, `learner_id`, `assigned_at` | Accessibility Trainer dashboard |
| `CertificationExamResult` | `exam_id`, `learner_id`, `level`, `score`, `passed`, `certificate_id`, `completed_at` | Certification and reporting |
| `Notification` | `id`, `user_id`, `event_type`, `title`, `message`, `is_read`, `created_at` | In-app notifications |
| `Badge` / `UserBadge` | `code`, `name`, `description`, `earned_at` | Gamification |
| `UserStreak` | `current_streak`, `longest_streak`, `last_practice_date` | Learner dashboard |
| `VITE_BACKEND_URL` | Frontend backend base URL; local default `http://127.0.0.1:8002` | Frontend |
| `VITE_AI_API_URL` | Frontend AI base URL; local default `http://127.0.0.1:8001` | Frontend |
| `DATABASE_URL` | SQLAlchemy PostgreSQL connection string | Backend and AI persistence |
| `SECRET_KEY`, `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT signing configuration | Backend authentication |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins | Backend and AI CORS |
| `ENV` | Configuration environment selector | Backend startup |

## Active API groups

- `/auth` - registration, login, current user, profile and password operations.
- `/lessons` - public lesson catalogue and lesson management routes.
- `/business` - practice assessment, feedback, badges, streaks, recommendations, leaderboard, certification, live summaries, analytics and report exports.
- `/instructors` - canonical instructor-to-learner assignment and learner summaries.
- `/accessibility-trainers` - Admin assignment plus Trainer-only learner analytics.
- `/admin` - platform-wide user and lesson operations.
- `/notifications` - signed-in user notifications.
- AI service `/predict` - camera-frame sign predictions.

Every protected endpoint requires `Authorization: Bearer <access_token>`. The platform does not use a static user API key.

## Run locally

```powershell
# Backend and AI services (Docker)
cd Backend
docker compose up --build

# Frontend (separate terminal)
cd Frontend
pnpm dev
```

Copy `Backend/.env.production.example` to `Backend/.env.production` and `Frontend/.env.example` to `Frontend/.env` before deployment. Never commit a real database password, JWT secret, or bearer token.

## Verification

```powershell
cd Backend
python -m pytest tests/test_milestone4_business_logic.py tests/test_accessibility_trainer.py tests/test_business_logic_rules.py -q

cd ..\Frontend
pnpm run lint
```

The API contract and complete JSON examples are in `Backend/api_documentation/API Contract` and `Backend/docs/intern2_api_examples_milestones_1_to_4.json`.
