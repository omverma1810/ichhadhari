"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
  useInventoryItem,
  useUpdateInventoryItem,
} from "@/lib/hooks/api/useInventory";

const itemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.enum([
    "raw_material",
    "finished_goods",
    "packaging",
    "consumables",
  ]),
  supplier: z.string().optional(),
  storage_location: z.string().optional(),
  description: z.string().optional(),
  current_stock: z.number().min(0, "Stock cannot be negative"),
  unit: z.enum([
    "kg",
    "liter",
    "piece",
    "pack",
    "bag",
    "box",
    "dozen",
    "carton",
  ]),
  unit_price: z.number().min(0, "Price cannot be negative"),
  reorder_level: z.number().min(0, "Reorder level cannot be negative"),
  maximum_stock: z.number().min(0, "Maximum stock cannot be negative"),
});

type ItemFormData = z.infer<typeof itemSchema>;

export default function EditInventoryItemPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.id as string;

  const { data: item, isLoading: itemLoading } = useInventoryItem(
    Number(itemId),
  );
  const updateItemMutation = useUpdateInventoryItem();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
  });

  // Pre-populate form when item data loads
  useEffect(() => {
    if (item) {
      reset({
        name: item.name,
        category: item.category,
        supplier: item.supplier || "",
        storage_location: item.storage_location || "",
        description: item.description || "",
        current_stock: Number(item.current_stock || 0),
        unit: item.unit as any,
        unit_price: Number(item.unit_price || 0),
        reorder_level: Number(item.reorder_level || 0),
        maximum_stock: Number(item.maximum_stock || 0),
      });
    }
  }, [item, reset]);

  const onSubmit = (data: ItemFormData) => {
    updateItemMutation.mutate(
      { id: Number(itemId), data },
      {
        onSuccess: () => {
          router.push(`/inventory/items/${itemId}`);
        },
      },
    );
  };

  if (itemLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#F4A920] border-t-transparent"></div>
          <p className="text-[#8B5A3C]">Loading item...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600">Item not found</p>
          <Button
            onClick={() => router.push("/inventory/items")}
            className="mt-4"
          >
            Back to Items
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-4 p-4 sm:space-y-6 sm:p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4"
      >
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="-ml-2 w-fit text-[#8B5A3C] hover:text-[#5D4037]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-[#5D4037] sm:text-3xl">
            <Package className="h-6 w-6 text-[#F4A920] sm:h-8 sm:w-8" />
            Edit Item: {item.name}
          </h1>
          <p className="mt-1 text-sm text-[#8B5A3C] sm:text-base">
            Item Code: {item.item_code}
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
              <CardTitle>Item Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Item Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    {...register("name")}
                    className={errors.name ? "border-red-500" : ""}
                    placeholder="Enter item name"
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    defaultValue={item.category}
                    onValueChange={(value) =>
                      setValue("category", value as any)
                    }
                  >
                    <SelectTrigger
                      className={errors.category ? "border-red-500" : ""}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="raw_material">Raw Material</SelectItem>
                      <SelectItem value="finished_goods">
                        Finished Goods
                      </SelectItem>
                      <SelectItem value="packaging">Packaging</SelectItem>
                      <SelectItem value="consumables">Consumables</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-xs text-red-500">
                      {errors.category.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Supplier and Location */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier</Label>
                  <Input
                    id="supplier"
                    {...register("supplier")}
                    placeholder="Enter supplier name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storage_location">Storage Location</Label>
                  <Input
                    id="storage_location"
                    {...register("storage_location")}
                    placeholder="e.g., Warehouse A, Shelf 3"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Enter item description"
                  rows={3}
                />
              </div>

              {/* Stock Information */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="current_stock">
                    Current Stock <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="current_stock"
                    type="number"
                    step="0.01"
                    {...register("current_stock", { valueAsNumber: true })}
                    className={errors.current_stock ? "border-red-500" : ""}
                  />
                  {errors.current_stock && (
                    <p className="text-xs text-red-500">
                      {errors.current_stock.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">
                    Unit <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    defaultValue={item.unit}
                    onValueChange={(value) => setValue("unit", value as any)}
                  >
                    <SelectTrigger
                      className={errors.unit ? "border-red-500" : ""}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kilogram (kg)</SelectItem>
                      <SelectItem value="liter">Liter</SelectItem>
                      <SelectItem value="piece">Piece</SelectItem>
                      <SelectItem value="pack">Pack</SelectItem>
                      <SelectItem value="bag">Bag</SelectItem>
                      <SelectItem value="box">Box</SelectItem>
                      <SelectItem value="dozen">Dozen</SelectItem>
                      <SelectItem value="carton">Carton</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.unit && (
                    <p className="text-xs text-red-500">
                      {errors.unit.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit_price">
                    Unit Price (₹) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="unit_price"
                    type="number"
                    step="0.01"
                    {...register("unit_price", { valueAsNumber: true })}
                    className={errors.unit_price ? "border-red-500" : ""}
                  />
                  {errors.unit_price && (
                    <p className="text-xs text-red-500">
                      {errors.unit_price.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Reorder Levels */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="reorder_level">
                    Reorder Level <span className="text-red-500">*</span>
                    <Info className="ml-1 inline h-3 w-3 text-gray-400" />
                  </Label>
                  <Input
                    id="reorder_level"
                    type="number"
                    step="0.01"
                    {...register("reorder_level", { valueAsNumber: true })}
                    className={errors.reorder_level ? "border-red-500" : ""}
                  />
                  <p className="text-xs text-gray-500">
                    Alert when stock falls below this level
                  </p>
                  {errors.reorder_level && (
                    <p className="text-xs text-red-500">
                      {errors.reorder_level.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maximum_stock">
                    Maximum Stock <span className="text-red-500">*</span>
                    <Info className="ml-1 inline h-3 w-3 text-gray-400" />
                  </Label>
                  <Input
                    id="maximum_stock"
                    type="number"
                    step="0.01"
                    {...register("maximum_stock", { valueAsNumber: true })}
                    className={errors.maximum_stock ? "border-red-500" : ""}
                  />
                  <p className="text-xs text-gray-500">
                    Maximum storage capacity
                  </p>
                  {errors.maximum_stock && (
                    <p className="text-xs text-red-500">
                      {errors.maximum_stock.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
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
                  disabled={updateItemMutation.isPending}
                >
                  {updateItemMutation.isPending ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
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
