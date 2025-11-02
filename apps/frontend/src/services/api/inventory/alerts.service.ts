/**
 * Inventory - Alerts Service
 */

import { apiClient } from "@/lib/api/client";
import type {
  StockAlert,
  CreateStockAlertPayload,
  UpdateStockAlertPayload,
  StockAlertFilters,
  AcknowledgeAlertPayload,
  ResolveAlertPayload,
  PaginatedResponse,
  StockAlertsSummary,
} from "@/types/api";

class AlertsService {
  private readonly BASE_PATH = "/inventory/alerts";

  /**
   * Get list of stock alerts with optional filters
   */
  async getAlerts(
    filters?: StockAlertFilters
  ): Promise<PaginatedResponse<StockAlert>> {
    return apiClient.get<PaginatedResponse<StockAlert>>(`${this.BASE_PATH}/`, {
      params: filters,
    });
  }

  /**
   * Get a single alert by ID
   */
  async getAlert(id: number): Promise<StockAlert> {
    return apiClient.get<StockAlert>(`${this.BASE_PATH}/${id}/`);
  }

  /**
   * Get aggregated stock alert summary buckets
   */
  async getAlertSummary(): Promise<StockAlertsSummary> {
    return apiClient.get<StockAlertsSummary>(`${this.BASE_PATH}/summary/`);
  }

  /**
   * Create a new stock alert
   */
  async createAlert(data: CreateStockAlertPayload): Promise<StockAlert> {
    return apiClient.post<StockAlert>(`${this.BASE_PATH}/`, data);
  }

  /**
   * Update a stock alert
   */
  async updateAlert(
    id: number,
    data: UpdateStockAlertPayload
  ): Promise<StockAlert> {
    return apiClient.patch<StockAlert>(`${this.BASE_PATH}/${id}/`, data);
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(
    id: number,
    data?: AcknowledgeAlertPayload
  ): Promise<StockAlert> {
    return apiClient.post<StockAlert>(
      `${this.BASE_PATH}/${id}/acknowledge/`,
      data
    );
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(
    id: number,
    data: ResolveAlertPayload
  ): Promise<StockAlert> {
    return apiClient.post<StockAlert>(`${this.BASE_PATH}/${id}/resolve/`, data);
  }
}

// Export singleton instance
export const alertsService = new AlertsService();
export default alertsService;
