# Intern 2 Docker and API Test Results

Date: 2026-08-13

## Test environment

- Backend launched with `Backend/docker-compose.yml`.
- Docker image built successfully from `Backend/Dockerfile`. The initial
  restart check found missing OpenCV and MediaPipe dependencies; they were
  corrected with `opencv-python-headless`, `mediapipe`, and the required Linux
  MediaPipe runtime libraries, then the image was rebuilt before final validation.
- Container: `signlang_backend`, exposed locally at `http://127.0.0.1:8000`.
- Local Docker verification configuration used SQLite and non-production test
  secrets from ignored `Backend/.env.production`.
- Requests were executed against the running container using the same HTTP
  methods, headers, and JSON payloads included in the Postman collection.

## Results

| Check | Request | Expected result | Actual result | Status |
| --- | --- | --- | --- | --- |
| Docker build | `docker compose build` | Image completes | Image built successfully | Pass |
| Container start | `docker compose up -d` | Backend listens on port 8000 | `signlang_backend` running and stable on `0.0.0.0:8000` | Pass |
| Health | `GET /health` | HTTP 200 and healthy backend result | `{"status":"ok","message":"Milestone 4 backend running"}` | Pass |
| Role registration | `POST /auth/register` for Admin, Trainer, Learner | JWT returned for each role | All three accounts registered | Pass |
| Identity lookup | `GET /auth/me` with each JWT | Numeric account id and role | Correct ids and roles returned | Pass |
| Trainer assignment | `POST /accessibility-trainers/assignments` as Admin | Assignment is created | `created: true` | Pass |
| Practice scoring | `POST /business/attempts` as Learner | Correct sign receives score 100 | `score: 100` | Pass |
| Trainer analytics | `GET /accessibility-trainers/me/learners` as Trainer | Assigned learner and real metrics | One learner returned with average score `100.0` and certificate eligibility `true` | Pass |
| Automated regression | Relevant Intern 2 tests | All pass | 14 passed | Pass |

## Postman use

Import `Backend/docs/postman_intern2_milestones_1_to_4_collection.json` into
Postman. Set the `baseUrl` and token/id collection variables after registering
the test accounts. The collection deliberately contains placeholders, not real
tokens or keys.

## Notes

- The Docker `.env.production` file created for this local verification is
  ignored by Git and contains local-only values. Replace them before a live
  deployment.
- The Postman desktop extension was not exposed as an automatable interface in
  this workspace, so the container requests were run directly and packaged as
  an importable Postman collection with the identical request details.
