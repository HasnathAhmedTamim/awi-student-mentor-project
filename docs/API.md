# API

The Express API lives in `backend/`. In development it listens on `http://localhost:5000`; the Next.js app forwards `http://localhost:3000/api/*` to it, so the browser only ever talks to one origin.

All paths below start with `/api`.

## Conventions

### Requests

- Request bodies are JSON (`Content-Type: application/json`), at most 100 kB.
- Text fields are trimmed before validation (passwords are not). Unknown body fields are ignored (for example a `role` sent to signup or a `reviewedById` sent with a review).
- IDs are UUIDs. A malformed ID is a `400 VALIDATION_ERROR`, not a `404`.
- CORS allows only `CLIENT_ORIGIN` (the frontend), with credentials.

### Authentication

Login and signup set an `access_token` cookie containing a signed JWT:

| Attribute | Value |
| --- | --- |
| `HttpOnly` | yes (not readable from JavaScript) |
| `SameSite` | `Lax` |
| `Secure` | in production |
| `Path` | `/` |
| `Max-Age` | `JWT_EXPIRES_IN_SECONDS` (default 24 hours) |

Protected endpoints read only this cookie. The user's id and role come from the verified token, never from the request body, query string or headers. API clients such as Postman keep the cookie automatically after a login request.

| Access | Meaning |
| --- | --- |
| Public | No cookie needed. |
| Authenticated | Any logged-in user. |
| `STUDENT` / `MENTOR` | Logged in with that role. Otherwise `403 FORBIDDEN`. |

### Success responses

```json
{
  "success": true,
  "data": { "submission": { "id": "…" } }
}
```

Paginated lists add `meta`:

```json
{
  "success": true,
  "data": { "submissions": [] },
  "meta": { "page": 1, "limit": 10, "total": 23, "totalPages": 3 }
}
```

### Error responses

```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "Some fields are invalid.",
  "details": [
    { "field": "repositoryUrl", "message": "Enter a GitHub repository URL like https://github.com/owner/repo." }
  ]
}
```

`code` is stable and meant for programs; `message` is safe to show to users. `details` is present only for field-level errors. Stack traces and internal errors are never returned.

