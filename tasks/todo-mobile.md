# Tasks: Digital Attendance Mobile App & Shared Bridge

## Overview
Every task has an explicit **Acceptance criteria**, a **Verify command/action**, and touches **no more than ~5 files**. Tasks are ordered strictly by dependency.

---

### Step 1: Shared Contracts & Types (`packages/shared`)

- [x] Task 1.1: Shared Mobile Enums & Device Types
  - Acceptance: Define `MobileShiftStatus` (`'Check-in Pending'`, `'Checked IN'`, `'Checked Out'`, `'Pending Review'`), `DevicePlatform` (`'ANDROID'`, `'IOS'`), and `DeviceRegistration` interface in shared types.
  - Verify: `pnpm --filter @triattendance/shared build` succeeds with zero type errors.
  - Files:
    - `packages/shared/src/types/index.ts`
    - `packages/shared/src/index.ts`

- [x] Task 1.2: Shared Mobile Auth & Activation Schemas
  - Acceptance: Zod schemas for mobile login (`employeeId`, `password`, `deviceId`), activation verification with HR voucher (`employeeId`, `mobileLast5`, `voucherCode`, `newPassword`), and token refresh.
  - Verify: Unit test in `packages/shared` validating schema parsing with valid and invalid payloads.
  - Files:
    - `packages/shared/src/schemas/mobile-auth.schema.ts`
    - `packages/shared/src/schemas/index.ts`
    - `packages/shared/tests/mobile-auth.schema.spec.ts`

- [x] Task 1.3: Shared Mobile Attendance & Exception Schemas
  - Acceptance: Zod schemas for check-in/out submission (`siteId`, `latitude`, `longitude`, `accuracyMeters`, `isMockLocation`, `idempotencyKey`, `livenessPassed`, `blinkDetected`), supervisor escalation note payload, and API response contracts.
  - Verify: Unit test validating boundary conditions (e.g. invalid UUIDs, negative accuracy, out-of-range coordinates).
  - Files:
    - `packages/shared/src/schemas/mobile-attendance.schema.ts`
    - `packages/shared/src/contracts/mobile.contracts.ts`
    - `packages/shared/src/schemas/index.ts`
    - `packages/shared/tests/mobile-attendance.schema.spec.ts`

---

### Step 2: Backend Bridge Implementation (`apps/api`)

- [x] Task 2.1: Database Migration for Mobile Device Registry & Voucher
  - Acceptance: Drizzle schema defining `device_registry` table (UUID, employeeId FK, deviceId, model, osVersion, appVersion, fcmToken, isActive, lastActiveAt) and nullable `activation_voucher_hash` column on `employees` table. Default site geofence radius set to 800m.
  - Verify: `pnpm --filter @triattendance/api db:generate` produces migration and `pnpm --filter @triattendance/api test:db` runs without schema conflict.
  - Files:
    - `apps/api/src/database/schema/device-registry.ts`
    - `apps/api/src/database/schema/employees.ts`
    - `apps/api/src/database/schema/locations.ts`
    - `apps/api/src/database/schema/index.ts`

- [x] Task 2.2: Mobile Authentication Service & Endpoints
  - Acceptance: Controller & service for `POST /api/v1/auth/mobile/login`, `POST /api/v1/auth/mobile/activate`, `POST /api/v1/auth/mobile/verify-activation`, and `POST /api/v1/auth/mobile/refresh`. Issues 15-min JWT access token and rotating refresh token tied to device record.
  - Verify: E2E supertest checking valid credentials return tokens and invalid/unrecognized employee ID returns 401.
  - Files:
    - `apps/api/src/modules/auth/mobile-auth.controller.ts`
    - `apps/api/src/modules/auth/mobile-auth.service.ts`
    - `apps/api/src/modules/auth/mobile-token.service.ts`
    - `apps/api/src/modules/auth/auth.module.ts`
    - `apps/api/src/modules/auth/mobile-token.service.spec.ts`

