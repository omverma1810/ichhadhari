"use client";

import { useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Calendar, Users, AlertTriangle } from "lucide-react";
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
  useCreateBatch,
  useProducts,
  useWorkers,
} from "@/lib/hooks/useProduction";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { BatchIcon, MilkDrop } from "@/components/icons";
import { staggerContainer, staggerItem } from "@/lib/utils/animations";
import { formatNumber } from "@/lib/utils/formatters";
import type { BatchFormData } from "@/types/production";

const batchSchema = z.object({
  productId: z.string().min(1, "Please select a product"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  assignedWorkerIds: z
    .array(z.string())
    .min(1, "Please assign at least one worker"),
  scheduledStartDate: z.date(),
  priority: z.enum(["low", "medium", "high"]),
  notes: z.string().optional(),
});

interface BatchFormProps {
  onSuccess?: () => void;
  initialData?: Partial<BatchFormData>;
}

const toDateTimeLocal = (date: Date | undefined): string => {
  if (!date) {
    return "";
  }
  const pad = (value: number) => String(value).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export function BatchForm({ onSuccess, initialData }: BatchFormProps) {
  const createMutation = useCreateBatch();
  const { data: productsData } = useProducts({ limit: 100 });
  const { data: workers } = useWorkers();

  type BatchFormValues = z.infer<typeof batchSchema>;

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<BatchFormValues>({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      productId: initialData?.productId ?? "",
      quantity: initialData?.quantity ?? 1,
      assignedWorkerIds: initialData?.assignedWorkerIds ?? [],
      scheduledStartDate: initialData?.scheduledStartDate ?? new Date(),
      priority: initialData?.priority ?? "medium",
      notes: initialData?.notes ?? "",
    },
  });

  const selectedProductId = watch("productId");
  const quantity = watch("quantity");

  const selectedProduct = useMemo(
    () =>
      productsData?.results.find((product) => product.id === selectedProductId),
    [productsData?.results, selectedProductId]
  );

  const milkRequired =
    selectedProduct && quantity
      ? selectedProduct.milkRequirementPerUnit * quantity
      : 0;

  const onSubmit = async (data: BatchFormValues) => {
    const payload: BatchFormData = {
      productId: data.productId,
      quantity: data.quantity,
      assignedWorkerIds: data.assignedWorkerIds,
      scheduledStartDate: data.scheduledStartDate,
      priority: data.priority,
      notes: data.notes,
    };

    await createMutation.mutateAsync(payload);
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
      <motion.div className="space-y-2" variants={staggerItem}>
        <Label htmlFor="productId" className="flex items-center gap-2">
          <BatchIcon className="w-4 h-4 text-dairy-blue" />
          Select Product *
        </Label>
        <Controller
          control={control}
          name="productId"
          render={({ field }) => (
            <Select
              onValueChange={field.onChange}
              value={field.value || undefined}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Choose a product to produce" />
              </SelectTrigger>
              <SelectContent>
                {productsData?.results.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{product.name}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({product.category})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.productId && (
          <p className="text-sm text-red-600">{errors.productId.message}</p>
        )}
      </motion.div>

      <motion.div className="space-y-2" variants={staggerItem}>
        <Label htmlFor="quantity">Quantity to Produce *</Label>
        <Input
          id="quantity"
          type="number"
          min="1"
          placeholder="0"
          {...register("quantity", { valueAsNumber: true })}
          className="h-12"
        />
        {errors.quantity && (
          <p className="text-sm text-red-600">{errors.quantity.message}</p>
        )}
      </motion.div>

      {selectedProduct && quantity > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <MilkDrop className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1">
                Milk Required
              </h4>
              <p className="text-2xl font-bold text-blue-600">
                {formatNumber(milkRequired)} Liters
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Expected yield:{" "}
                {formatNumber(selectedProduct.expectedYield * quantity)}{" "}
                {selectedProduct.yieldUnit}
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-2"
          >
            <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-orange-800 font-medium">
                Check Stock Availability
              </p>
              <p className="text-xs text-orange-700">
                Ensure sufficient milk stock before starting production
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}

      <motion.div className="space-y-2" variants={staggerItem}>
        <Label className="flex items-center gap-2">
          <Users className="w-4 h-4 text-dairy-green" />
          Assign Workers *
        </Label>
        <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
          {workers?.map((worker) => (
            <label
              key={worker.id}
              className="flex items-center gap-2 p-2 rounded hover:bg-white transition-colors cursor-pointer"
            >
              <input
                type="checkbox"
                value={worker.id}
                {...register("assignedWorkerIds")}
                className="w-4 h-4 text-dairy-blue rounded focus:ring-dairy-blue"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {worker.name}
                </p>
                <p className="text-xs text-gray-500">{worker.role}</p>
              </div>
            </label>
          ))}
        </div>
        {errors.assignedWorkerIds && (
          <p className="text-sm text-red-600">
            {errors.assignedWorkerIds.message}
          </p>
        )}
      </motion.div>

      <motion.div className="space-y-2" variants={staggerItem}>
        <Label htmlFor="scheduledStartDate" className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-dairy-orange" />
          Scheduled Start Date *
        </Label>
        <Controller
          control={control}
          name="scheduledStartDate"
          render={({ field }) => (
            <Input
              id="scheduledStartDate"
              type="datetime-local"
              value={toDateTimeLocal(field.value)}
              onChange={(event) => {
                const value = event.target.value;
                field.onChange(value ? new Date(value) : new Date());
              }}
              className="h-12"
            />
          )}
        />
        {errors.scheduledStartDate && (
          <p className="text-sm text-red-600">
            {errors.scheduledStartDate.message}
          </p>
        )}
      </motion.div>

      <motion.div className="space-y-2" variants={staggerItem}>
        <Label>Priority</Label>
        <div className="grid grid-cols-3 gap-3">
          {(["low", "medium", "high"] as const).map((priority) => (
            <motion.label
              key={priority}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="cursor-pointer"
            >
              <input
                type="radio"
                value={priority}
                {...register("priority")}
                className="peer sr-only"
              />
              <div className="p-3 text-center border-2 rounded-lg peer-checked:border-dairy-blue peer-checked:bg-dairy-blue/5 transition-all">
                <span className="font-medium capitalize">{priority}</span>
              </div>
            </motion.label>
          ))}
        </div>
      </motion.div>

      <motion.div className="space-y-2" variants={staggerItem}>
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Any special instructions or notes..."
          {...register("notes")}
          className="min-h-20"
        />
      </motion.div>

      <motion.div className="flex gap-3 pt-4" variants={staggerItem}>
        <motion.div
          className="flex-1"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full h-12 bg-gradient-to-r from-dairy-green to-green-600 hover:from-green-600 hover:to-dairy-green text-white font-medium"
          >
            {createMutation.isPending ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" className="text-white" />
                <span>Creating Batch...</span>
              </div>
            ) : (
              <span className="flex items-center gap-2">
                <BatchIcon className="w-4 h-4" />
                Create Production Batch
              </span>
            )}
          </Button>
        </motion.div>
      </motion.div>
    </motion.form>
  );
}
