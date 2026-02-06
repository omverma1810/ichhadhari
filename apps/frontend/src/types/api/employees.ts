/**
 * Employees API Types
 */

import { AuditFields, CommonFilters } from "./common";

// ============ DEPARTMENTS ============

export interface Department extends AuditFields {
  id: number;
  department_id: string;
  name: string;
  description: string;
  head: number | null;
  head_name?: string;
  is_active: boolean;
}

export interface CreateDepartmentPayload {
  department_id: string;
  name: string;
  description?: string;
  head?: number;
  is_active?: boolean;
}

export interface UpdateDepartmentPayload extends Partial<CreateDepartmentPayload> {}

export interface DepartmentFilters extends CommonFilters {
  is_active?: boolean;
  head?: number;
}

export type DepartmentType =
  | "production"
  | "quality"
  | "collection"
  | "administration"
  | "sales"
  | "maintenance"
  | "transport"
  | "other";
export type EmploymentStatus =
  | "active"
  | "inactive"
  | "on_leave"
  | "suspended"
  | "terminated"
  | "resigned";
export type EmploymentType =
  | "full_time"
  | "part_time"
  | "contract"
  | "temporary";
export type EmployeeRole =
  | "manager"
  | "supervisor"
  | "operator"
  | "technician"
  | "driver"
  | "helper"
  | "admin"
  | "other";

export interface Employee extends AuditFields {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email?: string;
  personal_email?: string;
  phone: string;
  date_of_birth: string;
  gender: "male" | "female" | "other";
  address: string;
  city: string;
  state: string;
  pincode: string;
  department: DepartmentType;
  designation?: string;
  role: EmployeeRole;
  employment_type: EmploymentType;
  employment_status: EmploymentStatus;
  is_active: boolean;
  date_of_joining: string;
  date_of_leaving?: string;
  reporting_manager?: number;
  reporting_manager_name?: string;
  basic_salary: number;
  allowances?: number;
  deductions?: number;
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
  pan?: string;
  aadhaar?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  photo_url?: string;
  notes?: string;
  status?: EmploymentStatus;
}

export interface CreateEmployeePayload {
  employee_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone: string;
  date_of_birth: string;
  gender: "male" | "female" | "other";
  address: string;
  city: string;
  state: string;
  pincode: string;
  department: DepartmentType;
  role: EmployeeRole;
  employment_type: EmploymentType;
  date_of_joining: string;
  basic_salary: number;
  allowances?: number;
  deductions?: number;
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
  pan?: string;
  aadhaar?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string;
}

export interface UpdateEmployeePayload extends Partial<CreateEmployeePayload> {
  employment_status?: EmploymentStatus;
  date_of_leaving?: string;
  is_active?: boolean;
}

export interface EmployeeFilters extends CommonFilters {
  department?: DepartmentType;
  role?: EmployeeRole;
  employment_status?: EmploymentStatus;
  employment_type?: EmploymentType;
  city?: string;
  state?: string;
}

export interface PerformanceReview {
  id: number;
  employee_id: number;
  review_period_start: string;
  review_period_end: string;
  rating: number;
  comments: string;
}

export interface SalaryDetails {
  employee_id: number;
  basic_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  payment_history: {
    month: string;
    year: number;
    amount: number;
    status: string;
  }[];
}

// ============ ATTENDANCE ============

export type AttendanceStatus =
  | "present"
  | "absent"
  | "half_day"
  | "on_leave"
  | "holiday";

export interface Attendance extends AuditFields {
  id: number;
  employee: {
    id: number;
    employee_id: string;
    full_name: string;
    department: DepartmentType;
  };
  date: string;
  status: AttendanceStatus;
  check_in_time?: string;
  check_out_time?: string;
  working_hours?: number;
  overtime_hours?: number;
  remarks?: string;
  marked_by: {
    id: number;
    name: string;
  };
}

export interface CreateAttendancePayload {
  employee: number;
  date: string;
  status: AttendanceStatus;
  check_in_time?: string;
  check_out_time?: string;
  remarks?: string;
}

export interface UpdateAttendancePayload extends Partial<CreateAttendancePayload> {}

export interface BulkAttendancePayload {
  date: string;
  records: {
    employee: number;
    status: AttendanceStatus;
    check_in_time?: string;
    check_out_time?: string;
    remarks?: string;
  }[];
}

