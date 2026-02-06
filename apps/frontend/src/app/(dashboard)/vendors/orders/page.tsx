"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Plus,
  Search,
  Filter,
  Package,
  Calendar,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  FileText,
  MoreHorizontal,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  usePurchaseOrders,
  useApprovePurchaseOrder,
  useSendPurchaseOrder,
  useConfirmPurchaseOrder,
  useCancelPurchaseOrder,
  useDeletePurchaseOrder,
} from "@/hooks/api/useVendorsEmployees";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import type {
  PurchaseOrder,
  PurchaseOrderStatus,
  PurchaseOrderFilters,
} from "@/types/api/vendors";

const formatCurrency = (value: number | string) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatDate = (value?: string | null) => {
  if (!value) return "\u2014";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "\u2014";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const statusConfig: Record<
  PurchaseOrderStatus,
  { label: string; className: string; icon: any }
> = {
  draft: {
    label: "Draft",
    className: "border-slate-200 bg-slate-50 text-slate-700",
    icon: FileText,
  },
  pending_approval: {
    label: "Pending Approval",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    className: "border-blue-200 bg-blue-50 text-blue-700",
    icon: CheckCircle2,
  },
  sent: {
    label: "Sent",
    className: "border-indigo-200 bg-indigo-50 text-indigo-700",
    icon: Send,
  },
  confirmed: {
    label: "Confirmed",
    className: "border-purple-200 bg-purple-50 text-purple-700",
    icon: CheckCircle2,
  },
  partially_received: {
    label: "Partially Received",
    className: "border-orange-200 bg-orange-50 text-orange-700",
    icon: Truck,
  },
  fully_received: {
    label: "Fully Received",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    className: "border-red-200 bg-red-50 text-red-700",
    icon: XCircle,
  },
};

export default function VendorOrdersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const filters: PurchaseOrderFilters = {
    ...(searchQuery && { search: searchQuery }),
    ...(statusFilter !== "all" && { status: statusFilter as PurchaseOrderStatus }),
    ordering: "-po_date",
    page_size: 50,
  };

  const {
    data: ordersData,
    isLoading,
    error,
    refetch,
  } = usePurchaseOrders(filters);

  const approveMutation = useApprovePurchaseOrder();
  const sendMutation = useSendPurchaseOrder();
  const confirmMutation = useConfirmPurchaseOrder();
  const cancelMutation = useCancelPurchaseOrder();
  const deleteMutation = useDeletePurchaseOrder();

  const orders: PurchaseOrder[] = ordersData?.results ?? [];
  const totalCount = ordersData?.count ?? orders.length;

  const handleApprove = (id: number) => {
    approveMutation.mutate(id, {
      onSuccess: () => toast.success("Purchase order approved"),
    });
  };

  const handleSend = (id: number) => {
    sendMutation.mutate(id, {
      onSuccess: () => toast.success("Purchase order sent to vendor"),
    });
  };

  const handleConfirm = (id: number) => {
    confirmMutation.mutate(id, {
      onSuccess: () => toast.success("Purchase order confirmed"),
    });
  };

  const handleCancel = () => {
    if (!selectedOrderId) return;
    cancelMutation.mutate(selectedOrderId, {
      onSuccess: () => {
        toast.success("Purchase order cancelled");
        setCancelDialogOpen(false);
        setSelectedOrderId(null);
      },
    });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success("Purchase order deleted"),
    });
  };

  // Summary stats
  const stats = {
    total: totalCount,
    draft: orders.filter((o) => o.status === "draft").length,
    pending: orders.filter((o) =>
      ["pending_approval", "approved", "sent", "confirmed"].includes(o.status),
    ).length,
    received: orders.filter((o) =>
      ["partially_received", "fully_received"].includes(o.status),
    ).length,
    totalValue: orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0),
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/vendors")}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Vendors
          </Button>
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">Purchase Orders</h1>
            <p className="text-sm text-muted-foreground">
              Manage vendor purchase orders and deliveries
            </p>
          </div>
        </div>
        <Link href="/vendors/orders/create">
          <Button size="sm" className="w-full sm:w-auto">
            <Plus className="mr-1 h-4 w-4" />
            New Order
          </Button>
        </Link>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Orders</p>
            <p className="text-lg font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Draft</p>
            <p className="text-lg font-bold">{stats.draft}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">In Progress</p>
            <p className="text-lg font-bold text-blue-600">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Value</p>
            <p className="text-lg font-bold">{formatCurrency(stats.totalValue)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by PO number or vendor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending_approval">Pending Approval</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="partially_received">Partially Received</SelectItem>
            <SelectItem value="fully_received">Fully Received</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <LoadingSpinner withText text="Loading purchase orders..." />
        </div>
      ) : error ? (
        <ErrorMessage
          message="Failed to load purchase orders"
          onRetry={() => refetch()}
        />
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No Purchase Orders</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchQuery || statusFilter !== "all"
                ? "No orders match your filters. Try adjusting them."
                : "Create your first purchase order to get started."}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Link href="/vendors/orders/create" className="mt-4">
                <Button size="sm">
                  <Plus className="mr-1 h-4 w-4" />
                  Create Purchase Order
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const config = statusConfig[order.status] || statusConfig.draft;
            const StatusIcon = config.icon;
            return (
              <Card key={order.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    {/* Left: Order info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{order.po_number}</p>
                        <Badge className={cn("text-xs", config.className)}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {config.label}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {order.vendor_name || "Vendor #" + order.vendor}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(order.po_date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Truck className="h-3 w-3" />
                          Expected: {formatDate(order.expected_delivery_date)}
                        </span>
                        {order.items && (
                          <span>{order.items.length} item(s)</span>
                        )}
                      </div>
                    </div>

                    {/* Right: Amount + Actions */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {formatCurrency(order.total_amount)}
                        </p>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              router.push("/vendors/orders/" + order.id)
                            }
                          >
                            View Details
                          </DropdownMenuItem>
                          {(order.status === "draft" ||
                            order.status === "pending_approval") && (
                            <DropdownMenuItem
                              onClick={() => handleApprove(order.id)}
                            >
                              Approve
                            </DropdownMenuItem>
                          )}
                          {order.status === "approved" && (
                            <DropdownMenuItem
                              onClick={() => handleSend(order.id)}
                            >
                              Send to Vendor
                            </DropdownMenuItem>
                          )}
                          {order.status === "sent" && (
                            <DropdownMenuItem
                              onClick={() => handleConfirm(order.id)}
                            >
                              Confirm
                            </DropdownMenuItem>
                          )}
                          {order.status !== "fully_received" &&
                            order.status !== "cancelled" && (
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setSelectedOrderId(order.id);
                                  setCancelDialogOpen(true);
                                }}
                              >
                                Cancel Order
                              </DropdownMenuItem>
                            )}
                          {order.status === "draft" && (
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDelete(order.id)}
                            >
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Purchase Order</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to cancel this purchase order? This action
            cannot be undone.
          </p>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Keep Order
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={cancelMutation.isPending}
              className="w-full sm:w-auto"
            >
              {cancelMutation.isPending ? "Cancelling..." : "Cancel Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
