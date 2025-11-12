import { apiClient, handleApiError } from '@/lib/api-client';
import type { DashboardStats, MilkTrend } from '@/types/api';

export const dashboardService = {
  /**
   * Get dashboard statistics
   */
  getStats: async (): Promise<DashboardStats> => {
    try {
      return await apiClient.get<DashboardStats>('/api/v1/dashboard/stats/');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get milk collection trends
   */
  getMilkTrends: async (params?: {
    period?: 'week' | 'month' | 'year';
    date_from?: string;
    date_to?: string;
  }): Promise<MilkTrend[]> => {
    try {
      return await apiClient.get<MilkTrend[]>('/api/v1/dashboard/milk-trends/', params);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get recent activity
   */
  getRecentActivity: async (limit?: number): Promise<any[]> => {
    try {
      return await apiClient.get<any[]>('/api/v1/dashboard/recent-activity/', { limit });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
