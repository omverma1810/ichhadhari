"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Download, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTurnoverAnalysis } from "@/lib/hooks/api/useProcurement";
import { formatNumber } from "@/lib/utils/formatters";

export default function TurnoverAnalysisPage() {
  const [period, setPeriod] = useState<string>("30");

  const { data: report, isLoading } = useTurnoverAnalysis(parseInt(period));

  const getTurnoverColor = (ratio: number) => {
    if (ratio >= 5) return "text-green-600"; // High turnover
    if (ratio >= 2) return "text-yellow-600"; // Moderate turnover
    return "text-red-600"; // Low turnover
  };

  const getTurnoverLabel = (ratio: number) => {
    if (ratio >= 5) return "High";
    if (ratio >= 2) return "Moderate";
    return "Low";
  };

  const handleExport = () => {
    if (!report) return;

    const csv = [
      [
        "Item Name",
        "Type",
        "Turnover Ratio",
        "Days of Stock",
        "Outward Quantity",
        "Status",
      ],
      ...report.items.map((item: any) => [
        item.item_name,
        item.item_type,
        item.turnover_ratio.toFixed(2),
        item.days_of_stock.toFixed(1),
        item.outward_quantity,
        getTurnoverLabel(item.turnover_ratio),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `turnover-analysis-${period}days.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen space-y-4 p-4 sm:space-y-6 sm:p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-[#5D4037] sm:text-3xl">
            <TrendingUp className="h-6 w-6 text-[#F4A920] sm:h-8 sm:w-8" />
            Turnover Analysis
          </h1>
          <p className="mt-1 text-sm text-[#8B5A3C] sm:text-base">
            Inventory turnover and stock movement efficiency
          </p>
        </div>
        <Button
          onClick={handleExport}
          disabled={!report}
          className="w-full bg-[#F4A920] hover:bg-[#F4A920]/90 sm:w-auto"
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </motion.div>

      {/* Period Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Filter className="h-4 w-4" />
              Analysis Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {["7", "30", "60", "90"].map((days) => (
                <Button
                  key={days}
                  variant={period === days ? "default" : "outline"}
                  onClick={() => setPeriod(days)}
                  className={
                    period === days ? "bg-[#F4A920] hover:bg-[#F4A920]/90" : ""
                  }
                >
                  Last {days} Days
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary Cards */}
      {report && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Average Turnover Ratio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-[#5D4037]">
                {(
                  report.items.reduce(
                    (sum, item) => sum + item.turnover_ratio,
                    0,
                  ) / report.items.length || 0
                ).toFixed(2)}
                x
              </p>
              <p className="mt-1 text-xs text-gray-600">
                {getTurnoverLabel(
                  report.items.reduce(
                    (sum, item) => sum + item.turnover_ratio,
                    0,
                  ) / report.items.length || 0,
                )}{" "}
                movement
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Average Days of Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">
                {(
                  report.items.reduce(
                    (sum, item) => sum + item.days_of_stock,
                    0,
                  ) / report.items.length || 0
                ).toFixed(1)}{" "}
                days
              </p>
              <p className="mt-1 text-xs text-gray-600">On hand average</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Items Tracked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-[#F4A920]">
                {report.items.length}
              </p>
              <p className="mt-1 text-xs text-gray-600">
                Active inventory items
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recommendations */}
      {report && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg bg-green-50 p-4">
                <p className="font-medium text-green-800">
                  High Turnover Items (≥5x)
                </p>
                <p className="mt-1 text-sm text-green-700">
                  {
                    report.items.filter((item: any) => item.turnover_ratio >= 5)
                      .length
                  }{" "}
                  items - Consider increasing stock levels to prevent stockouts
                </p>
              </div>
              <div className="rounded-lg bg-yellow-50 p-4">
                <p className="font-medium text-yellow-800">
                  Moderate Turnover Items (2-5x)
                </p>
                <p className="mt-1 text-sm text-yellow-700">
                  {
                    report.items.filter(
                      (item: any) =>
                        item.turnover_ratio >= 2 && item.turnover_ratio < 5,
                    ).length
                  }{" "}
                  items - Optimal turnover, maintain current levels
                </p>
              </div>
              <div className="rounded-lg bg-red-50 p-4">
                <p className="font-medium text-red-800">
                  Low Turnover Items (&lt;2x)
                </p>
                <p className="mt-1 text-sm text-red-700">
                  {
                    report.items.filter((item: any) => item.turnover_ratio < 2)
                      .length
                  }{" "}
                  items - Dead stock risk, consider reducing purchase orders or
                  promotions
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Items Table */}
      {report && report.items && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Item Turnover Details</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Desktop Table */}
              <div className="hidden lg:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">
                        Turnover Ratio
                      </TableHead>
                      <TableHead className="text-right">
                        Days of Stock
                      </TableHead>
                      <TableHead className="text-right">Outward Qty</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.items.map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {item.item_name}
                        </TableCell>
                        <TableCell className="capitalize">
                          {item.item_type.replace("_", " ")}
                        </TableCell>
                        <TableCell
                          className={`text-right font-semibold ${getTurnoverColor(item.turnover_ratio)}`}
                        >
                          {item.turnover_ratio.toFixed(2)}x
                        </TableCell>
                        <TableCell className="text-right">
                          {item.days_of_stock.toFixed(1)} days
                        </TableCell>
                        <TableCell className="text-right">
                          {formatNumber(item.outward_quantity)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              item.turnover_ratio >= 5
                                ? "bg-green-100 text-green-800"
                                : item.turnover_ratio >= 2
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {getTurnoverLabel(item.turnover_ratio)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="space-y-4 lg:hidden">
                {report.items.map((item: any, index: number) => (
                  <div key={index} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{item.item_name}</h4>
                        <p className="mt-1 text-xs capitalize text-gray-600">
                          {item.item_type.replace("_", " ")}
                        </p>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          item.turnover_ratio >= 5
                            ? "bg-green-100 text-green-800"
                            : item.turnover_ratio >= 2
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {getTurnoverLabel(item.turnover_ratio)}
                      </span>
                    </div>
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Turnover Ratio:</span>
                        <span
                          className={`font-semibold ${getTurnoverColor(item.turnover_ratio)}`}
                        >
                          {item.turnover_ratio.toFixed(2)}x
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Days of Stock:</span>
                        <span className="font-medium">
                          {item.days_of_stock.toFixed(1)} days
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Outward Quantity:</span>
                        <span className="font-medium">
                          {formatNumber(item.outward_quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <p className="text-gray-500">Loading analysis...</p>
        </div>
      )}
    </div>
  );
}
