"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, Package, Save, Loader2, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useCreateInventoryItem } from "@/lib/hooks/api/useInventory";

const itemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.enum([
    "raw_material",
    "finished_goods",
    "packaging",
    "consumables",
  ]),
  current_stock: z.string().min(1, "Current stock is required"),
  unit: z.string().min(1, "Unit is required"),
  reorder_level: z.string().min(1, "Reorder level is required"),
  maximum_stock: z.string().min(1, "Maximum stock is required"),
  storage_location: z.string().min(1, "Storage location is required"),
  unit_price: z.string().min(1, "Unit price is required"),
  supplier: z.string().optional(),
  description: z.string().optional(),
});

type ItemFormData = z.infer<typeof itemSchema>;

export default function CreateInventoryItemPage() {
  const router = useRouter();
  const createItem = useCreateInventoryItem();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      category: "raw_material",
      unit: "kg",
    },
  });

  const onSubmit = (data: ItemFormData) => {
    createItem.mutate(
      {
        name: data.name,
        category: data.category,
        current_stock: parseFloat(data.current_stock),
        unit: data.unit,
        reorder_level: parseFloat(data.reorder_level),
        maximum_stock: parseFloat(data.maximum_stock),
        storage_location: data.storage_location,
        unit_price: parseFloat(data.unit_price),
        supplier: data.supplier || "",
      },
      {
        onSuccess: () => {
          router.push("/inventory/items");
        },
      },
    );
  };

  return (
    <div className="min-h-screen space-y-4 p-4 sm:space-y-6 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/inventory/items")}
          className="mb-2 rounded-full hover:bg-[#F4A920]/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Items
        </Button>
        <h1 className="flex items-center gap-3 text-2xl font-bold text-[#5D4037] sm:text-3xl">
          <Package className="h-6 w-6 text-[#F4A920] sm:h-8 sm:w-8" />
          Add Inventory Item
        </h1>
        <p className="text-sm text-[#8B5A3C] sm:text-base">
          Create a new inventory item with stock details
        </p>
      </motion.div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 sm:space-y-6"
      >
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Enter the basic details of the inventory item
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Item Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="e.g., Raw Milk, Ghee, Packaging Box"
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select
                  defaultValue="raw_material"
                  onValueChange={(value) =>
                    setValue("category", value as ItemFormData["category"])
                  }
                >
                  <SelectTrigger>
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
                  <p className="text-sm text-red-600">
                    {errors.category.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  {...register("supplier")}
                  placeholder="Primary supplier name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="storage_location">
                  Storage Location <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="storage_location"
                  {...register("storage_location")}
                  placeholder="e.g., Warehouse A, Cold Storage 1"
                />
                {errors.storage_location && (
                  <p className="text-sm text-red-600">
                    {errors.storage_location.message}
                  </p>
                )}
              </div>

              <div className="col-span-1 space-y-2 sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Additional details about the item"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock & Pricing</CardTitle>
            <CardDescription>
              Set stock levels and pricing information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="current_stock">
                  Current Stock <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="current_stock"
                  type="number"
                  step="0.01"
                  {...register("current_stock")}
                  placeholder="0.00"
                />
                {errors.current_stock && (
                  <p className="text-sm text-red-600">
                    {errors.current_stock.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">
                  Unit <span className="text-red-500">*</span>
                </Label>
                <Select
                  defaultValue="kg"
                  onValueChange={(value) => setValue("unit", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilogram (kg)</SelectItem>
                    <SelectItem value="liter">Liter (L)</SelectItem>
                    <SelectItem value="piece">Piece (pcs)</SelectItem>
                    <SelectItem value="pack">Pack</SelectItem>
                    <SelectItem value="bag">Bag</SelectItem>
                    <SelectItem value="box">Box</SelectItem>
                  </SelectContent>
                </Select>
                {errors.unit && (
                  <p className="text-sm text-red-600">{errors.unit.message}</p>
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
                  {...register("unit_price")}
                  placeholder="0.00"
                />
                {errors.unit_price && (
                  <p className="text-sm text-red-600">
                    {errors.unit_price.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reorder_level">
                  Reorder Level <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="reorder_level"
                  type="number"
                  step="0.01"
                  {...register("reorder_level")}
                  placeholder="0.00"
                />
                {errors.reorder_level && (
                  <p className="text-sm text-red-600">
                    {errors.reorder_level.message}
                  </p>
                )}
                <p className="flex items-start gap-1 text-xs text-gray-500">
                  <Info className="mt-0.5 h-3 w-3 shrink-0" />
                  Alert when stock falls below this level
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maximum_stock">
                  Maximum Stock <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="maximum_stock"
                  type="number"
                  step="0.01"
                  {...register("maximum_stock")}
                  placeholder="0.00"
                />
                {errors.maximum_stock && (
                  <p className="text-sm text-red-600">
                    {errors.maximum_stock.message}
                  </p>
                )}
                <p className="flex items-start gap-1 text-xs text-gray-500">
                  <Info className="mt-0.5 h-3 w-3 shrink-0" />
                  Maximum capacity for this item
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/inventory/items")}
            disabled={createItem.isPending}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createItem.isPending}
            className="w-full bg-[#F4A920] hover:bg-[#F4A920]/90 sm:w-auto"
          >
            {createItem.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Item
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
