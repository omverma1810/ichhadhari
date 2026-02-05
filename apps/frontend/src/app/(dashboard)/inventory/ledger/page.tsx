"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookOpen,
  Filter,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Plus,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStockTransactions } from "@/lib/hooks/api/useInventory";
import { formatNumber } from "@/lib/utils/formatters";

export default function InventoryLedgerPage() {
  const router = useRouter();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [transactionType, setTransactionType] = useState("all");
  const [page, setPage] = useState(1);

  const { data: transactionsData, isLoading } = useStockTransactions({
    page,
    transaction_type: transactionType !== "all" ? transactionType : undefined,
    start_date: dateFrom || undefined,
    end_date: dateTo || undefined,
  });

  const transactions = transactionsData?.results || [];
  const totalPages = transactionsData?.count
    ? Math.ceil(transactionsData.count / 10)
    : 1;

  const getTransactionBadge = (type: string, isAddition: boolean) => {
    const config: Record<string, { color: string; label: string; icon: any }> =
      {
        purchase: {
          color: "bg-green-100 text-green-800",
          label: "Purchase",
          icon: TrendingUp,
        },
        production: {
          color: "bg-blue-100 text-blue-800",
          label: "Production",
          icon: TrendingUp,
        },
        sale: {
          color: "bg-purple-100 text-purple-800",
          label: "Sale",
          icon: TrendingDown,
        },
        wastage: {
          color: "bg-red-100 text-red-800",
          label: "Wastage",
          icon: TrendingDown,
        },
        adjustment: {
          color: "bg-yellow-100 text-yellow-800",
          label: "Adjustment",
          icon: TrendingUp,
        },
        return: {
          color: "bg-indigo-100 text-indigo-800",
          label: "Return",
          icon: TrendingUp,
        },
        transfer: {
          color: "bg-gray-100 text-gray-800",
          label: "Transfer",
          icon: TrendingUp,
        },
      };

    const config_item = config[type] || config.adjustment;
    const Icon = isAddition ? TrendingUp : TrendingDown;

    return (
      <Badge className={config_item.color}>
        <Icon className="mr-1 h-3 w-3" />
        {config_item.label}
      </Badge>
    );
  };

  const handleExport = () => {
    // CSV export logic
    const csvContent = [
      [
        "Transaction ID",
        "Date",
        "Item",
        "Type",
        "Quantity",
        "Balance After",
        "Reference",
      ],
      ...transactions.map((t: any) => [
        t.transaction_id,
        t.transaction_date,
        t.item_name || t.item,
        t.transaction_type,
        `${t.is_addition ? "+" : "-"}${t.quantity}`,
        t.balance_after_transaction,
        t.reference_id || "",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `inventory-ledger-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
            <BookOpen className="h-6 w-6 text-[#F4A920] sm:h-8 sm:w-8" />
            Inventory Ledger
          </h1>
          <p className="mt-1 text-sm text-[#8B5A3C] sm:text-base">
            Track all inventory movements and transactions
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleExport}
            className="w-full sm:w-auto"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button
            onClick={() => router.push("/inventory/transactions/create")}
            className="w-full bg-[#F4A920] hover:bg-[#F4A920]/90 sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Record Transaction
          </Button>
        </div>
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
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              <Select
                value={transactionType}
                onValueChange={setTransactionType}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="purchase">Purchase</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="sale">Sale</SelectItem>
                  <SelectItem value="wastage">Wastage</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                  <SelectItem value="return">Return</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                className="w-full bg-[#8B5A3C] hover:bg-[#5D4037]"
                onClick={() => {
                  setPage(1);
                }}
              >
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Desktop Table */}
      <motion.div
        className="hidden lg:block"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Balance After</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Performed By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction: any) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-mono text-sm font-semibold">
                      {transaction.transaction_id}
                    </TableCell>
                    <TableCell>
                      {format(new Date(transaction.transaction_date), "PPP")}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold">
                          {transaction.item_name || `Item #${transaction.item}`}
                        </p>
                        {transaction.batch_number && (
                          <p className="text-xs text-gray-500">
                            Batch: {transaction.batch_number}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getTransactionBadge(
                        transaction.transaction_type,
                        transaction.is_addition,
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`font-semibold ${
                          transaction.is_addition
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.is_addition ? "+" : "-"}
                        {formatNumber(transaction.quantity)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatNumber(transaction.balance_after_transaction)}
                    </TableCell>
                    <TableCell>
                      {transaction.reference_type &&
                      transaction.reference_id ? (
                        <span className="text-xs">
                          {transaction.reference_type}:{" "}
                          {transaction.reference_id}
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      {transaction.performed_by_name || "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </motion.div>

      {/* Mobile/Tablet Cards */}
      <motion.div
        className="grid grid-cols-1 gap-4 lg:hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {isLoading ? (
          <Card>
            <CardContent className="p-6 text-center">Loading...</CardContent>
          </Card>
        ) : transactions.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              No transactions found
            </CardContent>
          </Card>
        ) : (
          transactions.map((transaction: any) => (
            <Card
              key={transaction.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-xs text-gray-500">
                      {transaction.transaction_id}
                    </p>
                    <h3 className="mt-1 font-semibold">
                      {transaction.item_name || `Item #${transaction.item}`}
                    </h3>
                  </div>
                  {getTransactionBadge(
                    transaction.transaction_type,
                    transaction.is_addition,
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">
                    {format(new Date(transaction.transaction_date), "PPP")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Quantity:</span>
                  <span
                    className={`font-semibold ${
                      transaction.is_addition
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.is_addition ? "+" : "-"}
                    {formatNumber(transaction.quantity)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Balance After:</span>
                  <span className="font-semibold">
                    {formatNumber(transaction.balance_after_transaction)}
                  </span>
                </div>
                {transaction.reference_id && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Reference:</span>
                    <span className="text-xs">
                      {transaction.reference_type}: {transaction.reference_id}
                    </span>
                  </div>
                )}
                {transaction.batch_number && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Batch:</span>
                    <span className="font-mono text-xs">
                      {transaction.batch_number}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
