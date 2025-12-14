/**
 * Goods Receipt Notes (GRNs) Service
 * Handles goods receipt note operations
 */

import { apiClient } from "@/lib/api/client";
import type {
  GoodsReceiptNote,
  CreateGoodsReceiptNotePayload,
  UpdateGoodsReceiptNotePayload,
  GoodsReceiptNoteFilters,
  PaginatedResponse,
} from "@/types/api";

class GRNsService {
  private readonly BASE_PATH = "/api/vendors/grns";

  /**
   * Get list of GRNs with optional filters
   */
  async getGRNs(
    filters?: GoodsReceiptNoteFilters
  ): Promise<PaginatedResponse<GoodsReceiptNote>> {
    return apiClient.get<PaginatedResponse<GoodsReceiptNote>>(
      `${this.BASE_PATH}/`,
      {
        params: filters,
      }
    );
  }

  /**
   * Get a single GRN by ID
   */
  async getGRN(id: number): Promise<GoodsReceiptNote> {
    return apiClient.get<GoodsReceiptNote>(`${this.BASE_PATH}/${id}/`);
  }

  /**
   * Create a new GRN
   */
  async createGRN(
    data: CreateGoodsReceiptNotePayload
  ): Promise<GoodsReceiptNote> {
    return apiClient.post<GoodsReceiptNote>(`${this.BASE_PATH}/`, data);
  }

  /**
   * Update a GRN
   */
  async updateGRN(
    id: number,
    data: UpdateGoodsReceiptNotePayload
  ): Promise<GoodsReceiptNote> {
    return apiClient.put<GoodsReceiptNote>(`${this.BASE_PATH}/${id}/`, data);
  }

  /**
   * Delete a GRN
   */
  async deleteGRN(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.BASE_PATH}/${id}/`);
  }
}

// Export singleton instance
export const grnsService = new GRNsService();
export default grnsService;
