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
| Live URL | Required. Must be `http` or `https` with a public domain name (no `localhost` or IP addresses), max 300 characters. | Reviewers need a reachable deployment; other protocols such as `javascript:` are rejected. |
| Stored repository URL | The canonical form `https://github.com/<owner>/<repo>` is stored, keeping the student's letter case. The lowercase form is stored separately for duplicate checks and never returned by the API. | Clean links for reviewers, case-insensitive duplicate detection. |
| Submission rate limit | 20 new submissions per hour per student (keyed by user id, not IP). | Students on a shared campus network do not block each other. |
| Reading a submission | `GET /api/submissions/:id`: a student can read only their own (another student's id returns `404`, not `403`); a mentor can read any. | Does not reveal whether someone else's submission exists. |
| "My submissions" list | Paginated on the server like the mentor list (default 10, max 50), newest first. | Bounded queries; the same pagination rules everywhere. |
| Mentor submissions list | `GET /api/mentor/submissions`, mentor-only. Newest first (`createdAt` then `id`, so equal timestamps keep a stable order). Each row includes the student's id, name and email only. The status filter is an exact `PENDING`/`APPROVED`/`REJECTED` value; "All" means omitting it. Anything else is a `400`. | Stable paging; no password hashes or other user fields leak; invalid filters fail loudly instead of silently showing everything. |
| Mentor statistics | `GET /api/mentor/statistics` counts all submissions with one `groupBy` on status. Statuses with no submissions return `0`. | One query, always consistent with the stored data, independent of the current filter or page. |
| Filter and page in the URL | The dashboard reads `?status=` and `?page=` from the URL. Invalid values fall back to "All" and page 1; a page past the end shows an empty state with a link to the first page. | Filtered views can be shared and reloaded, and the back button works. |
| Mentor table on small screens | Below the `sm` breakpoint the Student column is hidden and the student's name is shown under the project; the Submitted column is hidden below `md`. | The table fits a phone screen without horizontal scrolling. |
| Who can review | Any mentor can review any pending submission. Students get `403` from every mentor endpoint, including for their own submissions. | There is no mentor-to-student assignment in the brief. |
| Review request | `PATCH /api/mentor/submissions/:id/status` with `{ status: "APPROVED" \| "REJECTED", reviewNote? }`. The reviewer is the authenticated mentor and the time is set by the server; any other body fields (such as `reviewedById`) are ignored. | Clients cannot attribute a review to someone else or backdate it. |
| Concurrent reviews | The update is a single `UPDATE … WHERE id = ? AND status = 'PENDING'`. If no row changed, the submission is re-read: missing is `404 SUBMISSION_NOT_FOUND`, otherwise `409 SUBMISSION_ALREADY_REVIEWED` with the current status in the message. | PostgreSQL re-checks the `WHERE` clause after a concurrent update commits, so of two simultaneous reviews exactly one succeeds. No transaction is needed (see "Paginated list queries" for the Neon transaction issue). |
| Deleted mentor with a valid token | The review fails with `401 UNAUTHENTICATED` (foreign-key violation on `reviewedById`) and nothing changes. | Tokens are stateless, so the account is only re-checked where the database requires it. |
| Review UI | A mentor page per submission (`/mentor/submissions/:id`), linked from the project name in the table. Approve and Reject open a confirmation dialog that names the project and states that reviews are final. After a `401`, `404` or `409` the page reloads to show the real state; other errors keep the typed note. | A deliberate, final action gets an explicit confirmation; a stale page never keeps offering an action that can no longer succeed. |

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
| Protected routes and `instant` | Student and mentor layouts/pages set `export const instant = false`. | They verify the session with the backend on every request, so they cannot be instant. Caching the user (`use cache: private`) was rejected to avoid serving a stale user or role after logout or a role change. |

## Authentication and authorization

| Topic | Decision | Why |
| --- | --- | --- |
| Cookie | `access_token`: `HttpOnly`, `SameSite=Lax`, `Path=/`, `Secure` in production, same lifetime as the token. | Not readable by scripts; first-party through the Next.js rewrite. |
| JWT | HS256, `sub` = user id, `role` claim, 24 h expiry (`JWT_EXPIRES_IN_SECONDS`). Verification pins the algorithm and validates the payload shape. | Rejects `alg: none`, tokens signed with another algorithm and malformed payloads. |
| Server-side role checks | `authenticate` reads only the cookie; `authorizeRoles(...)` checks `req.user.role` from the verified token. Headers, query strings and bodies are never used for the role. | The frontend checks are UX only; the API is the authority. |
| Error codes | `401 UNAUTHENTICATED` / `TOKEN_EXPIRED` / `INVALID_TOKEN`, `403 FORBIDDEN`. | The client can tell "log in again" apart from "not allowed". |
| Signup | Logs the new student in immediately (sets the cookie). | One less step; the account is a `STUDENT` either way. |
| Login errors | Same `401 INVALID_CREDENTIALS` message for an unknown email and a wrong password; an unknown email is still compared against a dummy bcrypt hash. | Prevents account enumeration through messages or response timing. |
| Passwords | bcrypt, cost 12. 8–72 characters with at least one letter and one number. | 72 bytes is bcrypt's input limit, so longer passwords are rejected instead of silently truncated. |
| Logout | Clears the cookie. Tokens are stateless, so a copied token stays valid until it expires. | No token store needed for this scope; the short lifetime limits the window. |
| CSRF | Relies on `SameSite=Lax` plus JSON request bodies (`Content-Type: application/json`). No CSRF token. | Cross-site forms cannot send the cookie with `POST`/`PATCH`, nor a JSON body without a CORS preflight. |
| Rate limits | Login: 10 failed attempts per 15 min per IP (successful logins are not counted). Signup: 5 per hour per IP. | Slows down password guessing and mass account creation. |
| Client IP | `trust proxy` = `TRUST_PROXY` (default `1`, the Next.js server). | Needed to rate-limit by the real client IP behind the rewrite. Limitation: the Next.js dev server keeps a client-supplied `X-Forwarded-For`, so locally the IP can be spoofed. In production, set `TRUST_PROXY` to match the real proxy chain. |
| Frontend route guard | `proxy.ts` redirects to `/login` when the cookie is missing (fast path only). Layouts and pages call `requireRole`, which asks the backend `/api/auth/me`. | The token is never decoded or trusted in the frontend. |

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
| Paginated list queries | The page of rows and the total count run as two parallel queries (`Promise.all`), not an interactive `$transaction`. | Against Neon, a `$transaction` sometimes failed to start within Prisma's 2 s `maxWait` (`P2028`). For a read-only list, a count that is off by one during a concurrent insert is acceptable. |

## Tooling

| Topic | Decision | Why |
| --- | --- | --- |
| `@hookform/resolvers` pinned to `5.4.0` | Later versions declare many optional peer dependencies (effect, typeschema, …) that npm 11 fails to resolve (`ERESOLVE`). 5.4.0 only depends on `react-hook-form` and supports Zod 4. | Avoids `--legacy-peer-deps` / `--force`. |
| Prisma 7.10.1 | The npm `latest` tag for `prisma` currently points to `8.0.0-rc`; the stable 7.10.1 is used for the CLI, client and adapter. | Avoids release candidates. Prisma 7 uses `prisma.config.ts`, the `prisma-client` generator and a driver adapter. |
| TypeScript 5.9 in the backend | `typescript-eslint` supports TypeScript `<6.1`. | Keeps type-aware linting working. |
| Tests | Vitest + Supertest against a local PostgreSQL test database. | Fast, ESM-native, and never touches development data. |
