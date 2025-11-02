/**
 * Production API Types
 */

import { AuditFields, CommonFilters } from "./common";

// ============ PRODUCTS ============

export type ProductCategory =
  | "milk"
  | "curd"
  | "paneer"
  | "ghee"
  | "butter"
  | "cheese"
  | "ice_cream"
  | "other";
export type ProductStatus = "active" | "inactive" | "discontinued";
export type UnitType = "liters" | "kg" | "grams" | "pieces" | "packets";

export interface Product extends AuditFields {
  id: number;
  product_id: string;
  name: string;
  category: ProductCategory;
  description?: string;
  unit: UnitType;
  standard_quantity: number;
  shelf_life_days: number;
  storage_temperature?: number;
  production_cost: number;
  selling_price: number;
  status: ProductStatus;
  total_batches: number;
  total_quantity_produced: number;
  notes?: string;
}

export interface CreateProductPayload {
  product_id: string;
  name: string;
  category: ProductCategory;
  description?: string;
  unit: UnitType;
  standard_quantity: number;
  shelf_life_days: number;
  storage_temperature?: number;
  production_cost: number;
  selling_price: number;
  notes?: string;
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {
  status?: ProductStatus;
}

export interface ProductFilters extends CommonFilters {
  category?: ProductCategory;
  status?: ProductStatus;
  unit?: UnitType;
}

// ============ PRODUCTION BATCHES ============

export type BatchStatus =
  | "planned"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "on_hold";

export interface ProductionBatch extends AuditFields {
  id: number;
  batch_number: string;
  product: {
    id: number;
    product_id: string;
    name: string;
    unit: UnitType;
  };
  batch_date: string;
  planned_quantity: number;
  actual_quantity: number;
  status: BatchStatus;
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;
  raw_materials_used: {
    material_name: string;
    quantity: number;
    unit: string;
  }[];
  production_cost: number;
  quality_check_status?: "pending" | "passed" | "failed";
  supervisor: {
    id: number;
    name: string;
  };
  notes?: string;
}

export interface CreateProductionBatchPayload {
  product: number;
  batch_date: string;
  planned_quantity: number;
  start_time?: string;
  supervisor: number;
  raw_materials_used?: {
    material_name: string;
    quantity: number;
    unit: string;
  }[];
  notes?: string;
}

export interface UpdateProductionBatchPayload
  extends Partial<CreateProductionBatchPayload> {
  actual_quantity?: number;
  status?: BatchStatus;
  end_time?: string;
  production_cost?: number;
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
