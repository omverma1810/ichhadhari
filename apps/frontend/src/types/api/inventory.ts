/**
 * Inventory API Types
 */

import { AuditFields, CommonFilters } from "./common";

// ============ INVENTORY ITEMS ============

export type ItemType =
  | "raw_milk"
  | "raw_material"
  | "finished_good"
  | "packaging";

export type ItemUnit = "kg" | "liter" | "piece" | "pack" | "bag" | "box";

export interface InventoryItem extends AuditFields {
  id: number;
  item_id: string;
  name: string;
  item_type: ItemType;
  description?: string;
  unit: ItemUnit;
  cost_per_unit: number;
  current_stock: number;
  min_stock_level: number;
  max_stock_level: number;
  reorder_point: number;
  storage_location?: string;
  storage_temperature?: string;
  is_active: boolean;
  product?: number; // OneToOne FK
  product_name?: string; // read-only
  is_below_min_stock: boolean; // read-only
  is_below_reorder_point: boolean; // read-only
}

export interface CreateInventoryItemPayload {
  name: string;
  item_type: ItemType;
  description?: string;
  unit: ItemUnit;
  cost_per_unit: number;
  current_stock: number;
  min_stock_level: number;
  max_stock_level: number;
  reorder_point: number;
  storage_location?: string;
  storage_temperature?: string;
  product?: number;
}

export interface UpdateInventoryItemPayload extends Partial<CreateInventoryItemPayload> {
  is_active?: boolean;
}

export interface InventoryItemFilters extends CommonFilters {
  item_type?: ItemType;
  is_active?: boolean;
  location?: string;
  supplier_name?: string;
}

export interface LowStockItem {
  item: InventoryItem;
  stock_percentage: number;
  quantity_to_reorder: number;
  urgency: "critical" | "high" | "medium" | "low";
  days_until_stockout?: number;
}

export interface StockLevelSummary {
  total_items: number;
  total_value: number;
  by_type: {
    item_type: ItemType;
    count: number;
    total_stock: number;
    total_value: number;
    percentage: number;
  }[];
  stock_status: {
    healthy: number;
    low_stock: number;
    critical: number;
    out_of_stock: number;
  };
  top_value_items: {
    item: {
      id: number;
      name: string;
    };
    stock: number;
    value: number;
  }[];
}

export interface TransactionHistory {
  transactions: StockTransaction[];
  summary: {
    total_transactions: number;
    total_in: number;
    total_out: number;
    net_change: number;
    current_stock: number;
  };
}

// ============ STOCK TRANSACTIONS ============

export type TransactionType =
  | "purchase"
  | "production"
  | "sale"
  | "wastage"
  | "adjustment"
  | "return"
  | "transfer";

export interface StockTransaction extends AuditFields {
  id: number;
  transaction_id: string;
  item: number;
  item_name: string; // read-only
  transaction_type: TransactionType;
  transaction_date: string;
  quantity: number;
  is_addition: boolean; // True for IN, False for OUT
  stock_before: number;
  stock_after: number;
  unit_cost: number;
  total_cost: number;
  reference_type?: string;
  reference_id?: string;
  batch_number?: string;
  expiry_date?: string;
  performed_by?: number;
  performed_by_name?: string; // read-only
  notes?: string;
}

export interface CreateStockTransactionPayload {
  item: number;
  transaction_type: TransactionType;
  transaction_date: string;
  quantity: number;
  is_addition: boolean;
  unit_cost: number;
  reference_type?: string;
  reference_id?: string;
  batch_number?: string;
  expiry_date?: string;
  notes?: string;
}
  reference_type?: string;
  reference_id?: string;
  from_location?: string;
  to_location?: string;
  notes?: string;
}

export interface StockTransactionFilters extends CommonFilters {
  item?: number;
  transaction_type?: TransactionType;
  transaction_date?: string;
  start_date?: string;
  end_date?: string;
  reference_type?: string;
  performed_by?: number;
}

