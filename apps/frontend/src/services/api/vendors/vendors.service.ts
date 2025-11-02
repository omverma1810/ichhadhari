/**
 * Vendors Service
 * Handles vendor management operations
 */

import { apiClient } from "@/lib/api/client";
import type {
  Vendor,
  CreateVendorPayload,
  UpdateVendorPayload,
  VendorFilters,
  VendorStats,
  PurchaseOrder,
  PaginatedResponse,
} from "@/types/api";

class VendorsService {
  private readonly BASE_PATH = "/vendors/vendors";

  /**
   * Get list of vendors with optional filters
   */
  async getVendors(
    filters?: VendorFilters
  ): Promise<PaginatedResponse<Vendor>> {
    return apiClient.get<PaginatedResponse<Vendor>>(`${this.BASE_PATH}/`, {
      params: filters,
    });
  }

  /**
   * Get a single vendor by ID
   */
  async getVendor(id: number): Promise<Vendor> {
    return apiClient.get<Vendor>(`${this.BASE_PATH}/${id}/`);
  }

  /**
   * Create a new vendor
   */
  async createVendor(data: CreateVendorPayload): Promise<Vendor> {
    return apiClient.post<Vendor>(`${this.BASE_PATH}/`, data);
  }

  /**
   * Update a vendor
   */
  async updateVendor(id: number, data: UpdateVendorPayload): Promise<Vendor> {
    return apiClient.patch<Vendor>(`${this.BASE_PATH}/${id}/`, data);
  }

  /**
   * Delete a vendor
   */
  async deleteVendor(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.BASE_PATH}/${id}/`);
  }

  /**
   * Get all purchase orders for a vendor
   * @param id - Vendor ID
   * @param status - Optional status filter
   */
  async getVendorPurchaseOrders(
    id: number,
    status?: string
  ): Promise<{
    vendor: Vendor;
    purchase_orders: PurchaseOrder[];
    count: number;
  }> {
    return apiClient.get<{
      vendor: Vendor;
      purchase_orders: PurchaseOrder[];
      count: number;
    }>(`${this.BASE_PATH}/${id}/purchase_orders/`, {
      params: status ? { status } : undefined,
    });
  }

  /**
   * Get vendor statistics
   * @param id - Vendor ID
   */
  async getVendorStats(id: number): Promise<VendorStats> {
    return apiClient.get<VendorStats>(`${this.BASE_PATH}/${id}/stats/`);
  }
}

// Export singleton instance
export const vendorsService = new VendorsService();
export default vendorsService;
