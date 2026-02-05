"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useInventoryItem,
  useDeleteInventoryItem,
  useItemTransactionHistory,
} from "@/lib/hooks/api/useInventory";
import { formatNumber } from "@/lib/utils/formatters";

export default function InventoryItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.id as string;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: item, isLoading: itemLoading } = useInventoryItem(
    Number(itemId),
  );
  const { data: transactionsData } = useItemTransactionHistory(Number(itemId));
  const deleteItemMutation = useDeleteInventoryItem();

  const transactions = transactionsData?.results || [];

  const handleDelete = () => {
    deleteItemMutation.mutate(Number(itemId), {
      onSuccess: () => {
        router.push("/inventory/items");
      },
    });
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; label: string }> = {
      in_stock: { color: "bg-green-100 text-green-800", label: "In Stock" },
      low_stock: { color: "bg-yellow-100 text-yellow-800", label: "Low Stock" },
      out_of_stock: { color: "bg-red-100 text-red-800", label: "Out of Stock" },
      overstocked: {
        color: "bg-blue-100 text-blue-800",
        label: "Overstocked",
      },
    };
    const config_item = config[status] || config.in_stock;
    return <Badge className={config_item.color}>{config_item.label}</Badge>;
  };

  if (itemLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#F4A920] border-t-transparent"></div>
          <p className="text-[#8B5A3C]">Loading item details...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <p className="mt-4 text-lg text-red-600">Item not found</p>
          <Button
            onClick={() => router.push("/inventory/items")}
            className="mt-4"
          >
            Back to Items
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-4 p-4 sm:space-y-6 sm:p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4"
      >
        <Button
          variant="ghost"
          onClick={() => router.push("/inventory/items")}
          className="-ml-2 w-fit text-[#8B5A3C] hover:text-[#5D4037]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Items
        </Button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-bold text-[#5D4037] sm:text-3xl">
              <Package className="h-6 w-6 text-[#F4A920] sm:h-8 sm:w-8" />
              {item.name}
            </h1>
            <p className="mt-1 text-sm text-[#8B5A3C] sm:text-base">
              Item Code: {item.item_code}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              onClick={() => router.push(`/inventory/items/${itemId}/edit`)}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              onClick={() => setShowDeleteDialog(true)}
              variant="destructive"
              className="w-full sm:w-auto"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Item Details Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Item Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="mt-1 font-semibold capitalize">
                  {item.category.replace("_", " ")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <div className="mt-1">{getStatusBadge(item.status)}</div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Stock</p>
                <p className="mt-1 text-lg font-bold text-[#5D4037]">
                  {formatNumber(Number(item.current_stock || 0))} {item.unit}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Unit Price</p>
                <p className="mt-1 font-semibold">
                  ₹{formatNumber(Number(item.unit_price || 0))}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Reorder Level</p>
                <p className="mt-1 font-semibold">
                  {formatNumber(Number(item.reorder_level || 0))} {item.unit}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Maximum Stock</p>
                <p className="mt-1 font-semibold">
                  {formatNumber(Number(item.maximum_stock || 0))} {item.unit}
                </p>
              </div>
              {item.supplier && (
                <div>
                  <p className="text-sm text-gray-500">Supplier</p>
                  <p className="mt-1 font-semibold">{item.supplier}</p>
                </div>
              )}
              {item.storage_location && (
                <div>
                  <p className="text-sm text-gray-500">Storage Location</p>
                  <p className="mt-1 font-semibold">{item.storage_location}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="mt-1 font-semibold">
                  {format(new Date(item.updated_at || item.created_at), "PPP")}
                </p>
              </div>
            </div>

            {item.description && (
              <div className="mt-4 border-t pt-4">
                <p className="text-sm text-gray-500">Description</p>
                <p className="mt-1 text-gray-700">{item.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Transaction History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Balance After</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        No transactions yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((transaction: any) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {format(
                            new Date(transaction.transaction_date),
                            "PPP",
                          )}
                        </TableCell>
                        <TableCell className="capitalize">
                          {transaction.transaction_type.replace("_", " ")}
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
                        <TableCell>{transaction.reference_id || "—"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="space-y-3 lg:hidden">
              {transactions.length === 0 ? (
                <p className="text-center text-gray-500">No transactions yet</p>
              ) : (
                transactions.map((transaction: any) => (
                  <div key={transaction.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">
                        {format(new Date(transaction.transaction_date), "PPP")}
                      </p>
                      <Badge
                        variant="outline"
                        className={
                          transaction.is_addition
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {transaction.is_addition ? (
                          <TrendingUp className="mr-1 h-3 w-3" />
                        ) : (
                          <TrendingDown className="mr-1 h-3 w-3" />
                        )}
                        {transaction.transaction_type.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-gray-600">Quantity:</span>
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
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Balance After:
                      </span>
                      <span className="font-semibold">
                        {formatNumber(transaction.balance_after_transaction)}
                      </span>
                    </div>
                    {transaction.reference_id && (
                      <div className="mt-1 text-xs text-gray-500">
                        Ref: {transaction.reference_id}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{item.name}"? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteItemMutation.isPending}
            >
              {deleteItemMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
