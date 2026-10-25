# Frontend

The frontend is a responsive Next.js 16 App Router application built with React 19 and TypeScript. It provides student and mentor experiences and communicates with the Express backend over HTTP; it never accesses PostgreSQL directly.

## Features

- Student signup, login, project submission, and personal submission history.
- Search and pagination for a student's submissions.
- Mentor dashboard with submission statistics, status filters, searchable results, and pagination.
- Dashboard search waits for 600 ms of typing inactivity before updating server results and the URL.
- Pending-first review workflow, project preview links, approve/reject decisions, and **Review next** navigation.
- Submission detail views that show status and review feedback to students.
- Shared responsive layouts, form validation, loading/error states, and accessible UI components.

## Local setup

Start the backend first; see [`../backend/README.md`](../backend/README.md). The frontend expects the API to be available at `http://localhost:5000` by default.

From the repository root:

```powershell
cd frontend
Copy-Item .env.example .env.local
npm install
npm run dev
```

On macOS/Linux, use `cp .env.example .env.local` instead of `Copy-Item`.

Open [http://localhost:3000](http://localhost:3000). The optional server-side environment variable `BACKEND_URL` sets the backend destination:

```env
BACKEND_URL=http://localhost:5000
```

The browser requests the same-origin `/api/*` routes. Next.js rewrites them to Express, keeping the authentication cookie first-party. Server Components call the backend directly and forward the request's authentication cookie.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page and entry point |
| `/login` | Sign in |
| `/signup` | Student registration |
| `/student/dashboard` | Student's searchable, paginated submission list |
| `/student/submissions/new` | Submit a project |
| `/student/submissions/[id]` | View submission status and feedback |
| `/mentor/dashboard` | Statistics and searchable, filterable review queue |
| `/mentor/submissions/[id]` | Review a submission and continue to the next pending item |

Role enforcement is performed by the API. Frontend route guards improve navigation and user experience but are not a replacement for backend authorization.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm run build` | Create a production build. |
| `npm start` | Serve the production build. |
| `npm run typecheck` | Generate Next.js route types and run TypeScript checks. |
| `npm run lint` | Run ESLint. |

## Source layout

```text
frontend/src/
├── app/                    # App Router pages, layouts, and error/loading states
├── features/
│   ├── auth/               # Signup, login, logout, and protected shell
│   ├── submissions/        # Student forms, lists, and submission details
│   └── mentor/             # Mentor dashboard, filters, and review actions
├── components/
│   ├── shared/             # Reusable application components
│   └── ui/                 # shadcn/ui-based primitives
├── lib/
│   ├── api/                # Browser and server API clients
│   ├── auth/               # Session and cookie helpers
│   └── validations/        # Client-side Zod schemas
├── hooks/                  # Shared React hooks
├── types/                  # API and domain types
└── proxy.ts                # Authentication-aware route handling
```

## Related documentation

- [Root project guide](../README.md) — complete project overview and local setup.
- [Architecture](../docs/ARCHITECTURE.md) — frontend/backend request flow.
- [API reference](../docs/API.md) — backend endpoints and access rules.
