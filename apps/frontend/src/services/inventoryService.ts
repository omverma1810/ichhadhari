import { apiClient, handleApiError } from "@/lib/api-client";
import type {
  PaginatedResponse,
  InventoryItem,
  StockTransaction,
} from "@/types/api";

export const inventoryService = {
  // ==================== INVENTORY ITEMS ====================

  /**
   * Get all inventory items
   */
  getItems: async (params?: {
    page?: number;
    page_size?: number;
    category?: string;
    low_stock?: boolean;
    search?: string;
  }): Promise<PaginatedResponse<InventoryItem>> => {
    try {
      return await apiClient.get<PaginatedResponse<InventoryItem>>(
        "/api/inventory/items/",
        params
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get single item
   */
  getItem: async (id: number): Promise<InventoryItem> => {
    try {
      return await apiClient.get<InventoryItem>(`/api/inventory/items/${id}/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Create inventory item
   */
  createItem: async (data: {
    name: string;
    item_type: string;
    unit: string;
    cost_per_unit: string | number;
    current_stock: string | number;
    min_stock_level: string | number;
    max_stock_level: string | number;
    reorder_point: string | number;
    storage_location?: string;
    storage_temperature?: string;
    description?: string;
    product?: number;
  }): Promise<InventoryItem> => {
    try {
      const formattedData = {
        name: data.name,
        item_type: data.item_type,
        unit: data.unit,
        cost_per_unit: String(data.cost_per_unit),
        current_stock: String(data.current_stock),
        min_stock_level: String(data.min_stock_level),
        max_stock_level: String(data.max_stock_level),
        reorder_point: String(data.reorder_point),
        storage_location: data.storage_location || "",
        storage_temperature: data.storage_temperature || "",
        description: data.description || "",
        is_active: true,
        ...(data.product && { product: data.product }),
      };

      console.log("📤 Creating inventory item:", formattedData);
      const response = await apiClient.post<InventoryItem>(
        "/api/inventory/items/",
        formattedData
      );
      console.log("✅ Inventory item created:", response);
      return response;
    } catch (error) {
      console.error("❌ Failed to create inventory item:", error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Update inventory item
   */
  updateItem: async (
    id: number,
    data: Partial<InventoryItem>
  ): Promise<InventoryItem> => {
    try {
      const formattedData: any = {};
      if (data.name !== undefined) formattedData.name = data.name;
      if (data.item_type !== undefined)
        formattedData.item_type = data.item_type;
      if (data.current_stock !== undefined)
        formattedData.current_stock = String(data.current_stock);
      if (data.min_stock_level !== undefined)
        formattedData.min_stock_level = String(data.min_stock_level);
      if (data.max_stock_level !== undefined)
        formattedData.max_stock_level = String(data.max_stock_level);
      if (data.reorder_point !== undefined)
        formattedData.reorder_point = String(data.reorder_point);
      if (data.cost_per_unit !== undefined)
        formattedData.cost_per_unit = String(data.cost_per_unit);
      if (data.storage_location !== undefined)
        formattedData.storage_location = data.storage_location;
      if (data.storage_temperature !== undefined)
        formattedData.storage_temperature = data.storage_temperature;
      if (data.description !== undefined)
        formattedData.description = data.description;
      if (data.is_active !== undefined)
        formattedData.is_active = data.is_active;
      if (data.product !== undefined) formattedData.product = data.product;

      console.log("📤 Updating inventory item:", formattedData);
      const response = await apiClient.put<InventoryItem>(
        `/api/inventory/items/${id}/`,
        formattedData
      );
      console.log("✅ Inventory item updated:", response);
      return response;
    } catch (error) {
      console.error("❌ Failed to update inventory item:", error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Delete inventory item
   */
  deleteItem: async (id: number): Promise<void> => {
    try {
      console.log("🗑️ Deleting inventory item:", id);
      await apiClient.delete(`/api/inventory/items/${id}/`);
      console.log("✅ Inventory item deleted");
    } catch (error) {
      console.error("❌ Failed to delete inventory item:", error);
      throw new Error(handleApiError(error));
    }
  },

  // ==================== TRANSACTIONS ====================

  /**
   * Get stock transactions
   */
  getTransactions: async (params?: {
    page?: number;
    page_size?: number;
    item?: number;
    transaction_type?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<PaginatedResponse<StockTransaction>> => {
    try {
      return await apiClient.get<PaginatedResponse<StockTransaction>>(
        "/api/inventory/transactions/",
        params
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Create stock transaction
   */
  createTransaction: async (data: {
    item: number;
    transaction_type:
      | "purchase"
      | "production"
      | "sale"
      | "adjustment"
      | "transfer";
    quantity: string | number;
    unit_price: string | number;
    transaction_date: string;
    reference_number?: string;
    notes?: string;
  }): Promise<StockTransaction> => {
    try {
      const formattedData = {
        item: data.item,
        transaction_type: data.transaction_type,
        quantity: String(data.quantity),
        unit_price: String(data.unit_price),
        total_amount: String(
          parseFloat(String(data.quantity)) *
            parseFloat(String(data.unit_price))
        ),
        transaction_date: data.transaction_date,
        reference_number: data.reference_number || "",
        notes: data.notes || "",
      };

      console.log("📤 Creating stock transaction:", formattedData);
      const response = await apiClient.post<StockTransaction>(
        "/api/inventory/transactions/",
        formattedData
      );
      console.log("✅ Stock transaction created:", response);
      return response;
    } catch (error) {
      console.error("❌ Failed to create stock transaction:", error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get stock alerts (low stock items)
   */
  getStockAlerts: async (): Promise<InventoryItem[]> => {
    try {
      return await apiClient.get<InventoryItem[]>(
        "/api/inventory/stock-alerts/"
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
