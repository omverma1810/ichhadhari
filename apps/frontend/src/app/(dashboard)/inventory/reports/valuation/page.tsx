"use client";

import { motion } from "framer-motion";
import { DollarSign, Download, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useValuationReport } from "@/lib/hooks/api/useProcurement";
import { formatNumber } from "@/lib/utils/formatters";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const COLORS = ["#5D4037", "#F4A920", "#8B5A3C", "#D4A574"];

export default function ValuationReportPage() {
  const { data: report, isLoading } = useValuationReport();

  const handleExport = () => {
    if (!report) return;

    const csv = [
      ["Item Name", "Type", "Stock Quantity", "Unit Price", "Total Value"],
      ...report.top_value_items.map((item: any) => [
        item.name,
        item.item_type,
        item.current_stock,
        item.cost_per_unit,
        item.total_value,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `valuation-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const pieData = report?.by_type
    ? Object.entries(report.by_type).map(([type, data]) => ({
        name: type.replace("_", " ").toUpperCase(),
        value: data.total_value,
      }))
    : [];

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
            <DollarSign className="h-6 w-6 text-[#F4A920] sm:h-8 sm:w-8" />
            Valuation Report
          </h1>
          <p className="mt-1 text-sm text-[#8B5A3C] sm:text-base">
            Current inventory value and breakdown
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

      {/* Total Valuation */}
      {report && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="overflow-hidden bg-gradient-to-br from-[#5D4037] to-[#8B5A3C]">
            <CardHeader>
              <CardTitle className="text-lg text-white">
                Total Inventory Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold text-white">
                ₹{formatNumber(report.total_valuation)}
              </p>
              <p className="mt-2 text-sm text-white/80">
                As of {new Date().toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Breakdown by Type */}
      {report && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 gap-4 lg:grid-cols-2"
        >
          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle>Valuation by Item Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(report.by_type).map(([type, data], index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-4 w-4 rounded"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      <div>
                        <p className="font-medium capitalize">
                          {type.replace("_", " ")}
                        </p>
                        <p className="text-xs text-gray-600">
                          {data.count} items
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#5D4037]">
                        ₹{formatNumber(data.total_value)}
                      </p>
                      <p className="text-xs text-gray-600">
                        {(
                          (data.total_value / report.total_valuation) *
                          100
                        ).toFixed(1)}
                        %
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Value Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) =>
                      `${entry.name}: ${((entry.value / report.total_valuation) * 100).toFixed(1)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData?.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `₹${formatNumber(value)}`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Top Items by Value */}
      {report && report.top_value_items && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Items by Value</CardTitle>
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
                        Stock Quantity
                      </TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.top_value_items.map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {item.name}
                        </TableCell>
                        <TableCell className="capitalize">
                          {item.item_type.replace("_", " ")}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatNumber(item.current_stock)}
                        </TableCell>
                        <TableCell className="text-right">
                          ₹{formatNumber(item.cost_per_unit)}
                        </TableCell>
                        <TableCell className="text-right font-bold text-[#5D4037]">
                          ₹{formatNumber(item.total_value)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="space-y-4 lg:hidden">
                {report.top_value_items.map((item: any, index: number) => (
                  <div key={index} className="rounded-lg border p-4">
                    <h4 className="font-semibold">{item.name}</h4>
                    <p className="mt-1 text-xs capitalize text-gray-600">
                      {item.item_type.replace("_", " ")}
                    </p>
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Stock:</span>
                        <span className="font-medium">
                          {formatNumber(item.current_stock)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Unit Price:</span>
                        <span className="font-medium">
                          ₹{formatNumber(item.cost_per_unit)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-600">Total Value:</span>
                        <span className="text-lg font-bold text-[#5D4037]">
                          ₹{formatNumber(item.total_value)}
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
          <p className="text-gray-500">Loading report...</p>
        </div>
      )}
    </div>
  );
}
