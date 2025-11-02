"use client";

import { useEffect, useState, type ComponentType } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format, parseISO, subDays } from "date-fns";
import { motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  Clock,
  Factory,
  Info,
  Package,
  RefreshCcw,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { Button } from "@/components/ui/button";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { DashboardErrorBoundary } from "@/components/dashboard/DashboardErrorBoundary";
import { MilkBottle } from "@/components/icons";
import {
  dashboardKeys,
  useDashboardStats,
  useRecentActivities,
  useMilkCollectionChart,
  useProductionChart,
  useDashboardAlerts,
  useMilkCollectionTrends,
  useProductionSummary,
  useInventoryStatus,
  useSupplierPerformance,
  type RecentActivity,
  type MilkCollectionChartData,
  type ProductionChartData,
  type DashboardAlert,
  type MilkCollectionTrends,
  type ProductionSummary,
  type InventoryStatusOverview,
  type SupplierPerformanceOverview,
} from "@/hooks/api/dashboard";

type StatCardConfig = {
  id: string;
  title: string;
  value: string;
  unit?: string;
  trend: {
    value: number;
    isPositive: boolean;
  };
  icon: ComponentType<{ className?: string }>;
  color: "blue" | "green" | "purple" | "orange";
};

type QuickStatConfig = {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  color: "blue" | "yellow" | "red" | "orange";
};

type TimelineActivity = RecentActivity & {
  time: string;
  date: string;
};

type EnhancedAlert = DashboardAlert & {
  severity: DashboardAlert["type"];
  time: string;
  actionRequired: boolean;
};

export default function DashboardPage() {
  return (
    <DashboardErrorBoundary>
      <DashboardContent />
    </DashboardErrorBoundary>
  );
}

function DashboardContent() {
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState(() => ({
    startDate: format(subDays(new Date(), 30), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
  }));
  const [selectedYear, setSelectedYear] = useState<number>(2025);

  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useDashboardStats();

  const { data: activities, isLoading: activitiesLoading } =
    useRecentActivities({ limit: 10 });

  const { data: milkChart, isLoading: milkChartLoading } =
    useMilkCollectionChart({
      start_date: dateRange.startDate,
      end_date: dateRange.endDate,
    });

  const { data: productionChart, isLoading: productionLoading } =
    useProductionChart({ year: selectedYear });

  const { data: alerts, isLoading: alertsLoading } = useDashboardAlerts();

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.stats() });
      queryClient.invalidateQueries({
        queryKey: dashboardKeys.activities({ limit: 10 }),
      });
    }, 30_000);

    return () => window.clearInterval(intervalId);
  }, [queryClient]);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: dashboardKeys.stats() });
    queryClient.invalidateQueries({
      queryKey: dashboardKeys.activities({ limit: 10 }),
    });
    queryClient.invalidateQueries({
      queryKey: dashboardKeys.milkChart({
        start_date: dateRange.startDate,
        end_date: dateRange.endDate,
      }),
    });
    queryClient.invalidateQueries({
      queryKey: dashboardKeys.productionChart({ year: selectedYear }),
    });
    queryClient.invalidateQueries({ queryKey: dashboardKeys.alerts() });
  };

  const statCards: StatCardConfig[] = stats
    ? [
        {
          id: "milk-collected",
          title: "Total Milk Collected",
          value: formatDecimal(stats.total_milk_collected),
          unit: "L",
          trend: {
            value: Math.abs(stats.total_milk_collected_trend),
            isPositive: stats.total_milk_collected_trend >= 0,
          },
          icon: MilkBottle,
          color: "blue",
        },
        {
          id: "vendors",
          title: "Active Vendors",
          value: formatCount(stats.total_vendors),
          trend: {
            value: Math.abs(stats.total_vendors_trend),
            isPositive: stats.total_vendors_trend >= 0,
          },
          icon: Users,
          color: "green",
        },
        {
          id: "production",
          title: "Total Production",
          value: formatDecimal(stats.total_production),
          unit: "units",
          trend: {
            value: Math.abs(stats.total_production_trend),
            isPositive: stats.total_production_trend >= 0,
          },
          icon: Factory,
          color: "purple",
        },
        {
          id: "inventory",
          title: "Inventory Value",
          value: formatCurrency(stats.total_inventory_value),
          trend: {
            value: Math.abs(stats.total_inventory_value_trend),
            isPositive: stats.total_inventory_value_trend >= 0,
          },
          icon: Package,
          color: "orange",
        },
      ]
    : [];

  const quickStats: QuickStatConfig[] = stats
    ? [
        {
          label: "Active Employees",
          value: formatCount(stats.active_employees),
          icon: Users,
          color: "blue",
        },
        {
          label: "Pending Payments",
          value: formatCount(stats.pending_payments),
          icon: Clock,
          color: "yellow",
        },
        {
          label: "Low Stock Items",
          value: formatCount(stats.low_stock_items),
          icon: Package,
          color: "red",
        },
        {
          label: "Quality Issues",
          value: formatCount(stats.quality_issues),
          icon: AlertCircle,
          color: "orange",
        },
      ]
    : [];

  const milkChartData: MilkCollectionChartData[] = milkChart
    ? milkChart.map((entry) => ({
        ...entry,
        date: entry.date,
      }))
    : [];

  const productionChartData: ProductionChartData[] = productionChart ?? [];

  const formattedActivities: TimelineActivity[] = activities
    ? activities.map((activity) => {
        const timestamp = parseISO(activity.timestamp);
        return {
          ...activity,
          time: format(timestamp, "HH:mm"),
          date: format(timestamp, "dd MMM yyyy"),
        };
      })
    : [];

  const formattedAlerts: EnhancedAlert[] = alerts
    ? alerts.map((alert) => {
        const timestamp = parseISO(alert.timestamp);
        return {
          ...alert,
          severity: alert.type,
          time: format(timestamp, "HH:mm"),
          actionRequired: alert.type === "warning" || alert.type === "error",
        };
      })
    : [];

  if (statsLoading) {
    return <DashboardSkeleton />;
  }

  if (statsError) {
    return (
      <ErrorMessage
        message="Failed to load dashboard data"
        onRetry={handleRefresh}
      />
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Real-time milk collection, production, and inventory insights.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(), "EEEE, MMMM d, yyyy")}</span>
          </div>
          <Button variant="outline" className="gap-2" onClick={handleRefresh}>
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.id} {...card} />
        ))}
      </div>

      {quickStats.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickStats.map((stat) => (
            <QuickStatCard key={stat.label} {...stat} />
          ))}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Milk Collection Trends
            </h2>
            <DateRangePicker
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onChange={setDateRange}
            />
          </div>
          {milkChartLoading && milkChartData.length === 0 ? (
            <ChartSkeleton />
          ) : milkChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={milkChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  stroke="#9ca3af"
                  fontSize={12}
                  tickFormatter={(value) => format(parseISO(value), "dd MMM")}
                />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cow_milk"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Cow Milk"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="buffalo_milk"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Buffalo Milk"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Total"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="No milk collection data for this range." />
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Production Overview
            </h2>
            <YearSelector value={selectedYear} onChange={setSelectedYear} />
          </div>
          {productionLoading && productionChartData.length === 0 ? (
            <ChartSkeleton />
          ) : productionChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={productionChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="milk" fill="#3b82f6" name="Milk" />
                <Bar dataKey="curd" fill="#ef4444" name="Curd" />
                <Bar dataKey="paneer" fill="#10b981" name="Paneer" />
                <Bar dataKey="ghee" fill="#f59e0b" name="Ghee" />
                <Bar dataKey="butter" fill="#8b5cf6" name="Butter" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="No production data for this year." />
          )}
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2"
        >
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Recent Activities
          </h2>
          {activitiesLoading ? (
            <ActivitySkeleton />
          ) : (
            <ActivityTimeline activities={formattedActivities} />
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            System Alerts
          </h2>
          <AlertsList alerts={formattedAlerts} isLoading={alertsLoading} />
        </motion.div>
      </div>
    </div>
  );
}

interface StatCardProps extends StatCardConfig {}

function StatCard({
  title,
  value,
  unit,
  trend,
  icon: Icon,
  color,
}: StatCardProps) {
  const colorClasses: Record<StatCardConfig["color"], string> = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="cursor-pointer rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className={`rounded-lg p-3 ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div
          className={`flex items-center gap-1 text-sm font-semibold ${
            trend.isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {trend.isPositive ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          <span>{formatDecimal(trend.value, 1)}%</span>
        </div>
      </div>
      <h3 className="mb-1 text-sm font-medium text-gray-600">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">
        {unit === "₹" ? value : `${value}${unit ? ` ${unit}` : ""}`}
      </p>
    </motion.div>
  );
}

interface QuickStatCardProps extends QuickStatConfig {}

function QuickStatCard({
  label,
  value,
  icon: Icon,
  color,
}: QuickStatCardProps) {
  const colorClasses: Record<QuickStatConfig["color"], string> = {
    blue: "border-blue-200 bg-blue-50 text-blue-600",
    yellow: "border-yellow-200 bg-yellow-50 text-yellow-600",
    red: "border-red-200 bg-red-50 text-red-600",
    orange: "border-orange-200 bg-orange-50 text-orange-600",
  };

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-4 ${colorClasses[color]}`}
    >
      <Icon className="h-8 w-8" />
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm font-medium opacity-80">{label}</p>
      </div>
    </div>
  );
}

interface ActivityTimelineProps {
  activities: TimelineActivity[];
}

function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return <EmptyState message="No recent activities" />;
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const Icon = getActivityIcon(activity.type);
        const badgeClasses = getActivityBadge(activity.status);

        return (
          <div
            key={activity.id}
            className="flex flex-col gap-3 rounded-lg border border-gray-100 p-4 transition-shadow hover:shadow-md sm:flex-row sm:items-center"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${badgeClasses}`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {activity.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {activity.description}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{activity.user}</span>
                  <span>•</span>
                  <span>
                    {activity.date} · {activity.time}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface AlertsListProps {
  alerts: EnhancedAlert[];
  isLoading: boolean;
}

function AlertsList({ alerts, isLoading }: AlertsListProps) {
  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (alerts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500">
        All systems normal.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const Icon =
          alert.severity === "warning"
            ? AlertTriangle
            : alert.severity === "error"
            ? AlertCircle
            : Info;
        const badgeClasses = getAlertBadge(alert.severity);

        return (
          <div
            key={alert.id}
            className="rounded-lg border border-gray-100 p-4 transition-shadow hover:shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className={`rounded-full p-2 ${badgeClasses}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {alert.message}
                </p>
                <p className="mt-1 text-xs text-gray-500">{alert.time}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onChange: (range: { startDate: string; endDate: string }) => void;
}

function DateRangePicker({
  startDate,
  endDate,
  onChange,
}: DateRangePickerProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <input
        type="date"
        value={startDate}
        onChange={(event) =>
          onChange({ startDate: event.target.value, endDate })
        }
        className="rounded border border-gray-200 px-2 py-1 text-sm shadow-sm focus:border-dairy-primary focus:outline-none"
      />
      <span className="text-gray-400">—</span>
      <input
        type="date"
        value={endDate}
        onChange={(event) =>
          onChange({ startDate, endDate: event.target.value })
        }
        className="rounded border border-gray-200 px-2 py-1 text-sm shadow-sm focus:border-dairy-primary focus:outline-none"
      />
    </div>
  );
}

