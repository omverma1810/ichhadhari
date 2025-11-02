/**
 * Analytics Service
 * Handles all API calls related to reports, analytics, and data exports
 */

import api from "@/lib/api/client";

// ==================== INTERFACES ====================

export interface SalesReport {
  date: string;
  product: string;
  product_id: number;
  quantity_sold: number;
  revenue: number;
  profit: number;
  profit_margin: number;
}

export interface ProcurementReport {
  date: string;
  vendor: string;
  vendor_id: number;
  milk_type: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface ProductionReport {
  date: string;
  product: string;
  product_id: number;
  quantity_produced: number;
  raw_material_cost: number;
  production_cost: number;
  unit_cost: number;
}

export interface InventoryReport {
  item: string;
  item_id: number;
  category: string;
  current_stock: number;
  unit: string;
  unit_price: number;
  total_value: number;
  status: string;
}

export interface FinancialReport {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  profit_margin: number;
  revenue_growth: number;
}

export interface VendorPerformance {
  vendor_id: number;
  vendor_name: string;
  total_supply: number;
  average_quality: number;
  on_time_delivery: number;
  payment_punctuality: number;
  overall_rating: number;
}

export interface EmployeePerformance {
  employee_id: number;
  employee_name: string;
  department: string;
  attendance_rate: number;
  productivity_score: number;
  quality_score: number;
  overall_rating: number;
}

export interface DashboardAnalytics {
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  profit_margin: number;
  revenue_trend: Array<{ date: string; value: number }>;
  expense_trend: Array<{ date: string; value: number }>;
  top_products: Array<{ name: string; revenue: number }>;
  top_vendors: Array<{ name: string; supply: number }>;
}

export interface ReportFilters {
  start_date?: string;
  end_date?: string;
  vendor_id?: number;
  product_id?: number;
  employee_id?: number;
  department?: string;
  category?: string;
  format?: "json" | "pdf" | "excel" | "csv";
}

// ==================== SALES REPORTS ====================

const getSalesReport = (filters?: ReportFilters) =>
  api.get<SalesReport[]>("/analytics/sales/", { params: filters });

const getSalesSummary = (filters?: ReportFilters) =>
  api.get("/analytics/sales/summary/", { params: filters });

const exportSalesReport = (filters?: ReportFilters) =>
  api.get<Blob>("/analytics/sales/export/", {
    params: filters,
    responseType: "blob",
  });

// ==================== PROCUREMENT REPORTS ====================

const getProcurementReport = (filters?: ReportFilters) =>
  api.get<ProcurementReport[]>("/analytics/procurement/", {
    params: filters,
  });

const getProcurementSummary = (filters?: ReportFilters) =>
  api.get("/analytics/procurement/summary/", { params: filters });

const exportProcurementReport = (filters?: ReportFilters) =>
  api.get<Blob>("/analytics/procurement/export/", {
    params: filters,
    responseType: "blob",
  });

// ==================== PRODUCTION REPORTS ====================

const getProductionReport = (filters?: ReportFilters) =>
  api.get<ProductionReport[]>("/analytics/production/", {
    params: filters,
  });

const getProductionSummary = (filters?: ReportFilters) =>
  api.get("/analytics/production/summary/", { params: filters });

const exportProductionReport = (filters?: ReportFilters) =>
  api.get<Blob>("/analytics/production/export/", {
    params: filters,
    responseType: "blob",
  });

// ==================== INVENTORY REPORTS ====================

const getInventoryReport = (filters?: ReportFilters) =>
  api.get<InventoryReport[]>("/analytics/inventory/", { params: filters });

const getInventorySummary = (filters?: ReportFilters) =>
  api.get("/analytics/inventory/summary/", { params: filters });

const exportInventoryReport = (filters?: ReportFilters) =>
  api.get<Blob>("/analytics/inventory/export/", {
    params: filters,
    responseType: "blob",
  });

// ==================== FINANCIAL REPORTS ====================

const getFinancialReport = (filters?: ReportFilters) =>
  api.get<FinancialReport[]>("/analytics/financial/", { params: filters });

const getFinancialSummary = (filters?: ReportFilters) =>
  api.get("/analytics/financial/summary/", { params: filters });

const exportFinancialReport = (filters?: ReportFilters) =>
  api.get<Blob>("/analytics/financial/export/", {
    params: filters,
    responseType: "blob",
  });

// ==================== PERFORMANCE REPORTS ====================

const getVendorPerformance = (filters?: ReportFilters) =>
  api.get<VendorPerformance[]>("/analytics/vendor-performance/", {
    params: filters,
  });

const getEmployeePerformance = (filters?: ReportFilters) =>
  api.get<EmployeePerformance[]>("/analytics/employee-performance/", {
    params: filters,
  });

// ==================== DASHBOARD ANALYTICS ====================

const getDashboardAnalytics = (filters?: ReportFilters) =>
  api.get<DashboardAnalytics>("/analytics/dashboard/", { params: filters });

// ==================== EXPORTS ====================

export const analyticsService = {
  // Sales
  getSalesReport,
  getSalesSummary,
  exportSalesReport,

  // Procurement
  getProcurementReport,
  getProcurementSummary,
  exportProcurementReport,

  // Production
  getProductionReport,
  getProductionSummary,
  exportProductionReport,

  // Inventory
  getInventoryReport,
  getInventorySummary,
  exportInventoryReport,

  // Financial
  getFinancialReport,
  getFinancialSummary,
  exportFinancialReport,

  // Performance
  getVendorPerformance,
  getEmployeePerformance,

  // Dashboard
  getDashboardAnalytics,
};

export default analyticsService;
