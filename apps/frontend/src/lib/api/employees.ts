import { apiClient } from "./client";
import type { PaginationParams, PaginatedResponse } from "./milk";

// Employee types
export interface Employee {
  id: number;
  employee_code: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone_number?: string;
  date_of_birth?: string;
  gender?: "male" | "female" | "other";
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  department: number;
  department_name?: string;
  designation?: string;
  date_of_joining: string;
  employment_type: "full_time" | "part_time" | "contract" | "intern";
  status: "active" | "on_leave" | "resigned" | "terminated";
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  bank_account_number?: string;
  bank_name?: string;
  ifsc_code?: string;
  pan_number?: string;
  aadhaar_number?: string;
  created_at: string;
  updated_at: string;
}

export interface EmployeeCreateData {
  employee_code: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone_number?: string;
  date_of_birth?: string;
  gender?: "male" | "female" | "other";
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  department: number;
  designation?: string;
  date_of_joining: string;
  employment_type: "full_time" | "part_time" | "contract" | "intern";
  status?: "active" | "on_leave" | "resigned" | "terminated";
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  bank_account_number?: string;
  bank_name?: string;
  ifsc_code?: string;
  pan_number?: string;
  aadhaar_number?: string;
}

export interface AttendanceSummary {
  total_days: number;
  present_days: number;
  absent_days: number;
  half_days: number;
  leaves: number;
  attendance_percentage: number;
}

export interface PerformanceHistory {
  review_date: string;
  rating: number;
  comments: string;
  reviewer_name: string;
}

export interface SalaryDetails {
  basic_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  last_payment_date?: string;
}

// Department types
export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  manager?: number;
  manager_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DepartmentCreateData {
  name: string;
  code: string;
  description?: string;
  manager?: number;
  is_active?: boolean;
}

