/**
 * Employee Service
 * Handles all API calls related to employees, attendance, and salary
 */

import api from "@/lib/api/client";

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ==================== INTERFACES ====================

export interface Employee {
  id: number;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  date_of_joining: string;
  designation: string;
  department:
    | "production"
    | "quality"
    | "procurement"
    | "inventory"
    | "sales"
    | "admin";
  role:
    | "admin"
    | "manager"
    | "supervisor"
    | "operator"
    | "technician"
    | "helper";
  salary: number;
  address: string;
  city: string;
  state: string;
  pincode: string;
  emergency_contact: string;
  blood_group?: string;
  aadhar_number?: string;
  pan_number?: string;
  bank_account_number?: string;
  ifsc_code?: string;
  status: "active" | "on_leave" | "resigned" | "terminated";
  profile_image?: string;
  created_at: string;
  updated_at: string;
}

export interface EmployeeFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  date_of_joining: string;
  designation: string;
  department:
    | "production"
    | "quality"
    | "procurement"
    | "inventory"
    | "sales"
    | "admin";
  role:
    | "admin"
    | "manager"
    | "supervisor"
    | "operator"
    | "technician"
    | "helper";
  salary: number;
  address: string;
  city: string;
  state: string;
  pincode: string;
  emergency_contact: string;
  blood_group?: string;
  aadhar_number?: string;
  pan_number?: string;
  bank_account_number?: string;
  ifsc_code?: string;
  status?: "active" | "on_leave" | "resigned" | "terminated";
}

export interface Attendance {
  id: number;
  employee: number;
  employee_name?: string;
  date: string;
  check_in_time: string;
  check_out_time?: string;
  total_hours?: number;
  status: "present" | "absent" | "half_day" | "on_leave" | "holiday";
  shift: "morning" | "afternoon" | "night";
  remarks?: string;
  created_at: string;
  updated_at: string;
}

export interface AttendanceFormData {
  employee: number;
  date: string;
  check_in_time: string;
  check_out_time?: string;
  status: "present" | "absent" | "half_day" | "on_leave" | "holiday";
  shift: "morning" | "afternoon" | "night";
  remarks?: string;
}

export interface Salary {
  id: number;
  salary_id: string;
  employee: number;
  employee_name?: string;
  month: string;
  year: number;
  basic_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  payment_date?: string;
  payment_status: "pending" | "paid" | "on_hold";
  days_present: number;
  days_absent: number;
  overtime_hours: number;
  bonus: number;
  processed_by: number;
  processed_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface SalaryFormData {
  employee: number;
  month: string;
  year: number;
  basic_salary: number;
  allowances: number;
  deductions: number;
  days_present: number;
  days_absent: number;
  overtime_hours: number;
  bonus: number;
  payment_status?: "pending" | "paid" | "on_hold";
  payment_date?: string;
}

export interface EmployeeFilters {
  search?: string;
  department?: string;
  role?: string;
  status?: string;
  attendance_status?: string;
  payment_status?: string;
  month?: string;
  year?: number;
  start_date?: string;
  end_date?: string;
  page?: number;
  page_size?: number;
}

// ==================== EMPLOYEES ====================

const getEmployees = (filters?: EmployeeFilters) =>
  api.get<PaginatedResponse<Employee>>("/api/employees/", {
    params: filters,
  });

const getEmployee = (id: number) => api.get<Employee>(`/api/employees/${id}/`);

const createEmployee = (data: EmployeeFormData) =>
  api.post<Employee>("/api/employees/", data);

const updateEmployee = (id: number, data: Partial<EmployeeFormData>) =>
  api.patch<Employee>(`/api/employees/${id}/`, data);

const deleteEmployee = (id: number) =>
  api.delete<void>(`/api/employees/${id}/`);

// Upload profile image
const uploadProfileImage = (id: number, file: File) => {
  const formData = new FormData();
  formData.append("profile_image", file);
  return api.patch<Employee>(`/api/employees/${id}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// ==================== ATTENDANCE ====================

const getAttendance = (filters?: EmployeeFilters) =>
  api.get<PaginatedResponse<Attendance>>("/api/employees/attendance/", {
    params: filters,
  });

const getAttendanceRecord = (id: number) =>
  api.get<Attendance>(`/api/employees/attendance/${id}/`);

const createAttendance = (data: AttendanceFormData) =>
  api.post<Attendance>("/api/employees/attendance/", data);

const updateAttendance = (id: number, data: Partial<AttendanceFormData>) =>
  api.patch<Attendance>(`/api/employees/attendance/${id}/`, data);

const deleteAttendance = (id: number) =>
  api.delete<void>(`/api/employees/attendance/${id}/`);

// Mark attendance (bulk operation)
const markAttendance = (data: AttendanceFormData[]) =>
  api.post<Attendance[]>("/api/employees/attendance/bulk/", data);

// ==================== SALARY ====================

const getSalaries = (filters?: EmployeeFilters) =>
  api.get<PaginatedResponse<Salary>>("/api/employees/salaries/", {
    params: filters,
  });

const getSalary = (id: number) =>
  api.get<Salary>(`/api/employees/salaries/${id}/`);

const createSalary = (data: SalaryFormData) =>
  api.post<Salary>("/api/employees/salaries/", data);

const updateSalary = (id: number, data: Partial<SalaryFormData>) =>
  api.patch<Salary>(`/api/employees/salaries/${id}/`, data);

const deleteSalary = (id: number) =>
  api.delete<void>(`/api/employees/salaries/${id}/`);

// Process salary
const processSalary = (id: number) =>
  api.post<Salary>(`/api/employees/salaries/${id}/process/`);

// Generate payslip
const generatePayslip = (id: number) =>
  api.get<Blob>(`/api/employees/salaries/${id}/payslip/`, {
    responseType: "blob",
  });

// ==================== EXPORTS ====================

export const employeeService = {
  // Employees
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  uploadProfileImage,

  // Attendance
  getAttendance,
  getAttendanceRecord,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  markAttendance,

  // Salary
  getSalaries,
  getSalary,
  createSalary,
  updateSalary,
  deleteSalary,
  processSalary,
  generatePayslip,
};

export default employeeService;
