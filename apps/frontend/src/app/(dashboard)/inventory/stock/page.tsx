"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  Package,
  AlertTriangle,
  TrendingDown,
  Filter,
  Download,
  Plus,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCard } from "@/components/cards/StatsCard";
import { DataTable, type Column } from "@/components/tables/DataTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
import { useCreateInventoryItem } from "@/hooks/api/useInventory";

const createStockSchema = z.object({
  name: z.string().min(1, "Name is required"),
  item_type: z.enum(["raw_milk", "raw_material", "finished_good", "packaging"]),
  unit: z.enum(["kg", "liter", "piece", "pack", "bag", "box"]),
  cost_per_unit: z.coerce.number().min(0, "Cost must be 0 or more"),
  current_stock: z.coerce.number().min(0, "Stock cannot be negative"),
  min_stock_level: z.coerce.number().min(0, "Minimum stock cannot be negative"),
  max_stock_level: z.coerce.number().min(0, "Maximum stock cannot be negative"),
  reorder_point: z.coerce.number().min(0, "Reorder point cannot be negative"),
  storage_location: z.string().optional(),
  storage_temperature: z.string().optional(),
  description: z.string().optional(),
});

type CreateStockFormData = z.infer<typeof createStockSchema>;

// Local types for the page
interface StockItem extends InventoryItem {
  productName?: string;
  productCategory?: string;
  batchNumber?: string;
  locationName?: string;
  quantity?: number;
  item_id?: string;
  item_type?: string;
  current_quantity?: number;
  min_stock_level?: number;
  max_stock_level?: number;
  reorder_point?: number;
  storage_location?: string;
  storage_temperature?: string;
  updated_at?: string;
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
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const queryClient = useQueryClient();
  const createItem = useCreateInventoryItem();
  const form = useForm<CreateStockFormData>({
    resolver: zodResolver(createStockSchema),
    defaultValues: {
      item_type: "raw_material",
      unit: "kg",
      cost_per_unit: 0,
      current_stock: 0,
      min_stock_level: 0,
      max_stock_level: 0,
      reorder_point: 0,
      storage_location: "",
      storage_temperature: "",
      description: "",
    },
  });

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
        Code: item.item_code ?? item.item_id ?? "-",
        Category: item.category ?? item.item_type ?? "-",
        Stock: getNumericValue(item.current_stock ?? item.current_quantity),
        Unit: item.unit ?? "-",
        Status: getNormalizedStatus(item),
        Location: item.storage_location ?? item.locationName ?? "-",
        "Reorder Level": getNumericValue(
          item.reorder_level ?? item.reorder_point,
        ),
        "Unit Price": getNumericValue(item.unit_price ?? item.cost_per_unit),
        "Total Value": getNumericValue(item.total_value),
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

