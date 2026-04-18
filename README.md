# Lanzones Scan

A web application for detecting and classifying lanzones fruit from user-uploaded
images. Users sign in, upload a photo, and receive a structured detection result
(bounding boxes, class, confidence) along with a historical record of every scan
they have run.

This repository contains the SvelteKit frontend and API layer. Model inference
is performed by a separate FastAPI service reached over HTTP — see the
[System Workflow](#system-workflow) section for the full request path.

## Tech Stack

### Frontend
- **SvelteKit 2** with **Svelte 5** runes-based components
- **TailwindCSS 4** + `tw-animate-css` for styling and motion
- **bits-ui** + custom UI primitives in `src/lib/components/ui`
- **Phosphor** and **Lucide** icon packs
- **LayerChart** for the dashboard activity and class-distribution charts
- **svelte-sonner** for toast notifications
- **sveltekit-superforms** + **zod** for typed form validation
- **mode-watcher** for light/dark theme handling
- **Geist Variable** as the default font

### Backend (in this repo)
- **SvelteKit** server routes and form actions (Node/Vercel adapter)
- **better-auth** with email + password, backed by the same database
- **drizzle-orm** with the **Turso / libSQL** driver
- **jose** for signing short-lived JWTs used to authenticate with the inference service
- **cloudinary** SDK for image storage and delivery

### External services
- **Turso (libSQL)** — production database. In development a local SQLite file
  (`local.db`) is used instead.
- **Cloudinary** — persistent storage for uploaded images and their public URLs.
- **Lanzones Scan FastAPI** — the inference service that runs the detection
  model. This repo only talks to it; it is deployed separately and is expected
  to expose `POST /analyze`.

### Tooling
- **Bun** as the package manager and script runner
- **Vite 7** build pipeline
- **Vitest** for unit tests, with **@vitest/coverage-v8** for coverage
- **ESLint 9** + **Prettier 3** (with the Svelte and import-sort plugins)
- **drizzle-kit** for migrations and the local studio
- **@sveltejs/adapter-vercel** for deployment

## Installation

### Prerequisites
- **Bun** ≥ 1.1 (`curl -fsSL https://bun.sh/install | bash`)
- **Node** ≥ 20 (only required if you want to run the built output with `bun start` / `node build`)
- A **Cloudinary** account (cloud name, API key, API secret)
- A running **Lanzones Scan FastAPI** service, reachable from this app
- For production: a **Turso** database URL and auth token

### 1. Clone and install
```bash
git clone <repo-url> lanzones-scan
cd lanzones-scan
bun install
```

### 2. Configure environment
Copy the example file and fill in real values:
```bash
cp .env.example .env
```

Variable reference:

| Variable | Purpose |
| --- | --- |
| `PUBLIC_BASE_URL` | Public origin of this app. Used by better-auth and for redirects. |
| `PUBLIC_APP_TITLE` | Display name rendered in the UI. |
| `TURSO_CONFIG` | Set to `dev` to use the local `file:local.db` SQLite file. Any other value uses `TURSO_CONNECTION_URL`. |
| `TURSO_CONNECTION_URL` | libSQL URL (e.g. `libsql://your-db.turso.io`). Ignored when `TURSO_CONFIG=dev`. |
| `TURSO_AUTH_TOKEN` | Turso auth token for the connection above. |
| `BETTER_AUTH_SECRET` | 32+ byte secret used by better-auth to sign sessions. |
| `ORIGIN` | Expected request origin; must match `PUBLIC_BASE_URL` in production. |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary credentials. |
| `CLOUDINARY_FOLDER` | Folder under which uploads are stored (default `lanzones-scan`). |
| `LANZONESSCAN_API_URL` | Base URL of the FastAPI inference service. |
| `LANZONESSCAN_JWT_SECRET` | HS256 secret shared with FastAPI. The service rejects requests signed with any other key. |
| `LANZONESSCAN_JWT_AUDIENCE` | JWT `aud` claim the FastAPI service expects. |
| `LANZONESSCAN_JWT_TTL_SECONDS` | Lifetime of each signed request token (e.g. `300`). |

### 3. Set up the database
For local development (uses `local.db`):
```bash
bun run db:push
```

For a Turso-backed environment, generate and apply migrations:
```bash
bun run db:generate
bun run db:migrate
```

Optionally open the Drizzle studio:
```bash
bun run db:studio
```

### 4. Start the inference service
Start the FastAPI service separately and make sure `LANZONESSCAN_API_URL`
points at it. The secret, audience, and TTL in this app's `.env` must match
the values the FastAPI service is configured with — otherwise every request
will fail with `UpstreamAuthError`.

### 5. Run the app
```bash
bun run dev
```
The app is served on the port configured for Vite (defaults match
`PUBLIC_BASE_URL`, typically `http://localhost:5173`).

### Common scripts
| Command | What it does |
| --- | --- |
| `bun run dev` | Start the dev server with HMR. |
| `bun run build` | Build the production bundle via `@sveltejs/adapter-vercel`. |
| `bun run start` | Run the built output with Node. |
| `bun run check` | Sync SvelteKit types and run `svelte-check`. |
| `bun run lint` | Prettier + ESLint. |
| `bun run format` | Format the repo with Prettier. |
| `bun run test` | Run Vitest once. |
| `bun run coverage` | Run Vitest with V8 coverage. |

## System Workflow

### High-level architecture
```
┌──────────┐   HTTPS    ┌────────────────────────┐   JWT + multipart   ┌──────────────────┐
│ Browser  │ ─────────▶ │  SvelteKit (this app)  │ ──────────────────▶ │ FastAPI service  │
│          │ ◀───────── │  - Auth, forms, UI     │ ◀────────────────── │  - Detection     │
└──────────┘            │  - Drizzle / Turso DB  │      JSON result    │  - Model weights │
                        │  - Cloudinary uploads  │                     └──────────────────┘
                        └──────────┬─────────────┘
                                   │  image bytes
                                   ▼
                            ┌───────────────┐
                            │  Cloudinary   │
                            └───────────────┘
```

### Request-level flow (single scan)
1. **Authentication.** `src/hooks.server.ts` runs on every request. It sets
   security headers, reads the client time zone cookie, and loads the
   better-auth session. Unauthenticated requests to non-public paths are
   redirected to `/login?redirect=<original-path>`.
2. **Upload.** On `/scan`, the user picks an image and submits the form. The
   SvelteKit form action in `src/routes/(base)/scan/+page.server.ts` validates
   MIME type (`image/*`), rejects files larger than 10 MB, and reads the file
   into memory as a `Uint8Array`.
3. **Image storage.** The bytes are streamed to Cloudinary via
   `uploadImage` in `src/lib/server/cloudinary.ts`. Cloudinary returns a secure
   URL, public ID, width, and height.
4. **Signed inference call.** `analyzeImage` in
   `src/lib/server/lanzones-api.ts` mints a short-lived HS256 JWT (signed with
   `LANZONESSCAN_JWT_SECRET`, audience `LANZONESSCAN_JWT_AUDIENCE`, subject set
   to the authenticated user's ID) and POSTs the image as multipart form data
   to `${LANZONESSCAN_API_URL}/analyze`.
5. **Upstream errors.** `401` maps to `UpstreamAuthError`, `429` to
   `UpstreamRateLimitError` (reading `Retry-After`), `400/413/415` to
   `UpstreamImageError`, anything else to `UpstreamError`. On any failure the
   Cloudinary upload is deleted to avoid orphaned assets.
6. **Persistence.** On success, a row is inserted into the `scans` table with
   the filename, Cloudinary URL/public ID, detections JSON, image dimensions,
   and confidence threshold. A ULID is generated for the primary key via
   `generateId()`.
7. **Redirect.** The user is redirected to `/history/<id>`, which renders the
   annotated image, detection list, and metadata.

### Dashboard flow
`src/routes/(base)/+page.server.ts` (the home page) aggregates per-user stats:
- The 4 most recent scans, for the "Recent scans" card.
- Total scan count.
- A 30-day activity series, computed server-side with a `strftime` group-by
  so the histogram respects the user's local date.
- A class-distribution breakdown built by scanning every user's stored
  `detections` JSON and tallying classes.

These are visualised with `dashboard-activity-chart.svelte` and
`dashboard-class-chart.svelte`, both backed by LayerChart.

### History flow
- `/history` lists scans for the signed-in user with numbered pagination and a
  mobile-friendly layout.
- `/history/[id]` loads a single scan, its detections, and the Cloudinary image
  URL for display.

### Data model (Drizzle schema)
- `users`, `sessions`, `accounts`, `verifications` — managed by better-auth
  (`src/lib/server/db/schema/auth.ts`).
- `scans` (`src/lib/server/db/schema/scans.ts`):
  ```
  id                  text PK (ULID)
  user_id             text FK → users(id) on delete cascade
  filename            text
  cloudinary_url      text
  cloudinary_public_id text
  detections          json   — Detection[] { class, confidence, bbox }
  image_width         integer
  image_height        integer
  conf                real   — confidence threshold used for the run
  created_at          integer (timestamp_ms)
  ```

### Trust boundaries
- The browser never talks to the FastAPI service directly. Every inference
  request is proxied through SvelteKit so the upstream JWT secret is never
  exposed client-side.
- Each JWT is scoped to a single request (default 5 minute TTL) and carries the
  caller's user ID as `sub`, which the FastAPI service can use for per-user
  rate limiting and audit logging.
- Security headers (`X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, `Permissions-Policy`) are applied globally in
  `hooks.server.ts`.

### Deployment
The app is configured for Vercel via `@sveltejs/adapter-vercel`. Any platform
that supports the Vercel adapter output (or running `bun start` on the built
bundle) will work as long as:
- The environment variables above are set.
- The FastAPI inference service is reachable from the deployment.
- A production Turso database is provisioned and migrated.
