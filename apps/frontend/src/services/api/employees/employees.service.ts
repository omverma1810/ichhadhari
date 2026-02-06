/**
 * Employees Service
 * Handles employee management operations (with facade for sub-services)
 */

import { apiClient } from "@/lib/api/client";
import type {
  Employee,
  CreateEmployeePayload,
  UpdateEmployeePayload,
  EmployeeFilters,
  AttendanceSummary,
  Attendance,
  PerformanceReview,
  SalaryDetails,
  PaginatedResponse,
  Department,
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
  LeaveTypeRecord,
  CreateLeaveTypePayload,
  UpdateLeaveTypePayload,
  LeaveBalanceRecord,
  SalaryStructureRecord,
  CreateSalaryStructurePayload,
  UpdateSalaryStructurePayload,
  AttendanceFilters,
  SalaryFilters,
  LeaveBalanceFilters,
  MarkAttendancePayload,
  ProcessSalaryPayload,
  UpdateSalaryPayload,
} from "@/types/api";

class EmployeesService {
  private readonly BASE_PATH = "/api/employees/employees";
  private readonly DEPT_PATH = "/api/employees/departments";
  private readonly ATTENDANCE_PATH = "/api/employees/attendance";
  private readonly LEAVE_TYPES_PATH = "/api/employees/leave-types";
  private readonly LEAVE_BALANCES_PATH = "/api/employees/leave-balances";
  private readonly SALARY_STRUCTURES_PATH = "/api/employees/salary-structures";
  private readonly PAYROLL_PATH = "/api/employees/payroll-records";

  // ============ EMPLOYEES ============

  async getEmployees(
    filters?: EmployeeFilters,
  ): Promise<PaginatedResponse<Employee>> {
    return apiClient.get<PaginatedResponse<Employee>>(`${this.BASE_PATH}/`, {
      params: filters,
    });
  }

  async getEmployee(id: number): Promise<Employee> {
    return apiClient.get<Employee>(`${this.BASE_PATH}/${id}/`);
  }

  async createEmployee(data: CreateEmployeePayload): Promise<Employee> {
    return apiClient.post<Employee>(`${this.BASE_PATH}/`, data);
  }

  async updateEmployee(
    id: number,
    data: UpdateEmployeePayload,
  ): Promise<Employee> {
    return apiClient.put<Employee>(`${this.BASE_PATH}/${id}/`, data);
  }

