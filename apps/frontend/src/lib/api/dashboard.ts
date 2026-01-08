import { apiClient } from "./client";

// Dashboard Stats types
export interface DashboardStats {
  milk_collection: {
    today: number;
    yesterday: number;
    this_month: number;
    last_month: number;
    percentage_change: number;
  };
  production: {
    batches_in_progress: number;
    batches_completed_today: number;
    total_production_today: number;
    percentage_change: number;
  };
  inventory: {
    low_stock_items: number;
    total_items: number;
    total_value: number;
    alerts_count: number;
  };
  employees: {
    total_employees: number;
    present_today: number;
    on_leave_today: number;
    attendance_percentage: number;
  };
  vendors: {
    active_vendors: number;
    pending_purchase_orders: number;
    total_outstanding: number;
  };
  financial: {
    total_revenue_today: number;
    total_expenses_today: number;
    net_profit_today: number;
    percentage_change: number;
  };
}

// Recent Activity types
export interface ActivityItem {
  id: number;
  type:
    | "milk_collection"
    | "production_batch"
    | "inventory"
    | "employee"
    | "vendor"
    | "payment";
  title: string;
  description: string;
  user: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface RecentActivity {
  activities: ActivityItem[];
  total: number;
}

// Chart Data types
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface MilkCollectionChart {
  daily: ChartDataPoint[];
  weekly: ChartDataPoint[];
  monthly: ChartDataPoint[];
}

export interface ProductionChart {
  batches_by_product: Array<{
    product: string;
    count: number;
    quantity: number;
  }>;
  daily_production: ChartDataPoint[];
  efficiency_trend: ChartDataPoint[];
}

export interface InventoryChart {
  stock_levels: Array<{
    category: string;
    current: number;
    minimum: number;
    maximum: number;
  }>;
  consumption_trend: ChartDataPoint[];
}

export interface AttendanceChart {
  daily_attendance: ChartDataPoint[];
  department_wise: Array<{
    department: string;
    present: number;
    total: number;
  }>;
}

export interface FinancialChart {
  revenue_vs_expense: Array<{
    date: string;
    revenue: number;
    expense: number;
  }>;
  profit_trend: ChartDataPoint[];
  category_wise_expense: Array<{
    category: string;
    amount: number;
  }>;
}

export type DashboardChartType =
  | "milk_collection"
  | "production"
  | "inventory"
  | "attendance"
  | "financial";

export interface DashboardChartResponseMap {
  milk_collection: MilkCollectionChart;
  production: ProductionChart;
  inventory: InventoryChart;
  attendance: AttendanceChart;
  financial: FinancialChart;
}

export const dashboardAPI = {
  /**
   * Get dashboard statistics
   */
  getStats: (params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<DashboardStats> =>
    apiClient.get<DashboardStats>("/api/v1/dashboard/stats/", { params }),

  /**
   * Get recent activity
   */
  getRecentActivity: (params?: {
    limit?: number;
    offset?: number;
    type?: string;
  }): Promise<RecentActivity> =>
    apiClient.get<RecentActivity>("/api/v1/dashboard/recent-activity/", {
      params,
    }),

  /**
   * Get chart data by type
   */
  getCharts: <T extends DashboardChartType>(
    type: T,
    params?: {
      start_date?: string;
      end_date?: string;
      period?: "daily" | "weekly" | "monthly";
    }
  ): Promise<DashboardChartResponseMap[T]> =>
    apiClient.get<DashboardChartResponseMap[T]>(`/api/v1/dashboard/charts/${type}/`, {
      params,
    }),

  /**
   * Get milk collection chart data
   */
  getMilkCollectionChart: (params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<MilkCollectionChart> =>
    apiClient.get<MilkCollectionChart>("/api/v1/dashboard/charts/milk-collection/", {
      params,
    }),

  /**
   * Get production chart data
   */
  getProductionChart: (params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<ProductionChart> =>
    apiClient.get<ProductionChart>("/api/v1/dashboard/charts/production/", {
      params,
    }),

  /**
   * Get inventory chart data
   */
  getInventoryChart: (params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<InventoryChart> =>
    apiClient.get<InventoryChart>("/api/v1/dashboard/charts/inventory/", {
      params,
    }),

  /**
   * Get attendance chart data
   */
  getAttendanceChart: (params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<AttendanceChart> =>
    apiClient.get<AttendanceChart>("/api/v1/dashboard/charts/attendance/", {
      params,
    }),

  /**
   * Get financial chart data
   */
  getFinancialChart: (params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<FinancialChart> =>
    apiClient.get<FinancialChart>("/api/v1/dashboard/charts/financial/", {
      params,
    }),

  /**
   * Get alerts summary
   */
  getAlertsSummary: async (): Promise<{
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  }> => {
    return await apiClient.get("/api/v1/dashboard/alerts-summary/");
  },

  /**
   * Get quick stats for homepage widgets
   */
  getQuickStats: async (): Promise<{
    milk_collected_today: number;
    batches_in_progress: number;
    employees_present: number;
    low_stock_alerts: number;
  }> => {
    return await apiClient.get("/api/v1/dashboard/quick-stats/");
  },
};
