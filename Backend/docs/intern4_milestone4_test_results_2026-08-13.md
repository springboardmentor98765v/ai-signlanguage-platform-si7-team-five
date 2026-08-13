# Intern 4 Milestone 4 Test Results

Date: 2026-08-13

## Environment

- Production-style backend Docker container: `signlang_backend`.
- Local endpoint: `http://127.0.0.1:8000`.
- Database: local SQLite for Docker verification.
- Existing AI/CV dependencies load successfully in the container; MediaPipe runs
  on CPU, which is expected in this local Docker environment.

## Acceptance results

| Requirement from Milestone 4 | Result | Evidence |
| --- | --- | --- |
| Four formal exam levels | Pass | Beginner, Intermediate, Advanced, and Professional returned from `/business/certification/levels`. |
| Multi-sign structure and explicit thresholds | Pass | Fixed required signs and 70/75/80/85 thresholds verified by automated test. |
| Pass/fail and certificate trigger | Pass | Live Beginner submission returned `passed: true` and `CERT-F65ACDE8FA`. |
| Learner engagement and skill analytics | Pass | Trainer dashboard uses persisted practice attempts and reports engagement, current accuracy, improvement, assessment data, and eligibility. |
| All five report types | Pass | Learning, Assessment, Accuracy, Certification, and Progress all generated. |
| PDF report download | Pass | Each of five report requests returned HTTP 200. |
| Excel report download | Pass | Each of five `.xlsx` report requests returned HTTP 200. |
| PDF/Excel file validity | Pass | Progress PDF began with the valid `%PDF` signature; workbook opened with a `Progress` sheet and expected headers. |
| Regression of older business logic | Pass | 13 focused tests passed: practice scoring, feedback, badges, streaks, recommendations, trainer authorization/assignment, exams, and exports. |
| Docker integration | Pass | Container stayed up and health endpoint returned HTTP 200 after the final build. |

## Live API verification

```json
{
  "exam_passed": true,
  "certificate_id": "CERT-F65ACDE8FA",
  "report_checks": "learning:200/200,assessment:200/200,accuracy:200/200,certification:200/200,progress:200/200"
}
```

## API key and environment-variable audit

| Key | Verification | Result |
| --- | --- | --- |
| `SECRET_KEY` | JWT bearer tokens issued at registration and accepted by protected learner/trainer/exam endpoints | Pass |
| `ALGORITHM` and `ACCESS_TOKEN_EXPIRE_MINUTES` | Used while creating/validating the container JWT flow | Pass |
| `DATABASE_URL` | Backend creates and reads users, practice attempts, assignments, and exams in container SQLite | Pass |
| `CORS_ORIGINS` | Present in production template and loaded by backend | Configured; browser-origin testing needs a running frontend origin |
| `API_KEY` | Present in production template for internal mounted-service access | Configured; no real secret value is stored or printed |
| `NOTIFICATION_SERVICE_URL` | Present in production template | Configured; external/live notification-host testing needs deployed service URL |
| `VITE_BACKEND_URL`, `VITE_AI_API_URL` | Referenced by frontend build configuration | Not live-tested because frontend has not been deployed in this workspace |

## Honest scope note

The PDFs also require a public, zero-cost deployment, live database, live
frontend, monitoring, and full multi-domain acceptance. Those require the
team's chosen hosting accounts, production database URL, and frontend
deployment; they cannot be truthfully marked complete from this local workspace.
The local Docker integration and all Intern 4 deliverables above are verified.
