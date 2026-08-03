# Backend README

## Overview

This backend is a FastAPI application for the Sign Language Learning and Assessment Platform. It exposes authentication and course management endpoints, stores users and course data in a SQL database, and uses JWT bearer authentication for protected routes.

## Features

- User registration and login
- JWT bearer token authentication
- Course CRUD operations
- Role-based access control for instructor/admin actions
- Auto-generated Swagger UI at `/docs`

## Requirements

- Python 3.10+
- PostgreSQL (or another supported SQL database)

## Install dependencies

```bash
cd Backend
python -m pip install -r requirements.txt
```

## Configuration

The backend reads configuration from `Backend/.env`. Create or update that file with your environment values.

Example `.env` values:

```env
SECRET_KEY=your_jwt_secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=postgresql://postgres:VinayBellamkonda@db.ovvvcudvagbnlojfmmnx.supabase.co:5432/postgres
ENV=development
DEBUG=True
```

A template file is available at `Backend/.env.example`.

## Run the application

```bash
cd Backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API routes

### Authentication

- `POST /auth/register` — Register a new user
  - Request body: `username`, `email`, `password`, `role`

- `POST /auth/login` — Login and receive access token
  - Request body: `username`, `password`
  - Response: `access_token`, `token_type`

- `GET /auth/me` — Get current user details
  - Requires bearer token in `Authorization: Bearer <token>` header

### Lessons

- `GET /lessons` — List all lessons
- `GET /lessons/{lesson_id}` — Get lesson details
- `POST /lessons` — Create a new lesson (Instructor only)
- `PUT /lessons/{lesson_id}` — Update a lesson (Instructor only)
- `DELETE /lessons/{lesson_id}` — Delete a lesson (Admin only)

## Database

The app uses SQLAlchemy with the database URL from `DATABASE_URL`. On startup, tables are created automatically via `Base.metadata.create_all(bind=engine)`.

## Notes

- Keep `Backend/.env` out of version control.
- Use `Backend/.env.example` as a safe reference file for collaborators.
- The backend expects bearer token authentication; Swagger UI will accept a bearer token through the `Authorize` button.
