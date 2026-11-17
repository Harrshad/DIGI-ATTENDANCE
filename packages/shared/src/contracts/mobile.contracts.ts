import { MobileAssignedSite } from '../types';

/**
 * Mobile Authentication Response Payload
 */
export interface MobileAuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
  employee: {
    id: string;
    employeeNumber: string;
    firstName: string;
    lastName: string;
    email: string;
    assignedSite: MobileAssignedSite;
  };
}

/**
 * Mobile Attendance Submission Response
 */
export interface MobileAttendanceSubmissionResponse {
  success: boolean;
  attendanceId: string;
  status: 'Checked IN' | 'Checked Out' | 'Pending Review';
  serverTimestamp: string;
  formattedTime: string;
  formattedDate: string;
  siteCode: string;
  siteName: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  totalWorkFormatted?: string;
  isOutsideGeofence?: boolean;
  distanceOutsideMeters?: number;
}
