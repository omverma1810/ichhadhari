/**
 * Production - Quality Control Service
 */

import { apiClient } from "@/lib/api/client";
import type {
  QualityControl,
  CreateQualityControlPayload,
  UpdateQualityControlPayload,
  QualityControlFilters,
  PaginatedResponse,
} from "@/types/api";

class QualityControlService {
  private readonly BASE_PATH = "/api/production/quality-control";

  /**
   * Get list of quality control records with optional filters
   */
  async getQualityRecords(
    filters?: QualityControlFilters
  ): Promise<PaginatedResponse<QualityControl>> {
    return apiClient.get<PaginatedResponse<QualityControl>>(
      `${this.BASE_PATH}/`,
      {
        params: filters,
      }
    );
  }

  /**
   * Get a single quality control record by ID
   */
  async getQualityRecord(id: number): Promise<QualityControl> {
    return apiClient.get<QualityControl>(`${this.BASE_PATH}/${id}/`);
  }

  /**
   * Create a new quality control record
   */
  async createQualityRecord(
    data: CreateQualityControlPayload
  ): Promise<QualityControl> {
    return apiClient.post<QualityControl>(`${this.BASE_PATH}/`, data);
  }

  /**
   * Update a quality control record
   */
  async updateQualityRecord(
    id: number,
    data: UpdateQualityControlPayload
  ): Promise<QualityControl> {
    return apiClient.patch<QualityControl>(`${this.BASE_PATH}/${id}/`, data);
  }

  /**
   * Delete a quality control record
   */
  async deleteQualityRecord(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.BASE_PATH}/${id}/`);
  }

  /**
   * Approve quality check
   */
  async approveQualityCheck(id: number): Promise<QualityControl> {
    return apiClient.get<QualityControl>(`${this.BASE_PATH}/${id}/approve/`);
  }

  /**
   * Reject quality check
   */
  async rejectQualityCheck(
    id: number,
    reason?: string
  ): Promise<QualityControl> {
    return apiClient.get<QualityControl>(`${this.BASE_PATH}/${id}/reject/`, {
      params: { reason },
    });
  }
}

// Export singleton instance
export const qualityControlService = new QualityControlService();
export default qualityControlService;
