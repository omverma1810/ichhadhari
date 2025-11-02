/**
 * Common API types and interfaces
 */

// Pagination
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface PaginationParams {
  page?: number;
  page_size?: number;
  limit?: number;
  offset?: number;
}

// Date range filters
export interface DateRangeFilter {
  start_date?: string;
  end_date?: string;
}

// Common status types
export type StatusType = "active" | "inactive" | "suspended" | "deleted";

// API Error Response
export interface ApiErrorResponse {
  detail?: string;
  message?: string;
  errors?: Record<string, string[]>;
  [key: string]: unknown;
}

// Success Response
export interface ApiSuccessResponse<T = unknown> {
  message: string;
  data?: T;
}

// Statistics Response
export interface StatisticsResponse {
  total: number;
  count: number;
  average?: number;
  sum?: number;
  percentage_change?: number;
  trend?: "up" | "down" | "stable";
  [key: string]: unknown;
}

// Chart Data
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
  [key: string]: unknown;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    [key: string]: unknown;
  }[];
}

// File Upload
export interface FileUploadResponse {
  file_url: string;
  file_name: string;
  file_size: number;
  uploaded_at: string;
}

// Audit fields
export interface AuditFields {
  created_at: string;
  updated_at: string;
  created_by?: number;
  updated_by?: number;
}

// Sorting
export type SortOrder = "asc" | "desc";

export interface SortParams {
  ordering?: string;
}

// Search
export interface SearchParams {
  search?: string;
}

// Common filter params
export type CommonFilters = PaginationParams & SortParams & SearchParams;

// Action Response
export interface ActionResponse {
  success: boolean;
  message: string;
  data?: unknown;
}
