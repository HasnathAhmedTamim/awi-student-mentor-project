# Student Project Submission & Mentor Review

A full-stack dashboard where students submit their projects and mentors review, approve or reject them.

- **Students** sign up, submit projects (name, GitHub repository, live URL, description) and follow each submission's status and the mentor's feedback.
- **Students** can search and paginate through their own submissions.
- **Mentors** see statistics for all submissions, search by project, repository, student or email, filter by status, and page through results on the server. Pending reviews are ordered oldest first.
- **Mentors** can preview project links and approve or reject pending submissions with a note (required when rejecting). A student can submit a rejected project again.
- **Responsive review pages** keep project details, student information, links, and review feedback usable on phones, tablets and desktops.

Access is protected with JWT authentication in an HttpOnly cookie and role-based access control (`STUDENT`, `MENTOR`) enforced by the API.

## Documentation

| Document | Contents |
| --- | --- |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System overview, backend modules, database, authentication and authorization flow, workflows |
| [`docs/API.md`](docs/API.md) | Every endpoint with access rules, validation, examples and error codes |
| [`docs/DECISIONS.md`](docs/DECISIONS.md) | Decisions made where the brief was ambiguous, with reasons |

## Technology

| Area | Stack |
| --- | --- |
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn/ui, React Hook Form, Zod, Sonner |
| Backend | Node.js, Express 5, TypeScript, Zod, JSON Web Tokens, bcrypt, Helmet, express-rate-limit |
| Database | PostgreSQL (Neon in development) with Prisma 7 |
| Testing | Vitest and Supertest against a local PostgreSQL test database |

## Project structure

```text
frontend/   Next.js app: pages, forms, UI components
backend/    Express API: modules (auth, submissions, mentor), middleware, Prisma schema and migrations
docs/       Architecture, API and decision records
```

## Prerequisites

