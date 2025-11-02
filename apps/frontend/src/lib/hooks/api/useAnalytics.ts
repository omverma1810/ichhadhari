/**
 * Analytics React Query Hooks
 * Custom hooks for analytics, reports, and exports
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import analyticsService, {
  SalesReport,
  ProcurementReport,
  ProductionReport,
  InventoryReport,
  FinancialReport,
  VendorPerformance,
  EmployeePerformance,
  DashboardAnalytics,
  ReportFilters,
} from "@/lib/services/analytics.service";

// ==================== QUERY KEY FACTORY ====================

export const analyticsKeys = {
  all: ["analytics"] as const,

  // Sales
  sales: () => [...analyticsKeys.all, "sales"] as const,
  salesReport: (filters?: ReportFilters) =>
    [...analyticsKeys.sales(), "report", filters] as const,
  salesSummary: (filters?: ReportFilters) =>
    [...analyticsKeys.sales(), "summary", filters] as const,

  // Procurement
  procurement: () => [...analyticsKeys.all, "procurement"] as const,
  procurementReport: (filters?: ReportFilters) =>
    [...analyticsKeys.procurement(), "report", filters] as const,
  procurementSummary: (filters?: ReportFilters) =>
    [...analyticsKeys.procurement(), "summary", filters] as const,

  // Production
  production: () => [...analyticsKeys.all, "production"] as const,
  productionReport: (filters?: ReportFilters) =>
    [...analyticsKeys.production(), "report", filters] as const,
  productionSummary: (filters?: ReportFilters) =>
    [...analyticsKeys.production(), "summary", filters] as const,

  // Inventory
  inventory: () => [...analyticsKeys.all, "inventory"] as const,
  inventoryReport: (filters?: ReportFilters) =>
    [...analyticsKeys.inventory(), "report", filters] as const,
  inventorySummary: (filters?: ReportFilters) =>
    [...analyticsKeys.inventory(), "summary", filters] as const,

  // Financial
  financial: () => [...analyticsKeys.all, "financial"] as const,
  financialReport: (filters?: ReportFilters) =>
    [...analyticsKeys.financial(), "report", filters] as const,
  financialSummary: (filters?: ReportFilters) =>
    [...analyticsKeys.financial(), "summary", filters] as const,

  // Performance
  vendorPerformance: (filters?: ReportFilters) =>
    [...analyticsKeys.all, "vendor-performance", filters] as const,
  employeePerformance: (filters?: ReportFilters) =>
    [...analyticsKeys.all, "employee-performance", filters] as const,

  // Dashboard
  dashboard: (filters?: ReportFilters) =>
    [...analyticsKeys.all, "dashboard", filters] as const,
};

// ==================== SALES REPORTS ====================

export const useSalesReport = (filters?: ReportFilters) => {
  return useQuery<SalesReport[]>({
    queryKey: analyticsKeys.salesReport(filters),
    queryFn: () => analyticsService.getSalesReport(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSalesSummary = (filters?: ReportFilters) => {
  return useQuery({
    queryKey: analyticsKeys.salesSummary(filters),
    queryFn: () => analyticsService.getSalesSummary(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useExportSalesReport = () => {
  const exportReport = async (filters?: ReportFilters) => {
    try {
      const blob = await analyticsService.exportSalesReport(filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `sales-report-${new Date().toISOString().split("T")[0]}.${
        filters?.format || "pdf"
      }`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Sales report downloaded successfully");
    } catch (error) {
      toast.error("Failed to download sales report");
      throw error;
    }
  };

  return { exportReport };
};

// ==================== PROCUREMENT REPORTS ====================

export const useProcurementReport = (filters?: ReportFilters) => {
  return useQuery<ProcurementReport[]>({
    queryKey: analyticsKeys.procurementReport(filters),
    queryFn: () => analyticsService.getProcurementReport(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useProcurementSummary = (filters?: ReportFilters) => {
  return useQuery({
    queryKey: analyticsKeys.procurementSummary(filters),
    queryFn: () => analyticsService.getProcurementSummary(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useExportProcurementReport = () => {
  const exportReport = async (filters?: ReportFilters) => {
    try {
      const blob = await analyticsService.exportProcurementReport(filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `procurement-report-${
        new Date().toISOString().split("T")[0]
      }.${filters?.format || "pdf"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Procurement report downloaded successfully");
    } catch (error) {
      toast.error("Failed to download procurement report");
      throw error;
    }
  };

  return { exportReport };
};

// ==================== PRODUCTION REPORTS ====================

export const useProductionReport = (filters?: ReportFilters) => {
  return useQuery<ProductionReport[]>({
    queryKey: analyticsKeys.productionReport(filters),
    queryFn: () => analyticsService.getProductionReport(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useProductionSummary = (filters?: ReportFilters) => {
  return useQuery({
    queryKey: analyticsKeys.productionSummary(filters),
    queryFn: () => analyticsService.getProductionSummary(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useExportProductionReport = () => {
  const exportReport = async (filters?: ReportFilters) => {
    try {
      const blob = await analyticsService.exportProductionReport(filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `production-report-${
        new Date().toISOString().split("T")[0]
      }.${filters?.format || "pdf"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Production report downloaded successfully");
    } catch (error) {
      toast.error("Failed to download production report");
      throw error;
    }
  };

  return { exportReport };
};

// ==================== INVENTORY REPORTS ====================

export const useInventoryReport = (filters?: ReportFilters) => {
  return useQuery<InventoryReport[]>({
    queryKey: analyticsKeys.inventoryReport(filters),
    queryFn: () => analyticsService.getInventoryReport(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useInventorySummary = (filters?: ReportFilters) => {
  return useQuery({
    queryKey: analyticsKeys.inventorySummary(filters),
    queryFn: () => analyticsService.getInventorySummary(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useExportInventoryReport = () => {
  const exportReport = async (filters?: ReportFilters) => {
    try {
      const blob = await analyticsService.exportInventoryReport(filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `inventory-report-${
        new Date().toISOString().split("T")[0]
      }.${filters?.format || "pdf"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Inventory report downloaded successfully");
    } catch (error) {
      toast.error("Failed to download inventory report");
      throw error;
    }
  };

  return { exportReport };
};

// ==================== FINANCIAL REPORTS ====================

export const useFinancialReport = (filters?: ReportFilters) => {
  return useQuery<FinancialReport[]>({
    queryKey: analyticsKeys.financialReport(filters),
    queryFn: () => analyticsService.getFinancialReport(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useFinancialSummary = (filters?: ReportFilters) => {
  return useQuery({
    queryKey: analyticsKeys.financialSummary(filters),
    queryFn: () => analyticsService.getFinancialSummary(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useExportFinancialReport = () => {
  const exportReport = async (filters?: ReportFilters) => {
    try {
      const blob = await analyticsService.exportFinancialReport(filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `financial-report-${
        new Date().toISOString().split("T")[0]
      }.${filters?.format || "pdf"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Financial report downloaded successfully");
    } catch (error) {
      toast.error("Failed to download financial report");
      throw error;
    }
  };

  return { exportReport };
};

// ==================== PERFORMANCE REPORTS ====================

export const useVendorPerformance = (filters?: ReportFilters) => {
  return useQuery<VendorPerformance[]>({
    queryKey: analyticsKeys.vendorPerformance(filters),
    queryFn: () => analyticsService.getVendorPerformance(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes - less frequent updates for performance data
  });
};

export const useEmployeePerformance = (filters?: ReportFilters) => {
  return useQuery<EmployeePerformance[]>({
    queryKey: analyticsKeys.employeePerformance(filters),
    queryFn: () => analyticsService.getEmployeePerformance(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes - less frequent updates for performance data
  });
};

// ==================== DASHBOARD ANALYTICS ====================

export const useDashboardAnalytics = (filters?: ReportFilters) => {
  return useQuery<DashboardAnalytics>({
    queryKey: analyticsKeys.dashboard(filters),
    queryFn: () => analyticsService.getDashboardAnalytics(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes - frequent updates for dashboard
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
  });
};
