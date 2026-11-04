# Tasks: TriAttendance Platform

## Group 1: Workspace & Monorepo Foundation

- [x] Task 1: Monorepo Workspace & Root Configuration
  - Acceptance: `pnpm-workspace.yaml`, root `package.json`, `tsconfig.base.json`, and `.gitignore` configured for monorepo with `apps/*` and `packages/*`.
  - Verify: `pnpm install` executes without errors.
  - Files: `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `.gitignore`

- [x] Task 2: Docker Infrastructure Configuration
  - Acceptance: `docker/docker-compose.dev.yml` defines PostgreSQL 16 with PostGIS 3.4, Valkey 8.0, Garage S3, Mailpit, and persistent volumes.
  - Verify: `docker compose -f docker/docker-compose.dev.yml config` validates cleanly without errors.
  - Files: `docker/docker-compose.dev.yml`, `docker/Caddyfile`, `docker/docker-compose.prod.yml`

---

## Group 2: Shared Contracts & Schemas (`packages/shared`)

- [x] Task 3: Domain Types & Status Enums
  - Acceptance: Shared TypeScript types and enums for attendance statuses (`Present`, `Late`, `Absent`, `Rejected`, `Flagged`), user roles (`ACCOUNT_MANAGER`, `SUPERVISOR`, `ADMIN`), exception types, and location entities.
  - Verify: `pnpm --filter @triattendance/shared build` compiles cleanly.
  - Files: `packages/shared/package.json`, `packages/shared/tsconfig.json`, `packages/shared/src/types/index.ts`, `packages/shared/src/index.ts`

- [x] Task 4: Zod Validation Schemas & API Contracts
  - Acceptance: Zod validation schemas for auth login, check-in ingestion, location creation, exception escalation note, and report generation requests.
  - Verify: Vitest test validates compliant and invalid payloads against Zod schemas.
  - Files: `packages/shared/src/schemas/auth.schema.ts`, `packages/shared/src/schemas/attendance.schema.ts`, `packages/shared/src/schemas/location.schema.ts`, `packages/shared/src/schemas/exception.schema.ts`, `packages/shared/src/contracts/api.contracts.ts`

---

## Group 3: Backend Database Schema & Drizzle Setup (`apps/api`)

- [x] Task 5: NestJS API Workspace & Database Client Setup
  - Acceptance: NestJS application scaffolded in `apps/api` with Drizzle ORM client connecting to PostgreSQL with PostGIS extension enabled.
  - Verify: `pnpm --filter @triattendance/api build` compiles without errors.
  - Files: `apps/api/package.json`, `apps/api/tsconfig.json`, `apps/api/src/main.ts`, `apps/api/src/app.module.ts`, `apps/api/src/database/drizzle.client.ts`

- [x] Task 6: Core Relational Database Schemas
  - Acceptance: Drizzle schema definitions for `users`, `sessions`, `roles`, `audit_logs`, and PostGIS-enabled `locations` with `GEOGRAPHY(Point, 4326)`.
  - Verify: Drizzle migration generation script executes and outputs valid SQL migrations.
  - Files: `apps/api/src/database/schema/users.ts`, `apps/api/src/database/schema/locations.ts`, `apps/api/src/database/schema/audit-logs.ts`, `apps/api/src/database/schema/index.ts`, `apps/api/drizzle.config.ts`

- [x] Task 7: Attendance & Exceptions Schemas
  - Acceptance: Drizzle schemas for `employees`, `attendance_records`, `exceptions`, `exception_reviews`, `report_jobs`, and `notifications`.
  - Verify: Drizzle migration generation generates valid SQL migration files with spatial columns and foreign keys.
  - Files: `apps/api/src/database/schema/employees.ts`, `apps/api/src/database/schema/attendance.ts`, `apps/api/src/database/schema/exceptions.ts`, `apps/api/src/database/schema/reports.ts`, `apps/api/src/database/schema/notifications.ts`

---

## Group 4: Identity & Access Module (`identity-access`)

- [x] Task 8: Argon2id Password & Session Service
  - Acceptance: In-house Argon2id password verification, session creation, validation, destruction, and 5-attempt brute-force lockout with 15-minute timer.
  - Verify: Vitest unit test verifies hash validation, lockout logic after 5 bad attempts, and session persistence.
  - Files: `apps/api/src/modules/auth/auth.service.ts`, `apps/api/src/modules/auth/auth.service.spec.ts`, `apps/api/src/modules/auth/auth.guard.ts`, `apps/api/src/modules/auth/auth.module.ts`

- [x] Task 9: Auth Controller & Scoping Interceptor
  - Acceptance: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` setting `httpOnly`, `Secure`, `SameSite=Lax` cookies; ScopingInterceptor injecting manager-assigned site IDs into query context.
  - Verify: Supertest integration test verifies cookie header emission and user profile response.
  - Files: `apps/api/src/modules/auth/auth.controller.ts`, `apps/api/src/common/scoping.interceptor.ts`, `apps/api/src/common/current-user.decorator.ts`

