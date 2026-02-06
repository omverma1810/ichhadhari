"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  ArrowLeft,
  Package,
  Loader2,
  Droplet,
  Thermometer,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
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
import { useProducts, useCreateBatch } from "@/hooks/api/useProduction";
import type { CreateProductionBatchPayload } from "@/types/api/production";

const batchSchema = z.object({
  product: z.string().min(1, "Product is required"),
  batch_date: z.date({ message: "Batch date is required" }),
  planned_quantity: z.number().min(0.01, "Planned quantity must be > 0"),
  milk_allocated: z.number().min(0.01, "Milk allocated must be > 0"),
  fat: z.number().min(0).max(15, "Fat must be 0-15").optional(),
  snf: z.number().min(0).max(15, "SNF must be 0-15").optional(),
  clr: z.number().min(0).max(50, "CLR must be 0-50").optional(),
  status: z.enum(["planned", "in_progress", "completed", "cancelled"]),
  supervisor: z.number().optional(),
  notes: z.string().optional(),
});

type BatchFormData = z.infer<typeof batchSchema>;

export default function CreateBatchPage() {
  const router = useRouter();
  const [batchDate, setBatchDate] = useState<Date>();

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
    defaultValues: {
      status: "planned",
    },
  });

  const onSubmit = (data: BatchFormData) => {
    const payload: CreateProductionBatchPayload = {
      product: parseInt(data.product),
      batch_date: format(data.batch_date, "yyyy-MM-dd"),
      planned_quantity: data.planned_quantity,
      milk_allocated: data.milk_allocated,
      fat: data.fat ?? null,
      snf: data.snf ?? null,
      clr: data.clr ?? null,
      supervisor: data.supervisor || undefined,
      notes: data.notes,
    };

    createBatch.mutate(payload, {
      onSuccess: () => {
        router.push("/production/batches");
      },
    });
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/production/batches">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold sm:text-2xl flex items-center gap-2">
              <Package className="h-6 w-6" />
              Create Production Batch
            </h1>
            <p className="text-sm text-muted-foreground">
              Start a new production batch with product details
            </p>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Batch Information</CardTitle>
            <CardDescription>
              Basic details for the production batch
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="product">Product *</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("product", value, { shouldValidate: true })
                  }
                  disabled={loadingProducts}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        loadingProducts
                          ? "Loading products..."
                          : "Select product"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product: any) => (
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
                  <p className="text-sm text-red-500">
                    {errors.product.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Batch Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={
                        "w-full justify-start text-left font-normal " +
                        (!batchDate ? "text-muted-foreground" : "")
                      }
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {batchDate ? format(batchDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={batchDate}
                      onSelect={(date) => {
                        setBatchDate(date);
                        if (date)
                          setValue("batch_date", date, {
                            shouldValidate: true,
                          });
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.batch_date && (
                  <p className="text-sm text-red-500">
                    {errors.batch_date.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="planned_quantity">Planned Quantity *</Label>
                <Input
                  id="planned_quantity"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 100"
                  {...register("planned_quantity", { valueAsNumber: true })}
                />
                {errors.planned_quantity && (
                  <p className="text-sm text-red-500">
                    {errors.planned_quantity.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="milk_allocated">
                  Milk Allocated (Liters) *
                </Label>
                <Input
                  id="milk_allocated"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 500"
                  {...register("milk_allocated", { valueAsNumber: true })}
                />
                {errors.milk_allocated && (
                  <p className="text-sm text-red-500">
                    {errors.milk_allocated.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Initial Status</Label>
                <Select
                  value={watch("status")}
                  onValueChange={(value) =>
                    setValue("status", value as BatchFormData["status"])
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supervisor">Supervisor (Employee ID)</Label>
                <Input
                  id="supervisor"
                  type="number"
                  placeholder="Enter supervisor ID"
                  {...register("supervisor")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Droplet className="h-5 w-5" />
              Milk Quality Parameters
            </CardTitle>
            <CardDescription>
              Record fat, SNF, and CLR of the milk used in this batch
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="fat" className="flex items-center gap-2">
                  <Droplet className="h-4 w-4 text-orange-500" />
                  Fat (kg/L)
                </Label>
                <Input
                  id="fat"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 4.5"
                  {...register("fat", { valueAsNumber: true })}
                />
                {errors.fat && (
                  <p className="text-sm text-red-500">{errors.fat.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="snf" className="flex items-center gap-2">
                  <Droplet className="h-4 w-4 text-green-500" />
                  SNF (kg/L)
                </Label>
                <Input
                  id="snf"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 8.5"
                  {...register("snf", { valueAsNumber: true })}
                />
                {errors.snf && (
                  <p className="text-sm text-red-500">{errors.snf.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="clr" className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-blue-500" />
                  CLR (Density)
                </Label>
                <Input
                  id="clr"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 28.0"
                  {...register("clr", { valueAsNumber: true })}
                />
                {errors.clr && (
                  <p className="text-sm text-red-500">{errors.clr.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Normal range: 25-32
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              id="notes"
              placeholder="Enter any additional notes..."
              {...register("notes")}
              rows={3}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link href="/production/batches">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={createBatch.isPending}
            className="w-full sm:w-auto"
          >
            {createBatch.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Package className="mr-2 h-4 w-4" />
                Create Batch
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
