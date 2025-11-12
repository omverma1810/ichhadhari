"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Building2,
  Calendar,
  CheckCircle2,
  Download,
  Edit,
  FileText,
  Inbox,
  Mail,
  MapPin,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Upload,
  Users,
  Wallet,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  useVendor,
  useVendorPurchaseOrders,
  useVendorStats,
  useVendorPayments
} from "@/hooks/api/useVendorsEmployees";
import type {
  Address,
  BankDetails,
  ContactPerson,
  Vendor,
} from "@/types/vendor";
import type { Payment } from "@/types/payment";
import type { PurchaseOrder } from "@/types/purchase-order";
import type { Invoice } from "@/types/invoice";

const brandColors = {
  gold: "#F4A920",
  brown: "#8B5A3C",
  cream: "#FFFEF7",
  dark: "#5D4037",
  green: "#2E7D32",
  red: "#C62828",
  blue: "#1E88E5",
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

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

const maskAccountNumber = (value?: string) => {
  if (!value) return "—";
  const digits = value.slice(-4);
  return `XXXX-XXXX-${digits}`;
};

const ratingColor = (value: number) => {
  if (value >= 4.5) return "text-emerald-600";
  if (value >= 4) return "text-blue-600";
  if (value >= 3.5) return "text-amber-600";
  return "text-red-600";
};

const statusBadgeStyles: Record<Vendor["status"], string> = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  inactive: "border-slate-200 bg-slate-50 text-slate-600",
  suspended: "border-amber-200 bg-amber-50 text-amber-700",
  blocked: "border-red-200 bg-red-50 text-red-700",
};

const paymentStatusBadge = (status: Payment["reconciled"]) =>
  status
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-amber-200 bg-amber-50 text-amber-700";

const paymentStatusLabel = (status: Payment["reconciled"]) =>
  status ? "Reconciled" : "Pending";

type ContactSectionKey = "billing" | "shipping" | "warehouse";

interface AddressState {
  billing: Address;
  shipping: Address;
  warehouse?: Address;
}

type PaymentMethodGrouping = Record<string, Payment[]>;

type TrendPoint = { month: string; rating: number };

const createEmptyAddress = (): Address => ({
  street: "",
  city: "",
  state: "",
  postal_code: "",
  country: "India",
});

const createEmptyBankDetails = (): BankDetails => ({
  bank_name: "",
  account_number: "",
  ifsc_code: "",
  account_holder: "",
  account_type: "current",
});