- [ ] Task 2.3: Mobile Shift Status & Assigned Sites Service
- [x] Task 2.3: Mobile Shift Status & Assigned Sites Service
  - Acceptance: `GET /api/v1/mobile/sites/assigned` (returns assigned work site with coordinates, default 800m radius, shift times) and `GET /api/v1/mobile/shift/today` (returns current employee shift status, check-in/out timestamps, total hours computed on server).
  - Verify: Controller test asserting correct timezone conversion (Asia/Kolkata) and shift status derivation.
  - Files:
    - `apps/api/src/modules/attendance/mobile-shift.controller.ts`
    - `apps/api/src/modules/attendance/mobile-shift.service.ts`
    - `apps/api/src/modules/attendance/attendance.module.ts`
    - `apps/api/test/mobile-shift.spec.ts`
    - `apps/api/src/modules/attendance/mobile-shift.service.spec.ts`

- [ ] Task 2.4: Mobile Check-In / Check-Out Ingestion & PostGIS Geofence Evaluation
- [x] Task 2.4: Mobile Check-In / Check-Out Ingestion & PostGIS Geofence Evaluation
  - Acceptance: `POST /api/v1/mobile/attendance/check-in` & `check-out`. Evaluates `ST_DWithin` against site 800m boundary, computes exact distance delta (`ST_Distance`), uploads selfie to Garage S3, flags mock location or low accuracy, and handles idempotency key.
  - Verify: Integration test checking a submission at 1.4 km distance creates an Exception and returns 422 with `distanceMeters: 1400`.
  - Files:
    - `apps/api/src/modules/attendance/mobile-attendance.controller.ts`
    - `apps/api/src/modules/attendance/mobile-attendance.service.ts`
    - `apps/api/src/modules/attendance/attendance.service.ts`
    - `apps/api/test/mobile-checkin.e2e-spec.ts`
    - `apps/api/src/modules/attendance/mobile-attendance.service.spec.ts`

- [ ] Task 2.5: Mobile Exception Escalation Endpoint & 90-Day DPDP Purge
  - Acceptance: `POST /api/v1/mobile/exceptions/escalate` allowing employee to attach note ("Working from client site") to rejected attendance, updating exception to `Escalated`. Scheduled BullMQ job purging selfies older than 90 days.
  - Verify: Unit test verifying employee note attachment and cron deletion query.
  - Files:
    - `apps/api/src/modules/exceptions/mobile-exceptions.controller.ts`
    - `apps/api/src/modules/exceptions/exceptions.service.ts`
    - `apps/api/src/modules/storage/retention-cleanup.cron.ts`
    - `apps/api/src/modules/exceptions/exceptions.module.ts`

---

### Step 3: Mobile App Workspace & Design Foundation (`apps/mobile`)

- [ ] Task 3.1: Expo App Configuration & Workspace Integration
  - Acceptance: Initialize `apps/mobile` in pnpm workspaces with Expo SDK 52, Expo Router v4, TypeScript strict, and Gradle local build configuration (`expo prebuild`).
  - Verify: `pnpm --filter @triattendance/mobile build` or `pnpm --filter @triattendance/mobile typecheck` runs without errors.
  - Files:
    - `apps/mobile/package.json`
    - `apps/mobile/app.json`
    - `apps/mobile/tsconfig.json`
    - `pnpm-workspace.yaml`

- [ ] Task 3.2: Mobile Design System Tokens & Base Primitives
  - Acceptance: Navy (`#0B192C`/`#1E293B`) and Amber (`#F59E0B`/`#EAA326`) palette, typography, button primitives with minimum 48x48 touch targets, card container, status badges, and contrast compliance.
  - Verify: Jest component tests rendering `AmberButton` and `ShiftBadge` checking styles and accessible labels.
  - Files:
    - `apps/mobile/src/theme/colors.ts`
    - `apps/mobile/src/theme/typography.ts`
    - `apps/mobile/src/components/ui/AmberButton.tsx`
    - `apps/mobile/src/components/ui/ShiftStatusBadge.tsx`
    - `apps/mobile/src/components/ui/Card.tsx`

