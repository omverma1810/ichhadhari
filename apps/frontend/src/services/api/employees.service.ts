/**
 * Employees Service
 */

import { apiClient } from "@/lib/api/client";
import type {
  Employee,
  CreateEmployeePayload,
  UpdateEmployeePayload,
  EmployeeFilters,
  Attendance,
  MarkAttendancePayload,
  AttendanceFilters,
  AttendanceSummary,
  Salary,
  ProcessSalaryPayload,
  UpdateSalaryPayload,
  SalaryFilters,
  PaginatedResponse,
  DepartmentRecord,
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
  LeaveTypeRecord,
  CreateLeaveTypePayload,
  UpdateLeaveTypePayload,
  LeaveBalanceRecord,
  LeaveBalanceFilters,
  SalaryStructureRecord,
  CreateSalaryStructurePayload,
  UpdateSalaryStructurePayload,
} from "@/types/api";

class EmployeesService {
  private readonly BASE_PATH = "/employees";

  /**
   * Get list of employees with optional filters
   */
  async getEmployees(
    filters?: EmployeeFilters
  ): Promise<PaginatedResponse<Employee>> {
    return apiClient.get<PaginatedResponse<Employee>>(`${this.BASE_PATH}/`, {
      params: filters,
    });
  }

  /**
   * Get a single employee by ID
   */
  async getEmployee(id: number): Promise<Employee> {
    return apiClient.get<Employee>(`${this.BASE_PATH}/${id}/`);
  }

  /**
   * Create a new employee
   */
  async createEmployee(data: CreateEmployeePayload): Promise<Employee> {
    return apiClient.post<Employee>(`${this.BASE_PATH}/`, data);
  }

  /**
   * Update an employee
   */
  async updateEmployee(
    id: number,
    data: UpdateEmployeePayload
  ): Promise<Employee> {
    return apiClient.put<Employee>(`${this.BASE_PATH}/${id}/`, data);
  }

