"use client";

import { useMemo } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, GripVertical, Thermometer, Clock } from "lucide-react";
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
import { useCreateProduct } from "@/lib/hooks/useProduction";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Recipe, MilkDrop } from "@/components/icons";
import { staggerContainer, staggerItem } from "@/lib/utils/animations";
import type { ProductFormData } from "@/types/production";

const productStepSchema = z.object({
  stepNumber: z.number().optional(),
  name: z.string().min(1, "Step name is required"),
  description: z.string().min(1, "Description is required"),
  estimatedTimeHours: z.number().min(0.1, "Time must be at least 0.1 hours"),
  temperature: z.number().optional(),
  temperatureUnit: z.enum(["celsius", "fahrenheit"]).optional(),
  instructions: z.string().optional(),
});

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  steps: z.array(productStepSchema).min(1, "At least one step is required"),
  milkRequirementPerUnit: z
    .number()
    .min(0.1, "Milk requirement must be positive"),
  expectedYield: z.number().min(0.1, "Expected yield must be positive"),
  yieldUnit: z.string().min(1, "Unit is required"),
  storageRequirements: z.string().min(1, "Storage requirements are required"),
  shelfLifeDays: z.number().min(1, "Shelf life must be at least 1 day"),
});

const PRODUCT_CATEGORIES = [
  "Curd",
  "Paneer",
  "Butter",
  "Cheese",
  "Ghee",
  "Buttermilk",
  "Yogurt",
  "Other",
];

interface ProductFormProps {
  onSuccess?: () => void;
  initialData?: Partial<ProductFormData>;
}