---

## Group 5: Locations & Geofencing Module (`locations-geofencing`)

- [x] Task 10: PostGIS Geofence Queries & Service
  - Acceptance: Service methods for creating locations with PostGIS points, querying locations with employee counts, and calculating spherical distances via `ST_Distance` and `ST_DWithin`.
  - Verify: Vitest test verifies PostGIS SQL query generators and distance calculations.
  - Files: `apps/api/src/modules/locations/locations.service.ts`, `apps/api/src/modules/locations/locations.service.spec.ts`, `apps/api/src/modules/locations/locations.module.ts`

- [x] Task 11: Locations Controller & Endpoints
  - Acceptance: Endpoints `GET /api/locations` (manager-scoped), `POST /api/locations` (add work location), `GET /api/locations/:id`, and `DELETE /api/locations/:id`.
  - Verify: Controller integration test confirms CRUD responses and server-side scoping enforcement.
  - Files: `apps/api/src/modules/locations/locations.controller.ts`, `apps/api/src/modules/locations/locations.module.ts`

---

## Group 6: Attendance Core & Check-in Ingestion (`attendance-core`)

- [x] Task 12: Check-in Evaluation & Late Cutoff Service
  - Acceptance: Ingestion service evaluating GPS coordinates, horizontal accuracy (±X m), mock location flag, selfie storage key, and liveness status; applies 09:30 AM IST cutoff rule to derive `Present`, `Late`, `Rejected`, or `Flagged`.
  - Verify: Vitest unit test verifies check-in status derivation: outside geofence = `Rejected`, arrival after 09:30 = `Late`, mock GPS = `Rejected`, failed liveness = `Flagged`.
  - Files: `apps/api/src/modules/attendance/attendance.service.ts`, `apps/api/src/modules/attendance/attendance.service.spec.ts`, `apps/api/src/modules/attendance/attendance.module.ts`

- [x] Task 13: Attendance Dashboard Aggregation & Read-Only Endpoints
  - Acceptance: Endpoints `POST /api/attendance/check-in` (ingestion), `GET /api/attendance/today` (dashboard summary: Present, Late, Absent, Needs Review cards + team table), strictly ensuring managers cannot mutate records.
  - Verify: Controller test confirms read-only constraints and KPI count responses.
  - Files: `apps/api/src/modules/attendance/attendance.controller.ts`, `apps/api/src/modules/attendance/dto/check-in.dto.ts`

---

## Group 7: Exceptions & Alerts Module (`exception-management`)

- [x] Task 14: Exceptions Queue & Escalation Service
  - Acceptance: Service querying exceptions queue filtered by tabs (`All open`, `Geofence`, `Liveness`, `Missing check-out`); escalation workflow capturing manager note, supervisor assignment, or delegated accept/reject decision with immutable audit logging.
  - Verify: Vitest unit test tests filtering logic, note requirement for rejection, and audit log generation.
  - Files: `apps/api/src/modules/exceptions/exceptions.service.ts`, `apps/api/src/modules/exceptions/exceptions.module.ts`