  /**
   * Delete an employee
   */
  async deleteEmployee(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.BASE_PATH}/${id}/`);
  }

  // ============ ATTENDANCE ============

  /**
   * Get employee attendance records
   */
  async getAttendance(
    id: number,
    filters?: AttendanceFilters
  ): Promise<Attendance[]> {
    return apiClient.get<Attendance[]>(`${this.BASE_PATH}/${id}/attendance/`, {
      params: filters,
    });
  }

  /**
   * Mark employee attendance
   */
  async markAttendance(
    id: number,
    data: MarkAttendancePayload
  ): Promise<Attendance> {
    return apiClient.post<Attendance>(
      `${this.BASE_PATH}/${id}/attendance/`,
      data
    );
  }

  /**
   * Get attendance summary for an employee
   */
  async getAttendanceSummary(
    id: number,
    startDate?: string,
    endDate?: string
  ): Promise<AttendanceSummary> {
    return apiClient.get<AttendanceSummary>(
      `${this.BASE_PATH}/${id}/attendance/summary/`,
      {
        params: { start_date: startDate, end_date: endDate },
      }
    );
  }

  // ============ SALARY ============

  /**
   * Get employee salary records
   */
  async getSalaries(id: number, filters?: SalaryFilters): Promise<Salary[]> {
    return apiClient.get<Salary[]>(`${this.BASE_PATH}/${id}/salary/`, {
      params: filters,
    });
  }

  /**
   * Process employee salary
   */
  async processSalary(id: number, data: ProcessSalaryPayload): Promise<Salary> {
    return apiClient.post<Salary>(`${this.BASE_PATH}/${id}/salary/`, data);
  }

  /**
   * Update salary record
   */
  async updateSalary(
    id: number,
    salaryId: number,
    data: UpdateSalaryPayload
  ): Promise<Salary> {
    return apiClient.patch<Salary>(
      `${this.BASE_PATH}/${id}/salary/${salaryId}/`,
      data
    );
  }

  // ============ DEPARTMENTS ============

  async getDepartments(): Promise<PaginatedResponse<DepartmentRecord>> {
    return apiClient.get<PaginatedResponse<DepartmentRecord>>(
      `${this.BASE_PATH}/departments/`
    );
  }

  async getDepartment(id: number): Promise<DepartmentRecord> {
    return apiClient.get<DepartmentRecord>(
      `${this.BASE_PATH}/departments/${id}/`
    );
  }

  async createDepartment(
    data: CreateDepartmentPayload
  ): Promise<DepartmentRecord> {
    return apiClient.post<DepartmentRecord>(
      `${this.BASE_PATH}/departments/`,
      data
    );
  }

  async updateDepartment(
    id: number,
    data: UpdateDepartmentPayload
  ): Promise<DepartmentRecord> {
    return apiClient.put<DepartmentRecord>(
      `${this.BASE_PATH}/departments/${id}/`,
      data
    );
  }

  async deleteDepartment(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.BASE_PATH}/departments/${id}/`);
  }

  // ============ LEAVE TYPES ============

  async getLeaveTypes(): Promise<PaginatedResponse<LeaveTypeRecord>> {
    return apiClient.get<PaginatedResponse<LeaveTypeRecord>>(
      `${this.BASE_PATH}/leave-types/`
    );
  }

  async createLeaveType(
    data: CreateLeaveTypePayload
  ): Promise<LeaveTypeRecord> {
    return apiClient.post<LeaveTypeRecord>(
      `${this.BASE_PATH}/leave-types/`,
      data
    );
  }

  async updateLeaveType(
    id: number,
    data: UpdateLeaveTypePayload
  ): Promise<LeaveTypeRecord> {
    return apiClient.put<LeaveTypeRecord>(
      `${this.BASE_PATH}/leave-types/${id}/`,
      data
    );
  }

  async deleteLeaveType(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.BASE_PATH}/leave-types/${id}/`);
  }

  // ============ LEAVE BALANCES ============

  async getLeaveBalances(
    params?: LeaveBalanceFilters
  ): Promise<PaginatedResponse<LeaveBalanceRecord>> {
    return apiClient.get<PaginatedResponse<LeaveBalanceRecord>>(
      `${this.BASE_PATH}/leave-balances/`,
      {
        params,
      }
    );
  }

  async getLeaveBalance(id: number): Promise<LeaveBalanceRecord> {
    return apiClient.get<LeaveBalanceRecord>(
      `${this.BASE_PATH}/leave-balances/${id}/`
    );
  }

  // ============ SALARY STRUCTURES ============

  async getSalaryStructures(params?: {
    employee?: number;
  }): Promise<PaginatedResponse<SalaryStructureRecord>> {
    return apiClient.get<PaginatedResponse<SalaryStructureRecord>>(
      `${this.BASE_PATH}/salary-structures/`,
      {
        params,
      }
    );
  }

  async getSalaryStructure(id: number): Promise<SalaryStructureRecord> {
    return apiClient.get<SalaryStructureRecord>(
      `${this.BASE_PATH}/salary-structures/${id}/`
    );
  }

  async createSalaryStructure(
    data: CreateSalaryStructurePayload
  ): Promise<SalaryStructureRecord> {
    return apiClient.post<SalaryStructureRecord>(
      `${this.BASE_PATH}/salary-structures/`,
      data
    );
  }

  async updateSalaryStructure(
    id: number,
    data: UpdateSalaryStructurePayload
  ): Promise<SalaryStructureRecord> {
    return apiClient.put<SalaryStructureRecord>(
      `${this.BASE_PATH}/salary-structures/${id}/`,
      data
    );
  }

  async deleteSalaryStructure(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.BASE_PATH}/salary-structures/${id}/`);
  }
}

// Export singleton instance
export const employeesService = new EmployeesService();
export default employeesService;