  async deleteEmployee(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.BASE_PATH}/${id}/`);
  }

  // ============ ATTENDANCE ============

  async getAttendance(
    _id?: number,
    filters?: AttendanceFilters,
  ): Promise<PaginatedResponse<Attendance>> {
    return apiClient.get<PaginatedResponse<Attendance>>(
      `${this.ATTENDANCE_PATH}/`,
      { params: { ...filters, employee: _id } },
    );
  }

  async markAttendance(
    _id: number,
    data: MarkAttendancePayload,
  ): Promise<Attendance> {
    return apiClient.post<Attendance>(`${this.ATTENDANCE_PATH}/`, {
      ...data,
      employee: _id,
    });
  }

  async getAttendanceSummary(
    id: number,
    startDate?: string,
    endDate?: string,
  ): Promise<AttendanceSummary> {
    return apiClient.get<AttendanceSummary>(
      `${this.BASE_PATH}/${id}/attendance_summary/`,
      { params: { start_date: startDate, end_date: endDate } },
    );
  }

  // ============ SALARIES / PAYROLL ============

  async getSalaries(
    id: number,
    filters?: SalaryFilters,
  ): Promise<PaginatedResponse<any>> {
    return apiClient.get(`${this.PAYROLL_PATH}/`, {
      params: { ...filters, employee: id },
    });
  }

  async processSalary(id: number, data: ProcessSalaryPayload): Promise<any> {
    return apiClient.post(`${this.PAYROLL_PATH}/`, {
      ...data,
      employee: id,
    });
  }

  async updateSalary(
    _id: number,
    salaryId: number,
    data: UpdateSalaryPayload,
  ): Promise<any> {
    return apiClient.put(`${this.PAYROLL_PATH}/${salaryId}/`, data);
  }

  // ============ DEPARTMENTS ============

  async getDepartments(): Promise<PaginatedResponse<Department>> {
    return apiClient.get<PaginatedResponse<Department>>(`${this.DEPT_PATH}/`);
  }

  async getDepartment(id: number): Promise<Department> {
    return apiClient.get<Department>(`${this.DEPT_PATH}/${id}/`);
  }

  async createDepartment(data: CreateDepartmentPayload): Promise<Department> {
    return apiClient.post<Department>(`${this.DEPT_PATH}/`, data);
  }

  async updateDepartment(
    id: number,
    data: UpdateDepartmentPayload,
  ): Promise<Department> {
    return apiClient.put<Department>(`${this.DEPT_PATH}/${id}/`, data);
  }

  async deleteDepartment(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.DEPT_PATH}/${id}/`);
  }

  // ============ LEAVE TYPES ============

  async getLeaveTypes(): Promise<PaginatedResponse<LeaveTypeRecord>> {
    return apiClient.get<PaginatedResponse<LeaveTypeRecord>>(
      `${this.LEAVE_TYPES_PATH}/`,
    );
  }

  async createLeaveType(
    data: CreateLeaveTypePayload,
  ): Promise<LeaveTypeRecord> {
    return apiClient.post<LeaveTypeRecord>(`${this.LEAVE_TYPES_PATH}/`, data);
  }

  async updateLeaveType(
    id: number,
    data: UpdateLeaveTypePayload,
  ): Promise<LeaveTypeRecord> {
    return apiClient.put<LeaveTypeRecord>(
      `${this.LEAVE_TYPES_PATH}/${id}/`,
      data,
    );
  }

  async deleteLeaveType(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.LEAVE_TYPES_PATH}/${id}/`);
  }

  // ============ LEAVE BALANCES ============

  async getLeaveBalances(
    filters?: LeaveBalanceFilters,
  ): Promise<PaginatedResponse<LeaveBalanceRecord>> {
    return apiClient.get<PaginatedResponse<LeaveBalanceRecord>>(
      `${this.LEAVE_BALANCES_PATH}/`,
      { params: filters },
    );
  }

  async getLeaveBalance(id: number): Promise<LeaveBalanceRecord> {
    return apiClient.get<LeaveBalanceRecord>(
      `${this.LEAVE_BALANCES_PATH}/${id}/`,
    );
  }

  // ============ SALARY STRUCTURES ============

  async getSalaryStructures(params?: {
    employee?: number;
  }): Promise<PaginatedResponse<SalaryStructureRecord>> {
    return apiClient.get<PaginatedResponse<SalaryStructureRecord>>(
      `${this.SALARY_STRUCTURES_PATH}/`,
      { params },
    );
  }

  async getSalaryStructure(id: number): Promise<SalaryStructureRecord> {
    return apiClient.get<SalaryStructureRecord>(
      `${this.SALARY_STRUCTURES_PATH}/${id}/`,
    );
  }

  async createSalaryStructure(
    data: CreateSalaryStructurePayload,
  ): Promise<SalaryStructureRecord> {
    return apiClient.post<SalaryStructureRecord>(
      `${this.SALARY_STRUCTURES_PATH}/`,
      data,
    );
  }

  async updateSalaryStructure(
    id: number,
    data: UpdateSalaryStructurePayload,
  ): Promise<SalaryStructureRecord> {
    return apiClient.put<SalaryStructureRecord>(
      `${this.SALARY_STRUCTURES_PATH}/${id}/`,
      data,
    );
  }

  async deleteSalaryStructure(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.SALARY_STRUCTURES_PATH}/${id}/`);
  }

  // ============ LEGACY / ANALYTICS ============

  async getPerformanceHistory(id: number): Promise<{
    reviews: PerformanceReview[];
    average_ratings: Record<string, number>;
  }> {
    return apiClient.get(`${this.BASE_PATH}/${id}/performance_history/`);
  }

  async getSalaryDetails(id: number): Promise<SalaryDetails> {
    return apiClient.get<SalaryDetails>(
      `${this.BASE_PATH}/${id}/salary_details/`,
    );
  }
}

// Export singleton instance
export const employeesService = new EmployeesService();
export default employeesService;
