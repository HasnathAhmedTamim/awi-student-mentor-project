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
cp .env.example .env   # fill in DATABASE_URL, DIRECT_URL and SEED_MENTOR_*
npm install            # also generates the Prisma client
npm run db:deploy      # apply migrations
npm run db:seed        # create the mentor account
npm run dev            # http://localhost:5000

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
| backend | `npm run db:migrate` | Create/apply a migration in development |
| backend | `npm run db:deploy` | Apply existing migrations |
| backend | `npm run db:seed` | Create or update the mentor account |
| backend | `npm run db:studio` | Browse data with Prisma Studio |
| frontend | `npm run dev` | Start the Next.js dev server |
| frontend | `npm run build` / `npm start` | Production build |
| frontend | `npm run lint` / `npm run typecheck` | Static checks |

Design decisions are recorded in [`docs/DECISIONS.md`](docs/DECISIONS.md).
