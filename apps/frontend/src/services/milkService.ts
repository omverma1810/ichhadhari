import { apiClient, handleApiError } from '@/lib/api-client';
import type {
  PaginatedResponse,
  MilkCollection,
  CreateMilkCollectionPayload,
  UpdateMilkCollectionPayload,
  MilkCollectionFilters,
  CollectionStats,
} from '@/types/api';

export const milkService = {
  /**
   * Get all milk collections with optional filters
   */
  getCollections: async (
    params?: MilkCollectionFilters
  ): Promise<PaginatedResponse<MilkCollection>> => {
    try {
      return await apiClient.get<PaginatedResponse<MilkCollection>>(
        '/api/milk/collections/',
        params
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get single milk collection by ID
   */
  getCollection: async (id: number): Promise<MilkCollection> => {
    try {
      return await apiClient.get<MilkCollection>(`/api/milk/collections/${id}/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Create new milk collection
   */
  createCollection: async (
    data: CreateMilkCollectionPayload
  ): Promise<MilkCollection> => {
    try {
      console.log('📤 Creating milk collection:', data);

      const response = await apiClient.post<MilkCollection>(
        '/api/milk/collections/',
        data
      );

      console.log('✅ Milk collection created:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Failed to create milk collection:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Update existing milk collection
   */
  updateCollection: async (
    id: number,
    data: UpdateMilkCollectionPayload
  ): Promise<MilkCollection> => {
    try {
      console.log('📤 Updating milk collection:', id, data);

      const response = await apiClient.put<MilkCollection>(
        `/api/milk/collections/${id}/`,
        data
      );

      console.log('✅ Milk collection updated:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to update milk collection:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Partially update milk collection (PATCH)
   */
  patchCollection: async (
    id: number,
    data: Partial<UpdateMilkCollectionPayload>
  ): Promise<MilkCollection> => {
    try {
      console.log('📤 Patching milk collection:', id, data);

      const response = await apiClient.patch<MilkCollection>(
        `/api/milk/collections/${id}/`,
        data
      );

      console.log('✅ Milk collection patched:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to patch milk collection:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Delete milk collection
   */
  deleteCollection: async (id: number): Promise<void> => {
    try {
      console.log('🗑️ Deleting milk collection:', id);
      await apiClient.delete(`/api/milk/collections/${id}/`);
      console.log('✅ Milk collection deleted');
    } catch (error) {
      console.error('❌ Failed to delete milk collection:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get today's collections
   */
  getTodaysCollections: async (): Promise<MilkCollection[]> => {
    const today = new Date().toISOString().split('T')[0];
    try {
      const response = await apiClient.get<PaginatedResponse<MilkCollection>>(
        '/api/milk/collections/',
        {
          collection_date: today,
          page_size: 100,
        }
      );
      return response.results || [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get collection statistics
   */
  getCollectionStats: async (
    startDate?: string,
    endDate?: string
  ): Promise<CollectionStats> => {
    try {
      return await apiClient.get<CollectionStats>('/api/milk/collections/stats/', {
        start_date: startDate,
        end_date: endDate,
      });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get collections by supplier
   */
  getCollectionsBySupplier: async (
    supplierId: number,
    params?: MilkCollectionFilters
  ): Promise<PaginatedResponse<MilkCollection>> => {
    try {
      return await apiClient.get<PaginatedResponse<MilkCollection>>(
        '/api/milk/collections/',
        {
          ...params,
          supplier: supplierId,
        }
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get collections by date range
   */
  getCollectionsByDateRange: async (
    startDate: string,
    endDate: string,
    params?: Omit<MilkCollectionFilters, 'start_date' | 'end_date'>
  ): Promise<PaginatedResponse<MilkCollection>> => {
    try {
      return await apiClient.get<PaginatedResponse<MilkCollection>>(
        '/api/milk/collections/',
        {
          ...params,
          start_date: startDate,
          end_date: endDate,
        }
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
