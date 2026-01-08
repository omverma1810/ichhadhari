/**
 * Production Service
 * Handles all API calls related to products, production batches, and schedules
 */

import api from "@/lib/api/client";

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ==================== INTERFACES ====================

export interface Product {
  id: number;
  product_code: string;
  name: string;
  category: "milk" | "curd" | "paneer" | "ghee" | "butter" | "cheese" | "other";
  description: string;
  unit_of_measurement: "liters" | "kg" | "grams" | "pieces";
  shelf_life_days: number;
  storage_temperature_min: number;
  storage_temperature_max: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductFormData {
  name: string;
  category: "milk" | "curd" | "paneer" | "ghee" | "butter" | "cheese" | "other";
  description: string;
  unit_of_measurement: "liters" | "kg" | "grams" | "pieces";
  shelf_life_days: number;
  storage_temperature_min: number;
  storage_temperature_max: number;
  is_active?: boolean;
}

export interface ProductionBatch {
  id: number;
  batch_number: string;
  product: number;
  product_name?: string;
  production_date: string;
  quantity_produced: number;
  unit: string;
  raw_material_used: number;
  expiry_date: string;
  batch_status:
    | "in_progress"
    | "completed"
    | "quality_check"
    | "approved"
    | "rejected";
  quality_rating?: number;
  supervisor: number;
  supervisor_name?: string;
  cost_per_unit: number;
  total_cost: number;
  remarks?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductionBatchFormData {
  product: number;
  production_date: string;
  quantity_produced: number;
  raw_material_used: number;
  expiry_date: string;
  supervisor: number;
  cost_per_unit: number;
  batch_status?:
    | "in_progress"
    | "completed"
    | "quality_check"
    | "approved"
    | "rejected";
  quality_rating?: number;
  remarks?: string;
}

export interface ProductionSchedule {
  id: number;
  schedule_id: string;
  product: number;
  product_name?: string;
  scheduled_date: string;
  shift: "morning" | "afternoon" | "night";
  planned_quantity: number;
  assigned_to: number;
  assigned_to_name?: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  estimated_duration_hours: number;
  actual_duration_hours?: number;
  remarks?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductionScheduleFormData {
  product: number;
  scheduled_date: string;
  shift: "morning" | "afternoon" | "night";
  planned_quantity: number;
  assigned_to: number;
  priority: "low" | "medium" | "high" | "urgent";
  estimated_duration_hours: number;
  status?: "scheduled" | "in_progress" | "completed" | "cancelled";
  actual_duration_hours?: number;
  remarks?: string;
}

export interface ProductionFilters {
  search?: string;
  category?: string;
  status?: string;
  batch_status?: string;
  schedule_status?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  page_size?: number;
}

// ==================== PRODUCTS ====================

const getProducts = (filters?: ProductionFilters) =>
  api.get<PaginatedResponse<Product>>("/production/products/", {
    params: filters,
  });

const getProduct = (id: number) =>
  api.get<Product>(`/production/products/${id}/`);

const createProduct = (data: ProductFormData) =>
  api.post<Product>("/production/products/", data);

const updateProduct = (id: number, data: Partial<ProductFormData>) =>
  api.patch<Product>(`/production/products/${id}/`, data);

const deleteProduct = (id: number) =>
  api.delete<void>(`/production/products/${id}/`);

// ==================== PRODUCTION BATCHES ====================

const getBatches = (filters?: ProductionFilters) =>
  api.get<PaginatedResponse<ProductionBatch>>("/production/batches/", {
    params: filters,
  });

const getBatch = (id: number) =>
  api.get<ProductionBatch>(`/production/batches/${id}/`);

const createBatch = (data: ProductionBatchFormData) =>
  api.post<ProductionBatch>("/production/batches/", data);

const updateBatch = (id: number, data: Partial<ProductionBatchFormData>) =>
  api.patch<ProductionBatch>(`/production/batches/${id}/`, data);

const deleteBatch = (id: number) =>
  api.delete<void>(`/production/batches/${id}/`);

// ==================== PRODUCTION SCHEDULES ====================

const getSchedules = (filters?: ProductionFilters) =>
  api.get<PaginatedResponse<ProductionSchedule>>("/production/schedules/", {
    params: filters,
  });

const getSchedule = (id: number) =>
  api.get<ProductionSchedule>(`/production/schedules/${id}/`);

const createSchedule = (data: ProductionScheduleFormData) =>
  api.post<ProductionSchedule>("/production/schedules/", data);

const updateSchedule = (
  id: number,
  data: Partial<ProductionScheduleFormData>
) => api.patch<ProductionSchedule>(`/production/schedules/${id}/`, data);

const deleteSchedule = (id: number) =>
  api.delete<void>(`/production/schedules/${id}/`);

// ==================== EXPORTS ====================

export const productionService = {
  // Products
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,

  // Batches
  getBatches,
  getBatch,
  createBatch,
  updateBatch,
  deleteBatch,

  // Schedules
  getSchedules,
  getSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
};

export default productionService;
