/**
 * Dashboard API Service
 * Handles all dashboard-related API calls
 */

import { isAxiosError } from "axios";
import { apiClient } from "@/lib/api/client";
import type {
  DashboardStats,
  Activity,
  ActivityFilters,
  MilkCollectionChartData,
  MilkCollectionChartParams,
  ProductionChartData,
  ProductionChartParams,
  DashboardAlert,
  AlertFilters,
  MilkCollectionTrendPeriod,
  MilkCollectionTrends,
  ProductionSummary,
  InventoryStatusOverview,
  SupplierPerformanceOverview,
} from "@/types/api";

class DashboardService {
  private readonly BASE_PATH = "/api/v1/dashboard";

  private isNoDataError(error: unknown): boolean {
    if (!isAxiosError(error)) {
      return false;
    }

    const status = error.response?.status;
    return status === 404 || status === 204;
  }

  private createEmptyStats(): DashboardStats {
    return {
      total_milk_collected: 0,
      total_milk_collected_trend: 0,
      total_vendors: 0,
      total_vendors_trend: 0,
      total_production: 0,
      total_production_trend: 0,
      total_inventory_value: 0,
      total_inventory_value_trend: 0,
      active_employees: 0,
      pending_payments: 0,
      low_stock_items: 0,
      quality_issues: 0,
    };
  }

  private createEmptyMilkCollectionTrends(
    period: MilkCollectionTrendPeriod
  ): MilkCollectionTrends {
    return {
      period,
      trends: [],
      growth: {
        cow_milk_growth: "0",
        buffalo_milk_growth: "0",
        total_growth: "0",
      },
    };
  }

  private createEmptyProductionSummary(): ProductionSummary {
    return {
      today: {
        batches: 0,
        quantity: "0",
        quality_score: "0",
      },
      this_month: {
        batches: 0,
        quantity: "0",
        top_products: [],
      },
    };
  }

  private createEmptyInventoryStatus(): InventoryStatusOverview {
    return {
      total_value: "0",
      categories: [],
      alerts: {
        low_stock: 0,
        out_of_stock: 0,
        near_expiry: 0,
      },
    };
  }

  private createEmptySupplierPerformance(): SupplierPerformanceOverview {
    return {
      top_suppliers: [],
      quality_distribution: {
        excellent: 0,
        good: 0,
        average: 0,
        poor: 0,
      },
    };
  }

  /**
   * Get dashboard statistics with trends
   */
  async getStats(): Promise<DashboardStats> {
    try {
      const stats = await apiClient.get<DashboardStats | null>(
        `${this.BASE_PATH}/stats/`
      );
      return stats ?? this.createEmptyStats();
    } catch (error) {
      if (this.isNoDataError(error)) {
        return this.createEmptyStats();
      }
      throw error;
    }
  }

  /**
   * Get recent activities
   */
  async getActivities(filters?: ActivityFilters): Promise<Activity[]> {
    try {
      const activities = await apiClient.get<Activity[] | null>(
        `${this.BASE_PATH}/activities/`,
        {
          params: filters,
        }
      );
      return activities ?? [];
    } catch (error) {
      if (this.isNoDataError(error)) {
        return [];
      }
      throw error;
    }
  }

  /**
   * Get milk collection chart data
   */
  async getMilkCollectionChart(
    params?: MilkCollectionChartParams
  ): Promise<MilkCollectionChartData[]> {
    try {
      const chartData = await apiClient.get<MilkCollectionChartData[] | null>(
        `${this.BASE_PATH}/milk-collection-chart/`,
        { params }
      );
      return chartData ?? [];
    } catch (error) {
      if (this.isNoDataError(error)) {
        return [];
      }
      throw error;
    }
  }

  /**
   * Get production chart data
   */
  async getProductionChart(
    params?: ProductionChartParams
  ): Promise<ProductionChartData[]> {
    try {
      const chartData = await apiClient.get<ProductionChartData[] | null>(
        `${this.BASE_PATH}/production-chart/`,
        { params }
      );
      return chartData ?? [];
    } catch (error) {
      if (this.isNoDataError(error)) {
        return [];
      }
      throw error;
    }
  }

  /**
   * Get dashboard alerts
   */
  async getAlerts(filters?: AlertFilters): Promise<DashboardAlert[]> {
    try {
      const alerts = await apiClient.get<DashboardAlert[] | null>(
        `${this.BASE_PATH}/alerts/`,
        {
          params: filters,
        }
      );
      return alerts ?? [];
    } catch (error) {
      if (this.isNoDataError(error)) {
        return [];
      }
      throw error;
    }
  }

  /**
   * Get milk collection trends for analytics widgets
   */
  async getMilkCollectionTrends(
    period: MilkCollectionTrendPeriod = "30d"
  ): Promise<MilkCollectionTrends> {
    try {
      const trends = await apiClient.get<MilkCollectionTrends | null>(
        `${this.BASE_PATH}/milk-collection-trends/`,
        {
          params: { period },
        }
      );
      return trends ?? this.createEmptyMilkCollectionTrends(period);
    } catch (error) {
      if (this.isNoDataError(error)) {
        return this.createEmptyMilkCollectionTrends(period);
      }
      throw error;
    }
  }

  /**
   * Get production summary for today and the current month
   */
  async getProductionSummary(): Promise<ProductionSummary> {
    try {
      const summary = await apiClient.get<ProductionSummary | null>(
        `${this.BASE_PATH}/production-summary/`
      );
      return summary ?? this.createEmptyProductionSummary();
    } catch (error) {
      if (this.isNoDataError(error)) {
        return this.createEmptyProductionSummary();
      }
      throw error;
    }
  }

  /**
   * Get overall inventory status snapshot
   */
  async getInventoryStatus(): Promise<InventoryStatusOverview> {
    try {
      const inventory = await apiClient.get<InventoryStatusOverview | null>(
        `${this.BASE_PATH}/inventory-status/`
      );
      return inventory ?? this.createEmptyInventoryStatus();
    } catch (error) {
      if (this.isNoDataError(error)) {
        return this.createEmptyInventoryStatus();
      }
      throw error;
    }
  }

  /**
   * Get supplier performance analytics
   */
  async getSupplierPerformance(): Promise<SupplierPerformanceOverview> {
    try {
      const performance =
        await apiClient.get<SupplierPerformanceOverview | null>(
          `${this.BASE_PATH}/supplier-performance/`
        );
      return performance ?? this.createEmptySupplierPerformance();
    } catch (error) {
      if (this.isNoDataError(error)) {
        return this.createEmptySupplierPerformance();
      }
      throw error;
    }
  }

  /**
   * Acknowledge a dashboard alert
   */
  async acknowledgeAlert(alertId: number): Promise<DashboardAlert> {
    return apiClient.post<DashboardAlert>(
      `${this.BASE_PATH}/alerts/${alertId}/acknowledge/`
    );
  }

  /**
   * Resolve a dashboard alert
   */
  async resolveAlert(
    alertId: number,
    resolutionNotes?: string
  ): Promise<DashboardAlert> {
    return apiClient.post<DashboardAlert>(
      `${this.BASE_PATH}/alerts/${alertId}/resolve/`,
      { resolution_notes: resolutionNotes }
    );
  }

  /**
   * Dismiss a dashboard alert
   */
  async dismissAlert(alertId: number): Promise<DashboardAlert> {
    return apiClient.post<DashboardAlert>(
      `${this.BASE_PATH}/alerts/${alertId}/dismiss/`
    );
  }
}

// Export singleton instance
export const dashboardService = new DashboardService();
export default dashboardService;