export interface BulkAttendanceResponse {
  success: number;
  failed: number;
  results: {
    employee: number;
    success: boolean;
    message?: string;
  }[];
}

export interface AttendanceFilters extends CommonFilters {
  employee?: number;
  date?: string;
  start_date?: string;
  end_date?: string;
  status?: AttendanceStatus;
  department?: DepartmentType;
}

export interface AttendanceSummary {
  employee_id: number;
  period_start: string;
  period_end: string;
  total_days: number;
  present_days: number;
  absent_days: number;
  half_days: number;
  leaves_taken: number;
  holidays: number;
  total_working_hours: number;
  average_working_hours: number;
  overtime_hours: number;
  attendance_percentage: number;
  by_status: {
    status: AttendanceStatus;
    count: number;
    percentage: number;
  }[];
}

// ============ LEAVE TYPES ============

export interface LeaveTypeRecord extends AuditFields {
  id: number;
  name: string;
  code: string;
  days_per_year: number;
  max_consecutive_days?: number;
  carry_forward: boolean;
  max_carry_forward?: number;
  requires_approval: boolean;
  is_paid: boolean;
  description?: string;
  is_active: boolean;
}

export interface CreateLeaveTypePayload {
  name: string;
  code: string;
  days_per_year: number;
  max_consecutive_days?: number;
  carry_forward?: boolean;
  max_carry_forward?: number;
  requires_approval?: boolean;
  is_paid?: boolean;
  description?: string;
  is_active?: boolean;
}

export interface UpdateLeaveTypePayload extends Partial<CreateLeaveTypePayload> {}

export interface LeaveTypeFilters extends CommonFilters {
  is_active?: boolean;
  is_paid?: boolean;
}

// ============ LEAVE BALANCES ============

export interface LeaveBalance extends AuditFields {
  id: number;
  employee: number;
  employee_name: string;
  leave_type: number;
  leave_type_name: string;
  year: number;
  allocated: number;
  used: number;
  pending: number;
  remaining: number;
}

export interface CreateLeaveBalancePayload {
  employee: number;
  leave_type: number;
  year: number;
  allocated: number;
}

export interface UpdateLeaveBalancePayload {
  allocated?: number;
  used?: number;
}

export interface LeaveBalanceFilters extends CommonFilters {
  employee?: number;
  leave_type?: number;
  year?: number;
}

// ============ LEAVE REQUESTS ============

export type LeaveRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

export interface LeaveRequest extends AuditFields {
  id: number;
  employee: {
    id: number;
    employee_id: string;
    full_name: string;
  };
  leave_type: {
    id: number;
    name: string;
    code: string;
  };
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: LeaveRequestStatus;
  applied_date: string;
  approved_by?: {
    id: number;
    name: string;
  };
  approved_date?: string;
  rejection_reason?: string;
  remarks?: string;
}

export interface CreateLeaveRequestPayload {
  employee: number;
  leave_type: number;
  start_date: string;
  end_date: string;
  reason: string;
  remarks?: string;
}

export interface UpdateLeaveRequestPayload extends Partial<CreateLeaveRequestPayload> {
  status?: LeaveRequestStatus;
}

export interface ApproveLeaveRequestPayload {
  remarks?: string;
}

export interface RejectLeaveRequestPayload {
  rejection_reason: string;
}

export interface LeaveRequestFilters extends CommonFilters {
  employee?: number;
  leave_type?: number;
  status?: LeaveRequestStatus;
  start_date?: string;
  end_date?: string;
}

// ============ PERFORMANCE REVIEWS ============

export type PerformanceRating = 1 | 2 | 3 | 4 | 5;

export interface PerformanceReviewRecord extends AuditFields {
  id: number;
  employee: {
    id: number;
    employee_id: string;
    full_name: string;
  };
  reviewer: {
    id: number;
    name: string;
  };
  review_period_start: string;
  review_period_end: string;
  rating: PerformanceRating;
  strengths?: string;
  areas_for_improvement?: string;
  goals_achieved?: string;
  goals_next_period?: string;
  comments?: string;
}

export interface CreatePerformanceReviewPayload {
  employee: number;
  reviewer: number;
  review_period_start: string;
  review_period_end: string;
  rating: PerformanceRating;
  strengths?: string;
  areas_for_improvement?: string;
  goals_achieved?: string;
  goals_next_period?: string;
  comments?: string;
}

export interface UpdatePerformanceReviewPayload extends Partial<CreatePerformanceReviewPayload> {}

