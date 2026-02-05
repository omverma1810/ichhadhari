"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Plus,
  Filter,
  FileText,
  CheckCircle,
  XCircle,
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
import {
  usePurchaseOrders,
  useApprovePurchaseOrder,
} from "@/lib/hooks/api/useProcurement";
import { formatNumber } from "@/lib/utils/formatters";

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [vendorFilter, setVendorFilter] = useState("");

  const { data: posData, isLoading } = usePurchaseOrders({
    page,
    status: status !== "all" ? status : undefined,
  });
  const approvePoMutation = useApprovePurchaseOrder();

  const pos = posData?.results || [];
  const totalPages = posData?.count ? Math.ceil(posData.count / 10) : 1;

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; label: string }> = {
      draft: { color: "bg-gray-100 text-gray-800", label: "Draft" },
      pending_approval: {
        color: "bg-yellow-100 text-yellow-800",
        label: "Pending Approval",
      },
      approved: { color: "bg-green-100 text-green-800", label: "Approved" },
      sent: { color: "bg-blue-100 text-blue-800", label: "Sent" },
      confirmed: { color: "bg-indigo-100 text-indigo-800", label: "Confirmed" },
      partially_received: {
        color: "bg-orange-100 text-orange-800",
        label: "Partially Received",
      },
      fully_received: {
        color: "bg-green-100 text-green-800",
        label: "Fully Received",
      },
      cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
    };
    const config_item = config[status] || config.draft;
    return <Badge className={config_item.color}>{config_item.label}</Badge>;
  };

  const handleApprove = (id: number) => {
    if (confirm("Are you sure you want to approve this purchase order?")) {
      approvePoMutation.mutate(id);
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
            <ShoppingCart className="h-6 w-6 text-[#F4A920] sm:h-8 sm:w-8" />
            Purchase Orders
          </h1>
          <p className="mt-1 text-sm text-[#8B5A3C] sm:text-base">
            Manage vendor purchase orders
          </p>
        </div>
        <Button
          onClick={() => router.push("/inventory/purchase-orders/create")}
          className="w-full bg-[#F4A920] hover:bg-[#F4A920]/90 sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create PO
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
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <Label htmlFor="status" className="text-sm">
                Status
              </Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
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
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="vendor" className="text-sm">
                Vendor
              </Label>
              <Input
                id="vendor"
                value={vendorFilter}
                onChange={(e) => setVendorFilter(e.target.value)}
                placeholder="Search vendor..."
                className="mt-1"
              />
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
                <TableHead>PO Number</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>PO Date</TableHead>
                <TableHead>Expected Delivery</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : pos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No purchase orders found
                  </TableCell>
                </TableRow>
              ) : (
                pos.map((po: any) => (
                  <TableRow key={po.id}>
                    <TableCell className="font-mono text-sm font-semibold">
                      {po.po_number}
                    </TableCell>
                    <TableCell>
                      {po.vendor_name || `Vendor #${po.vendor}`}
                    </TableCell>
                    <TableCell>{format(new Date(po.po_date), "PP")}</TableCell>
                    <TableCell>
                      {format(new Date(po.expected_delivery_date), "PP")}
                    </TableCell>
                    <TableCell>{getStatusBadge(po.status)}</TableCell>
                    <TableCell className="text-right font-semibold">
                      ₹{formatNumber(po.total_amount)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            router.push(`/inventory/purchase-orders/${po.id}`)
                          }
                        >
                          <FileText className="h-3 w-3" />
                        </Button>
                        {po.status === "pending_approval" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600"
                            onClick={() => handleApprove(po.id)}
                            disabled={approvePoMutation.isPending}
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
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
        ) : pos.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              No purchase orders found
            </CardContent>
          </Card>
        ) : (
          pos.map((po: any) => (
            <Card
              key={po.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => router.push(`/inventory/purchase-orders/${po.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-xs text-gray-500">
                      {po.po_number}
                    </p>
                    <h3 className="mt-1 font-semibold">
                      {po.vendor_name || `Vendor #${po.vendor}`}
                    </h3>
                  </div>
                  {getStatusBadge(po.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">PO Date:</span>
                  <span className="font-medium">
                    {format(new Date(po.po_date), "PP")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Expected Delivery:</span>
                  <span className="font-medium">
                    {format(new Date(po.expected_delivery_date), "PP")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="text-lg font-bold text-[#5D4037]">
                    ₹{formatNumber(po.total_amount)}
                  </span>
                </div>
                {po.status === "pending_approval" && (
                  <Button
                    size="sm"
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApprove(po.id);
                    }}
                    disabled={approvePoMutation.isPending}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
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
