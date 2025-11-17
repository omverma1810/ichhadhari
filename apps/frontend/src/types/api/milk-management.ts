/**
 * Milk Management API Types
 */

import { AuditFields, CommonFilters } from "./common";

// ============ SUPPLIERS ============

export type SupplierType = "farmer" | "cooperative";
export type SupplierStatus = "active" | "inactive" | "suspended";
export type PaymentCycle = "daily" | "weekly" | "fortnightly" | "monthly";

export interface Supplier extends AuditFields {
  id: number;
  supplier_id: string;
  name: string;
  supplier_type: SupplierType;
  status: SupplierStatus;
  phone: string;
  alternate_phone?: string | null;
  email?: string | null;
  address: string;
  route_name: string;
  collection_time: string;
  payment_cycle: PaymentCycle;
  bank_name?: string | null;
  account_number?: string | null;
  ifsc_code?: string | null;
  avg_quality_score: number | string;
  total_milk_supplied: number | string;
  total_amount_paid: number | string;
  outstanding_balance: number | string;
  total_collections?: number;
  total_quantity?: number;
  notes?: string;
}

export interface CreateSupplierPayload {
  supplier_id: string;
  name: string;
  supplier_type: SupplierType;
  phone: string;
  status?: SupplierStatus;
  alternate_phone?: string;
  email?: string;
  address: string;
  route_name: string;
  collection_time: string;
  payment_cycle: PaymentCycle;
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
  notes?: string;
}

export interface UpdateSupplierPayload extends Partial<CreateSupplierPayload> {
  status?: SupplierStatus;
}

export interface SupplierFilters extends CommonFilters {
  status?: SupplierStatus;
  supplier_type?: SupplierType;
  route_name?: string;
  payment_cycle?: PaymentCycle;
}

export interface SupplierStats {
  total_quantity: number | string;
  avg_fat: number | string;
  avg_snf: number | string;
  avg_quality_score: number | string;
  total_amount: number | string;
  collection_count: number;
  days: number;
  start_date: string;
  end_date: string;
}

export interface SuppliersByRoute {
  route_name: string;
  suppliers: Supplier[];
  total_suppliers: number;
  active_suppliers: number;
}

export interface SupplierCollectionSummary {
  id: number;
  collection_id: string;
  collection_date: string;
  collection_time: string;
  quantity: number | string;
  quality_score: number | string;
  total_amount: number | string;
}

export interface SupplierCollectionFilters {
  limit?: number;
  page?: number;
  start_date?: string;
  end_date?: string;
  ordering?: string;
}

// ============ MILK COLLECTIONS ============

export type MilkType = "cow" | "buffalo" | "mixed";
export type QualityStatus =
  | "excellent"
  | "good"
  | "average"
  | "poor"
  | "rejected";
export type CollectionShift = "morning" | "evening";

export interface MilkCollection extends AuditFields {
  id: number;
  collection_id: string;
  supplier: {
    id: number;
    supplier_id: string;
    name: string;
  };
  collection_date: string;
  shift: CollectionShift;
  milk_type: MilkType;
  quantity: number;
  fat_percentage: number;
  snf_percentage: number;
  temperature: number;
  quality_status: QualityStatus;
  quality_score: number;
  rate_per_liter: number;
  total_amount: number;
  notes?: string;
}

export interface CreateMilkCollectionPayload {
  supplier: number;
  collection_date: string;
  collection_time?: string; // HH:MM:SS format or will use current time
  shift?: CollectionShift; // Optional, backend can auto-determine from time
  milk_type: MilkType;
  quantity: number;
  fat_percentage: number;
  snf_percentage: number;
  temperature: number;
  quality_status?: QualityStatus;
  rejection_reason?: string; // Required if quality_status is 'rejected'
  rate_per_liter: number;
  collected_by?: number; // Optional, defaults to current user
  notes?: string;
}

export type UpdateMilkCollectionPayload = Partial<CreateMilkCollectionPayload>;

export interface MilkCollectionFilters extends CommonFilters {
  supplier?: number;
  collection_date?: string;
  start_date?: string;
  end_date?: string;
  shift?: CollectionShift;
  milk_type?: MilkType;
  quality_status?: QualityStatus;
  min_quantity?: number;
  max_quantity?: number;
}

export interface CollectionStats {
  total_collections: number;
  total_quantity: number;
  total_amount: number;
  average_quantity: number;
  average_fat: number;
  average_snf: number;
  average_quality_score: number;
  by_milk_type: {
    milk_type: MilkType;
    quantity: number;
    percentage: number;
  }[];
  by_quality: {
    quality_status: QualityStatus;
    count: number;
    percentage: number;
  }[];
  by_shift: {
    shift: CollectionShift;
    quantity: number;
    percentage: number;
  }[];
  period_start: string;
  period_end: string;
}

export interface CollectionsBySupplier {
  supplier: {
    id: number;
    supplier_id: string;
    name: string;
  };
  collections: MilkCollection[];
  total_quantity: number;
  total_amount: number;
  average_quality_score: number;
}

export interface TodayCollections {
  morning: {
    collections: MilkCollection[];
    total_quantity: number;
    total_suppliers: number;
  };
  evening: {
    collections: MilkCollection[];
    total_quantity: number;
    total_suppliers: number;
  };
  total_quantity: number;
  total_amount: number;
}

// ============ PAYMENTS ============

export type PaymentMethod =
  | "cash"
  | "bank_transfer"
  | "cheque"
  | "upi"
  | "other";
export type PaymentStatus = "pending" | "completed" | "failed" | "cancelled";

export interface Payment extends AuditFields {
  id: number;
  payment_id: string;
  supplier: {
    id: number;
    supplier_id: string;
    name: string;
  };
  payment_date: string;
  amount: number;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  transaction_reference?: string;
  period_start: string;
  period_end: string;
  collections_count: number;
  total_quantity: number;
  deductions?: number;
  bonus?: number;
  net_amount: number;
  notes?: string;
  processed_by?: {
    id: number;
    name: string;
  };
}

export interface CreatePaymentPayload {
  supplier: number;
  payment_date: string;
  amount: number;
  payment_method: PaymentMethod;
  transaction_reference?: string;
  period_start: string;
  period_end: string;
  deductions?: number;
  bonus?: number;
  notes?: string;
}

export interface UpdatePaymentPayload extends Partial<CreatePaymentPayload> {
  status?: PaymentStatus;
}

export interface PaymentFilters extends CommonFilters {
  supplier?: number;
  payment_date?: string;
  start_date?: string;
  end_date?: string;
  payment_method?: PaymentMethod;
  status?: PaymentStatus;
  min_amount?: number;
  max_amount?: number;
}

export interface PaymentStats {
  total_payments: number;
  total_amount: number;
  pending_amount: number;
  completed_amount: number;
  failed_amount: number;
  by_method: {
    payment_method: PaymentMethod;
    count: number;
    amount: number;
    percentage: number;
  }[];
  by_status: {
    status: PaymentStatus;
    count: number;
    amount: number;
    percentage: number;
  }[];
  period_start: string;
  period_end: string;
}

export interface PendingPayment {
  supplier: {
    id: number;
    supplier_id: string;
    name: string;
    phone: string;
  };
  outstanding_balance: number;
  last_payment_date?: string;
  collections_count: number;
  total_quantity: number;
  days_pending: number;
}
