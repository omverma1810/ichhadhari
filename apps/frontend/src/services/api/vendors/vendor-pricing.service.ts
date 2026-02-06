/**
 * Vendor Product Pricing Service
 * Handles API operations for vendor-specific product pricing
 */

import { apiClient } from "@/lib/api/client";
import type {
  VendorProductPrice,
  VendorProductPriceListItem,
  CreateVendorProductPricePayload,
  UpdateVendorProductPricePayload,
  VendorProductPriceFilters,
  VendorPricesResponse,
  ProductPricesResponse,
} from "@/types/api/vendor-pricing";
import type { PaginatedResponse } from "@/types/api";

class VendorPricingService {
  private readonly BASE_PATH = "/api/vendors/product-prices";

  /**
   * Get list of vendor product prices with optional filters
   */
  async getVendorProductPrices(
    filters?: VendorProductPriceFilters
  ): Promise<PaginatedResponse<VendorProductPriceListItem>> {
    return apiClient.get<PaginatedResponse<VendorProductPriceListItem>>(
      `${this.BASE_PATH}/`,
      { params: filters }
    );
  }

  /**
   * Get a single vendor product price by ID
   */
  async getVendorProductPrice(id: number): Promise<VendorProductPrice> {
    return apiClient.get<VendorProductPrice>(`${this.BASE_PATH}/${id}/`);
  }

  /**
   * Create a new vendor product price
   */
  async createVendorProductPrice(
    data: CreateVendorProductPricePayload
  ): Promise<VendorProductPrice> {
    return apiClient.post<VendorProductPrice>(`${this.BASE_PATH}/`, data);
  }

  /**
   * Update a vendor product price
   */
  async updateVendorProductPrice(
    id: number,
    data: UpdateVendorProductPricePayload
  ): Promise<VendorProductPrice> {
    return apiClient.patch<VendorProductPrice>(
      `${this.BASE_PATH}/${id}/`,
      data
    );
  }

  /**
   * Delete a vendor product price
   */
  async deleteVendorProductPrice(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.BASE_PATH}/${id}/`);
  }

  /**
   * Get all active product prices for a specific vendor
   */
  async getPricesForVendor(vendorId: number): Promise<VendorPricesResponse> {
    return apiClient.get<VendorPricesResponse>(
      `${this.BASE_PATH}/for_vendor/`,
      { params: { vendor_id: vendorId } }
    );
  }

  /**
   * Get all active vendor prices for a specific product
   */
  async getPricesForProduct(productId: number): Promise<ProductPricesResponse> {
    return apiClient.get<ProductPricesResponse>(
      `${this.BASE_PATH}/for_product/`,
      { params: { product_id: productId } }
    );
  }
}

// Export singleton instance
export const vendorPricingService = new VendorPricingService();
export default vendorPricingService;
