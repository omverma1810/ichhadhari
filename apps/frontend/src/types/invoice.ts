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
