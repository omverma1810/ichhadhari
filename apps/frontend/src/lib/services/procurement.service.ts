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
  fat_percentage: number;
  snf_percentage: number;
  temperature: number;
  rate_per_liter: number;
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
  fat_percentage: number;
  snf_percentage: number;
  temperature: number;
  rate_per_liter: number;
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
  created_at: string;
  updated_at: string;
}

export interface VendorPaymentFormData {
  vendor: number;
  payment_date: string;
  amount: number;
  payment_method: "cash" | "bank_transfer" | "upi" | "cheque";
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
  created_at: string;
  updated_at: string;
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
    api.get<PaginatedResponse<Vendor>>("/vendors/vendors/", { params }),

  getVendor: (id: number): Promise<Vendor> =>
    api.get<Vendor>(`/vendors/vendors/${id}/`),

  createVendor: (data: VendorFormData): Promise<Vendor> =>
    api.post<Vendor>("/vendors/vendors/", data),

  updateVendor: (id: number, data: Partial<VendorFormData>): Promise<Vendor> =>
    api.patch<Vendor>(`/vendors/vendors/${id}/`, data),

  deleteVendor: (id: number): Promise<void> =>
    api.delete<void>(`/vendors/vendors/${id}/`),

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
    api.get<PaginatedResponse<MilkCollection>>("/milk/collections/", {
      params,
    }),

  getMilkCollection: (id: number): Promise<MilkCollection> =>
    api.get<MilkCollection>(`/milk/collections/${id}/`),

  createMilkCollection: (
    data: MilkCollectionFormData
  ): Promise<MilkCollection> =>
    api.post<MilkCollection>("/milk/collections/", data),

  updateMilkCollection: (
    id: number,
    data: Partial<MilkCollectionFormData>
  ): Promise<MilkCollection> =>
    api.patch<MilkCollection>(`/milk/collections/${id}/`, data),

  deleteMilkCollection: (id: number): Promise<void> =>
    api.delete<void>(`/milk/collections/${id}/`),

  // Quality Tests
  getQualityTests: async (params?: {
    page?: number;
    collection?: number;
    overall_result?: string;
  }): Promise<PaginatedResponse<QualityTest>> =>
    api.get<PaginatedResponse<QualityTest>>("/milk/quality-tests/", {
      params,
    }),

  getQualityTest: (id: number): Promise<QualityTest> =>
    api.get<QualityTest>(`/milk/quality-tests/${id}/`),

  createQualityTest: (data: QualityTestFormData): Promise<QualityTest> =>
    api.post<QualityTest>("/milk/quality-tests/", data),

  updateQualityTest: (
    id: number,
    data: Partial<QualityTestFormData>
  ): Promise<QualityTest> =>
    api.patch<QualityTest>(`/milk/quality-tests/${id}/`, data),

  deleteQualityTest: (id: number): Promise<void> =>
    api.delete<void>(`/milk/quality-tests/${id}/`),

  // Vendor Payments
  getVendorPayments: async (params?: {
    page?: number;
    vendor?: number;
    status?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<PaginatedResponse<VendorPayment>> =>
    api.get<PaginatedResponse<VendorPayment>>("/vendors/payments/", {
      params,
    }),

  getVendorPayment: (id: number): Promise<VendorPayment> =>
    api.get<VendorPayment>(`/vendors/payments/${id}/`),

  createVendorPayment: (data: VendorPaymentFormData): Promise<VendorPayment> =>
    api.post<VendorPayment>("/vendors/payments/", data),

  updateVendorPayment: (
    id: number,
    data: Partial<VendorPaymentFormData>
  ): Promise<VendorPayment> =>
    api.patch<VendorPayment>(`/vendors/payments/${id}/`, data),

  deleteVendorPayment: (id: number): Promise<void> =>
    api.delete<void>(`/vendors/payments/${id}/`),

  processVendorPayment: (
    id: number,
    transactionReference: string
  ): Promise<VendorPayment> =>
    api.patch<VendorPayment>(`/vendors/payments/${id}/`, {
      status: "completed",
      transaction_reference: transactionReference,
    }),

  getVendorPaymentHistory: (vendorId: number): Promise<VendorPayment[]> =>
    api
      .get<PaginatedResponse<VendorPayment>>("/vendors/payments/", {
        params: { vendor: vendorId },
      })
      .then((data) => data.results ?? []),

  getPendingPayments: (): Promise<VendorPayment[]> =>
    api
      .get<PaginatedResponse<VendorPayment>>("/vendors/payments/", {
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
    api.get<PaginatedResponse<PurchaseOrder>>("/vendors/purchase-orders/", {
      params,
    }),

  getPurchaseOrder: (id: number): Promise<PurchaseOrder> =>
    api.get<PurchaseOrder>(`/vendors/purchase-orders/${id}/`),

  createPurchaseOrder: (data: PurchaseOrderFormData): Promise<PurchaseOrder> =>
    api.post<PurchaseOrder>("/vendors/purchase-orders/", data),

  updatePurchaseOrder: (
    id: number,
    data: Partial<PurchaseOrderFormData>
  ): Promise<PurchaseOrder> =>
    api.patch<PurchaseOrder>(`/vendors/purchase-orders/${id}/`, data),

  deletePurchaseOrder: (id: number): Promise<void> =>
    api.delete<void>(`/vendors/purchase-orders/${id}/`),

  approvePurchaseOrder: (id: number): Promise<PurchaseOrder> =>
    api.patch<PurchaseOrder>(`/vendors/purchase-orders/${id}/`, {
      status: "approved",
    }),

  getActivePurchaseOrders: (): Promise<PurchaseOrder[]> =>
    api
      .get<PaginatedResponse<PurchaseOrder>>("/vendors/purchase-orders/", {
        params: { status: "approved" },
      })
      .then((data) => data.results ?? []),
};
