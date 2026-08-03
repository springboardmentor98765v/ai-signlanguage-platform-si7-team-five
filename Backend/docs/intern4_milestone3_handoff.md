# Intern 4 - Milestone 3 handoff (Day 1 to Day 10)

## Where the code goes

```text
Backend/
├── models/business_logic.py                 # tables supplied to Intern 5
├── schemas/business_logic.py                # stable API request/response shapes
├── services/business_logic_service.py       # Intern 4 rules and API routes
├── services/notification_gateway.py         # calls Intern 2 without blocking practice
├── main.py                                  # mounts /business routes
└── docs/intern4_milestone3_handoff.md       # this guide
```

## Day-by-day work and what to run

| Day | Deliverable | Main code / check |
|---|---|---|
| 1 | Review rules and freeze contracts | Read this file; agree `course_id` means one instructor class. |
| 2 | Streaks and badges | `POST /business/attempts` updates `user_streaks` and awards First Sign, 7-Day Streak, Alphabet Master. |
| 3 | Leaderboard | `GET /business/leaderboard/{course_id}?metric=accuracy` or `metric=streak`. |
| 4 | Notifications | Set `NOTIFICATION_SERVICE_URL=http://localhost:8000/notifications`; earn a badge and verify Intern 2 receives `POST /notifications/`. |
| 5 | Report export | `GET /business/exports/me?format=csv` or `format=xlsx`; frontend downloads the response as a blob. |
| 6 | Recommendations | `GET /business/recommendations/me`; recent results use a 14-day half-life. |
| 7 | Full alphabet assessment | Intern 3 posts every A-Z model prediction to `POST /business/attempts`; check feedback text. |
| 8 | Logic scenarios | Run `pytest tests/test_business_logic_rules.py -q`. It tests first attempt, repeat same-day attempt, next-day streak, broken streak, feedback, and Alphabet Master. |
| 9 | Real-data wiring | Remove frontend mock data and connect the endpoints below. Confirm labels are uppercase A-Z. |
| 10 | Integration | Run full learner flow: AI prediction -> attempt -> streak/badge -> notification -> leaderboard -> export -> recommendation. |

## Domain connections

| Partner | They provide | Intern 4 consumes / provides |
|---|---|---|
| Intern 1 (Frontend) | JWT plus selected `course_id` | Calls every `/business` endpoint; consumes returned JSON and downloads export blobs. |
| Intern 2 (Backend/API) | Notification endpoint | Set `NOTIFICATION_SERVICE_URL`; expects `POST /notifications` with `user_id`, `event_type`, `title`, `message`. |
| Intern 3 (AI/CV) | `{expected_label, predicted_label, confidence}` | After a prediction, frontend or API gateway calls `POST /business/attempts` with that payload and optional `course_id`. |
| Intern 5 (Database/QA) | Tables/indexes and test stack | Migrates/creates `practice_attempts`, `badges`, `user_badges`, `user_streaks`; index `practice_attempts(course_id, user_id, created_at)` is recommended. |

## Exact API payloads for the team

```json
POST /business/attempts
Authorization: Bearer <learner-token>
{
  "expected_label": "A",
  "predicted_label": "A",
  "confidence": 0.94,
  "course_id": 1
}
```

The response includes `feedback`, `streak`, and `new_badges`. The learner identity always comes from the JWT; do not send `user_id` from the browser.

## Startup

1. Add `DATABASE_URL` and `SECRET_KEY` to `Backend/.env`.
2. From `Backend`, run `python -m pip install -r requirements.txt`.
3. Run `uvicorn main:app --reload`.
4. Open `/docs` and use a learner JWT from `/auth/login` to test the protected routes.
