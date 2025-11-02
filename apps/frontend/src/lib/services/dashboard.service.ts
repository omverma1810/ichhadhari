/**
 * Dashboard Service
 * Handles all API calls related to dashboard data
 */

import api from "@/lib/api/client";

export interface DashboardStats {
  total_milk_collected: number;
  total_milk_collected_trend: number;
  total_vendors: number;
  total_vendors_trend: number;
  total_production: number;
  total_production_trend: number;
  total_inventory_value: number;
  total_inventory_value_trend: number;
  active_employees: number;
  pending_payments: number;
  low_stock_items: number;
  quality_issues: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  status: "success" | "warning" | "error" | "info";
  title: string;
  description: string;
  user: string;
  timestamp: string;
}

export interface MilkCollectionChartData {
  date: string;
  cow_milk: number;
  buffalo_milk: number;
  total: number;
}

export interface ProductionChartData {
  month: string;
  milk: number;
  curd: number;
  paneer: number;
  ghee: number;
  butter: number;
}

export interface DashboardAlert {
  id: string;
  type: "warning" | "error" | "info";
  message: string;
  timestamp: string;
}

export const dashboardService = {
  /**
   * Get dashboard statistics
   */
  getStats: (): Promise<DashboardStats> =>
    api.get<DashboardStats>("/v1/dashboard/stats/"),

  /**
   * Get recent activities
   */
  getRecentActivities: (limit: number = 10): Promise<RecentActivity[]> =>
    api.get<RecentActivity[]>("/v1/dashboard/activities/", {
      params: { limit },
    }),

  /**
   * Get milk collection chart data
   */
  getMilkCollectionChart: (
    startDate: string,
    endDate: string
  ): Promise<MilkCollectionChartData[]> =>
    api.get<MilkCollectionChartData[]>("/v1/dashboard/milk-collection-chart/", {
      params: { start_date: startDate, end_date: endDate },
    }),

  /**
   * Get production chart data
   */
  getProductionChart: (year: number): Promise<ProductionChartData[]> =>
    api.get<ProductionChartData[]>("/v1/dashboard/production-chart/", {
      params: { year },
    }),

  /**
   * Get dashboard alerts
   */
  getAlerts: (): Promise<DashboardAlert[]> =>
    api.get<DashboardAlert[]>("/v1/dashboard/alerts/"),
};