export default function VendorDetailPage() {
  const params = useParams<{ vendor_id: string }>();
  const router = useRouter();
  const vendorId = params?.vendor_id;

  const vendor = useMemo(
    () => mockVendors.find((entry) => entry.id === vendorId),
    [vendorId]
  );

  if (!vendor) {
    notFound();
  }

  const performance = useMemo(
    () => mockVendorPerformance.find((entry) => entry.vendor_id === vendor.id),
    [vendor.id]
  );

  const vendorOrders = useMemo(
    () => mockPurchaseOrders.filter((order) => order.vendor_id === vendor.id),
    [vendor.id]
  );

  const vendorPayments = useMemo(
    () => mockPayments.filter((payment) => payment.vendor_id === vendor.id),
    [vendor.id]
  );

  const vendorInvoices = useMemo(
    () => mockInvoices.filter((invoice) => invoice.vendor_id === vendor.id),
    [vendor.id]
  );

  const outstandingEntry = useMemo(
    () =>
      mockOutstandingBalances.find((entry) => entry.vendor_id === vendor.id),
    [vendor.id]
  );

  const latestOrderDate = useMemo(() => {
    if (vendorOrders.length === 0) return undefined;
    return vendorOrders
      .map((order) => order.order_date)
      .filter(Boolean)
      .sort(
        (a, b) => new Date(b ?? "").getTime() - new Date(a ?? "").getTime()
      )[0];
  }, [vendorOrders]);

  const daysSinceLastOrder = useMemo(() => {
    if (!latestOrderDate) return "—";
    const diff = Date.now() - new Date(latestOrderDate).getTime();
    return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
  }, [latestOrderDate]);

  const [activeTab, setActiveTab] = useState("overview");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [status, setStatus] = useState<Vendor["status"]>(vendor.status);
  const [addresses, setAddresses] = useState<AddressState>({
    billing: vendor.billing_address,
    shipping: vendor.shipping_address,
    warehouse: vendor.warehouse_address,
  });
  const [bankDetails, setBankDetails] = useState<BankDetails | undefined>(
    vendor.bank_details
  );
  const [addressDialog, setAddressDialog] = useState<{
    open: boolean;
    key: ContactSectionKey;
  }>({ open: false, key: "billing" });
  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [addressDraft, setAddressDraft] = useState<Address | undefined>();
  const [tempBankDraft, setTempBankDraft] = useState<BankDetails | undefined>();

  const updateAddressDraft = (field: keyof Address, value: string) => {
    setAddressDraft((prev) => ({
      ...(prev ?? createEmptyAddress()),
      [field]: value,
    }));
  };

  const trendData: TrendPoint[] = useMemo(() => {
    const base = performance?.overall_rating ?? vendor.rating;
    const points = [0, 1, 2].map((index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (2 - index));
      const month = date.toLocaleDateString("en-IN", { month: "short" });
      const variance = index === 1 ? 0.1 : index === 2 ? -0.2 : 0.05;
      return {
        month,
        rating: Math.max(
          2.5,
          Math.min(5, Number((base + variance).toFixed(1)))
        ),
      };
    });
    return points;
  }, [performance?.overall_rating, vendor.rating]);

  const paymentSummary = useMemo(() => {
    const total = vendorPayments.reduce(
      (acc, payment) => acc + payment.amount,
      0
    );
    const methods = vendorPayments.reduce<PaymentMethodGrouping>(
      (acc, payment) => {
        const method = payment.payment_method;
        if (!acc[method]) acc[method] = [];
        acc[method].push(payment);
        return acc;
      },
      {}
    );
    return {
      total,
      methods,
      lastPaymentDate: vendorPayments.length
        ? vendorPayments
            .map((entry) => entry.payment_date)
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
        : undefined,
    };
  }, [vendorPayments]);

  const paymentMethodBreakdown = useMemo(() => {
    const entries = Object.entries(paymentSummary.methods).map(
      ([method, payments]) => ({
        method,
        total: payments.reduce((acc, payment) => acc + payment.amount, 0),
      })
    );
    const total = entries.reduce((acc, entry) => acc + entry.total, 0) || 1;
    return entries.map((entry) => ({
      method: entry.method,
      value: Number(((entry.total / total) * 100).toFixed(1)),
    }));
  }, [paymentSummary.methods]);

  const outstandingInvoices = useMemo(
    () => vendorInvoices.filter((invoice) => !invoice.is_fully_paid),
    [vendorInvoices]
  );

  const pendingDeliveries = useMemo(
    () =>
      vendorOrders.filter((order) =>
        ["confirmed", "partially_received", "draft"].includes(order.status)
      ),
    [vendorOrders]
  );

  const recentPayments = useMemo(
    () => vendorPayments.slice(0, 5),
    [vendorPayments]
  );

  const copyAddress = (from: ContactSectionKey, to: ContactSectionKey) => {
    setAddresses((prev) => ({
      ...prev,
      [to]: { ...(prev[from] ?? createEmptyAddress()) },
    }));
    toast.success(`Copied ${from} address to ${to}`);
  };

  const openAddressDialog = (key: ContactSectionKey) => {
    const draft = addresses[key] ?? createEmptyAddress();
    setAddressDraft(draft);
    setAddressDialog({ open: true, key });
  };

  const saveAddress = () => {
    if (!addressDraft) return;
    setAddresses((prev) => ({
      ...prev,
      [addressDialog.key]: addressDraft,
    }));
    setAddressDialog({ open: false, key: addressDialog.key });
    toast.success("Address updated");
  };

  const openBankDialog = () => {
    setTempBankDraft(bankDetails ?? createEmptyBankDetails());
    setBankDialogOpen(true);
  };

  const updateBankDraft = (field: keyof BankDetails, value: string) => {
    setTempBankDraft((prev) => ({
      ...(prev ?? createEmptyBankDetails()),
      [field]: value,
    }));
  };

  const saveBankDetails = () => {
    setBankDetails(tempBankDraft);
    setBankDialogOpen(false);
    toast.success("Bank details updated");
  };

  const handleDeleteVendor = () => {
    setDeleteDialogOpen(false);
    toast.error("Vendor archived. (Mock action)");
    router.push("/vendors");
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="space-y-8 text-[color:#5D4037]"
    >
      <header className="flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-[#FFF3D9] via-[#FFF9EC] to-[#FFFEF7] p-6 shadow-[0_20px_45px_rgba(244,169,32,0.25)] lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm text-[#8B5A3C]/70">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 rounded-full bg-white/80 text-[#8B5A3C] hover:bg-[#F4A920]/15 hover:text-[#5D4037]"
              onClick={() => router.push("/vendors")}
            >
              <ArrowLeft className="mr-2 size-4" />
              Back to Vendors
            </Button>
            <span>•</span>
            <Link
              href="/dashboard"
              className="transition-colors hover:text-[#F4A920]"
            >
              Dashboard
            </Link>
            <span>/</span>
            <Link
              href="/vendors"
              className="transition-colors hover:text-[#F4A920]"
            >
              Vendors
            </Link>
            <span>/</span>
            <span className="font-semibold text-[#5D4037]">
              {vendor.company_name}
            </span>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
            <div className="flex items-center gap-3">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-white/80 text-2xl font-semibold text-[#F4A920] shadow-inner">
                {vendor.company_name.charAt(0)}
              </span>
              <div>
                <h1 className="text-2xl font-semibold text-[#5D4037] lg:text-3xl">
                  {vendor.company_name}
                </h1>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[#8B5A3C]/80">
                  <Badge
                    className={cn(
                      "px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                      statusBadgeStyles[status]
                    )}
                  >
                    {status}
                  </Badge>
                  <span className="flex items-center gap-1">
                    <Users className="size-4 text-[#F4A920]" />
                    {vendor.vendor_type.replace("_", " ")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="size-4 text-[#F4A920]" />
                    Joined {formatDate(vendor.created_at)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                className="rounded-full bg-gradient-to-r from-[#F4A920] to-[#8B5A3C] px-4 text-white shadow-[0_12px_24px_rgba(139,90,60,0.25)] hover:scale-[1.02]"
                onClick={() => router.push(`/vendors/${vendor.id}/edit`)}
              >
                <Edit className="mr-2 size-4" />
                Edit Vendor
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-red-200 text-red-600 hover:bg-red-50"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <ShieldAlert className="mr-2 size-4" />
                Delete Vendor
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <motion.div
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.08 } },
            }}
          >
            <MetricCard
              icon={Building2}
              title="Total Purchases"
              value={formatCurrency(vendor.total_purchases)}
              accent="from-[#F4A920] to-[#F4A920]"
              description="Lifetime"
            />
            <MetricCard
              icon={Wallet}
              title="Total Payments"
              value={formatCurrency(vendor.total_payments)}
              accent="from-[#4ADE80] to-[#22C55E]"
              description="Settled"
            />
            <MetricCard
              icon={AlertCircle}
              title="Outstanding Balance"
              value={formatCurrency(vendor.outstanding_balance)}
              accent="from-[#FB923C] to-[#F97316]"
              description={
                outstandingEntry
                  ? `${outstandingEntry.days_overdue} days overdue`
                  : "Current"
              }
            />
            <MetricCard
              icon={Calendar}
              title="Days Since Last Order"
              value={`${daysSinceLastOrder}`}
              accent="from-[#60A5FA] to-[#2563EB]"
              description={
                latestOrderDate
                  ? `Last order ${formatDate(latestOrderDate)}`
                  : "No orders yet"
              }
            />
          </motion.div>

          <Card className="border-none bg-white shadow-[0_18px_45px_rgba(93,64,55,0.12)]">
            <CardHeader className="flex flex-col gap-4 border-b border-[#F4A920]/20 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="text-lg text-[#5D4037]">
                  Vendor Profile
                </CardTitle>
                <CardDescription className="text-sm text-[#8B5A3C]/70">
                  Primary information and contact references
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-[#8B5A3C]/70">
                <span className="flex items-center gap-1">
                  <Phone className="size-4 text-[#F4A920]" />
                  <a
                    href={`tel:${vendor.phone}`}
                    className="hover:text-[#F4A920]"
                  >
                    {vendor.phone}
                  </a>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Mail className="size-4 text-[#F4A920]" />
                  <a
                    href={`mailto:${vendor.email}`}
                    className="hover:text-[#F4A920]"
                  >
                    {vendor.email}
                  </a>
                </span>
                {vendor.preferred_payment_method ? (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <BadgeCheck className="size-4 text-[#F4A920]" />
                      Prefers{" "}
                      {vendor.preferred_payment_method.replace("_", " ")}
                    </span>
                  </>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-6 py-6">
              <div className="grid gap-6 xl:grid-cols-2">
                <div className="space-y-4">
                  <SectionTitle>Company Details</SectionTitle>
                  <InfoGrid
                    rows={[
                      { label: "Vendor ID", value: vendor.vendor_id },
                      { label: "Company Name", value: vendor.company_name },
                      {
                        label: "Vendor Type",
                        value: vendor.vendor_type.replace("_", " "),
                      },
                      {
                        label: "Registration Number",
                        value: vendor.registration_number ?? "—",
                      },
                      { label: "GST Number", value: vendor.gst_number ?? "—" },
                      { label: "PAN Number", value: vendor.pan_number ?? "—" },
                    ]}
                  />
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "rounded-full border-[#F4A920]/40 text-[#8B5A3C] hover:border-[#F4A920] hover:bg-[#F4A920]/10",
                        status === "active"
                          ? "bg-emerald-50/70 border-emerald-200 text-emerald-700"
                          : undefined
                      )}
                      onClick={() => {
                        const nextStatus =
                          status === "active" ? "suspended" : "active";
                        setStatus(nextStatus);
                        toast.info(`Status changed to ${nextStatus}`);
                      }}
                    >
                      <ShieldCheck className="mr-2 size-4" />
                      Toggle Status
                    </Button>
                    <div className="flex items-center gap-1 text-sm">
                      <span className="font-semibold text-[#5D4037]">
                        Rating:
                      </span>
                      <Rating value={vendor.rating} />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <SectionTitle>Current Financial Status</SectionTitle>
                  <div className="grid gap-3 rounded-2xl bg-[#FFFEF7] p-4 shadow-inner">
                    <StatRow
                      label="Outstanding Balance"
                      value={formatCurrency(vendor.outstanding_balance)}
                    />
                    <StatRow
                      label="Total Purchases (YTD)"
                      value={formatCurrency(vendor.total_purchases)}
                    />
                    <StatRow
                      label="Total Payments (YTD)"
                      value={formatCurrency(vendor.total_payments)}
                    />
                    <StatRow
                      label="Average Order Value"
                      value={formatCurrency(
                        Math.round(
                          vendor.total_purchases /
                            Math.max(1, vendorOrders.length)
                        )
                      )}
                    />
                    <StatRow
                      label="Last Order Date"
                      value={formatDate(latestOrderDate)}
                    />
                    <StatRow
                      label="Next Expected Order"
                      value={
                        latestOrderDate
                          ? formatDate(
                              new Date(
                                Date.now() + 7 * 24 * 60 * 60 * 1000
                              ).toISOString()
                            )
                          : "To be scheduled"
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
                <div className="space-y-3">
                  <SectionTitle>Primary Contact</SectionTitle>
                  {vendor.contact_persons[0] ? (
                    <div className="rounded-2xl border border-[#F4A920]/30 bg-white p-4 shadow-[0_12px_30px_rgba(93,64,55,0.1)]">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-base font-semibold text-[#5D4037]">
                            {vendor.contact_persons[0].name}
                          </p>
                          <p className="text-sm text-[#8B5A3C]/70">
                            {vendor.contact_persons[0].designation}
                          </p>
                        </div>
                        <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                          Primary
                        </Badge>
                      </div>
                      <div className="mt-3 space-y-2 text-sm text-[#8B5A3C]/80">
                        <ContactLink
                          icon={Phone}
                          label="Phone"
                          href={`tel:${vendor.contact_persons[0].phone}`}
                          value={vendor.contact_persons[0].phone}
                        />
                        <ContactLink
                          icon={Mail}
                          label="Email"
                          href={`mailto:${vendor.contact_persons[0].email}`}
                          value={vendor.contact_persons[0].email}
                        />
                      </div>
                    </div>
                  ) : (
                    <EmptyState message="No primary contact assigned" />
                  )}
                </div>
                <div className="space-y-3">
                  <SectionTitle>Documents</SectionTitle>
                  <div className="space-y-3">
                    {vendor.documents.length ? (
                      vendor.documents.map((document) => (
                        <div
                          key={document.id}
                          className="flex items-center justify-between rounded-xl border border-[#F4A920]/20 bg-[#FFFEF7] px-3 py-2 text-sm text-[#5D4037]"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="size-4 text-[#F4A920]" />
                            <div>
                              <p className="font-semibold">
                                {document.file_name}
                              </p>
                              <p className="text-xs text-[#8B5A3C]/70">
                                Uploaded {formatDate(document.upload_date)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="rounded-full text-[#8B5A3C] hover:bg-[#F4A920]/15 hover:text-[#F4A920]"
                            >
                              <Download className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="rounded-full text-[#8B5A3C] hover:bg-red-50 hover:text-red-600"
                            >
                              <ShieldAlert className="size-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <EmptyState message="No documents uploaded" />
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full rounded-full border-[#F4A920]/40 text-[#8B5A3C] hover:border-[#F4A920] hover:bg-[#F4A920]/10"
                  >
                    <Upload className="mr-2 size-4" />
                    Upload Document
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-white shadow-[0_18px_45px_rgba(93,64,55,0.12)]">
            <CardHeader>
              <CardTitle className="text-lg text-[#5D4037]">
                Vendor Insights
              </CardTitle>
              <CardDescription className="text-sm text-[#8B5A3C]/70">
                Drill into contacts, payments, performance, and more
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-6"
              >
                <TabsList className="flex flex-wrap gap-2 bg-[#FFFEF7] p-2">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="contacts">Contact Details</TabsTrigger>
                  <TabsTrigger value="banking">Banking Information</TabsTrigger>
                  <TabsTrigger value="payments">Payment History</TabsTrigger>
                  <TabsTrigger value="performance">
                    Performance Metrics
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="grid gap-6 lg:grid-cols-2"
                  >
                    <OverviewCard title="Financial Snapshot">
                      <OverviewRow
                        label="Credit Limit"
                        value={formatCurrency(vendor.credit_limit)}
                      />
                      <OverviewRow
                        label="Credit Period"
                        value={`${vendor.credit_period_days} days`}
                      />
                      <OverviewRow
                        label="Preferred Payment Method"
                        value={
                          vendor.preferred_payment_method?.replace("_", " ") ??
                          "—"
                        }
                      />
                      <OverviewRow
                        label="Discount"
                        value={`${vendor.discount_percentage}%`}
                      />
                    </OverviewCard>
                    <OverviewCard title="Communication Channels">
                      <OverviewRow
                        label="Company Phone"
                        value={vendor.phone ?? "—"}
                      />
                      <OverviewRow
                        label="Company Email"
                        value={vendor.email ?? "—"}
                      />
                      <OverviewRow
                        label="Website"
                        value={
                          vendor.contact_persons[0]?.email ? (
                            <Link
                              href={`https://${
                                vendor.email?.split("@")[1] ?? "example.com"
                              }`}
                              className="text-[#1E88E5] hover:underline"
                            >
                              Visit Website
                            </Link>
                          ) : (
                            "—"
                          )
                        }
                      />
                      <OverviewRow
                        label="Primary Contact"
                        value={vendor.contact_persons[0]?.name ?? "—"}
                      />
                    </OverviewCard>
                  </motion.div>

                  <div className="grid gap-6 xl:grid-cols-3">
                    <OverviewCard
                      title="Recent Purchase Orders"
                      footerAction="View All Orders"
                      onFooterAction={() => router.push("/vendors/orders")}
                    >
                      {vendorOrders.slice(0, 3).map((order) => (
                        <MiniListItem
                          key={order.id}
                          title={order.po_number}
                          subtitle={formatDate(order.order_date)}
                          meta={formatCurrency(order.total_amount)}
                        />
                      ))}
                      {vendorOrders.length === 0 ? (
                        <EmptyState message="No purchase orders recorded" />
                      ) : null}
                    </OverviewCard>
                    <OverviewCard
                      title="Outstanding Invoices"
                      footerAction="View Invoices"
                      onFooterAction={() => router.push("/vendors/invoices")}
                    >
                      {outstandingInvoices.length ? (
                        outstandingInvoices.map((invoice) => (
                          <MiniListItem
                            key={invoice.id}
                            title={invoice.invoice_number}
                            subtitle={`Due ${formatDate(invoice.due_date)}`}
                            meta={formatCurrency(invoice.amount_outstanding)}
                          />
                        ))
                      ) : (
                        <EmptyState message="No outstanding invoices" />
                      )}
                    </OverviewCard>
                    <OverviewCard title="Pending Deliveries">
                      {pendingDeliveries.length ? (
                        pendingDeliveries.map((order) => (
                          <MiniListItem
                            key={order.id}
                            title={order.po_number}
                            subtitle={order.status.replace("_", " ")}
                            meta={formatDate(order.expected_delivery_date)}
                          />
                        ))
                      ) : (
                        <EmptyState message="No pending deliveries" />
                      )}
                    </OverviewCard>
                  </div>

                  <OverviewCard
                    title="Recent Payments"
                    footerAction="Record Payment"
                    onFooterAction={() => router.push("/vendors/payments")}
                  >
                    {recentPayments.length ? (
                      recentPayments.map((payment) => (
                        <MiniListItem
                          key={payment.id}
                          title={payment.payment_id}
                          subtitle={`${payment.payment_method.toUpperCase()} · ${formatDate(
                            payment.payment_date
                          )}`}
                          meta={formatCurrency(payment.amount)}
                        />
                      ))
                    ) : (
                      <EmptyState message="No payments captured" />
                    )}
                  </OverviewCard>
                </TabsContent>

                <TabsContent value="contacts" className="space-y-6">
                  <div className="grid gap-4 lg:grid-cols-3">
                    <AddressCard
                      title="Billing Address"
                      address={addresses.billing}
                      onCopy={() => copyAddress("billing", "shipping")}
                      onEdit={() => openAddressDialog("billing")}
                    />
                    <AddressCard
                      title="Shipping Address"
                      address={addresses.shipping}
                      onCopy={() => copyAddress("billing", "shipping")}
                      onEdit={() => openAddressDialog("shipping")}
                    />
                    <AddressCard
                      title="Warehouse Address"
                      address={addresses.warehouse}
                      optional
                      onCopy={() => copyAddress("billing", "warehouse")}
                      onEdit={() => openAddressDialog("warehouse")}
                    />
                  </div>

                  <div className="rounded-2xl border border-[#F4A920]/20 bg-white p-4 shadow-[0_12px_30px_rgba(93,64,55,0.1)]">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <SectionTitle>Contact Persons</SectionTitle>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full border-[#F4A920]/40 text-[#8B5A3C] hover:border-[#F4A920] hover:bg-[#F4A920]/10"
                      >
                        Add New Contact
                      </Button>
                    </div>
                    <div className="mt-4 overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-[#FFFEF7] text-xs uppercase tracking-wide text-[#8B5A3C]">
                            <TableHead>Name</TableHead>
                            <TableHead>Designation</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {vendor.contact_persons.map((person) => (
                            <TableRow
                              key={person.id}
                              className="text-sm text-[#5D4037]"
                            >
                              <TableCell>{person.name}</TableCell>
                              <TableCell>{person.designation}</TableCell>
                              <TableCell>
                                <a
                                  href={`tel:${person.phone}`}
                                  className="text-[#1E88E5] hover:underline"
                                >
                                  {person.phone}
                                </a>
                              </TableCell>
                              <TableCell>
                                <a
                                  href={`mailto:${person.email}`}
                                  className="text-[#1E88E5] hover:underline"
                                >
                                  {person.email}
                                </a>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    className="rounded-full text-[#8B5A3C] hover:bg-[#F4A920]/15 hover:text-[#F4A920]"
                                  >
                                    <Edit className="size-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    className="rounded-full text-red-600 hover:bg-red-50"
                                  >
                                    <ShieldAlert className="size-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="banking" className="space-y-4">
                  <Card className="border-none bg-[#FFFEF7] shadow-inner">
                    <CardContent className="space-y-4 p-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <SectionTitle>Banking Details</SectionTitle>
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-full border-[#F4A920]/40 text-[#8B5A3C] hover:border-[#F4A920] hover:bg-[#F4A920]/10"
                          onClick={openBankDialog}
                        >
                          Edit Banking Details
                        </Button>
                      </div>
                      {bankDetails ? (
                        <div className="grid gap-4 md:grid-cols-2">
                          <OverviewRow
                            label="Bank Name"
                            value={bankDetails.bank_name}
                          />
                          <OverviewRow
                            label="Account Number"
                            value={maskAccountNumber(
                              bankDetails.account_number
                            )}
                          />
                          <OverviewRow
                            label="IFSC"
                            value={bankDetails.ifsc_code}
                          />
                          <OverviewRow
                            label="Account Holder"
                            value={bankDetails.account_holder}
                          />
                          <OverviewRow
                            label="Account Type"
                            value={bankDetails.account_type}
                          />
                        </div>
                      ) : (
                        <EmptyState message="Bank details not provided" />
                      )}
                      <div className="rounded-xl border border-[#F4A920]/20 bg-white/70 p-4 text-sm text-[#8B5A3C]/70">
                        Sensitive information visible only to authorized finance
                        users.
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="payments" className="space-y-6">
                  <FilterToolbar payments={vendorPayments} />

                  <div className="overflow-x-auto rounded-2xl border border-[#F4A920]/20 bg-white shadow-[0_12px_30px_rgba(93,64,55,0.1)]">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-[#FFFEF7] text-xs uppercase tracking-wide text-[#8B5A3C]">
                          <TableHead>Payment ID</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Vendor</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Reference</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vendorPayments.map((payment) => (
                          <TableRow
                            key={payment.id}
                            className="text-sm text-[#5D4037]"
                          >
                            <TableCell>
                              <Link
                                href={`/vendors/payments?payment=${payment.payment_id}`}
                                className="text-[#1E88E5] hover:underline"
                              >
                                {payment.payment_id}
                              </Link>
                            </TableCell>
                            <TableCell>
                              {formatDate(payment.payment_date)}
                            </TableCell>
                            <TableCell>{vendor.company_name}</TableCell>
                            <TableCell>
                              {formatCurrency(payment.amount)}
                            </TableCell>
                            <TableCell className="capitalize">
                              {payment.payment_method.replace("_", " ")}
                            </TableCell>
                            <TableCell className="capitalize">
                              {payment.payment_type.replace("_", " ")}
                            </TableCell>
                            <TableCell>{payment.reference_number}</TableCell>
                            <TableCell>
                              <Badge
                                className={cn(
                                  "px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                                  paymentStatusBadge(payment.reconciled)
                                )}
                              >
                                {paymentStatusLabel(payment.reconciled)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  className="rounded-full text-[#8B5A3C] hover:bg-[#F4A920]/15 hover:text-[#F4A920]"
                                >
                                  <EyeIcon />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  className="rounded-full text-[#8B5A3C] hover:bg-[#F4A920]/15 hover:text-[#F4A920]"
                                >
                                  <Download className="size-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  className="rounded-full text-[#8B5A3C] hover:bg-emerald-50 hover:text-emerald-600"
                                >
                                  <CheckCircle2 className="size-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                    <OverviewCard title="Payment Summary">
                      <OverviewRow
                        label="Total Amount Paid"
                        value={formatCurrency(paymentSummary.total)}
                      />
                      <OverviewRow
                        label="Last Payment Date"
                        value={formatDate(paymentSummary.lastPaymentDate)}
                      />
                    </OverviewCard>
                    <OverviewCard title="Payment Methods Breakdown">
                      <ul className="space-y-2 text-sm text-[#5D4037]">
                        {paymentMethodBreakdown.length ? (
                          paymentMethodBreakdown.map((entry) => (
                            <li
                              key={entry.method}
                              className="flex items-center justify-between"
                            >
                              <span className="capitalize">
                                {entry.method.replace("_", " ")}
                              </span>
                              <span className="font-semibold">
                                {entry.value}%
                              </span>
                            </li>
                          ))
                        ) : (
                          <li>No payments yet</li>
                        )}
                      </ul>
                    </OverviewCard>
                  </div>
                </TabsContent>

                <TabsContent value="performance" className="space-y-6">
                  <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                    <div className="rounded-2xl border border-[#F4A920]/20 bg-white p-6 shadow-[0_12px_30px_rgba(93,64,55,0.1)]">
                      <div className="flex flex-wrap items-end justify-between gap-3">
                        <div>
                          <SectionTitle>Overall Rating</SectionTitle>
                          <p className="text-sm text-[#8B5A3C]/70">
                            Based on delivery, quality, and payment discipline
                          </p>
                        </div>
                        <div className="text-4xl font-semibold text-[#5D4037]">
                          {performance?.overall_rating.toFixed(1) ??
                            vendor.rating.toFixed(1)}
                        </div>
                      </div>
                      <div className="mt-4">
                        <Rating
                          value={performance?.overall_rating ?? vendor.rating}
                          size="lg"
                        />
                      </div>
                      <dl className="mt-6 grid gap-4 md:grid-cols-2">
                        <PerformanceBar
                          label="Quality Score"
                          value={performance?.quality_score ?? 80}
                          color="bg-emerald-500"
                        />
                        <PerformanceBar
                          label="Delivery Punctuality"
                          value={performance?.delivery_punctuality ?? 75}
                          color="bg-blue-500"
                        />
                        <PerformanceBar
                          label="Order Accuracy"
                          value={performance?.order_accuracy ?? 78}
                          color="bg-amber-500"
                        />
                        <PerformanceBar
                          label="Payment Reliability"
                          value={performance?.payment_reliability ?? 82}
                          color="bg-purple-500"
                        />
                      </dl>
                      <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                          Performance Level:{" "}
                          {performance?.performance_level ?? "good"}
                        </Badge>
                        <Badge className="border-[#F4A920]/40 bg-[#F4A920]/15 text-[#8B5A3C]">
                          Recommendation:{" "}
                          {performance?.recommendation ?? "continue"}
                        </Badge>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-[#F4A920]/20 bg-white p-6 shadow-[0_12px_30px_rgba(93,64,55,0.1)]">
                      <SectionTitle>3-Month Trend</SectionTitle>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={trendData}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#F4A92033"
                            />
                            <XAxis dataKey="month" stroke="#8B5A3C" />
                            <YAxis
                              domain={[0, 5]}
                              ticks={[2, 3, 4, 5]}
                              stroke="#8B5A3C"
                            />
                            <Tooltip
                              contentStyle={{
                                borderRadius: 12,
                                borderColor: "#F4A92033",
                                backgroundColor: "#FFFEF7",
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="rating"
                              stroke="#F4A920"
                              strokeWidth={3}
                              dot={{ r: 6, strokeWidth: 2, fill: "#FFFDF5" }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <p className="mt-3 text-sm text-[#8B5A3C]/70">
                        Trend is updated monthly based on aggregated feedback
                        and quality inspections.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#F4A920]/20 bg-white p-6 shadow-[0_12px_30px_rgba(93,64,55,0.1)]">
                    <SectionTitle>Recent Feedback & Notes</SectionTitle>
                    <ul className="mt-3 space-y-3 text-sm text-[#5D4037]">
                      <li className="rounded-xl bg-[#FFFEF7] p-3">
                        <p className="font-semibold">
                          Quality Audit ·{" "}
                          {formatDate(performance?.last_updated)}
                        </p>
                        <p className="mt-1 text-[#8B5A3C]/80">
                          Maintained consistent fat percentage in premium milk
                          deliveries. Recommended to continue current storage
                          practices.
                        </p>
                      </li>
                      <li className="rounded-xl bg-[#FFFEF7] p-3">
                        <p className="font-semibold">
                          Logistics Review ·{" "}
                          {formatDate(new Date().toISOString())}
                        </p>
                        <p className="mt-1 text-[#8B5A3C]/80">
                          Suggest adding weekend pickup slots to reduce Monday
                          backlog.
                        </p>
                      </li>
                    </ul>
                    <p className="mt-4 text-xs text-[#8B5A3C]/60">
                      Last updated on {formatDate(performance?.last_updated)}
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="border-none bg-white shadow-[0_18px_45px_rgba(93,64,55,0.12)]">
            <CardHeader>
              <CardTitle className="text-lg text-[#5D4037]">
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-[#5D4037]">
              <StatRow
                label="Credit Limit"
                value={formatCurrency(vendor.credit_limit)}
              />
              <StatRow
                label="Available Credit"
                value={formatCurrency(
                  vendor.credit_limit - vendor.outstanding_balance
                )}
              />
              <StatRow
                label="Days Since Last Order"
                value={`${daysSinceLastOrder}`}
              />
              <StatRow
                label="Average Payment Days"
                value={`${Math.round(vendor.credit_period_days * 0.8)} days`}
              />
            </CardContent>
          </Card>

          <Card className="border-none bg-white shadow-[0_18px_45px_rgba(93,64,55,0.12)]">
            <CardHeader>
              <CardTitle className="text-lg text-[#5D4037]">
                Payment Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-[#5D4037]">
              <StatRow
                label="Credit Period"
                value={`${vendor.credit_period_days} days`}
              />
              <StatRow
                label="Early Payment Discount"
                value={`${vendor.discount_percentage || 0}%`}
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#8B5A3C]/60">
                  Payment Methods
                </p>
                <ul className="mt-2 space-y-2">
                  {vendor.payment_methods.map((method) => (
                    <li key={method} className="flex items-center gap-2">
                      <BadgeCheck className="size-4 text-[#F4A920]" />
                      <span className="text-sm capitalize">
                        {method.replace("_", " ")}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-white shadow-[0_18px_45px_rgba(93,64,55,0.12)]">
            <CardHeader>
              <CardTitle className="text-lg text-[#5D4037]">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Button
                type="button"
                className="w-full rounded-full bg-gradient-to-r from-[#F4A920] to-[#8B5A3C] text-white shadow-[0_12px_24px_rgba(139,90,60,0.25)] hover:scale-[1.01]"
                onClick={() => router.push("/vendors/orders?prefill=true")}
              >
                <ShoppingCartIcon />
                Create Purchase Order
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-full border-[#F4A920]/40 text-[#8B5A3C] hover:border-[#F4A920] hover:bg-[#F4A920]/10"
                onClick={() => router.push("/vendors/payments?prefill=true")}
              >
                <Wallet className="mr-2 size-4" />
                Record Payment
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-full border-[#F4A920]/40 text-[#8B5A3C] hover:border-[#F4A920] hover:bg-[#F4A920]/10"
                onClick={() => router.push("/vendors/invoices/new")}
              >
                <FileText className="mr-2 size-4" />
                Generate Invoice
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-full border-[#F4A920]/40 text-[#8B5A3C] hover:border-[#F4A920] hover:bg-[#F4A920]/10"
                onClick={() => router.push("/vendors/orders")}
              >
                <Inbox className="mr-2 size-4" />
                View All Orders
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md border-[#F4A920]/30 bg-white/95 text-[#5D4037]">
          <DialogHeader>
            <DialogTitle>Delete Vendor</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#8B5A3C]/80">
            This will archive the vendor record and hide it from all active
            workflows. You can restore it from master data later.
          </p>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-[#F4A920]/40 text-[#8B5A3C] hover:border-[#F4A920] hover:bg-[#F4A920]/10"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white shadow-[0_12px_24px_rgba(220,38,38,0.35)] hover:from-red-500 hover:to-red-500"
              onClick={handleDeleteVendor}
            >
              Delete Vendor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={addressDialog.open}
        onOpenChange={(open) => setAddressDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="max-w-lg border-[#F4A920]/30 bg-white/95 text-[#5D4037]">
          <DialogHeader>
            <DialogTitle>Edit {addressDialog.key} address</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <Input
              placeholder="Street"
              value={addressDraft?.street ?? ""}
              onChange={(event) =>
                updateAddressDraft("street", event.target.value)
              }
            />
            <Input
              placeholder="City"
              value={addressDraft?.city ?? ""}
              onChange={(event) =>
                updateAddressDraft("city", event.target.value)
              }
            />
            <Input
              placeholder="State"
              value={addressDraft?.state ?? ""}
              onChange={(event) =>
                updateAddressDraft("state", event.target.value)
              }
            />
            <Input
              placeholder="Postal Code"
              value={addressDraft?.postal_code ?? ""}
              onChange={(event) =>
                updateAddressDraft("postal_code", event.target.value)
              }
            />
            <Input
              placeholder="Country"
              value={addressDraft?.country ?? "India"}
              onChange={(event) =>
                updateAddressDraft("country", event.target.value)
              }
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-[#F4A920]/40 text-[#8B5A3C] hover:border-[#F4A920] hover:bg-[#F4A920]/10"
              onClick={() =>
                setAddressDialog((prev) => ({ ...prev, open: false }))
              }
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-full bg-gradient-to-r from-[#F4A920] to-[#8B5A3C] text-white shadow-[0_12px_24px_rgba(139,90,60,0.25)] hover:scale-[1.01]"
              onClick={saveAddress}
            >
              Save Address
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bankDialogOpen} onOpenChange={setBankDialogOpen}>
        <DialogContent className="max-w-lg border-[#F4A920]/30 bg-white/95 text-[#5D4037]">
          <DialogHeader>
            <DialogTitle>Update banking details</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <Input
              placeholder="Bank Name"
              value={tempBankDraft?.bank_name ?? ""}
              onChange={(event) =>
                updateBankDraft("bank_name", event.target.value)
              }
            />
            <Input
              placeholder="Account Number"
              value={tempBankDraft?.account_number ?? ""}
              onChange={(event) =>
                updateBankDraft("account_number", event.target.value)
              }
            />
            <Input
              placeholder="IFSC Code"
              value={tempBankDraft?.ifsc_code ?? ""}
              onChange={(event) =>
                updateBankDraft("ifsc_code", event.target.value)
              }
            />
            <Input
              placeholder="Account Holder"
              value={tempBankDraft?.account_holder ?? ""}
              onChange={(event) =>
                updateBankDraft("account_holder", event.target.value)
              }
            />
            <select
              value={tempBankDraft?.account_type ?? "current"}
              onChange={(event) =>
                updateBankDraft(
                  "account_type",
                  event.target.value as "current" | "savings"
                )
              }
              className="h-11 rounded-xl border border-[#F4A920]/30 bg-white px-3 text-sm text-[#5D4037]"
            >
              <option value="current">Current Account</option>
              <option value="savings">Savings Account</option>
            </select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-[#F4A920]/40 text-[#8B5A3C] hover:border-[#F4A920] hover:bg-[#F4A320]/10"
              onClick={() => setBankDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-full bg-gradient-to-r from-[#F4A920] to-[#8B5A3C] text-white shadow-[0_12px_24px_rgba(139,90,60,0.25)] hover:scale-[1.01]"
              onClick={saveBankDetails}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.section>
  );
}

interface MetricCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  accent: string;
  description?: string;
}

function MetricCard({
  icon: Icon,
  title,
  value,
  accent,
  description,
}: MetricCardProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative overflow-hidden rounded-2xl border border-[#F4A920]/20 bg-white p-5 shadow-[0_18px_45px_rgba(93,64,55,0.1)]">
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-br opacity-15"
          style={{
            backgroundImage: `linear-gradient(135deg, ${brandColors.gold}, transparent)`,
          }}
        />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#8B5A3C]/60">
              {title}
            </p>
            <p className="mt-3 text-2xl font-semibold text-[#5D4037]">
              {value}
            </p>
            {description ? (
              <p className="mt-1 text-xs text-[#8B5A3C]/70">{description}</p>
            ) : null}
          </div>
          <span
            className={cn(
              "flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-[0_12px_24px_rgba(139,90,60,0.2)]",
              accent
            )}
          >
            <Icon className="size-6" />
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-sm font-semibold uppercase tracking-wide text-[#8B5A3C]/70">
      {children}
    </h3>
  );
}

function StatRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[#8B5A3C]/70">{label}</span>
      <span className="font-semibold text-[#5D4037]">{value}</span>
    </div>
  );
}

function InfoGrid({
  rows,
}: {
  rows: Array<{ label: string; value: ReactNode }>;
}) {
  return (
    <dl className="grid gap-3 text-sm text-[#5D4037]">
      {rows.map((row) => (
        <div key={row.label} className="grid grid-cols-[140px_1fr] gap-3">
          <dt className="text-[#8B5A3C]/70">{row.label}</dt>
          <dd className="font-semibold">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Rating({
  value,
  size = "md",
}: {
  value: number;
  size?: "sm" | "md" | "lg";
}) {
  const dimension =
    size === "lg" ? "size-6" : size === "sm" ? "size-4" : "size-5";
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const filled = index + 1 <= Math.round(value);
        return (
          <svg
            key={index}
            viewBox="0 0 24 24"
            className={cn(
              dimension,
              filled ? "text-[#F4A920]" : "text-slate-200 transition-colors"
            )}
            fill={filled ? "#F4A920" : "none"}
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        );
      })}
      <span className={cn("ml-1 text-sm font-semibold", ratingColor(value))}>
        {value.toFixed(1)}
      </span>
    </div>
  );
}

function ContactLink({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-2 text-[#1E88E5] hover:underline"
    >
      <Icon className="size-4" />
      <span>{value ?? "—"}</span>
    </a>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-[#F4A920]/40 bg-[#FFFEF7] text-sm text-[#8B5A3C]/70">
      {message}
    </div>
  );
}

function OverviewCard({
  title,
  children,
  footerAction,
  onFooterAction,
}: {
  title: string;
  children: ReactNode;
  footerAction?: string;
  onFooterAction?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-[#F4A920]/20 bg-white p-4 shadow-[0_12px_30px_rgba(93,64,55,0.1)]">
      <div className="flex items-center justify-between">
        <SectionTitle>{title}</SectionTitle>
        {footerAction ? (
          <button
            type="button"
            onClick={onFooterAction}
            className="text-xs font-semibold text-[#1E88E5] hover:underline"
          >
            {footerAction}
          </button>
        ) : null}
      </div>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}

function OverviewRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm text-[#5D4037]">
      <span className="text-[#8B5A3C]/70">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function MiniListItem({
  title,
  subtitle,
  meta,
}: {
  title: string;
  subtitle: string;
  meta: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-[#FFFEF7] px-3 py-2 text-sm text-[#5D4037]">
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-xs text-[#8B5A3C]/70">{subtitle}</p>
      </div>
      <span className="text-sm font-semibold text-[#5D4037]">{meta}</span>
    </div>
  );
}

function AddressCard({
  title,
  address,
  optional,
  onCopy,
  onEdit,
}: {
  title: string;
  address?: Address;
  optional?: boolean;
  onCopy: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="rounded-2xl border border-[#F4A920]/20 bg-white p-4 shadow-[0_12px_30px_rgba(93,64,55,0.1)]">
      <div className="flex items-center justify-between">
        <SectionTitle>
          {title}
          {optional ? " (Optional)" : ""}
        </SectionTitle>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            className="rounded-full text-[#8B5A3C] hover:bg-[#F4A920]/15 hover:text-[#F4A920]"
            onClick={onCopy}
          >
            <MapPin className="size-4" />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            className="rounded-full text-[#8B5A3C] hover:bg-[#F4A920]/15 hover:text-[#F4A920]"
            onClick={onEdit}
          >
            <Edit className="size-4" />
          </Button>
        </div>
      </div>
      {address ? (
        <address className="mt-3 space-y-1 text-sm not-italic text-[#5D4037]">
          <p>{address.street}</p>
          <p>
            {address.city}, {address.state} {address.postal_code}
          </p>
          <p>{address.country}</p>
        </address>
      ) : (
        <EmptyState message="No address provided" />
      )}
    </div>
  );
}

function PerformanceBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm text-[#5D4037]">
        <span className="text-[#8B5A3C]/70">{label}</span>
        <span className="font-semibold">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-[#F4A920]/20">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function FilterToolbar({ payments }: { payments: Payment[] }) {
  const [search, setSearch] = useState("");
  const [method, setMethod] = useState("all");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  return (
    <div className="rounded-2xl border border-[#F4A920]/20 bg-white p-4 shadow-[0_12px_30px_rgba(93,64,55,0.1)]">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by ID, vendor, reference"
          className="rounded-xl border-[#F4A920]/40"
        />
        <select
          value={method}
          onChange={(event) => setMethod(event.target.value)}
          className="h-11 rounded-xl border border-[#F4A920]/30 bg-white px-3 text-sm text-[#5D4037]"
        >
          <option value="all">Payment Method</option>
          <option value="cheque">Cheque</option>
          <option value="neft">NEFT</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="cash">Cash</option>
        </select>
        <select
          value={type}
          onChange={(event) => setType(event.target.value)}
          className="h-11 rounded-xl border border-[#F4A920]/30 bg-white px-3 text-sm text-[#5D4037]"
        >
          <option value="all">Payment Type</option>
          <option value="full">Full Payment</option>
          <option value="partial">Partial Payment</option>
          <option value="advance">Advance Payment</option>
        </select>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="h-11 rounded-xl border border-[#F4A920]/30 bg-white px-3 text-sm text-[#5D4037]"
        >
          <option value="all">Reconciliation Status</option>
          <option value="reconciled">Reconciled</option>
          <option value="pending">Pending</option>
        </select>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <Input
          type="date"
          value={from}
          onChange={(event) => setFrom(event.target.value)}
          className="rounded-xl border-[#F4A920]/40"
        />
        <Input
          type="date"
          value={to}
          onChange={(event) => setTo(event.target.value)}
          className="rounded-xl border-[#F4A920]/40"
        />
        <div className="flex gap-2">
          <Button
            type="button"
            className="flex-1 rounded-full bg-gradient-to-r from-[#F4A920] to-[#8B5A3C] text-white"
            onClick={() => toast.info("Filters applied (mock)")}
          >
            Apply Filters
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-full border-[#F4A920]/40 text-[#8B5A3C]"
            onClick={() => {
              setSearch("");
              setMethod("all");
              setType("all");
              setStatus("all");
              setFrom("");
              setTo("");
            }}
          >
            Reset
          </Button>
        </div>
      </div>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[#8B5A3C]/60">
        Showing {payments.length} payment records
      </p>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      stroke="currentColor"
      strokeWidth={1.5}
      fill="none"
    >
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ShoppingCartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="mr-2 size-4"
      stroke="currentColor"
      strokeWidth={1.5}
      fill="none"
    >
      <path d="M6 6h15l-1.68 8.39a2 2 0 0 1-2 .61L7 12" />
      <circle cx="9" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M6 6l-2 0" />
    </svg>
  );
}
