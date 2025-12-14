"use client";

import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Split, TrendingUp, Droplet, Package, Milk } from "lucide-react";

import { StatsCard } from "@/components/cards/StatsCard";
import {
  useSegregationStats,
  useMilkTrends,
} from "@/hooks/api/useMilkManagement";
import { formatNumber, formatDateTime } from "@/lib/utils/formatters";
import { staggerContainer, staggerItem } from "@/lib/utils/animations";

const COLORS = {
  premium: "#F5A623",
  standard: "#4A90E2",
  other: "#9CA3AF",
};

export default function MilkSegregationPage() {
  const { data: stats } = useSegregationStats();
  const { data: trends } = useMilkTrends(7);

  const pieData = stats
    ? [
        {
          name: "Premium (8-9%)",
          value: stats.premium.totalLiters,
          color: COLORS.premium,
        },
        {
          name: "Standard (4-5%)",
          value: stats.standard.totalLiters,
          color: COLORS.standard,
        },
        { name: "Other", value: stats.other.totalLiters, color: COLORS.other },
      ]
    : [];

  return (
    <div className="space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="flex items-center gap-3 text-3xl font-bold text-dairy-charcoal">
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Split className="h-8 w-8 text-dairy-blue" />
          </motion.div>
          Milk segregation overview
        </h1>
        <p className="mt-1 text-gray-600">
          View milk categorization by quality and fat percentage
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={staggerItem}>
          <StatsCard
            title="Total stock"
            value={stats?.totalLiters ?? 0}
            icon={Package}
            color="blue"
            valueSuffix="L"
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <StatsCard
            title="Premium quality"
            value={stats?.premium.percentage.toFixed(1) ?? "0"}
            icon={Droplet}
            color="orange"
            change={stats?.premium.percentage}
            valueSuffix="%"
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <StatsCard
            title="Standard quality"
            value={stats?.standard.percentage.toFixed(1) ?? "0"}
            icon={Milk}
            color="green"
            change={stats?.standard.percentage}
            valueSuffix="%"
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <StatsCard
            title="Total batches"
            value={stats?.totalBatches ?? 0}
            icon={TrendingUp}
            color="purple"
          />
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-gray-100 bg-white p-6 shadow-dairy"
        >
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-dairy-charcoal">
            <Droplet className="h-5 w-5 text-dairy-blue" />
            Stock distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `${formatNumber(value)} L`}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-gray-100 bg-white p-6 shadow-dairy"
        >
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-dairy-charcoal">
            <TrendingUp className="h-5 w-5 text-dairy-blue" />
            7-day trends
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trends ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip
                formatter={(value: number) => `${formatNumber(value)} L`}
              />
              <Legend />
              <Bar
                dataKey="premium"
                fill={COLORS.premium}
                name="Premium"
                radius={[8, 8, 0, 0]}
              />
              <Bar
                dataKey="standard"
                fill={COLORS.standard}
                name="Standard"
                radius={[8, 8, 0, 0]}
              />
              <Bar
                dataKey="other"
                fill={COLORS.other}
                name="Other"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center gap-2 text-sm text-gray-500"
      >
        <TrendingUp className="h-4 w-4" />
        <span>
          Last updated: {stats ? formatDateTime(stats.lastUpdated) : "N/A"}
        </span>
      </motion.div>
    </div>
  );
}
