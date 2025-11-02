/**
 * Dashboard API Hooks
 * React Query hooks for dashboard operations
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dashboardService } from "@/services/api";
import { getErrorMessage } from "@/lib/utils/api-helpers";
import { toast } from "sonner";
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

// Query Keys
export const dashboardKeys = {
  all: ["dashboard"] as const,
  stats: () => [...dashboardKeys.all, "stats"] as const,
  activities: (filters?: ActivityFilters) =>
    [...dashboardKeys.all, "activities", filters] as const,
  milkChart: (params?: MilkCollectionChartParams) =>
    [...dashboardKeys.all, "milk-chart", params] as const,
  productionChart: (params?: ProductionChartParams) =>
    [...dashboardKeys.all, "production-chart", params] as const,
  alerts: (filters?: AlertFilters) =>
    [...dashboardKeys.all, "alerts", filters] as const,
  milkTrends: (period: MilkCollectionTrendPeriod) =>
    [...dashboardKeys.all, "milk-trends", period] as const,
  productionSummary: () =>
    [...dashboardKeys.all, "production-summary"] as const,
  inventoryStatus: () => [...dashboardKeys.all, "inventory-status"] as const,
  supplierPerformance: () =>
    [...dashboardKeys.all, "supplier-performance"] as const,
};

// ============ QUERIES ============

/**
 * Get dashboard statistics
 */
export const useDashboardStats = () => {
  return useQuery<DashboardStats>({
    queryKey: dashboardKeys.stats(),
    queryFn: () => dashboardService.getStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

/**
 * Get recent activities
 */
export const useRecentActivities = (filters?: ActivityFilters | number) => {
  const queryFilters =
    typeof filters === "number" ? { limit: filters } : filters;

  return useQuery<Activity[]>({
    queryKey: dashboardKeys.activities(queryFilters),
    queryFn: () => dashboardService.getActivities(queryFilters),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Get milk collection chart data
 */
export const useMilkCollectionChart = (params?: MilkCollectionChartParams) => {
  return useQuery<MilkCollectionChartData[]>({
    queryKey: dashboardKeys.milkChart(params),
    queryFn: () => dashboardService.getMilkCollectionChart(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get production chart data
 */
export const useProductionChart = (params?: ProductionChartParams) => {
  return useQuery<ProductionChartData[]>({
    queryKey: dashboardKeys.productionChart(params),
    queryFn: () => dashboardService.getProductionChart(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get milk collection trends for analytics
 */
export const useMilkCollectionTrends = (
  period: MilkCollectionTrendPeriod = "30d"
) => {
  return useQuery<MilkCollectionTrends>({
    queryKey: dashboardKeys.milkTrends(period),
    queryFn: () => dashboardService.getMilkCollectionTrends(period),
    staleTime: 1 * 60 * 1000,
  });
};

/**
 * Get production summary snapshot
 */
export const useProductionSummary = () => {
  return useQuery<ProductionSummary>({
    queryKey: dashboardKeys.productionSummary(),
    queryFn: () => dashboardService.getProductionSummary(),
    staleTime: 1 * 60 * 1000,
  });
};

/**
 * Get inventory status overview
 */
export const useInventoryStatus = () => {
  return useQuery<InventoryStatusOverview>({
    queryKey: dashboardKeys.inventoryStatus(),
    queryFn: () => dashboardService.getInventoryStatus(),
    staleTime: 1 * 60 * 1000,
  });
};

/**
 * Get supplier performance metrics
 */
export const useSupplierPerformance = () => {
  return useQuery<SupplierPerformanceOverview>({
    queryKey: dashboardKeys.supplierPerformance(),
    queryFn: () => dashboardService.getSupplierPerformance(),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Get dashboard alerts
 */
export const useDashboardAlerts = (filters?: AlertFilters) => {
  return useQuery<DashboardAlert[]>({
    queryKey: dashboardKeys.alerts(filters),
    queryFn: () => dashboardService.getAlerts(filters),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
};

// ============ MUTATIONS ============

/**
 * Acknowledge dashboard alert
 */
export const useAcknowledgeAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (alertId: number) => dashboardService.acknowledgeAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.alerts() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.stats() });
      toast.success("Alert acknowledged");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

/**
 * Resolve dashboard alert
 */
export const useResolveAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ alertId, notes }: { alertId: number; notes?: string }) =>
      dashboardService.resolveAlert(alertId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.alerts() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.stats() });
      toast.success("Alert resolved");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

/**
 * Dismiss dashboard alert
 */
export const useDismissAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (alertId: number) => dashboardService.dismissAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.alerts() });
      toast.success("Alert dismissed");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};
