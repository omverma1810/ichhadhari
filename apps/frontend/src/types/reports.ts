export interface ReportFilter {
  startDate?: string;
  endDate?: string;
  vendorId?: string;
  vendorType?: string;
  status?: string;
  performanceLevel?: string;
}

export interface VendorListReportRow {
  vendor_id: string;
  company_name: string;
  vendor_type: string;
  contact_person: string;
  phone: string;
  email: string;
  rating: number;
  outstanding_balance: number;
}

export interface OutstandingBalanceReportRow {
  vendor_id: string;
  company_name: string;
  age_0_30: number;
  age_31_60: number;
  age_61_90: number;
  age_90_plus: number;
  total_outstanding: number;
}

export interface PaymentHistoryReportRow {
  payment_id: string;
  vendor_name: string;
  payment_date: string;
  amount: number;
  payment_method: string;
  payment_type: string;
  reconciled: boolean;
}

export interface ReportPayload<T> {
  data: T[];
  generated_at: string;
  filters: ReportFilter;
}
