/**
 * Dashboard API Types
 */

// Dashboard types

// Dashboard Statistics
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

// Activities
export interface Activity {
  id: string;
  type: string;
  status: "success" | "warning" | "error" | "info";
  title: string;
  description: string;
  user: string;
  timestamp: string;
}

export type RecentActivity = Activity;

export interface ActivityFilters {
  type?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

// Milk Collection Chart
export interface MilkCollectionChartData {
  date: string;
  cow_milk: number;
  buffalo_milk: number;
  total: number;
}

export interface MilkCollectionChartParams {
  start_date?: string;
  end_date?: string;
  group_by?: "day" | "week" | "month";
}

// Production Chart
export interface ProductionChartData {
  month: string;
  milk: number;
  curd: number;
  paneer: number;
  ghee: number;
  butter: number;
}

export interface ProductionChartParams {
  year?: number;
  product_id?: number;
}

// Dashboard Alerts
export interface DashboardAlert {
  id: string;
  type: "warning" | "error" | "info";
  message: string;
  timestamp: string;
}

export interface AlertFilters {
  type?: string;
  start_date?: string;
  end_date?: string;
}

// Additional analytics endpoints

export interface MilkTrend {
  date: string;
  quantity: number;
  fat_percentage?: number;
  snf_percentage?: number;
}

export type MilkCollectionTrendPeriod = "7d" | "30d" | "90d";

export interface MilkCollectionTrendEntry {
  date: string;
  cow_milk: string;
  buffalo_milk: string;
  total: string;
  avg_fat?: string;
  avg_snf?: string;
}

export interface MilkCollectionTrends {
  period: MilkCollectionTrendPeriod;
  trends: MilkCollectionTrendEntry[];
  growth: {
    cow_milk_growth: string;
    buffalo_milk_growth: string;
    total_growth: string;
  };
}

export interface ProductionSummary {
  today: {
    batches: number;
    quantity: string;
    quality_score: string;
  };
  this_month: {
    batches: number;
    quantity: string;
    top_products: Array<{
      product: string;
      quantity: string;
    }>;
  };
}

export interface InventoryCategoryStatus {
  category: string;
  value: string;
  percentage: number;
}

export interface InventoryStatusOverview {
  total_value: string;
  categories: InventoryCategoryStatus[];
  alerts: {
    low_stock: number;
    out_of_stock: number;
    near_expiry: number;
  };
}

export interface SupplierPerformanceEntry {
  supplier_id: number;
  supplier_name: string;
  total_collections: string;
  avg_quality: string;
  on_time_percentage: string;
}

export interface SupplierPerformanceOverview {
  top_suppliers: SupplierPerformanceEntry[];
  quality_distribution: {
    excellent: number;
    good: number;
    average: number;
    poor: number;
  };
}
