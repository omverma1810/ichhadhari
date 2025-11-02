"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Wallet,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2,
  Calendar,
  Building2,
  CreditCard,
  Banknote,
  Smartphone,
  FileText as FileTextIcon,
  DollarSign,
  User,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useVendorPayment,
  useProcessVendorPayment,
  useVendorPaymentHistory,
} from "@/lib/hooks/api/useProcurement";
import type { VendorPayment } from "@/lib/services/procurement.service";

// Payment method icons
const PAYMENT_METHOD_CONFIG = {
  cash: { label: "Cash", icon: Banknote, color: "text-green-600" },
  bank_transfer: {
    label: "Bank Transfer",
    icon: CreditCard,
    color: "text-blue-600",
  },
  upi: { label: "UPI", icon: Smartphone, color: "text-purple-600" },
  cheque: { label: "Cheque", icon: FileTextIcon, color: "text-orange-600" },
};

const getStatusColor = (status: VendorPayment["status"]) => {
  const colors = {
    pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
    completed: "bg-green-100 text-green-700 border-green-300",
    failed: "bg-red-100 text-red-700 border-red-300",
  };
  return colors[status];
};

export default function VendorPaymentDetailPage() {
  const params = useParams<{ payment_id: string }>();
  const router = useRouter();
  const paymentId = params?.payment_id ? parseInt(params.payment_id) : 0;

  const [showProcessModal, setShowProcessModal] = useState(false);
  const [transactionRef, setTransactionRef] = useState("");

  const { data: payment, isLoading, isError } = useVendorPayment(paymentId);
  const { data: paymentHistory } = useVendorPaymentHistory(
    payment?.vendor || 0
  );
  const processPayment = useProcessVendorPayment();

  const handleProcessPayment = () => {
    processPayment.mutate(
      {
        id: paymentId,
        reference: transactionRef,
      },
      {
        onSuccess: () => {
          setShowProcessModal(false);
          setTransactionRef("");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#F4A920]" />
          <p className="mt-2 text-sm text-[#8B5A3C]">Loading payment...</p>
        </div>
      </div>
    );
  }

  if (isError || !payment) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="max-w-md border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              Payment Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600">
              The payment you are looking for could not be found.
            </p>
            <Button
              onClick={() => router.push("/vendors/payments")}
              className="mt-4"
              variant="outline"
            >
              Back to Payments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const PaymentMethodBadge = ({
    method,
  }: {
    method: VendorPayment["payment_method"];
  }) => {
    const config = PAYMENT_METHOD_CONFIG[method];
    const Icon = config.icon;

    return (
      <div className={`flex items-center gap-2 ${config.color}`}>
        <Icon className="h-5 w-5" />
        <span className="font-medium">{config.label}</span>
      </div>
    );
  };

  const StatusBadge = ({ status }: { status: VendorPayment["status"] }) => {
    const icons = {
      pending: Clock,
      completed: CheckCircle,
      failed: AlertCircle,
    };
    const Icon = icons[status];

    return (
      <Badge
        variant="outline"
        className={`${getStatusColor(status)} px-3 py-1`}
      >
        <Icon className="mr-1.5 h-4 w-4" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
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
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/vendors/payments")}
            className="mb-2 rounded-full hover:bg-[#F4A920]/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Payments
          </Button>
          <h1 className="text-3xl font-bold text-[#5D4037]">
            {payment.payment_id}
          </h1>
          <p className="text-sm text-[#8B5A3C]">Payment details and status</p>
        </div>
        <div className="flex gap-2">
          {payment.status === "pending" && (
            <Button
              onClick={() => setShowProcessModal(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Process Payment
            </Button>
          )}
          <StatusBadge status={payment.status} />
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column - Payment Details */}
        <div className="space-y-6 md:col-span-2">
          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-[#F4A920]" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-[#8B5A3C]">
                    Payment Date
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#8B5A3C]" />
                    <p className="text-[#5D4037]">
                      {format(new Date(payment.payment_date), "PPP")}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-[#8B5A3C]">Amount</p>
                  <p className="mt-1 text-2xl font-bold text-[#F4A920]">
                    ₹
                    {payment.amount.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-[#8B5A3C]">
                    Payment Method
                  </p>
                  <div className="mt-1">
                    <PaymentMethodBadge method={payment.payment_method} />
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-[#8B5A3C]">
                    Payment Type
                  </p>
                  <div className="mt-1">
                    {payment.is_advance ? (
                      <Badge
                        variant="outline"
                        className="bg-purple-50 text-purple-700"
                      >
                        Advance Payment
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-gray-50 text-gray-700"
                      >
                        Regular Payment
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Transaction References */}
              {(payment.transaction_reference ||
                payment.upi_transaction_id ||
                payment.cheque_number) && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-[#8B5A3C]">
                    Transaction Details
                  </p>
                  {payment.transaction_reference && (
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-[#8B5A3C]" />
                      <span className="font-mono text-sm">
                        {payment.transaction_reference}
                      </span>
                    </div>
                  )}
                  {payment.upi_transaction_id && (
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-[#8B5A3C]" />
                      <span className="font-mono text-sm">
                        {payment.upi_transaction_id}
                      </span>
                    </div>
                  )}
                  {payment.cheque_number && (
                    <div className="flex items-center gap-2">
                      <FileTextIcon className="h-4 w-4 text-[#8B5A3C]" />
                      <span className="font-mono text-sm">
                        Cheque #{payment.cheque_number}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {payment.processed_by && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-[#8B5A3C]">
                      Processed By
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <User className="h-4 w-4 text-[#8B5A3C]" />
                      <p className="text-[#5D4037]">
                        {payment.processed_by.first_name}{" "}
                        {payment.processed_by.last_name}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {payment.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-[#8B5A3C]">Notes</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-[#5D4037]">
                      {payment.notes}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Vendor Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-[#F4A920]" />
                Vendor Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium text-[#8B5A3C]">
                  Vendor Name
                </p>
                <p className="text-lg font-semibold text-[#5D4037]">
                  {payment.vendor_name || `Vendor #${payment.vendor}`}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Payment History */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full ${
                      payment.status === "completed"
                        ? "bg-green-100"
                        : payment.status === "pending"
                        ? "bg-yellow-100"
                        : "bg-red-100"
                    }`}
                  >
                    {payment.status === "completed" ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : payment.status === "pending" ? (
                      <Clock className="h-4 w-4 text-yellow-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[#5D4037]">
                      {payment.status === "completed"
                        ? "Payment Completed"
                        : payment.status === "pending"
                        ? "Payment Pending"
                        : "Payment Failed"}
                    </p>
                    <p className="text-sm text-[#8B5A3C]">
                      {format(new Date(payment.created_at), "PPp")}
                    </p>
                  </div>
                </div>

                {payment.updated_at !== payment.created_at && (
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                      <DollarSign className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[#5D4037]">Last Updated</p>
                      <p className="text-sm text-[#8B5A3C]">
                        {format(new Date(payment.updated_at), "PPp")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Vendor Payment History */}
          {paymentHistory && paymentHistory.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Vendor Payment History
                </CardTitle>
                <CardDescription>
                  Recent payments to this vendor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {paymentHistory.slice(0, 5).map((hist) => (
                    <div
                      key={hist.id}
                      className={`rounded-lg border p-3 ${
                        hist.id === payment.id
                          ? "border-[#F4A920] bg-[#F4A920]/5"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                          ₹{hist.amount.toLocaleString("en-IN")}
                        </p>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getStatusColor(hist.status)}`}
                        >
                          {hist.status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-[#8B5A3C]">
                        {format(new Date(hist.payment_date), "PPP")}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Process Payment Modal */}
      <Dialog open={showProcessModal} onOpenChange={setShowProcessModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
            <DialogDescription>
              Confirm payment processing by entering transaction reference
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="transaction_ref">
                Transaction Reference (Optional)
              </Label>
              <Input
                id="transaction_ref"
                placeholder="Enter transaction reference"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
              />
            </div>
            <div className="rounded-lg bg-green-50 p-4">
              <p className="text-sm text-green-800">
                This will mark the payment as completed and update the status.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowProcessModal(false)}
              disabled={processPayment.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleProcessPayment}
              disabled={processPayment.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {processPayment.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirm Processing
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.section>
  );
}