export interface TransactionStats {
  total_transactions: number;
  by_type: {
    transaction_type: TransactionType;
    count: number;
    quantity: number;
    value: number;
    percentage: number;
  }[];
  by_date: {
    date: string;
    transactions: number;
    value: number;
  }[];
  top_items: {
    item: {
      id: number;
      name: string;
    };
    transactions: number;
    quantity: number;
    value: number;
  }[];
  period_start: string;
  period_end: string;
}

// ============ STOCK ALERTS ============

export type StockAlertType =
  | "low_stock"
  | "out_of_stock"
  | "expiring_soon"
  | "expired"
  | "overstocked"
  | "damage";
export type StockAlertStatus =
  | "active"
  | "acknowledged"
  | "resolved"
  | "dismissed";
export type StockAlertSeverity = "low" | "medium" | "high" | "critical";

export interface StockAlert extends AuditFields {
  id: number;
  alert_id: string;
  item: {
    id: number;
    item_id: string;
    name: string;
    current_stock: number;
    minimum_stock: number;
  };
  alert_type: StockAlertType;
  severity: StockAlertSeverity;
  status: StockAlertStatus;
  message: string;
  threshold_value?: number;
  current_value?: number;
  expiry_date?: string;
  acknowledged_at?: string;
  acknowledged_by?: {
    id: number;
    name: string;
  };
  resolved_at?: string;
  resolved_by?: {
    id: number;
    name: string;
  };
  resolution_notes?: string;
}

export interface CreateStockAlertPayload {
  item: number;
  alert_type: StockAlertType;
  severity: StockAlertSeverity;
  message: string;
  threshold_value?: number;
  current_value?: number;
  expiry_date?: string;
}

export interface UpdateStockAlertPayload
  extends Partial<CreateStockAlertPayload> {
  status?: StockAlertStatus;
}

export interface StockAlertFilters extends CommonFilters {
  alert_type?: StockAlertType;
  severity?: StockAlertSeverity;
  status?: StockAlertStatus;
  item?: number;
}

export interface AcknowledgeAlertPayload {
  notes?: string;
}

export interface ResolveAlertPayload {
  resolution_notes: string;
}

// ============ INVENTORY CATALOG EXTENSIONS ============

export interface RawMaterialRecord extends AuditFields {
  id: number;
  item_code: string;
  name: string;
  category: string;
  current_stock: string;
  unit: string;
  reorder_level: string;
  status: string;
}

export interface FinishedGoodRecord extends AuditFields {
  id: number;
  item_code: string;
  product_name: string;
  category: string;
  current_stock: string;
  unit: string;
  expiry_date: string;
  status: string;
}

export interface StockAlertsSummary {
  low_stock_alerts: Array<{
    item_id: number;
    item_name: string;
    current_stock: string;
    reorder_level: string;
    shortage: string;
  }>;
  expiry_alerts: Array<{
    item_id: number;
    item_name: string;
    batch_number: string;
    quantity: string;
    expiry_date: string;
    days_to_expire: number;
  }>;
  out_of_stock_alerts: Array<{
    item_id: number;
    item_name: string;
    last_stock_date: string;
  }>;
}

// ============ RAW MATERIALS & FINISHED GOODS STOCK ============

export interface RawMaterialStock extends AuditFields {
  id: number;
  item: {
    id: number;
    item_id: string;
    name: string;
    unit: string;
  };
  supplier_name: string;
  batch_number: string;
  purchase_date: string;
  expiry_date?: string;
  quantity: number;
  cost_per_unit: number;
  total_cost: number;
  is_active: boolean;
}

export interface RawMaterialStockFilters extends CommonFilters {
  item?: number;
  is_active?: boolean;
  purchase_date?: string;
  supplier_name?: string;
}

export interface FinishedGoodsStock extends AuditFields {
  id: number;
  item: {
    id: number;
    item_id: string;
    name: string;
    unit: string;
  };
  batch: {
    id: number;
    batch_id: string;
    product: {
      id: number;
      name: string;
    };
  };
  quantity: number;
  production_date: string;
  expiry_date: string;
  quality_check_passed: boolean;
  shop_location?: string;
  is_sold: boolean;
}

export interface FinishedGoodsStockFilters extends CommonFilters {
  item?: number;
  batch?: number;
  is_sold?: boolean;
  quality_check_passed?: boolean;
  production_date?: string;
}
