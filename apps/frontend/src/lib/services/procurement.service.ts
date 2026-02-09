/**
 * Procurement Service
 * Handles all API calls related to vendors, milk collections, and quality tests
 */

import api from "@/lib/api/client";

// ==================== INTERFACES ====================

export interface Vendor {
  id: number;
  vendor_id: string;
  company_name: string;
  category: string;
  status: "active" | "inactive" | "suspended";
  contact_person: string;
  phone: string;
  alternate_phone?: string;
  email: string;
  website?: string;
  billing_address?: string;
  shipping_address?: string;
  gst_number?: string;
  pan_number?: string;
  company_registration_number?: string;
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
  account_holder_name?: string;
  credit_period_days?: number;
  credit_limit?: string;
  payment_method?: string;
  discount_percentage?: string;
  rating?: number;
  total_purchases?: string;
  total_payments?: string;
  outstanding_balance?: string;
  documents?: any;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface VendorFormData {
  company_name: string;
  category: string;
  contact_person: string;
  phone: string;
  alternate_phone?: string;
  email: string;
  website?: string;
  billing_address?: string;
  shipping_address?: string;
  gst_number?: string;
  pan_number?: string;
  company_registration_number?: string;
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
  account_holder_name?: string;
  credit_period_days?: number;
  credit_limit?: number;
  payment_method?: string;
  discount_percentage?: number;
  status?: "active" | "inactive" | "suspended";
  notes?: string;
}

export interface MilkCollection {
  id: number;
  collection_id: string;
  vendor: Vendor;
  collection_date: string;
  shift: "morning" | "evening";
  milk_type: "cow" | "buffalo" | "mixed";
  quantity_liters: number;
  fat: number;
  snf: number;
  clr: number;
  rate_per_fat: number;
  rate_per_snf: number;
  price_per_liter: number;
  total_amount: number;
  quality_status: "pending" | "approved" | "rejected";
  payment_status: "pending" | "paid" | "cancelled";
  collected_by?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  created_at: string;
  updated_at: string;
}

export interface MilkCollectionFormData {
  vendor: number;
  collection_date: string;
  shift: "morning" | "evening";
  milk_type: "cow" | "buffalo" | "mixed";
  quantity_liters: number;
  fat: number;
  snf: number;
  clr: number;
  rate_per_fat: number;
  rate_per_snf: number;
}

export interface QualityTest {
  id: number;
  test_id: string;
  collection: number;
  test_type: "standard" | "detailed";
  fat_percentage: number;
  snf_percentage: number;
  protein_percentage?: number;
  lactose_percentage?: number;
  water_content?: number;
  acidity?: number;
  temperature: number;
  smell_test: "pass" | "fail";
  taste_test: "pass" | "fail";
  alcohol_test: "pass" | "fail";
  clot_on_boiling_test: "pass" | "fail";
  overall_result: "pass" | "fail";
  tested_by?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  tested_at: string;
  remarks?: string;
}

export interface QualityTestFormData {
  collection: number;
  test_type: "standard" | "detailed";
  fat_percentage: number;
  snf_percentage: number;
  protein_percentage?: number;
  lactose_percentage?: number;
  water_content?: number;
  acidity?: number;
  temperature: number;
  smell_test: "pass" | "fail";
  taste_test: "pass" | "fail";
  alcohol_test: "pass" | "fail";
  clot_on_boiling_test: "pass" | "fail";
}

export interface VendorPayment {
  id: number;
  payment_id: string;
  vendor: number;
  vendor_name?: string;
  payment_date: string;
  amount: number;
  payment_method: "cash" | "bank_transfer" | "upi" | "cheque";
  status: "pending" | "completed" | "failed";
  is_advance: boolean;
  transaction_reference?: string;
  upi_transaction_id?: string;
  cheque_number?: string;
  processed_by?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  notes?: string;
  generated_invoice?: {
    id: number;
    invoice_number: string;
    invoice_date: string;
    total_amount: string;
    amount_paid: string;
    status: string;
    payment_status: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface VendorPaymentFormData {
  vendor: number;
  payment_date: string;
  amount: number;
  payment_method: "cash" | "bank_transfer" | "upi" | "cheque";
  status?: "pending" | "completed" | "failed";
  is_advance?: boolean;
  transaction_reference?: string;
  upi_transaction_id?: string;
  cheque_number?: string;
  notes?: string;
}

export interface PurchaseOrder {
  id: number;
  po_number: string;
  vendor: number;
  vendor_name?: string;
  po_date: string;
  expected_delivery_date: string;
  actual_delivery_date?: string;
  status:
    | "draft"
    | "pending_approval"
    | "approved"
    | "sent"
    | "confirmed"
    | "partially_received"
    | "fully_received"
    | "cancelled";
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  delivery_address: string;
  shipping_method?: string;
  tracking_number?: string;
  terms_and_conditions?: string;
  notes?: string;
  is_recurring: boolean;
  recurrence_frequency?: "daily" | "weekly" | "monthly";
  items?: PurchaseOrderItem[];
  invoices?: PurchaseOrderInvoiceSummary[];
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderInvoiceSummary {
  id: number;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  payment_status: "unpaid" | "partially_paid" | "paid";
  total_amount: string;
  amount_paid: string;
  amount_due: string;
}

export interface PurchaseOrderFormData {
  vendor: number;
  po_date: string;
  expected_delivery_date: string;
  delivery_address: string;
  shipping_method?: string;
  terms_and_conditions?: string;
  notes?: string;
  is_recurring?: boolean;
  recurrence_frequency?: "daily" | "weekly" | "monthly";
  items: PurchaseOrderItemFormData[];
}

export interface PurchaseOrderItem {
  id: number;
  purchase_order: number;
  item_name: string;
  description?: string;
  quantity: number;
  unit: string;
  unit_price: number;
  tax_percentage: number;
  discount_percentage: number;
  line_total: number;
  quantity_received: number;
  inventory_item?: number;
  inventory_item_name?: string;
}

export interface PurchaseOrderItemFormData {
  item_name: string;
  description?: string;
  quantity: number;
  unit: string;
  unit_price: number;
  tax_percentage?: number;
  discount_percentage?: number;
  inventory_item?: number;
}

export interface GoodsReceiptNote {
  id: number;
  grn_number: string;
  purchase_order: number;
  purchase_order_number?: string;
  vendor?: number;
  vendor_name?: string;
  receipt_date: string;
  received_by?: number;
  received_by_name?: string;
  quality_status: "approved" | "rejected" | "partial";
  quality_notes?: string;
  quality_checked_by?: number;
  quality_checked_by_name?: string;
  vehicle_number?: string;
  driver_name?: string;
  driver_phone?: string;
  receipt_timestamp?: string;
  delivery_challan_number?: string;
  invoice_number?: string;
  notes?: string;
  items: GRNItem[];
  created_at: string;
  updated_at: string;
}

export interface GRNItem {
  id: number;
  grn: number;
  po_item: number;
  item_name?: string;
  unit?: string;
  ordered_quantity: number;
  received_quantity: number;
  accepted_quantity: number;
  rejected_quantity: number;
  quality_check_passed: boolean;
  rejection_reason?: string;
  batch_number?: string;
  expiry_date?: string;
}

export interface GoodsReceiptNoteFormData {
  purchase_order: number;
  receipt_date: string;
  quality_status: "approved" | "rejected" | "partial";
  quality_notes?: string;
  vehicle_number?: string;
  driver_name?: string;
  driver_phone?: string;
  receipt_timestamp?: string;
  delivery_challan_number?: string;
  invoice_number?: string;
  notes?: string;
  items: GRNItemFormData[];
}

export interface GRNItemFormData {
  po_item: number;
  ordered_quantity: number;
  received_quantity: number;
  accepted_quantity: number;
  rejected_quantity: number;
  quality_check_passed: boolean;
  rejection_reason?: string;
  batch_number?: string;
  expiry_date?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ==================== VENDOR SERVICES ====================

export const procurementService = {
  // Vendors
  getVendors: (params?: {
    page?: number;
    search?: string;
    status?: string;
    milk_type?: string;
  }): Promise<PaginatedResponse<Vendor>> =>
    api.get<PaginatedResponse<Vendor>>("/api/vendors/vendors/", { params }),

  getVendor: (id: number): Promise<Vendor> =>
    api.get<Vendor>(`/api/vendors/vendors/${id}/`),

  createVendor: (data: VendorFormData): Promise<Vendor> =>
    api.post<Vendor>("/api/vendors/vendors/", data),

  updateVendor: (id: number, data: Partial<VendorFormData>): Promise<Vendor> =>
    api.patch<Vendor>(`/api/vendors/vendors/${id}/`, data),

  deleteVendor: (id: number): Promise<void> =>
    api.delete<void>(`/api/vendors/vendors/${id}/`),

  // Milk Collections
  getMilkCollections: async (params?: {
    page?: number;
    search?: string;
    vendor?: number;
    quality_status?: string;
    payment_status?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<PaginatedResponse<MilkCollection>> =>
    api.get<PaginatedResponse<MilkCollection>>("/api/milk/collections/", {
      params,
    }),

  getMilkCollection: (id: number): Promise<MilkCollection> =>
    api.get<MilkCollection>(`/api/milk/collections/${id}/`),

  createMilkCollection: (
    data: MilkCollectionFormData,
  ): Promise<MilkCollection> =>
    api.post<MilkCollection>("/api/milk/collections/", data),

  updateMilkCollection: (
    id: number,
    data: Partial<MilkCollectionFormData>,
  ): Promise<MilkCollection> =>
    api.patch<MilkCollection>(`/api/milk/collections/${id}/`, data),

  deleteMilkCollection: (id: number): Promise<void> =>
    api.delete<void>(`/api/milk/collections/${id}/`),

  // Quality Tests
  getQualityTests: async (params?: {
    page?: number;
    collection?: number;
    overall_result?: string;
  }): Promise<PaginatedResponse<QualityTest>> =>
    api.get<PaginatedResponse<QualityTest>>("/api/milk/quality-tests/", {
      params,
    }),

  getQualityTest: (id: number): Promise<QualityTest> =>
    api.get<QualityTest>(`/api/milk/quality-tests/${id}/`),

  createQualityTest: (data: QualityTestFormData): Promise<QualityTest> =>
    api.post<QualityTest>("/api/milk/quality-tests/", data),

  updateQualityTest: (
    id: number,
    data: Partial<QualityTestFormData>,
  ): Promise<QualityTest> =>
    api.patch<QualityTest>(`/api/milk/quality-tests/${id}/`, data),

  deleteQualityTest: (id: number): Promise<void> =>
    api.delete<void>(`/api/milk/quality-tests/${id}/`),

  // Vendor Payments
  getVendorPayments: async (params?: {
    page?: number;
    vendor?: number;
    status?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<PaginatedResponse<VendorPayment>> =>
    api.get<PaginatedResponse<VendorPayment>>("/api/vendors/payments/", {
      params,
    }),

  getVendorPayment: (id: number): Promise<VendorPayment> =>
    api.get<VendorPayment>(`/api/vendors/payments/${id}/`),

  createVendorPayment: (data: VendorPaymentFormData): Promise<VendorPayment> =>
    api.post<VendorPayment>("/api/vendors/payments/", data),

  updateVendorPayment: (
    id: number,
    data: Partial<VendorPaymentFormData>,
  ): Promise<VendorPayment> =>
    api.patch<VendorPayment>(`/api/vendors/payments/${id}/`, data),

  deleteVendorPayment: (id: number): Promise<void> =>
    api.delete<void>(`/api/vendors/payments/${id}/`),

  processVendorPayment: (
    id: number,
    transactionReference: string,
  ): Promise<VendorPayment> =>
    api.patch<VendorPayment>(`/api/vendors/payments/${id}/`, {
      status: "completed",
      transaction_reference: transactionReference,
    }),

  getVendorPaymentHistory: (vendorId: number): Promise<VendorPayment[]> =>
    api
      .get<PaginatedResponse<VendorPayment>>("/api/vendors/payments/", {
        params: { vendor: vendorId },
      })
      .then((data) => data.results ?? []),

  getPendingPayments: (): Promise<VendorPayment[]> =>
    api
      .get<PaginatedResponse<VendorPayment>>("/api/vendors/payments/", {
        params: { status: "pending" },
      })
      .then((data) => data.results ?? []),

  // Purchase Orders
  getPurchaseOrders: async (params?: {
    page?: number;
    vendor?: number;
    status?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<PaginatedResponse<PurchaseOrder>> =>
    api.get<PaginatedResponse<PurchaseOrder>>("/api/vendors/purchase-orders/", {
      params,
    }),

  getPurchaseOrder: (id: number): Promise<PurchaseOrder> =>
    api.get<PurchaseOrder>(`/api/vendors/purchase-orders/${id}/`),

  createPurchaseOrder: (data: PurchaseOrderFormData): Promise<PurchaseOrder> =>
    api.post<PurchaseOrder>("/api/vendors/purchase-orders/", data),

  updatePurchaseOrder: (
    id: number,
    data: Partial<PurchaseOrderFormData>,
  ): Promise<PurchaseOrder> =>
    api.patch<PurchaseOrder>(`/api/vendors/purchase-orders/${id}/`, data),

  deletePurchaseOrder: (id: number): Promise<void> =>
    api.delete<void>(`/api/vendors/purchase-orders/${id}/`),

  approvePurchaseOrder: (id: number): Promise<PurchaseOrder> =>
    api.post<PurchaseOrder>(`/api/vendors/purchase-orders/${id}/approve/`, {}),

  sendPurchaseOrder: (id: number): Promise<PurchaseOrder> =>
    api.post<PurchaseOrder>(`/api/vendors/purchase-orders/${id}/send/`, {}),

  confirmPurchaseOrder: (id: number): Promise<PurchaseOrder> =>
    api.post<PurchaseOrder>(`/api/vendors/purchase-orders/${id}/confirm/`, {}),

  cancelPurchaseOrder: (id: number): Promise<PurchaseOrder> =>
    api.post<PurchaseOrder>(`/api/vendors/purchase-orders/${id}/cancel/`, {}),

  generatePurchaseOrderInvoice: (id: number): Promise<unknown> =>
    api.post<unknown>(
      `/api/vendors/purchase-orders/${id}/generate_invoice/`,
      {},
    ),

  getActivePurchaseOrders: (): Promise<PurchaseOrder[]> =>
    api
      .get<PaginatedResponse<PurchaseOrder>>("/api/vendors/purchase-orders/", {
        params: { status: "approved" },
      })
      .then((data) => data.results ?? []),

  // Goods Receipt Notes (GRN)
  getGoodsReceiptNotes: async (params?: {
    page?: number;
    purchase_order?: number;
    quality_status?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<PaginatedResponse<GoodsReceiptNote>> =>
    api.get<PaginatedResponse<GoodsReceiptNote>>("/api/vendors/grns/", {
      params,
    }),

  getGoodsReceiptNote: (id: number): Promise<GoodsReceiptNote> =>
    api.get<GoodsReceiptNote>(`/api/vendors/grns/${id}/`),

  createGoodsReceiptNote: (
    data: GoodsReceiptNoteFormData,
  ): Promise<GoodsReceiptNote> =>
    api.post<GoodsReceiptNote>("/api/vendors/grns/", data),

  updateGoodsReceiptNote: (
    id: number,
    data: Partial<GoodsReceiptNoteFormData>,
  ): Promise<GoodsReceiptNote> =>
    api.patch<GoodsReceiptNote>(`/api/vendors/grns/${id}/`, data),

  deleteGoodsReceiptNote: (id: number): Promise<void> =>
    api.delete<void>(`/api/vendors/grns/${id}/`),
};

export const inventoryAnalyticsService = {
  getDashboardData: (): Promise<{
    stock_overview: {
      total_items: number;
      low_stock: number;
      out_of_stock: number;
      reorder_required: number;
      total_value: number;
    };
    recent_activity: {
      inward_transactions: number;
      outward_transactions: number;
      wastage_transactions: number;
    };
    alerts: {
      active_alerts: number;
      expiring_soon: number;
    };
  }> => api.get("/api/inventory/analytics/dashboard/"),

  getStockMovementReport: (params?: {
    start_date?: string;
    end_date?: string;
    item_type?: string;
  }): Promise<{
    summary: {
      total_transactions: number;
      total_inward: number;
      total_outward: number;
    };
    by_type: Record<string, { count: number; total_quantity: number }>;
    by_item: Array<{
      item__name: string;
      item__item_id: string;
      transaction_count: number;
      total_quantity: number;
    }>;
  }> => api.get("/api/inventory/analytics/stock_movement_report/", { params }),

  getValuationReport: (): Promise<{
    total_valuation: number;
    by_type: Record<
      string,
      { count: number; total_value: number; total_stock: number }
    >;
    top_value_items: Array<{
      item_id: string;
      name: string;
      item_type: string;
      current_stock: number;
      cost_per_unit: number;
      total_value: number;
    }>;
  }> => api.get("/api/inventory/analytics/valuation_report/"),

  getTurnoverAnalysis: (params?: {
    days?: number;
  }): Promise<{
    period_days: number;
    items: Array<{
      item_id: string;
      name: string;
      item_type: string;
      current_stock: number;
      outward_quantity: number;
      turnover_ratio: number;
      days_of_stock: number;
    }>;
  }> => api.get("/api/inventory/analytics/turnover_analysis/", { params }),
};
