import { apiClient } from "./client";
import type { PaginationParams, PaginatedResponse } from "./milk";

// Product types
export interface Product {
  id: number;
  name: string;
  code: string;
  category: string;
  description?: string;
  unit: string;
  shelf_life_days: number;
  storage_temperature?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductCreateData {
  name: string;
  code: string;
  category: string;
  description?: string;
  unit: string;
  shelf_life_days: number;
  storage_temperature?: number;
  is_active?: boolean;
}

export interface ProductStats {
  total_batches: number;
  total_quantity_produced: number;
  in_progress_batches: number;
  completed_batches: number;
}

// Batch types
export interface ProductionBatch {
  id: number;
  batch_number: string;
  product: number;
  product_name?: string;
  planned_quantity: number;
  actual_quantity?: number;
  status: "planned" | "in_progress" | "completed" | "cancelled";
  start_date?: string;
  end_date?: string;
  completion_date?: string;
  quality_check_passed?: boolean;
  notes?: string;
  supervisor: number;
  supervisor_name?: string;
  created_at: string;
  updated_at: string;
}

export interface BatchCreateData {
  product: number;
  planned_quantity: number;
  start_date?: string;
  end_date?: string;
  notes?: string;
  supervisor: number;
}

export interface BatchStats {
  total_planned_quantity: number;
  total_actual_quantity: number;
  completion_rate: number;
  quality_pass_rate: number;
}

// Schedule types
export interface ProductionSchedule {
  id: number;
  product: number;
  product_name?: string;
  scheduled_date: string;
  shift: "morning" | "afternoon" | "night";
  quantity: number;
  priority: "low" | "medium" | "high" | "urgent";
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  assigned_to?: number;
  assigned_to_name?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ScheduleCreateData {
  product: number;
  scheduled_date: string;
  shift: "morning" | "afternoon" | "night";
  quantity: number;
  priority?: "low" | "medium" | "high" | "urgent";
  assigned_to?: number;
  notes?: string;
}

export const productionAPI = {
  // ==================== Products ====================

  /**
   * Get paginated list of products
   */
  getProducts: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<Product>> => {
    return await apiClient.get<PaginatedResponse<Product>>(
      "/api/production/products/",
      { params }
    );
  },

  /**
   * Get single product by ID
   */
  getProduct: async (id: number): Promise<Product> => {
    return await apiClient.get<Product>(`/api/production/products/${id}/`);
  },

  /**
   * Create new product
   */
  createProduct: async (data: ProductCreateData): Promise<Product> => {
    return await apiClient.post<Product>("/api/production/products/", data);
  },

  /**
   * Update product
   */
  updateProduct: async (
    id: number,
    data: Partial<ProductCreateData>
  ): Promise<Product> => {
    return await apiClient.patch<Product>(`/api/production/products/${id}/`, data);
  },

  /**
   * Delete product
   */
  deleteProduct: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/production/products/${id}/`);
  },

  /**
   * Get product batches
   */
  getProductBatches: async (
    id: number,
    params?: PaginationParams
  ): Promise<PaginatedResponse<ProductionBatch>> => {
    return await apiClient.get<PaginatedResponse<ProductionBatch>>(
      `/api/production/products/${id}/batches/`,
      { params }
    );
  },

  /**
   * Get product statistics
   */
  getProductStats: async (
    id: number,
    params?: { start_date?: string; end_date?: string }
  ): Promise<ProductStats> => {
    return await apiClient.get<ProductStats>(
      `/api/production/products/${id}/stats/`,
      { params }
    );
  },

  // ==================== Batches ====================

  /**
   * Get paginated list of production batches
   */
  getBatches: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<ProductionBatch>> => {
    return await apiClient.get<PaginatedResponse<ProductionBatch>>(
      "/api/production/batches/",
      { params }
    );
  },

  /**
   * Get single batch by ID
   */
  getBatch: async (id: number): Promise<ProductionBatch> => {
    return await apiClient.get<ProductionBatch>(`/api/production/batches/${id}/`);
  },

  /**
   * Create new production batch
   */
  createBatch: async (data: BatchCreateData): Promise<ProductionBatch> => {
    return await apiClient.post<ProductionBatch>("/api/production/batches/", data);
  },

  /**
   * Update production batch
   */
  updateBatch: async (
    id: number,
    data: Partial<BatchCreateData>
  ): Promise<ProductionBatch> => {
    return await apiClient.patch<ProductionBatch>(
      `/api/production/batches/${id}/`,
      data
    );
  },

  /**
   * Delete production batch
   */
  deleteBatch: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/production/batches/${id}/`);
  },

  /**
   * Start a batch
   */
  startBatch: async (id: number): Promise<ProductionBatch> => {
    return await apiClient.post<ProductionBatch>(
      `/api/production/batches/${id}/start/`
    );
  },

  /**
   * Complete a batch
   */
  completeBatch: async (
    id: number,
    actual_quantity: number
  ): Promise<ProductionBatch> => {
    return await apiClient.post<ProductionBatch>(
      `/api/production/batches/${id}/complete/`,
      {
        actual_quantity,
      }
    );
  },

  /**
   * Get batch statistics
   */
  getBatchStats: async (params?: {
    start_date?: string;
    end_date?: string;
    product?: number;
  }): Promise<BatchStats> => {
    return await apiClient.get<BatchStats>("/api/production/batches/stats/", {
      params,
    });
  },

  // ==================== Schedules ====================

  /**
   * Get paginated list of production schedules
   */
  getSchedules: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<ProductionSchedule>> => {
    return await apiClient.get<PaginatedResponse<ProductionSchedule>>(
      "/api/production/schedules/",
      { params }
    );
  },

  /**
   * Get single schedule by ID
   */
  getSchedule: async (id: number): Promise<ProductionSchedule> => {
    return await apiClient.get<ProductionSchedule>(
      `/api/production/schedules/${id}/`
    );
  },

  /**
   * Create new production schedule
   */
  createSchedule: async (
    data: ScheduleCreateData
  ): Promise<ProductionSchedule> => {
    return await apiClient.post<ProductionSchedule>(
      "/api/production/schedules/",
      data
    );
  },

  /**
   * Update production schedule
   */
  updateSchedule: async (
    id: number,
    data: Partial<ScheduleCreateData>
  ): Promise<ProductionSchedule> => {
    return await apiClient.patch<ProductionSchedule>(
      `/api/production/schedules/${id}/`,
      data
    );
  },

  /**
   * Delete production schedule
   */
  deleteSchedule: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/production/schedules/${id}/`);
  },
};
