import { apiClient, handleApiError } from '@/lib/api-client';
import type { PaginatedResponse, InventoryItem, StockTransaction } from '@/types/api';

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
        '/api/inventory/items/',
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
    category: string;
    unit: string;
    current_stock: string | number;
    minimum_stock: string | number;
    reorder_level: string | number;
    unit_cost: string | number;
    location?: string;
  }): Promise<InventoryItem> => {
    try {
      const formattedData = {
        name: data.name,
        category: data.category,
        unit: data.unit,
        current_stock: String(data.current_stock),
        minimum_stock: String(data.minimum_stock),
        maximum_stock: String(parseFloat(String(data.minimum_stock)) * 3),
        reorder_level: String(data.reorder_level),
        unit_cost: String(data.unit_cost),
        location: data.location || '',
        is_active: true,
      };

      console.log('📤 Creating inventory item:', formattedData);
      const response = await apiClient.post<InventoryItem>('/api/inventory/items/', formattedData);
      console.log('✅ Inventory item created:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to create inventory item:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Update inventory item
   */
  updateItem: async (id: number, data: Partial<InventoryItem>): Promise<InventoryItem> => {
    try {
      const formattedData: any = {};
      if (data.name !== undefined) formattedData.name = data.name;
      if (data.category !== undefined) formattedData.category = data.category;
      if (data.current_stock !== undefined) formattedData.current_stock = String(data.current_stock);
      if (data.minimum_stock !== undefined) formattedData.minimum_stock = String(data.minimum_stock);
      if (data.unit_cost !== undefined) formattedData.unit_cost = String(data.unit_cost);
      if (data.location !== undefined) formattedData.location = data.location;
      if (data.is_active !== undefined) formattedData.is_active = data.is_active;

      console.log('📤 Updating inventory item:', formattedData);
      const response = await apiClient.put<InventoryItem>(`/api/inventory/items/${id}/`, formattedData);
      console.log('✅ Inventory item updated:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to update inventory item:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Delete inventory item
   */
  deleteItem: async (id: number): Promise<void> => {
    try {
      console.log('🗑️ Deleting inventory item:', id);
      await apiClient.delete(`/api/inventory/items/${id}/`);
      console.log('✅ Inventory item deleted');
    } catch (error) {
      console.error('❌ Failed to delete inventory item:', error);
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
        '/api/inventory/transactions/',
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
    transaction_type: 'purchase' | 'production' | 'sale' | 'adjustment' | 'transfer';
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
        total_amount: String(parseFloat(String(data.quantity)) * parseFloat(String(data.unit_price))),
        transaction_date: data.transaction_date,
        reference_number: data.reference_number || '',
        notes: data.notes || '',
      };

      console.log('📤 Creating stock transaction:', formattedData);
      const response = await apiClient.post<StockTransaction>('/api/inventory/transactions/', formattedData);
      console.log('✅ Stock transaction created:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to create stock transaction:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get stock alerts (low stock items)
   */
  getStockAlerts: async (): Promise<InventoryItem[]> => {
    try {
      return await apiClient.get<InventoryItem[]>('/api/inventory/stock-alerts/');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
