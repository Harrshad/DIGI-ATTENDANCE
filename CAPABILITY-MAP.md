# Capability Map: Location-Verified Attendance Monitoring System (TriAttendance)

## Overview
The TriAttendance platform bundles several independently testable capabilities spanning identity, geospatial fencing, attendance tracking, exception workflows, workforce administration, reporting, and notifications.

## Capability Modules

| Module ID | Responsibility | Depends On | Reference Screens |
|---|---|---|---|
| `identity-access` | Account provisioning (HR admin), Argon2id password authentication, session management, RBAC (Admin, Supervisor, Account Manager), server-side organizational scoping (manager-to-site/team data isolation), login rate limiting, lockout, and immutable audit logging. | — | `AM 01 · Sign in — Web.png` |
| `locations-geofencing` | Work locations CRUD (name, city, address, lat/lng, allowed radius), PostGIS spatial boundary storage, employee-to-site assignments, and site list/detail views. | `identity-access` | `locations-admin-view.png`, `add-location-page.png` |
| `attendance-core` | Mobile check-in/out ingestion API (GPS coordinates, ±accuracy, mock flag, selfie storage, device liveness status), PostGIS geofence evaluation (`ST_DWithin`), shift logic & late cutoff (09:30 Asia/Kolkata), read-only attendance status calculation (`Present`, `Late`, `Absent`, `Rejected`, `Flagged`), and dashboard KPI aggregations. | `identity-access`, `locations-geofencing` | `AM 02 · Dashboard — Team today.png` |
| `exception-management` | Alerts queue (Geofence mismatch, Liveness failure, Missing check-out), exception detail view with MapLibre GL JS geofence map visualization, signed selfie evidence viewer, manager note capture, decision escalation workflow ("Escalate to Supervisor"), and resolution auditing. | `attendance-core` | `AM 06 · Exceptions — Queue.png`, `AM 07 · Exception review.png` |
| `workforce-directory` | Employee directory roster, multi-criteria filtering (Exceptions, Check-in Status, Location Mismatch, Status, Assigned Site), numbered pagination, and employee detail view with 30-day KPI cards and read-only attendance history. | `identity-access`, `attendance-core` | `employee-directory.png`, `AM 05 · Employee detail.png` |
| `reporting-exports` | Attendance report request form, row-count estimation engine, background report generation worker (BullMQ + Valkey), streaming CSV generator, headless Playwright PDF generator, and recent downloads manager. | `attendance-core`, `locations-geofencing`, `workforce-directory` | `AM 11 · Reports.png` |
| `notifications` | In-app notification bell counter and drawer (Postgres-backed), transactional email alerts via Nodemailer SMTP (escalations, report ready), and FCM push notification dispatch hooks. | `identity-access`, `exception-management`, `reporting-exports` | Top Header Bell (all screens), `AM 07 · Exception review.png`, `AM 11 · Reports.png` |

---

## Build Order

```
[identity-access]
       │
       ▼
[locations-geofencing]
       │
       ▼
[attendance-core]
       ├────────────────────────┐
       ▼                        ▼
[exception-management]   [workforce-directory]
       │                        │
       ├────────────────────────┘
       ▼
[reporting-exports]
       │
       ▼
[notifications]
```

**Sequential Execution Pipeline:**
1. `identity-access`
2. `locations-geofencing`
3. `attendance-core`
4. `exception-management`
5. `workforce-directory`
6. `reporting-exports`
7. `notifications`
