/**
 * Inventory - Items Service
 */

import { apiClient } from "@/lib/api/client";
import type {
  InventoryItem,
  CreateInventoryItemPayload,
  UpdateInventoryItemPayload,
  InventoryItemFilters,
  LowStockItem,
  StockLevelSummary,
  TransactionHistory,
  PaginatedResponse,
} from "@/types/api";

class InventoryItemsService {
  private readonly BASE_PATH = "/inventory/items";

  /**
   * Get list of inventory items with optional filters
   */
  async getItems(
    filters?: InventoryItemFilters
  ): Promise<PaginatedResponse<InventoryItem>> {
    return apiClient.get<PaginatedResponse<InventoryItem>>(
      `${this.BASE_PATH}/`,
      {
        params: filters,
      }
    );
  }

  /**
   * Get a single item by ID
   */
  async getItem(id: number): Promise<InventoryItem> {
    return apiClient.get<InventoryItem>(`${this.BASE_PATH}/${id}/`);
  }

  /**
   * Create a new inventory item
   */
  async createItem(data: CreateInventoryItemPayload): Promise<InventoryItem> {
    return apiClient.post<InventoryItem>(`${this.BASE_PATH}/`, data);
  }

  /**
   * Update an inventory item
   */
  async updateItem(
    id: number,
    data: UpdateInventoryItemPayload
  ): Promise<InventoryItem> {
    return apiClient.patch<InventoryItem>(`${this.BASE_PATH}/${id}/`, data);
  }

  /**
   * Delete an inventory item
   */
  async deleteItem(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.BASE_PATH}/${id}/`);
  }

  /**
   * Get low stock items
   */
  async getLowStockItems(): Promise<LowStockItem[]> {
    return apiClient.get<LowStockItem[]>(`${this.BASE_PATH}/low_stock/`);
  }

  /**
   * Get stock level summary
   */
  async getStockLevels(): Promise<StockLevelSummary> {
    return apiClient.get<StockLevelSummary>(`${this.BASE_PATH}/stock_levels/`);
  }

  /**
   * Get transaction history for an item
   * Supports date range filtering
   */
  async getTransactionHistory(
    id: number,
    params?: {
      start_date?: string;
      end_date?: string;
    }
  ): Promise<TransactionHistory> {
    return apiClient.get<TransactionHistory>(
      `${this.BASE_PATH}/${id}/transaction_history/`,
      { params }
    );
  }
}

// Export singleton instance
export const inventoryItemsService = new InventoryItemsService();
export default inventoryItemsService;
