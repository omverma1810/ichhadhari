/**
 * Milk Management - Suppliers Service
 */

import { apiClient } from "@/lib/api/client";
import type {
  Supplier,
  CreateSupplierPayload,
  UpdateSupplierPayload,
  SupplierFilters,
  SupplierStats,
  SuppliersByRoute,
  SupplierCollectionSummary,
  SupplierCollectionFilters,
  PaginatedResponse,
} from "@/types/api";

class SuppliersService {
  private readonly BASE_PATH = "/api/milk/suppliers";

  /**
   * Get list of suppliers with optional filters
   */
  async getSuppliers(
    filters?: SupplierFilters
  ): Promise<PaginatedResponse<Supplier>> {
    return apiClient.get<PaginatedResponse<Supplier>>(`${this.BASE_PATH}/`, {
      params: filters,
    });
  }

  /**
   * Get a single supplier by ID
   */
  async getSupplier(id: number): Promise<Supplier> {
    return apiClient.get<Supplier>(`${this.BASE_PATH}/${id}/`);
  }

  /**
   * Create a new supplier
   */
  async createSupplier(data: CreateSupplierPayload): Promise<Supplier> {
    return apiClient.post<Supplier>(`${this.BASE_PATH}/`, data);
  }

  /**
   * Update a supplier
   */
  async updateSupplier(
    id: number,
    data: UpdateSupplierPayload
  ): Promise<Supplier> {
    return apiClient.patch<Supplier>(`${this.BASE_PATH}/${id}/`, data);
  }

  /**
   * Delete a supplier
   */
  async deleteSupplier(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.BASE_PATH}/${id}/`);
  }

  /**
   * Get supplier's collection history
   */
  async getSupplierCollections(
    id: number,
    params?: SupplierCollectionFilters
  ): Promise<SupplierCollectionSummary[]> {
    return apiClient.get<SupplierCollectionSummary[]>(
      `${this.BASE_PATH}/${id}/collections/`,
      { params }
    );
  }

  /**
   * Get supplier statistics
   */
  async getSupplierStats(
    id: number,
    days: number = 30
  ): Promise<SupplierStats> {
    return apiClient.get<SupplierStats>(`${this.BASE_PATH}/${id}/stats/`, {
      params: { days },
    });
  }

  /**
   * Get suppliers grouped by route
   */
  async getSuppliersByRoute(): Promise<SuppliersByRoute[]> {
    return apiClient.get<SuppliersByRoute[]>(`${this.BASE_PATH}/by_route/`);
  }
}

// Export singleton instance
export const suppliersService = new SuppliersService();
export default suppliersService;
