"use client";

import { useMemo, useState } from "react";
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
  IndianRupee,
  Plus,
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
import { useCreateCollection } from "@/hooks/api/useMilkManagement";
import {
  useCreateSupplier,
  useSuppliers,
} from "@/hooks/api/milk-management/suppliers";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { MilkDrop } from "@/components/icons";
import { staggerContainer, staggerItem } from "@/lib/utils/animations";
import {
  SupplierFormModal,
  type SupplierFormValues,
} from "@/components/milk-management/suppliers/SupplierFormModal";
import type { CreateMilkCollectionPayload, MilkType } from "@/types/api";
import type { MilkIntakeFormData } from "@/types/milk";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils/api-helpers";

const milkIntakeSchema = z.object({
  supplierId: z
    .number({ message: "Supplier is required" })
    .min(1, "Supplier is required"),
  milkType: z.enum(["cow", "buffalo", "mixed"]),
  ratePerFat: z
    .number({ message: "Rate per fat is required" })
    .positive("Rate per fat is required"),
  ratePerSnf: z.number().min(0, "Rate per SNF cannot be negative").optional(),
  collectionTime: z
    .string()
    .regex(/^[0-2]?\d:[0-5]\d$/, "Invalid time format")
    .optional(),
  quantity: z.number().min(0.1, "Quantity must be at least 0.1 liter"),
  fat: z.number().min(0).max(15, "Fat content must be between 0 and 15 kg/L"),
  snf: z
    .number()
    .min(0)
    .max(15, "SNF content must be between 0 and 15 kg/L")
    .optional(),
  clr: z.number().min(0).max(50, "CLR must be between 0 and 50").optional(),
  notes: z.string().optional(),
  recordedAt: z.date(),
});

interface MilkIntakeFormProps {
  onSuccess?: () => void;
  initialData?: Partial<MilkIntakeFormData>;
}