- [x] Task 15: Exceptions Controller & Presigned Evidence Endpoints
  - Acceptance: Endpoints `GET /api/exceptions`, `GET /api/exceptions/:id` (returns GPS coords, assigned site boundary, distance outside boundary, and 15-minute presigned selfie URL), `POST /api/exceptions/:id/escalate`, `POST /api/exceptions/:id/resolve`.
  - Verify: Integration test verifies exception detail response and presigned URL format.
  - Files: `apps/api/src/modules/exceptions/exceptions.controller.ts`, `apps/api/src/storage/storage-adapter.interface.ts`, `apps/api/src/storage/local-garage-storage.service.ts`

---

## Group 8: Workforce Directory Module (`workforce-directory`)

- [x] Task 16: Workforce Directory Roster & 30-Day Rollups Service
  - Acceptance: Roster search and 5-criteria filtering (Exceptions, Check-in Status, Location Mismatch, Status, Assigned Site) with numbered pagination; 30-day employee KPI calculation (attendance rate, late arrivals, exceptions, avg hours/day) and read-only history.
  - Verify: Vitest unit test verifies multi-filter combinations, pagination limits, and 30-day KPI rollup math.
  - Files: `apps/api/src/modules/workforce/workforce.service.ts`, `apps/api/src/modules/workforce/workforce.module.ts`

- [x] Task 17: Workforce Controller & Endpoints
  - Acceptance: Endpoints `GET /api/workforce` (paginated roster with 200+ employees scoped by manager), `GET /api/workforce/:id` (employee profile, 30-day KPIs, read-only attendance history).
  - Verify: Integration test verifies paginated response metadata (`total`, `page`, `limit`) and employee profile payload.
  - Files: `apps/api/src/modules/workforce/workforce.controller.ts`

---

## Group 9: Reporting & Async Exports (`reporting-exports`)

- [x] Task 18: BullMQ Queue & Fast Row-Count Estimator
  - Acceptance: Service calculating estimated row count (< 200 ms) across selected date range, locations, and statuses; BullMQ worker infrastructure backed by Valkey.
  - Verify: Unit test verifies row estimation performance and job dispatching.
  - Files: `apps/api/src/modules/reports/reports.service.ts`, `apps/api/src/modules/reports/reports.module.ts`

- [x] Task 19: Streaming CSV & Playwright Headless PDF Generators
  - Acceptance: CSV stream builder writing formatted records; Playwright headless Chromium service compiling HTML report template into PDF; artifact storage to Garage S3 and "Recent downloads" database tracking.
  - Verify: Integration test generates valid CSV stream and PDF buffer, confirming file existence in storage.
  - Files: `apps/api/src/modules/reports/reports.controller.ts`

---

## Group 10: Notifications & DPDP 90-Day Privacy Engine (`notifications`)

- [x] Task 20: Notification Bell & Nodemailer SMTP Service
  - Acceptance: In-app notification creation, unread count, and list endpoints; Nodemailer SMTP sender (Mailpit for dev, Brevo free tier relay in prod with 300/day rate-limiting).
  - Verify: Unit test verifies email dispatch to Mailpit and in-app notification insertion.
  - Files: `apps/api/src/modules/notifications/notifications.service.ts`, `apps/api/src/modules/notifications/notifications.controller.ts`, `apps/api/src/modules/notifications/notifications.module.ts`

- [x] Task 21: DPDP 90-Day Biometric Purge Scheduled Job
  - Acceptance: Scheduled BullMQ cron job running daily at midnight: queries attendance records older than 90 days, deletes raw selfie binaries from Garage S3, nullifies raw coordinates, and preserves cryptographic SHA-256 audit hashes in `audit_logs`.
  - Verify: Vitest unit test confirms records > 90 days have storage binaries purged and audit entries preserved.
  - Files: `apps/api/src/modules/notifications/notifications.service.ts`

---

## Group 11: Frontend Web Setup & UI Design System (`apps/web`)

