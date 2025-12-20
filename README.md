# Smart Restaurant Queue & Table Management System

This repository contains a full-stack application to manage restaurant tables, reservations, and the waiting queue in real time using Angular (frontend) and Node.js (TypeScript) with MySQL.

## Quickstart (Development)

Prerequisites:
- Node.js 18+
- npm
- Docker (for DB) or a local MySQL instance

1) Start the database via Docker (recommended):

   docker-compose up -d

2) Configure environment variables in `backend/.env` (see `backend/.env.example` if present).

3) Run migrations to create schema:

   cd backend
   npm run db:migrate

4) Start backend (dev mode):

   cd backend
   npm run dev

5) Start frontend (dev mode):
   cd client
   npm install
   npm start

Note: The frontend is in `client/` (Angular standalone components).

## Tests

- Backend unit & integration (runs migrations automatically in CI):

  cd backend
  npm test

- To run integration tests locally (runs in-band to avoid DB race conditions):

  npm run test:integration

- Frontend build:
   cd client
   npm run build

## Auth & Session

- Authentication uses JWT set as an httpOnly cookie by the backend. Use the `/api/auth/login` and `/api/auth/signup` endpoints to authenticate. The frontend exposes `/login` and `/signup` routes and calls `/api/auth/me` to load the current user.

## Environment variables (backend)

- DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT
- JWT_SECRET (set a strong secret)
- JWT_EXPIRES_IN, JWT_COOKIE_EXPIRES_IN (optional)


Note: Frontend unit tests require a headless browser or proper CI configuration (we recommend using Chrome Headless via Puppeteer in CI).

## CI

A GitHub Actions workflow is included at `.github/workflows/ci.yml` which runs DB migrations, backend tests (integration enabled), and builds the frontend.

## Docker

A `docker-compose.yml` is included for development to start a MySQL instance.

## Notes & Next Steps

- Role-based access is implemented server-side and client-side using JWT and Angular guards.
- Real-time updates use Socket.IO for queue and reservation events.
- Add more tests (frontend unit and E2E) and finalize admin analytics dashboards as needed.

---

Happy developing! If you want, I can now:
- Add Puppeteer-based headless test setup for the frontend CI
- Implement additional admin features and analytics
- Add end-to-end Cypress tests

Tell me which of the tasks above you want me to prioritize next.