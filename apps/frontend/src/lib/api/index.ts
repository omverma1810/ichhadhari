/**
 * API Integration Layer
 *
 * This module exports all API services for communicating with the Django backend.
 * All API calls use the configured apiClient with automatic token management and error handling.
 *
 * @example
 * ```typescript
 * import { milkAPI, authAPI } from '@/lib/api';
 *
 * // Fetch suppliers
 * const suppliers = await milkAPI.getSuppliers({ page: 1, status: 'active' });
 *
 * // Login user
 * const response = await authAPI.login('username', 'password');
 * ```
 */

// Export API client
export { apiClient } from "./client";
export type { ApiError, ApiErrorResponse } from "./client";

// Export Auth API
export { authAPI } from "./auth";
export type {
  RegisterData,
  LoginCredentials,
  User,
  AuthTokens,
  LoginResponse,
  UpdateProfileData,
  ChangePasswordData,
} from "./auth";

// Export Milk Management API
export { milkAPI } from "./milk";
export type {
  PaginationParams,
  PaginatedResponse,
  Supplier,
  SupplierCreateData,
  SupplierStats,
  MilkCollection,
  CollectionCreateData,
  CollectionStats,
  Payment,
  PaymentCreateData,
} from "./milk";

// Export Production API
export { productionAPI } from "./production";
export type {
  Product,
  ProductCreateData,
  ProductStats,
  ProductionBatch,
  BatchCreateData,
  BatchStats,
  ProductionSchedule,
  ScheduleCreateData,
} from "./production";

// Export Inventory API
export { inventoryAPI } from "./inventory";
export type {
  InventoryItem,
  InventoryItemCreateData,
  InventoryTransaction,
  TransactionCreateData,
  TransactionStats,
  InventoryAlert,
  RawMaterial,
  FinishedGood,
} from "./inventory";

// Export Vendors API
export { vendorsAPI } from "./vendors";
export type {
  Vendor,
  VendorCreateData,
  VendorStats,
  PurchaseOrder,
  POItem,
  POCreateData,
  VendorPayment,
  VendorPaymentCreateData,
  GoodsReceiptNote,
  GRNItem,
  GRNCreateData,
} from "./vendors";

// Export Employees API
export { employeesAPI } from "./employees";
export type {
  Employee,
  EmployeeCreateData,
  AttendanceSummary,
  PerformanceHistory,
  SalaryDetails,
  Department,
  DepartmentCreateData,
  Attendance,
  AttendanceCreateData,
  BulkAttendanceData,
  LeaveType,
  LeaveTypeCreateData,
  LeaveRequest,
  LeaveRequestCreateData,
  PerformanceReview,
  PerformanceReviewCreateData,
  SalaryStructure,
  SalaryStructureCreateData,
  Payroll,
  PayrollCreateData,
} from "./employees";

// Export Dashboard API
export { dashboardAPI } from "./dashboard";
export type {
  DashboardStats,
  ActivityItem,
  RecentActivity,
  ChartDataPoint,
  MilkCollectionChart,
  ProductionChart,
  InventoryChart,
  AttendanceChart,
  FinancialChart,
} from "./dashboard";

/**
 * Common patterns and utilities
 */

// Helper to build query params
export const buildQueryParams = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
};

// Helper to format date for API
export const formatDateForAPI = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
};

// Helper to parse API date
export const parseAPIDate = (dateString: string): Date => {
  return new Date(dateString);
};

// Helper to handle API errors
export const getAPIErrorMessage = (error: any): string => {
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return "An unexpected error occurred";
};
