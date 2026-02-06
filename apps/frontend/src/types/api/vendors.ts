/**
 * Vendors API Types
 */

import { AuditFields, CommonFilters } from "./common";

// ============ VENDORS ============

export type VendorCategory =
  | "raw_material"
  | "packaging"
  | "equipment"
  | "service"
  | "other";

export type VendorStatus = "active" | "inactive" | "suspended";

export type VendorPaymentMethod = "cash" | "cheque" | "bank_transfer" | "upi";

export interface Vendor extends AuditFields {
  id: number;
  vendor_id: string;
  company_name: string;
  category: VendorCategory;
  status: VendorStatus;

  // Contact Information
  contact_person: string;
  phone: string;
  alternate_phone?: string;
  email?: string;
  website?: string;

  // Address Information
  billing_address: string;
  shipping_address?: string;

  // Legal Information
  gst_number?: string;
  pan_number?: string;
  company_registration_number?: string;

  // Banking Information
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
  account_holder_name?: string;

  // Payment Terms
  credit_period_days: number;
  credit_limit: number;
  payment_method: VendorPaymentMethod;
  discount_percentage: number;

  // Performance Metrics
  rating: number;
  total_purchases: number;
  total_payments: number;
  outstanding_balance: number;

  // Additional
  documents?: Record<string, any>;
  notes?: string;
}

export interface CreateVendorPayload {
  company_name: string;
  category: VendorCategory;
  contact_person: string;
  phone: string;
  alternate_phone?: string;
  email?: string;
  website?: string;
  billing_address: string;
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
  payment_method?: VendorPaymentMethod;
  discount_percentage?: number;
  rating?: number;
  notes?: string;
}

export interface UpdateVendorPayload extends Partial<CreateVendorPayload> {
  status?: VendorStatus;
}

export interface VendorFilters extends CommonFilters {
  category?: VendorCategory;
  status?: VendorStatus;
}

// Vendor Statistics (from stats action)
export interface VendorStats {
  vendor_info: {
    vendor_id: string;
    company_name: string;
    status: VendorStatus;
    rating: number;
  };
  financial: {
    total_purchases: number;
    total_payments: number;
    outstanding_balance: number;
    credit_limit: number;
  };
  purchase_orders: {
    total_pos: number;
    approved_pos: number;
    pending_pos: number;
    total_po_amount: number;
  };
  payments: {
    total_payments: number;
    total_paid: number;
  };
}

// ============ PURCHASE ORDERS ============

export type PurchaseOrderStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "sent"
  | "confirmed"
  | "partially_received"
  | "fully_received"
  | "cancelled";

export type RecurrenceFrequency = "daily" | "weekly" | "monthly";

export interface PurchaseOrderItem {
  id?: number;
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
}

export interface PurchaseOrder extends AuditFields {
  id: number;
  po_number: string;
  vendor: number;
  vendor_name?: string;
  po_date: string;
  expected_delivery_date: string;
  actual_delivery_date?: string;
  status: PurchaseOrderStatus;

  // Approval
  created_by?: number;
  created_by_name?: string;
  approved_by?: number;
  approved_by_name?: string;
  approved_at?: string;

  // Financial
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;

  // Delivery
  delivery_address: string;
  shipping_method?: string;
  tracking_number?: string;

  // Additional
  terms_and_conditions?: string;
  notes?: string;
  is_recurring: boolean;
  recurrence_frequency?: RecurrenceFrequency;

  // Items
  items: PurchaseOrderItem[];
}

export interface CreatePurchaseOrderPayload {
  vendor: number;
  po_date: string;
  expected_delivery_date: string;
  delivery_address: string;
  shipping_method?: string;
  terms_and_conditions?: string;
  notes?: string;
  is_recurring?: boolean;
  recurrence_frequency?: RecurrenceFrequency;
  items: Omit<PurchaseOrderItem, "id" | "line_total" | "quantity_received">[];
}

export interface UpdatePurchaseOrderPayload extends Partial<CreatePurchaseOrderPayload> {
  status?: PurchaseOrderStatus;
}

export interface PurchaseOrderFilters extends CommonFilters {
  vendor?: number;
  status?: PurchaseOrderStatus;
  po_date?: string;
  start_date?: string;
  end_date?: string;
}

// ============ VENDOR PAYMENTS ============

export type VendorPaymentStatus = "pending" | "completed" | "failed";

export interface VendorPayment extends AuditFields {
  id: number;
  payment_id: string;
  vendor: number;
  vendor_name?: string;
  payment_date: string;
  amount: number;
  payment_method: VendorPaymentMethod;
  status: VendorPaymentStatus;
  is_advance: boolean;