export interface PerformanceReviewFilters extends CommonFilters {
  employee?: number;
  reviewer?: number;
  rating?: PerformanceRating;
  start_date?: string;
  end_date?: string;
}

// ============ SALARY STRUCTURES ============

export interface SalaryStructure extends AuditFields {
  id: number;
  employee: {
    id: number;
    employee_id: string;
    full_name: string;
  };
  basic_salary: string;
  hra: string;
  special_allowance: string;
  transport_allowance: string;
  other_allowances: string;
  gross_salary: string;
  pf_deduction: string;
  esi_deduction: string;
  professional_tax: string;
  other_deductions: string;
  total_deductions: string;
  net_salary: string;
  effective_from: string;
  is_active: boolean;
}

export interface CreateSalaryStructurePayload {
  employee: number;
  basic_salary: string;
  hra?: string;
  special_allowance?: string;
  transport_allowance?: string;
  other_allowances?: string;
  pf_deduction?: string;
  esi_deduction?: string;
  professional_tax?: string;
  other_deductions?: string;
  effective_from: string;
  is_active?: boolean;
}

export interface UpdateSalaryStructurePayload extends Partial<CreateSalaryStructurePayload> {}

export interface SalaryStructureFilters extends CommonFilters {
  employee?: number;
  is_active?: boolean;
  effective_from?: string;
}

// ============ PAYROLL RECORDS ============

export type PayrollStatus =
  | "draft"
  | "pending"
  | "approved"
  | "paid"
  | "cancelled";

export interface PayrollRecord extends AuditFields {
  id: number;
  employee: {
    id: number;
    employee_id: string;
    full_name: string;
  };
  salary_structure: number;
  month: string;
  year: number;
  working_days: number;
  present_days: number;
  leaves_taken: number;
  overtime_hours: number;
  overtime_pay: string;
  bonuses: string;
  gross_salary: string;
  total_deductions: string;
  net_salary: string;
  status: PayrollStatus;
  payment_date?: string;
  payment_method?: string;
  transaction_reference?: string;
  remarks?: string;
  processed_by?: {
    id: number;
    name: string;
  };
}

export interface CreatePayrollRecordPayload {
  employee: number;
  salary_structure: number;
  month: string;
  year: number;
  working_days: number;
  present_days: number;
  leaves_taken?: number;
  overtime_hours?: number;
  overtime_pay?: string;
  bonuses?: string;
  remarks?: string;
}

export interface UpdatePayrollRecordPayload extends Partial<CreatePayrollRecordPayload> {
  status?: PayrollStatus;
  payment_date?: string;
  payment_method?: string;
  transaction_reference?: string;
}

export interface ApprovePayrollPayload {
  payment_method?: string;
  transaction_reference?: string;
  mark_as_paid?: boolean;
}

export interface PayrollRecordFilters extends CommonFilters {
  employee?: number;
  month?: string;
  year?: number;
  status?: PayrollStatus;
  start_date?: string;
  end_date?: string;
}

// ============ LEGACY TYPES (for backward compatibility) ============

export type SalaryStatus =
  | "draft"
  | "pending"
  | "approved"
  | "paid"
  | "cancelled";

export interface Salary extends AuditFields {
  id: number;
  salary_id: string;
  employee: {
    id: number;
    employee_id: string;
    full_name: string;
    department: Department;
  };
  month: string;
  year: number;
  basic_salary: number;
  allowances: number;
  bonuses: number;
  overtime_pay: number;
  gross_salary: number;
  deductions: number;
  tax_deduction: number;
  net_salary: number;
  working_days: number;
  present_days: number;
  absent_days: number;
  leaves_taken: number;
  status: SalaryStatus;
  payment_date?: string;
  payment_method?: string;
  transaction_reference?: string;
  remarks?: string;
  processed_by?: {
    id: number;
    name: string;
  };
}

// ============ TYPE ALIASES ============
// For backward compatibility with useVendorsEmployees.ts

export type DepartmentRecord = Department;
export type SalaryStructureRecord = SalaryStructure;
export type LeaveBalanceRecord = LeaveBalance;
export type SalaryFilters = PayrollRecordFilters;
export type MarkAttendancePayload = CreateAttendancePayload;
export type ProcessSalaryPayload = CreatePayrollRecordPayload;

export interface UpdateSalaryPayload extends Partial<CreatePayrollRecordPayload> {
  status?: PayrollStatus;
}
