"use client";

import { motion } from "framer-motion";
import {
  Package,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useInventoryDashboard } from "@/lib/hooks/api/useProcurement";
import { formatNumber } from "@/lib/utils/formatters";

export function InventoryWidgets() {
  const router = useRouter();
  const { data: dashboard, isLoading } = useInventoryDashboard();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-32 bg-gray-100" />
          </Card>
        ))}
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  const { stock_overview, recent_activity, alerts } = dashboard;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#5D4037]">
          Inventory Overview
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/inventory/items")}
          className="text-[#8B5A3C] hover:text-[#5D4037]"
        >
          View All
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Stock Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(stock_overview.total_items)}
              </div>
              <p className="mt-1 text-xs text-gray-600">
                Value: ₹{formatNumber(stock_overview.total_value)}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Low Stock */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stock_overview.low_stock}
              </div>
              <p className="mt-1 text-xs text-gray-600">Items need reorder</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Out of Stock */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Out of Stock
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stock_overview.out_of_stock}
              </div>
              <p className="mt-1 text-xs text-gray-600">Urgent action needed</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Reorder Required */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Reorder Required
              </CardTitle>
              <Package className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stock_overview.reorder_required}
              </div>
              <p className="mt-1 text-xs text-gray-600">Below reorder level</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity & Alerts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Recent Activity (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-600">Inward</span>
                </div>
                <span className="font-semibold text-green-600">
                  {recent_activity.inward_transactions}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-600">Outward</span>
                </div>
                <span className="font-semibold text-blue-600">
                  {recent_activity.outward_transactions}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-gray-600">Wastage</span>
                </div>
                <span className="font-semibold text-red-600">
                  {recent_activity.wastage_transactions}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-gray-600">Active Alerts</span>
                </div>
                <span className="font-semibold text-yellow-600">
                  {alerts.active_alerts}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-gray-600">
                    Expiring Soon (30 days)
                  </span>
                </div>
                <span className="font-semibold text-orange-600">
                  {alerts.expiring_soon}
                </span>
              </div>
              {alerts.active_alerts > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/inventory/items?filter=alerts")}
                >
                  View All Alerts
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
