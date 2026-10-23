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
| Rate limiting | `express-rate-limit` with the in-memory store on signup, login and submission creation. | Meets "basic rate limit". Limitation: counters are per process and reset on restart. |

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

## Tooling

| Topic | Decision | Why |
| --- | --- | --- |
| `@hookform/resolvers` pinned to `5.4.0` | Later versions declare many optional peer dependencies (effect, typeschema, …) that npm 11 fails to resolve (`ERESOLVE`). 5.4.0 only depends on `react-hook-form` and supports Zod 4. | Avoids `--legacy-peer-deps` / `--force`. |
| TypeScript 5.9 in the backend | `typescript-eslint` supports TypeScript `<6.1`. | Keeps type-aware linting working. |
| Tests | Vitest + Supertest against a local PostgreSQL test database. | Fast, ESM-native, and never touches development data. |
