import { apiClient, handleApiError } from '@/lib/api-client';
import type {
  PaginatedResponse,
  Product,
  CreateProductPayload,
  UpdateProductPayload,
  ProductFilters,
  ProductionBatch,
  CreateProductionBatchPayload,
  UpdateProductionBatchPayload,
  ProductionBatchFilters,
  ProductionReport,
} from '@/types/api';

export const productionService = {
  // ==================== PRODUCTS ====================

  /**
   * Get all products with optional filters
   */
  getProducts: async (params?: ProductFilters): Promise<PaginatedResponse<Product>> => {
    try {
      return await apiClient.get<PaginatedResponse<Product>>(
        '/api/production/products/',
        params
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get single product by ID
   */
  getProduct: async (id: number): Promise<Product> => {
    try {
      return await apiClient.get<Product>(`/api/production/products/${id}/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Create new product
   */
  createProduct: async (data: CreateProductPayload): Promise<Product> => {
    try {
      console.log('📤 Creating product:', data);
      const response = await apiClient.post<Product>('/api/production/products/', data);
      console.log('✅ Product created:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to create product:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Update existing product
   */
  updateProduct: async (id: number, data: UpdateProductPayload): Promise<Product> => {
    try {
      console.log('📤 Updating product:', id, data);
      const response = await apiClient.put<Product>(
        `/api/production/products/${id}/`,
        data
      );
      console.log('✅ Product updated:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to update product:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Partially update product (PATCH)
   */
  patchProduct: async (
    id: number,
    data: Partial<UpdateProductPayload>
  ): Promise<Product> => {
    try {
      console.log('📤 Patching product:', id, data);
      const response = await apiClient.patch<Product>(
        `/api/production/products/${id}/`,
        data
      );
      console.log('✅ Product patched:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to patch product:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Delete product
   */
  deleteProduct: async (id: number): Promise<void> => {
    try {
      console.log('🗑️ Deleting product:', id);
      await apiClient.delete(`/api/production/products/${id}/`);
      console.log('✅ Product deleted');
    } catch (error) {
      console.error('❌ Failed to delete product:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get products by category
   */
  getProductsByCategory: async (
    category: string,
    params?: Omit<ProductFilters, 'category'>
  ): Promise<PaginatedResponse<Product>> => {
    try {
      return await apiClient.get<PaginatedResponse<Product>>(
        '/api/production/products/',
        {
          ...params,
          category,
        }
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // ==================== PRODUCTION BATCHES ====================

  /**
   * Get all production batches with optional filters
   */
  getBatches: async (
    params?: ProductionBatchFilters
  ): Promise<PaginatedResponse<ProductionBatch>> => {
    try {
      return await apiClient.get<PaginatedResponse<ProductionBatch>>(
        '/api/production/batches/',
        params
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get single production batch by ID
   */
  getBatch: async (id: number): Promise<ProductionBatch> => {
    try {
      return await apiClient.get<ProductionBatch>(`/api/production/batches/${id}/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Create new production batch
   */
  createBatch: async (
    data: CreateProductionBatchPayload
  ): Promise<ProductionBatch> => {
    try {
      console.log('📤 Creating production batch:', data);
      const response = await apiClient.post<ProductionBatch>(
        '/api/production/batches/',
        data
      );
      console.log('✅ Production batch created:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to create production batch:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Update existing production batch
   */
  updateBatch: async (
    id: number,
    data: UpdateProductionBatchPayload
  ): Promise<ProductionBatch> => {
    try {
      console.log('📤 Updating production batch:', id, data);
      const response = await apiClient.put<ProductionBatch>(
        `/api/production/batches/${id}/`,
        data
      );
      console.log('✅ Production batch updated:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to update production batch:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Partially update production batch (PATCH)
   */
  patchBatch: async (
    id: number,
    data: Partial<UpdateProductionBatchPayload>
  ): Promise<ProductionBatch> => {
    try {
      console.log('📤 Patching production batch:', id, data);
      const response = await apiClient.patch<ProductionBatch>(
        `/api/production/batches/${id}/`,
        data
      );
      console.log('✅ Production batch patched:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to patch production batch:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Delete production batch
   */
  deleteBatch: async (id: number): Promise<void> => {
    try {
      console.log('🗑️ Deleting production batch:', id);
      await apiClient.delete(`/api/production/batches/${id}/`);
      console.log('✅ Production batch deleted');
    } catch (error) {
      console.error('❌ Failed to delete production batch:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get batches by product
   */
  getBatchesByProduct: async (
    productId: number,
    params?: Omit<ProductionBatchFilters, 'product'>
  ): Promise<PaginatedResponse<ProductionBatch>> => {
    try {
      return await apiClient.get<PaginatedResponse<ProductionBatch>>(
        '/api/production/batches/',
        {
          ...params,
          product: productId,
        }
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get today's batches
   */
  getTodaysBatches: async (): Promise<ProductionBatch[]> => {
    const today = new Date().toISOString().split('T')[0];
    try {
      const response = await apiClient.get<PaginatedResponse<ProductionBatch>>(
        '/api/production/batches/',
        {
          batch_date: today,
          page_size: 100,
        }
      );
      return response.results || [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get production report
   */
  getProductionReport: async (
    startDate?: string,
    endDate?: string
  ): Promise<ProductionReport> => {
    try {
      return await apiClient.get<ProductionReport>('/api/production/report/', {
        start_date: startDate,
        end_date: endDate,
      });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Start batch production
   */
  startBatchProduction: async (id: number): Promise<ProductionBatch> => {
    try {
      console.log('▶️ Starting batch production:', id);
      const response = await apiClient.patch<ProductionBatch>(
        `/api/production/batches/${id}/`,
        {
          status: 'in_progress',
          start_time: new Date().toISOString(),
        }
      );
      console.log('✅ Batch production started:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to start batch production:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Complete batch production
   */
  completeBatchProduction: async (
    id: number,
    actualQuantity: number
  ): Promise<ProductionBatch> => {
    try {
      console.log('✅ Completing batch production:', id);
      const response = await apiClient.patch<ProductionBatch>(
        `/api/production/batches/${id}/`,
        {
          status: 'completed',
          actual_quantity: actualQuantity,
          end_time: new Date().toISOString(),
        }
      );
      console.log('✅ Batch production completed:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to complete batch production:', error);
      throw new Error(handleApiError(error));
    }
  },
};
