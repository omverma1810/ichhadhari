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
import { useQueryClient } from "@tanstack/react-query";
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
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  useProducts,
  useCreateBatch,
  productionKeys,
} from "@/hooks/api/useProduction";
import { useSegregationPlans } from "@/hooks/api/useMilkManagement";
import type { CreateProductionBatchPayload } from "@/types/api/production";
import { formatNumber } from "@/lib/utils/formatters";
import { batchesService } from "@/services/api";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils/api-helpers";

const batchSchema = z.object({
  product: z.string().min(1, "Product is required"),
  batch_date: z.date({ message: "Batch date is required" }),
  planned_quantity: z.coerce.number().min(0.01, "Planned quantity must be > 0"),
  milk_allocated: z.coerce.number().min(0.01, "Milk allocated must be > 0"),
  fat: z
    .union([z.coerce.number().min(0).max(15, "Fat must be 0-15"), z.nan()])
    .optional()
    .transform((v) => (v !== undefined && !isNaN(v) ? v : undefined)),
  snf: z
    .union([z.coerce.number().min(0).max(15, "SNF must be 0-15"), z.nan()])
    .optional()
    .transform((v) => (v !== undefined && !isNaN(v) ? v : undefined)),
  clr: z
    .union([z.coerce.number().min(0).max(50, "CLR must be 0-50"), z.nan()])
    .optional()
    .transform((v) => (v !== undefined && !isNaN(v) ? v : undefined)),
  productFat: z
    .union([
      z.coerce.number().min(0).max(15, "Product fat must be 0-15"),
      z.nan(),
    ])
    .optional()
    .transform((v) => (v !== undefined && !isNaN(v) ? v : undefined)),
  productSnf: z
    .union([
      z.coerce.number().min(0).max(15, "Product SNF must be 0-15"),
      z.nan(),
    ])
    .optional()
    .transform((v) => (v !== undefined && !isNaN(v) ? v : undefined)),
  productClr: z
    .union([
      z.coerce.number().min(0).max(50, "Product CLR must be 0-50"),
      z.nan(),
    ])
    .optional()
    .transform((v) => (v !== undefined && !isNaN(v) ? v : undefined)),
  status: z.enum(["planned", "in_progress", "completed", "cancelled"]),
  supervisor: z
    .union([z.coerce.number().positive(), z.nan(), z.literal("")])
    .optional()
    .transform((v) => (typeof v === "number" && !isNaN(v) ? v : undefined)),
  notes: z.string().optional(),
});

type BatchFormData = z.infer<typeof batchSchema>;

