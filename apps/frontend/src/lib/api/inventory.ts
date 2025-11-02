import { apiClient } from "./client";
import type { PaginationParams, PaginatedResponse } from "./milk";

// Inventory Item types
export interface InventoryItem {
  id: number;
  name: string;
  code: string;
  category: 'raw_material' | 'finished_good' | 'packaging' | 'other';
  unit: string;
  current_quantity: number;
  min_stock_level: number;
  max_stock_level: number;
  reorder_point: number;
  location?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryItemCreateData {
  name: string;
  code: string;
  category: 'raw_material' | 'finished_good' | 'packaging' | 'other';
  unit: string;
  min_stock_level: number;
  max_stock_level: number;
  reorder_point: number;
  location?: string;
  description?: string;
  is_active?: boolean;
}

// Transaction types
export interface InventoryTransaction {
  id: number;
  item: number;
  item_name?: string;
  transaction_type: 'in' | 'out' | 'adjustment';
  quantity: number;
  unit_price?: number;
  total_price?: number;
  reference_type?: string;
  reference_id?: number;
  notes?: string;
  created_by: number;
  created_by_name?: string;
  created_at: string;
}

export interface TransactionCreateData {
  item: number;
  transaction_type: 'in' | 'out' | 'adjustment';
  quantity: number;
  unit_price?: number;
  reference_type?: string;
  reference_id?: number;
  notes?: string;
}

export interface TransactionStats {
  total_in: number;
  total_out: number;
  total_adjustments: number;
  total_value: number;
}

// Alert types
export interface InventoryAlert {
  id: number;
  item: number;
  item_name?: string;
  alert_type: 'low_stock' | 'out_of_stock' | 'expiry' | 'overstock';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  status: 'active' | 'acknowledged' | 'resolved';
  acknowledged_by?: number;
  acknowledged_at?: string;
  resolved_by?: number;
  resolved_at?: string;
  created_at: string;
}

// Raw Material types
export interface RawMaterial {
  id: number;
  name: string;
  code: string;
  unit: string;
  current_stock: number;
  min_stock_level: number;
  max_stock_level: number;
  supplier?: number;
  supplier_name?: string;
  last_purchase_price?: number;
  created_at: string;
  updated_at: string;
}

// Finished Goods types
export interface FinishedGood {
  id: number;
  name: string;
  code: string;
  unit: string;
  current_stock: number;
  min_stock_level: number;
  max_stock_level: number;
  production_cost?: number;
  selling_price?: number;
  shelf_life_days?: number;
  created_at: string;
  updated_at: string;
}

export const inventoryAPI = {
  // ==================== Items ====================

  /**
   * Get paginated list of inventory items
   */
  getItems: async (params?: PaginationParams): Promise<PaginatedResponse<InventoryItem>> => {
    return await apiClient.get<PaginatedResponse<InventoryItem>>("/inventory/items/", { params });
  },

  /**
   * Get single inventory item by ID
   */
  getItem: async (id: number): Promise<InventoryItem> => {
    return await apiClient.get<InventoryItem>(`/inventory/items/${id}/`);
  },

  /**
   * Create new inventory item
   */
  createItem: async (data: InventoryItemCreateData): Promise<InventoryItem> => {
    return await apiClient.post<InventoryItem>("/inventory/items/", data);
  },

  /**
   * Update inventory item
   */
  updateItem: async (id: number, data: Partial<InventoryItemCreateData>): Promise<InventoryItem> => {
    return await apiClient.patch<InventoryItem>(`/inventory/items/${id}/`, data);
  },

  /**
   * Delete inventory item
   */
  deleteItem: async (id: number): Promise<void> => {
    await apiClient.delete(`/inventory/items/${id}/`);
  },

  /**
   * Get low stock items
   */
  getLowStock: async (params?: PaginationParams): Promise<PaginatedResponse<InventoryItem>> => {
    return await apiClient.get<PaginatedResponse<InventoryItem>>("/inventory/items/low-stock/", { params });
  },

  /**
   * Get stock levels summary
   */
  getStockLevels: async (): Promise<{ category: string; count: number; total_value: number }[]> => {
    return await apiClient.get("/inventory/items/stock-levels/");
  },

  /**
   * Get transaction history for an item
   */
  getTransactionHistory: async (id: number, params?: PaginationParams): Promise<PaginatedResponse<InventoryTransaction>> => {
    return await apiClient.get<PaginatedResponse<InventoryTransaction>>(`/inventory/items/${id}/transactions/`, { params });
  },

  // ==================== Transactions ====================

  /**
   * Get paginated list of inventory transactions
   */
  getTransactions: async (params?: PaginationParams): Promise<PaginatedResponse<InventoryTransaction>> => {
    return await apiClient.get<PaginatedResponse<InventoryTransaction>>("/inventory/transactions/", { params });
  },

  /**
   * Get single transaction by ID
   */
  getTransaction: async (id: number): Promise<InventoryTransaction> => {
    return await apiClient.get<InventoryTransaction>(`/inventory/transactions/${id}/`);
  },

  /**
   * Create new inventory transaction
   */
  createTransaction: async (data: TransactionCreateData): Promise<InventoryTransaction> => {
    return await apiClient.post<InventoryTransaction>("/inventory/transactions/", data);
  },

  /**
   * Update inventory transaction
   */
  updateTransaction: async (id: number, data: Partial<TransactionCreateData>): Promise<InventoryTransaction> => {
    return await apiClient.patch<InventoryTransaction>(`/inventory/transactions/${id}/`, data);
  },

  /**
   * Delete inventory transaction
   */
  deleteTransaction: async (id: number): Promise<void> => {
    await apiClient.delete(`/inventory/transactions/${id}/`);
  },

  /**
   * Get transaction statistics
   */
  getStats: async (params?: { start_date?: string; end_date?: string; item?: number }): Promise<TransactionStats> => {
    return await apiClient.get<TransactionStats>("/inventory/transactions/stats/", { params });
  },

  // ==================== Alerts ====================

  /**
   * Get paginated list of inventory alerts
   */
  getAlerts: async (params?: PaginationParams): Promise<PaginatedResponse<InventoryAlert>> => {
    return await apiClient.get<PaginatedResponse<InventoryAlert>>("/inventory/alerts/", { params });
  },

  /**
   * Get single alert by ID
   */
  getAlert: async (id: number): Promise<InventoryAlert> => {
    return await apiClient.get<InventoryAlert>(`/inventory/alerts/${id}/`);
  },

  /**
   * Create new inventory alert
   */
  createAlert: async (data: Partial<InventoryAlert>): Promise<InventoryAlert> => {
    return await apiClient.post<InventoryAlert>("/inventory/alerts/", data);
  },

  /**
   * Update inventory alert
   */
  updateAlert: async (id: number, data: Partial<InventoryAlert>): Promise<InventoryAlert> => {
    return await apiClient.patch<InventoryAlert>(`/inventory/alerts/${id}/`, data);
  },

  /**
   * Delete inventory alert
   */
  deleteAlert: async (id: number): Promise<void> => {
    await apiClient.delete(`/inventory/alerts/${id}/`);
  },

  /**
   * Acknowledge an alert
   */
  acknowledge: async (id: number): Promise<InventoryAlert> => {
    return await apiClient.post<InventoryAlert>(`/inventory/alerts/${id}/acknowledge/`);
  },

  /**
   * Resolve an alert
   */
  resolve: async (id: number): Promise<InventoryAlert> => {
    return await apiClient.post<InventoryAlert>(`/inventory/alerts/${id}/resolve/`);
  },

  // ==================== Raw Materials ====================

  /**
   * Get paginated list of raw materials
   */
  getRawMaterials: async (params?: PaginationParams): Promise<PaginatedResponse<RawMaterial>> => {
    return await apiClient.get<PaginatedResponse<RawMaterial>>("/inventory/raw-materials/", { params });
  },

  /**
   * Get single raw material by ID
   */
  getRawMaterial: async (id: number): Promise<RawMaterial> => {
    return await apiClient.get<RawMaterial>(`/inventory/raw-materials/${id}/`);
  },

  // ==================== Finished Goods ====================

  /**
   * Get paginated list of finished goods
   */
  getFinishedGoods: async (params?: PaginationParams): Promise<PaginatedResponse<FinishedGood>> => {
    return await apiClient.get<PaginatedResponse<FinishedGood>>("/inventory/finished-goods/", { params });
  },

  /**
   * Get single finished good by ID
   */
  getFinishedGood: async (id: number): Promise<FinishedGood> => {
    return await apiClient.get<FinishedGood>(`/inventory/finished-goods/${id}/`);
  },
};
