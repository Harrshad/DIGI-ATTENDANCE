# Capability Map: Digital Attendance (Mobile App & Shared Bridge)

## Overview
Digital Attendance is the employee-facing mobile companion to the TriAttendance system. It shares the existing unified NestJS/PostgreSQL backend (`apps/api`) and shared schemas (`packages/shared`), introducing mobile authentication, local on-device ML Kit liveness verification, location geofencing capture, offline SQLite synchronization, and bi-directional exception reporting.

## Capability Modules

| Module ID | Responsibility | Depends On | Reference Screens |
|---|---|---|---|
| `mobile-bridge-auth` | Mobile authentication contract: Employee ID normalization, device registry & binding, bearer access + rotating refresh tokens in SecureStore, account activation (OTP adapter), password reset request | `identity-access` (web) | `E1`, `E3`, `E5`, `E41` |
| `mobile-shell-profile` | App navigation skeleton, OS permissions flow (foreground GPS + Camera only), employee profile viewer, theme tokens (Option A light / Option B navy) | `mobile-bridge-auth` | `E7`, `E34`, `menu`, `OPTION A/B` |
| `attendance-capture` | Geolocation pre-check (client-side distance hints, mock GPS detection), VisionCamera selfie frame processing, offline ML Kit blink liveness detection | `mobile-shell-profile`, `locations-geofencing` (web) | `E9`, `E10`, `E11`, `E15`, `E16`, `E17`, `E25`, `E39` |
| `shift-home-sync` | Shift dashboard state machine (`Check-in Pending`, `Checked IN`, `Checked Out`, `Pending Review`), hours counter, check-in/out submission to API with idempotency key, offline SQLite queue & background sync | `attendance-capture`, `attendance-core` (web) | `E8`, `E12`, `E13`, `E14`, `E18`, `E19`, `E36`, `E37`, `HD` |
| `mobile-exceptions-bridge` | Geofence rejection feedback ("1.4 km outside"), supervisor escalation note dispatch, missing checkout resolution note, exception resolution notifications | `shift-home-sync`, `exception-management` (web), `notifications` (web) | `E20`, `E21`, `E22`, `E23`, `E27`, `E40` |
| `employee-leave` *(Deferred)* | Leave application, balance viewing, status tracking (seen in E28-E30) | `shift-home-sync` | `E28`, `E29`, `E30` |

---

## Build Order

```
[identity-access (web)] ────┐
                            ▼
                  [mobile-bridge-auth]
                            │
                            ▼
                  [mobile-shell-profile]
                            │
[locations-geofencing] ────┤
                            ▼
                  [attendance-capture]
                            │
[attendance-core] ─────────┤
                            ▼
                  [shift-home-sync]
                            │
[exception-management] ────┤
[notifications (web)]  ────┤
                            ▼
               [mobile-exceptions-bridge]
                            │
                            ▼
                 [employee-leave (Deferred)]
```

**Sequential Execution Pipeline:**
1. `mobile-bridge-auth`
2. `mobile-shell-profile`
3. `attendance-capture`
4. `shift-home-sync`
5. `mobile-exceptions-bridge`
6. `employee-leave` (Deferred)

