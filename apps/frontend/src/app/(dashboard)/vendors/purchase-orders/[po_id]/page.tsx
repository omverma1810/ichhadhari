"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ShoppingCart,
  CheckCircle,
  AlertCircle,
  Loader2,
  Calendar,
  MapPin,
  FileText,
  DollarSign,
  Truck,
  RefreshCcw,
  Ban,
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  usePurchaseOrder,
  useApprovePurchaseOrder,
} from "@/lib/hooks/api/useProcurement";
import type { PurchaseOrder } from "@/lib/services/procurement.service";

// Status timeline configuration
const STATUS_TIMELINE = [
  { key: "draft", label: "Draft", icon: FileText },
  { key: "pending_approval", label: "Pending Approval", icon: AlertCircle },
  { key: "approved", label: "Approved", icon: CheckCircle },
  { key: "sent", label: "Sent", icon: Truck },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle },
  { key: "partially_received", label: "Partially Received", icon: AlertCircle },
  { key: "fully_received", label: "Fully Received", icon: CheckCircle },
];

const getStatusColor = (status: PurchaseOrder["status"]) => {
  const colors = {
    draft: "bg-gray-100 text-gray-700 border-gray-300",
    pending_approval: "bg-yellow-100 text-yellow-700 border-yellow-300",
    approved: "bg-blue-100 text-blue-700 border-blue-300",
    sent: "bg-purple-100 text-purple-700 border-purple-300",
    confirmed: "bg-indigo-100 text-indigo-700 border-indigo-300",
    partially_received: "bg-orange-100 text-orange-700 border-orange-300",
    fully_received: "bg-green-100 text-green-700 border-green-300",
    cancelled: "bg-red-100 text-red-700 border-red-300",
  };
  return colors[status] || colors.draft;
};

export default function PurchaseOrderDetailPage() {
  const params = useParams<{ po_id: string }>();
  const router = useRouter();
  const poId = params?.po_id ? parseInt(params.po_id) : 0;

  const { data: order, isLoading, isError } = usePurchaseOrder(poId);
  const approvePO = useApprovePurchaseOrder();

  const handleApprove = () => {
    approvePO.mutate(poId);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#F4A920]" />
          <p className="mt-2 text-sm text-[#8B5A3C]">
            Loading purchase order...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="max-w-md border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              Purchase Order Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600">
              The purchase order you are looking for could not be found.
            </p>
            <Button
              onClick={() => router.push("/vendors/purchase-orders")}
              className="mt-4"
              variant="outline"
            >
              Back to Purchase Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStatusIndex = STATUS_TIMELINE.findIndex(
    (s) => s.key === order.status
  );

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
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/vendors/purchase-orders")}
            className="mb-2 rounded-full hover:bg-[#F4A920]/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Purchase Orders
          </Button>
          <h1 className="text-3xl font-bold text-[#5D4037]">
            {order.po_number}
          </h1>
          <p className="text-sm text-[#8B5A3C]">
            Purchase order details and status
          </p>
        </div>
        <div className="flex gap-2">
          {order.status === "pending_approval" && (
            <Button
              onClick={handleApprove}
              disabled={approvePO.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {approvePO.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve Order
                </>
              )}
            </Button>
          )}
          <Badge variant="outline" className={getStatusColor(order.status)}>
            {STATUS_TIMELINE.find((s) => s.key === order.status)?.label ||
              order.status}
          </Badge>
        </div>
      </header>

      {/* Status Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-[#F4A920]" />
            Order Status Timeline
          </CardTitle>
          <CardDescription>
            Track the progress of this purchase order
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-6 top-0 h-full w-0.5 bg-gray-200" />
            <div className="space-y-6">
              {STATUS_TIMELINE.map((step, index) => {
                const isCompleted =
                  index < currentStatusIndex ||
                  (index === currentStatusIndex &&
                    order.status !== "cancelled");
                const isCurrent = index === currentStatusIndex;
                const Icon = step.icon;

                return (
                  <div key={step.key} className="relative flex gap-4">
                    <div
                      className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 ${
                        isCompleted
                          ? "border-[#F4A920] bg-[#F4A920] text-white"
                          : isCurrent
                          ? "border-[#F4A920] bg-white text-[#F4A920]"
                          : "border-gray-300 bg-white text-gray-400"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 pt-2">
                      <h3
                        className={`font-semibold ${
                          isCompleted || isCurrent
                            ? "text-[#5D4037]"
                            : "text-gray-400"
                        }`}
                      >
                        {step.label}
                      </h3>
                      {isCurrent && (
                        <p className="text-sm text-[#8B5A3C]">Current status</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {order.status === "cancelled" && (
            <div className="mt-6 rounded-lg border-2 border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-2">
                <Ban className="h-5 w-5 text-red-600" />
                <h3 className="font-semibold text-red-700">Order Cancelled</h3>
              </div>
              <p className="mt-2 text-sm text-red-600">
                This purchase order has been cancelled and will not be
                processed.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Information */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#F4A920]" />
              Order Dates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-[#8B5A3C]">PO Date</p>
              <p className="text-[#5D4037]">
                {format(new Date(order.po_date), "PPP")}
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-[#8B5A3C]">
                Expected Delivery
              </p>
              <p className="text-[#5D4037]">
                {format(new Date(order.expected_delivery_date), "PPP")}
              </p>
            </div>
            {order.actual_delivery_date && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-[#8B5A3C]">
                    Actual Delivery
                  </p>
                  <p className="text-green-600">
                    {format(new Date(order.actual_delivery_date), "PPP")}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#F4A920]" />
              Delivery Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-[#8B5A3C]">
                Delivery Address
              </p>
              <p className="text-[#5D4037]">{order.delivery_address}</p>
            </div>
            {order.shipping_method && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-[#8B5A3C]">
                    Shipping Method
                  </p>
                  <p className="text-[#5D4037]">{order.shipping_method}</p>
                </div>
              </>
            )}
            {order.tracking_number && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-[#8B5A3C]">
                    Tracking Number
                  </p>
                  <p className="font-mono text-[#5D4037]">
                    {order.tracking_number}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-[#F4A920]" />
            Financial Summary
          </CardTitle>
          <CardDescription>Order amount breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[#8B5A3C]">Subtotal</span>
              <span className="font-semibold text-[#5D4037]">
                ₹
                {order.subtotal.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8B5A3C]">Tax Amount</span>
              <span className="font-semibold text-[#5D4037]">
                ₹
                {order.tax_amount.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8B5A3C]">Discount</span>
              <span className="font-semibold text-green-600">
                -₹
                {order.discount_amount.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg">
              <span className="font-bold text-[#5D4037]">Total Amount</span>
              <span className="font-bold text-[#F4A920]">
                ₹
                {order.total_amount.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recurring Order Info */}
      {order.is_recurring && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <RefreshCcw className="h-5 w-5" />
              Recurring Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-purple-800">
              This is a recurring order set to repeat{" "}
              <strong>{order.recurrence_frequency}</strong>.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Terms and Notes */}
      {(order.terms_and_conditions || order.notes) && (
        <div className="grid gap-6 md:grid-cols-2">
          {order.terms_and_conditions && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#F4A920]" />
                  Terms and Conditions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-[#5D4037]">
                  {order.terms_and_conditions}
                </p>
              </CardContent>
            </Card>
          )}

          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#F4A920]" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-[#5D4037]">
                  {order.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </motion.section>
  );
}