export function ProductForm({ onSuccess, initialData }: ProductFormProps) {
  const createMutation = useCreateProduct();

  type ProductFormValues = z.infer<typeof productSchema>;

  const defaultSteps = useMemo(
    () =>
      initialData?.steps && initialData.steps.length > 0
        ? initialData.steps.map((step, index) => ({
            ...step,
            stepNumber: step.stepNumber ?? index + 1,
          }))
        : [
            {
              stepNumber: 1,
              name: "",
              description: "",
              estimatedTimeHours: 1,
              temperatureUnit: "celsius" as const,
            },
          ],
    [initialData?.steps]
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      category: initialData?.category ?? "",
      description: initialData?.description ?? "",
      steps: defaultSteps,
      milkRequirementPerUnit: initialData?.milkRequirementPerUnit ?? 0,
      expectedYield: initialData?.expectedYield ?? 0,
      yieldUnit: initialData?.yieldUnit ?? "kg",
      storageRequirements: initialData?.storageRequirements ?? "",
      shelfLifeDays: initialData?.shelfLifeDays ?? 1,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "steps",
  });

  const onSubmit = async (data: ProductFormValues) => {
    const formattedData: ProductFormData = {
      name: data.name,
      category: data.category,
      description: data.description,
      steps: data.steps.map((step, index) => ({
        ...step,
        stepNumber: index + 1,
      })),
      milkRequirementPerUnit: data.milkRequirementPerUnit,
      expectedYield: data.expectedYield,
      yieldUnit: data.yieldUnit,
      storageRequirements: data.storageRequirements,
      shelfLifeDays: data.shelfLifeDays,
    };

    await createMutation.mutateAsync(formattedData);
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
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-dairy-charcoal flex items-center gap-2">
          <Recipe className="w-5 h-5 text-dairy-blue" />
          Basic Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div className="space-y-2" variants={staggerItem}>
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Premium Paneer"
              {...register("name")}
              className="h-11"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </motion.div>

          <motion.div className="space-y-2" variants={staggerItem}>
            <Label htmlFor="category">Category *</Label>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value || undefined}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category && (
              <p className="text-sm text-red-600">{errors.category.message}</p>
            )}
          </motion.div>
        </div>

        <motion.div className="space-y-2" variants={staggerItem}>
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            placeholder="Describe the product..."
            {...register("description")}
            className="min-h-20"
          />
          {errors.description && (
            <p className="text-sm text-red-600">{errors.description.message}</p>
          )}
        </motion.div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-dairy-charcoal flex items-center gap-2">
          <MilkDrop className="w-5 h-5 text-dairy-orange" />
          Production Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div className="space-y-2" variants={staggerItem}>
            <Label htmlFor="milkRequirementPerUnit">
              Milk Required (Liters/Unit) *
            </Label>
            <Input
              id="milkRequirementPerUnit"
              type="number"
              step="0.1"
              placeholder="0.0"
              {...register("milkRequirementPerUnit", { valueAsNumber: true })}
              className="h-11"
            />
            {errors.milkRequirementPerUnit && (
              <p className="text-sm text-red-600">
                {errors.milkRequirementPerUnit.message}
              </p>
            )}
          </motion.div>

          <motion.div className="space-y-2" variants={staggerItem}>
            <Label htmlFor="expectedYield">Expected Yield *</Label>
            <div className="flex gap-2">
              <Input
                id="expectedYield"
                type="number"
                step="0.1"
                placeholder="0.0"
                {...register("expectedYield", { valueAsNumber: true })}
                className="h-11 flex-1"
              />
              <Input
                id="yieldUnit"
                placeholder="Unit"
                {...register("yieldUnit")}
                className="h-11 w-24"
              />
            </div>
            {errors.expectedYield && (
              <p className="text-sm text-red-600">
                {errors.expectedYield.message}
              </p>
            )}
          </motion.div>

          <motion.div className="space-y-2" variants={staggerItem}>
            <Label htmlFor="storageRequirements">Storage Requirements *</Label>
            <Input
              id="storageRequirements"
              placeholder="e.g., Refrigerate at 4°C"
              {...register("storageRequirements")}
              className="h-11"
            />
            {errors.storageRequirements && (
              <p className="text-sm text-red-600">
                {errors.storageRequirements.message}
              </p>
            )}
          </motion.div>

          <motion.div className="space-y-2" variants={staggerItem}>
            <Label htmlFor="shelfLifeDays">Shelf Life (Days) *</Label>
            <Input
              id="shelfLifeDays"
              type="number"
              placeholder="0"
              {...register("shelfLifeDays", { valueAsNumber: true })}
              className="h-11"
            />
            {errors.shelfLifeDays && (
              <p className="text-sm text-red-600">
                {errors.shelfLifeDays.message}
              </p>
            )}
          </motion.div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-dairy-charcoal flex items-center gap-2">
            <Clock className="w-5 h-5 text-dairy-green" />
            Production Steps
          </h3>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  stepNumber: fields.length + 1,
                  name: "",
                  description: "",
                  estimatedTimeHours: 1,
                  temperatureUnit: "celsius",
                })
              }
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Step
            </Button>
          </motion.div>
        </div>

        <AnimatePresence mode="popLayout">
          {fields.map((field, index) => (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-dairy-blue">
                    Step {index + 1}
                  </span>
                </div>
                {fields.length > 1 && (
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Step Name *</Label>
                  <Input
                    placeholder="e.g., Heat Milk"
                    {...register(`steps.${index}.name`)}
                  />
                  {errors.steps?.[index]?.name && (
                    <p className="text-sm text-red-600">
                      {errors.steps[index]?.name?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Estimated Time (Hours) *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    {...register(`steps.${index}.estimatedTimeHours`, {
                      valueAsNumber: true,
                    })}
                  />
                  {errors.steps?.[index]?.estimatedTimeHours && (
                    <p className="text-sm text-red-600">
                      {errors.steps[index]?.estimatedTimeHours?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4" />
                    Temperature (Optional)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                      {...register(`steps.${index}.temperature`, {
                        valueAsNumber: true,
                      })}
                      className="flex-1"
                    />
                    <Controller
                      control={control}
                      name={`steps.${index}.temperatureUnit` as const}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || "celsius"}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue placeholder="°C" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="celsius">°C</SelectItem>
                            <SelectItem value="fahrenheit">°F</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description *</Label>
                  <Textarea
                    placeholder="Describe this step..."
                    {...register(`steps.${index}.description`)}
                    className="min-h-20"
                  />
                  {errors.steps?.[index]?.description && (
                    <p className="text-sm text-red-600">
                      {errors.steps[index]?.description?.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Special Instructions (Optional)</Label>
                <Textarea
                  placeholder="Any special instructions for this step..."
                  {...register(`steps.${index}.instructions`)}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {errors.steps?.root && (
          <p className="text-sm text-red-600">{errors.steps.root.message}</p>
        )}
      </div>

      <motion.div className="flex gap-3 pt-4" variants={staggerItem}>
        <motion.div
          className="flex-1"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full h-12 bg-gradient-to-r from-dairy-blue to-dairy-darkBlue hover:from-dairy-darkBlue hover:to-dairy-blue text-white font-medium"
          >
            {createMutation.isPending ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" className="text-white" />
                <span>Creating Product...</span>
              </div>
            ) : (
              <span className="flex items-center gap-2">
                <Recipe className="w-4 h-4" />
                Create Product
              </span>
            )}
          </Button>
        </motion.div>
      </motion.div>
    </motion.form>
  );
}
