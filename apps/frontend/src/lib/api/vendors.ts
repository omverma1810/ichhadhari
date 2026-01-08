import { apiClient } from "./client";
import type { PaginationParams, PaginatedResponse } from "./milk";

// Vendor types
export interface Vendor {
  id: number;
  name: string;
  code: string;
  vendor_type: "supplier" | "contractor" | "service_provider";
  contact_person?: string;
  phone_number?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  gstin?: string;
  pan?: string;
  payment_terms?: string;
  credit_limit?: number;
  status: "active" | "inactive" | "blocked";
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface VendorCreateData {
  name: string;
  code: string;
  vendor_type: "supplier" | "contractor" | "service_provider";
  contact_person?: string;
  phone_number?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  gstin?: string;
  pan?: string;
  payment_terms?: string;
  credit_limit?: number;
  status?: "active" | "inactive" | "blocked";
  notes?: string;
}

export interface VendorStats {
  total_purchase_orders: number;
  total_amount: number;
  total_paid: number;
  total_pending: number;
  average_delivery_time: number;
}

// Purchase Order types
export interface PurchaseOrder {
  id: number;
  po_number: string;
  vendor: number;
  vendor_name?: string;
  order_date: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  status: "draft" | "sent" | "approved" | "received" | "cancelled";
  total_amount: number;
  tax_amount?: number;
  grand_total: number;
  payment_terms?: string;
  delivery_address?: string;
  notes?: string;
  created_by: number;
  created_by_name?: string;
  approved_by?: number;
  approved_by_name?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface POItem {
  id: number;
  purchase_order: number;
  item: number;
  item_name?: string;
  description?: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
}

export interface POCreateData {
  vendor: number;
  order_date: string;
  expected_delivery_date?: string;
  items: Array<{
    item: number;
    description?: string;
    quantity: number;
    unit: string;
    unit_price: number;
  }>;
  payment_terms?: string;
  delivery_address?: string;
  notes?: string;
}

// Payment types
export interface VendorPayment {
  id: number;
  vendor: number;
  vendor_name?: string;
  purchase_order?: number;
  po_number?: string;
  payment_date: string;
  amount: number;
  payment_method: "cash" | "bank_transfer" | "cheque" | "upi" | "credit_card";
  reference_number?: string;
  notes?: string;
  status: "pending" | "completed" | "cancelled";
  created_by: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface VendorPaymentCreateData {
  vendor: number;
  purchase_order?: number;
  payment_date: string;
  amount: number;
  payment_method: "cash" | "bank_transfer" | "cheque" | "upi" | "credit_card";
  reference_number?: string;
  notes?: string;
  status?: "pending" | "completed" | "cancelled";
}

// GRN types
export interface GoodsReceiptNote {
  id: number;
  grn_number: string;
  purchase_order: number;
  po_number?: string;
  vendor: number;
  vendor_name?: string;
  receipt_date: string;
  status: "pending" | "verified" | "rejected";
  notes?: string;
  received_by: number;
  received_by_name?: string;
  verified_by?: number;
  verified_by_name?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface GRNItem {
  id: number;
  grn: number;
  po_item: number;
  item: number;
  item_name?: string;
  ordered_quantity: number;
  received_quantity: number;
  unit: string;
  status: "accepted" | "rejected" | "partial";
  notes?: string;
}

export interface GRNCreateData {
  purchase_order: number;
  receipt_date: string;
  items: Array<{
    po_item: number;
    received_quantity: number;
    status: "accepted" | "rejected" | "partial";
    notes?: string;
  }>;
  notes?: string;
}

export const vendorsAPI = {
  // ==================== Vendors ====================

  /**
   * Get paginated list of vendors
   */
  getVendors: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<Vendor>> => {
    return await apiClient.get<PaginatedResponse<Vendor>>("/api/vendors/vendors/", {
      params,
    });
  },

  /**
   * Get single vendor by ID
   */
  getVendor: async (id: number): Promise<Vendor> => {
    return await apiClient.get<Vendor>(`/api/vendors/vendors/${id}/`);
  },

  /**
   * Create new vendor
   */
  createVendor: async (data: VendorCreateData): Promise<Vendor> => {
    return await apiClient.post<Vendor>("/api/vendors/vendors/", data);
  },

  /**
   * Update vendor
   */
  updateVendor: async (
    id: number,
    data: Partial<VendorCreateData>
  ): Promise<Vendor> => {
    return await apiClient.patch<Vendor>(`/api/vendors/vendors/${id}/`, data);
  },

  /**
   * Delete vendor
   */
  deleteVendor: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/vendors/vendors/${id}/`);
  },

  /**
   * Get vendor purchase orders
   */
  getVendorPurchaseOrders: async (
    id: number,
    params?: PaginationParams
  ): Promise<PaginatedResponse<PurchaseOrder>> => {
    return await apiClient.get<PaginatedResponse<PurchaseOrder>>(
      `/api/vendors/vendors/${id}/purchase-orders/`,
      { params }
    );
  },

  /**
   * Get vendor statistics
   */
  getVendorStats: async (
    id: number,
    params?: { start_date?: string; end_date?: string }
  ): Promise<VendorStats> => {
    return await apiClient.get<VendorStats>(`/api/vendors/vendors/${id}/stats/`, {
      params,
    });
  },

  // ==================== Purchase Orders ====================

  /**
   * Get paginated list of purchase orders
   */
  getPurchaseOrders: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<PurchaseOrder>> => {
    return await apiClient.get<PaginatedResponse<PurchaseOrder>>(
      "/api/vendors/purchase-orders/",
      { params }
    );
  },

  /**
   * Get single purchase order by ID
   */
  getPurchaseOrder: async (id: number): Promise<PurchaseOrder> => {
    return await apiClient.get<PurchaseOrder>(
      `/api/vendors/purchase-orders/${id}/`
    );
  },

  /**
   * Create new purchase order
   */
  createPurchaseOrder: async (data: POCreateData): Promise<PurchaseOrder> => {
    return await apiClient.post<PurchaseOrder>(
      "/api/vendors/purchase-orders/",
      data
    );
  },

  /**
   * Update purchase order
   */
  updatePurchaseOrder: async (
    id: number,
    data: Partial<POCreateData>
  ): Promise<PurchaseOrder> => {
    return await apiClient.patch<PurchaseOrder>(
      `/api/vendors/purchase-orders/${id}/`,
      data
    );
  },

  /**
   * Delete purchase order
   */
  deletePurchaseOrder: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/vendors/purchase-orders/${id}/`);
  },

