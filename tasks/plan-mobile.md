# Implementation Plan: Digital Attendance (Mobile App & Shared Bridge)

## 1. Major Components & Dependency Architecture

The mobile app and bridge integrate directly into the existing monorepo without duplicating the backend:

```
[packages/shared (Types, Zod Schemas, OpenAPI Specs)]
                         │
                         ▼
[apps/api (NestJS, Drizzle ORM, PostGIS, S3 Storage, Auth/Device Modules)]
                         │
        ┌────────────────┴────────────────┐
        ▼                                 ▼
[apps/web (Next.js 15 Web Portal)]    [apps/mobile (React Native Expo Mobile App)]
```

### Module Breakdown:
1. **`shared-bridge-contracts` (`packages/shared`):**
   - Extend Zod schemas and TypeScript types: Mobile login request/response, Activation request with HR voucher, Device binding payload, Check-in/Check-out multipart contracts, Shift status enum (`Check-in Pending`, `Checked IN`, `Checked Out`, `Pending Review`), Exception escalation payload with supervisor note.
2. **`mobile-bridge-backend` (`apps/api`):**
   - Drizzle database migration: `device_registry` table, activation voucher code support in `employees` table, and 90-day retention cleanup scheduled task for selfies.
   - Mobile Auth Module: `POST /api/v1/auth/mobile/login` (JWT access token + rotating refresh token), `POST /api/v1/auth/mobile/activate` (HR physical voucher / SMTP fallback), `POST /api/v1/auth/mobile/verify-activation`, `POST /api/v1/auth/mobile/refresh`.
   - Mobile Shift & Sites Module: `GET /api/v1/mobile/sites/assigned`, `GET /api/v1/mobile/shift/today`.
   - Mobile Attendance Ingestion: `POST /api/v1/mobile/attendance/check-in` & `check-out` (with PostGIS 800m geofence evaluation, late cutoff, mock GPS detection, S3 selfie upload, idempotency key checking).
   - Mobile Exception Bridge: `POST /api/v1/mobile/exceptions/escalate` (employee note dispatched to supervisor), `GET /api/v1/mobile/exceptions/my-status`.
3. **`apps/mobile` (Expo / React Native Client):**
   - Workspace setup: Expo SDK 52+, TypeScript strict, Expo Router navigation, TanStack Query, React Hook Form + Zod.
   - Design System & Theme: Option A (Light) & Option B (Navy) amber theme tokens, typography, custom icons, accessible touch targets (48x48 min).
   - Storage & Networking: `expo-secure-store` for session tokens & device ID, `expo-sqlite` for offline attendance queue.
   - Permissions Module: Foreground Location (`expo-location`) and Camera (`react-native-vision-camera`) permission orchestration with privacy disclosure dialog.
   - Camera & Biometrics Engine: Custom camera frame processor with `@react-native-ml-kit/face-detection` for on-device blink detection (eye open probability tracking) and automatic selfie capture.
   - Shift & Home Flow: Real-time status state machine, check-in button, running hours timer, check-out confirmation dialog.
   - Exception & Error Handling: Geofence mismatch warning ("1.4 km outside"), distance meter, supervisor escalation note composer, retry dialogs, offline context banner.
   - Employee Profile & Menu: Profile view with employee ID, assigned site, app version info.

---

## 2. Implementation Order (Vertical Slices)

Backend and shared bridge slices strictly precede the mobile screens that consume them:

```
Step 1: Shared Contracts & DTOs (packages/shared)
   │
   ▼
Step 2: Backend Mobile Bridge (apps/api: DB migrations, device registry, mobile auth, check-in endpoints)
   │
   ▼
Step 3: Mobile Workspace Setup & Design Tokens (apps/mobile: Expo configuration, native prebuild, theme tokens)
   │
   ▼
Step 4: Mobile Authentication & Activation Screens (E1, E3, E5, E41)
   │
   ▼
Step 5: OS Permissions & Shell Navigation (E7, E34, drawer menu)
   │
   ▼
Step 6: Biometrics & Liveness Engine (E10, E11, E16, E17, E25, VisionCamera + ML Kit)
   │
   ▼
Step 7: Check-In Flow & Location Validation (E8, E9, E12, E13)
   │
   ▼
Step 8: Check-Out Flow & Total Hours (E14, E15, E18, E19)
   │
   ▼
Step 9: Exceptions, Escalation & Offline Queue (E20, E21, E22, E23, E27, E36, E37, E40)
   │
   ▼
Step 10: Cross-App Integration Verification (Mobile check-in -> Web Dashboard & Exception review -> Manager decision)
```

---

## 3. Risks & Mitigations

| Risk | Impact | Mitigation Strategy |
|---|---|---|
| ML Kit / VisionCamera frame processor compatibility with Expo | Native build failure or crash during blink detection | Pin verified compatible versions (`react-native-vision-camera` v4.x + `@react-native-ml-kit/face-detection`), configure Android Gradle NDK settings, provide unit tests and a mock mode for simulator testing. |
| GPS Mocking / Spoofing | False attendance records | Check `isMockLocation` flag from `expo-location`, verify GPS accuracy $\le 50\text{m}$, validate PostGIS geofence server-side, retain selfie evidence for supervisor inspection. |
| Offline check-in tampering / delayed clock | Fraudulent check-in times | Server timestamp is the sole authority; offline submissions recorded in `expo-sqlite` carry client capture time + submission time; server flags records where delta exceeds threshold. |
| Breaking changes to existing web API | Web portal regressions | Add dedicated `/api/v1/mobile/*` sub-routes; leave web `/api/v1/attendance/*` intact; share core database tables (`attendance`, `employees`, `exceptions`) without altering web schema semantics. |
| Free tier constraints violated | Incurring service costs | Use local Gradle builds, self-hosted Garage S3, local Nodemailer SMTP, and HR physical activation vouchers. |

---

## 4. Parallel vs. Sequential Slices

- **Strictly Sequential**:
  - `packages/shared` contract updates $\to$ `apps/api` mobile bridge endpoints.
  - `apps/api` endpoints $\to$ `apps/mobile` API client integration.
  - Camera & ML Kit Frame Processor $\to$ Check-in/out biometrics flow.
- **Can Run in Parallel**:
  - Mobile UI static screens (Profile, Permissions, Offline banner) while Camera/ML Kit engine is calibrated.
  - End-to-end Maestro test authoring while offline SQLite sync worker is hardened.

---

## 5. Verification Checkpoints

1. **Checkpoint A (Contract & Backend Bridge)**:
   - Run `pnpm --filter @triattendance/shared build` and `pnpm --filter @triattendance/api test`.
   - Verify `device_registry` migration and authenticate via `POST /api/v1/auth/mobile/login` with JWT generation.
2. **Checkpoint B (Mobile Shell & Biometrics)**:
   - Run `pnpm --filter @triattendance/mobile start`.
   - Verify permissions flow (`E7`) requests foreground only.
   - Verify frame processor triggers blink detection state transition within 5s.
3. **Checkpoint C (Check-in / Check-out Core Flow)**:
   - Mobile check-in submission succeeds within 800m radius of BLR-1.
   - Verify selfie uploaded to Garage S3 and attendance record visible in PostgreSQL.
4. **Checkpoint D (Exception Bridge & Web Portal Synergy)**:
   - Submit check-in at 1.4 km distance; verify `E20` outside work area error displays.
   - Submit escalation note ("Working from client site"); verify exception record appears in web portal queue (`AM 06`) with matching MapLibre visualization and selfie.
   - Resolve exception in web portal; verify mobile app updates status to `Checked IN`.