- [ ] Task 3.3: Storage, SecureStore & API Client Setup
  - Acceptance: Configure `expo-secure-store` for access/refresh tokens and device UUID; set up TanStack Query client and Axios/Fetch client with automatic token refreshing.
  - Verify: Unit test verifying SecureStore wrapper saves, retrieves, and clears tokens.
  - Files:
    - `apps/mobile/src/services/secure-store.ts`
    - `apps/mobile/src/services/api-client.ts`
    - `apps/mobile/src/services/device-id.ts`
    - `apps/mobile/src/services/__tests__/secure-store.spec.ts`

---

### Step 4: Authentication & Onboarding Screens (`E1`, `E3`, `E5`, `E41`)

- [ ] Task 4.1: Sign In Screen (`E1`)
  - Acceptance: Sign In form with Employee ID input (sanitizing `#EMP-2062` to canonical `EMP-2062`), Password input, Forgot Password link, New User button, and app version label (v1.0.2).
  - Verify: React Native Testing Library test validating form submission, error messaging, and navigation triggers.
  - Files:
    - `apps/mobile/src/app/(auth)/sign-in.tsx`
    - `apps/mobile/src/components/auth/EmployeeIdInput.tsx`
    - `apps/mobile/src/hooks/useMobileAuth.ts`
    - `apps/mobile/src/app/(auth)/__tests__/sign-in.test.tsx`

- [ ] Task 4.2: Account Activation with Voucher (`E3`)
  - Acceptance: Screen displaying "HR has registered you", Employee ID pre-filled or entered, registered mobile last 5 digits (`+91 ••••• 42062`), Voucher Code input, and "Send activation code" / "Verify & Set Password" flows.
  - Verify: Component test verifying voucher validation and password confirmation modal (`E41`).
  - Files:
    - `apps/mobile/src/app/(auth)/activate.tsx`
    - `apps/mobile/src/app/(auth)/reset-password-confirm.tsx`
    - `apps/mobile/src/components/auth/VoucherInput.tsx`
    - `apps/mobile/src/app/(auth)/__tests__/activate.test.tsx`

- [ ] Task 4.3: Forgot Password Screen (`E5`)
  - Acceptance: Forgot password view with Employee ID input, HR notification explanation ("HR will email you a reset link"), Submit button, and Back to Sign In button.
  - Verify: Component test verifying API call dispatch and success feedback.
  - Files:
    - `apps/mobile/src/app/(auth)/forgot-password.tsx`
    - `apps/mobile/src/app/(auth)/__tests__/forgot-password.test.tsx`

---

### Step 5: OS Permissions Flow & App Shell (`E7`, `E34`, `menu`)

- [ ] Task 5.1: Permissions Request Screen (`E7`)
  - Acceptance: Foreground Location and Camera permission request cards. Explicit privacy promise statement: "Location is never tracked between check-ins". Handles permission grant and denial states. Zero background location permission requested.
  - Verify: Component test mocking Expo permission modules and asserting no background location request is made.
  - Files:
    - `apps/mobile/src/app/permissions.tsx`
    - `apps/mobile/src/hooks/useAppPermissions.ts`
    - `apps/mobile/src/components/permissions/PermissionCard.tsx`
    - `apps/mobile/src/app/__tests__/permissions.test.tsx`

- [ ] Task 5.2: Employee Profile & Navigation Drawer (`E34`, `menu`)
  - Acceptance: Drawer / Profile screen showing employee name ("Alex Patel"), Employee ID (`#EMP-2062`), assigned work site (`BLR-1`), app version, and Sign Out action.
  - Verify: Test verifying sign out clears tokens from SecureStore and resets query cache.
  - Files:
    - `apps/mobile/src/app/(tabs)/profile.tsx`
    - `apps/mobile/src/components/navigation/DrawerMenu.tsx`
    - `apps/mobile/src/app/(tabs)/__tests__/profile.test.tsx`

