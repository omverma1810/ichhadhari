"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Edit, Trash2, Truck, Package } from "lucide-react";
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
  useGoodsReceiptNote,
  useDeleteGoodsReceiptNote,
} from "@/lib/hooks/api/useProcurement";

export default function GRNDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params?.id as string);

  const { data: grn, isLoading } = useGoodsReceiptNote(id);
  const deleteGrnMutation = useDeleteGoodsReceiptNote();

  const getQualityBadge = (status: string) => {
    const config: Record<string, { color: string; label: string }> = {
      approved: { color: "bg-green-100 text-green-800", label: "Approved" },
      rejected: { color: "bg-red-100 text-red-800", label: "Rejected" },
      partial: { color: "bg-yellow-100 text-yellow-800", label: "Partial" },
    };
    const config_item = config[status] || config.approved;
    return <Badge className={config_item.color}>{config_item.label}</Badge>;
  };

  const handleDelete = () => {
    if (
      confirm(
        "Are you sure you want to delete this GRN? This action cannot be undone.",
      )
    ) {
      deleteGrnMutation.mutate(id, {
        onSuccess: () => {
          router.push("/inventory/grns");
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!grn) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">GRN not found</p>
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
              GRN {grn.grn_number}
            </h1>
            <div className="mt-2 flex items-center gap-2">
              {getQualityBadge(grn.quality_status)}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteGrnMutation.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </motion.div>

      {/* GRN Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 gap-4 lg:grid-cols-2"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Receipt Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">PO Number:</span>
              <span className="font-mono font-medium">
                {grn.purchase_order_number || `PO #${grn.purchase_order}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Vendor:</span>
              <span className="font-medium">
                {grn.vendor_name || `Vendor #${grn.vendor}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Receipt Date:</span>
              <span className="font-medium">
                {format(new Date(grn.receipt_date), "PPP")}
              </span>
            </div>
            {grn.receipt_timestamp && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Receipt Time:</span>
                <span className="font-medium">
                  {format(new Date(grn.receipt_timestamp), "PPP p")}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Delivery Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {grn.vehicle_number ? (
              <>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Vehicle Number:</span>
                  <span className="font-medium">{grn.vehicle_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Driver Name:</span>
                  <span className="font-medium">{grn.driver_name || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Driver Phone:</span>
                  <span className="font-medium">{grn.driver_phone || "-"}</span>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500">
                No delivery tracking information available
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quality Notes */}
      {grn.quality_notes && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Quality Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm">{grn.quality_notes}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Received Items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Received Items</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead className="text-right">Ordered</TableHead>
                    <TableHead className="text-right">Received</TableHead>
                    <TableHead className="text-right">Accepted</TableHead>
                    <TableHead className="text-right">Rejected</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Expiry</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grn.items?.map((item: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {item.item_name}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.ordered_quantity} {item.unit}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.received_quantity} {item.unit}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        {item.accepted_quantity} {item.unit}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        {item.rejected_quantity} {item.unit}
                      </TableCell>
                      <TableCell>{item.batch_number || "-"}</TableCell>
                      <TableCell>
                        {item.expiry_date
                          ? format(new Date(item.expiry_date), "PP")
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="space-y-4 lg:hidden">
              {grn.items?.map((item: any, index: number) => (
                <div key={index} className="rounded-lg border p-4">
                  <h4 className="font-semibold">{item.item_name}</h4>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ordered:</span>
                      <span>
                        {item.ordered_quantity} {item.unit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Received:</span>
                      <span>
                        {item.received_quantity} {item.unit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Accepted:</span>
                      <span className="text-green-600">
                        {item.accepted_quantity} {item.unit}
                      </span>
                    </div>
                    {item.rejected_quantity > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rejected:</span>
                        <span className="text-red-600">
                          {item.rejected_quantity} {item.unit}
                        </span>
                      </div>
                    )}
                    {item.batch_number && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Batch:</span>
                        <span>{item.batch_number}</span>
                      </div>
                    )}
                    {item.expiry_date && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expiry:</span>
                        <span>{format(new Date(item.expiry_date), "PP")}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
