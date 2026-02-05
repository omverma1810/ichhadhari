"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Droplet,
  Mail,
  MapPin,
  Phone,
  IndianRupee,
  Users,
} from "lucide-react";

import { StatsCard } from "@/components/cards/StatsCard";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  useSupplier,
  useSupplierCollections,
  useSupplierStats,
} from "@/hooks/api/milk-management/suppliers";
import { usePayments } from "@/hooks/api/useMilkManagement";
import {
  formatCurrency,
  formatDate,
  formatNumber,
} from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import type {
  Supplier,
  SupplierStats,
  SupplierStatus,
  SupplierCollectionSummary,
  Payment,
} from "@/types/api";

const statsRanges = [7, 30, 60, 90];

export default function SupplierDetailsPage() {
  const params = useParams<{ supplierId: string }>();
  const router = useRouter();
  const supplierId = Number(params?.supplierId);
  const isValidId = Number.isFinite(supplierId) && supplierId > 0;
  const [statsRange, setStatsRange] = useState(30);

  const {
    data: supplier,
    isLoading: supplierLoading,
    error: supplierError,
    refetch: refetchSupplier,
  } = useSupplier(supplierId, isValidId);

  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useSupplierStats(supplierId, statsRange, isValidId);

  const {
    data: collections,
    isLoading: collectionsLoading,
    refetch: refetchCollections,
  } = useSupplierCollections(supplierId, { limit: 10 }, isValidId);

  const {
    data: payments,
    isLoading: paymentsLoading,
    refetch: refetchPayments,
  } = usePayments({
    supplier: isValidId ? supplierId : undefined,
    page_size: 5,
  });

  if (!isValidId) {
    return <NotFoundState />;
  }

  if (supplierLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner withText text="Loading supplier details..." />
      </div>
    );
  }

  if (supplierError) {
    return (
      <div className="p-6">
        <ErrorMessage
          message="Failed to load supplier details"
          onRetry={() => {
            refetchSupplier();
            refetchStats();
            refetchCollections();
            refetchPayments();
          }}
        />
      </div>
    );
  }

  if (!supplier) {
    return <NotFoundState />;
  }

  const parsedStats = stats ? mapStats(stats) : null;
  const recentCollections = collections ?? [];
  const recentPayments = payments?.results ?? [];

  return (
    <div className="space-y-6 p-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/milk-management/suppliers")}
            className="h-10 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">
                {supplier.name}
              </h1>
              <Badge className={cn("capitalize", statusBadge(supplier.status))}>
                {supplier.status}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Supplier ID {supplier.supplier_id} · Route {supplier.route_name}
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
              <InfoItem icon={Phone} label="Phone" value={supplier.phone} />
              {supplier.alternate_phone ? (
                <InfoItem
                  icon={Phone}
                  label="Alt Phone"
                  value={supplier.alternate_phone}
                />
              ) : null}
              {supplier.email ? (
                <InfoItem icon={Mail} label="Email" value={supplier.email} />
              ) : null}
              <InfoItem
                icon={Clock}
                label="Collection"
                value={formatTimeString(supplier.collection_time)}
              />
            </div>
          </div>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>
                Aggregated metrics for the selected period
              </CardDescription>
            </div>
            <Select
              value={String(statsRange)}
              onValueChange={(value) => setStatsRange(Number(value))}
            >
              <SelectTrigger className="h-9 w-[140px]">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                {statsRanges.map((range) => (
                  <SelectItem key={range} value={String(range)}>
                    Last {range} days
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex h-48 items-center justify-center">
                <LoadingSpinner withText text="Loading stats..." />
              </div>
            ) : parsedStats ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatsCard
                  title="Total Quantity"
                  value={parsedStats.totalQuantity}
                  valueSuffix="L"
                  icon={Users}
                  color="blue"
                />
                <StatsCard
                  title="Average Fat"
                  value={parsedStats.avgFat}
                  valueSuffix="%"
                  icon={Droplet}
                  color="orange"
                />
                <StatsCard
                  title="Average SNF"
                  value={parsedStats.avgSnf}
                  valueSuffix="%"
                  icon={Droplet}
                  color="purple"
                />
                <StatsCard
                  title="Total Amount"
                  value={parsedStats.totalAmount}
                  valuePrefix="₹"
                  icon={IndianRupee}
                  color="green"
                />
              </div>
            ) : (
              <EmptyPanel message="No statistics available for this period" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supplier Profile</CardTitle>
            <CardDescription>
              Core contact and payment preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-600">
            <ProfileRow label="Supplier Type" value={supplier.supplier_type} />
            <ProfileRow label="Payment Cycle" value={supplier.payment_cycle} />
            <ProfileRow
              label="Outstanding Balance"
              value={formatCurrency(toNumber(supplier.outstanding_balance))}
              highlight={toNumber(supplier.outstanding_balance) > 0}
            />
            <ProfileRow
              label="Total Milk Supplied"
              value={`${formatNumber(
                toNumber(supplier.total_milk_supplied),
              )} L`}
            />
            {supplier.bank_name ? (
              <ProfileRow
                label="Bank"
                value={`${supplier.bank_name} · ${maskAccount(
                  supplier.account_number,
                )}`}
              />
            ) : null}
            <ProfileRow label="Address" value={supplier.address} multiline />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Collections</CardTitle>
                <CardDescription>Latest 10 collection entries</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetchCollections()}
              >
                <Clock className="mr-2 h-4 w-4" /> Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {collectionsLoading ? (
              <div className="flex h-40 items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : recentCollections.length === 0 ? (
              <EmptyPanel message="No collections recorded for this supplier" />
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Collection ID</TableHead>
                        <TableHead>Quantity (L)</TableHead>
                        <TableHead>Quality Score</TableHead>
                        <TableHead>Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentCollections.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>
                            {formatDate(entry.collection_date)}
                          </TableCell>
                          <TableCell>
                            {formatTimeString(entry.collection_time)}
                          </TableCell>
                          <TableCell className="font-mono text-xs font-semibold text-dairy-blue">
                            {entry.collection_id}
                          </TableCell>
                          <TableCell>
                            {formatNumber(toNumber(entry.quantity))}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="gap-1">
                              <Droplet className="h-3 w-3 text-dairy-orange" />
                              {toNumber(entry.quality_score).toFixed(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {formatCurrency(toNumber(entry.total_amount))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-4">
                  {recentCollections.map((entry) => (
                    <Card key={entry.id}>
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {formatDate(entry.collection_date)}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {formatTimeString(entry.collection_time)}
                            </span>
                          </div>
                          <div className="text-xs font-mono font-semibold text-dairy-blue">
                            {entry.collection_id}
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">
                                Quantity
                              </span>
                              <p className="font-medium">
                                {formatNumber(toNumber(entry.quantity))} L
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Quality
                              </span>
                              <p>
                                <Badge
                                  variant="outline"
                                  className="gap-1 text-xs"
                                >
                                  <Droplet className="h-3 w-3 text-dairy-orange" />
                                  {toNumber(entry.quality_score).toFixed(1)}
                                </Badge>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t">
                            <span className="text-sm text-muted-foreground">
                              Total Amount
                            </span>
                            <span className="text-lg font-semibold">
                              {formatCurrency(toNumber(entry.total_amount))}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Payments</CardTitle>
                <CardDescription>
                  Latest payouts processed for this supplier
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetchPayments()}
              >
                <Clock className="mr-2 h-4 w-4" /> Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {paymentsLoading ? (
              <div className="flex h-40 items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : recentPayments.length === 0 ? (
              <EmptyPanel message="No payments recorded for this supplier" />
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            {formatDate(payment.payment_date)}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-gray-600">
                            {payment.payment_id}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(payment.amount)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={cn(
                                "capitalize",
                                paymentBadge(payment.status),
                              )}
                            >
                              {payment.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-4">
                  {recentPayments.map((payment) => (
                    <Card key={payment.id}>
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {formatDate(payment.payment_date)}
                            </span>
                            <Badge
                              className={cn(
                                "capitalize text-xs",
                                paymentBadge(payment.status),
                              )}
                            >
                              {payment.status}
                            </Badge>
                          </div>
                          <div className="text-xs font-mono text-gray-600">
                            {payment.payment_id}
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t">
                            <span className="text-sm text-muted-foreground">
                              Amount
                            </span>
                            <span className="text-lg font-semibold">
                              {formatCurrency(payment.amount)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function mapStats(stats: SupplierStats) {
  return {
    totalQuantity: toNumber(stats.total_quantity),
    avgFat: toNumber(stats.avg_fat),
    avgSnf: toNumber(stats.avg_snf),
    avgQuality: toNumber(stats.avg_quality_score),
    totalAmount: toNumber(stats.total_amount),
    collectionCount: stats.collection_count,
    period: {
      start: stats.start_date,
      end: stats.end_date,
      days: stats.days,
    },
  };
}

const statusStyles: Record<SupplierStatus, string> = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  inactive: "border-slate-200 bg-slate-50 text-slate-600",
  suspended: "border-amber-200 bg-amber-50 text-amber-700",
};

function statusBadge(status: SupplierStatus) {
  return statusStyles[status] ?? statusStyles.active;
}

function paymentBadge(status: Payment["status"]) {
  return {
    completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
    pending: "border-amber-200 bg-amber-50 text-amber-700",
    failed: "border-red-200 bg-red-50 text-red-700",
    cancelled: "border-slate-200 bg-slate-50 text-slate-600",
  }[status];
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <span className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-dairy-blue" />
      <span className="font-medium text-gray-700">{label}:</span>
      <span>{value}</span>
    </span>
  );
}

function ProfileRow({
  label,
  value,
  highlight,
  multiline = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  multiline?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-sm text-gray-700",
          highlight && "font-semibold text-red-600",
          multiline && "whitespace-pre-line",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-500">
      {message}
    </div>
  );
}

function NotFoundState() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <Users className="h-12 w-12 text-gray-300" />
      <h2 className="text-xl font-semibold text-gray-800">
        Supplier not found
      </h2>
      <p className="max-w-md text-sm text-gray-500">
        The supplier you are looking for does not exist or may have been
        removed.
      </p>
      <Button variant="outline" asChild>
        <Link href="/milk-management/suppliers">Go back to suppliers</Link>
      </Button>
    </div>
  );
}

function maskAccount(accountNumber?: string | null) {
  if (!accountNumber) return "";
  const digits = accountNumber.slice(-4);
  return `•••• ${digits}`;
}

const toNumber = (value: number | string | null | undefined): number => {
  if (value == null) return 0;
  const parsed = Number(typeof value === "string" ? value : value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatTimeString = (value?: string | null): string => {
  if (!value) return "—";
  return value.slice(0, 5);
};
