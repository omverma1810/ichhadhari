"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  FileText,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  usePurchaseOrders,
  useActivePurchaseOrders,
} from "@/lib/hooks/api/useProcurement";
import type { PurchaseOrder } from "@/lib/services/procurement.service";

// Status configuration with colors and icons
const STATUS_CONFIG = {
  draft: {
    label: "Draft",
    color: "bg-gray-100 text-gray-700 border-gray-300",
    icon: FileText,
  },
  pending_approval: {
    label: "Pending Approval",
    color: "bg-yellow-100 text-yellow-700 border-yellow-300",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    color: "bg-blue-100 text-blue-700 border-blue-300",
    icon: CheckCircle,
  },
  sent: {
    label: "Sent",
    color: "bg-purple-100 text-purple-700 border-purple-300",
    icon: TrendingUp,
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-indigo-100 text-indigo-700 border-indigo-300",
    icon: CheckCircle,
  },
  partially_received: {
    label: "Partially Received",
    color: "bg-orange-100 text-orange-700 border-orange-300",
    icon: AlertCircle,
  },
  fully_received: {
    label: "Fully Received",
    color: "bg-green-100 text-green-700 border-green-300",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-700 border-red-300",
    icon: XCircle,
  },
};

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const filters = {
    search,
    status: statusFilter !== "all" ? statusFilter : undefined,
    page,
  };

  const { data: ordersData, isLoading } = usePurchaseOrders(filters);
  const { data: activeOrders } = useActivePurchaseOrders();

  const orders = ordersData?.results || [];
  const totalCount = ordersData?.count || 0;
  const totalPages = Math.ceil(totalCount / 10);

  const StatusBadge = ({ status }: { status: PurchaseOrder["status"] }) => {
    const config = STATUS_CONFIG[status];
    const Icon = config.icon;

    return (
      <Badge
        variant="outline"
        className={`${config.color} flex items-center gap-1.5 px-2.5 py-1`}
      >
        <Icon className="h-3.5 w-3.5" />
        {config.label}
      </Badge>
    );
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="space-y-6"
    >
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-[#5D4037]">Purchase Orders</h1>
          <p className="text-sm text-[#8B5A3C]">
            Manage vendor purchase orders and track deliveries
          </p>
        </div>
        <Button
          onClick={() => router.push("/vendors/purchase-orders/create")}
          className="bg-[#F4A920] hover:bg-[#F4A920]/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Purchase Order
        </Button>
      </header>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-[#8B5A3C]">
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#5D4037]">
              {totalCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-[#8B5A3C]">
              Active Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {activeOrders?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-[#8B5A3C]">
              Pending Approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {orders.filter((o) => o.status === "pending_approval").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-[#8B5A3C]">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {orders.filter((o) => o.status === "fully_received").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B5A3C]" />
              <Input
                placeholder="Search by PO number, vendor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending_approval">
                  Pending Approval
                </SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="partially_received">
                  Partially Received
                </SelectItem>
                <SelectItem value="fully_received">Fully Received</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-[#F4A920]" />
            Purchase Orders
          </CardTitle>
          <CardDescription>View and manage all purchase orders</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#F4A920]" />
                <p className="mt-2 text-sm text-[#8B5A3C]">
                  Loading purchase orders...
                </p>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
              <ShoppingCart className="h-12 w-12 text-[#8B5A3C]/40" />
              <h3 className="mt-4 text-lg font-semibold text-[#5D4037]">
                No purchase orders found
              </h3>
              <p className="mt-2 text-sm text-[#8B5A3C]">
                Get started by creating your first purchase order
              </p>
              <Button
                onClick={() => router.push("/vendors/purchase-orders/create")}
                className="mt-4 bg-[#F4A920] hover:bg-[#F4A920]/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Purchase Order
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PO Number</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Order Date</TableHead>
                      <TableHead>Expected Delivery</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Recurring</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow
                        key={order.id}
                        className="cursor-pointer hover:bg-[#F4A920]/5"
                        onClick={() =>
                          router.push(`/vendors/purchase-orders/${order.id}`)
                        }
                      >
                        <TableCell className="font-medium">
                          {order.po_number}
                        </TableCell>
                        <TableCell>
                          {order.vendor_name || `Vendor #${order.vendor}`}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-[#8B5A3C]">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(order.po_date), "MMM dd, yyyy")}
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(
                            new Date(order.expected_delivery_date),
                            "MMM dd, yyyy"
                          )}
                        </TableCell>
                        <TableCell className="font-semibold">
                          ₹
                          {order.total_amount.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={order.status} />
                        </TableCell>
                        <TableCell>
                          {order.is_recurring ? (
                            <Badge
                              variant="outline"
                              className="bg-purple-50 text-purple-700"
                            >
                              {order.recurrence_frequency}
                            </Badge>
                          ) : (
                            <span className="text-sm text-[#8B5A3C]">
                              One-time
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(
                                `/vendors/purchase-orders/${order.id}`
                              );
                            }}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-[#8B5A3C]">
                    Showing {(page - 1) * 10 + 1} to{" "}
                    {Math.min(page * 10, totalCount)} of {totalCount} orders
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.section>
  );
}
