"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { format } from "date-fns";
import {
  Wallet,
  Plus,
  Search,
  Filter,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard,
  Banknote,
  Smartphone,
  FileText,
} from "lucide-react";
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
  useVendorPayments,
  usePendingPayments,
  useVendors,
} from "@/lib/hooks/api/useProcurement";
import type { VendorPayment } from "@/lib/services/procurement.service";

const PAYMENT_METHOD_CONFIG = {
  cash: { label: "Cash", icon: Banknote, color: "text-green-600" },
  bank_transfer: {
    label: "Bank Transfer",
    icon: CreditCard,
    color: "text-blue-600",
  },
  upi: { label: "UPI", icon: Smartphone, color: "text-purple-600" },
  cheque: { label: "Cheque", icon: FileText, color: "text-orange-600" },
};

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-700 border-yellow-300",
    icon: Clock,
  },
  completed: {
    label: "Completed",
    color: "bg-green-100 text-green-700 border-green-300",
    icon: CheckCircle,
  },
  failed: {
    label: "Failed",
    color: "bg-red-100 text-red-700 border-red-300",
    icon: AlertCircle,
  },
};

export default function VendorPaymentsPage() {
  const [search, setSearch] = useState("");
  const [vendorFilter, setVendorFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: paymentsData, isLoading } = useVendorPayments();
  const { data: pendingPaymentsData } = usePendingPayments();
  const { data: vendorsData } = useVendors();

  const payments = paymentsData?.results || [];
  const pendingPayments = pendingPaymentsData?.results || [];
  const vendors = vendorsData?.results || [];

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.payment_id.toLowerCase().includes(search.toLowerCase()) ||
      payment.vendor_name?.toLowerCase().includes(search.toLowerCase());

    const matchesVendor =
      vendorFilter === "all" || payment.vendor.toString() === vendorFilter;

    const matchesStatus =
      statusFilter === "all" || payment.status === statusFilter;

    return matchesSearch && matchesVendor && matchesStatus;
  });

  const stats = {
    total: payments.length,
    pending: payments.filter((p) => p.status === "pending").length,
    completed: payments.filter((p) => p.status === "completed").length,
    totalAmount: payments
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0),
  };

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-[#5D4037] flex items-center gap-3">
            <Wallet className="w-8 h-8 text-[#8B5A3C]" />
            Vendor Payments
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and track all vendor payments and transactions
          </p>
        </div>
        <Link href="/vendors/payments/create">
          <Button className="bg-[#8B5A3C] hover:bg-[#5D4037] h-11">
            <Plus className="w-4 h-4 mr-2" />
            Record Payment
          </Button>
        </Link>
      </motion.div>

      {pendingPayments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-yellow-800 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Pending Payments
              </CardTitle>
              <CardDescription className="text-yellow-700">
                You have {pendingPayments.length} payment(s) pending approval
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Payments
            </CardTitle>
            <Wallet className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#5D4037]">
              {stats.total}
            </div>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending Payments
            </CardTitle>
            <Clock className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </div>
            <p className="text-xs text-gray-500 mt-1">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Completed
            </CardTitle>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.completed}
            </div>
            <p className="text-xs text-gray-500 mt-1">Successfully processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Amount
            </CardTitle>
            <Wallet className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#5D4037]">
              ₹{stats.totalAmount.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">Completed payments</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by payment ID or vendor..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={vendorFilter} onValueChange={setVendorFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Vendors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vendors</SelectItem>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id.toString()}>
                      {vendor.vendor_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Vendor Payments</CardTitle>
            <CardDescription>
              {filteredPayments.length} of {payments.length} payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5A3C]"></div>
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No payments found</p>
                <p className="text-sm text-gray-400 mt-1">
                  {search || vendorFilter !== "all" || statusFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Record your first payment"}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Payment ID</TableHead>
                          <TableHead>Vendor</TableHead>
                          <TableHead>Payment Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPayments.map((payment) => {
                          const status = STATUS_CONFIG[payment.status];
                          const StatusIcon = status.icon;
                          const method =
                            PAYMENT_METHOD_CONFIG[payment.payment_method];
                          const MethodIcon = method.icon;

                          return (
                            <TableRow key={payment.id}>
                              <TableCell>
                                <div className="font-mono text-sm font-semibold text-[#5D4037]">
                                  {payment.payment_id}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">
                                  {payment.vendor_name}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Calendar className="w-4 h-4" />
                                  {format(
                                    new Date(payment.payment_date),
                                    "PPP",
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-semibold">
                                  ₹
                                  {parseFloat(
                                    payment.amount.toString(),
                                  ).toLocaleString()}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div
                                  className={`flex items-center gap-2 ${method.color}`}
                                >
                                  <MethodIcon className="w-4 h-4" />
                                  <span className="text-sm font-medium">
                                    {method.label}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={status.color}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {status.label}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {payment.is_advance ? (
                                  <Badge
                                    variant="outline"
                                    className="border-blue-200 text-blue-700"
                                  >
                                    Advance
                                  </Badge>
                                ) : (
                                  <span className="text-sm text-gray-500">
                                    Regular
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <Link href={`/vendors/payments/${payment.id}`}>
                                  <Button variant="ghost" size="sm">
                                    View Details
                                  </Button>
                                </Link>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-4">
                  {filteredPayments.map((payment) => {
                    const status = STATUS_CONFIG[payment.status];
                    const StatusIcon = status.icon;
                    const method =
                      PAYMENT_METHOD_CONFIG[payment.payment_method];
                    const MethodIcon = method.icon;

                    return (
                      <Card key={payment.id}>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-xs text-gray-500">
                                  Payment ID
                                </p>
                                <p className="font-mono text-sm font-semibold text-[#5D4037]">
                                  {payment.payment_id}
                                </p>
                              </div>
                              <Badge className={status.color}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {status.label}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <p className="text-xs text-gray-500">Vendor</p>
                                <p className="text-sm font-medium">
                                  {payment.vendor_name}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Amount</p>
                                <p className="text-sm font-semibold">
                                  ₹
                                  {parseFloat(
                                    payment.amount.toString(),
                                  ).toLocaleString()}
                                </p>
                              </div>
                            </div>

                            <div>
                              <p className="text-xs text-gray-500 mb-1">
                                Payment Date
                              </p>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="w-4 h-4" />
                                {format(new Date(payment.payment_date), "PPP")}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">
                                  Method
                                </p>
                                <div
                                  className={`flex items-center gap-2 ${method.color}`}
                                >
                                  <MethodIcon className="w-4 h-4" />
                                  <span className="text-sm font-medium">
                                    {method.label}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">
                                  Type
                                </p>
                                {payment.is_advance ? (
                                  <Badge
                                    variant="outline"
                                    className="border-blue-200 text-blue-700"
                                  >
                                    Advance
                                  </Badge>
                                ) : (
                                  <span className="text-sm text-gray-500">
                                    Regular
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="pt-2 border-t">
                              <Link href={`/vendors/payments/${payment.id}`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                >
                                  View Details
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {paymentsData && paymentsData.count > 10 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-between"
        >
          <p className="text-sm text-gray-600">
            Showing {filteredPayments.length} of {paymentsData.count} payments
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
