/**
 * Dashboard React Query Hooks
 * Hooks that communicate with the dashboard service and expose typed data.
 */

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import {
  dashboardService,
  type DashboardStats,
  type RecentActivity,
  type MilkCollectionChartData,
  type ProductionChartData,
  type DashboardAlert,
} from "@/lib/services/dashboard.service";

/**
 * Stable query keys used by the dashboard module.
 */
export const dashboardKeys = {
  all: ["dashboard"] as const,
  stats: () => [...dashboardKeys.all, "stats"] as const,
  activities: (limit: number) =>
    [...dashboardKeys.all, "activities", limit] as const,
  milkChart: (startDate: string, endDate: string) =>
    [...dashboardKeys.all, "milk-collection", startDate, endDate] as const,
  productionChart: (year: number) =>
    [...dashboardKeys.all, "production", year] as const,
  alerts: () => [...dashboardKeys.all, "alerts"] as const,
};

/**
 * Fetch dashboard summary statistics.
 */
export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: dashboardKeys.stats(),
    queryFn: () => dashboardService.getStats(),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

/**
 * Fetch paginated recent activities list.
 */
export function useRecentActivities(limit: number = 10) {
  return useQuery<RecentActivity[]>({
    queryKey: dashboardKeys.activities(limit),
    queryFn: () => dashboardService.getRecentActivities(limit),
    staleTime: 60_000,
    refetchInterval: 60_000,
    enabled: limit > 0,
  });
}

/**
 * Fetch milk collection chart data for the provided date range.
 */
export function useMilkCollectionChart(startDate: string, endDate: string) {
  return useQuery<MilkCollectionChartData[]>({
    queryKey: dashboardKeys.milkChart(startDate, endDate),
    queryFn: () => dashboardService.getMilkCollectionChart(startDate, endDate),
    staleTime: 5 * 60_000,
    enabled: Boolean(startDate && endDate),
    placeholderData: keepPreviousData,
  });
}

/**
 * Fetch production chart data for the selected year.
 */
export function useProductionChart(year: number) {
  return useQuery<ProductionChartData[]>({
    queryKey: dashboardKeys.productionChart(year),
    queryFn: () => dashboardService.getProductionChart(year),
    staleTime: 5 * 60_000,
    enabled: Boolean(year),
    placeholderData: keepPreviousData,
  });
}

/**
 * Fetch high-priority dashboard alerts.
 */
export function useDashboardAlerts() {
  return useQuery<DashboardAlert[]>({
    queryKey: dashboardKeys.alerts(),
    queryFn: () => dashboardService.getAlerts(),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export type {
  DashboardStats,
  RecentActivity,
  MilkCollectionChartData,
  ProductionChartData,
  DashboardAlert,
} from "@/lib/services/dashboard.service";
