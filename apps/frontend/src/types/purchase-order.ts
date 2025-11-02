import type { Vendor } from "./vendor";

export type POStatus =
  | "draft"
  | "pending_approval"
  | "confirmed"
  | "partially_received"
  | "fully_received"
  | "invoiced"
  | "paid"
  | "cancelled";

export type DeliveryLocation = "warehouse" | "cold_storage" | "shop";

export interface POItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  hsn_code?: string;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  vendor_id: string;
  vendor: Vendor;
  status: POStatus;
  order_date: string;
  expected_delivery_date: string;
  actual_delivery_date?: string;
  items: POItem[];
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  delivery_location: DeliveryLocation;
  is_recurring: boolean;
  recurring_frequency?: "weekly" | "bi_weekly" | "monthly";
  next_recurring_date?: string;
  po_qr_code?: string;
  special_instructions?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PurchaseRequisition {
  id: string;
  requisition_id: string;
  vendor_id: string;
  status: "draft" | "pending_approval" | "approved" | "rejected";
  items: Array<{
    id: string;
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
  total_amount: number;
  delivery_location: DeliveryLocation;
  delivery_date_preferred: string;
  special_instructions?: string;
  requested_by: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
}

export interface GoodsReceiptNote {
  id: string;
  grn_number: string;
  purchase_order_id: string;
  received_date: string;
  received_by: string;
  items_received: Array<{
    po_item_id: string;
    quantity_received: number;
    condition: "good" | "damaged" | "defective";
    batch_number?: string;
    expiry_date?: string;
    temperature_reading?: number;
  }>;
  damage_report?: string;
  shortage_report?: string;
  quality_notes?: string;
  status: "received" | "partial" | "rejected" | "pending_inspection";
  created_at: string;
  updated_at: string;
}

export interface ReturnOrder {
  id: string;
  return_id: string;
  grn_id: string;
  return_date: string;
  reason: string;
  authorization_number: string;
  items_returned: Array<{
    po_item_id: string;
    quantity: number;
    condition: "damaged" | "expired" | "defective";
  }>;
  total_return_value: number;
  status: "initiated" | "shipped" | "received" | "processed" | "credit_issued";
  credit_note_issued: boolean;
  credit_note_amount: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}
