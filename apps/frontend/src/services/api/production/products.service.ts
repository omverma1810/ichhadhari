/**
 * Production - Products Service
 */

import { apiClient } from "@/lib/api/client";
import type {
  Product,
  CreateProductPayload,
  UpdateProductPayload,
  ProductFilters,
  ProductionBatch,
  PaginatedResponse,
} from "@/types/api";

class ProductsService {
  private readonly BASE_PATH = "/production/products";

  /**
   * Get list of products with optional filters
   */
  async getProducts(
    filters?: ProductFilters
  ): Promise<PaginatedResponse<Product>> {
    return apiClient.get<PaginatedResponse<Product>>(`${this.BASE_PATH}/`, {
      params: filters,
    });
  }

  /**
   * Get a single product by ID
   */
  async getProduct(id: number): Promise<Product> {
    return apiClient.get<Product>(`${this.BASE_PATH}/${id}/`);
  }

  /**
   * Create a new product
   */
  async createProduct(data: CreateProductPayload): Promise<Product> {
    return apiClient.post<Product>(`${this.BASE_PATH}/`, data);
  }

  /**
   * Update a product
   */
  async updateProduct(
    id: number,
    data: UpdateProductPayload
  ): Promise<Product> {
    return apiClient.patch<Product>(`${this.BASE_PATH}/${id}/`, data);
  }

  /**
   * Delete a product
   */
  async deleteProduct(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.BASE_PATH}/${id}/`);
  }

  /**
   * Get product batches
   */
  async getProductBatches(id: number): Promise<ProductionBatch[]> {
    return apiClient.get<ProductionBatch[]>(`${this.BASE_PATH}/${id}/batches/`);
  }

  /**
   * Get product statistics
   */
  async getProductStats(id: number, days: number = 30): Promise<any> {
    return apiClient.get<any>(`${this.BASE_PATH}/${id}/stats/`, {
      params: { days },
    });
  }
}

// Export singleton instance
export const productsService = new ProductsService();
export default productsService;
