# Student Project Submission & Mentor Review

Students submit their projects; mentors review, approve, or reject them.

> Work in progress. Full setup, API, and architecture docs will be added as features land.

## Stack

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui, React Hook Form, Zod
- **Backend:** Express 5, TypeScript, Zod
- **Database:** PostgreSQL (Neon) via Prisma ORM
- **Auth:** JWT in an HttpOnly cookie, role-based access control (`STUDENT`, `MENTOR`)

## Project structure

```text
frontend/   Next.js app (UI)
backend/    Express API
docs/       Architecture, API and decision records
```

## Getting started

Requirements: Node.js 22+ and npm.

```bash
# Backend
cd backend
cp .env.example .env
npm install
npm run dev        # http://localhost:5000

# Frontend (in a second terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev        # http://localhost:3000
```

The frontend forwards `/api/*` requests to the backend (`BACKEND_URL`).

## Scripts

| Location | Command | Purpose |
| --- | --- | --- |
| backend | `npm run dev` | Start the API with hot reload |
| backend | `npm run build` / `npm start` | Compile and run the production build |
| backend | `npm test` | Run tests |
| backend | `npm run lint` / `npm run typecheck` | Static checks |
| frontend | `npm run dev` | Start the Next.js dev server |
| frontend | `npm run build` / `npm start` | Production build |
| frontend | `npm run lint` / `npm run typecheck` | Static checks |

Design decisions are recorded in [`docs/DECISIONS.md`](docs/DECISIONS.md).