  // Transaction Details
  transaction_reference?: string;
  upi_transaction_id?: string;
  cheque_number?: string;

  processed_by?: number;
  processed_by_name?: string;
  notes?: string;

  // Related POs
  purchase_orders?: number[];
}

export interface CreateVendorPaymentPayload {
  vendor: number;
  payment_date: string;
  amount: number;
  payment_method: VendorPaymentMethod;
  status?: VendorPaymentStatus;
  is_advance?: boolean;
  transaction_reference?: string;
  upi_transaction_id?: string;
  cheque_number?: string;
  notes?: string;
  purchase_orders?: number[];
}

export interface UpdateVendorPaymentPayload extends Partial<CreateVendorPaymentPayload> {}

export interface VendorPaymentFilters extends CommonFilters {
  vendor?: number;
  payment_method?: VendorPaymentMethod;
  status?: VendorPaymentStatus;
  payment_date?: string;
  start_date?: string;
  end_date?: string;
}

// ============ GOODS RECEIPT NOTES ============

export type GRNQualityStatus = "approved" | "rejected" | "partial";

export interface GRNItem {
  id?: number;
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

export interface GoodsReceiptNote extends AuditFields {
  id: number;
  grn_number: string;
  purchase_order: number;
  po_number?: string;
  vendor?: number;
  vendor_name?: string;
  receipt_date: string;

  // Quality Check
  quality_status: GRNQualityStatus;
  quality_notes?: string;
  quality_checked_by?: number;
  quality_checked_by_name?: string;

  // Received By
  received_by?: number;
  received_by_name?: string;

  // Document References
  delivery_challan_number?: string;
  invoice_number?: string;
  notes?: string;

  // Items
  items: GRNItem[];
}

export interface CreateGoodsReceiptNotePayload {
  purchase_order: number;
  receipt_date: string;
  quality_status: GRNQualityStatus;
  quality_notes?: string;
  delivery_challan_number?: string;
  invoice_number?: string;
  notes?: string;
  items: Omit<GRNItem, "id">[];
}

export interface UpdateGoodsReceiptNotePayload extends Partial<CreateGoodsReceiptNotePayload> {}

export interface GoodsReceiptNoteFilters extends CommonFilters {
  purchase_order?: number;
  quality_status?: GRNQualityStatus;
  receipt_date?: string;
  start_date?: string;
  end_date?: string;
}

// ============ VENDOR INVOICES ============

export type VendorInvoiceStatus =
  | "draft"
  | "sent"
  | "paid"
  | "overdue"
  | "cancelled";
export type VendorInvoicePaymentStatus = "unpaid" | "partially_paid" | "paid";

export interface VendorInvoiceItem {
  id?: number;
  item_description: string;
  quantity: string | number;
  unit: string;
  unit_price: string | number;
  line_total: string;
  tax_rate?: string | number;
  discount_percentage?: string | number;
}

export interface VendorInvoice extends AuditFields {
  id: number;
  invoice_number: string;
  vendor: number;
  vendor_name: string;
  invoice_date: string;
  due_date: string;
  status: VendorInvoiceStatus;
  payment_status: VendorInvoicePaymentStatus;
  subtotal: string;
  tax_amount: string;
  discount_amount: string;
  total_amount: string;
  amount_paid: string;
  amount_due: string;
  notes?: string;
  terms_and_conditions?: string;
  reference_number?: string;
  items: VendorInvoiceItem[];
  created_by?: number;
  created_by_name?: string;
}

export interface VendorInvoiceListItem {
  id: number;
  invoice_number: string;
  vendor: number;
  vendor_name: string;
  invoice_date: string;
  due_date: string;
  status: string;
  payment_status: string;
  total_amount: string;
  amount_paid: string;
  amount_due: string;
  items_count: number;
  created_at: string;
}

export interface CreateVendorInvoicePayload {
  vendor: number;
  invoice_date: string;
  due_date: string;
  total_amount: string | number;
  items: Array<{
    item_description: string;
    quantity: string | number;
    unit: string;
    unit_price: string | number;
    tax_rate?: string | number;
    discount_percentage?: string | number;
  }>;
  notes?: string;
  terms_and_conditions?: string;
  reference_number?: string;
}

export interface UpdateVendorInvoicePayload extends Partial<CreateVendorInvoicePayload> {
  status?: VendorInvoiceStatus;
  payment_status?: VendorInvoicePaymentStatus;
  amount_paid?: string | number;
}

export interface VendorInvoiceFilters extends CommonFilters {
  vendor?: number;
  status?: VendorInvoiceStatus;
  payment_status?: VendorInvoicePaymentStatus;
  date_from?: string;
  date_to?: string;
}