---

### Step 6: Biometrics & Liveness Engine (`E10`, `E11`, `E16`, `E17`, `E25`)

- [ ] Task 6.1: VisionCamera & Guide Overlay Component (`E10`, `E16`)
  - Acceptance: Front camera preview with SVG oval face guide and inner alignment circle. Instructional banner: "Please look at the camera and capture your selfie - Ensure clear lighting and face is visible".
  - Verify: Component snapshot test verifying alignment guide rendering and camera trigger props.
  - Files:
    - `apps/mobile/src/components/camera/CameraPreview.tsx`
    - `apps/mobile/src/components/camera/FaceGuideOverlay.tsx`
    - `apps/mobile/src/components/camera/__tests__/FaceGuideOverlay.test.tsx`

- [ ] Task 6.2: ML Kit Frame Processor & On-Device Blink Detection (`E11`, `E17`, `E25`)
  - Acceptance: Offline frame processor utilizing `@react-native-ml-kit/face-detection`. Detects eye open probability drop below 0.2 and recovery above 0.75 within 5 seconds. Displays "Blink Detected!" checkmark and automatically takes photo. Includes retry view (`E25`).
  - Verify: Unit test for blink detection state machine with simulated probability streams (open -> closed -> open).
  - Files:
    - `apps/mobile/src/hooks/useBlinkDetection.ts`
    - `apps/mobile/src/services/liveness-state-machine.ts`
    - `apps/mobile/src/components/camera/LivenessFeedback.tsx`
    - `apps/mobile/src/components/camera/BiometricRetryModal.tsx`
    - `apps/mobile/src/hooks/__tests__/useBlinkDetection.test.ts`

---

### Step 7: Check-In Flow & Location Pre-Check (`E8`, `E9`, `E12`, `E13`)

- [ ] Task 7.1: Pre-Checkin Dashboard & Radar Animation (`E8`, `HD`)
  - Acceptance: Dashboard showing "Hello, Alex", ID `#EMP-2062`, `Check-in Pending` badge, `--:--` times, `0h 0m`, and large pulsating "CHECK IN - Tap to verify" button.
  - Verify: Test confirming button navigates to location check screen when status is `Check-in Pending`.
  - Files:
    - `apps/mobile/src/app/(tabs)/index.tsx`
    - `apps/mobile/src/components/dashboard/ShiftHeader.tsx`
    - `apps/mobile/src/components/dashboard/RadarCheckinButton.tsx`
    - `apps/mobile/src/app/(tabs)/__tests__/index.test.tsx`

- [ ] Task 7.2: Location Check Screen (`E9`)
  - Acceptance: Radar pulsing visual with "Validating Location... Verifying your current coordinates with the registered site boundary" and assigned site card (BLR-1, Bengaluru). Evaluates GPS accuracy and mock flag. Transitions to biometric check if valid.
  - Verify: Test asserting mock location or high GPS inaccuracy halts flow with appropriate notice.
  - Files:
    - `apps/mobile/src/app/checkin/location-check.tsx`
    - `apps/mobile/src/components/location/SiteLocationCard.tsx`
    - `apps/mobile/src/hooks/useCurrentLocation.ts`
    - `apps/mobile/src/app/checkin/__tests__/location-check.test.tsx`

- [ ] Task 7.3: Check-In API Submission & Success View (`E12`, `E13`)
  - Acceptance: Multipart submission to `POST /api/v1/mobile/attendance/check-in` with UUIDv4 idempotency key. Success screen showing checkmark, 24 Aug 2026, time, site (BLR-1), coordinates, and "Go to Home". Dashboard transitions to `Checked IN` with running total hours.
  - Verify: Test verifying success screen displays exact server-returned timestamp and coordinates.
  - Files:
    - `apps/mobile/src/app/checkin/success.tsx`
    - `apps/mobile/src/components/dashboard/RunningHoursTimer.tsx`
    - `apps/mobile/src/hooks/useAttendanceSubmission.ts`
    - `apps/mobile/src/app/checkin/__tests__/success.test.tsx`