export default function CreateBatchPage() {
  const router = useRouter();
  const [batchDate, setBatchDate] = useState<Date>();
  const [bulkCreating, setBulkCreating] = useState(false);
  const [confirmBulkOpen, setConfirmBulkOpen] = useState(false);
  const [bulkFailures, setBulkFailures] = useState<
    Array<{
      name: string;
      reason: string;
      product: number;
      planned_quantity: number;
      milk_allocated: number;
      batch_date: string;
    }>
  >([]);
  const [bulkSummary, setBulkSummary] = useState<{
    total: number;
    succeeded: number;
    failed: number;
  } | null>(null);
  const queryClient = useQueryClient();

  const { data: productsData, isLoading: loadingProducts } = useProducts();
  const { data: segregationPlans } = useSegregationPlans({
    page_size: 1,
    ordering: "-plan_date",
  });
  const createBatch = useCreateBatch();

  const products = productsData?.results || [];
  const latestPlan = segregationPlans?.results?.[0];

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
      product_fat: data.productFat ?? null,
      product_snf: data.productSnf ?? null,
      product_clr: data.productClr ?? null,
      supervisor: data.supervisor || undefined,
      notes: data.notes,
    };

    createBatch.mutate(payload, {
      onSuccess: () => {
        router.push("/production/batches");
      },
    });
  };

  const handleUseSuggestion = (item: {
    product: number;
    allocated_liters: number | string;
    planned_units: number | string;
  }) => {
    setValue("product", String(item.product), { shouldValidate: true });
    setValue("planned_quantity", Number(item.planned_units) || 0, {
      shouldValidate: true,
    });
    setValue("milk_allocated", Number(item.allocated_liters) || 0, {
      shouldValidate: true,
    });
    if (latestPlan?.plan_date) {
      const planDate = new Date(latestPlan.plan_date);
      if (!Number.isNaN(planDate.getTime())) {
        setBatchDate(planDate);
        setValue("batch_date", planDate, { shouldValidate: true });
      }
    }
  };

  const buildPlanPayloads = () => {
    if (!latestPlan?.items?.length) return [];
    const planDate = latestPlan.plan_date || format(new Date(), "yyyy-MM-dd");
    return latestPlan.items
      .map((item) => ({
        product: item.product,
        batch_date: planDate,
        planned_quantity: Number(item.planned_units) || 0,
        milk_allocated: Number(item.allocated_liters) || 0,
        product_name: item.product_name,
      }))
      .filter(
        (payload) => payload.planned_quantity > 0 && payload.milk_allocated > 0,
      );
  };

  const createBatchesFromPayloads = async (
    payloads: Array<{
      product: number;
      batch_date: string;
      planned_quantity: number;
      milk_allocated: number;
      product_name?: string;
    }>,
  ) => {
    setBulkCreating(true);
    setBulkFailures([]);
    setBulkSummary(null);

    let successCount = 0;
    const failures: Array<{
      name: string;
      reason: string;
      product: number;
      planned_quantity: number;
      milk_allocated: number;
      batch_date: string;
    }> = [];

    for (const payload of payloads) {
      try {
        await batchesService.createBatch({
          product: payload.product,
          batch_date: payload.batch_date,
          planned_quantity: payload.planned_quantity,
          milk_allocated: payload.milk_allocated,
        });
        successCount += 1;
      } catch (error) {
        failures.push({
          name: payload.product_name || String(payload.product),
          reason: getErrorMessage(error),
          product: payload.product,
          planned_quantity: payload.planned_quantity,
          milk_allocated: payload.milk_allocated,
          batch_date: payload.batch_date,
        });
      }
    }

    if (successCount > 0) {
      queryClient.invalidateQueries({ queryKey: productionKeys.batches() });
      toast.success(`Created ${successCount} batches from plan`);
    }
    if (failures.length > 0) {
      setBulkFailures(failures);
      toast.error(`Failed to create ${failures.length} batches`);
    }

    setBulkSummary({
      total: payloads.length,
      succeeded: successCount,
      failed: failures.length,
    });
    setBulkCreating(false);
  };

  const handleCreateAllFromPlan = async () => {
    if (bulkCreating) return;
    const payloads = buildPlanPayloads();
    if (!payloads.length) return;
    await createBatchesFromPayloads(payloads);
  };

  const handleRetryFailed = async () => {
    if (!bulkFailures.length || bulkCreating) return;
    const payloads = bulkFailures.map((failure) => ({
      product: failure.product,
      batch_date: failure.batch_date,
      planned_quantity: failure.planned_quantity,
      milk_allocated: failure.milk_allocated,
      product_name: failure.name,
    }));
    await createBatchesFromPayloads(payloads);
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
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">Auto-suggest batches</CardTitle>
            <CardDescription>
              Use the latest milk segregation plan to prefill batch details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {latestPlan ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span>Plan date: {latestPlan.plan_date}</span>
                  <span>•</span>
                  <span>
                    Total milk: {formatNumber(latestPlan.total_liters)} L
                  </span>
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setConfirmBulkOpen(true)}
                    disabled={bulkCreating}
                  >
                    {bulkCreating
                      ? "Creating batches..."
                      : "Create all batches"}
                  </Button>
                </div>
                {bulkFailures.length > 0 && (
                  <div className="rounded-lg border border-red-100 bg-red-50/70 p-3">
                    <p className="text-sm font-semibold text-red-700">
                      Failed batches
                    </p>
                    <ul className="mt-2 space-y-1 text-xs text-red-700">
                      {bulkFailures.map((failure) => (
                        <li key={`${failure.name}-${failure.reason}`}>
                          {failure.name}: {failure.reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="space-y-2">
                  {latestPlan.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-3 rounded-lg border border-gray-100 p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold">
                          {item.product_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatNumber(item.allocated_liters)} L allocated •{" "}
                          {formatNumber(item.planned_units)} {item.product_unit}
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleUseSuggestion(item)}
                      >
                        Use suggestion
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No segregation plan found yet. Create one to auto-suggest
                batches.
              </div>
            )}
          </CardContent>
        </Card>
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
                  {...register("supervisor", { valueAsNumber: true })}
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
            <CardTitle className="flex items-center gap-2 text-base">
              <Droplet className="h-5 w-5" />
              Product Quality Parameters
            </CardTitle>
            <CardDescription>
              Record fat, SNF, and CLR of the product quality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label
                  htmlFor="product_fat"
                  className="flex items-center gap-2"
                >
                  <Droplet className="h-4 w-4 text-orange-500" />
                  Fat (kg/L)
                </Label>
                <Input
                  id="product_fat"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 4.5"
                  {...register("productFat", { valueAsNumber: true })}
                />
                {errors.productFat && (
                  <p className="text-sm text-red-500">
                    {errors.productFat.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="product_snf"
                  className="flex items-center gap-2"
                >
                  <Droplet className="h-4 w-4 text-green-500" />
                  SNF (kg/L)
                </Label>
                <Input
                  id="product_snf"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 8.5"
                  {...register("productSnf", { valueAsNumber: true })}
                />
                {errors.productSnf && (
                  <p className="text-sm text-red-500">
                    {errors.productSnf.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="product_clr"
                  className="flex items-center gap-2"
                >
                  <Thermometer className="h-4 w-4 text-blue-500" />
                  CLR (Density)
                </Label>
                <Input
                  id="product_clr"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 28.0"
                  {...register("productClr", { valueAsNumber: true })}
                />
                {errors.productClr && (
                  <p className="text-sm text-red-500">
                    {errors.productClr.message}
                  </p>
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

      <Dialog
        open={confirmBulkOpen}
        onOpenChange={(open) => {
          if (bulkCreating) return;
          setConfirmBulkOpen(open);
          if (!open) {
            setBulkSummary(null);
          }
        }}
      >
        <DialogContent showCloseButton={!bulkCreating}>
          <DialogHeader>
            <DialogTitle>Create all batches?</DialogTitle>
            <DialogDescription>
              This will create production batches for every item in the latest
              segregation plan. You can still edit any batch afterwards.
            </DialogDescription>
          </DialogHeader>
          {bulkSummary && (
            <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-3 text-sm text-blue-900">
              Created {bulkSummary.succeeded} of {bulkSummary.total} batches.
              {bulkSummary.failed > 0
                ? ` ${bulkSummary.failed} failed.`
                : " All batches created successfully."}
            </div>
          )}
          <DialogFooter>
            {!bulkSummary && (
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={bulkCreating}>
                  Cancel
                </Button>
              </DialogClose>
            )}
            {bulkSummary && bulkFailures.length > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleRetryFailed}
                disabled={bulkCreating}
              >
                Retry failed only
              </Button>
            )}
            {bulkSummary ? (
              <DialogClose asChild>
                <Button type="button" disabled={bulkCreating}>
                  Done
                </Button>
              </DialogClose>
            ) : (
              <Button
                type="button"
                onClick={handleCreateAllFromPlan}
                disabled={bulkCreating}
              >
                {bulkCreating ? "Creating..." : "Confirm"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