- [x] Task 22: Next.js 15 Web Setup & Design Tokens
  - Acceptance: Next.js 15 App Router application with Tailwind CSS, shadcn/ui components, Lucide icons, and exact purple/indigo palette matching Figma reference designs.
  - Verify: `pnpm --filter @triattendance/web build` compiles cleanly.
  - Files: `apps/web/package.json`, `apps/web/tsconfig.json`, `apps/web/tailwind.config.ts`, `apps/web/src/app/globals.css`, `apps/web/src/components/ui/button.tsx`

- [x] Task 23: Global Layout, Sidebar & Header Navigation
  - Acceptance: Dashboard layout featuring Sidebar (Attendance logo, "Overview", "Workforce", "Locations", "Records", user footer pill "JJ / Joseph J / Account Manager") and Header (employee search, date dropdown "Today · 25 Aug", "Download Report" button, Notification Bell).
  - Verify: Component test verifies active navigation state, user profile pill, and header elements.
  - Files: `apps/web/src/app/(dashboard)/layout.tsx`, `apps/web/src/components/layout/sidebar.tsx`, `apps/web/src/components/layout/header.tsx`, `apps/web/src/components/layout/notification-drawer.tsx`

---

## Group 12: Web Authentication & Dashboard Screens

- [x] Task 24: Sign In Page (`AM 01 · Sign in — Web.png`)
  - Acceptance: Left purple branding banner ("Attendance & Compliance", 3 bullets); right card ("Welcome back", work email, password, "Sign In" button, "Forgot password?", HR admin disclaimer); handles auth submit and redirect.
  - Verify: Playwright test logs in with seeded credentials and redirects to `/`.
  - Files: `apps/web/src/app/login/page.tsx`

- [x] Task 25: Overview Dashboard & Today's Table (`AM 02 · Dashboard — Team today.png`)
  - Acceptance: Filters row (Site, Team, Date); 4 colored KPI cards (Present today 202/250, Late 2, Absent 5, Needs review 3); Today's table with direct reports, status pills (`Present`, `Rejected` for Outside boundary, `Late`, `Absent`), and Previous/Next buttons.
  - Verify: Playwright test validates 4 KPI values and row status styling matching Figma.
  - Files: `apps/web/src/app/(dashboard)/overview/page.tsx`, `apps/web/src/components/dashboard/kpi-cards.tsx`, `apps/web/src/components/dashboard/today-table.tsx`

---

## Group 13: Web Locations Management Screens

- [x] Task 26: Manage Work Locations Table (`locations-admin-view.png`)
  - Acceptance: "Manage Work Locations" table with columns (Location, City, Allowed area, People, Present today, Status `Active`/`Disabled`, Actions: Edit pen & Delete trash) and "+ Add Location" button.
  - Verify: Component test confirms table columns, badges, and navigation to `/locations/new`.
  - Files: `apps/web/src/app/(dashboard)/locations/page.tsx`

- [x] Task 27: Add New Work Location Form (`add-location-page.png`)
  - Acceptance: Breadcrumb navigation; "1. Location Details" (Location Name, City, Full Address, Allowed Area, Lat, Lng); "2. Assign Employees" (Search input, selected employee chips with 'x', sub-table with checkboxes); Cancel & Save Location actions.
  - Verify: Form test validates Zod schema, interactive chip removal, and submission.
  - Files: `apps/web/src/app/(dashboard)/locations/new/page.tsx`, `apps/web/src/components/locations/employee-picker-table.tsx`

---

## Group 14: Web Alerts & Exception Review Screens

- [x] Task 28: Alerts Queue Page (`AM 06 · Exceptions — Queue.png`)
  - Acceptance: Page title "Alerts", 4 filter pills ("All open", "Geofence", "Liveness", "Missing check-out"), "Export" button; Exceptions table with employee avatar initials, Date, Check-in, Check-out, Site, and Status badges (`Rejected`, `Flagged`, `Pending`).
  - Verify: Component test confirms tab switching filters exceptions list.
  - Files: `apps/web/src/app/(dashboard)/alerts/page.tsx`, `apps/web/src/components/alerts/alerts-table.tsx`, `apps/web/src/components/alerts/alerts-tabs.tsx`

