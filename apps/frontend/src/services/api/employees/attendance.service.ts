/**
 * Attendance Service
 * Handles employee attendance operations
 */

import { apiClient } from "@/lib/api/client";
import type {
  Attendance,
  CreateAttendancePayload,
  UpdateAttendancePayload,
  AttendanceFilters,
  BulkAttendancePayload,
  BulkAttendanceResponse,
  PaginatedResponse,
} from "@/types/api";

class AttendanceService {
  private readonly BASE_PATH = "/employees/attendance";

  /**
   * Get list of attendance records with optional filters
   */
  async getAttendance(
    filters?: AttendanceFilters
  ): Promise<PaginatedResponse<Attendance>> {
    return apiClient.get<PaginatedResponse<Attendance>>(`${this.BASE_PATH}/`, {
      params: filters,
    });
  }

  /**
   * Get a single attendance record by ID
   */
  async getAttendanceRecord(id: number): Promise<Attendance> {
    return apiClient.get<Attendance>(`${this.BASE_PATH}/${id}/`);
  }

  /**
   * Create attendance record
   */
  async createAttendance(data: CreateAttendancePayload): Promise<Attendance> {
    return apiClient.post<Attendance>(`${this.BASE_PATH}/`, data);
  }

  /**
   * Update attendance record
   */
  async updateAttendance(
    id: number,
    data: UpdateAttendancePayload
  ): Promise<Attendance> {
    return apiClient.put<Attendance>(`${this.BASE_PATH}/${id}/`, data);
  }

  /**
   * Delete attendance record
   */
  async deleteAttendance(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.BASE_PATH}/${id}/`);
  }

  /**
   * Mark bulk attendance for multiple employees
   * @param data - Bulk attendance data
   */
  async markBulkAttendance(
    data: BulkAttendancePayload
  ): Promise<BulkAttendanceResponse> {
    return apiClient.post<BulkAttendanceResponse>(
      `${this.BASE_PATH}/mark_bulk/`,
      data
    );
  }
}

// Export singleton instance
export const attendanceService = new AttendanceService();
export default attendanceService;
