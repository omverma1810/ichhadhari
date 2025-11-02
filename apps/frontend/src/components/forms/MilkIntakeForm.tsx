"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  Thermometer,
  Droplet,
  Scale,
  User,
  FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils/cn";
import { useCreateMilkIntake } from "@/lib/hooks/useMilk";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { MilkDrop } from "@/components/icons";
import { staggerContainer, staggerItem } from "@/lib/utils/animations";
import type { MilkIntakeFormData } from "@/types/milk";

const milkIntakeSchema = z.object({
  quantity: z.number().min(1, "Quantity must be at least 1 liter"),
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
  source: z.string().optional(),
  supplierName: z.string().optional(),
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
  const createMutation = useCreateMilkIntake();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<MilkIntakeFormData>({
    resolver: zodResolver(milkIntakeSchema),
    defaultValues: {
      recordedAt: new Date(),
      ...initialData,
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
    await createMutation.mutateAsync(data);
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

        <motion.div className="space-y-2" variants={staggerItem}>
          <Label htmlFor="source" className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-dairy-charcoal" />
            Source / Location
          </Label>
          <Input
            id="source"
            type="text"
            placeholder="e.g., Farm A, Route 1"
            {...register("source")}
            className="h-12"
          />
        </motion.div>

        <motion.div className="space-y-2" variants={staggerItem}>
          <Label htmlFor="supplierName" className="flex items-center gap-2">
            <User className="h-4 w-4 text-dairy-blue" />
            Supplier name
          </Label>
          <Input
            id="supplierName"
            type="text"
            placeholder="Enter supplier name"
            {...register("supplierName")}
            className="h-12"
          />
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
          {errors.recordedAt ? (
            <p className="text-sm text-red-600">{errors.recordedAt.message}</p>
          ) : null}
        </motion.div>
      </div>

      <motion.div className="space-y-2" variants={staggerItem}>
        <Label htmlFor="notes" className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-600" />
          Notes (optional)
        </Label>
        <Textarea
          id="notes"
          placeholder="Any additional information..."
          {...register("notes")}
          className="min-h-24"
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
            className="h-12 w-full bg-gradient-to-r from-dairy-blue to-dairy-darkBlue text-white hover:from-dairy-darkBlue hover:to-dairy-blue"
          >
            {createMutation.isPending ? (
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
