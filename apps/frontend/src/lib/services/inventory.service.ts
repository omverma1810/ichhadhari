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
  storage_location: string;
  unit_price: number;
  supplier: string;
}

export interface StockTransaction {
  id: number;
  transaction_id: string;
  item: number;
  item_name?: string;
  transaction_type: "inward" | "outward" | "adjustment" | "return" | "wastage";
  quantity: number;
  unit: string;
  reference_type:
    | "purchase"
    | "production"
    | "sale"
    | "quality_rejection"
    | "other";
  reference_id: string;
  transaction_date: string;
  performed_by: number;
  performed_by_name?: string;
  remarks?: string;
  balance_after_transaction: number;
  created_at: string;
  updated_at: string;
}

export interface StockTransactionFormData {
  item: number;
  transaction_type: "inward" | "outward" | "adjustment" | "return" | "wastage";
  quantity: number;
  reference_type:
    | "purchase"
    | "production"
    | "sale"
    | "quality_rejection"
    | "other";
  reference_id: string;
  transaction_date: string;
  performed_by: number;
  remarks?: string;
}

export interface ColdStorage {
  id: number;
  unit_id: string; // Changed from storage_id
  location: string;
  capacity_liters: number;
  current_load_liters: number;
  temperature_celsius: number;
  target_temperature: number; // Added
  humidity_percentage: number;
  status: "operational" | "maintenance" | "offline";
  last_maintenance: string; // Changed from last_maintenance_date
  next_maintenance_due: string;
  assigned_technician: string; // Changed from number to string
  power_backup: boolean; // Changed from power_backup_available
  created_at: string;
  updated_at: string;
}

export interface ColdStorageFormData {
  location: string;
  capacity_liters: number;
  temperature_celsius: number;
  target_temperature: number;
  humidity_percentage: number;
  status: "operational" | "maintenance" | "offline";
  last_maintenance: string;
  next_maintenance_due: string;
  assigned_technician: string;
  power_backup: boolean;
}

export interface InventoryFilters {
  search?: string;
  category?: string;
  status?: string;
  transaction_type?: string;
  storage_status?: string;
  start_date?: string;
  end_date?: string;
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
  updates: Array<{ id: number; current_stock: number }>
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
  data: Partial<StockTransactionFormData>
) => api.patch<StockTransaction>(`/api/inventory/transactions/${id}/`, data);

const deleteTransaction = (id: number) =>
  api.delete<void>(`/api/inventory/transactions/${id}/`);

const getItemTransactionHistory = (itemId: number) =>
  api.get<PaginatedResponse<StockTransaction>>("/api/inventory/transactions/", {
    params: { item: itemId },
  });

// ==================== COLD STORAGE ====================

const getStorages = (filters?: InventoryFilters) =>
  api.get<PaginatedResponse<ColdStorage>>("/api/inventory/cold-storage/", {
    params: filters,
  });

const getStorage = (id: number) =>
  api.get<ColdStorage>(`/api/inventory/cold-storage/${id}/`);

const createStorage = (data: ColdStorageFormData) =>
  api.post<ColdStorage>("/api/inventory/cold-storage/", data);

const updateStorage = (id: number, data: Partial<ColdStorageFormData>) =>
  api.patch<ColdStorage>(`/api/inventory/cold-storage/${id}/`, data);

const deleteStorage = (id: number) =>
  api.delete<void>(`/api/inventory/cold-storage/${id}/`);

const updateTemperature = (id: number, temperature: number, humidity: number) =>
  api.patch<ColdStorage>(`/api/inventory/cold-storage/${id}/`, {
    temperature_celsius: temperature,
    humidity_percentage: humidity,
  });

const getMaintenanceAlerts = () => {
  const today = new Date().toISOString().split("T")[0];
  return api.get<PaginatedResponse<ColdStorage>>(
    "/api/inventory/cold-storage/",
    {
      params: { next_maintenance_due__lte: today },
    }
  );
};

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

  // Cold Storage
  getStorages,
  getStorage,
  createStorage,
  updateStorage,
  deleteStorage,
  updateTemperature,
  getMaintenanceAlerts,
};

export default inventoryService;