  /**
   * Approve purchase order
   */
  approvePurchaseOrder: async (id: number): Promise<PurchaseOrder> => {
    return await apiClient.post<PurchaseOrder>(
      `/api/vendors/purchase-orders/${id}/approve/`
    );
  },

  /**
   * Send purchase order to vendor
   */
  sendPurchaseOrder: async (id: number): Promise<PurchaseOrder> => {
    return await apiClient.post<PurchaseOrder>(
      `/api/vendors/purchase-orders/${id}/send/`
    );
  },

  /**
   * Confirm purchase order receipt
   */
  confirmPurchaseOrder: async (id: number): Promise<PurchaseOrder> => {
    return await apiClient.post<PurchaseOrder>(
      `/api/vendors/purchase-orders/${id}/confirm/`
    );
  },

  /**
   * Get purchase order items
   */
  getPurchaseOrderItems: async (id: number): Promise<POItem[]> => {
    return await apiClient.get<POItem[]>(
      `/api/vendors/purchase-orders/${id}/items/`
    );
  },

  // ==================== Payments ====================

  /**
   * Get paginated list of vendor payments
   */
  getPayments: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<VendorPayment>> => {
    return await apiClient.get<PaginatedResponse<VendorPayment>>(
      "/api/vendors/payments/",
      { params }
    );
  },

  /**
   * Get single payment by ID
   */
  getPayment: async (id: number): Promise<VendorPayment> => {
    return await apiClient.get<VendorPayment>(`/api/vendors/payments/${id}/`);
  },

  /**
   * Create new vendor payment
   */
  createPayment: async (
    data: VendorPaymentCreateData
  ): Promise<VendorPayment> => {
    return await apiClient.post<VendorPayment>("/api/vendors/payments/", data);
  },

  /**
   * Update vendor payment
   */
  updatePayment: async (
    id: number,
    data: Partial<VendorPaymentCreateData>
  ): Promise<VendorPayment> => {
    return await apiClient.patch<VendorPayment>(
      `/api/vendors/payments/${id}/`,
      data
    );
  },

  /**
   * Delete vendor payment
   */
  deletePayment: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/vendors/payments/${id}/`);
  },

  // ==================== GRNs ====================

  /**
   * Get paginated list of goods receipt notes
   */
  getGRNs: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<GoodsReceiptNote>> => {
    return await apiClient.get<PaginatedResponse<GoodsReceiptNote>>(
      "/api/vendors/grns/",
      { params }
    );
  },

  /**
   * Get single GRN by ID
   */
  getGRN: async (id: number): Promise<GoodsReceiptNote> => {
    return await apiClient.get<GoodsReceiptNote>(`/api/vendors/grns/${id}/`);
  },

  /**
   * Create new GRN
   */
  createGRN: async (data: GRNCreateData): Promise<GoodsReceiptNote> => {
    return await apiClient.post<GoodsReceiptNote>("/api/vendors/grns/", data);
  },

  /**
   * Update GRN
   */
  updateGRN: async (
    id: number,
    data: Partial<GRNCreateData>
  ): Promise<GoodsReceiptNote> => {
    return await apiClient.patch<GoodsReceiptNote>(
      `/api/vendors/grns/${id}/`,
      data
    );
  },

  /**
   * Delete GRN
   */
  deleteGRN: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/vendors/grns/${id}/`);
  },

  /**
   * Get GRN items
   */
  getGRNItems: async (id: number): Promise<GRNItem[]> => {
    return await apiClient.get<GRNItem[]>(`/api/vendors/grns/${id}/items/`);
  },
};
