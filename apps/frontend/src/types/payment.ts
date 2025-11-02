import type { PaymentMethod } from "./vendor";

export interface PaymentDocument {
  id: string;
  file_name: string;
  file_url: string;
  upload_date: string;
}

export interface Payment {
  id: string;
  payment_id: string;
  vendor_id: string;
  payment_date: string;
  amount: number;
  payment_method: PaymentMethod;
  reference_number: string;
  payment_type: "full" | "partial" | "advance";
  purchase_order_ids: string[];
  invoice_ids: string[];
  reconciled: boolean;
  reconciliation_date?: string;
  remarks?: string;
  documents: PaymentDocument[];
  created_by: string;
  created_at: string;
  updated_at?: string;
}

export interface OutstandingBalance {
  vendor_id: string;
  vendor_name: string;
  total_outstanding: number;
  age_0_30: number;
  age_31_60: number;
  age_61_90: number;
  age_90_plus: number;
  payment_status: "on_time" | "overdue" | "critical";
  days_overdue: number;
}

export interface PaymentReminder {
  id: string;
  vendor_id: string;
  invoice_id: string;
  reminder_date: string;
  reminder_type:
    | "due_date_approaching"
    | "overdue_1day"
    | "overdue_3days"
    | "overdue_7days";
  sent: boolean;
  sent_at?: string;
  sent_to?: string;
}
