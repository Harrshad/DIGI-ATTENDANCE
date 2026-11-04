# Implementation Plan: TriAttendance Platform

## 1. Major Components & Capability Architecture

The platform is structured into 7 core capability modules following `CAPABILITY-MAP.md` and `SPEC.md`, built as a monorepo (`apps/api`, `apps/web`, `packages/shared`, `docker/`):

```
packages/shared (Types, Zod Schemas, API Contracts)
       │
       ▼
apps/api (NestJS, Drizzle ORM, PostGIS, Valkey, BullMQ, Garage S3, Nodemailer)
       │
       ▼
apps/web (Next.js 15, Tailwind CSS, shadcn/ui, TanStack Table/Query, MapLibre GL JS)
```

### Module Breakdown:
1. **`shared-contracts` (`packages/shared`):**
   - Core domain types, status enums (`Present`, `Late`, `Absent`, `Rejected`, `Flagged`), Zod DTO validation schemas, and shared API request/response contracts.
2. **`identity-access`:**
   - Database schema: `users`, `sessions`, `roles`, `audit_logs`.
   - Argon2id password hashing, session cookies (`httpOnly`, `Secure`, `SameSite=Lax`), lockout mechanism (5 failed attempts → 15-minute lockout).
   - Server-side multi-site scoping guards and policies.
   - UI: Login page (`AM 01 · Sign in — Web.png`).
3. **`locations-geofencing`:**
   - Database schema: `locations` with PostGIS `GEOGRAPHY(Point, 4326)` column, `radius_meters`, `location_assignments`.
   - PostGIS distance math (`ST_DWithin`, `ST_Distance`).
   - Locations CRUD endpoints, employee assignment logic.
   - UI: Locations admin list (`locations-admin-view.png`) and Add Location form (`add-location-page.png`).
4. **`attendance-core`:**
   - Database schema: `attendance_records` with spatial check-in points, timestamps, GPS accuracy, mock location flag, selfie storage key, liveness status, and status calculation.
   - Mobile check-in ingestion REST API (`POST /api/attendance/check-in`).
   - Shift & late cutoff engine (09:30 AM in `Asia/Kolkata` timezone).
   - Team attendance aggregation queries for today.
   - UI: Overview Dashboard & Team Today table (`AM 02 · Dashboard — Team today.png`).
5. **`exception-management`:**
   - Database schema: `exceptions`, `exception_reviews`, `delegated_permissions`.
   - Alerts queue API with filtering (`All open`, `Geofence`, `Liveness`, `Missing check-out`).
   - Evidence retrieval with temporary presigned S3 URLs (15-minute expiry).
   - Decision engine: Escalate to Supervisor, Delegated Approve/Reject actions with mandatory rejection notes.
   - UI: Alerts queue (`AM 06 · Exceptions — Queue.png`), Exception review page (`AM 07 · Exception review.png`) with MapLibre GL JS geofence map viewer.
6. **`workforce-directory`:**
   - Directory roster query engine with 5-filter criteria (Exceptions, Check-in Status, Location Mismatch, Status, Assigned Site).
   - Server-driven numbered pagination (10 per page, up to 200+ employees).
   - Employee 30-day KPI rollup service and read-only attendance history.
   - UI: Workforce Directory (`employee-directory.png`) and Workforce Detail (`AM 05 · Employee detail.png`).
7. **`reporting-exports`:**
   - Database schema: `report_jobs`.
   - Asynchronous worker queue (BullMQ + Valkey).
   - Fast row-count estimator (< 200 ms).
   - Streaming CSV generator and headless Playwright PDF generator.
   - Garage S3 artifact storage and presigned download links.
   - UI: Records download form and recent downloads list (`AM 11 · Reports.png`).
8. **`notifications`:**
   - Database schema: `notifications`.
   - In-app notification bell counter & drawer API.
   - Nodemailer transactional email delivery (Mailpit for dev, Brevo free tier for prod with 300/day rate-limiting).
   - DPDP 90-day retention cleanup scheduled worker.

---

## 2. Implementation Order (Vertical Slices)

To guarantee end-to-end functionality and avoid disjointed mocks, each module is implemented as a complete vertical slice (Database Schema & Migration → Backend Service & Tests → API Controller & Swagger → Shared Client → Frontend Screen & Tests) following strict dependency order:

```
Step 1: Workspace & Monorepo Infrastructure (Docker dev stack, pnpm workspaces, Caddy, Tailwind tokens)
   │
   ▼
Step 2: Shared Contracts & Schemas (`packages/shared`)
   │
   ▼
Step 3: Identity & Access (`identity-access` slice: DB + Auth API + AM 01 Login page)
   │
   ▼
Step 4: Locations & Geofencing (`locations-geofencing` slice: PostGIS + API + Locations UI)
   │
   ▼
Step 5: Attendance Core & Check-in (`attendance-core` slice: Ingestion + Late Cutoff + AM 02 Overview)
   │
   ▼
Step 6: Exceptions & Alerts (`exception-management` slice: Alerts Queue + AM 06 + AM 07 MapLibre Review)
   │
   ▼
Step 7: Workforce Directory (`workforce-directory` slice: Roster + Multi-filters + AM 05 Employee Detail)
   │
   ▼
Step 8: Reporting & Async Exports (`reporting-exports` slice: BullMQ + CSV/PDF + AM 11 Records)
   │
   ▼
Step 9: Notifications & DPDP Cleanup (`notifications` slice: Bell Drawer + Brevo SMTP + 90-day Purge Cron)
   │
   ▼
Step 10: Reference Data Seeding & End-to-End Verification (Exact Figma reproduction + Axe a11y tests)
```

