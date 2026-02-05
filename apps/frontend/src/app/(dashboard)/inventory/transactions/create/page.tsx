"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Save, Package, Info } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateStockTransaction,
  useInventoryItems,
} from "@/lib/hooks/api/useInventory";

const transactionSchema = z.object({
  item: z.string().min(1, "Item is required"),
  transaction_type: z.enum([
    "purchase",
    "production",
    "sale",
    "wastage",
    "adjustment",
    "return",
    "transfer",
  ]),
  quantity: z.number().positive("Quantity must be positive"),
  is_addition: z.boolean(),
  reference_type: z.string().optional(),
  reference_id: z.string().optional(),
  batch_number: z.string().optional(),
  expiry_date: z.string().optional(),
  storage_location: z.string().optional(),
  from_location: z.string().optional(),
  to_location: z.string().optional(),
  notes: z.string().optional(),
  cost_per_unit: z.number().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

export default function CreateStockTransactionPage() {
  const router = useRouter();
  const [transactionType, setTransactionType] = useState("purchase");

  const { data: itemsData } = useInventoryItems({ page: 1, page_size: 100 });
  const items = itemsData?.results || [];

  const createTransactionMutation = useCreateStockTransaction();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      transaction_type: "purchase",
      is_addition: true,
      quantity: 0,
    },
  });

  const watchTransactionType = watch("transaction_type");

  const handleTransactionTypeChange = (value: string) => {
    setTransactionType(value);
    setValue("transaction_type", value as any);

    // Auto-set is_addition based on transaction type
    const additionTypes = ["purchase", "production", "return", "adjustment"];
    const isAddition = additionTypes.includes(value);
    setValue("is_addition", isAddition);
  };

  const onSubmit = (data: TransactionFormData) => {
    createTransactionMutation.mutate(data, {
      onSuccess: () => {
        router.push("/inventory/ledger");
      },
    });
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
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-2 -ml-2 text-[#8B5A3C] hover:text-[#5D4037]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-[#5D4037] sm:text-3xl">
            <Package className="h-6 w-6 text-[#F4A920] sm:h-8 sm:w-8" />
            Record Stock Transaction
          </h1>
          <p className="mt-1 text-sm text-[#8B5A3C] sm:text-base">
            Add a new inventory transaction
          </p>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Transaction Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Item and Transaction Type */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="item">
                    Item <span className="text-red-500">*</span>
                  </Label>
                  <Select onValueChange={(value) => setValue("item", value)}>
                    <SelectTrigger
                      className={errors.item ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select item" />
                    </SelectTrigger>
                    <SelectContent>
                      {items.map((item: any) => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.name} ({item.item_code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.item && (
                    <p className="text-xs text-red-500">
                      {errors.item.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transaction_type">
                    Transaction Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={transactionType}
                    onValueChange={handleTransactionTypeChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="purchase">
                        Purchase (Inward)
                      </SelectItem>
                      <SelectItem value="production">
                        Production (Inward)
                      </SelectItem>
                      <SelectItem value="sale">Sale (Outward)</SelectItem>
                      <SelectItem value="wastage">Wastage (Outward)</SelectItem>
                      <SelectItem value="adjustment">Adjustment</SelectItem>
                      <SelectItem value="return">Return (Inward)</SelectItem>
                      <SelectItem value="transfer">Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.transaction_type && (
                    <p className="text-xs text-red-500">
                      {errors.transaction_type.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Quantity and Cost */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="quantity">
                    Quantity <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    {...register("quantity", { valueAsNumber: true })}
                    className={errors.quantity ? "border-red-500" : ""}
                    placeholder="Enter quantity"
                  />
                  {errors.quantity && (
                    <p className="text-xs text-red-500">
                      {errors.quantity.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cost_per_unit">Cost Per Unit</Label>
                  <Input
                    id="cost_per_unit"
                    type="number"
                    step="0.01"
                    {...register("cost_per_unit", { valueAsNumber: true })}
                    placeholder="Enter cost per unit"
                  />
                  <p className="text-xs text-gray-500">Optional</p>
                </div>
              </div>

              {/* Reference Information */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="reference_type">Reference Type</Label>
                  <Select
                    onValueChange={(value) => setValue("reference_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select reference type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="purchase_order">
                        Purchase Order
                      </SelectItem>
                      <SelectItem value="sale_order">Sale Order</SelectItem>
                      <SelectItem value="production_batch">
                        Production Batch
                      </SelectItem>
                      <SelectItem value="grn">GRN</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reference_id">Reference ID</Label>
                  <Input
                    id="reference_id"
                    {...register("reference_id")}
                    placeholder="Enter reference ID"
                  />
                  <p className="text-xs text-gray-500">
                    e.g., PO number, batch number
                  </p>
                </div>
              </div>

              {/* Batch and Expiry */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="batch_number">
                    Batch Number
                    <Info className="ml-1 inline h-3 w-3 text-gray-400" />
                  </Label>
                  <Input
                    id="batch_number"
                    {...register("batch_number")}
                    placeholder="Enter batch number"
                  />
                  <p className="text-xs text-gray-500">
                    Important for traceability
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiry_date">Expiry Date</Label>
                  <Input
                    id="expiry_date"
                    type="date"
                    {...register("expiry_date")}
                  />
                </div>
              </div>

              {/* Location Fields */}
              {watchTransactionType === "transfer" ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="from_location">
                      From Location <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="from_location"
                      {...register("from_location")}
                      placeholder="Source location"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="to_location">
                      To Location <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="to_location"
                      {...register("to_location")}
                      placeholder="Destination location"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="storage_location">Storage Location</Label>
                  <Input
                    id="storage_location"
                    {...register("storage_location")}
                    placeholder="Enter storage location"
                  />
                  <p className="text-xs text-gray-500">
                    e.g., Warehouse A, Cold Room 1
                  </p>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  {...register("notes")}
                  placeholder="Additional notes or remarks"
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">
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
                  disabled={createTransactionMutation.isPending}
                >
                  {createTransactionMutation.isPending ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Transaction
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </motion.div>
    </div>
  );
}
