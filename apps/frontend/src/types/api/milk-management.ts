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
  account_holder_name?: string | null;
  avg_quality_score: number | string;
  total_milk_supplied: number | string;
  total_amount_paid: number | string;
  outstanding_balance: number | string;
  total_collections?: number;
  total_quantity?: number;
  documents?: any;
  notes?: string;
}

export interface CreateSupplierPayload {
  name: string;
  supplier_type: SupplierType;
  phone: string;
  status?: SupplierStatus;
  alternate_phone?: string;
  email?: string;
  address: string;
  route_name: string;
  collection_time: string; // HH:MM:SS format
  payment_cycle: PaymentCycle;
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
  account_holder_name?: string;
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
  | "accepted" // Default status
  | "rejected" // Rejected milk
  | "pending"; // Pending quality check
export type CollectionShift = "morning" | "evening";

export interface MilkCollection extends AuditFields {
  id: number;
  collection_id: string;
  supplier: number; // Foreign key ID
  supplier_name: string; // Read-only from backend
  collected_by?: number | null;
  collected_by_name?: string | null; // Read-only from backend
  collection_date: string;
  collection_time: string; // HH:MM:SS format
  milk_type: MilkType;
  quantity: number | string; // Decimal field
  fat: number | string; // Fat content (kg per liter)
  snf: number | string; // SNF content (kg per liter)
  clr: number | string; // Corrected Lactometer Reading for milk density
  quality_status: QualityStatus;
  quality_score: number | string; // Auto-calculated by backend
  rejection_reason?: string | null;
  rate_per_fat: number | string; // Rate per kg of fat
  rate_per_snf: number | string; // Rate per kg of SNF
  price_per_liter: number | string; // Auto-calculated: (fat × rate_per_fat) + (snf × rate_per_snf)
  total_amount: number | string; // Auto-calculated by backend
  notes?: string | null;
  bmc_integration_data?: any;
}

export interface CreateMilkCollectionPayload {
  supplier: number;
  collection_date: string; // YYYY-MM-DD format
  collection_time?: string; // HH:MM:SS format, defaults to current time
  milk_type: MilkType;
  quantity: number | string; // Decimal value
  fat: number | string; // Fat content (kg per liter)
  snf: number | string; // SNF content (kg per liter)
  clr: number | string; // CLR - Corrected Lactometer Reading
  quality_status?: QualityStatus; // Defaults to 'accepted'
  rejection_reason?: string; // Required if quality_status is 'rejected'
  rate_per_fat: number | string; // Rate per kg of fat
  rate_per_snf: number | string; // Rate per kg of SNF
  collected_by?: number; // Optional, defaults to current user
  notes?: string;
  bmc_integration_data?: any;
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
