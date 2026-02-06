import { apiClient } from "./client";

// Common types
export interface PaginationParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  [key: string]: any;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Supplier types
export interface Supplier {
  id: number;
  name: string;
  code: string;
  contact_person?: string;
  phone_number?: string;
  email?: string;
  address?: string;
  status: "active" | "inactive" | "suspended";
  payment_terms?: string;
  bank_account?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SupplierCreateData {
  name: string;
  code: string;
  contact_person?: string;
  phone_number?: string;
  email?: string;
  address?: string;
  status?: "active" | "inactive" | "suspended";
  payment_terms?: string;
  bank_account?: string;
  notes?: string;
}

export interface SupplierStats {
  total_collections: number;
  total_quantity: number;
  total_amount_due: number;
  total_amount_paid: number;
  average_fat: number;
  average_snf: number;
}

// Collection types
export interface MilkCollection {
  id: number;
  supplier: number;
  supplier_name?: string;
  collection_date: string;
  shift: "morning" | "evening";
  quantity: number;
  fat: number;
  snf: number;
  clr: number;
  rate_per_fat: number;
  rate_per_snf: number;
  price_per_liter: number;
  total_amount: number;
  quality_grade: "A" | "B" | "C";
  status: "pending" | "approved" | "rejected";
  notes?: string;
  recorded_by: number;
  recorded_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CollectionCreateData {
  supplier: number;
  collection_date: string;
  shift: "morning" | "evening";
  quantity: number;
  fat: number;
  snf: number;
  clr: number;
  rate_per_fat: number;
  rate_per_snf?: number;
  quality_grade?: "A" | "B" | "C";
  status?: "pending" | "approved" | "rejected";
  notes?: string;
}

export interface CollectionStats {
  total_quantity: number;
  total_amount: number;
  average_fat: number;
  average_snf: number;
  collection_count: number;
}

// Payment types
export interface Payment {
  id: number;
  supplier: number;
  supplier_name?: string;
  payment_date: string;
  amount: number;
  payment_method: "cash" | "bank_transfer" | "cheque" | "upi";
  reference_number?: string;
  notes?: string;
  status: "pending" | "completed" | "cancelled";
  created_by: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentCreateData {
  supplier: number;
  payment_date: string;
  amount: number;
  payment_method: "cash" | "bank_transfer" | "cheque" | "upi";
  reference_number?: string;
  notes?: string;
  status?: "pending" | "completed" | "cancelled";
}

export const milkAPI = {
  // ==================== Suppliers ====================

  /**
   * Get paginated list of suppliers
   */
  getSuppliers: async (
    params?: PaginationParams,
  ): Promise<PaginatedResponse<Supplier>> => {
    return await apiClient.get<PaginatedResponse<Supplier>>(
      "/api/milk/suppliers/",
      { params },
    );
  },

  /**
   * Get single supplier by ID
   */
  getSupplier: async (id: number): Promise<Supplier> => {
    return await apiClient.get<Supplier>(`/api/milk/suppliers/${id}/`);
  },

  /**
   * Create new supplier
   */
  createSupplier: async (data: SupplierCreateData): Promise<Supplier> => {
    return await apiClient.post<Supplier>("/api/milk/suppliers/", data);
  },

  /**
   * Update supplier
   */
  updateSupplier: async (
    id: number,
    data: Partial<SupplierCreateData>,
  ): Promise<Supplier> => {
    return await apiClient.patch<Supplier>(`/api/milk/suppliers/${id}/`, data);
  },

  /**
   * Delete supplier
   */
  deleteSupplier: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/milk/suppliers/${id}/`);
  },

  /**
   * Get supplier statistics
   */
  getSupplierStats: async (
    id: number,
    params?: { start_date?: string; end_date?: string },
  ): Promise<SupplierStats> => {
    return await apiClient.get<SupplierStats>(
      `/api/milk/suppliers/${id}/stats/`,
      {
        params,
      },
    );
  },

  /**
   * Get collections for a specific supplier
   */
  getSupplierCollections: async (
    id: number,
    params?: PaginationParams,
  ): Promise<PaginatedResponse<MilkCollection>> => {
    return await apiClient.get<PaginatedResponse<MilkCollection>>(
      `/api/milk/suppliers/${id}/collections/`,
      { params },
    );
  },

  // ==================== Collections ====================

  /**
   * Get paginated list of milk collections
   */
  getCollections: async (
    params?: PaginationParams,
  ): Promise<PaginatedResponse<MilkCollection>> => {
    return await apiClient.get<PaginatedResponse<MilkCollection>>(
      "/api/milk/collections/",
      { params },
    );
  },

  /**
   * Get single collection by ID
   */
  getCollection: async (id: number): Promise<MilkCollection> => {
    return await apiClient.get<MilkCollection>(`/api/milk/collections/${id}/`);
  },

  /**
   * Create new milk collection
   */
  createCollection: async (
    data: CollectionCreateData,
  ): Promise<MilkCollection> => {
    return await apiClient.post<MilkCollection>("/api/milk/collections/", data);
  },

  /**
   * Update milk collection
   */
  updateCollection: async (
    id: number,
    data: Partial<CollectionCreateData>,
  ): Promise<MilkCollection> => {
    return await apiClient.patch<MilkCollection>(
      `/api/milk/collections/${id}/`,
      data,
    );
  },

  /**
   * Delete milk collection
   */
  deleteCollection: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/milk/collections/${id}/`);
  },

  /**
   * Get collection statistics
   */
  getCollectionStats: async (params?: {
    start_date?: string;
    end_date?: string;
    supplier?: number;
  }): Promise<CollectionStats> => {
    return await apiClient.get<CollectionStats>(
      "/api/milk/collections/stats/",
      {
        params,
      },
    );
  },

  /**
   * Get collections by supplier
   */
  getCollectionsBySupplier: async (
    supplierId: number,
    params?: PaginationParams,
  ): Promise<PaginatedResponse<MilkCollection>> => {
    return await apiClient.get<PaginatedResponse<MilkCollection>>(
      "/api/milk/collections/",
      {
        params: { ...params, supplier: supplierId },
      },
    );
  },

  // ==================== Payments ====================

  /**
   * Get paginated list of payments
   */
  getPayments: async (
    params?: PaginationParams,
  ): Promise<PaginatedResponse<Payment>> => {
    return await apiClient.get<PaginatedResponse<Payment>>(
      "/api/milk/payments/",
      {
        params,
      },
    );
  },

  /**
   * Get single payment by ID
   */
  getPayment: async (id: number): Promise<Payment> => {
    return await apiClient.get<Payment>(`/api/milk/payments/${id}/`);
  },

  /**
   * Create new payment
   */
  createPayment: async (data: PaymentCreateData): Promise<Payment> => {
    return await apiClient.post<Payment>("/api/milk/payments/", data);
  },

  /**
   * Update payment
   */
  updatePayment: async (
    id: number,
    data: Partial<PaymentCreateData>,
  ): Promise<Payment> => {
    return await apiClient.patch<Payment>(`/api/milk/payments/${id}/`, data);
  },

  /**
   * Delete payment
   */
  deletePayment: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/milk/payments/${id}/`);
  },
};