- Node.js 22 or newer and npm
- A PostgreSQL database for development (for example a free [Neon](https://neon.tech) project)
- A local PostgreSQL server for the tests (they delete all data in their database)

## Setup

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install          # also generates the Prisma client
```

Edit `backend/.env`:

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Connection string used by the app. With Neon, the **pooled** URL (host contains `-pooler`). |
| `DIRECT_URL` | Connection string used by migrations. With Neon, the **direct** URL. With a plain PostgreSQL server, the same as `DATABASE_URL`. |
| `JWT_SECRET` | At least 32 random characters. Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. |
| `JWT_EXPIRES_IN_SECONDS` | Token and cookie lifetime. Default `86400` (24 hours). |
| `SEED_MENTOR_NAME`, `SEED_MENTOR_EMAIL`, `SEED_MENTOR_PASSWORD` | The mentor account created by the seed script. Choose your own password (at least 8 characters). |
| `PORT` | API port. Default `5000`. |
| `CLIENT_ORIGIN` | Frontend URL allowed by CORS. Default `http://localhost:3000`. |
| `TRUST_PROXY` | Number of proxies in front of the API, used to find the client IP for rate limiting. Default `1` (the Next.js server). |

Create the tables and the mentor account:

```bash
npm run db:deploy    # apply the migrations
npm run db:seed      # create the mentor from SEED_MENTOR_*
```

The seed is safe to run again: it never creates a second mentor and never changes an existing password.

For a reviewer demo, `npm run db:seed:demo` adds two demo students and 14 submissions (12 pending, 1 approved, 1 rejected). It creates only missing demo records, preserves existing submissions and review decisions, and refuses to change an existing account's role. It is allowed for local `awi_dev`; using Neon requires an explicit opt-in:

```powershell
$env:SEED_ALLOW_NEON_DEMO = "true"
npm run db:seed:demo
Remove-Item Env:SEED_ALLOW_NEON_DEMO
```

Neon seeding requires a `*.neon.tech` host and database named `neondb`; the test database and other hosts/databases are rejected. Set `SEED_DEMO_STUDENT_PASSWORD` in `backend/.env` before seeding if you want a known password for both demo students. Otherwise, when it creates new student accounts, the script generates one shared password and prints it once in the terminal. Existing demo student passwords are not reset by rerunning the seed. The mentor login uses `SEED_MENTOR_EMAIL` and `SEED_MENTOR_PASSWORD`; an existing mentor password is not changed.

The project has `STUDENT` and `MENTOR` roles; there is no Admin role or Admin seed account.

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
```

`BACKEND_URL` in `.env.local` is where Next.js forwards `/api/*` requests (default `http://localhost:5000`).

### 3. Run

Start both servers in separate terminals:

```bash
cd backend && npm run dev     # API on http://localhost:5000
cd frontend && npm run dev    # app on http://localhost:3000
```

Open http://localhost:3000.

## Demo workflow

**Student**

1. Open http://localhost:3000 and choose **Sign up as a student**. You are logged in and taken to your dashboard.
2. Choose **Submit project** and submit a project, for example repository `https://github.com/your-name/your-project` and live URL `https://your-project.vercel.app`.
3. The project appears on your dashboard as **Pending**.
4. Submit the same repository again (try `https://github.com/YOUR-NAME/your-project.git`): the form shows "This repository is already pending review or approved."
5. Search and paginate the student submission list, then open a submission to see its status and mentor feedback.
6. Log out.

**Mentor**

1. Log in with the `SEED_MENTOR_EMAIL` and `SEED_MENTOR_PASSWORD` from `backend/.env`.
2. The dashboard shows statistics (total, pending, approved, rejected), search, and a paginated table of all submissions.
3. Filter by **Pending** and open the oldest waiting project first.
4. Write a review note (required to reject, optional to approve), choose **Approve** or **Reject**, and confirm. Choose **Review next pending submission** to continue through the queue.
5. Log out, log in as the student again and open the project: the status and the mentor's note are shown. If it was rejected, **Submit again** opens the form, and the same repository is accepted as a new pending submission.

**Security checks with an API client** (Postman, curl): log in as the student, then call `GET /api/mentor/statistics` or `PATCH /api/mentor/submissions/<id>/status` → `403 FORBIDDEN`. Without a cookie → `401 UNAUTHENTICATED`. See [`docs/API.md`](docs/API.md).

## Tests and checks

### Backend tests

Backend tests require a separate **local** PostgreSQL test database. Create `awi_test`, copy `.env.test.example` to `.env.test`, and set its local PostgreSQL credentials. The test setup applies migrations and truncates test tables; it refuses non-local database hosts. Never point `.env.test` at Neon or a database containing data you need to keep.

```bash
createdb awi_test                  # or create the database in pgAdmin
cd backend
npm test                           # applies migrations to awi_test, then runs Vitest
```

They cover signup and login, token handling (missing, malformed, wrong secret, unsigned, expired), role checks on every protected endpoint, submission validation and duplicates, resubmission after rejection, ownership, pagination and filtering, statistics, approval and rejection (with the required note), repeated and concurrent reviews, and rate limiting.

### All checks

| Location | Command | Purpose |
| --- | --- | --- |
| backend | `npm run typecheck` | TypeScript |
| backend | `npm run lint` | ESLint |
| backend | `npx prisma validate` | Prisma schema |
| backend | `npm test` | Tests |
| backend | `npm run build` / `npm start` | Compile to `dist/` / run the build |
| frontend | `npm run typecheck` | Generates the Next.js route types, then runs TypeScript |
| frontend | `npm run lint` | ESLint |
| frontend | `npm run build` / `npm start` | Production build / run it |

Other backend scripts: `npm run db:migrate` (create a migration during development), `npm run db:studio` (browse data with Prisma Studio).

## Known limitations

- **Stateless tokens.** Logout clears the cookie, but a copied token stays valid until it expires (24 hours by default). The API reads the role from the token, so a role change would only apply after a new login; roles never change in this app.
- **Rate limits are in memory.** Counters are per server process and reset on restart. With several API instances, a shared store such as Redis would be needed. In local development the client IP can be spoofed through `X-Forwarded-For` (see `docs/DECISIONS.md`).
- **Mentors come only from the seed script.** There is no admin UI, no password reset and no email verification.
- **Reviews are final.** A reviewed submission cannot be edited, re-opened or reviewed again, and any mentor can review any submission (no assignment).
- **GitHub only.** Repository URLs must be `https://github.com/<owner>/<repo>`.
- **No frontend Content Security Policy.** The frontend sends clickjacking, MIME-sniffing and referrer headers; a strict CSP would need per-request nonces. The API sends Helmet's default headers, including a CSP.
- **Automated tests cover the backend only.** The frontend was verified manually in the browser (workflows, keyboard focus, mobile layout); there are no end-to-end browser tests.
