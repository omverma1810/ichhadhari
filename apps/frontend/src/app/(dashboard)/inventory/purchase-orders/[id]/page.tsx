"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Edit,
  Trash2,
  CheckCircle,
  FileText,
  Send,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  usePurchaseOrder,
  useApprovePurchaseOrder,
  useDeletePurchaseOrder,
  useSendPurchaseOrder,
  useConfirmPurchaseOrder,
  useCancelPurchaseOrder,
} from "@/lib/hooks/api/useProcurement";
import { formatNumber } from "@/lib/utils/formatters";

export default function PurchaseOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params?.id as string);
  const [confirmAction, setConfirmAction] = useState<{
    type: "approve" | "send" | "confirm" | "cancel" | "delete";
    label: string;
  } | null>(null);

  const { data: po, isLoading } = usePurchaseOrder(id);
  const approvePoMutation = useApprovePurchaseOrder();
  const sendPoMutation = useSendPurchaseOrder();
  const confirmPoMutation = useConfirmPurchaseOrder();
  const cancelPoMutation = useCancelPurchaseOrder();
  const deletePoMutation = useDeletePurchaseOrder();

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

  const handleAction = () => {
    if (!confirmAction) return;
    const onDone = () => setConfirmAction(null);
    switch (confirmAction.type) {
      case "approve":
        approvePoMutation.mutate(id, { onSuccess: onDone });
        break;
      case "send":
        sendPoMutation.mutate(id, { onSuccess: onDone });
        break;
      case "confirm":
        confirmPoMutation.mutate(id, { onSuccess: onDone });
        break;
      case "cancel":
        cancelPoMutation.mutate(id, { onSuccess: onDone });
        break;
      case "delete":
        deletePoMutation.mutate(id, {
          onSuccess: () => {
            onDone();
            router.push("/inventory/purchase-orders");
          },
        });
        break;
    }
  };

  const isActionPending =
    approvePoMutation.isPending ||
    sendPoMutation.isPending ||
    confirmPoMutation.isPending ||
    cancelPoMutation.isPending ||
    deletePoMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!po) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">Purchase order not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-4 p-4 sm:space-y-6 sm:p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="-ml-2 mb-2 text-[#8B5A3C] hover:text-[#5D4037]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#5D4037] sm:text-3xl">
              Purchase Order {po.po_number}
            </h1>
            <div className="mt-2 flex items-center gap-2">
              {getStatusBadge(po.status)}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {(po.status === "draft" || po.status === "pending_approval") && (
              <Button
                onClick={() =>
                  setConfirmAction({ type: "approve", label: "Approve" })
                }
                className="bg-green-600 hover:bg-green-700"
                disabled={isActionPending}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </Button>
            )}
            {po.status === "approved" && (
              <Button
                onClick={() =>
                  setConfirmAction({ type: "send", label: "Send to Vendor" })
                }
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isActionPending}
              >
                <Send className="mr-2 h-4 w-4" />
                Send to Vendor
              </Button>
            )}
            {po.status === "sent" && (
              <Button
                onClick={() =>
                  setConfirmAction({ type: "confirm", label: "Confirm" })
                }
                className="bg-indigo-600 hover:bg-indigo-700"
                disabled={isActionPending}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirm
              </Button>
            )}
            {(po.status === "approved" || po.status === "confirmed") && (
              <Button
                onClick={() => router.push(`/inventory/grns/create?po=${id}`)}
                className="bg-[#F4A920] hover:bg-[#F4A920]/90"
              >
                <FileText className="mr-2 h-4 w-4" />
                Create GRN
              </Button>
            )}
            {po.status !== "fully_received" && po.status !== "cancelled" && (
              <Button
                variant="outline"
                className="text-red-600 hover:bg-red-50"
                onClick={() =>
                  setConfirmAction({ type: "cancel", label: "Cancel Order" })
                }
                disabled={isActionPending}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            )}
            {(po.status === "draft" || po.status === "pending_approval") && (
              <Button
                variant="outline"
                onClick={() =>
                  router.push(`/inventory/purchase-orders/${id}/edit`)
                }
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
            <Button
              variant="destructive"
              onClick={() =>
                setConfirmAction({ type: "delete", label: "Delete" })
              }
              disabled={isActionPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </motion.div>

      {/* PO Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 gap-4 lg:grid-cols-2"
      >
        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Vendor:</span>
              <span className="font-medium">
                {po.vendor_name || `Vendor #${po.vendor}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">PO Date:</span>
              <span className="font-medium">
                {format(new Date(po.po_date), "PPP")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Expected Delivery:</span>
              <span className="font-medium">
                {format(new Date(po.expected_delivery_date), "PPP")}
              </span>
            </div>
            {po.shipping_method && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Shipping Method:</span>
                <span className="font-medium">{po.shipping_method}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Subtotal:</span>
              <span className="font-medium">
                ₹{formatNumber(po.subtotal || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Tax Amount:</span>
              <span className="font-medium">
                ₹{formatNumber(po.tax_amount || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Discount Amount:</span>
              <span className="font-medium text-red-600">
                -₹{formatNumber(po.discount_amount || 0)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-semibold">Total Amount:</span>
              <span className="text-xl font-bold text-[#5D4037]">
                ₹{formatNumber(po.total_amount)}
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Delivery Address */}
      {po.delivery_address && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Delivery Address</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm">
                {po.delivery_address}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Line Items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Tax %</TableHead>
                    <TableHead className="text-right">Discount %</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {po.items?.map((item: any, index: number) => {
                    const lineTotal =
                      item.quantity *
                      item.unit_price *
                      (1 + item.tax_percentage / 100) *
                      (1 - item.discount_percentage / 100);
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {item.item_name}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {item.description || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell className="text-right">
                          ₹{formatNumber(item.unit_price)}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.tax_percentage}%
                        </TableCell>
                        <TableCell className="text-right">
                          {item.discount_percentage}%
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          ₹{formatNumber(lineTotal)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="space-y-4 lg:hidden">
              {po.items?.map((item: any, index: number) => {
                const lineTotal =
                  item.quantity *
                  item.unit_price *
                  (1 + item.tax_percentage / 100) *
                  (1 - item.discount_percentage / 100);
                return (
                  <div key={index} className="rounded-lg border p-4">
                    <h4 className="font-semibold">{item.item_name}</h4>
                    {item.description && (
                      <p className="mt-1 text-sm text-gray-600">
                        {item.description}
                      </p>
                    )}
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quantity:</span>
                        <span>
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Unit Price:</span>
                        <span>₹{formatNumber(item.unit_price)}</span>
                      </div>
                      {item.tax_percentage > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tax:</span>
                          <span>{item.tax_percentage}%</span>
                        </div>
                      )}
                      {item.discount_percentage > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Discount:</span>
                          <span>{item.discount_percentage}%</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t pt-2 font-semibold">
                        <span>Total:</span>
                        <span className="text-[#5D4037]">
                          ₹{formatNumber(lineTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Terms & Notes */}
      {(po.terms_and_conditions || po.notes) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 gap-4 lg:grid-cols-2"
        >
          {po.terms_and_conditions && (
            <Card>
              <CardHeader>
                <CardTitle>Terms & Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">
                  {po.terms_and_conditions}
                </p>
              </CardContent>
            </Card>
          )}
          {po.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{po.notes}</p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}

      {/* Action Confirmation Dialog */}
      <Dialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.type === "delete"
                ? "Delete Purchase Order"
                : `${confirmAction?.label} Purchase Order`}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {confirmAction?.type === "delete"
              ? `Are you sure you want to delete PO ${po.po_number}? This action cannot be undone.`
              : confirmAction?.type === "cancel"
                ? `Are you sure you want to cancel PO ${po.po_number}?`
                : `Are you sure you want to ${confirmAction?.label?.toLowerCase()} PO ${po.po_number}?`}
          </p>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setConfirmAction(null)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant={
                confirmAction?.type === "delete" ||
                confirmAction?.type === "cancel"
                  ? "destructive"
                  : "default"
              }
              onClick={handleAction}
              disabled={isActionPending}
              className="w-full sm:w-auto"
            >
              {isActionPending ? "Processing..." : confirmAction?.label}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
