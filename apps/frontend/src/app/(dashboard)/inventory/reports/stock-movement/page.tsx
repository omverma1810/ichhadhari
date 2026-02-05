"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Download, Calendar, Filter } from "lucide-react";
import { format, subDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useStockMovementReport } from "@/lib/hooks/api/useProcurement";
import { formatNumber } from "@/lib/utils/formatters";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function StockMovementReportPage() {
  const [startDate, setStartDate] = useState(
    format(subDays(new Date(), 30), "yyyy-MM-dd"),
  );
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [itemType, setItemType] = useState("all");

  const { data: report, isLoading } = useStockMovementReport({
    start_date: startDate,
    end_date: endDate,
    item_type: itemType !== "all" ? itemType : undefined,
  });

  const handleExport = () => {
    if (!report) return;

    const csv = [
      ["Item Name", "Item ID", "Transaction Count", "Total Quantity"],
      ...report.by_item.map((item: any) => [
        item.item__name,
        item.item__item_id,
        item.transaction_count,
        item.total_quantity,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stock-movement-${startDate}-to-${endDate}.csv`;
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
            <BarChart3 className="h-6 w-6 text-[#F4A920] sm:h-8 sm:w-8" />
            Stock Movement Report
          </h1>
          <p className="mt-1 text-sm text-[#8B5A3C] sm:text-base">
            Track inventory transactions over time
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

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Filter className="h-4 w-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="start_date" className="text-sm">
                Start Date
              </Label>
              <Input
                id="start_date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="end_date" className="text-sm">
                End Date
              </Label>
              <Input
                id="end_date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="item_type" className="text-sm">
                Item Type
              </Label>
              <Select value={itemType} onValueChange={setItemType}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="raw_material">Raw Material</SelectItem>
                  <SelectItem value="finished_goods">Finished Goods</SelectItem>
                  <SelectItem value="packaging">Packaging</SelectItem>
                  <SelectItem value="consumables">Consumables</SelectItem>
                </SelectContent>
              </Select>
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
                Total Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-[#5D4037]">
                {formatNumber(report.summary.total_transactions)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Inward
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {formatNumber(report.summary.total_inward)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Outward
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">
                {formatNumber(report.summary.total_outward)}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Transaction Type Breakdown Chart */}
      {report && report.by_type && Object.keys(report.by_type).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Transaction Type Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={Object.entries(report.by_type).map(([type, data]) => ({
                    transaction_type: type,
                    count: data.count,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="transaction_type" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#F4A920" name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Top Items Table */}
      {report && report.by_item && report.by_item.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Top Items by Transaction Volume</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Desktop Table */}
              <div className="hidden lg:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Item ID</TableHead>
                      <TableHead className="text-right">
                        Transaction Count
                      </TableHead>
                      <TableHead className="text-right">
                        Total Quantity
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.by_item.map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {item.item__name}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {item.item__item_id}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatNumber(item.transaction_count)}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-[#5D4037]">
                          {formatNumber(item.total_quantity)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="space-y-4 lg:hidden">
                {report.by_item.map((item: any, index: number) => (
                  <div key={index} className="rounded-lg border p-4">
                    <h4 className="font-semibold">{item.item__name}</h4>
                    <p className="mt-1 text-xs text-gray-600">
                      ID: {item.item__item_id}
                    </p>
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Transaction Count:
                        </span>
                        <span className="font-semibold">
                          {formatNumber(item.transaction_count)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-600">Total Quantity:</span>
                        <span className="text-lg font-bold text-[#5D4037]">
                          {formatNumber(item.total_quantity)}
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