// Attendance types
export interface Attendance {
  id: number;
  employee: number;
  employee_name?: string;
  date: string;
  check_in_time?: string;
  check_out_time?: string;
  status: "present" | "absent" | "half_day" | "on_leave" | "holiday";
  work_hours?: number;
  overtime_hours?: number;
  notes?: string;
  marked_by?: number;
  marked_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface AttendanceCreateData {
  employee: number;
  date: string;
  check_in_time?: string;
  check_out_time?: string;
  status: "present" | "absent" | "half_day" | "on_leave" | "holiday";
  work_hours?: number;
  overtime_hours?: number;
  notes?: string;
}

export interface BulkAttendanceData {
  date: string;
  attendances: Array<{
    employee: number;
    status: "present" | "absent" | "half_day" | "on_leave" | "holiday";
    check_in_time?: string;
    check_out_time?: string;
  }>;
}

// Leave types
export interface LeaveType {
  id: number;
  name: string;
  code: string;
  max_days_per_year: number;
  is_paid: boolean;
  requires_approval: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeaveTypeCreateData {
  name: string;
  code: string;
  max_days_per_year: number;
  is_paid?: boolean;
  requires_approval?: boolean;
  is_active?: boolean;
}

export interface LeaveRequest {
  id: number;
  employee: number;
  employee_name?: string;
  leave_type: number;
  leave_type_name?: string;
  start_date: string;
  end_date: string;
  number_of_days: number;
  reason: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  approved_by?: number;
  approved_by_name?: string;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface LeaveRequestCreateData {
  leave_type: number;
  start_date: string;
  end_date: string;
  reason: string;
}

// Performance Review types
export interface PerformanceReview {
  id: number;
  employee: number;
  employee_name?: string;
  reviewer: number;
  reviewer_name?: string;
  review_period_start: string;
  review_period_end: string;
  rating: number;
  strengths?: string;
  areas_for_improvement?: string;
  goals?: string;
  comments?: string;
  status: "draft" | "submitted" | "approved";
  created_at: string;
  updated_at: string;
}

export interface PerformanceReviewCreateData {
  employee: number;
  review_period_start: string;
  review_period_end: string;
  rating: number;
  strengths?: string;
  areas_for_improvement?: string;
  goals?: string;
  comments?: string;
  status?: "draft" | "submitted" | "approved";
}

// Salary Structure types
export interface SalaryStructure {
  id: number;
  employee: number;
  employee_name?: string;
  basic_salary: number;
  hra?: number;
  transport_allowance?: number;
  medical_allowance?: number;
  other_allowances?: number;
  pf_deduction?: number;
  tax_deduction?: number;
  other_deductions?: number;
  gross_salary: number;
  net_salary: number;
  effective_from: string;
  effective_to?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SalaryStructureCreateData {
  employee: number;
  basic_salary: number;
  hra?: number;
  transport_allowance?: number;
  medical_allowance?: number;
  other_allowances?: number;
  pf_deduction?: number;
  tax_deduction?: number;
  other_deductions?: number;
  effective_from: string;
  effective_to?: string;
}

// Payroll types
export interface Payroll {
  id: number;
  employee: number;
  employee_name?: string;
  salary_structure: number;
  month: string;
  year: number;
  working_days: number;
  present_days: number;
  basic_salary: number;
  allowances: number;
  deductions: number;
  gross_salary: number;
  net_salary: number;
  status: "draft" | "approved" | "paid";
  payment_date?: string;
  payment_method?: "bank_transfer" | "cash" | "cheque";
  payment_reference?: string;
  approved_by?: number;
  approved_by_name?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PayrollCreateData {
  employee: number;
  month: string;
  year: number;
  working_days: number;
  present_days: number;
  status?: "draft" | "approved" | "paid";
}

export const employeesAPI = {
  // ==================== Employees ====================

  /**
   * Get paginated list of employees
   */
  getEmployees: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<Employee>> => {
    return await apiClient.get<PaginatedResponse<Employee>>(
      "/employees/employees/",
      { params }
    );
  },

  /**
   * Get single employee by ID
   */
  getEmployee: async (id: number): Promise<Employee> => {
    return await apiClient.get<Employee>(`/employees/employees/${id}/`);
  },

  /**
   * Create new employee
   */
  createEmployee: async (data: EmployeeCreateData): Promise<Employee> => {
    return await apiClient.post<Employee>("/employees/employees/", data);
  },

  /**
   * Update employee
   */
  updateEmployee: async (
    id: number,
    data: Partial<EmployeeCreateData>
  ): Promise<Employee> => {
    return await apiClient.patch<Employee>(`/employees/employees/${id}/`, data);
  },

  /**
   * Delete employee
   */
  deleteEmployee: async (id: number): Promise<void> => {
    await apiClient.delete(`/employees/employees/${id}/`);
  },

  /**
   * Get employee attendance summary
   */
  getAttendanceSummary: async (
    id: number,
    params?: { start_date?: string; end_date?: string }
  ): Promise<AttendanceSummary> => {
    return await apiClient.get<AttendanceSummary>(
      `/employees/employees/${id}/attendance-summary/`,
      { params }
    );
  },

  /**
   * Get employee performance history
   */
  getPerformanceHistory: async (id: number): Promise<PerformanceHistory[]> => {
    return await apiClient.get<PerformanceHistory[]>(
      `/employees/employees/${id}/performance-history/`
    );
  },

  /**
   * Get employee salary details
   */
  getSalaryDetails: async (id: number): Promise<SalaryDetails> => {
    return await apiClient.get<SalaryDetails>(
      `/employees/employees/${id}/salary-details/`
    );
  },

  // ==================== Departments ====================

  /**
   * Get paginated list of departments
   */
  getDepartments: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<Department>> => {
    return await apiClient.get<PaginatedResponse<Department>>(
      "/employees/departments/",
      { params }
    );
  },

  /**
   * Get single department by ID
   */
  getDepartment: async (id: number): Promise<Department> => {
    return await apiClient.get<Department>(`/employees/departments/${id}/`);
  },

  /**
   * Create new department
   */
  createDepartment: async (data: DepartmentCreateData): Promise<Department> => {
    return await apiClient.post<Department>("/employees/departments/", data);
  },

  /**
   * Update department
   */
  updateDepartment: async (
    id: number,
    data: Partial<DepartmentCreateData>
  ): Promise<Department> => {
    return await apiClient.patch<Department>(
      `/employees/departments/${id}/`,
      data
    );
  },

  /**
   * Delete department
   */
  deleteDepartment: async (id: number): Promise<void> => {
    await apiClient.delete(`/employees/departments/${id}/`);
  },

  // ==================== Attendance ====================

  /**
   * Get paginated list of attendance records
   */
  getAttendance: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<Attendance>> => {
    return await apiClient.get<PaginatedResponse<Attendance>>(
      "/employees/attendance/",
      { params }
    );
  },

  /**
   * Get single attendance record by ID
   */
  getAttendanceRecord: async (id: number): Promise<Attendance> => {
    return await apiClient.get<Attendance>(`/employees/attendance/${id}/`);
  },

  /**
   * Create new attendance record
   */
  createAttendance: async (data: AttendanceCreateData): Promise<Attendance> => {
    return await apiClient.post<Attendance>("/employees/attendance/", data);
  },

  /**
   * Update attendance record
   */
  updateAttendance: async (
    id: number,
    data: Partial<AttendanceCreateData>
  ): Promise<Attendance> => {
    return await apiClient.patch<Attendance>(
      `/employees/attendance/${id}/`,
      data
    );
  },

  /**
   * Delete attendance record
   */
  deleteAttendance: async (id: number): Promise<void> => {
    await apiClient.delete(`/employees/attendance/${id}/`);
  },

  /**
   * Mark bulk attendance
   */
  markBulkAttendance: async (
    data: BulkAttendanceData
  ): Promise<Attendance[]> => {
    return await apiClient.post<Attendance[]>(
      "/employees/attendance/bulk-mark/",
      data
    );
  },

  // ==================== Leave Requests ====================

  /**
   * Get paginated list of leave requests
   */
  getLeaveRequests: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<LeaveRequest>> => {
    return await apiClient.get<PaginatedResponse<LeaveRequest>>(
      "/employees/leave-requests/",
      { params }
    );
  },

  /**
   * Get single leave request by ID
   */
  getLeaveRequest: async (id: number): Promise<LeaveRequest> => {
    return await apiClient.get<LeaveRequest>(
      `/employees/leave-requests/${id}/`
    );
  },

  /**
   * Create new leave request
   */
  createLeaveRequest: async (
    data: LeaveRequestCreateData
  ): Promise<LeaveRequest> => {
    return await apiClient.post<LeaveRequest>(
      "/employees/leave-requests/",
      data
    );
  },

  /**
   * Update leave request
   */
  updateLeaveRequest: async (
    id: number,
    data: Partial<LeaveRequestCreateData>
  ): Promise<LeaveRequest> => {
    return await apiClient.patch<LeaveRequest>(
      `/employees/leave-requests/${id}/`,
      data
    );
  },

  /**
   * Delete leave request
   */
  deleteLeaveRequest: async (id: number): Promise<void> => {
    await apiClient.delete(`/employees/leave-requests/${id}/`);
  },

  /**
   * Approve leave request
   */
  approveLeaveRequest: async (id: number): Promise<LeaveRequest> => {
    return await apiClient.post<LeaveRequest>(
      `/employees/leave-requests/${id}/approve/`
    );
  },

  /**
   * Reject leave request
   */
  rejectLeaveRequest: async (
    id: number,
    reason: string
  ): Promise<LeaveRequest> => {
    return await apiClient.post<LeaveRequest>(
      `/employees/leave-requests/${id}/reject/`,
      {
        rejection_reason: reason,
      }
    );
  },

  // ==================== Leave Types ====================

  /**
   * Get paginated list of leave types
   */
  getLeaveTypes: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<LeaveType>> => {
    return await apiClient.get<PaginatedResponse<LeaveType>>(
      "/employees/leave-types/",
      { params }
    );
  },

  /**
   * Get single leave type by ID
   */
  getLeaveType: async (id: number): Promise<LeaveType> => {
    return await apiClient.get<LeaveType>(`/employees/leave-types/${id}/`);
  },

  /**
   * Create new leave type
   */
  createLeaveType: async (data: LeaveTypeCreateData): Promise<LeaveType> => {
    return await apiClient.post<LeaveType>("/employees/leave-types/", data);
  },

  /**
   * Update leave type
   */
  updateLeaveType: async (
    id: number,
    data: Partial<LeaveTypeCreateData>
  ): Promise<LeaveType> => {
    return await apiClient.patch<LeaveType>(
      `/employees/leave-types/${id}/`,
      data
    );
  },

  /**
   * Delete leave type
   */
  deleteLeaveType: async (id: number): Promise<void> => {
    await apiClient.delete(`/employees/leave-types/${id}/`);
  },

  // ==================== Performance Reviews ====================

  /**
   * Get paginated list of performance reviews
   */
  getPerformanceReviews: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<PerformanceReview>> => {
    return await apiClient.get<PaginatedResponse<PerformanceReview>>(
      "/employees/performance-reviews/",
      { params }
    );
  },

  /**
   * Get single performance review by ID
   */
  getPerformanceReview: async (id: number): Promise<PerformanceReview> => {
    return await apiClient.get<PerformanceReview>(
      `/employees/performance-reviews/${id}/`
    );
  },

  /**
   * Create new performance review
   */
  createPerformanceReview: async (
    data: PerformanceReviewCreateData
  ): Promise<PerformanceReview> => {
    return await apiClient.post<PerformanceReview>(
      "/employees/performance-reviews/",
      data
    );
  },

  /**
   * Update performance review
   */
  updatePerformanceReview: async (
    id: number,
    data: Partial<PerformanceReviewCreateData>
  ): Promise<PerformanceReview> => {
    return await apiClient.patch<PerformanceReview>(
      `/employees/performance-reviews/${id}/`,
      data
    );
  },

  /**
   * Delete performance review
   */
  deletePerformanceReview: async (id: number): Promise<void> => {
    await apiClient.delete(`/employees/performance-reviews/${id}/`);
  },

  // ==================== Salary Structures ====================

  /**
   * Get paginated list of salary structures
   */
  getSalaryStructures: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<SalaryStructure>> => {
    return await apiClient.get<PaginatedResponse<SalaryStructure>>(
      "/employees/salary-structures/",
      { params }
    );
  },

  /**
   * Get single salary structure by ID
   */
  getSalaryStructure: async (id: number): Promise<SalaryStructure> => {
    return await apiClient.get<SalaryStructure>(
      `/employees/salary-structures/${id}/`
    );
  },

  /**
   * Create new salary structure
   */
  createSalaryStructure: async (
    data: SalaryStructureCreateData
  ): Promise<SalaryStructure> => {
    return await apiClient.post<SalaryStructure>(
      "/employees/salary-structures/",
      data
    );
  },

  /**
   * Update salary structure
   */
  updateSalaryStructure: async (
    id: number,
    data: Partial<SalaryStructureCreateData>
  ): Promise<SalaryStructure> => {
    return await apiClient.patch<SalaryStructure>(
      `/employees/salary-structures/${id}/`,
      data
    );
  },

  /**
   * Delete salary structure
   */
  deleteSalaryStructure: async (id: number): Promise<void> => {
    await apiClient.delete(`/employees/salary-structures/${id}/`);
  },

  // ==================== Payroll ====================

  /**
   * Get paginated list of payroll records
   */
  getPayroll: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<Payroll>> => {
    return await apiClient.get<PaginatedResponse<Payroll>>(
      "/employees/payroll/",
      { params }
    );
  },

  /**
   * Get single payroll record by ID
   */
  getPayrollRecord: async (id: number): Promise<Payroll> => {
    return await apiClient.get<Payroll>(`/employees/payroll/${id}/`);
  },

  /**
   * Create new payroll record
   */
  createPayroll: async (data: PayrollCreateData): Promise<Payroll> => {
    return await apiClient.post<Payroll>("/employees/payroll/", data);
  },

  /**
   * Update payroll record
   */
  updatePayroll: async (
    id: number,
    data: Partial<PayrollCreateData>
  ): Promise<Payroll> => {
    return await apiClient.patch<Payroll>(`/employees/payroll/${id}/`, data);
  },

  /**
   * Delete payroll record
   */
  deletePayroll: async (id: number): Promise<void> => {
    await apiClient.delete(`/employees/payroll/${id}/`);
  },

  /**
   * Approve payroll record
   */
  approvePayroll: async (id: number): Promise<Payroll> => {
    return await apiClient.post<Payroll>(`/employees/payroll/${id}/approve/`);
  },
};
