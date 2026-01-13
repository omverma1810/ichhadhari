"use client";

import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  Thermometer,
  Droplet,
  Scale,
  FileText,
  Milk as MilkIcon,
} from "lucide-react";

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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils/cn";
import {
  useCreateCollection,
  useSuppliers,
} from "@/hooks/api/useMilkManagement";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { MilkDrop } from "@/components/icons";
import { staggerContainer, staggerItem } from "@/lib/utils/animations";
import type { CreateMilkCollectionPayload, MilkType } from "@/types/api";
import type { MilkIntakeFormData } from "@/types/milk";

const milkIntakeSchema = z.object({
  supplierId: z
    .number({ required_error: "Supplier is required" })
    .min(1, "Supplier is required"),
  milkType: z.enum(["cow", "buffalo", "mixed"]),
  ratePerLiter: z
    .number({ required_error: "Rate per liter is required" })
    .positive("Rate per liter is required"),
  collectionTime: z
    .string()
    .regex(/^[0-2]?\d:[0-5]\d$/, "Invalid time format")
    .optional(),
  quantity: z.number().min(0.1, "Quantity must be at least 0.1 liter"),
  fatPercentage: z
    .number()
    .min(0)
    .max(15, "Fat percentage must be between 0 and 15"),
  snfPercentage: z
    .number()
    .min(0)
    .max(15, "SNF percentage must be between 0 and 15")
    .optional(),
  temperature: z
    .number()
    .min(0)
    .max(50, "Temperature must be between 0 and 50°C")
    .optional(),
  notes: z.string().optional(),
  recordedAt: z.date(),
});

interface MilkIntakeFormProps {
  onSuccess?: () => void;
  initialData?: Partial<MilkIntakeFormData>;
}

