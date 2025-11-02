/**
 * Salary Structures Service
 * Handles salary structure management operations
 */

import { apiClient } from "@/lib/api/client";
import type {
  SalaryStructure,
  CreateSalaryStructurePayload,
  UpdateSalaryStructurePayload,
  SalaryStructureFilters,
  PaginatedResponse,
} from "@/types/api";

class SalaryStructuresService {
  private readonly BASE_PATH = "/employees/salary-structures";

  /**
   * Get list of salary structures with optional filters
   */
  async getSalaryStructures(
    filters?: SalaryStructureFilters
  ): Promise<PaginatedResponse<SalaryStructure>> {
    return apiClient.get<PaginatedResponse<SalaryStructure>>(
      `${this.BASE_PATH}/`,
      {
        params: filters,
      }
    );
  }

  /**
   * Get a single salary structure by ID
   */
  async getSalaryStructure(id: number): Promise<SalaryStructure> {
    return apiClient.get<SalaryStructure>(`${this.BASE_PATH}/${id}/`);
  }

  /**
   * Create a new salary structure
   */
  async createSalaryStructure(
    data: CreateSalaryStructurePayload
  ): Promise<SalaryStructure> {
    return apiClient.post<SalaryStructure>(`${this.BASE_PATH}/`, data);
  }

  /**
   * Update a salary structure
   */
  async updateSalaryStructure(
    id: number,
    data: UpdateSalaryStructurePayload
  ): Promise<SalaryStructure> {
    return apiClient.put<SalaryStructure>(`${this.BASE_PATH}/${id}/`, data);
  }

  /**
   * Delete a salary structure
   */
  async deleteSalaryStructure(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.BASE_PATH}/${id}/`);
  }
}

// Export singleton instance
export const salaryStructuresService = new SalaryStructuresService();
export default salaryStructuresService;
