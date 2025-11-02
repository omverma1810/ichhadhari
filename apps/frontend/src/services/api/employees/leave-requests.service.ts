/**
 * Leave Requests Service
 * Handles leave request management and approval workflow
 */

import { apiClient } from "@/lib/api/client";
import type {
  LeaveRequest,
  CreateLeaveRequestPayload,
  UpdateLeaveRequestPayload,
  LeaveRequestFilters,
  RejectLeaveRequestPayload,
  PaginatedResponse,
} from "@/types/api";

class LeaveRequestsService {
  private readonly BASE_PATH = "/employees/leave-requests";

  /**
   * Get list of leave requests with optional filters
   */
  async getLeaveRequests(
    filters?: LeaveRequestFilters
  ): Promise<PaginatedResponse<LeaveRequest>> {
    return apiClient.get<PaginatedResponse<LeaveRequest>>(
      `${this.BASE_PATH}/`,
      {
        params: filters,
      }
    );
  }

  /**
   * Get a single leave request by ID
   */
  async getLeaveRequest(id: number): Promise<LeaveRequest> {
    return apiClient.get<LeaveRequest>(`${this.BASE_PATH}/${id}/`);
  }

  /**
   * Create a new leave request
   */
  async createLeaveRequest(
    data: CreateLeaveRequestPayload
  ): Promise<LeaveRequest> {
    return apiClient.post<LeaveRequest>(`${this.BASE_PATH}/`, data);
  }

  /**
   * Update a leave request
   */
  async updateLeaveRequest(
    id: number,
    data: UpdateLeaveRequestPayload
  ): Promise<LeaveRequest> {
    return apiClient.put<LeaveRequest>(`${this.BASE_PATH}/${id}/`, data);
  }

  /**
   * Delete a leave request
   */
  async deleteLeaveRequest(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.BASE_PATH}/${id}/`);
  }

  /**
   * Approve a leave request
   * @param id - Leave request ID
   */
  async approveLeaveRequest(id: number): Promise<LeaveRequest> {
    return apiClient.post<LeaveRequest>(`${this.BASE_PATH}/${id}/approve/`);
  }

  /**
   * Reject a leave request
   * @param id - Leave request ID
   * @param data - Rejection data with reason
   */
  async rejectLeaveRequest(
    id: number,
    data: RejectLeaveRequestPayload
  ): Promise<LeaveRequest> {
    return apiClient.post<LeaveRequest>(
      `${this.BASE_PATH}/${id}/reject/`,
      data
    );
  }
}

// Export singleton instance
export const leaveRequestsService = new LeaveRequestsService();
export default leaveRequestsService;
