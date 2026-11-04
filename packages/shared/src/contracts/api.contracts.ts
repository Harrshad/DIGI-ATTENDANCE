export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EstimatedRowCountResponse {
  estimatedRows: number;
  locationCount: number;
  dateRangeDays: number;
}

export interface ExceptionEscalationResponse {
  exceptionId: string;
  status: 'Escalated' | 'Resolved' | 'Rejected';
  updatedAt: string;
  auditLogId: string;
}
