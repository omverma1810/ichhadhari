/**
 * Inventory - Raw Materials Stock Service
 * Read-only service for raw material stock batches
 */

import { apiClient } from "@/lib/api/client";
import type {
  RawMaterialStock,
  RawMaterialStockFilters,
  PaginatedResponse,
} from "@/types/api";

class RawMaterialsService {
  private readonly BASE_PATH = "/api/inventory/raw-materials";

  /**
   * Get list of raw material stock with optional filters
   */
  async getRawMaterials(
    filters?: RawMaterialStockFilters
  ): Promise<PaginatedResponse<RawMaterialStock>> {
    return apiClient.get<PaginatedResponse<RawMaterialStock>>(
      `${this.BASE_PATH}/`,
      {
        params: filters,
      }
    );
  }

  /**
   * Get a single raw material stock record by ID
   */
  async getRawMaterial(id: number): Promise<RawMaterialStock> {
    return apiClient.get<RawMaterialStock>(`${this.BASE_PATH}/${id}/`);
  }
}

// Export singleton instance
export const rawMaterialsService = new RawMaterialsService();
export default rawMaterialsService;