---

### Step 8: Check-Out Flow & Total Hours Calculation (`E14`, `E15`, `E18`, `E19`)

- [ ] Task 8.1: Check-Out Confirmation Modal (`E14`)
  - Acceptance: Modal dialog displaying total work hours ("You have worked 8h 12m today"), "Check Out" confirm button, and "Cancel" button.
  - Verify: Component test verifying cancellation keeps shift active and confirmation proceeds to location/biometrics.
  - Files:
    - `apps/mobile/src/components/checkout/ConfirmCheckoutModal.tsx`
    - `apps/mobile/src/components/checkout/__tests__/ConfirmCheckoutModal.test.tsx`

- [ ] Task 8.2: Check-Out Submission & Final Dashboard Lock (`E18`, `E19`)
  - Acceptance: Location & biometric verification followed by check-out submission. Success screen showing total hours and location. Dashboard transitions to "Goodbye, Alex", status `Checked Out`, and disabled check-in button with "Check in after 9AM tomorrow".
  - Verify: Test confirming button remains disabled and shift is locked until next operational day.
  - Files:
    - `apps/mobile/src/app/checkout/success.tsx`
    - `apps/mobile/src/components/dashboard/CheckedOutBanner.tsx`
    - `apps/mobile/src/app/checkout/__tests__/success.test.tsx`

---

### Step 9: Geofence Exceptions, Supervisor Escalation & Offline Queue (`E20`-`E23`, `E27`, `E36`, `E37`, `E40`)

- [x] Task 9.1: Geofence Mismatch Warning & Supervisor Escalation (`E20`, `E21`, `E22`, `E23`)
  - Acceptance: Outside boundary screen showing "You're outside the work area", distance ("You are about 1.4 km from BLR-1"), instructions ("Turn on Location..."), Retry button, and note input field with "Send to Supervisor". Success screen confirms "Message sent to supervisor", setting dashboard to `Pending Review`.
  - Verify: Test asserting note submission calls escalation API and sets status to `Pending Review`.
  - Files:
    - `apps/mobile/src/app/exceptions/outside-work-area.tsx`
    - `apps/mobile/src/app/exceptions/message-sent.tsx`

- [x] Task 9.2: Missing Check-Out Notice & Explanation Note (`E27`, `E40`)
  - Acceptance: Dialog / Banner alerting employee of previous missing check-out with action to "Add Note" explaining reason to supervisor.
  - Verify: Test verifying note submission resolves missing checkout alert.
  - Files:
    - `apps/mobile/src/components/exceptions/MissingCheckoutModal.tsx`

- [x] Task 9.3: Offline SQLite Queue & Sync Engine (`E36`, `E37`)
  - Acceptance: SQLite table in `expo-sqlite` storing queued submissions when network is unavailable (`E36`). Dashboard displays offline banner (`E37`). Automatic background sync worker drains queue using idempotency keys when connection restores.
  - Verify: Unit test validating SQLite queue insertion, FIFO draining, and idempotency key persistence.
  - Files:
    - `apps/mobile/src/services/offline-queue.ts`
    - `apps/mobile/src/components/common/OfflineBanner.tsx`

---

### Step 10: Cross-App Integration & End-to-End Verification

- [x] Task 10.1: Cross-App Attendance Integration Verification
  - Acceptance: An automated integration test proving that:
    1. A check-in submitted via the mobile API within 800m appears in the web portal Team Today dashboard (`AM 02`) with status `Present`.
    2. A check-in submitted 1.4 km outside site boundary appears in the web Exceptions Queue (`AM 06`) with matching MapLibre geofence coordinates and selfie evidence.
    3. Supervisor approval in web portal updates attendance record and reflects as `Checked IN` on the mobile shift endpoint.
  - Verify: Run integration test script `pnpm test:cross-app-bridge` with all assertions passing.
  - Files:
    - `apps/api/src/modules/attendance/cross-app-bridge.spec.ts`

