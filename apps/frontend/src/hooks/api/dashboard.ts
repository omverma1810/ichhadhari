export {
  dashboardKeys,
  useDashboardStats,
  useRecentActivities,
  useMilkCollectionChart,
  useProductionChart,
  useDashboardAlerts,
  useAcknowledgeAlert,
  useResolveAlert,
  useDismissAlert,
  useMilkCollectionTrends,
  useProductionSummary,
  useInventoryStatus,
  useSupplierPerformance,
} from "./useDashboard";

export type {
  DashboardStats,
  RecentActivity,
  MilkCollectionChartData,
  ProductionChartData,
  DashboardAlert,
  MilkCollectionTrends,
  ProductionSummary,
  InventoryStatusOverview,
  SupplierPerformanceOverview,
} from "@/types/api";
