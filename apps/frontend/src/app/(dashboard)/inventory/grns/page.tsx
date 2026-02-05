"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Package, Plus, Filter, FileText } from "lucide-react";
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
import { useGoodsReceiptNotes } from "@/lib/hooks/api/useProcurement";

export default function GRNListPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [qualityStatus, setQualityStatus] = useState("all");

  const { data: grnsData, isLoading } = useGoodsReceiptNotes({
    page,
    quality_status: qualityStatus !== "all" ? qualityStatus : undefined,
  });

  const grns = grnsData?.results || [];
  const totalPages = grnsData?.count ? Math.ceil(grnsData.count / 10) : 1;

  const getQualityBadge = (status: string) => {
    const config: Record<string, { color: string; label: string }> = {
      approved: { color: "bg-green-100 text-green-800", label: "Approved" },
      rejected: { color: "bg-red-100 text-red-800", label: "Rejected" },
      partial: { color: "bg-yellow-100 text-yellow-800", label: "Partial" },
    };
    const config_item = config[status] || config.approved;
    return <Badge className={config_item.color}>{config_item.label}</Badge>;
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
            <Package className="h-6 w-6 text-[#F4A920] sm:h-8 sm:w-8" />
            Goods Receipt Notes
          </h1>
          <p className="mt-1 text-sm text-[#8B5A3C] sm:text-base">
            Track received inventory from vendors
          </p>
        </div>
        <Button
          onClick={() => router.push("/inventory/grns/create")}
          className="w-full bg-[#F4A920] hover:bg-[#F4A920]/90 sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create GRN
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
          <CardContent className="flex flex-wrap gap-2 md:gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="quality_status" className="text-sm">
                Quality Status
              </Label>
              <Select value={qualityStatus} onValueChange={setQualityStatus}>
                <SelectTrigger className="mt-1 w-full sm:w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>GRN Number</TableHead>
                  <TableHead>PO Number</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Receipt Date</TableHead>
                  <TableHead>Quality Status</TableHead>
                  <TableHead>Vehicle Number</TableHead>
                  <TableHead>Driver Name</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : grns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      No GRNs found
                    </TableCell>
                  </TableRow>
                ) : (
                  grns.map((grn: any) => (
                    <TableRow key={grn.id}>
                      <TableCell className="font-mono text-sm font-semibold">
                        {grn.grn_number}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {grn.purchase_order_number ||
                          `PO #${grn.purchase_order}`}
                      </TableCell>
                      <TableCell>
                        {grn.vendor_name || `Vendor #${grn.vendor}`}
                      </TableCell>
                      <TableCell>
                        {format(new Date(grn.receipt_date), "PP")}
                      </TableCell>
                      <TableCell>
                        {getQualityBadge(grn.quality_status)}
                      </TableCell>
                      <TableCell>{grn.vehicle_number || "-"}</TableCell>
                      <TableCell>{grn.driver_name || "-"}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            router.push(`/inventory/grns/${grn.id}`)
                          }
                        >
                          <FileText className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
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
        ) : grns.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">No GRNs found</CardContent>
          </Card>
        ) : (
          grns.map((grn: any) => (
            <Card
              key={grn.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => router.push(`/inventory/grns/${grn.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-xs text-gray-500">
                      {grn.grn_number}
                    </p>
                    <h3 className="mt-1 font-semibold">
                      {grn.vendor_name || `Vendor #${grn.vendor}`}
                    </h3>
                  </div>
                  {getQualityBadge(grn.quality_status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">PO Number:</span>
                  <span className="font-mono font-medium">
                    {grn.purchase_order_number || `PO #${grn.purchase_order}`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Receipt Date:</span>
                  <span className="font-medium">
                    {format(new Date(grn.receipt_date), "PP")}
                  </span>
                </div>
                {grn.vehicle_number && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Vehicle:</span>
                    <span className="font-medium">{grn.vehicle_number}</span>
                  </div>
                )}
                {grn.driver_name && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Driver:</span>
                    <span className="font-medium">{grn.driver_name}</span>
                  </div>
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