---

## 3. Risks & Mitigation Strategies

| Risk | Impact | Mitigation Strategy |
|---|---|---|
| **PostGIS Distance Math Accuracy** | False positive/negative geofence violations if planar geometry vs spherical geography math is confused. | Enforce `GEOGRAPHY(Point, 4326)` in PostGIS and use `ST_DWithin` and `ST_Distance` exclusively in ellipsoidal meters. Verify with Testcontainers PostGIS tests with sub-meter tolerance. |
| **Brevo Free Tier Relay Cap (300/day)** | Email drops or blocking during peak exception surges. | Use BullMQ rate-limited queue for emails; fallback queueing in Valkey; in-app notification bell remains primary real-time notification mechanism. |
| **DPDP 90-Day Retention Compliance** | Legal liability if biometric selfie images are kept indefinitely. | Implement scheduled BullMQ cron job running daily at midnight to soft-delete expired records, purge binary blobs from Garage S3, and keep only cryptographic SHA-256 audit hashes in `audit_logs`. |
| **Session Cookie & CORS in Monorepo** | Auth cookie drop between Next.js frontend (port 3000) and NestJS API (port 4000) during local dev. | Use Next.js API rewrites / reverse proxy or Caddy in local dev so both web and API are served from the same origin (`localhost` / `triattendance.local`), with `SameSite=Lax` cookies. |
| **Map Tile Rate Limits / Privacy** | Violating OSM tile usage policies or leaking internal IP addresses. | MapLibre GL JS is configured to use OpenFreeMap tiles by default with a local self-hosted Protomaps PMTiles extract fallback. No requests hit `tile.openstreetmap.org`. |
| **Manager Mutation Vulnerability** | Accidental or malicious modification of employee attendance records. | Database permissions and API endpoints for managers have zero `UPDATE` or `DELETE` capabilities on `attendance_records`. Only append-only exception logs and supervisor escalation notes are writeable. |

---

## 4. Parallel vs. Sequential Workflows

### Strictly Sequential (Must complete before proceeding):
- **Step 1 → Step 2 → Step 3:** Infrastructure, shared contracts, and authentication are foundational. No domain screen can function without session context and user scoping.
- **Step 4 (Locations) → Step 5 (Attendance):** Attendance check-ins require assigned locations with PostGIS geofences.
- **Step 5 (Attendance) → Step 6 (Exceptions):** Exception alerts are generated from failed attendance check-ins.

### Opportunities for Parallel Execution (Within each vertical slice):
- In Step 6: MapLibre GL JS map component and Selfie image viewer can be developed in parallel with the supervisor escalation API service.
- In Step 7: Multi-filter table UI components and 30-day KPI calculation services can be built concurrently.
- In Step 8: Playwright PDF HTML templates and streaming CSV generators can be implemented concurrently against the shared report worker.

---

## 5. Verification Checkpoints Between Phases

Each vertical slice must pass automated verification gates before the next slice is started:

1. **Checkpoint 1 (Infrastructure & Auth):**
   - Docker dev stack starts cleanly (`postgres`, `valkey`, `garage`, `mailpit`).
   - Drizzle migrations apply successfully.
   - User seed login succeeds; failed login lockout triggers after 5 attempts.
   - `AM 01` Sign In page renders, accepts credentials, and redirects to `/`.
2. **Checkpoint 2 (Locations & PostGIS):**
   - PostGIS distance tests pass (`ST_DWithin` accurately classifies coordinates inside/outside boundary).
   - Locations list (`locations-admin-view.png`) and Add Location form (`add-location-page.png`) save and display locations.
3. **Checkpoint 3 (Attendance & Overview):**
   - Mobile check-in ingestion endpoint accurately categorizes check-in as `Present`, `Late` (> 09:30 AM IST), `Rejected` (outside boundary / mock GPS), or `Flagged` (failed liveness).
   - Overview Dashboard (`AM 02`) displays 4 KPI cards and Today's table with exact status pills.
4. **Checkpoint 4 (Exceptions & Map Review):**
   - Alerts Queue (`AM 06`) correctly filters by exception tabs.
   - Exception Review (`AM 07`) displays selfie evidence, MapLibre geofence circle, pin marker, and distance pill (`1.4 km outside CHN-1`).
   - Rejection note + "Escalate to Supervisor" or delegated "Approve/Reject" records audit entry.
5. **Checkpoint 5 (Workforce Directory & Detail):**
   - Workforce Directory (`employee-directory.png`) filters dynamically across all 5 criteria and paginates through 207 records.
   - Workforce Detail (`AM 05`) displays 4 30-day KPI cards and read-only attendance history.
6. **Checkpoint 6 (Reports & Exports):**
   - Records page (`AM 11`) computes estimated row count (< 200 ms).
   - Triggering download generates CSV and PDF files via BullMQ worker, downloadable via presigned URLs.
7. **Checkpoint 7 (Notifications, a11y & DPDP):**
   - Notification bell badge updates on exception creation.
   - DPDP 90-day retention cron purges test images older than 90 days.
   - Axe-core tests pass on all 9 routes with 0 critical/serious violations.