interface YearSelectorProps {
  value: number;
  onChange: (year: number) => void;
}

function YearSelector({ value, onChange }: YearSelectorProps) {
  const currentYear = new Date().getFullYear();
  const options = Array.from({ length: 5 }, (_, index) => currentYear - index);
  if (!options.includes(value)) {
    options.push(value);
  }
  const years = options.sort((a, b) => b - a);

  return (
    <select
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="rounded border border-gray-200 px-3 py-1 text-sm shadow-sm focus:border-dairy-primary focus:outline-none"
    >
      {years.map((yearOption) => (
        <option key={yearOption} value={yearOption}>
          {yearOption}
        </option>
      ))}
    </select>
  );
}

function ChartSkeleton() {
  return (
    <div className="flex h-80 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-50">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
      <p className="text-sm text-gray-500">Loading chart data…</p>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="h-16 animate-pulse rounded-lg border border-gray-100 bg-gray-100"
        />
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-500">
      {message}
    </div>
  );
}

function getActivityIcon(type: string): ComponentType<{ className?: string }> {
  const mapping: Record<string, ComponentType<{ className?: string }>> = {
    "Milk Collection": MilkBottle,
    Production: Factory,
    Payment: Clock,
    "Quality Check": Info,
  };
  return mapping[type] ?? Info;
}

function getActivityBadge(status: RecentActivity["status"]): string {
  const mapping: Record<RecentActivity["status"], string> = {
    success: "bg-green-100 text-green-600",
    warning: "bg-yellow-100 text-yellow-600",
    error: "bg-red-100 text-red-600",
    info: "bg-blue-100 text-blue-600",
  };
  return mapping[status] ?? "bg-gray-100 text-gray-600";
}

function getAlertBadge(type: DashboardAlert["type"]): string {
  const mapping: Record<DashboardAlert["type"], string> = {
    warning: "bg-yellow-100 text-yellow-600",
    error: "bg-red-100 text-red-600",
    info: "bg-blue-100 text-blue-600",
  };
  return mapping[type] ?? "bg-gray-100 text-gray-600";
}

function formatDecimal(value: number, fractionDigits = 2) {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

function formatCount(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}
