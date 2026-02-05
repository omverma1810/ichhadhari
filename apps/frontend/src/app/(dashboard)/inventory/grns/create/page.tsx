"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  usePurchaseOrder,
  useCreateGoodsReceiptNote,
} from "@/lib/hooks/api/useProcurement";

const grnItemSchema = z.object({
  inventory_item: z.number().optional(),
  item_name: z.string().min(1, "Item name is required"),
  ordered_quantity: z.number().positive(),
  received_quantity: z.number().min(0),
  accepted_quantity: z.number().min(0),
  rejected_quantity: z.number().min(0),
  unit: z.string().min(1),
  batch_number: z.string().optional(),
  expiry_date: z.string().optional(),
});

const grnSchema = z.object({
  purchase_order: z.string().min(1, "Purchase order is required"),
  receipt_date: z.string().min(1, "Receipt date is required"),
  quality_status: z.enum(["approved", "rejected", "partial"]),
  quality_notes: z.string().optional(),
  vehicle_number: z.string().optional(),
  driver_name: z.string().optional(),
  driver_phone: z.string().optional(),
  receipt_timestamp: z.string().optional(),
  items: z.array(grnItemSchema).min(1, "At least one item is required"),
});

type GRNFormData = z.infer<typeof grnSchema>;

export default function CreateGRNPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const poIdFromQuery = searchParams?.get("po");

  const [selectedPoId, setSelectedPoId] = useState<string>(poIdFromQuery || "");
  const { data: selectedPo } = usePurchaseOrder(
    selectedPoId ? parseInt(selectedPoId) : 0,
  );
  const createGrnMutation = useCreateGoodsReceiptNote();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<GRNFormData>({
    resolver: zodResolver(grnSchema),
    defaultValues: {
      receipt_date: new Date().toISOString().split("T")[0],
      quality_status: "approved",
      items: [],
    },
  });

  const { fields, replace } = useFieldArray({
    control,
    name: "items",
  });

  // Load PO items when PO is selected
  useEffect(() => {
    if (selectedPo?.items) {
      const grnItems = selectedPo.items.map((item: any) => ({
        inventory_item: item.inventory_item,
        item_name: item.item_name,
        ordered_quantity: item.quantity,
        received_quantity: item.quantity,
        accepted_quantity: item.quantity,
        rejected_quantity: 0,
        unit: item.unit,
        batch_number: "",
        expiry_date: "",
      }));
      replace(grnItems);
      setValue("purchase_order", selectedPo.id.toString());
    }
  }, [selectedPo, replace, setValue]);

  const onSubmit = (data: GRNFormData) => {
    const formattedData = {
      ...data,
      purchase_order: parseInt(data.purchase_order),
      vendor: selectedPo?.vendor,
      receipt_timestamp: data.receipt_timestamp || new Date().toISOString(),
    };

    createGrnMutation.mutate(formattedData as any, {
      onSuccess: () => {
        router.push("/inventory/grns");
      },
    });
  };

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
        <h1 className="text-2xl font-bold text-[#5D4037] sm:text-3xl">
          Create Goods Receipt Note
        </h1>
        <p className="mt-1 text-sm text-[#8B5A3C] sm:text-base">
          Record received goods from purchase order
        </p>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>
                    Purchase Order <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={selectedPoId}
                    onChange={(e) => setSelectedPoId(e.target.value)}
                    placeholder="Enter PO ID"
                    type="number"
                  />
                  {selectedPo && (
                    <p className="text-xs text-gray-600">
                      PO: {selectedPo.po_number} - {selectedPo.vendor_name}
                    </p>
                  )}
                  {errors.purchase_order && (
                    <p className="text-xs text-red-500">
                      {errors.purchase_order.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receipt_date">
                    Receipt Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="receipt_date"
                    type="date"
                    {...register("receipt_date")}
                    className={errors.receipt_date ? "border-red-500" : ""}
                  />
                  {errors.receipt_date && (
                    <p className="text-xs text-red-500">
                      {errors.receipt_date.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="quality_status">
                    Quality Status <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={watch("quality_status")}
                    onValueChange={(value: any) =>
                      setValue("quality_status", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receipt_timestamp">Receipt Timestamp</Label>
                  <Input
                    id="receipt_timestamp"
                    type="datetime-local"
                    {...register("receipt_timestamp")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quality_notes">Quality Notes</Label>
                <Textarea
                  id="quality_notes"
                  {...register("quality_notes")}
                  placeholder="Quality inspection notes"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Delivery Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Delivery Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="vehicle_number">Vehicle Number</Label>
                  <Input
                    id="vehicle_number"
                    {...register("vehicle_number")}
                    placeholder="e.g., MH-12-AB-1234"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="driver_name">Driver Name</Label>
                  <Input
                    id="driver_name"
                    {...register("driver_name")}
                    placeholder="Driver's full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="driver_phone">Driver Phone</Label>
                  <Input
                    id="driver_phone"
                    {...register("driver_phone")}
                    placeholder="+91-XXXXXXXXXX"
                    type="tel"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Received Items */}
          <Card>
            <CardHeader>
              <CardTitle>Received Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.length === 0 ? (
                <p className="text-center text-sm text-gray-500">
                  Select a purchase order to load items
                </p>
              ) : (
                fields.map((field, index) => (
                  <div key={field.id} className="rounded-lg border p-4">
                    <h4 className="mb-3 font-semibold">
                      {watch(`items.${index}.item_name`)}
                    </h4>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Ordered Qty</Label>
                        <Input
                          type="number"
                          {...register(`items.${index}.ordered_quantity`, {
                            valueAsNumber: true,
                          })}
                          readOnly
                          className="bg-gray-50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Received Qty *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          {...register(`items.${index}.received_quantity`, {
                            valueAsNumber: true,
                          })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Accepted Qty *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          {...register(`items.${index}.accepted_quantity`, {
                            valueAsNumber: true,
                          })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Rejected Qty</Label>
                        <Input
                          type="number"
                          step="0.01"
                          {...register(`items.${index}.rejected_quantity`, {
                            valueAsNumber: true,
                          })}
                        />
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label className="text-xs">Unit</Label>
                        <Input
                          {...register(`items.${index}.unit`)}
                          readOnly
                          className="bg-gray-50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Batch Number</Label>
                        <Input
                          {...register(`items.${index}.batch_number`)}
                          placeholder="Optional"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Expiry Date</Label>
                        <Input
                          type="date"
                          {...register(`items.${index}.expiry_date`)}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
              {errors.items && (
                <p className="text-xs text-red-500">
                  At least one item is required
                </p>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-full bg-[#F4A920] hover:bg-[#F4A920]/90 sm:w-auto"
              disabled={createGrnMutation.isPending || !selectedPoId}
            >
              {createGrnMutation.isPending ? (
                "Creating..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create GRN
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
