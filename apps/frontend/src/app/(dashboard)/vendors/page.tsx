"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpDown,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Droplet,
  Eye,
  Factory,
  FileText,
  Filter,
  Flame,
  Mail,
  Package,
  Pencil,
  Phone,
  Plus,
  RefreshCcw,
  Star,
  Store,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { mockPurchaseOrders, mockVendors } from "@/lib/api/mockData";
import type { Vendor, VendorStatus, VendorType } from "@/types/vendor";

const ITEMS_PER_PAGE = 10;

const brandPalette = {
  gold: "#F4A920",
  brown: "#8B5A3C",
  cream: "#FFFEF7",
  dark: "#5D4037",
};

const clone = <T,>(value: T): T => {
  if (typeof globalThis.structuredClone === "function") {
    return globalThis.structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
};

type PaymentHealth = "on_time" | "overdue" | "critical";

type SortDirection = "asc" | "desc";

type SortKey = "name" | "rating" | "outstanding" | "recent" | "paymentTerm";

interface SortState {
  key: SortKey;
  direction: SortDirection;
}

const sortPresets: Array<{
  label: string;
  value: string;
  key: SortKey;
  direction: SortDirection;
}> = [
  { label: "Name (A-Z)", value: "name-asc", key: "name", direction: "asc" },
  {
    label: "Rating (High-Low)",
    value: "rating-desc",
    key: "rating",
    direction: "desc",
  },
  {
    label: "Outstanding (High-Low)",
    value: "outstanding-desc",
    key: "outstanding",
    direction: "desc",
  },
  {
    label: "Recent",
    value: "recent-desc",
    key: "recent",
    direction: "desc",
  },
  {
    label: "Payment Term",
    value: "paymentTerm-asc",
    key: "paymentTerm",
    direction: "asc",
  },
];

const paymentStatusStyles: Record<
  PaymentHealth,
  { label: string; badgeClass: string; textClass: string }
> = {
  on_time: {
    label: "On-Time",
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
    textClass: "text-emerald-600",
  },
  overdue: {
    label: "Overdue",
    badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
    textClass: "text-amber-600",
  },
  critical: {
    label: "Critical",
    badgeClass: "border-red-200 bg-red-50 text-red-700",
    textClass: "text-red-600",
  },
};

const vendorStatusStyles: Record<VendorStatus, string> = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  inactive: "border-slate-200 bg-slate-50 text-slate-600",
  suspended: "border-amber-200 bg-amber-50 text-amber-700",
  blocked: "border-red-200 bg-red-50 text-red-700",
};

const vendorTypeMeta: Record<
  VendorType,
  {
    label: string;
    icon: ComponentType<{ className?: string }>;
    className: string;
  }
