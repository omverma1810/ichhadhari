/**
 * Employees Service
 * Handles employee management operations
 */

import { apiClient } from "@/lib/api/client";
import type {
  Employee,
  CreateEmployeePayload,
  UpdateEmployeePayload,
  EmployeeFilters,
  AttendanceSummary,
  PerformanceReview,
  SalaryDetails,
  PaginatedResponse,
} from "@/types/api";

class EmployeesService {
  private readonly BASE_PATH = "/employees/employees";

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

  /**
   * Get attendance summary for an employee
   * @param id - Employee ID
   * @param month - Month (1-12)
   * @param year - Year (YYYY)
   */
  async getAttendanceSummary(
    id: number,
    month?: number,
    year?: number
  ): Promise<AttendanceSummary> {
    return apiClient.get<AttendanceSummary>(
      `${this.BASE_PATH}/${id}/attendance_summary/`,
      {
        params: { month, year },
      }
    );
  }

  /**
   * Get performance review history for an employee
   * @param id - Employee ID
   */
  async getPerformanceHistory(id: number): Promise<{
    reviews: PerformanceReview[];
    average_ratings: {
      avg_quality: number;
      avg_productivity: number;
      avg_communication: number;
      avg_teamwork: number;
      avg_initiative: number;
      avg_overall: number;
    };
  }> {
    return apiClient.get(`${this.BASE_PATH}/${id}/performance_history/`);
  }

  /**
   * Get salary details for an employee
   * @param id - Employee ID
   */
  async getSalaryDetails(id: number): Promise<SalaryDetails> {
    return apiClient.get<SalaryDetails>(
      `${this.BASE_PATH}/${id}/salary_details/`
    );
  }
}

// Export singleton instance
export const employeesService = new EmployeesService();
export default employeesService;
