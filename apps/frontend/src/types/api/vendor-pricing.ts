/**
 * Vendor Product Pricing Types
 * Types for managing vendor-specific product pricing
 */

export interface VendorProductPrice {
  id: number;
  vendor: number;
  vendor_name: string;
  product: number;
  product_name: string;
  product_unit: string;
  vendor_price: number;
  min_quantity: number;
  is_active: boolean;
  valid_from: string | null;
  valid_until: string | null;
  notes: string;
  market_price: number;
  discount_percentage: number;
  discount_amount: number;
  created_at: string;
  updated_at: string;
}

export interface VendorProductPriceListItem {
  id: number;
  vendor: number;
  vendor_name: string;
  product: number;
  product_name: string;
  product_unit: string;
  vendor_price: number;
  min_quantity: number;
  is_active: boolean;
  valid_from: string | null;
  valid_until: string | null;
  notes: string;
  created_at: string;
}

export interface CreateVendorProductPricePayload {
  vendor: number;
  product: number;
  vendor_price: number;
  min_quantity?: number;
  is_active?: boolean;
  valid_from?: string | null;
  valid_until?: string | null;
  notes?: string;
}

export interface UpdateVendorProductPricePayload extends Partial<CreateVendorProductPricePayload> {}

export interface VendorProductPriceFilters {
  vendor?: number;
  product?: number;
  is_active?: boolean;
  active_only?: boolean;
  valid_on?: string;
  page?: number;
  search?: string;
}

export interface VendorPricesResponse {
  vendor_id: string;
  prices: VendorProductPriceListItem[];
  count: number;
}

export interface ProductPricesResponse {
  product_id: string;
  prices: VendorProductPriceListItem[];
  count: number;
}
