import type { Vendor, BankDetails } from "./vendor";
import type { POItem } from "./purchase-order";

export type InvoiceItem = POItem;

export interface Invoice {
  id: string;
  invoice_number: string;
  purchase_order_id: string;
  vendor_id: string;
  invoice_date: string;
  due_date: string;
  items: InvoiceItem[];
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  amount_paid: number;
  amount_outstanding: number;
  is_fully_paid: boolean;
  paid_on?: string;
  gst_percentage: number;
  remarks?: string;
  created_at: string;
  updated_at?: string;
}

export interface InvoiceTemplateData {
  company_name: string;
  company_logo?: string;
  company_address: string;
  company_phone: string;
  company_email: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  vendor: Vendor;
  items: InvoiceItem[];
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  payment_terms: string;
  bank_details: BankDetails;
  notes?: string;
}

// Vendor Invoice Types
export interface VendorInvoice {
  id: number;
  invoice_number: string;
  vendor: number;
  vendor_name: string;
  invoice_date: string;
  due_date: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  payment_status: "unpaid" | "partially_paid" | "paid";
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
  created_at: string;
  updated_at: string;
}

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

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
