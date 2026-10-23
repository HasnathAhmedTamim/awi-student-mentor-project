# Decisions

Decisions made where the assessment brief is ambiguous, or where a tooling choice needs a reason.

## Product scope

| Topic | Decision | Why |
| --- | --- | --- |
| "Admin" in the brief | Seeded user has role `MENTOR`. Roles are `STUDENT` and `MENTOR`. | The brief calls the reviewer view "Mentor"; one name avoids confusion. |
| Public signup | Always creates a `STUDENT`. The role is never read from the request body. | Prevents privilege escalation through the signup payload. |
| Duplicate submission | A student cannot submit the same GitHub repository twice. Enforced by a unique constraint on `(studentId, repositoryUrlNormalized)`. | Duplicate prevention must survive concurrent requests, so the database is the source of truth. |
| Repository URL | Only `https://github.com/<owner>/<repo>` is accepted. Normalized form: lowercase owner/repo, no `.git`, trailing slash, query or hash. | The brief asks for a repo URL; GitHub is case-insensitive for owner/repo, so normalization catches near-duplicates. |
| Status transitions | Only `PENDING → APPROVED` and `PENDING → REJECTED`. Reviewed submissions are final. | Keeps the review flow simple and makes repeated/conflicting reviews detectable (`409`). |
| Review note | Optional short `reviewNote` (max 500 chars) a mentor can add when approving or rejecting. Shown to the student. | Gives students actionable feedback without building a comment system. |
| Status filter | All, Pending, Approved, Rejected (server-side). | The brief names Approved and Rejected; Pending and All make the dashboard usable. |
| Pagination | Default 10 per page, max 50. | Bounded queries regardless of client input. |
| Mentor seed | `npm run db:seed` upserts the mentor from `SEED_MENTOR_*` env vars. Re-running it never duplicates the user or resets an existing password. | The brief allows seeding the admin directly; idempotent seeding is safe to run repeatedly. |
| Rate limiting | `express-rate-limit` with the in-memory store on signup, login and submission creation. | Meets "basic rate limit". Limitation: counters are per process and reset on restart. |

### Review note validation policy

`reviewNote` is sent with `PATCH /api/mentor/submissions/:id/status` together with the new status.

- **Optional** for both `APPROVED` and `REJECTED`. Never required.
- **Type:** string, or omitted. Any other type is a `400 VALIDATION_ERROR`.
- **Normalization:** leading and trailing whitespace is trimmed; an empty or whitespace-only note is stored as `null`.
- **Length:** at most 500 characters after trimming (the column is `VARCHAR(500)`). Longer notes are a `400 VALIDATION_ERROR`, never silently truncated.
- **Content:** plain text only. It is rendered as text in React (no HTML rendering), so markup is displayed literally.
- **Who:** only a `MENTOR` can set it, and only as part of the single `PENDING → APPROVED/REJECTED` transition. It cannot be edited afterwards.
- **Visibility:** the owning student and mentors can read it; other students cannot (same rule as the submission itself).
- **Validated twice:** the frontend form uses the same rules for instant feedback; the backend Zod schema is the authority.

## Architecture

| Topic | Decision | Why |
| --- | --- | --- |
| Repository layout | One repo with independent `frontend/` and `backend/` npm projects (no workspaces). | Matches the requested structure and keeps each app runnable on its own. |
| Package manager | npm. | Simplest for reviewers to install and run. |
| API access from the browser | Next.js `rewrites` forward `/api/*` to Express. | The browser only talks to one origin, so the auth cookie is first-party (`SameSite=Lax`) and no cross-site cookie setup is needed. |
| Token storage | JWT in an `HttpOnly` cookie (`Secure` in production). | Not readable from JavaScript, unlike `localStorage`. |
| Express 5 | No `asyncHandler` wrapper. | Express 5 forwards rejected promises from handlers to the error middleware. |
| Validation schemas | Defined separately in frontend and backend. | No shared workspace package; the backend is always the authority. |
| Backend modules | ESM with `NodeNext` resolution, so relative imports use `.js` extensions. | Native Node.js ESM without a bundler. |
| Next.js Cache Components | Kept enabled (the Next.js 16 default from `create-next-app`). | Session reads must sit behind `<Suspense>` boundaries; this is handled per page. |

## Database

| Topic | Decision | Why |
| --- | --- | --- |
| Primary keys | UUID (`@db.Uuid`). | IDs are not guessable or sequential, and malformed IDs can be rejected by validation before hitting the database. |
| Table names | `users`, `submissions` via `@@map`. | Conventional lowercase plural names in SQL; model names stay singular in code. |
| Column limits | Name 100, project name 120, URLs 300, description 2000, review note 500 characters. | The database enforces the same limits as the validation schemas. |
| Indexes | `(status, createdAt)` for the mentor table/filter; `(studentId, createdAt)` for "my submissions". | Matches the two main list queries. |
| Deleting users | Deleting a student deletes their submissions; deleting a mentor keeps the submissions and clears `reviewedById`. | Review history should not disappear with a reviewer account. |
| Connections | App uses Neon's pooled `DATABASE_URL` through `@prisma/adapter-pg`; Prisma CLI (migrations) uses the direct `DIRECT_URL` via `prisma.config.ts`. | Migrations need a direct (non-pooled) session; the app benefits from pooling. |
| TLS | `sslmode=verify-full`. | Verifies the server certificate. `pg` warns that `require` will change meaning in a future version. |

## Tooling

| Topic | Decision | Why |
| --- | --- | --- |
| `@hookform/resolvers` pinned to `5.4.0` | Later versions declare many optional peer dependencies (effect, typeschema, …) that npm 11 fails to resolve (`ERESOLVE`). 5.4.0 only depends on `react-hook-form` and supports Zod 4. | Avoids `--legacy-peer-deps` / `--force`. |
| Prisma 7.10.1 | The npm `latest` tag for `prisma` currently points to `8.0.0-rc`; the stable 7.10.1 is used for the CLI, client and adapter. | Avoids release candidates. Prisma 7 uses `prisma.config.ts`, the `prisma-client` generator and a driver adapter. |
| TypeScript 5.9 in the backend | `typescript-eslint` supports TypeScript `<6.1`. | Keeps type-aware linting working. |
| Tests | Vitest + Supertest against a local PostgreSQL test database. | Fast, ESM-native, and never touches development data. |
