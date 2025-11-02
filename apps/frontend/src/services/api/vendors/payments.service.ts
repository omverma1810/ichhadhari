/**
 * Vendor Payments Service
 * Handles vendor payment operations
 */

import { apiClient } from "@/lib/api/client";
import type {
  VendorPayment,
  CreateVendorPaymentPayload,
  UpdateVendorPaymentPayload,
  VendorPaymentFilters,
  PaginatedResponse,
} from "@/types/api";

class VendorPaymentsService {
  private readonly BASE_PATH = "/vendors/payments";

  /**
   * Get list of vendor payments with optional filters
   */
  async getVendorPayments(
    filters?: VendorPaymentFilters
  ): Promise<PaginatedResponse<VendorPayment>> {
    return apiClient.get<PaginatedResponse<VendorPayment>>(
      `${this.BASE_PATH}/`,
      {
        params: filters,
      }
    );
  }

  /**
   * Get a single vendor payment by ID
   */
  async getVendorPayment(id: number): Promise<VendorPayment> {
    return apiClient.get<VendorPayment>(`${this.BASE_PATH}/${id}/`);
  }

  /**
   * Create a new vendor payment
   */
  async createVendorPayment(
    data: CreateVendorPaymentPayload
  ): Promise<VendorPayment> {
    return apiClient.post<VendorPayment>(`${this.BASE_PATH}/`, data);
  }

  /**
   * Update a vendor payment
   */
  async updateVendorPayment(
    id: number,
    data: UpdateVendorPaymentPayload
  ): Promise<VendorPayment> {
    return apiClient.put<VendorPayment>(`${this.BASE_PATH}/${id}/`, data);
  }

  /**
   * Delete a vendor payment
   */
  async deleteVendorPayment(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.BASE_PATH}/${id}/`);
  }
}

// Export singleton instance
export const vendorPaymentsService = new VendorPaymentsService();
export default vendorPaymentsService;
