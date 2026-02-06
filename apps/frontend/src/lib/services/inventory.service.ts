/**
 * Inventory Service
 * Handles all API calls related to inventory items, stock transactions, and cold storage
 */

import api from "@/lib/api/client";

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ==================== INTERFACES ====================

export interface InventoryItem {
  id: number;
  item_code: string;
  name: string;
  category: "raw_material" | "finished_goods" | "packaging" | "consumables";
  current_stock: number;
  unit: string;
  reorder_level: number;
  maximum_stock: number;
  storage_location: string;
  unit_price: number;
  total_value: number;
  last_restocked_date: string;
  supplier: string;
  description?: string;
  status: "in_stock" | "low_stock" | "out_of_stock" | "overstocked";
  created_at: string;
  updated_at: string;
}

export interface InventoryItemFormData {
  name: string;
  category: "raw_material" | "finished_goods" | "packaging" | "consumables";
  current_stock: number;
  unit: string;
  reorder_level: number;
  maximum_stock: number;
  storage_location?: string;
  unit_price: number;
  supplier?: string;
  description?: string;
}

export interface StockTransaction {
  id: number;
  transaction_id: string;
  item: number;
  item_name?: string;
  transaction_type:
    | "purchase"
    | "production"
    | "sale"
    | "wastage"
    | "adjustment"
    | "return"
    | "transfer";
  quantity: number;
  unit?: string;
  is_addition: boolean;
  reference_type?: string;
  reference_id?: string;
  transaction_date: string;
  performed_by?: number;
  performed_by_name?: string;
  remarks?: string;
  notes?: string;
  batch_number?: string;
  expiry_date?: string;
  storage_location?: string;
  from_location?: string;
  to_location?: string;
  cost_per_unit?: number;
  balance_after_transaction: number;
  created_at: string;
  updated_at: string;
}

export interface StockTransactionFormData {
  item: number | string;
  transaction_type:
    | "purchase"
    | "production"
    | "sale"
    | "wastage"
    | "adjustment"
    | "return"
    | "transfer";
  quantity: number;
  is_addition: boolean;
  reference_type?: string;
  reference_id?: string;
  transaction_date?: string;
  performed_by?: number;
  remarks?: string;
  notes?: string;
  batch_number?: string;
  expiry_date?: string;
  storage_location?: string;
  from_location?: string;
  to_location?: string;
  cost_per_unit?: number;
}

export interface InventoryFilters {
  search?: string;
  category?: string;
  status?: string;
  transaction_type?: string;
  storage_status?: string;
  start_date?: string;
  end_date?: string;
  item?: number;
  page?: number;
  page_size?: number;
}

// ==================== INVENTORY ITEMS ====================

const getItems = (filters?: InventoryFilters) =>
  api.get<PaginatedResponse<InventoryItem>>("/api/inventory/items/", {
    params: filters,
  });

const getItem = (id: number) =>
  api.get<InventoryItem>(`/api/inventory/items/${id}/`);

const createItem = (data: InventoryItemFormData) =>
  api.post<InventoryItem>("/api/inventory/items/", data);

const updateItem = (id: number, data: Partial<InventoryItemFormData>) =>
  api.patch<InventoryItem>(`/api/inventory/items/${id}/`, data);

const deleteItem = (id: number) =>
  api.delete<void>(`/api/inventory/items/${id}/`);

// Get low stock items
const getLowStockItems = () =>
  api.get<PaginatedResponse<InventoryItem>>("/api/inventory/items/", {
    params: { status: "low_stock" },
  });

const getOutOfStockItems = () =>
  api.get<PaginatedResponse<InventoryItem>>("/api/inventory/items/", {
    params: { status: "out_of_stock" },
  });

const bulkUpdateStock = (
  updates: Array<{ id: number; current_stock: number }>,
) => api.post("/api/inventory/items/bulk-update/", { updates });

// ==================== STOCK TRANSACTIONS ====================

const getTransactions = (filters?: InventoryFilters) =>
  api.get<PaginatedResponse<StockTransaction>>("/api/inventory/transactions/", {
    params: filters,
  });

const getTransaction = (id: number) =>
  api.get<StockTransaction>(`/api/inventory/transactions/${id}/`);

const createTransaction = (data: StockTransactionFormData) =>
  api.post<StockTransaction>("/api/inventory/transactions/", data);

const updateTransaction = (
  id: number,
  data: Partial<StockTransactionFormData>,
) => api.patch<StockTransaction>(`/api/inventory/transactions/${id}/`, data);

const deleteTransaction = (id: number) =>
  api.delete<void>(`/api/inventory/transactions/${id}/`);

const getItemTransactionHistory = (itemId: number) =>
  api.get<PaginatedResponse<StockTransaction>>("/api/inventory/transactions/", {
    params: { item: itemId },
  });

// ==================== EXPORTS ====================

export const inventoryService = {
  // Items
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  getLowStockItems,
  getOutOfStockItems,
  bulkUpdateStock,

  // Transactions
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getItemTransactionHistory,
};

export default inventoryService;