  const handleCreateStock = async (values: CreateStockFormData) => {
    await createItem.mutateAsync({
      name: values.name,
      item_type: values.item_type,
      unit: values.unit,
      cost_per_unit: values.cost_per_unit,
      current_stock: values.current_stock,
      min_stock_level: values.min_stock_level,
      max_stock_level: values.max_stock_level,
      reorder_point: values.reorder_point,
      storage_location: values.storage_location || undefined,
      storage_temperature: values.storage_temperature || undefined,
      description: values.description || undefined,
    });

    queryClient.invalidateQueries({ queryKey: ["inventory-stock"] });
    queryClient.invalidateQueries({ queryKey: ["inventory-stats"] });
    queryClient.invalidateQueries({ queryKey: ["expiry-alerts"] });
    form.reset();
    setIsCreateOpen(false);
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

  const getNumericValue = (value?: number | string | null) => {
    if (value == null) return 0;
    const parsed = typeof value === "string" ? Number(value) : value;
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const getNormalizedStatus = (item: StockItem) => {
    if (item.status) return item.status;
    const current = getNumericValue(
      item.current_stock ?? item.current_quantity,
    );
    const min = getNumericValue(item.min_stock_level ?? item.reorder_level);
    const max = getNumericValue(item.max_stock_level ?? item.maximum_stock);

    if (current <= 0) return "out_of_stock" as const;
    if (min > 0 && current < min) return "low_stock" as const;
    if (max > 0 && current > max) return "overstocked" as const;
    return "in_stock" as const;
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
          (item) => getNormalizedStatus(item as StockItem) === activeTab,
        ) as unknown as StockItem[];
      case "expiring":
        return stockData.results.filter(
          (item) =>
            (item as any).expiryStatus &&
            ["expiring_soon", "critical"].includes((item as any).expiryStatus),
        ) as unknown as StockItem[];
      default:
        return stockData.results as unknown as StockItem[];
    }
  }, [stockData?.results, activeTab]);

  const columns: Column<StockItem>[] = [
    {
      key: "name",
      label: "Product",
      render: (value, row) => (
        <div>
          <p className="font-semibold text-dairy-charcoal">{value as string}</p>
          <p className="text-xs text-gray-500">
            {row.category ?? row.item_type ?? "-"}
          </p>
        </div>
      ),
    },
    {
      key: "item_code",
      label: "Code",
      render: (value, row) => (
        <span className="font-mono text-xs font-semibold text-dairy-blue">
          {(value as string) || row.item_id || "-"}
        </span>
      ),
    },
    {
      key: "storage_location",
      label: "Location",
      render: (value, row) => (value as string) || row.locationName || "-",
    },
    {
      key: "current_stock",
      label: "Stock",
      render: (value, row) => (
        <span className="font-semibold">
          {formatNumber(getNumericValue(value ?? row.current_quantity))}{" "}
          {row.unit}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (_, row) => getStatusBadge(getNormalizedStatus(row)),
    },
    {
      key: "last_restocked_date",
      label: "Last Restocked",
      render: (value, row) => {
        const dateValue =
          (value as string) || row.updated_at || row.created_at || undefined;
        return dateValue ? (
          <div className="text-sm">{formatDate(dateValue)}</div>
        ) : (
          <span className="text-sm text-gray-400">Never</span>
        );
      },
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
            <Button
              className="w-full bg-linear-to-r from-[#F4A920] via-[#F4A920] to-[#8B5A3C] text-white shadow-[0_10px_20px_rgba(244,169,32,0.25)] transition-transform duration-200 hover:scale-[1.02] hover:from-[#8B5A3C] hover:to-[#F4A920] sm:w-auto"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Stock
            </Button>
          </motion.div>
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

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add New Stock</DialogTitle>
            <DialogDescription>
              Create a new stock item and set its initial quantity.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit(handleCreateStock)}
            className="space-y-6"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name *</Label>
                <Input id="name" {...form.register("name")} />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Item Type *</Label>
                <Select
                  value={form.watch("item_type")}
                  onValueChange={(value) =>
                    form.setValue(
                      "item_type",
                      value as CreateStockFormData["item_type"],
                      {
                        shouldValidate: true,
                      },
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select item type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="raw_milk">Raw Milk</SelectItem>
                    <SelectItem value="raw_material">Raw Material</SelectItem>
                    <SelectItem value="finished_good">Finished Good</SelectItem>
                    <SelectItem value="packaging">Packaging</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Unit *</Label>
                <Select
                  value={form.watch("unit")}
                  onValueChange={(value) =>
                    form.setValue(
                      "unit",
                      value as CreateStockFormData["unit"],
                      {
                        shouldValidate: true,
                      },
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilogram (kg)</SelectItem>
                    <SelectItem value="liter">Liter (L)</SelectItem>
                    <SelectItem value="piece">Piece</SelectItem>
                    <SelectItem value="pack">Pack</SelectItem>
                    <SelectItem value="bag">Bag</SelectItem>
                    <SelectItem value="box">Box</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost_per_unit">Cost per Unit *</Label>
                <Input
                  id="cost_per_unit"
                  type="number"
                  step="0.01"
                  {...form.register("cost_per_unit", { valueAsNumber: true })}
                />
                {form.formState.errors.cost_per_unit && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.cost_per_unit.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="current_stock">Current Stock *</Label>
                <Input
                  id="current_stock"
                  type="number"
                  step="0.01"
                  {...form.register("current_stock", { valueAsNumber: true })}
                />
                {form.formState.errors.current_stock && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.current_stock.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="min_stock_level">Minimum Stock *</Label>
                <Input
                  id="min_stock_level"
                  type="number"
                  step="0.01"
                  {...form.register("min_stock_level", { valueAsNumber: true })}
                />
                {form.formState.errors.min_stock_level && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.min_stock_level.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="reorder_point">Reorder Point *</Label>
                <Input
                  id="reorder_point"
                  type="number"
                  step="0.01"
                  {...form.register("reorder_point", { valueAsNumber: true })}
                />
                {form.formState.errors.reorder_point && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.reorder_point.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_stock_level">Maximum Stock *</Label>
                <Input
                  id="max_stock_level"
                  type="number"
                  step="0.01"
                  {...form.register("max_stock_level", { valueAsNumber: true })}
                />
                {form.formState.errors.max_stock_level && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.max_stock_level.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="storage_location">Storage Location</Label>
                <Input
                  id="storage_location"
                  {...form.register("storage_location")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storage_temperature">Storage Temperature</Label>
                <Input
                  id="storage_temperature"
                  placeholder="e.g., 4C"
                  {...form.register("storage_temperature")}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={3}
                  {...form.register("description")}
                />
              </div>
            </div>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                disabled={createItem.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createItem.isPending}>
                {createItem.isPending ? "Saving..." : "Add Stock"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={staggerItem}>
          <StatsCard
            title="Total Stock Value"
            value={(stats as any)?.total_value ?? 0}
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
            value={(stats as any)?.total_in ?? 0}
            icon={BoxStack}
            color="green"
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <StatsCard
            title="Low Stock Items"
            value={(stats as any)?.total_adjustments ?? 0}
            icon={TrendingDown}
            color="orange"
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <StatsCard
            title="Expiring Soon"
            value={(stats as any)?.total_out ?? 0}
            icon={AlertTriangle}
            color="red"
          />
        </motion.div>
      </motion.div>

      {expiryAlerts && (expiryAlerts as any)?.results?.length > 0 ? (
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
                {(expiryAlerts as any).results.length} Product
                {(expiryAlerts as any).results.length > 1 ? "s" : ""} Expiring
                Soon!
              </h3>
              <div className="space-y-2">
                {(expiryAlerts as any).results
                  .slice(0, 3)
                  .map((alert: ExpiryAlert) => (
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
              {(expiryAlerts as any).results.length > 3 ? (
                <Button variant="link" className="mt-2 text-orange-700">
                  View all {(expiryAlerts as any).results.length} alerts →
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
