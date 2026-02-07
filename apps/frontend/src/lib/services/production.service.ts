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
  unit: string; // Alias for unit_of_measurement for compatibility
  cost_price: number; // For purchase order forms
  selling_price?: number; // Optional selling price
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
  batch_id: string;
  product: number;
  product_name?: string;
  product_id?: string;
  batch_date: string;
  planned_quantity: number;
  actual_quantity?: number;
  milk_allocated?: number;
  milk_used?: number;
  status: "planned" | "in_progress" | "completed" | "cancelled";
  yield_percentage?: number;
  supervisor?: number | null;
  supervisor_name?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ProductionBatchFormData {
  product: number;
  batch_date: string;
  planned_quantity: number;
  milk_allocated: number;
  status?: "planned" | "in_progress" | "completed" | "cancelled";
  supervisor?: number;
  notes?: string;
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
  api.get<PaginatedResponse<Product>>("/api/production/products/", {
    params: filters,
  });

const getProduct = (id: number) =>
  api.get<Product>(`/api/production/products/${id}/`);

const createProduct = (data: ProductFormData) =>
  api.post<Product>("/api/production/products/", data);

const updateProduct = (id: number, data: Partial<ProductFormData>) =>
  api.patch<Product>(`/api/production/products/${id}/`, data);

const deleteProduct = (id: number) =>
  api.delete<void>(`/api/production/products/${id}/`);

// ==================== PRODUCTION BATCHES ====================

const getBatches = (filters?: ProductionFilters) =>
  api.get<PaginatedResponse<ProductionBatch>>("/api/production/batches/", {
    params: filters,
  });

const getBatch = (id: number) =>
  api.get<ProductionBatch>(`/api/production/batches/${id}/`);

const createBatch = (data: ProductionBatchFormData) =>
  api.post<ProductionBatch>("/api/production/batches/", data);

const updateBatch = (id: number, data: Partial<ProductionBatchFormData>) =>
  api.patch<ProductionBatch>(`/api/production/batches/${id}/`, data);

const deleteBatch = (id: number) =>
  api.delete<void>(`/api/production/batches/${id}/`);

// ==================== PRODUCTION SCHEDULES ====================

const getSchedules = (filters?: ProductionFilters) =>
  api.get<PaginatedResponse<ProductionSchedule>>("/api/production/schedules/", {
    params: filters,
  });

const getSchedule = (id: number) =>
  api.get<ProductionSchedule>(`/api/production/schedules/${id}/`);

const createSchedule = (data: ProductionScheduleFormData) =>
  api.post<ProductionSchedule>("/api/production/schedules/", data);

const updateSchedule = (
  id: number,
  data: Partial<ProductionScheduleFormData>,
) => api.patch<ProductionSchedule>(`/api/production/schedules/${id}/`, data);

const deleteSchedule = (id: number) =>
  api.delete<void>(`/api/production/schedules/${id}/`);

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
