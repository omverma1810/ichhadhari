/**
 * Production API Types
 */

import { AuditFields, CommonFilters } from "./common";

// ============ PRODUCTS ============

export type ProductCategory = "dairy" | "sweets" | "beverages";
export type UnitType = "kg" | "liter" | "piece" | "pack";

export interface Product extends AuditFields {
  id: number;
  product_id: string;
  name: string;
  category: ProductCategory;
  description?: string;
  unit: UnitType;
  cost_price: number;
  selling_price: number;
  profit_margin: number; // read-only, auto-calculated
  shelf_life_days: number;
  storage_temperature?: string;
  milk_required_per_unit: number;
  is_active: boolean;
  image?: string;
}

export interface CreateProductPayload {
  name: string;
  category: ProductCategory;
  description?: string;
  unit: UnitType;
  cost_price: number;
  selling_price: number;
  shelf_life_days: number;
  storage_temperature?: string;
  milk_required_per_unit: number;
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {
  is_active?: boolean;
}

export interface ProductFilters extends CommonFilters {
  category?: ProductCategory;
  status?: ProductStatus;
  unit?: UnitType;
}

// ============ PRODUCTION BATCHES ============

export type BatchStatus = "planned" | "in_progress" | "completed" | "cancelled";

export interface ProductionBatch extends AuditFields {
  id: number;
  batch_id: string;
  product: number;
  product_name: string; // read-only
  product_id: string; // read-only
  batch_date: string;
  start_time?: string;
  end_time?: string;
  duration_minutes: number; // read-only
  planned_quantity: number;
  actual_quantity: number;
  wastage_quantity: number;
  milk_allocated: number;
  milk_used: number;
  status: BatchStatus;
  quality_check_passed: boolean;
  quality_notes?: string;
  yield_percentage: number; // read-only
  efficiency_score: number; // read-only
  supervisor?: number;
  supervisor_name?: string; // read-only
  operators: number[];
  operator_names: string[]; // read-only
  notes?: string;
  recipe_details?: Record<string, any>;
}

export interface CreateProductionBatchPayload {
  product: number;
  batch_date: string;
  start_time?: string;
  planned_quantity: number;
  milk_allocated: number;
  supervisor?: number;
  operators?: number[];
  notes?: string;
  recipe_details?: Record<string, any>;
}

export interface UpdateProductionBatchPayload
  extends Partial<CreateProductionBatchPayload> {
  end_time?: string;
  actual_quantity?: number;
  wastage_quantity?: number;
  milk_used?: number;
  status?: BatchStatus;
  quality_check_passed?: boolean;
  quality_notes?: string;
}

export interface ProductionBatchFilters extends CommonFilters {
  product?: number;
  batch_date?: string;
  start_date?: string;
  end_date?: string;
  status?: BatchStatus;
  supervisor?: number;
  quality_check_status?: "pending" | "passed" | "failed";
}

export interface ProductionReport {
  summary: {
    total_batches: number;
    completed_batches: number;
    total_quantity: number;
    total_cost: number;
    average_efficiency: number;
  };
  by_product: {
    product: {
      id: number;
      name: string;
      category: ProductCategory;
    };
    batches_count: number;
    quantity_produced: number;
    cost: number;
    percentage: number;
  }[];
  by_status: {
    status: BatchStatus;
    count: number;
    percentage: number;
  }[];
  daily_production: {
    date: string;
    batches_count: number;
    quantity: number;
    cost: number;
  }[];
  period_start: string;
  period_end: string;
}

// ============ QUALITY CONTROL ============

export type QualityCheckType =
  | "incoming_material"
  | "in_process"
  | "finished_product"
  | "storage";
export type QualityCheckStatus =
  | "pending"
  | "passed"
  | "failed"
  | "conditional";

export interface QualityControl extends AuditFields {
  id: number;
  check_id: string;
  check_type: QualityCheckType;
  check_date: string;
  batch?: {
    id: number;
    batch_number: string;
    product_name: string;
  };
  product?: {
    id: number;
    product_id: string;
    name: string;
  };
  status: QualityCheckStatus;
  parameters: {
    parameter_name: string;
    expected_value: string;
    actual_value: string;
    unit?: string;
    passed: boolean;
  }[];
  overall_score: number;
  inspector: {
    id: number;
    name: string;
  };
  remarks?: string;
  corrective_action?: string;
  approved_by?: {
    id: number;
    name: string;
  };
  approved_at?: string;
}

export interface CreateQualityControlPayload {
  check_type: QualityCheckType;
  check_date: string;
  batch?: number;
  product?: number;
  parameters: {
    parameter_name: string;
    expected_value: string;
    actual_value: string;
    unit?: string;
    passed: boolean;
  }[];
  inspector: number;
  remarks?: string;
  corrective_action?: string;
}

export interface UpdateQualityControlPayload
  extends Partial<CreateQualityControlPayload> {
  status?: QualityCheckStatus;
}

export interface QualityControlFilters extends CommonFilters {
  check_type?: QualityCheckType;
  status?: QualityCheckStatus;
  batch?: number;
  product?: number;
  inspector?: number;
  check_date?: string;
  start_date?: string;
  end_date?: string;
}

// ============ PRODUCTION SCHEDULES ============

export type ProductionShift = "morning" | "evening" | "night";

export type ProductionScheduleStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface ProductionSchedule extends AuditFields {
  id: number;
  schedule_id: string;
  product: number;
  product_name: string;
  scheduled_date: string;
  shift: ProductionShift;
  planned_quantity: string;
  raw_milk_required: string;
  status: ProductionScheduleStatus;
  assigned_to: number | null;
  assigned_to_name?: string;
  remarks?: string;
}

export interface CreateProductionSchedulePayload {
  product: number;
  scheduled_date: string;
  shift: ProductionShift;
  planned_quantity: string;
  raw_milk_required?: string;
  assigned_to?: number;
  remarks?: string;
}

export interface UpdateProductionSchedulePayload
  extends Partial<CreateProductionSchedulePayload> {
  status?: ProductionScheduleStatus;
}

export interface ProductionScheduleFilters extends CommonFilters {
  product?: number;
  scheduled_date?: string;
  shift?: ProductionShift;
  status?: ProductionScheduleStatus;
  assigned_to?: number;
  start_date?: string;
  end_date?: string;
}
