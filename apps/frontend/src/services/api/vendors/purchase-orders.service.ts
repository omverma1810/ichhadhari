/**
 * Purchase Orders Service
 * Handles purchase order management operations
 */

import { apiClient } from "@/lib/api/client";
import type {
  PurchaseOrder,
  CreatePurchaseOrderPayload,
  UpdatePurchaseOrderPayload,
  PurchaseOrderFilters,
  PaginatedResponse,
} from "@/types/api";

class PurchaseOrdersService {
  private readonly BASE_PATH = "/vendors/purchase-orders";

  /**
   * Get list of purchase orders with optional filters
   */
  async getPurchaseOrders(
    filters?: PurchaseOrderFilters
  ): Promise<PaginatedResponse<PurchaseOrder>> {
    return apiClient.get<PaginatedResponse<PurchaseOrder>>(
      `${this.BASE_PATH}/`,
      {
        params: filters,
      }
    );
  }

  /**
   * Get a single purchase order by ID
   */
  async getPurchaseOrder(id: number): Promise<PurchaseOrder> {
    return apiClient.get<PurchaseOrder>(`${this.BASE_PATH}/${id}/`);
  }

  /**
   * Create a new purchase order
   */
  async createPurchaseOrder(
    data: CreatePurchaseOrderPayload
  ): Promise<PurchaseOrder> {
    return apiClient.post<PurchaseOrder>(`${this.BASE_PATH}/`, data);
  }

  /**
   * Update a purchase order
   */
  async updatePurchaseOrder(
    id: number,
    data: UpdatePurchaseOrderPayload
  ): Promise<PurchaseOrder> {
    return apiClient.put<PurchaseOrder>(`${this.BASE_PATH}/${id}/`, data);
  }

  /**
   * Delete a purchase order
   */
  async deletePurchaseOrder(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.BASE_PATH}/${id}/`);
  }

  /**
   * Approve a purchase order
   * @param id - Purchase order ID
   */
  async approvePurchaseOrder(id: number): Promise<PurchaseOrder> {
    return apiClient.post<PurchaseOrder>(`${this.BASE_PATH}/${id}/approve/`);
  }

  /**
   * Mark purchase order as sent to vendor
   * @param id - Purchase order ID
   */
  async sendPurchaseOrder(id: number): Promise<PurchaseOrder> {
    return apiClient.post<PurchaseOrder>(`${this.BASE_PATH}/${id}/send/`);
  }

  /**
   * Confirm purchase order (vendor confirmation received)
   * @param id - Purchase order ID
   */
  async confirmPurchaseOrder(id: number): Promise<PurchaseOrder> {
    return apiClient.post<PurchaseOrder>(`${this.BASE_PATH}/${id}/confirm/`);
  }

  /**
   * Cancel a purchase order
   * @param id - Purchase order ID
   */
  async cancelPurchaseOrder(id: number): Promise<PurchaseOrder> {
    return apiClient.post<PurchaseOrder>(`${this.BASE_PATH}/${id}/cancel/`);
  }
}

// Export singleton instance
export const purchaseOrdersService = new PurchaseOrdersService();
export default purchaseOrdersService;