| Status | Code | When |
| --- | --- | --- |
| 400 | `VALIDATION_ERROR` | Body, query or path parameter is invalid. `details` lists each field. |
| 400 | `INVALID_JSON` | The body is not valid JSON. |
| 401 | `UNAUTHENTICATED` | No cookie, or the account behind the token no longer exists. |
| 401 | `TOKEN_EXPIRED` | The token has expired. |
| 401 | `INVALID_TOKEN` | The token is malformed, has a bad signature or uses another algorithm. |
| 401 | `INVALID_CREDENTIALS` | Wrong email or password (same message for both). |
| 403 | `FORBIDDEN` | Logged in, but the role is not allowed. |
| 404 | `SUBMISSION_NOT_FOUND` | No such submission, or it belongs to another student. |
| 404 | `ROUTE_NOT_FOUND` | Unknown endpoint. |
| 409 | `EMAIL_TAKEN` | Signup with an email that already has an account. |
| 409 | `DUPLICATE_SUBMISSION` | The student's submission of this repository is already pending or approved. |
| 409 | `SUBMISSION_ALREADY_REVIEWED` | The submission is no longer pending. |
| 413 | `PAYLOAD_TOO_LARGE` | Body larger than 100 kB. |
| 429 | `RATE_LIMITED` | Too many requests (see [Rate limits](#rate-limits)). |
| 500 | `INTERNAL_SERVER_ERROR` | Unexpected error. Details are only logged on the server. |

### Pagination

List endpoints accept:

| Parameter | Type | Default | Rules |
| --- | --- | --- | --- |
| `page` | integer | `1` | At least 1. A page past the end returns an empty list with the real `total`. |
| `limit` | integer | `10` | 1–50. |

Results use stable ordering by `createdAt` and `id`. Mentor pending submissions are oldest first; other mentor results and student submissions are newest first. Paging and filtering happen in the database query.

### Rate limits

| Endpoint | Limit | Keyed by |
| --- | --- | --- |
| `POST /auth/login` | 10 failed attempts per 15 minutes (successful logins are not counted) | IP address |
| `POST /auth/signup` | 5 per hour | IP address |
| `POST /submissions` | 20 per hour | Student id |

Responses include the standard `RateLimit` and `RateLimit-Policy` headers. Counters are kept in memory per server process.

### Objects

**User**

```json
{
  "id": "6f1c2b0e-3d4a-4b8e-9a51-2f7c8d9e0a1b",
  "name": "Nadia Islam",
  "email": "nadia@example.com",
  "role": "STUDENT",
  "createdAt": "2026-10-23T18:05:12.000Z"
}
```

`role` is `STUDENT` or `MENTOR`. The password hash is never returned.

**Submission**

```json
{
  "id": "f70f1502-950e-4170-a0a0-b0a2da85f015",
  "projectName": "Weather Station",
  "repositoryUrl": "https://github.com/nadia-islam/weather-station",
  "liveUrl": "https://weather-station.vercel.app",
  "description": "A weather dashboard using the Open-Meteo API, built with Next.js.",
  "status": "PENDING",
  "reviewNote": null,
  "reviewedAt": null,
  "createdAt": "2026-10-23T18:20:11.000Z",
  "updatedAt": "2026-10-23T18:20:11.000Z"
}
```

`status` is `PENDING`, `APPROVED` or `REJECTED`. **Submission detail** (single-submission endpoints) adds:

```json
{
  "student": { "id": "6f1c2b0e-…", "name": "Nadia Islam", "email": "nadia@example.com" },
  "reviewedBy": { "id": "0b7d…", "name": "Mentor" }
}
```

`reviewedBy` is `null` until the submission is reviewed (or if the reviewing mentor's account was deleted).

---

## Health

### `GET /health`

Public. Returns `200` with `{ "status": "ok" }`.

## Auth

### `POST /auth/signup`

Public. Creates a **student** account and logs it in (sets the cookie). A `role` in the body is ignored.

| Field | Rules |
| --- | --- |
| `name` | 2–100 characters. |
| `email` | Valid email, at most 255 characters. Stored in lowercase. |
| `password` | 8–72 characters, at least one letter and one number. |

```json
{ "name": "Nadia Islam", "email": "nadia@example.com", "password": "Weather2026" }
```

`201` → `{ "user": User }`

Errors: `400 VALIDATION_ERROR`, `409 EMAIL_TAKEN` (with a `details` entry for `email`), `429 RATE_LIMITED`.

### `POST /auth/login`

Public. Sets the cookie.

```json
{ "email": "nadia@example.com", "password": "Weather2026" }
```

`200` → `{ "user": User }`

Errors: `400 VALIDATION_ERROR`, `401 INVALID_CREDENTIALS`, `429 RATE_LIMITED`.

### `POST /auth/logout`

Public. Clears the cookie. `200` → `data: null`.

The JWT is stateless: a copy of the token taken before logout stays valid until it expires.

### `GET /auth/me`

Authenticated. Returns the current user, read from the database.

`200` → `{ "user": User }`

Errors: `401 UNAUTHENTICATED` / `TOKEN_EXPIRED` / `INVALID_TOKEN`.

## Student submissions

### `POST /submissions`

`STUDENT` only. Creates a submission with status `PENDING`.

| Field | Rules |
| --- | --- |
| `projectName` | 2–120 characters. |
| `repositoryUrl` | `https://github.com/<owner>/<repo>`, at most 300 characters. A trailing slash, `.git` suffix, query string or hash is removed; deeper paths such as `/tree/main` are rejected. |
| `liveUrl` | `http` or `https` URL with a public domain name (no `localhost` or IP address), at most 300 characters. |
| `description` | 10–2000 characters. |

```json
{
  "projectName": "Weather Station",
  "repositoryUrl": "https://github.com/Nadia-Islam/Weather-Station.git",
  "liveUrl": "https://weather-station.vercel.app",
  "description": "A weather dashboard using the Open-Meteo API, built with Next.js."
}
```

`201` → `{ "submission": Submission }`, with `repositoryUrl` stored as `https://github.com/Nadia-Islam/Weather-Station`.

A student cannot submit a repository that is already pending review or approved for them. Owner and repository names are compared case-insensitively, so `https://github.com/nadia-islam/weather-station/` counts as the same repository. A rejected repository can be submitted again; this creates a new `PENDING` submission and keeps the rejected one.

Errors: `400 VALIDATION_ERROR`, `401`, `403 FORBIDDEN` (mentors), `409 DUPLICATE_SUBMISSION` (with a `details` entry for `repositoryUrl`), `429 RATE_LIMITED`.

### `GET /submissions/mine?page=1&limit=10`

`STUDENT` only. The current student's submissions.

| Parameter | Rules |
| --- | --- |
| `page`, `limit` | See [Pagination](#pagination). |
| `q` | Optional, case-insensitive substring match against project name or repository URL. |

`200` → `{ "submissions": Submission[] }` plus `meta`.

Errors: `400 VALIDATION_ERROR` (bad `page`/`limit`), `401`, `403`.

### `GET /submissions/:id`

`STUDENT` or `MENTOR`. A student can read only their own submissions; another student's submission returns `404`, so its existence is not revealed. A mentor can read any submission.

`200` → `{ "submission": SubmissionDetail }`

Errors: `400 VALIDATION_ERROR` (malformed id), `401`, `404 SUBMISSION_NOT_FOUND`.

## Mentor

Every mentor endpoint requires the `MENTOR` role. Students get `403 FORBIDDEN`, including for their own submissions.

### `GET /mentor/submissions?page=1&limit=10&status=PENDING`

All students' submissions. Pending submissions are ordered oldest first so the longest-waiting projects appear first; other results are newest first.

| Parameter | Rules |
| --- | --- |
| `page`, `limit` | See [Pagination](#pagination). |
| `status` | Optional. `PENDING`, `APPROVED` or `REJECTED`. Omit it for all submissions. Any other value is a `400`. |
| `q` | Optional, case-insensitive substring match against project name, repository URL, student name or student email. |

`200` → `{ "submissions": MentorSubmission[] }` plus `meta`. Each item is a Submission with `student: { id, name, email }`. `meta.total` counts only submissions matching the filter.

```json
{
  "success": true,
  "data": {
    "submissions": [
      {
        "id": "f70f1502-950e-4170-a0a0-b0a2da85f015",
        "projectName": "Weather Station",
        "status": "PENDING",
        "student": { "id": "6f1c2b0e-…", "name": "Nadia Islam", "email": "nadia@example.com" },
        "…": "other Submission fields"
      }
    ]
  },
  "meta": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
}
```

### `GET /mentor/statistics`

Counts of all submissions by status, computed with one database query. Not affected by any filter.

`200`:

```json
{
  "success": true,
  "data": { "statistics": { "total": 4, "pending": 2, "approved": 2, "rejected": 0 } }
}
```

### `PATCH /mentor/submissions/:id/status`

Approves or rejects a **pending** submission. Reviews are final.

| Field | Rules |
| --- | --- |
| `status` | `APPROVED` or `REJECTED`. |
| `reviewNote` | Text shown to the student. Optional when approving, **required when rejecting**. Trimmed; at most 500 characters after trimming; an empty note is stored as `null` (and is therefore rejected for `REJECTED`). |

```json
{ "status": "APPROVED", "reviewNote": "Clean layout and clear README." }
```

The reviewing mentor (`reviewedBy`) and time (`reviewedAt`) are set by the server from the token and the clock; any such fields in the body are ignored.

`200` → `{ "submission": SubmissionDetail }` with the new status, note, reviewer and review time.

Errors:

| Status | Code | When |
| --- | --- | --- |
| 400 | `VALIDATION_ERROR` | Malformed id, a status other than `APPROVED`/`REJECTED`, a note that is not text or too long, or `REJECTED` without a note. |
| 401 | `UNAUTHENTICATED` / `TOKEN_EXPIRED` / `INVALID_TOKEN` | Not logged in, or the mentor's account no longer exists. |
| 403 | `FORBIDDEN` | The user is a student. |
| 404 | `SUBMISSION_NOT_FOUND` | No submission with this id. |
| 409 | `SUBMISSION_ALREADY_REVIEWED` | Already approved or rejected, e.g. by another mentor a moment earlier. The message states the current status. |

If two mentors review the same submission at the same time, exactly one request succeeds and the other gets `409`.
