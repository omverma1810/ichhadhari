/**
 * Leave Types Service
 * Handles leave type management operations
 */

import { apiClient } from "@/lib/api/client";
import type {
  LeaveTypeRecord,
  CreateLeaveTypePayload,
  UpdateLeaveTypePayload,
  LeaveTypeFilters,
  PaginatedResponse,
} from "@/types/api";

class LeaveTypesService {
  private readonly BASE_PATH = "/api/employees/leave-types";

  /**
   * Get list of leave types with optional filters
   */
  async getLeaveTypes(
    filters?: LeaveTypeFilters
  ): Promise<PaginatedResponse<LeaveTypeRecord>> {
    return apiClient.get<PaginatedResponse<LeaveTypeRecord>>(
      `${this.BASE_PATH}/`,
      {
        params: filters,
      }
    );
  }

  /**
   * Get a single leave type by ID
   */
  async getLeaveType(id: number): Promise<LeaveTypeRecord> {
    return apiClient.get<LeaveTypeRecord>(`${this.BASE_PATH}/${id}/`);
  }

  /**
   * Create a new leave type
   */
  async createLeaveType(
    data: CreateLeaveTypePayload
  ): Promise<LeaveTypeRecord> {
    return apiClient.post<LeaveTypeRecord>(`${this.BASE_PATH}/`, data);
  }

  /**
   * Update an existing leave type
   */
  async updateLeaveType(
    id: number,
    data: UpdateLeaveTypePayload
  ): Promise<LeaveTypeRecord> {
    return apiClient.put<LeaveTypeRecord>(`${this.BASE_PATH}/${id}/`, data);
  }

  /**
   * Delete a leave type
   */
  async deleteLeaveType(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.BASE_PATH}/${id}/`);
  }
}

// Export singleton instance
export const leaveTypesService = new LeaveTypesService();
export default leaveTypesService;