const normalizeOptional = (value?: string | null) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export function MilkIntakeForm({
  onSuccess,
  initialData,
}: MilkIntakeFormProps) {
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const createCollectionMutation = useCreateCollection();
  const createSupplier = useCreateSupplier();
  const {
    data: suppliersData,
    isLoading: suppliersLoading,
    error: suppliersError,
    refetch: refetchSuppliers,
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
      ratePerFat: initialData?.ratePerFat ?? 60,
      ratePerSnf: initialData?.ratePerSnf,
      collectionTime:
        initialData?.collectionTime ?? format(new Date(), "HH:mm"),
      quantity: initialData?.quantity ?? 0,
      fat: initialData?.fat ?? 0,
      snf: initialData?.snf,
      clr: initialData?.clr,
      notes: initialData?.notes,
      recordedAt: initialData?.recordedAt ?? new Date(),
    },
  });

  const fat = watch("fat");
  const snf = watch("snf");
  const quantity = watch("quantity");
  const ratePerFat = watch("ratePerFat");
  const ratePerSnf = watch("ratePerSnf");
  const recordedAt = watch("recordedAt");

  // Milk price calculation (same formula as backend):
  // price_per_liter = (fat × rate_per_fat) + (snf × rate_per_snf)
  // total_amount = quantity × price_per_liter
  const pricePerLiter = useMemo(() => {
    const f = Number(fat) || 0;
    const s = Number(snf) || 0;
    const rpf = Number(ratePerFat) || 0;
    const rps = Number(ratePerSnf) || 0;
    return f * rpf + s * rps;
  }, [fat, snf, ratePerFat, ratePerSnf]);

  const totalAmount = useMemo(() => {
    const q = Number(quantity) || 0;
    return q * pricePerLiter;
  }, [quantity, pricePerLiter]);

  const category = useMemo(() => {
    if (!fat) {
      return null;
    }
    if (fat >= 8 && fat <= 9) {
      return "premium";
    }
    if (fat >= 4 && fat <= 5) {
      return "standard";
    }
    return "other";
  }, [fat]);

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
      fat: data.fat.toFixed(2),
      snf: (data.snf ?? 0).toFixed(2),
      clr: (data.clr ?? 0).toFixed(1),
      rate_per_fat: data.ratePerFat.toFixed(2),
      rate_per_snf: Number(data.ratePerSnf ?? 0).toFixed(2),
      notes: data.notes,
    };

    await createCollectionMutation.mutateAsync(payload);
    onSuccess?.();
  };

  const handleCreateSupplier = async (values: SupplierFormValues) => {
    try {
      const created = await createSupplier.mutateAsync({
        supplier_id: values.supplier_id,
        name: values.name,
        supplier_type: values.supplier_type,
        status: values.status,
        phone: values.phone,
        alternate_phone: normalizeOptional(values.alternate_phone),
        email: normalizeOptional(values.email),
        address: values.address,
        route_name: values.route_name,
        collection_time: values.collection_time,
        payment_cycle: values.payment_cycle,
        bank_name: normalizeOptional(values.bank_name),
        account_number: normalizeOptional(values.account_number),
        ifsc_code: normalizeOptional(values.ifsc_code),
        notes: normalizeOptional(values.notes),
      });
      toast.success("Supplier created successfully");
      setIsSupplierModalOpen(false);
      await refetchSuppliers();
      setValue("supplierId", created.id, { shouldDirty: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
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
                categoryClasses[category],
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
          <div className="flex items-center justify-between gap-2">
            <Label className="flex items-center gap-2">
              <MilkIcon className="h-4 w-4 text-dairy-blue" />
              Supplier *
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1"
              onClick={() => setIsSupplierModalOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              Add supplier
            </Button>
          </div>
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
                        Use "Add supplier" to create one now
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
          <Label htmlFor="ratePerFat" className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-dairy-charcoal" />
            Fat Rate (₹) *
          </Label>
          <Input
            id="ratePerFat"
            type="number"
            step="0.1"
            placeholder="60.0"
            {...register("ratePerFat", { valueAsNumber: true })}
            className="h-12"
          />
          {errors.ratePerFat ? (
            <p className="text-sm text-red-600">{errors.ratePerFat.message}</p>
          ) : null}
        </motion.div>

        <motion.div className="space-y-2" variants={staggerItem}>
          <Label htmlFor="ratePerSnf" className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-dairy-charcoal" />
            SNF Rate (₹)
          </Label>
          <Input
            id="ratePerSnf"
            type="number"
            step="0.1"
            placeholder="10.0"
            {...register("ratePerSnf", {
              setValueAs: (value) =>
                value === "" || Number.isNaN(Number(value))
                  ? undefined
                  : Number(value),
            })}
            className="h-12"
          />
          {errors.ratePerSnf ? (
            <p className="text-sm text-red-600">{errors.ratePerSnf.message}</p>
          ) : null}
        </motion.div>

        <motion.div className="space-y-2" variants={staggerItem}>
          <Label htmlFor="fat" className="flex items-center gap-2">
            <Droplet className="h-4 w-4 text-dairy-orange" />
            Fat (kg/L) *
          </Label>
          <Input
            id="fat"
            type="number"
            step="0.1"
            placeholder="4.5"
            {...register("fat", { valueAsNumber: true })}
            className="h-12"
          />
          {errors.fat ? (
            <p className="text-sm text-red-600">{errors.fat.message}</p>
          ) : null}
        </motion.div>

        <motion.div className="space-y-2" variants={staggerItem}>
          <Label htmlFor="snf" className="flex items-center gap-2">
            <Droplet className="h-4 w-4 text-dairy-green" />
            SNF (kg/L)
          </Label>
          <Input
            id="snf"
            type="number"
            step="0.1"
            placeholder="8.5"
            {...register("snf", { valueAsNumber: true })}
            className="h-12"
          />
          {errors.snf ? (
            <p className="text-sm text-red-600">{errors.snf.message}</p>
          ) : null}
        </motion.div>

        <motion.div className="space-y-2" variants={staggerItem}>
          <Label htmlFor="clr" className="flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-red-500" />
            CLR (Density)
          </Label>
          <Input
            id="clr"
            type="number"
            step="0.1"
            placeholder="28.0"
            {...register("clr", { valueAsNumber: true })}
            className="h-12"
          />
          {errors.clr ? (
            <p className="text-sm text-red-600">{errors.clr.message}</p>
          ) : null}
        </motion.div>

        {/* Calculated Price Preview */}
        {(pricePerLiter > 0 || totalAmount > 0) && (
          <motion.div
            className="md:col-span-2"
            variants={staggerItem}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <IndianRupee className="h-5 w-5 text-green-700" />
                <span className="text-sm font-semibold text-green-800">
                  Milk Price Calculation
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-md bg-white p-3 text-center shadow-sm">
                  <p className="text-xs text-muted-foreground">
                    Price per Liter
                  </p>
                  <p className="text-lg font-bold text-green-700">
                    ₹{pricePerLiter.toFixed(2)}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    ({Number(fat) || 0} × ₹{Number(ratePerFat) || 0})
                    {(Number(snf) || 0) > 0 &&
                      ` + (${Number(snf) || 0} × ₹${Number(ratePerSnf) || 0})`}
                  </p>
                </div>
                <div className="rounded-md bg-white p-3 text-center shadow-sm">
                  <p className="text-xs text-muted-foreground">Quantity</p>
                  <p className="text-lg font-bold text-blue-700">
                    {(Number(quantity) || 0).toFixed(2)} L
                  </p>
                </div>
                <div className="rounded-md bg-white p-3 text-center shadow-sm border-2 border-green-300">
                  <p className="text-xs text-muted-foreground">Total Amount</p>
                  <p className="text-xl font-bold text-green-800">
                    ₹{totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

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
                  !recordedAt && "text-gray-400",
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

      <SupplierFormModal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        onSubmit={handleCreateSupplier}
        loading={createSupplier.isPending}
      />

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
