"use client";

import { motion } from "framer-motion";
import {
  Package,
  AlertTriangle,
  TrendingUp,
  Activity,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { staggerContainer, staggerItem } from "@/lib/utils/animations";

export default function InventoryDashboard() {
  // TODO: Replace with actual API data
  const stats = {
    totalItems: 156,
    lowStockItems: 12,
    totalValue: 245000,
    recentTransactions: 45,
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#5D4037] flex items-center gap-3">
            <Package className="w-6 h-6 sm:w-8 sm:h-8 text-[#8B5A3C]" />
            Inventory Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Monitor stock levels, transactions, and inventory health
          </p>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={staggerItem}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Items
              </CardTitle>
              <Package className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#5D4037]">
                {stats.totalItems}
              </div>
              <p className="text-xs text-gray-500 mt-1">Active inventory items</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="hover:shadow-lg transition-shadow border-orange-200 bg-orange-50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-orange-900">
                Low Stock Alerts
              </CardTitle>
              <AlertTriangle className="w-4 h-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.lowStockItems}
              </div>
              <p className="text-xs text-orange-700 mt-1">Items need restocking</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Value
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ₹{stats.totalValue.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">Current stock value</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Recent Transactions
              </CardTitle>
              <Activity className="w-4 h-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats.recentTransactions}
              </div>
              <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Link href="/inventory/stock">
              <Button
                variant="outline"
                className="w-full justify-between hover:bg-[#8B5A3C] hover:text-white transition-colors"
              >
                <span>Manage Stock</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/inventory/ledger">
              <Button
                variant="outline"
                className="w-full justify-between hover:bg-[#8B5A3C] hover:text-white transition-colors"
              >
                <span>View Ledger</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/inventory/orders">
              <Button
                variant="outline"
                className="w-full justify-between hover:bg-[#8B5A3C] hover:text-white transition-colors"
              >
                <span>Purchase Orders</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
