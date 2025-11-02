export type VendorStatus = "active" | "inactive" | "suspended" | "blocked";

export type VendorType =
  | "milk_supplier"
  | "equipment"
  | "packaging"
  | "chemical"
  | "other";

export type PaymentMethod = "cheque" | "neft" | "cash" | "bank_transfer";

export interface ContactPerson {
  id: string;
  name: string;
  phone: string;
  email: string;
  designation: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface BankDetails {
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  account_holder: string;
  account_type: "savings" | "current";
}

export interface VendorDocument {
  id: string;
  file_name: string;
  file_url: string;
  document_type: string;
  upload_date: string;
}

export interface Vendor {
  id: string;
  vendor_id: string;
  company_name: string;
  vendor_type: VendorType;
  status: VendorStatus;
  contact_persons: ContactPerson[];
  phone: string;
  email: string;
  gst_number?: string;
  pan_number?: string;
  registration_number?: string;
  billing_address: Address;
  shipping_address: Address;
  warehouse_address?: Address;
  bank_details?: BankDetails;
  credit_period_days: number;
  credit_limit: number;
  payment_methods: PaymentMethod[];
  discount_percentage: number;
  rating: number;
  total_purchases: number;
  total_payments: number;
  outstanding_balance: number;
  documents: VendorDocument[];
  created_at: string;
  updated_at: string;
  created_by: string;
  preferred_payment_method?: PaymentMethod;
}

export interface VendorPerformance {
  vendor_id: string;
  quality_score: number;
  delivery_punctuality: number;
  order_accuracy: number;
  payment_reliability: number;
  overall_rating: number;
  total_orders: number;
  on_time_deliveries: number;
  defective_items_count: number;
  performance_level: "excellent" | "good" | "average" | "poor";
  recommendation: "continue" | "review" | "discontinue";
  last_updated: string;
}

export interface VendorSummary {
  total_vendors: number;
  active_vendors: number;
  outstanding_balance: number;
  average_payment_days: number;
  top_vendors: Array<{
    vendor_id: string;
    company_name: string;
    total_purchases: number;
  }>;
}
