# Intern 2 API and Swagger Guide - Milestones 1 to 4

This is the simple test guide for Intern 2's backend/API work. Start the
backend, open `http://127.0.0.1:8002/docs` when using Docker, then use
FastAPI's Swagger page to send requests. Business Logic endpoints are included
in that same Swagger page under the **Business Logic** tag.

## Before testing

1. Copy `Backend/.env.example` to `Backend/.env` for local use. For a live
   server, copy `Backend/.env.production.example` to `.env.production` and
   replace every placeholder.
2. Start the service and confirm `GET /health` gives HTTP 200.
3. Register separate Learner, Instructor, Accessibility Trainer, and Admin
   test accounts through `POST /auth/register`.
4. Log in through `POST /auth/login`. Copy the `access_token` from the response.
5. In Swagger select **Authorize** and enter `Bearer <access_token>`.

Never enter a real `SECRET_KEY`, database password, or production
token into a JSON example. The required configuration-key names are documented
in the API Contract.

## Milestone 1 - core journey

Test in this order: health -> register -> login -> `/auth/me` -> lessons ->
prediction -> practice attempt. This proves the original learner journey works.

| Checkpoint | Swagger endpoint | Expected result |
| --- | --- | --- |
| Service health | `GET /health` | `status: ok` |
| Registration and password hashing | `POST /auth/register` | token and account fields returned |
| JWT protection | `GET /auth/me` | account returned with valid bearer token; 401 without it |
| Lessons | `GET /lessons` | paged lesson list |
| Search | `GET /lessons/search?query=Letter` | matching lessons only |
| Course CRUD | `/courses` endpoints | Instructor create/update; Admin delete |
| Prediction bridge | `POST /predictions/predict` | labels and probabilities returned |
| Practice scoring | `POST /business/attempts` | score, feedback, streak and badges returned |

## Milestone 2 - accounts and classroom administration

| Checkpoint | Swagger endpoint | Expected result |
| --- | --- | --- |
| Profile update | `PUT /auth/user/update-profile` | friendly success response |
| Password reset | `/auth/user/forgot-password`, `/auth/user/reset-password` | controlled reset response; rapid requests rate limited |
| Instructor roster | `/instructors/assign-student`, `/instructors/students` | learner assignment and student summary |
| Admin user management | `/admin/users`, role/status routes | user records and updates |
| Expanded catalogue | `/lessons?page=1&size=10`, `/lessons/search` | pagination, filters and search |

## Milestone 3 - notifications, bulk tools and API hardening

| Checkpoint | Swagger endpoint | Expected result |
| --- | --- | --- |
| Notifications | `/notifications/`, `/notifications/me`, `/{id}/read` | create, own-list and owned-read flow |
| Bulk user updates | `PUT /admin/users/bulk-status` | status update for supplied valid ids |
| Bulk lesson upload | `POST /admin/lessons/bulk-upload` | CSV accepted or clear validation error |
| Learner progress | `/business/badges/me`, streak, leaderboard, recommendations | real values from practice attempts |
| Export | `GET /business/exports/me?format=xlsx` | downloadable spreadsheet |
| Security | repeat login rapidly | HTTP 429 after the rate limit; invalid input gets 4xx |

## Milestone 4 - Accessibility Trainer dashboard and deployment

1. Log in as **Admin**, authorize Swagger, then call
   `POST /accessibility-trainers/assignments`.
2. Log in as the **Accessibility Trainer**, authorize Swagger again, and call
   `GET /accessibility-trainers/me/learners`.
3. Record learner attempts, then repeat the trainer request. Engagement,
   accuracy, improvement, and eligibility must update from real records.
4. Request an unassigned learner. The expected response is HTTP 404.

| Endpoint | Who may call it | What it proves |
| --- | --- | --- |
| `POST /accessibility-trainers/assignments` | Admin | links one valid trainer and learner; duplicate is safe |
| `GET /accessibility-trainers/me/learners` | Accessibility Trainer | shows only that trainer's learners and all required dashboard metrics |
| `GET /accessibility-trainers/me/learners/{learner_id}` | Accessibility Trainer | detailed analytics without cross-trainer data leakage |
| `GET /business/summary/me`, `/business/analytics/me` | Learner | live frontend dashboard and reports data |
| `GET /health` | Public monitor | deployment health probe |

## Authentication and configuration

- **User access:** use `Authorization: Bearer <access_token>` after login.
- **Configuration keys:** `SECRET_KEY`, `ALGORITHM`,
  `ACCESS_TOKEN_EXPIRE_MINUTES`, `DATABASE_URL`, `CORS_ORIGINS`,
  `NOTIFICATION_SERVICE_URL`, `ENV`,
  `VITE_BACKEND_URL`, and `VITE_AI_API_URL`. See the API Contract for what
  each one does.

All JSON request and response examples are in
`Backend/docs/intern2_api_examples_milestones_1_to_4.json`.