export function MilkIntakeForm({
  onSuccess,
  initialData,
}: MilkIntakeFormProps) {
  const createCollectionMutation = useCreateCollection();
  const {
    data: suppliersData,
    isLoading: suppliersLoading,
    error: suppliersError,
  } = useSuppliers({
    page_size: 100,
    ordering: "name",
  });
  const supplierOptions = suppliersData?.results ?? [];

  // Debug logging
  if (process.env.NODE_ENV === "development") {
    console.log("Suppliers loading:", suppliersLoading);
    console.log("Suppliers data:", suppliersData);
    console.log("Suppliers options:", supplierOptions);
    if (suppliersError) {
      console.error("Suppliers error:", suppliersError);
    }
  }

  const milkTypeOptions = [
    { value: "cow", label: "Cow milk" },
    { value: "buffalo", label: "Buffalo milk" },
    { value: "mixed", label: "Mixed milk" },
  ] as const satisfies { value: MilkType; label: string }[];

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    control,
  } = useForm<MilkIntakeFormData>({
    resolver: zodResolver(milkIntakeSchema),
    defaultValues: {
      supplierId: initialData?.supplierId,
      milkType: initialData?.milkType ?? "cow",
      ratePerLiter: initialData?.ratePerLiter ?? 0,
      collectionTime:
        initialData?.collectionTime ?? format(new Date(), "HH:mm"),
      quantity: initialData?.quantity ?? 0,
      fatPercentage: initialData?.fatPercentage ?? 0,
      snfPercentage: initialData?.snfPercentage,
      temperature: initialData?.temperature,
      notes: initialData?.notes,
      recordedAt: initialData?.recordedAt ?? new Date(),
    },
  });

  const fatPercentage = watch("fatPercentage");
  const recordedAt = watch("recordedAt");

  const category = useMemo(() => {
    if (!fatPercentage) {
      return null;
    }
    if (fatPercentage >= 8 && fatPercentage <= 9) {
      return "premium";
    }
    if (fatPercentage >= 4 && fatPercentage <= 5) {
      return "standard";
    }
    return "other";
  }, [fatPercentage]);

  const categoryClasses = {
    premium: "bg-amber-100 text-amber-800 border-amber-300",
    standard: "bg-blue-100 text-blue-800 border-blue-300",
    other: "bg-gray-100 text-gray-800 border-gray-300",
  } as const;

  const onSubmit = async (data: MilkIntakeFormData) => {
    const payload: CreateMilkCollectionPayload = {
      supplier: data.supplierId,
      collection_date: format(data.recordedAt, "yyyy-MM-dd"),
      collection_time: data.collectionTime
        ? `${data.collectionTime}:00`
        : format(data.recordedAt, "HH:mm:ss"),
      milk_type: data.milkType,
      quantity: data.quantity.toFixed(2),
      fat_percentage: data.fatPercentage.toFixed(2),
      snf_percentage: (data.snfPercentage ?? 0).toFixed(2),
      temperature: (data.temperature ?? 0).toFixed(1),
      rate_per_liter: data.ratePerLiter.toFixed(2),
      notes: data.notes,
    };

    await createCollectionMutation.mutateAsync(payload);
    onSuccess?.();
  };

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      <AnimatePresence>
        {category ? (
          <motion.div
            key={category}
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            className="flex items-center justify-center"
          >
            <div
              className={cn(
                "flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-semibold",
                categoryClasses[category]
              )}
            >
              <MilkDrop className="h-4 w-4" />
              <span className="capitalize">{category} quality milk</span>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <motion.div className="space-y-2" variants={staggerItem}>
          <Label className="flex items-center gap-2">
            <MilkIcon className="h-4 w-4 text-dairy-blue" />
            Supplier *
          </Label>
          <Controller
            name="supplierId"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value ? String(field.value) : ""}
                onValueChange={(value) => field.onChange(Number(value))}
                disabled={suppliersLoading}
              >
                <SelectTrigger className="h-12 w-full">
                  <SelectValue
                    placeholder={
                      suppliersLoading
                        ? "Loading suppliers..."
                        : suppliersError
                        ? "Error loading suppliers"
                        : supplierOptions.length > 0
                        ? "Select supplier"
                        : "No suppliers found - Add suppliers first"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {supplierOptions.length === 0 && !suppliersLoading && (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      <p className="font-medium">No suppliers available</p>
                      <p className="text-xs mt-1">
                        Go to Milk Management → Suppliers to add suppliers
                      </p>
                    </div>
                  )}
                  {supplierOptions.map((supplier) => (
                    <SelectItem key={supplier.id} value={String(supplier.id)}>
                      <div className="flex flex-col">
                        <span className="font-medium">{supplier.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {supplier.supplier_id}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.supplierId ? (
            <p className="text-sm text-red-600">{errors.supplierId.message}</p>
          ) : null}
        </motion.div>

        <motion.div className="space-y-2" variants={staggerItem}>
          <Label className="flex items-center gap-2">
            <Droplet className="h-4 w-4 text-dairy-orange" />
            Milk type *
          </Label>
          <Controller
            name="milkType"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => field.onChange(value as MilkType)}
              >
                <SelectTrigger className="h-12 w-full">
                  <SelectValue placeholder="Select milk type" />
                </SelectTrigger>
                <SelectContent>
                  {milkTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </motion.div>

        <motion.div className="space-y-2" variants={staggerItem}>
          <Label htmlFor="quantity" className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-dairy-blue" />
            Quantity (liters) *
          </Label>
          <Input
            id="quantity"
            type="number"
            step="0.1"
            placeholder="0.0"
            {...register("quantity", { valueAsNumber: true })}
            className="h-12"
          />
          {errors.quantity ? (
            <p className="text-sm text-red-600">{errors.quantity.message}</p>
          ) : null}
        </motion.div>

        <motion.div className="space-y-2" variants={staggerItem}>
          <Label htmlFor="ratePerLiter" className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-dairy-charcoal" />
            Rate per liter (₹) *
          </Label>
          <Input
            id="ratePerLiter"
            type="number"
            step="0.1"
            placeholder="0.0"
            {...register("ratePerLiter", { valueAsNumber: true })}
            className="h-12"
          />
          {errors.ratePerLiter ? (
            <p className="text-sm text-red-600">
              {errors.ratePerLiter.message}
            </p>
          ) : null}
        </motion.div>

        <motion.div className="space-y-2" variants={staggerItem}>
          <Label htmlFor="fatPercentage" className="flex items-center gap-2">
            <Droplet className="h-4 w-4 text-dairy-orange" />
            Fat percentage (%) *
          </Label>
          <Input
            id="fatPercentage"
            type="number"
            step="0.1"
            placeholder="0.0"
            {...register("fatPercentage", { valueAsNumber: true })}
            className="h-12"
          />
          {errors.fatPercentage ? (
            <p className="text-sm text-red-600">
              {errors.fatPercentage.message}
            </p>
          ) : null}
        </motion.div>

        <motion.div className="space-y-2" variants={staggerItem}>
          <Label htmlFor="snfPercentage" className="flex items-center gap-2">
            <Droplet className="h-4 w-4 text-dairy-green" />
            SNF percentage (%)
          </Label>
          <Input
            id="snfPercentage"
            type="number"
            step="0.1"
            placeholder="0.0"
            {...register("snfPercentage", { valueAsNumber: true })}
            className="h-12"
          />
          {errors.snfPercentage ? (
            <p className="text-sm text-red-600">
              {errors.snfPercentage.message}
            </p>
          ) : null}
        </motion.div>

        <motion.div className="space-y-2" variants={staggerItem}>
          <Label htmlFor="temperature" className="flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-red-500" />
            Temperature (°C)
          </Label>
          <Input
            id="temperature"
            type="number"
            step="0.1"
            placeholder="0.0"
            {...register("temperature", { valueAsNumber: true })}
            className="h-12"
          />
          {errors.temperature ? (
            <p className="text-sm text-red-600">{errors.temperature.message}</p>
          ) : null}
        </motion.div>

        <motion.div className="space-y-2 md:col-span-2" variants={staggerItem}>
          <Label className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-dairy-blue" />
            Recorded on
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "flex w-full items-center justify-between border-dashed py-3 text-left font-normal md:w-1/2",
                  !recordedAt && "text-gray-400"
                )}
              >
                {recordedAt ? format(recordedAt, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={recordedAt}
                onSelect={(date) => {
                  if (date) {
                    setValue("recordedAt", date, { shouldValidate: true });
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <Label htmlFor="collectionTime" className="text-sm text-gray-600">
                Collection time
              </Label>
              <Input
                id="collectionTime"
                type="time"
                step="60"
                {...register("collectionTime")}
                className="h-12"
              />
              {errors.collectionTime ? (
                <p className="text-sm text-red-600">
                  {errors.collectionTime.message}
                </p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="notes" className="text-sm text-gray-600">
                Notes (optional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Any additional information..."
                {...register("notes")}
                className="min-h-24"
              />
            </div>
          </div>
          {errors.recordedAt ? (
            <p className="text-sm text-red-600">{errors.recordedAt.message}</p>
          ) : null}
        </motion.div>
      </div>

      <motion.div className="flex gap-3 pt-4" variants={staggerItem}>
        <motion.div
          className="flex-1"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            type="submit"
            disabled={createCollectionMutation.isPending}
            className="h-12 w-full bg-linear-to-r from-dairy-blue to-dairy-darkBlue text-white hover:from-dairy-darkBlue hover:to-dairy-blue"
          >
            {createCollectionMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" className="text-white" />
                Recording...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <MilkDrop className="h-4 w-4" />
                Record milk intake
              </span>
            )}
          </Button>
        </motion.div>
      </motion.div>
    </motion.form>
  );
}
