"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Package,
  AlertTriangle,
  TrendingDown,
  Filter,
  Download,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCard } from "@/components/cards/StatsCard";
import { DataTable, type Column } from "@/components/tables/DataTable";
import {
  useStock,
  useInventoryStats,
  useExpiryAlerts,
} from "@/lib/hooks/useInventory";
import { formatNumber, formatDate } from "@/lib/utils/formatters";
import { Warehouse, BoxStack, AlertIcon } from "@/components/icons";
import { staggerContainer, staggerItem } from "@/lib/utils/animations";
import type { InventoryItem } from "@/lib/services/inventory.service";
import { toast } from "sonner";

// Local types for the page
interface StockItem extends InventoryItem {
  productName?: string;
  productCategory?: string;
  batchNumber?: string;
  locationName?: string;
  quantity?: number;
  expiryDate?: string;
  expiryStatus?: "fresh" | "expiring_soon" | "critical" | "expired";
  daysToExpiry?: number;
}

interface ExpiryAlert {
  id: number;
  productName: string;
  batchNumber: string;
  locationName: string;
  quantity: number;
  daysToExpiry: number;
  severity: "low" | "medium" | "high" | "critical";
}

export default function StockOverviewPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const { data: stockData, isLoading } = useStock({ page, limit: 10, search });
  const { data: stats } = useInventoryStats();
  const { data: expiryAlerts } = useExpiryAlerts();

  const handleSearch = (query: string) => {
    setSearch(query);
    setPage(1);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);

      if (!filteredData || filteredData.length === 0) {
        toast.error("No data to export");
        return;
      }

      // Export functionality - CSV format
      const csvData = filteredData.map((item: StockItem) => ({
        Name: item.name,
        Code: item.item_code,
        Category: item.category,
        Stock: item.current_stock,
        Unit: item.unit,
        Status: item.status,
        Location: item.storage_location,
        "Reorder Level": item.reorder_level,
        "Unit Price": item.unit_price,
        "Total Value": item.total_value,
      }));

      const csvContent = [
        Object.keys(csvData[0] || {}).join(","),
        ...csvData.map((row: Record<string, unknown>) =>
          Object.values(row).join(","),
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `inventory-stock-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Stock export generated successfully!");
    } catch (error) {
      toast.error("Failed to export stock", {
        description: (error as Error)?.message ?? "Something went wrong",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusBadge = (status: InventoryItem["status"] | undefined) => {
    if (!status) {
      return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }

    const config: Record<
      InventoryItem["status"],
      { color: string; label: string }
    > = {
      in_stock: { color: "bg-green-100 text-green-800", label: "In Stock" },
      low_stock: { color: "bg-yellow-100 text-yellow-800", label: "Low Stock" },
      out_of_stock: { color: "bg-red-100 text-red-800", label: "Out of Stock" },
      overstocked: { color: "bg-blue-100 text-blue-800", label: "Overstocked" },
    };

    const { color, label } = config[status];
    return <Badge className={color}>{label}</Badge>;
  };

  const filteredData = useMemo(() => {
    if (!stockData?.results) {
      return [] as StockItem[];
    }

    switch (activeTab) {
      case "in_stock":
      case "low_stock":
      case "out_of_stock":
        return stockData.results.filter(
          (item: InventoryItem) => item.status === activeTab,
        ) as StockItem[];
      case "expiring":
        return stockData.results.filter(
          (item: StockItem) =>
            item.expiryStatus &&
            ["expiring_soon", "critical"].includes(item.expiryStatus),
        ) as StockItem[];
      default:
        return stockData.results as StockItem[];
    }
  }, [stockData?.results, activeTab]);

  const columns: Column<StockItem>[] = [
    {
      key: "name",
      label: "Product",
      render: (value, row) => (
        <div>
          <p className="font-semibold text-dairy-charcoal">{value as string}</p>
          <p className="text-xs text-gray-500">{row.category}</p>
        </div>
      ),
    },
    {
      key: "item_code",
      label: "Code",
      render: (value) => (
        <span className="font-mono text-xs font-semibold text-dairy-blue">
          {value as string}
        </span>
      ),
    },
    {
      key: "storage_location",
      label: "Location",
    },
    {
      key: "current_stock",
      label: "Stock",
      render: (value, row) => (
        <span className="font-semibold">
          {formatNumber(value as number)} {row.unit}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => getStatusBadge(value as InventoryItem["status"]),
    },
    {
      key: "last_restocked_date",
      label: "Last Restocked",
      render: (value) =>
        value ? (
          <div className="text-sm">{formatDate(value as string)}</div>
        ) : (
          <span className="text-sm text-gray-400">Never</span>
        ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-dairy-charcoal flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Warehouse className="w-8 h-8 text-dairy-blue" />
            </motion.div>
            Inventory & Stock Management
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor and manage stock across all locations
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={isExporting}
              className="w-full sm:w-auto"
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? "Exporting..." : "Export"}
            </Button>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={staggerItem}>
          <StatsCard
            title="Total Stock Value"
            value={stats?.totalStockValue ?? 0}
            icon={Package}
            color="blue"
            change={8.5}
            changeLabel="vs last month"
            valuePrefix="₹"
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <StatsCard
            title="Total Items"
            value={stats?.totalItems ?? 0}
            icon={BoxStack}
            color="green"
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <StatsCard
            title="Low Stock Items"
            value={stats?.lowStockItems ?? 0}
            icon={TrendingDown}
            color="orange"
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <StatsCard
            title="Expiring Soon"
            value={stats?.expiringItems ?? 0}
            icon={AlertTriangle}
            color="red"
          />
        </motion.div>
      </motion.div>

      {expiryAlerts && expiryAlerts.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-linear-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-6"
        >
          <div className="flex items-start gap-4">
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center shrink-0"
            >
              <AlertIcon className="w-6 h-6 text-orange-600" />
            </motion.div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-orange-900 mb-2">
                {expiryAlerts.length} Product
                {expiryAlerts.length > 1 ? "s" : ""} Expiring Soon!
              </h3>
              <div className="space-y-2">
                {expiryAlerts.slice(0, 3).map((alert: ExpiryAlert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {alert.productName}
                      </p>
                      <p className="text-sm text-gray-600">
                        Batch: {alert.batchNumber} • {alert.locationName} •{" "}
                        {alert.quantity} units
                      </p>
                    </div>
                    <Badge
                      className={
                        alert.severity === "critical"
                          ? "bg-red-100 text-red-800"
                          : alert.severity === "high"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {alert.daysToExpiry} days left
                    </Badge>
                  </div>
                ))}
              </div>
              {expiryAlerts.length > 3 ? (
                <Button variant="link" className="mt-2 text-orange-700">
                  View all {expiryAlerts.length} alerts →
                </Button>
              ) : null}
            </div>
          </div>
        </motion.div>
      ) : null}

      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value);
          setPage(1);
        }}
      >
        <TabsList>
          <TabsTrigger value="all">All Stock</TabsTrigger>
          <TabsTrigger value="in_stock">In Stock</TabsTrigger>
          <TabsTrigger value="low_stock">Low Stock</TabsTrigger>
          <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
          <TabsTrigger value="out_of_stock">Out of Stock</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <DataTable
            columns={columns as any}
            data={filteredData as any}
            isLoading={isLoading}
            pagination={
              stockData
                ? {
                    page,
                    totalPages: Math.ceil((stockData.count || 0) / 10),
                    onPageChange: setPage,
                  }
                : undefined
            }
            onSearch={handleSearch}
            onExport={handleExport}
            searchPlaceholder="Search by product, code, or location..."
            emptyIcon={Package}
            emptyTitle="No stock items found"
            emptyDescription="Stock items will appear here once added"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
