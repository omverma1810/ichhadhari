/**
 * Departments Service
 * Handles department management operations
 */

import { apiClient } from "@/lib/api/client";
import type {
  Department,
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
  DepartmentFilters,
  PaginatedResponse,
} from "@/types/api";

class DepartmentsService {
  private readonly BASE_PATH = "/employees/departments";

  /**
   * Get list of departments with optional filters
   */
  async getDepartments(
    filters?: DepartmentFilters
  ): Promise<PaginatedResponse<Department>> {
    return apiClient.get<PaginatedResponse<Department>>(`${this.BASE_PATH}/`, {
      params: filters,
    });
  }

  /**
   * Get a single department by ID
   */
  async getDepartment(id: number): Promise<Department> {
    return apiClient.get<Department>(`${this.BASE_PATH}/${id}/`);
  }

  /**
   * Create a new department
   */
  async createDepartment(data: CreateDepartmentPayload): Promise<Department> {
    return apiClient.post<Department>(`${this.BASE_PATH}/`, data);
  }

  /**
   * Update a department
   */
  async updateDepartment(
    id: number,
    data: UpdateDepartmentPayload
  ): Promise<Department> {
    return apiClient.put<Department>(`${this.BASE_PATH}/${id}/`, data);
  }

  /**
   * Delete a department
   */
  async deleteDepartment(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.BASE_PATH}/${id}/`);
  }
}

// Export singleton instance
export const departmentsService = new DepartmentsService();
export default departmentsService;
