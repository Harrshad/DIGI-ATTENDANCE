/**
 * Attendance status values visible across the dashboard, tables, and reports
 */
export type AttendanceStatus = 'Present' | 'Late' | 'Absent' | 'Rejected' | 'Flagged';
export const ATTENDANCE_STATUSES: readonly AttendanceStatus[] = [
  'Present',
  'Late',
  'Absent',
  'Rejected',
  'Flagged',
] as const;

/**
 * User roles for access control and server-side scoping
 */
export type UserRole = 'ACCOUNT_MANAGER' | 'SUPERVISOR' | 'ADMIN';
export const USER_ROLES: readonly UserRole[] = [
  'ACCOUNT_MANAGER',
  'SUPERVISOR',
  'ADMIN',
] as const;

/**
 * Filter tabs on Alerts / Exceptions queue (AM 06)
 */
export type ExceptionFilterTab = 'ALL_OPEN' | 'GEOFENCE' | 'LIVENESS' | 'MISSING_CHECKOUT';

/**
 * Exception lifecycle status
 */
export type ExceptionStatus = 'Pending' | 'Rejected' | 'Flagged' | 'Resolved' | 'Escalated';

/**
 * Work location status (locations-admin-view)
 */
export type LocationStatus = 'Active' | 'Disabled';

/**
 * Core User entity
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  assignedLocationIds: string[];
  hasDelegatedResolutionPermission?: boolean;
}

/**
 * Work Location entity
 */
export interface WorkLocation {
  id: string;
  name: string;
  city: string;
  address: string;
  radiusMeters: number;
  latitude: number;
  longitude: number;
  status: LocationStatus;
  peopleCount: number;
  presentTodayCount: number;
}

/**
 * Employee Directory item
 */
export interface EmployeeDirectoryItem {
  id: string;
  employeeCode: string; // e.g. TRIL-4821
  name: string;
  department: string;
  role: string;
  reportingManagerId: string;
  reportingManagerName: string;
  assignedSiteId: string;
  assignedSiteCode: string;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  status: AttendanceStatus;
}

/**
 * Overview Today Attendance Row (AM 02)
 */
export interface TodayAttendanceItem {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  date: string; // e.g. 25 Aug 2026
  checkInTime: string; // e.g. 09:14 or -
  checkOutTime: string; // e.g. 18:02 or -
  siteName: string; // e.g. CHN-1 or Outside boundary
  reportingSupervisor: string;
  status: AttendanceStatus;
  isOutsideBoundary?: boolean;
}

/**
 * Overview KPI Summary (AM 02)
 */
export interface DashboardKPISummary {
  presentToday: number;
  totalEmployees: number;
  presentDeltaVsYesterday: number;
  lateToday: number;
  lateCutoffTime: string; // e.g. "09:30"
  absentToday: number;
  needsReviewCount: number;
  oldestReviewDays: number;
}

/**
 * Employee Detail 30-Day KPIs (AM 05)
 */
export interface EmployeePerformanceKPISummary {
  attendanceRatePercent: number;
  attendanceRateDeltaVsLastMonth: number;
  totalEmployeesInOrg: number;
  lateArrivalsCount: number;
  exceptionsRaisedCount: number;
  avgHoursPerDay: string; // e.g. "08h 41m"
  recordedDaysCount: number;
}

/**
 * Single Attendance Record in History (AM 05)
 */
export interface AttendanceHistoryRecord {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  date: string;
  checkInTime: string;
  checkOutTime: string;
  siteName: string;
  status: AttendanceStatus;
}

/**
 * Alerts Queue Item (AM 06)
 */
export interface ExceptionQueueItem {
  id: string;
  attendanceRecordId: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  initials: string;
  date: string;
  checkInTime: string;
  checkOutTime: string;
  siteName: string;
  status: 'Rejected' | 'Flagged' | 'Pending';
  type: 'GEOFENCE' | 'LIVENESS' | 'MISSING_CHECKOUT';
  isOutsideBoundary: boolean;
}

/**
 * Exception Review Detail (AM 07)
 */
export interface ExceptionReviewDetail {
  id: string;
  attendanceRecordId: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  dateFormatted: string; // e.g. "Monday, 21 August 2026"
  reportingManagerName: string;
  attemptedCheckInTime: string; // e.g. "09:02 AM"
  assignedSiteCode: string; // e.g. "CHN-1"
  assignedSiteRadiusMeters: number; // e.g. 500
  siteCenterLatitude: number;
  siteCenterLongitude: number;
  actualCheckInLatitude: number;
  actualCheckInLongitude: number;
  measuredDistanceMeters: number; // e.g. 1400
  distanceOutsideBoundaryMeters: number; // e.g. 900
  gpsAccuracyMeters: number; // e.g. 8
  isGpsReliable: boolean;
  blinkVerificationPassed: boolean;
  blinkAttemptCount: number;
  checkOutTime: string | null;
  selfiePresignedUrl: string;
  selfieCapturedAt: string; // e.g. "09:14 AM"
  currentStatus: 'Rejected' | 'Flagged' | 'Pending';
  canApproveOrReject: boolean;
}

/**
 * Attendance Download Record Job (AM 11)
 */
export interface RecentDownloadItem {
  id: string;
  title: string; // e.g. "August 2026 · BLR-3"
  generatedDate: string; // e.g. "26 Aug"
  rowCount: number; // e.g. 812
  fileFormat: 'CSV' | 'PDF';
  downloadUrl: string;
}

/**
 * In-app Notification Item
 */
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'EXCEPTION_RAISED' | 'REPORT_READY' | 'ESCALATION_RESOLVED';
  read: boolean;
  createdAt: string;
  linkUrl?: string;
}