- [x] Task 29: Exception Review & MapLibre Viewer (`AM 07 · Exception review.png`)
  - Acceptance: "← Back to details"; Employee header; Captured evidence (Selfie preview with timestamp, MapLibre GL JS map with red dotted geofence circle, pin marker, and "1.4 km outside CHN-1" pill); Record details; "Your decision" panel with note field, "Escalate to Supervisor" and delegated Approve/Reject buttons.
  - Verify: Playwright visual test validates MapLibre circle rendering, selfie image display, and note escalation submission.
  - Files: `apps/web/src/app/(dashboard)/alerts/[id]/page.tsx`, `apps/web/src/components/map/geofence-map.tsx`, `apps/web/src/components/alerts/decision-panel.tsx`

---

## Group 15: Web Workforce Directory Screens

- [x] Task 30: Workforce Directory Roster (`employee-directory.png`)
  - Acceptance: Filter bar (Search input, 5 dropdowns: Exceptions, Check-in Status, Location Mismatch, Status, Assigned Site, "Clear Filters"); employee table (Employee, Employee ID, Reporting Manager, Assigned Site, Check-in, Check-out, Status); numbered pagination (1–10 of 207); bottom HR note.
  - Verify: E2E test verifies search filter combination and pagination navigation.
  - Files: `apps/web/src/app/(dashboard)/workforce/page.tsx`, `apps/web/src/components/workforce/workforce-table.tsx`, `apps/web/src/components/workforce/workforce-filters.tsx`

- [x] Task 31: Workforce Detail Page (`AM 05 · Employee detail.png`)
  - Acceptance: "← Back to workforce"; Employee header; 4 30-day KPI cards; Read-only attendance history ("Read-only — Managers cannot edit records", 5 of 22 records) with sortable Date column.
  - Verify: Component test verifies KPI metric rendering and confirms table is strictly non-editable.
  - Files: `apps/web/src/app/(dashboard)/workforce/[id]/page.tsx`, `apps/web/src/components/workforce/employee-kpis.tsx`, `apps/web/src/components/workforce/attendance-history-table.tsx`

---

## Group 16: Web Records & Reports Screen

- [x] Task 32: Records Download & Recent Downloads (`AM 11 · Reports.png`)
  - Acceptance: "Download an attendance record" form (Date range, Location, Employees, Status); dynamic estimated row count ("Estimated 1,340 rows across 2 locations"); "Download record" button; "Recent downloads" card with past CSV/PDF reports and "View" action.
  - Verify: Integration test submits report download request and observes job appear in Recent Downloads.
  - Files: `apps/web/src/app/(dashboard)/records/page.tsx`, `apps/web/src/components/records/download-record-form.tsx`, `apps/web/src/components/records/recent-downloads-list.tsx`

---

## Group 17: Reference Data Seeding, CI & Accessibility Verification

- [x] Task 33: Realistic Reference Data Seeder
  - Acceptance: Database seeder reproducing all reference employees (`Ravi Kumar`, `Priya S`, `Arun Das`, `Nithya R`, `Vikram T`), locations (`BLR-1`, `BLR-2`, `BLR-3`, `CHN-1`, `CHN-2`, `CHN-3`), exceptions, and historical records.
  - Verify: `pnpm --filter @triattendance/api db:seed` executes and populates database with expected rows.
  - Files: `apps/api/src/database/seed.ts`, `apps/api/src/database/seeds/users.seed.ts`, `apps/api/src/database/seeds/locations.seed.ts`, `apps/api/src/database/seeds/attendance.seed.ts`

- [x] Task 34: Accessibility Audits & CI Automation
  - Acceptance: GitHub Actions workflow (`.github/workflows/ci.yml`) running lint, typecheck, unit tests, and Playwright `@axe-core/playwright` accessibility audits across all 9 web portal routes reporting 0 critical/serious violations.
  - Verify: `pnpm test` and `pnpm --filter @triattendance/web test:a11y` pass with 0 errors.
  - Files: `.github/workflows/ci.yml`, `apps/web/test/a11y.spec.ts`
