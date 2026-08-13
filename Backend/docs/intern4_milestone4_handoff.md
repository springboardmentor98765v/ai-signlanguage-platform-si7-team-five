# Intern 4 Milestone 4 Handoff

## What is delivered

- Formal Certification Exams: Beginner, Intermediate, Advanced, and
  Professional. Each exam has a fixed multi-sign set and a 70/75/80/85 pass
  threshold.
- Persisted exam results with score, pass/fail state, timestamp, and a unique
  certificate id when a learner passes.
- Certificate-ready notification triggered after a passed exam.
- Five downloadable reports: Learning, Assessment, Accuracy, Certification,
  and Progress. Each is available as PDF and Excel (`.xlsx`).
- Trainer dashboard calculations remain based on real practice attempts:
  engagement, current accuracy/improvement, assessment figures, and certificate
  eligibility.

## Endpoint test order

1. Log in as a learner and set `Authorization: Bearer <token>`.
2. `GET /business/certification/levels` and choose a level.
3. Send each listed sign exactly once to `POST /business/certification/exams`.
4. Confirm a pass returns `certificate_id`; confirm a failed submission returns
   `passed: false` and no certificate id.
5. Download all reports with:

```text
GET /business/reports/me?report_type=learning&format=pdf
GET /business/reports/me?report_type=assessment&format=xlsx
GET /business/reports/me?report_type=accuracy&format=pdf
GET /business/reports/me?report_type=certification&format=xlsx
GET /business/reports/me?report_type=progress&format=pdf
```

## Validation results

The focused acceptance suite passed 13 tests. It verifies the four exam
structures, passing certificate generation, invalid/incomplete exam rejection,
all five report types in both PDF and Excel, trainer authorization, trainer
assignment, practice scoring, badges, and streak regression behaviour.

No actual keys or tokens are recorded in this handoff. The backend and mounted
business-logic service use `SECRET_KEY`, `ALGORITHM`,
`ACCESS_TOKEN_EXPIRE_MINUTES`, `DATABASE_URL`, `CORS_ORIGINS`, and
`NOTIFICATION_SERVICE_URL`; their names and safe placeholders are in the API
Contract and `.env.production.example`.
