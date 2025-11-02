/**
 * Leave Balances Service
 * Handles leave balance management operations
 */

import { apiClient } from "@/lib/api/client";
import type {
  LeaveBalance,
  CreateLeaveBalancePayload,
  UpdateLeaveBalancePayload,
  LeaveBalanceFilters,
  PaginatedResponse,
} from "@/types/api";

class LeaveBalancesService {
  private readonly BASE_PATH = "/employees/leave-balances";

  /**
   * Get list of leave balances with optional filters
   */
  async getLeaveBalances(
    filters?: LeaveBalanceFilters
  ): Promise<PaginatedResponse<LeaveBalance>> {
    return apiClient.get<PaginatedResponse<LeaveBalance>>(
      `${this.BASE_PATH}/`,
      {
        params: filters,
      }
    );
  }

  /**
   * Get a single leave balance by ID
   */
  async getLeaveBalance(id: number): Promise<LeaveBalance> {
    return apiClient.get<LeaveBalance>(`${this.BASE_PATH}/${id}/`);
  }

  /**
   * Create a new leave balance
   */
  async createLeaveBalance(
    data: CreateLeaveBalancePayload
  ): Promise<LeaveBalance> {
    return apiClient.post<LeaveBalance>(`${this.BASE_PATH}/`, data);
  }

  /**
   * Update a leave balance
   */
  async updateLeaveBalance(
    id: number,
    data: UpdateLeaveBalancePayload
  ): Promise<LeaveBalance> {
    return apiClient.put<LeaveBalance>(`${this.BASE_PATH}/${id}/`, data);
  }

  /**
   * Delete a leave balance
   */
  async deleteLeaveBalance(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.BASE_PATH}/${id}/`);
  }
}

// Export singleton instance
export const leaveBalancesService = new LeaveBalancesService();
export default leaveBalancesService;
