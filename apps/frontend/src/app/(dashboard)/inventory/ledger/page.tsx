"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Filter,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { staggerContainer, staggerItem } from "@/lib/utils/animations";

export default function InventoryLedgerPage() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [transactionType, setTransactionType] = useState("all");

  // TODO: Replace with actual API data
  const transactions = [
    {
      id: 1,
      date: "2026-02-05",
      type: "purchase",
      item: "Raw Milk",
      quantity: 100,
      unit: "liters",
      isAddition: true,
      reference: "PO-20260205-0001",
    },
    {
      id: 2,
      date: "2026-02-04",
      type: "sale",
      item: "Paneer",
      quantity: 25,
      unit: "kg",
      isAddition: false,
      reference: "SALE-20260204-0012",
    },
    {
      id: 3,
      date: "2026-02-03",
      type: "production",
      item: "Ghee",
      quantity: 15,
      unit: "kg",
      isAddition: true,
      reference: "BATCH-20260203-0005",
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#5D4037] flex items-center gap-3">
            <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-[#8B5A3C]" />
            Inventory Ledger
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Track all inventory movements and transactions
          </p>
        </div>
        <Button variant="outline" className="w-full sm:w-auto">
          <Download className="w-4 h-4 mr-2" />
          Export
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
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="dateFrom" className="text-sm">
                From Date
              </Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="dateTo" className="text-sm">
                To Date
              </Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="transactionType" className="text-sm">
                Transaction Type
              </Label>
              <Select value={transactionType} onValueChange={setTransactionType}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="purchase">Purchase</SelectItem>
                  <SelectItem value="sale">Sale</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="wastage">Wastage</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full bg-[#8B5A3C] hover:bg-[#5D4037]">
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Transactions List */}
      <motion.div
        className="space-y-3 sm:space-y-4"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {transactions.map((transaction) => (
          <motion.div key={transaction.id} variants={staggerItem}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-base sm:text-lg text-gray-900">
                        {transaction.item}
                      </h3>
                      <Badge
                        variant="outline"
                        className={
                          transaction.isAddition
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {transaction.isAddition ? (
                          <TrendingUp className="w-3 h-3 mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-1" />
                        )}
                        {transaction.type}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {transaction.date}
                      </span>
                      <span>
                        Qty: {transaction.quantity} {transaction.unit}
                      </span>
                      <span className="text-gray-500">
                        Ref: {transaction.reference}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`text-xl sm:text-2xl font-bold ${
                      transaction.isAddition ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {transaction.isAddition ? "+" : "-"}
                    {transaction.quantity}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
