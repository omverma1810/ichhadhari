/**
 * Inventory - Finished Goods Stock Service
 * Read-only service for finished goods stock
 */

import { apiClient } from "@/lib/api/client";
import type {
  FinishedGoodsStock,
  FinishedGoodsStockFilters,
  PaginatedResponse,
} from "@/types/api";

class FinishedGoodsService {
  private readonly BASE_PATH = "/api/inventory/finished-goods";

  /**
   * Get list of finished goods stock with optional filters
   */
  async getFinishedGoods(
    filters?: FinishedGoodsStockFilters
  ): Promise<PaginatedResponse<FinishedGoodsStock>> {
    return apiClient.get<PaginatedResponse<FinishedGoodsStock>>(
      `${this.BASE_PATH}/`,
      {
        params: filters,
      }
    );
  }

  /**
   * Get a single finished goods stock record by ID
   */
  async getFinishedGood(id: number): Promise<FinishedGoodsStock> {
    return apiClient.get<FinishedGoodsStock>(`${this.BASE_PATH}/${id}/`);
  }
}

// Export singleton instance
export const finishedGoodsService = new FinishedGoodsService();
export default finishedGoodsService;
