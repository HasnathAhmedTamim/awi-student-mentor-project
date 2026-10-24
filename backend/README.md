# Backend

The backend is the source of truth for authentication, authorization, validation, submission and review rules, and database access. It is an Express 5 API written in TypeScript, with PostgreSQL accessed through Prisma 7.

## Responsibilities

- Register and authenticate users; issue and clear the signed `HttpOnly` JWT cookie.
- Enforce `STUDENT` and `MENTOR` access rules on protected routes.
- Validate request bodies, path parameters, and query parameters.
- Create submissions, prevent duplicate pending/approved repositories per student, and allow resubmission after rejection.
- Provide student and mentor lists with search, status filtering, and server-side pagination.
- Return grouped mentor statistics and process review decisions.
- Normalize API errors and apply security headers and rate limits.

The frontend does not access the database. See [`../docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md) for the complete request flow and [`../docs/API.md`](../docs/API.md) for endpoint details.

## Requirements

- Node.js 22 or newer and npm.
- PostgreSQL.

## Local setup

From the repository root:

```powershell
cd backend
Copy-Item .env.example .env
npm install
```

On macOS/Linux, use `cp .env.example .env` instead of `Copy-Item`.

Edit `.env` before starting the server:

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL URL used by the application. For Neon, use the pooled URL. |
| `DIRECT_URL` | For migrations | Direct PostgreSQL URL used by Prisma migrations. For a local database, it may match `DATABASE_URL`. |
| `JWT_SECRET` | Yes | Signing secret of at least 32 characters. |
| `SEED_MENTOR_EMAIL` | For seeding | Email address for the mentor account. |
| `SEED_MENTOR_PASSWORD` | For seeding | Initial mentor password; must be at least 8 characters. |
| `SEED_MENTOR_NAME` | No | Mentor display name; defaults to `Mentor`. |
| `SEED_DEMO_STUDENT_PASSWORD` | No | Password for demo students created by the demo seed. |
| `PORT` | No | API port; defaults to `5000`. |
| `CLIENT_ORIGIN` | No | Allowed frontend origin; defaults to `http://localhost:3000`. |
| `JWT_EXPIRES_IN_SECONDS` | No | Token and cookie lifetime; defaults to 24 hours. |
| `TRUST_PROXY` | No | Trusted proxy count for client IP handling; defaults to `1`. |
| `NODE_ENV` | No | Runtime mode; defaults to `development`. |

Generate a suitable JWT secret with Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

For Neon, configure `DATABASE_URL` with the pooled connection URL and `DIRECT_URL` with the direct connection URL. Keep credentials private and do not commit `.env`.

Create the schema and seed the mentor configured by `SEED_MENTOR_*`:

```bash
npm run db:deploy
npm run db:seed
```

Then start the API:

```bash
npm run dev
```

The API is available at `http://localhost:5000` by default. The Next.js frontend forwards browser `/api/*` requests to this server; set `CLIENT_ORIGIN` to the frontend origin if it differs from the default.

## Demo data

To create reviewer demo data, set `SEED_DEMO_STUDENT_PASSWORD` in `.env` if a known student password is needed, then run:

```bash
npm run db:seed:demo
```

The seed creates or verifies the configured mentor, two demo student accounts, and 14 sample submissions (12 pending, one approved, one rejected). It preserves existing demo accounts and submissions; it does not reset existing passwords or overwrite review decisions. Without `SEED_DEMO_STUDENT_PASSWORD`, a generated password is printed once when new demo students are created.

By default, demo seeding is allowed only for a local PostgreSQL database named `awi_dev`. Neon seeding is blocked unless `SEED_ALLOW_NEON_DEMO=true` is explicitly set, and then only a `*.neon.tech` host with a database named `neondb` is accepted. Avoid seeding valuable or production data.

## Tests

Backend tests require a separate **local** PostgreSQL database named `awi_test`. Copy `.env.test.example` to `.env.test` and configure local test database credentials. The test setup applies migrations and truncates tables in that database, and rejects non-local database hosts. Never point `.env.test` to Neon or a database containing data you need to keep.

```bash
createdb awi_test
npm test
```

Create `awi_test` with your PostgreSQL administration tool if `createdb` is unavailable. Tests cover authentication and token handling, role checks, submission validation and duplicates, resubmission after rejection, ownership, search and pagination, statistics, review decisions, concurrent review attempts, and rate limiting.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the API with file watching. |
| `npm run build` | Compile TypeScript to `dist/`. |
| `npm start` | Start the compiled API. |
| `npm run typecheck` | Type-check without emitting files. |
| `npm run lint` | Run ESLint. |
| `npm test` | Run the backend test suite. |
| `npm run db:generate` | Generate the Prisma client. |
| `npm run db:migrate` | Create/apply a development migration. |
| `npm run db:deploy` | Apply committed migrations. |
| `npm run db:seed` | Create or verify the configured mentor. |
| `npm run db:seed:demo` | Create or verify reviewer demo data. |
| `npm run db:studio` | Open Prisma Studio. |

## Source layout

```text
backend/
├── prisma/
│   ├── migrations/         # Versioned database migrations
│   ├── schema.prisma       # PostgreSQL data model and indexes
│   ├── seed.ts             # Initial mentor seeding
│   └── seed-demo.ts        # Optional reviewer demo data
├── src/
│   ├── modules/
│   │   ├── auth/           # Signup, login, logout, and current user
│   │   ├── submissions/    # Student submissions and repository validation
│   │   └── mentor/         # Mentor queue, statistics, and review decisions
│   ├── middlewares/        # Authentication, role checks, validation, errors
│   ├── config/            # Environment, CORS, and cookie settings
│   ├── lib/                # Prisma, JWT, password, and Prisma error helpers
│   ├── utils/              # API response, errors, pagination, and search
│   ├── app.ts              # Express app composition
│   └── server.ts           # HTTP server startup and shutdown
└── tests/                  # API and service tests
```

Each feature module separates routes, validation, controllers, and services. Routes define middleware order, controllers translate HTTP requests into service calls, and services hold business rules and Prisma operations.
