"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  ArrowLeft,
  Package,
  Loader2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useProducts, useCreateBatch } from "@/lib/hooks/api/useProduction";
import Link from "next/link";
import type { Product } from "@/lib/services/production.service";

const batchSchema = z.object({
  product: z.string().min(1, "Product is required"),
  production_date: z.date({ message: "Production date is required" }),
  quantity_produced: z.number().min(1, "Quantity must be at least 1"),
  raw_material_used: z.number().min(1, "Raw material used must be at least 1"),
  expiry_date: z.date({ message: "Expiry date is required" }),
  supervisor: z.string().min(1, "Supervisor is required"),
  cost_per_unit: z.number().min(0.01, "Cost per unit must be greater than 0"),
  batch_status: z
    .enum(["in_progress", "completed", "quality_check", "approved", "rejected"])
    .optional(),
  quality_rating: z.number().min(1).max(10).optional(),
  remarks: z.string().optional(),
});

type BatchFormData = z.infer<typeof batchSchema>;

export default function CreateBatchPage() {
  const router = useRouter();
  const [productionDate, setProductionDate] = useState<Date>();
  const [expiryDate, setExpiryDate] = useState<Date>();

  const { data: productsData, isLoading: loadingProducts } = useProducts();
  const createBatch = useCreateBatch();

  const products = productsData?.results || [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BatchFormData>({
    resolver: zodResolver(batchSchema),
  });

  const onSubmit = (data: BatchFormData) => {
    const formattedData = {
      ...data,
      product: parseInt(data.product),
      supervisor: parseInt(data.supervisor),
      production_date: format(data.production_date, "yyyy-MM-dd"),
      expiry_date: format(data.expiry_date, "yyyy-MM-dd"),
    };

    createBatch.mutate(formattedData, {
      onSuccess: () => {
        router.push("/production/batches");
      },
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <Link href="/production/batches">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[#5D4037] flex items-center gap-3">
              <Package className="w-8 h-8 text-[#8B5A3C]" />
              Create Production Batch
            </h1>
            <p className="text-gray-600 mt-1">
              Start a new production batch with product details
            </p>
          </div>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Batch Information</CardTitle>
              <CardDescription>
                Enter the basic details for the production batch
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Product Selection */}
              <div>
                <Label htmlFor="product">Product *</Label>
                <Select
                  onValueChange={(value) => setValue("product", value)}
                  disabled={loadingProducts}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        loadingProducts
                          ? "Loading products..."
                          : "Select product"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product: Product) => (
                      <SelectItem
                        key={product.id}
                        value={product.id.toString()}
                      >
                        {product.name} ({product.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.product && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.product.message}
                  </p>
                )}
              </div>

              {/* Production Date */}
              <div>
                <Label>Production Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${
                        !productionDate && "text-gray-500"
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {productionDate
                        ? format(productionDate, "PPP")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={productionDate}
                      onSelect={(date) => {
                        setProductionDate(date);
                        if (date) setValue("production_date", date);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.production_date && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.production_date.message}
                  </p>
                )}
              </div>

              {/* Quantity Produced */}
              <div>
                <Label htmlFor="quantity_produced">Quantity Produced *</Label>
                <Input
                  id="quantity_produced"
                  type="number"
                  step="0.01"
                  placeholder="Enter quantity"
                  {...register("quantity_produced", { valueAsNumber: true })}
                />
                {errors.quantity_produced && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.quantity_produced.message}
                  </p>
                )}
              </div>

              {/* Raw Material Used */}
              <div>
                <Label htmlFor="raw_material_used">
                  Raw Material Used (Liters) *
                </Label>
                <Input
                  id="raw_material_used"
                  type="number"
                  step="0.01"
                  placeholder="Enter raw material used"
                  {...register("raw_material_used", { valueAsNumber: true })}
                />
                {errors.raw_material_used && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.raw_material_used.message}
                  </p>
                )}
              </div>

              {/* Expiry Date */}
              <div>
                <Label>Expiry Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${
                        !expiryDate && "text-gray-500"
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expiryDate ? format(expiryDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={expiryDate}
                      onSelect={(date) => {
                        setExpiryDate(date);
                        if (date) setValue("expiry_date", date);
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.expiry_date && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.expiry_date.message}
                  </p>
                )}
              </div>

              {/* Supervisor */}
              <div>
                <Label htmlFor="supervisor">Supervisor *</Label>
                <Input
                  id="supervisor"
                  type="number"
                  placeholder="Enter supervisor employee ID"
                  {...register("supervisor")}
                />
                {errors.supervisor && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.supervisor.message}
                  </p>
                )}
              </div>

              {/* Cost Per Unit */}
              <div>
                <Label htmlFor="cost_per_unit">Cost Per Unit (₹) *</Label>
                <Input
                  id="cost_per_unit"
                  type="number"
                  step="0.01"
                  placeholder="Enter cost per unit"
                  {...register("cost_per_unit", { valueAsNumber: true })}
                />
                {errors.cost_per_unit && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.cost_per_unit.message}
                  </p>
                )}
              </div>

              {/* Batch Status */}
              <div>
                <Label htmlFor="batch_status">Initial Status</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("batch_status", value as any)
                  }
                  defaultValue="in_progress"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="quality_check">Quality Check</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quality Rating */}
              <div>
                <Label htmlFor="quality_rating">Quality Rating (1-10)</Label>
                <Input
                  id="quality_rating"
                  type="number"
                  min="1"
                  max="10"
                  placeholder="Enter quality rating (optional)"
                  {...register("quality_rating", { valueAsNumber: true })}
                />
                {errors.quality_rating && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.quality_rating.message}
                  </p>
                )}
              </div>

              {/* Remarks */}
              <div>
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  placeholder="Enter any additional remarks or notes..."
                  {...register("remarks")}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link href="/production/batches">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              className="bg-[#8B5A3C] hover:bg-[#5D4037]"
              disabled={createBatch.isPending}
            >
              {createBatch.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Package className="w-4 h-4 mr-2" />
                  Create Batch
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
