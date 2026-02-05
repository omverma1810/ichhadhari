"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useInventoryItems,
  useDeleteInventoryItem,
} from "@/lib/hooks/api/useInventory";
import { formatNumber } from "@/lib/utils/formatters";

export default function InventoryItemsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    itemId: number | null;
  }>({ open: false, itemId: null });

  const { data: itemsData, isLoading } = useInventoryItems({
    page,
    search: searchQuery,
    category: categoryFilter !== "all" ? categoryFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const deleteItem = useDeleteInventoryItem();

  const items = itemsData?.results || [];
  const totalPages = itemsData?.count ? Math.ceil(itemsData.count / 10) : 1;

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; label: string }> = {
      in_stock: { color: "bg-green-100 text-green-800", label: "In Stock" },
      low_stock: {
        color: "bg-yellow-100 text-yellow-800",
        label: "Low Stock",
      },
      out_of_stock: {
        color: "bg-red-100 text-red-800",
        label: "Out of Stock",
      },
      overstocked: {
        color: "bg-blue-100 text-blue-800",
        label: "Overstocked",
      },
    };

    const { color, label } = config[status] || {
      color: "bg-gray-100 text-gray-800",
      label: status,
    };
    return <Badge className={color}>{label}</Badge>;
  };

  const handleDelete = () => {
    if (deleteDialog.itemId) {
      deleteItem.mutate(deleteDialog.itemId, {
        onSuccess: () => {
          setDeleteDialog({ open: false, itemId: null });
        },
      });
    }
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
            <Package className="h-6 w-6 text-[#F4A920] sm:h-8 sm:w-8" />
            Inventory Items
          </h1>
          <p className="mt-1 text-sm text-[#8B5A3C] sm:text-base">
            Manage stock items, levels, and reorder points
          </p>
        </div>
        <Button
          onClick={() => router.push("/inventory/items/create")}
          className="w-full bg-[#F4A920] hover:bg-[#F4A920]/90 sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2 md:gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[190px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="raw_material">Raw Material</SelectItem>
                  <SelectItem value="finished_goods">Finished Goods</SelectItem>
                  <SelectItem value="packaging">Packaging</SelectItem>
                  <SelectItem value="consumables">Consumables</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  <SelectItem value="overstocked">Overstocked</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Export
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Current Stock</TableHead>
                  <TableHead className="text-right">Reorder Level</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      No items found
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm font-semibold">
                        {item.item_code}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {item.name}
                          </p>
                          {item.description && (
                            <p className="text-xs text-gray-500">
                              {item.description.substring(0, 50)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {item.category?.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {item.is_below_min_stock && (
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          )}
                          <span className="font-semibold">
                            {formatNumber(item.current_stock)} {item.unit}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(item.reorder_level)} {item.unit}
                      </TableCell>
                      <TableCell>{item.storage_location || "—"}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(`/inventory/items/${item.id}`)
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(`/inventory/items/${item.id}/edit`)
                            }
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() =>
                              setDeleteDialog({ open: true, itemId: item.id })
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
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
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              No items found
            </CardContent>
          </Card>
        ) : (
          items.map((item: any) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{item.name}</CardTitle>
                    <p className="mt-1 font-mono text-xs text-gray-500">
                      {item.item_code}
                    </p>
                  </div>
                  {getStatusBadge(item.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Category:</span>
                    <p className="font-medium">
                      {item.category?.replace(/_/g, " ")}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Location:</span>
                    <p className="font-medium">
                      {item.storage_location || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Current Stock:</span>
                    <div className="flex items-center gap-1">
                      {item.is_below_min_stock && (
                        <AlertTriangle className="h-3 w-3 text-yellow-600" />
                      )}
                      <p className="font-semibold text-[#5D4037]">
                        {formatNumber(item.current_stock)} {item.unit}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Reorder Level:</span>
                    <p className="font-medium">
                      {formatNumber(item.reorder_level)} {item.unit}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/inventory/items/${item.id}`)}
                  >
                    <Eye className="mr-1 h-3 w-3" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() =>
                      router.push(`/inventory/items/${item.id}/edit`)
                    }
                  >
                    <Edit className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600"
                    onClick={() =>
                      setDeleteDialog({ open: true, itemId: item.id })
                    }
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({ open, itemId: deleteDialog.itemId })
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this inventory item? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, itemId: null })}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteItem.isPending}
              className="w-full sm:w-auto"
            >
              {deleteItem.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
