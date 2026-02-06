"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Edit,
  Mail,
  MapPin,
  Phone,
  Wallet,
  FileText,
  Inbox,
  IndianRupee,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  useVendor,
  useVendorPurchaseOrders,
  useVendorPayments,
  useDeleteVendor,
} from "@/hooks/api/useVendorsEmployees";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import VendorPricingTab from "@/components/vendors/VendorPricingTab";
import type { VendorStatus } from "@/types/api/vendors";

const formatCurrency = (value: number | string) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const statusBadgeStyles: Record<VendorStatus, string> = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  inactive: "border-slate-200 bg-slate-50 text-slate-600",
  suspended: "border-amber-200 bg-amber-50 text-amber-700",
};

export default function VendorDetailPage() {
  const params = useParams<{ vendor_id: string }>();
  const router = useRouter();
  const vendorId = Number(params?.vendor_id);
  const isValidId = Number.isFinite(vendorId) && vendorId > 0;

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const {
    data: vendor,
    isLoading,
    error,
    refetch,
  } = useVendor(vendorId, isValidId);

  const { data: purchaseOrdersData } = useVendorPurchaseOrders(
    vendorId,
    undefined,
  );
  const { data: paymentsData } = useVendorPayments({ vendor: vendorId });

  const deleteVendor = useDeleteVendor();

  if (!isValidId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <ErrorMessage message="Invalid vendor ID" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner withText text="Loading vendor details..." />
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="p-6">
        <ErrorMessage
          message="Failed to load vendor details"
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const purchaseOrders =
    (purchaseOrdersData as any)?.results ??
    (Array.isArray(purchaseOrdersData) ? purchaseOrdersData : []);
  const payments = (paymentsData as any)?.results ?? [];

  const handleDelete = () => {
    deleteVendor.mutate(vendorId, {
      onSuccess: () => {
        toast.success("Vendor deleted successfully");
        router.push("/vendors");
      },
    });
    setDeleteDialogOpen(false);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/vendors")}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                {vendor.company_name}
              </h1>
              <Badge
                className={cn(
                  "capitalize",
                  statusBadgeStyles[vendor.status] ??
                    "bg-gray-100 text-gray-700",
                )}
              >
                {vendor.status}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {vendor.vendor_id} · {vendor.category?.replace("_", " ")}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/vendors/${vendorId}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="mr-1 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete
          </Button>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Purchases</p>
            <p className="text-lg font-bold">
              {formatCurrency(vendor.total_purchases)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Payments</p>
            <p className="text-lg font-bold">
              {formatCurrency(vendor.total_payments)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Outstanding</p>
            <p className="text-lg font-bold text-red-600">
              {formatCurrency(vendor.outstanding_balance)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Rating</p>
            <p className="text-lg font-bold">
              {Number(vendor.rating).toFixed(1)} / 5
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full flex-wrap">
          <TabsTrigger value="overview" className="flex-1">
            <Building2 className="mr-1 h-4 w-4 hidden sm:inline" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex-1">
            <FileText className="mr-1 h-4 w-4 hidden sm:inline" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex-1">
            <Wallet className="mr-1 h-4 w-4 hidden sm:inline" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex-1">
            <IndianRupee className="mr-1 h-4 w-4 hidden sm:inline" />
            Pricing
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <InfoRow
                  icon={Users}
                  label="Contact Person"
                  value={vendor.contact_person}
                />
                <InfoRow icon={Phone} label="Phone" value={vendor.phone} />
                {vendor.alternate_phone && (
                  <InfoRow
                    icon={Phone}
                    label="Alt Phone"
                    value={vendor.alternate_phone}
                  />
                )}
                {vendor.email && (
                  <InfoRow icon={Mail} label="Email" value={vendor.email} />
                )}
                {vendor.website && (
                  <InfoRow
                    icon={Inbox}
                    label="Website"
                    value={vendor.website}
                  />
                )}
              </CardContent>
            </Card>

            {/* Address & Legal */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Address & Legal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <InfoRow
                  icon={MapPin}
                  label="Billing Address"
                  value={vendor.billing_address}
                />
                {vendor.shipping_address && (
                  <InfoRow
                    icon={MapPin}
                    label="Shipping Address"
                    value={vendor.shipping_address}
                  />
                )}
                {vendor.gst_number && (
                  <InfoRow label="GST Number" value={vendor.gst_number} />
                )}
                {vendor.pan_number && (
                  <InfoRow label="PAN Number" value={vendor.pan_number} />
                )}
                {vendor.company_registration_number && (
                  <InfoRow
                    label="Registration No."
                    value={vendor.company_registration_number}
                  />
                )}
              </CardContent>
            </Card>

            {/* Banking Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Banking Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {vendor.bank_name ? (
                  <>
                    <InfoRow label="Bank Name" value={vendor.bank_name} />
                    <InfoRow
                      label="Account No."
                      value={
                        vendor.account_number
                          ? `XXXX${vendor.account_number.slice(-4)}`
                          : "—"
                      }
                    />
                    <InfoRow
                      label="IFSC Code"
                      value={vendor.ifsc_code ?? "—"}
                    />
                    <InfoRow
                      label="Account Holder"
                      value={vendor.account_holder_name ?? "—"}
                    />
                  </>
                ) : (
                  <p className="text-muted-foreground">
                    No banking details on file
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Payment Terms */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Payment Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <InfoRow
                  icon={Calendar}
                  label="Credit Period"
                  value={`${vendor.credit_period_days} days`}
                />
                <InfoRow
                  icon={Wallet}
                  label="Credit Limit"
                  value={formatCurrency(vendor.credit_limit)}
                />
                <InfoRow
                  label="Payment Method"
                  value={vendor.payment_method?.replace("_", " ") ?? "—"}
                />
                <InfoRow
                  label="Discount"
                  value={`${Number(vendor.discount_percentage).toFixed(1)}%`}
                />
              </CardContent>
            </Card>
          </div>

          {vendor.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{vendor.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          {Array.isArray(purchaseOrders) && purchaseOrders.length > 0 ? (
            <div className="space-y-4">
              {(purchaseOrders as any[]).map((po) => (
                <Card key={po.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-semibold">{po.po_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(po.po_date)} · Expected:{" "}
                          {formatDate(po.expected_delivery_date)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {po.status?.replace("_", " ")}
                        </Badge>
                        <span className="font-semibold">
                          {formatCurrency(po.total_amount)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex h-40 items-center justify-center text-muted-foreground">
                No purchase orders found for this vendor
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4">
          {payments.length > 0 ? (
            <div className="space-y-4">
              {payments.map((payment: any) => (
                <Card key={payment.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-semibold">{payment.payment_id}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(payment.payment_date)} ·{" "}
                          {payment.payment_method?.replace("_", " ")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            "capitalize",
                            payment.status === "completed"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : payment.status === "failed"
                                ? "border-red-200 bg-red-50 text-red-700"
                                : "border-amber-200 bg-amber-50 text-amber-700",
                          )}
                        >
                          {payment.status}
                        </Badge>
                        <span className="font-semibold">
                          {formatCurrency(payment.amount)}
                        </span>
                      </div>
                    </div>
                    {payment.generated_invoice && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Invoice: {payment.generated_invoice.invoice_number}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex h-40 items-center justify-center text-muted-foreground">
                No payments found for this vendor
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing">
          <VendorPricingTab
            vendorId={vendorId}
            vendorName={vendor.company_name}
          />
        </TabsContent>
      </Tabs>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Vendor</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <strong>{vendor.company_name}</strong>? This action cannot be
            undone.
          </p>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteVendor.isPending}
              className="w-full sm:w-auto"
            >
              {deleteVendor.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon?: any;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-start gap-2">
      {Icon && (
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      )}
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="break-words">{value || "—"}</p>
      </div>
    </div>
  );
}
