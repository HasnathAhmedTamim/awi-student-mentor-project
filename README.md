# Student Project Submission & Mentor Review

A full-stack application for students to submit projects and mentors to review them. Students can track the status and feedback for each submission, while mentors can work through a searchable, paginated review queue.

## Project overview

The application has two roles:

- **Student** — creates an account, submits a GitHub repository with a live demo and description, and follows review status and feedback.
- **Mentor** — views submission statistics, searches and filters submissions, and approves or rejects pending work.

The frontend and API are separate applications in this repository. The Next.js frontend presents the user experience and calls the Express API; only the API accesses PostgreSQL. Prisma manages the schema and database queries.

## How it works

1. A student signs up and submits a project. The API validates the request, checks for an existing pending or approved submission for the same repository, and stores the submission as **Pending**.
2. The student dashboard lists only that student's submissions. Search and pagination let the student find an item and open its current status or review note.
3. The mentor dashboard shows grouped status statistics and a server-paginated submission list. Mentors can search by project, repository, student name, or email and filter by status. Pending submissions are ordered oldest first to surface the longest-waiting work.
4. A mentor opens a pending submission, previews its repository or live site, and approves or rejects it. Rejection requires a note; approval can include an optional note.
5. The student can see the decision and feedback. Rejected projects may be submitted again; a repository already pending or approved cannot be submitted again by the same student.

Login and signup set a signed JWT in an `HttpOnly` cookie. The API verifies the cookie and enforces the `STUDENT` and `MENTOR` roles. The browser calls `/api/*` on the Next.js origin, and Next.js forwards those requests to Express.

## Features

- Student signup, login, logout, and protected dashboards.
- Project submission with GitHub repository and live project links.
- Duplicate protection for pending and approved submissions; resubmission after rejection.
- Student submission search, status visibility, review feedback, and pagination.
- Mentor statistics, status filters, searchable review queue, and server-side pagination.
- Oldest-first ordering for pending reviews and a **Review next** workflow.
- Review decisions with required rejection feedback and optional approval notes.
- Responsive layouts for phones, tablets, and desktops.
- API request validation, role-based access control, password hashing, rate limits, and secure cookie settings.

There are two supported roles, `STUDENT` and `MENTOR`. There is no Admin role or Admin dashboard.

## Technology

| Area | Technology |
| --- | --- |
| Frontend | Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, React Hook Form, Zod |
| Backend | Node.js 22+, Express 5, TypeScript, Zod, JSON Web Tokens, bcryptjs, Helmet, express-rate-limit |
| Data | PostgreSQL, Prisma 7 |
| Backend tests | Vitest and Supertest with a separate local PostgreSQL test database |

## Repository structure

```text
.
├── backend/
│   ├── prisma/             # Prisma schema, migrations, and seed scripts
│   ├── src/
│   │   ├── modules/        # Auth, submissions, and mentor features
│   │   ├── middlewares/    # Authentication, authorization, validation, errors
│   │   ├── config/         # Environment, CORS, and cookie configuration
│   │   ├── lib/            # Prisma, JWT, password, and database helpers
│   │   └── utils/          # API responses, errors, pagination, and search
│   └── tests/              # API and service tests
├── frontend/
│   └── src/
│       ├── app/            # App Router pages and layouts
│       ├── features/       # Auth, student submissions, and mentor workflows
│       ├── components/     # Shared and UI components
│       ├── lib/            # API clients, auth, validation, and utilities
│       └── types/          # Shared frontend types
└── docs/                   # Architecture, API reference, and decisions
```

For component- and package-specific guidance, see [`backend/README.md`](backend/README.md) and [`frontend/README.md`](frontend/README.md).

## Setup

### Prerequisites

- Node.js 22 or newer and npm.
- PostgreSQL for application data (local PostgreSQL or a hosted provider such as Neon).
- A separate local PostgreSQL database for backend tests. Tests apply migrations and clear data in that test database; never use a database containing data you need to keep.

### 1. Configure and start the backend

From the repository root, open a terminal:

```powershell
cd backend
Copy-Item .env.example .env
npm install
```

On macOS/Linux, use `cp .env.example .env` instead of `Copy-Item`.

Edit `backend/.env` and set the PostgreSQL connection strings, a strong `JWT_SECRET` (at least 32 characters), and the mentor account values in `SEED_MENTOR_*`. See [`backend/README.md`](backend/README.md) for every supported variable and Neon connection details.

Create the database tables and initial mentor, then start the API:

```powershell
npm run db:deploy
npm run db:seed
npm run dev
```

The API listens at `http://localhost:5000` by default. Keep this terminal running.

### 2. Configure and start the frontend

In a second terminal from the repository root:

```powershell
cd frontend
Copy-Item .env.example .env.local
npm install
npm run dev
```

On macOS/Linux, use `cp .env.example .env.local` instead of `Copy-Item`.

The frontend listens at `http://localhost:3000`. `BACKEND_URL` in `frontend/.env.local` sets the server-side API destination and defaults to `http://localhost:5000`.

Open [http://localhost:3000](http://localhost:3000), sign up as a student, or log in as the seeded mentor using `SEED_MENTOR_EMAIL` and `SEED_MENTOR_PASSWORD`.

### Optional reviewer demo data

The demo seed adds two demo students and 14 submissions (12 pending, one approved, and one rejected). Set `SEED_DEMO_STUDENT_PASSWORD` in `backend/.env` to choose a password for newly created demo student accounts. If omitted, the script generates a password and prints it once when it creates new accounts.

Run `npm run db:seed:demo` from `backend/`. The script is restricted to a local PostgreSQL database named `awi_dev` by default. Existing demo accounts, passwords, submissions, and review decisions are preserved. Do not point this at a production database. Neon requires an explicit opt-in; details and safeguards are documented in [`backend/README.md`](backend/README.md).

## Validation

Run these commands from the corresponding application directory:

| Project | Command | Purpose |
| --- | --- | --- |
| Backend | `npm run typecheck` | TypeScript check |
| Backend | `npm run lint` | ESLint |
| Backend | `npx prisma validate` | Validate Prisma schema |
| Backend | `npm test` | Run backend tests against the configured local test database |
| Backend | `npm run build` | Compile the API to `dist/` |
| Frontend | `npm run typecheck` | Generate route types and check TypeScript |
| Frontend | `npm run lint` | ESLint |
| Frontend | `npm run build` | Create a production build |

Backend test setup and database safety requirements are in [`backend/README.md`](backend/README.md).

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — application boundaries, request flow, and data model.
- [API reference](docs/API.md) — endpoints, access rules, validation, and response formats.
- [Decision records](docs/DECISIONS.md) — implementation decisions and trade-offs.
- [Backend guide](backend/README.md) — backend configuration, database, seeds, and scripts.
- [Frontend guide](frontend/README.md) — routes, UI structure, configuration, and scripts.

## Known limitations

- Mentors are provisioned through the seed script; there is no mentor signup, admin UI, password reset, or email verification.
- Reviews are final, and submissions are not assigned to individual mentors.
- Logout clears the browser cookie, but a copied token remains valid until it expires.
- Rate-limit counters are in memory and are not shared across API instances.
- Automated tests cover the backend; frontend workflows have been manually verified and do not currently have browser automation tests.