> = {
  milk_supplier: {
    label: "Milk Supplier",
    icon: Droplet,
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  equipment: {
    label: "Equipment",
    icon: Factory,
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  packaging: {
    label: "Packaging",
    icon: Package,
    className: "border-purple-200 bg-purple-50 text-purple-700",
  },
  chemical: {
    label: "Chemical",
    icon: Flame,
    className: "border-orange-200 bg-orange-50 text-orange-700",
  },
  other: {
    label: "Other",
    icon: Store,
    className: "border-slate-200 bg-slate-50 text-slate-600",
  },
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const formatCurrency = (amount: number) => currencyFormatter.format(amount);

const formatDate = (input?: string) => {
  if (!input) {
    return "—";
  }
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return dateFormatter.format(date);
};

const calculatePaymentStatus = (vendor: Vendor): PaymentHealth => {
  if (vendor.outstanding_balance <= 0) {
    return "on_time";
  }
  const ratio =
    vendor.credit_limit > 0
      ? vendor.outstanding_balance / vendor.credit_limit
      : 0;
  if (ratio >= 0.45) {
    return "critical";
  }
  if (ratio >= 0.25) {
    return "overdue";
  }
  return "on_time";
};

const getRatingColor = (rating: number) => {
  if (rating >= 4.5) {
    return "text-emerald-600";
  }
  if (rating >= 4) {
    return "text-blue-600";
  }
  if (rating >= 3) {
    return "text-amber-600";
  }
  return "text-red-600";
};

const SkeletonBlock = ({ className }: { className: string }) => (
  <div className={cn("animate-pulse rounded-lg bg-[#F4A920]/15", className)} />
);

export default function VendorsOverviewPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | VendorType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | VendorStatus>("all");
  const [paymentFilter, setPaymentFilter] = useState<"all" | PaymentHealth>(
    "all"
  );
  const [sortState, setSortState] = useState<SortState>({
    key: "recent",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [vendors, setVendors] = useState<Vendor[]>(() => clone(mockVendors));
  const [deleteCandidate, setDeleteCandidate] = useState<Vendor | null>(null);

  const recentOrderMap = useMemo(() => {
    const map = new Map<string, string>();
    mockPurchaseOrders.forEach((order) => {
      if (!order.vendor_id || !order.order_date) {
        return;
      }
      const current = map.get(order.vendor_id);
      if (
        !current ||
        new Date(order.order_date).getTime() > new Date(current).getTime()
      ) {
        map.set(order.vendor_id, order.order_date);
      }
    });
    return map;
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setIsLoading(false), 520);
    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, statusFilter, paymentFilter]);

  const filteredVendors = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return vendors.filter((vendor) => {
      const matchesTerm = term
        ? [
            vendor.company_name,
            vendor.email,
            vendor.phone,
            vendor.vendor_id,
            ...vendor.contact_persons.map(
              (person) => `${person.name} ${person.email} ${person.phone}`
            ),
          ]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(term))
        : true;
      const matchesType =
        typeFilter === "all" || vendor.vendor_type === typeFilter;
      const matchesStatus =
        statusFilter === "all" || vendor.status === statusFilter;
      const paymentStatus = calculatePaymentStatus(vendor);
      const matchesPayment =
        paymentFilter === "all" || paymentStatus === paymentFilter;
      return matchesTerm && matchesType && matchesStatus && matchesPayment;
    });
  }, [paymentFilter, searchTerm, statusFilter, typeFilter, vendors]);

  const sortedVendors = useMemo(() => {
    const result = [...filteredVendors];
    result.sort((a, b) => {
      switch (sortState.key) {
        case "name": {
          const comparison = a.company_name.localeCompare(b.company_name);
          return sortState.direction === "asc" ? comparison : -comparison;
        }
        case "rating": {
          return sortState.direction === "asc"
            ? a.rating - b.rating
            : b.rating - a.rating;
        }
        case "outstanding": {
          return sortState.direction === "asc"
            ? a.outstanding_balance - b.outstanding_balance
            : b.outstanding_balance - a.outstanding_balance;
        }
        case "paymentTerm": {
          return sortState.direction === "asc"
            ? a.credit_period_days - b.credit_period_days
            : b.credit_period_days - a.credit_period_days;
        }
        case "recent":
        default: {
          const aDate =
            recentOrderMap.get(a.id) ?? a.updated_at ?? a.created_at;
          const bDate =
            recentOrderMap.get(b.id) ?? b.updated_at ?? b.created_at;
          const diff = new Date(aDate).getTime() - new Date(bDate).getTime();
          return sortState.direction === "asc" ? diff : -diff;
        }
      }
    });
    return result;
  }, [filteredVendors, recentOrderMap, sortState]);

  const totalPages = Math.max(
    1,
    Math.ceil(sortedVendors.length / ITEMS_PER_PAGE)
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedVendors = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedVendors.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, sortedVendors]);

  const summary = useMemo(() => {
    const totalVendors = vendors.length;
    const activeVendors = vendors.filter(
      (vendor) => vendor.status === "active"
    ).length;
    const outstandingBalance = vendors.reduce(
      (total, vendor) => total + vendor.outstanding_balance,
      0
    );
    const averagePaymentDays =
      totalVendors > 0
        ? Math.round(
            vendors.reduce(
              (total, vendor) => total + vendor.credit_period_days,
              0
            ) / totalVendors
          )
        : 0;
    return {
      totalVendors,
      activeVendors,
      outstandingBalance,
      averagePaymentDays,
    };
  }, [vendors]);

  const handleSortChange = useCallback((value: string) => {
    const preset = sortPresets.find((option) => option.value === value);
    if (preset) {
      setSortState({ key: preset.key, direction: preset.direction });
    }
  }, []);

  const handleColumnSort = useCallback((key: SortKey) => {
    setSortState((prev) => {
      if (prev.key !== key) {
        const preset = sortPresets.find((option) => option.key === key);
        if (preset) {
          return { key, direction: preset.direction };
        }
        return { key, direction: "asc" };
      }
      return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
    });
  }, []);

  const handleReset = useCallback(() => {
    setSearchTerm("");
    setTypeFilter("all");
    setStatusFilter("all");
    setPaymentFilter("all");
    setSortState({ key: "recent", direction: "desc" });
    setCurrentPage(1);
  }, []);

  const handleExport = useCallback(() => {
    const headers = [
      "Vendor Name",
      "Vendor Type",
      "Status",
      "Contact Person",
      "Email",
      "Phone",
      "Outstanding Balance",
      "Rating",
      "Recent Order Date",
      "Payment Term (Days)",
    ];
    const rows = sortedVendors.map((vendor) => {
      const paymentStatus = calculatePaymentStatus(vendor);
      const contact = vendor.contact_persons[0];
      const recentOrder = recentOrderMap.get(vendor.id);
      return [
        vendor.company_name,
        vendorTypeMeta[vendor.vendor_type].label,
        vendor.status,
        contact ? contact.name : "",
        vendor.email,
        vendor.phone,
        formatCurrency(vendor.outstanding_balance),
        vendor.rating.toFixed(1),
        recentOrder ? formatDate(recentOrder) : "—",
        vendor.credit_period_days,
        paymentStatusStyles[paymentStatus].label,
      ]
        .map((value) => `${value}`.replaceAll('"', '""'))
        .map((value) => (value.includes(",") ? `"${value}"` : value))
        .join(",");
    });
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `vendor-export-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [recentOrderMap, sortedVendors]);

  const openDeleteDialog = useCallback((vendor: Vendor) => {
    setDeleteCandidate(vendor);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setDeleteCandidate(null);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteCandidate) {
      setVendors((previous) =>
        previous.filter((entry) => entry.id !== deleteCandidate.id)
      );
    }
    closeDeleteDialog();
  }, [closeDeleteDialog, deleteCandidate]);

  const currentSortValue = useMemo(() => {
    const preset = sortPresets.find(
      (option) =>
        option.key === sortState.key && option.direction === sortState.direction
    );
    return preset?.value ?? "recent-desc";
  }, [sortState.direction, sortState.key]);

  const renderSortIcon = useCallback(
    (key: SortKey) => (
      <ArrowUpDown
        className={cn(
          "size-4 transition-transform text-[#8B5A3C]/60",
          sortState.key === key &&
            sortState.direction === "desc" &&
            "rotate-180 text-[#F4A920]",
          sortState.key === key &&
            sortState.direction === "asc" &&
            "text-[#F4A920]"
        )}
      />
    ),
    [sortState.direction, sortState.key]
  );

  const renderStars = useCallback((rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, index) => {
          const filled = index + 1 <= Math.round(rating);
          return (
            <Star
              key={index}
              className={cn(
                "size-4 transition-colors",
                filled ? "text-[#F4A920]" : "text-slate-300"
              )}
              fill={filled ? "#F4A920" : "none"}
            />
          );
        })}
        <span
          className={cn("ml-2 text-sm font-medium", getRatingColor(rating))}
        >
          {rating.toFixed(1)}
        </span>
      </div>
    );
  }, []);

  const pageStart = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const pageEnd = Math.min(currentPage * ITEMS_PER_PAGE, sortedVendors.length);

  const hasResults = paginatedVendors.length > 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="space-y-8 text-[color:#5D4037]"
    >
      <div className="space-y-4">
        <nav aria-label="Breadcrumb" className="text-sm text-[#8B5A3C]/80">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link
                href="/dashboard"
                className="transition-colors hover:text-[#F4A920]"
              >
                Dashboard
              </Link>
            </li>
            <li className="text-[#8B5A3C]/40">/</li>
            <li className="font-semibold text-[#8B5A3C]">Vendors</li>
          </ol>
        </nav>
        <motion.div
          className="flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-[#FFF3D9] via-[#FFF9EC] to-[#FFFEF7] p-6 shadow-[0_20px_45px_rgba(244,169,32,0.25)] sm:flex-row sm:items-center sm:justify-between"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
        >
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-[#8B5A3C]">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-white/70 shadow-inner">
                <Building2 className="size-6 text-[#F4A920]" />
              </span>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-[#5D4037]">
                  Vendor Management
                </h1>
                <p className="text-sm text-[#8B5A3C]/80">
                  Manage all suppliers and vendors
                </p>
              </div>
            </div>
          </div>
          <Button
            asChild
            className="group relative h-11 rounded-full border-0 bg-gradient-to-r from-[#F4A920] via-[#F4A920] to-[#8B5A3C] px-6 text-base font-semibold text-white shadow-[0_12px_24px_rgba(139,90,60,0.25)] transition-transform duration-200 hover:scale-[1.02] hover:shadow-[0_16px_32px_rgba(139,90,60,0.3)] focus-visible:ring-[#F4A920]/50"
          >
            <Link href="/vendors/new">
              <span className="flex items-center gap-2">
                <Plus className="size-5" />
                Add New Vendor
              </span>
            </Link>
          </Button>
        </motion.div>
      </div>

      <Card className="border-none bg-[#FFFEF7] shadow-[0_20px_40px_rgba(93,64,55,0.08)]">
        <CardHeader className="gap-4 lg:flex lg:items-center lg:justify-between">
          <CardTitle className="text-base font-semibold text-[#5D4037]">
            Search & Filters
          </CardTitle>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={handleReset}
              title="Reset all filters"
              className="relative overflow-hidden rounded-full border border-[#F4A920]/30 bg-white/70 text-sm font-medium text-[#8B5A3C] transition-all duration-300 before:absolute before:inset-0 before:origin-center before:scale-0 before:rounded-full before:bg-[#F4A920]/15 before:opacity-0 before:transition before:duration-500 hover:scale-[1.01] hover:text-[#5D4037] hover:shadow-[0_12px_24px_rgba(244,169,32,0.18)] hover:before:scale-125 hover:before:opacity-100"
            >
              <RefreshCcw className="size-4" />
              Reset Filters
            </Button>
            <Button
              type="button"
              onClick={handleExport}
              title="Export visible vendors"
              className="relative overflow-hidden rounded-full border border-[#F4A920] bg-white/80 text-sm font-semibold text-[#8B5A3C] transition-all duration-300 before:absolute before:inset-0 before:origin-center before:scale-0 before:rounded-full before:bg-[#F4A920]/15 before:opacity-0 before:transition before:duration-500 hover:scale-[1.01] hover:text-[#5D4037] hover:shadow-[0_16px_30px_rgba(244,169,32,0.22)] hover:before:scale-125 hover:before:opacity-100"
            >
              <Download className="size-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div className="relative">
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by vendor, company, contact..."
                aria-label="Search vendors"
                className="h-11 rounded-xl border border-[#F4A920]/40 bg-white/80 pl-12 text-sm text-[#5D4037] shadow-sm placeholder:text-[#8B5A3C]/50 focus-visible:border-[#F4A920] focus-visible:ring-[#F4A920]/30"
              />
              <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#F4A920]" />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="hidden items-center gap-2 rounded-full bg-white/60 px-4 py-2 text-sm font-medium text-[#8B5A3C] shadow-sm lg:flex">
                <Filter className="size-4 text-[#F4A920]" />
                Refine results
              </div>
              <Select value={currentSortValue} onValueChange={handleSortChange}>
                <SelectTrigger className="h-11 min-w-[220px] rounded-xl border border-[#F4A920]/40 bg-white/80 text-sm font-medium text-[#5D4037] shadow-sm">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-[#F4A920]/30 bg-white/95 text-[#5D4037] shadow-lg">
                  {sortPresets.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Select
              value={typeFilter}
              onValueChange={(value) =>
                setTypeFilter(value as VendorType | "all")
              }
            >
              <SelectTrigger className="h-11 rounded-xl border border-[#F4A920]/30 bg-white/80 text-sm text-[#5D4037] shadow-sm">
                <SelectValue placeholder="Vendor Type" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border border-[#F4A920]/30 bg-white/95 text-[#5D4037] shadow-lg">
                <SelectItem value="all">All Vendor Types</SelectItem>
                <SelectItem value="milk_supplier">Milk Supplier</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
                <SelectItem value="packaging">Packaging</SelectItem>
                <SelectItem value="chemical">Chemical</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as VendorStatus | "all")
              }
            >
              <SelectTrigger className="h-11 rounded-xl border border-[#F4A920]/30 bg-white/80 text-sm text-[#5D4037] shadow-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border border-[#F4A920]/30 bg-white/95 text-[#5D4037] shadow-lg">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={paymentFilter}
              onValueChange={(value) =>
                setPaymentFilter(value as PaymentHealth | "all")
              }
            >
              <SelectTrigger className="h-11 rounded-xl border border-[#F4A920]/30 bg-white/80 text-sm text-[#5D4037] shadow-sm">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border border-[#F4A920]/30 bg-white/95 text-[#5D4037] shadow-lg">
                <SelectItem value="all">All Payment Status</SelectItem>
                <SelectItem value="on_time">On-Time</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-32" />
            ))}
          </div>
          <SkeletonBlock className="h-96" />
        </div>
      ) : (
        <>
          <motion.div
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.08 },
              },
            }}
          >
            <SummaryCard
              title="Total Vendors"
              value={summary.totalVendors.toString()}
              icon={Building2}
              accentClass="from-[#F4A920] to-[#F4A920]"
            >
              <Badge className="border-[#F4A920]/30 bg-white/70 text-[#8B5A3C]">
                Active {summary.activeVendors}
              </Badge>
            </SummaryCard>
            <SummaryCard
              title="Active Vendors"
              value={summary.activeVendors.toString()}
              icon={CheckCircle2}
              accentClass="from-[#6EE7B7] to-[#34D399]"
            >
              <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                Up to date
              </Badge>
            </SummaryCard>
            <SummaryCard
              title="Outstanding Balance"
              value={formatCurrency(summary.outstandingBalance)}
              icon={FileText}
              accentClass="from-[#F97316] to-[#F4A920]"
            >
              <Badge className="border-[#F4A920]/40 bg-[#F4A920]/15 text-[#8B5A3C]">
                Watchlist
              </Badge>
            </SummaryCard>
            <SummaryCard
              title="Average Payment Days"
              value={`${summary.averagePaymentDays}`}
              icon={ClockIcon}
              accentClass="from-[#60A5FA] to-[#2563EB]"
            >
              <Badge className="border-blue-200 bg-blue-50 text-blue-700">
                Target &lt; 30 days
              </Badge>
            </SummaryCard>
          </motion.div>

          <Card className="border-none bg-white shadow-[0_24px_60px_rgba(93,64,55,0.12)]">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-lg font-semibold text-[#5D4037]">
                Vendors
              </CardTitle>
              <div className="text-sm text-[#8B5A3C]/70">
                Showing {hasResults ? `${pageStart} - ${pageEnd}` : 0} of{" "}
                {sortedVendors.length}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="hidden md:block">
                <Table className="text-[#5D4037]">
                  <TableHeader>
                    <TableRow className="bg-[#FFFEF7] text-xs font-semibold uppercase tracking-wide text-[#8B5A3C]">
                      <TableHead>
                        <button
                          type="button"
                          onClick={() => handleColumnSort("name")}
                          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#8B5A3C] transition-colors hover:text-[#F4A920]"
                        >
                          Vendor Name
                          {renderSortIcon("name")}
                        </button>
                      </TableHead>
                      <TableHead>Vendor Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Contact Person</TableHead>
                      <TableHead>
                        <button
                          type="button"
                          onClick={() => handleColumnSort("outstanding")}
                          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#8B5A3C] transition-colors hover:text-[#F4A920]"
                        >
                          Outstanding Balance
                          {renderSortIcon("outstanding")}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          type="button"
                          onClick={() => handleColumnSort("rating")}
                          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#8B5A3C] transition-colors hover:text-[#F4A920]"
                        >
                          Rating
                          {renderSortIcon("rating")}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          type="button"
                          onClick={() => handleColumnSort("recent")}
                          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#8B5A3C] transition-colors hover:text-[#F4A920]"
                        >
                          Recent Order Date
                          {renderSortIcon("recent")}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          type="button"
                          onClick={() => handleColumnSort("paymentTerm")}
                          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#8B5A3C] transition-colors hover:text-[#F4A920]"
                        >
                          Payment Term (days)
                          {renderSortIcon("paymentTerm")}
                        </button>
                      </TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence initial={false}>
                      {hasResults ? (
                        paginatedVendors.map((vendor, index) => {
                          const contact = vendor.contact_persons[0];
                          const paymentStatus = calculatePaymentStatus(vendor);
                          const recentOrder = recentOrderMap.get(vendor.id);
                          const TypeIcon =
                            vendorTypeMeta[vendor.vendor_type].icon;
                          return (
                            <motion.tr
                              key={vendor.id}
                              layout
                              initial={{ opacity: 0, y: 24 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -24 }}
                              transition={{
                                duration: 0.35,
                                delay: index * 0.04,
                                ease: "easeOut",
                              }}
                              className="group border-b border-[#F4A920]/20 bg-white text-sm transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_18px_45px_rgba(139,90,60,0.16)]"
                            >
                              <TableCell className="font-semibold text-[#5D4037]">
                                <Link
                                  href={`/vendors/${vendor.id}`}
                                  className="flex items-center gap-3 text-[#8B5A3C] transition-colors hover:text-[#F4A920]"
                                >
                                  <span className="flex size-10 items-center justify-center rounded-2xl bg-[#FFFEF7] text-sm font-semibold text-[#F4A920] shadow-inner">
                                    {vendor.company_name.charAt(0)}
                                  </span>
                                  <span className="flex flex-col">
                                    {vendor.company_name}
                                    <span className="text-xs font-normal text-[#8B5A3C]/70">
                                      {vendor.vendor_id}
                                    </span>
                                  </span>
                                </Link>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={cn(
                                    "flex items-center gap-2 px-3 py-1 text-[13px]",
                                    vendorTypeMeta[vendor.vendor_type].className
                                  )}
                                >
                                  <TypeIcon className="size-4" />
                                  {vendorTypeMeta[vendor.vendor_type].label}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={cn(
                                    "px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                                    vendorStatusStyles[vendor.status]
                                  )}
                                >
                                  {vendor.status.toUpperCase()}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1 text-sm text-[#5D4037]">
                                  <div className="font-medium">
                                    {contact?.name ?? "—"}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-[#8B5A3C]/80">
                                    {contact?.phone ? (
                                      <span className="flex items-center gap-1">
                                        <Phone className="size-3.5" />
                                        {contact.phone}
                                      </span>
                                    ) : null}
                                    {contact?.email ? (
                                      <span className="flex items-center gap-1">
                                        <Mail className="size-3.5" />
                                        {contact.email}
                                      </span>
                                    ) : null}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col items-start gap-1">
                                  <span
                                    className={cn(
                                      "text-sm font-semibold",
                                      paymentStatusStyles[paymentStatus]
                                        .textClass,
                                      paymentStatus === "critical" &&
                                        "animate-pulse"
                                    )}
                                  >
                                    {formatCurrency(vendor.outstanding_balance)}
                                  </span>
                                  <Badge
                                    className={cn(
                                      "px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                                      paymentStatusStyles[paymentStatus]
                                        .badgeClass,
                                      paymentStatus === "critical" &&
                                        "animate-pulse"
                                    )}
                                  >
                                    {paymentStatusStyles[paymentStatus].label}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                {renderStars(vendor.rating)}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  <span className="text-sm font-medium text-[#5D4037]">
                                    {formatDate(recentOrder)}
                                  </span>
                                  <span className="text-xs text-[#8B5A3C]/60">
                                    {recentOrder
                                      ? "Latest PO"
                                      : "No orders yet"}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1 text-sm text-[#5D4037]">
                                  <span className="font-semibold">
                                    {vendor.credit_period_days} days
                                  </span>
                                  <span className="text-xs text-[#8B5A3C]/60">
                                    Payment term
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-center gap-2">
                                  <Button
                                    type="button"
                                    size="icon-sm"
                                    variant="ghost"
                                    title="View vendor"
                                    className="rounded-full text-[#8B5A3C] transition hover:bg-[#F4A920]/15 hover:text-[#F4A920]"
                                    onClick={() =>
                                      router.push(`/vendors/${vendor.id}`)
                                    }
                                  >
                                    <Eye className="size-4" />
                                  </Button>
                                  <Button
                                    type="button"
                                    size="icon-sm"
                                    variant="ghost"
                                    title="Edit vendor"
                                    className="rounded-full text-[#8B5A3C] transition hover:bg-[#F4A920]/15 hover:text-[#F4A920]"
                                    onClick={() =>
                                      router.push(`/vendors/${vendor.id}/edit`)
                                    }
                                  >
                                    <Pencil className="size-4" />
                                  </Button>
                                  <Button
                                    type="button"
                                    size="icon-sm"
                                    variant="ghost"
                                    title="Delete vendor"
                                    className="rounded-full text-[#8B5A3C] transition hover:bg-red-50 hover:text-red-600"
                                    onClick={() => openDeleteDialog(vendor)}
                                  >
                                    <Trash2 className="size-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </motion.tr>
                          );
                        })
                      ) : (
                        <motion.tr
                          key="empty"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="bg-[#FFFEF7]"
                        >
                          <TableCell
                            colSpan={9}
                            className="py-16 text-center text-[#8B5A3C]"
                          >
                            <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4">
                              <div className="flex size-16 items-center justify-center rounded-full bg-white/80 shadow-inner">
                                <Filter className="size-8 text-[#F4A920]" />
                              </div>
                              <div className="space-y-1">
                                <p className="text-lg font-semibold text-[#5D4037]">
                                  No vendors found
                                </p>
                                <p className="text-sm text-[#8B5A3C]/70">
                                  Adjust filters or search criteria to find the
                                  vendors you need.
                                </p>
                              </div>
                            </div>
                          </TableCell>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-4 md:hidden">
                <AnimatePresence initial={false}>
                  {hasResults ? (
                    paginatedVendors.map((vendor) => {
                      const contact = vendor.contact_persons[0];
                      const paymentStatus = calculatePaymentStatus(vendor);
                      const recentOrder = recentOrderMap.get(vendor.id);
                      const TypeIcon = vendorTypeMeta[vendor.vendor_type].icon;
                      return (
                        <motion.div
                          key={vendor.id}
                          initial={{ opacity: 0, y: 24 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -24 }}
                          transition={{ duration: 0.35, ease: "easeOut" }}
                          className="rounded-2xl border border-[#F4A920]/20 bg-white/90 p-4 shadow-[0_12px_30px_rgba(93,64,55,0.16)]"
                        >
                          <div className="flex items-start gap-3">
                            <span className="flex size-12 items-center justify-center rounded-2xl bg-[#FFFEF7] text-lg font-semibold text-[#F4A920] shadow-inner">
                              {vendor.company_name.charAt(0)}
                            </span>
                            <div className="flex-1 space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <Link
                                  href={`/vendors/${vendor.id}`}
                                  className="text-base font-semibold text-[#5D4037] transition-colors hover:text-[#F4A920]"
                                >
                                  {vendor.company_name}
                                </Link>
                                <Badge
                                  className={cn(
                                    "text-xs",
                                    vendorStatusStyles[vendor.status]
                                  )}
                                >
                                  {vendor.status.toUpperCase()}
                                </Badge>
                              </div>
                              <Badge
                                className={cn(
                                  "w-fit gap-2 text-xs",
                                  vendorTypeMeta[vendor.vendor_type].className
                                )}
                              >
                                <TypeIcon className="size-4" />
                                {vendorTypeMeta[vendor.vendor_type].label}
                              </Badge>
                              <div className="space-y-1 text-sm text-[#8B5A3C]/80">
                                <div className="flex flex-wrap items-center gap-2">
                                  <Phone className="size-4 text-[#F4A920]" />
                                  {contact?.phone ?? vendor.phone ?? "—"}
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <Mail className="size-4 text-[#F4A920]" />
                                  {contact?.email ?? vendor.email ?? "—"}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 space-y-2 rounded-xl bg-[#FFFEF7] p-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-[#8B5A3C]/70">
                                Outstanding
                              </span>
                              <span
                                className={cn(
                                  "font-semibold",
                                  paymentStatusStyles[paymentStatus].textClass
                                )}
                              >
                                {formatCurrency(vendor.outstanding_balance)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-[#8B5A3C]/70">
                                Recent Order
                              </span>
                              <span className="font-medium text-[#5D4037]">
                                {formatDate(recentOrder)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-[#8B5A3C]/70">
                                Payment Term
                              </span>
                              <span className="font-medium text-[#5D4037]">
                                {vendor.credit_period_days} days
                              </span>
                            </div>
                            <div>{renderStars(vendor.rating)}</div>
                          </div>
                          <div className="mt-4 flex items-center justify-end gap-2">
                            <Button
                              type="button"
                              size="icon-sm"
                              variant="ghost"
                              title="View vendor"
                              className="rounded-full text-[#8B5A3C] hover:bg-[#F4A920]/15 hover:text-[#F4A920]"
                              onClick={() =>
                                router.push(`/vendors/${vendor.id}`)
                              }
                            >
                              <Eye className="size-4" />
                            </Button>
                            <Button
                              type="button"
                              size="icon-sm"
                              variant="ghost"
                              title="Edit vendor"
                              className="rounded-full text-[#8B5A3C] hover:bg-[#F4A920]/15 hover:text-[#F4A920]"
                              onClick={() =>
                                router.push(`/vendors/${vendor.id}/edit`)
                              }
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              type="button"
                              size="icon-sm"
                              variant="ghost"
                              title="Delete vendor"
                              className="rounded-full text-[#8B5A3C] hover:bg-red-50 hover:text-red-600"
                              onClick={() => openDeleteDialog(vendor)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <motion.div
                      key="empty-mobile"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="rounded-2xl border border-dashed border-[#F4A920]/40 bg-[#FFFEF7] p-10 text-center text-sm text-[#8B5A3C]"
                    >
                      No vendors match your current filters.
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-[#8B5A3C]/60">
                  {hasResults
                    ? `Displaying ${pageStart}–${pageEnd} of ${sortedVendors.length} vendors`
                    : "No vendors to display"}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full border-[#F4A920]/30 text-[#8B5A3C] hover:border-[#F4A920] hover:bg-[#F4A920]/10"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                  >
                    <ChevronLeft className="size-4" />
                    Prev
                  </Button>
                  {Array.from({ length: totalPages }).map((_, index) => {
                    const pageNumber = index + 1;
                    const isActive = pageNumber === currentPage;
                    return (
                      <button
                        key={pageNumber}
                        type="button"
                        onClick={() => setCurrentPage(pageNumber)}
                        className={cn(
                          "flex size-9 items-center justify-center rounded-full border transition-all",
                          isActive
                            ? "border-transparent bg-gradient-to-r from-[#F4A920] to-[#8B5A3C] text-white shadow-[0_10px_24px_rgba(139,90,60,0.25)]"
                            : "border-[#F4A920]/30 bg-white text-[#8B5A3C] hover:border-[#F4A920]/60 hover:bg-[#F4A920]/10"
                        )}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full border-[#F4A920]/30 text-[#8B5A3C] hover:border-[#F4A920] hover:bg-[#F4A920]/10"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
                  >
                    Next
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
      <Dialog
        open={Boolean(deleteCandidate)}
        onOpenChange={(open) => (open ? undefined : closeDeleteDialog())}
      >
        <DialogContent className="max-w-md border-[#F4A920]/30 bg-white/95 text-[#5D4037]">
          <DialogHeader>
            <DialogTitle>Delete vendor</DialogTitle>
            <DialogDescription>
              This action will mark the vendor as deleted and remove them from
              the list. You can re-import them later if needed.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl bg-[#FFFEF7] p-4 text-sm text-[#8B5A3C]">
            {deleteCandidate?.company_name}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-[#F4A920]/30 text-[#8B5A3C] hover:border-[#F4A920] hover:bg-[#F4A920]/10"
              onClick={closeDeleteDialog}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white shadow-[0_12px_30px_rgba(220,38,38,0.35)] hover:from-red-500 hover:to-red-500"
              onClick={confirmDelete}
            >
              Delete Vendor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.section>
  );
}

interface SummaryCardProps {
  title: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  accentClass: string;
  children?: ReactNode;
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  accentClass,
  children,
}: SummaryCardProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="relative overflow-hidden rounded-2xl border border-[#F4A920]/20 bg-white p-6 shadow-[0_20px_45px_rgba(93,64,55,0.1)]">
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-br opacity-20"
          style={{
            backgroundImage: `linear-gradient(135deg, ${brandPalette.gold}, transparent)`,
          }}
        />
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium uppercase tracking-wide text-[#8B5A3C]/70">
              {title}
            </span>
            <span className="text-3xl font-semibold text-[#5D4037]">
              {value}
            </span>
          </div>
          <span
            className={cn(
              "flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-[0_12px_30px_rgba(139,90,60,0.22)]",
              accentClass
            )}
          >
            <Icon className="size-6" />
          </span>
        </div>
        <div className="mt-6 text-xs text-[#8B5A3C]/70">{children}</div>
      </div>
    </motion.div>
  );
}

function SearchIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M21 21l-4.35-4.35m1.35-4.65a6 6 0 11-12 0 6 6 0 0112 0z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClockIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M12 6v6l4 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
