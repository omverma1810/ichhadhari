"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useVendors } from "@/lib/hooks/api/useProcurement";
import { useCreatePurchaseOrder } from "@/lib/hooks/api/useProcurement";
import { useProducts } from "@/lib/hooks/useProduction";
import { useVendorPrices } from "@/hooks/api/useVendorPricing";

const poItemSchema = z.object({
  item_name: z.string().min(1, "Item name is required"),
  description: z.string().optional(),
  quantity: z.number().positive("Quantity must be positive"),
  unit: z.string().min(1, "Unit is required"),
  unit_price: z.number().positive("Unit price must be positive"),
  tax_percentage: z.number().min(0).max(100),
  discount_percentage: z.number().min(0).max(100),
});

const poSchema = z.object({
  vendor: z.string().min(1, "Vendor is required"),
  po_date: z.string().min(1, "PO date is required"),
  expected_delivery_date: z
    .string()
    .min(1, "Expected delivery date is required"),
  delivery_address: z.string().min(1, "Delivery address is required"),
  shipping_method: z.string().optional(),
  terms_and_conditions: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(poItemSchema).min(1, "At least one item is required"),
});

type POFormData = z.infer<typeof poSchema>;

export default function CreatePurchaseOrderPage() {
  const router = useRouter();
  const { data: vendorsData } = useVendors({ page: 1 });
  const { data: productsData } = useProducts();
  const vendors = vendorsData?.results || [];
  const products = productsData?.results || [];
  const createPoMutation = useCreatePurchaseOrder();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<POFormData>({
    resolver: zodResolver(poSchema),
    defaultValues: {
      items: [
        {
          item_name: "",
          description: "",
          quantity: 1,
          unit: "kg",
          unit_price: 0,
          tax_percentage: 0,
          discount_percentage: 0,
        },
      ],
    },
  });

  const selectedVendorId = watch("vendor");
  const { data: vendorPricesData } = useVendorPrices(
    selectedVendorId ? parseInt(selectedVendorId) : 0,
  );
  const vendorPrices = vendorPricesData?.prices ?? [];

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find((p) => String(p.id) === productId);
    if (product) {
      setValue(`items.${index}.item_name`, product.name);
      setValue(`items.${index}.unit`, product.unit);

      // Auto-fill vendor-specific price if available, otherwise fall back to product selling price
      const vendorPrice = vendorPrices.find(
        (vp) => vp.product === product.id && vp.is_active,
      );
      if (vendorPrice) {
        setValue(`items.${index}.unit_price`, vendorPrice.vendor_price);
      } else if (product.selling_price) {
        setValue(`items.${index}.unit_price`, Number(product.selling_price));
      }
    }
  };

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const onSubmit = (data: POFormData) => {
    const formattedData = {
      ...data,
      vendor: parseInt(data.vendor),
      items: data.items.map((item) => ({
        ...item,
        inventory_item: undefined,
      })),
    };

    createPoMutation.mutate(formattedData as any, {
      onSuccess: () => {
        router.push("/inventory/purchase-orders");
      },
    });
  };

  return (
    <div className="min-h-screen space-y-4 p-4 sm:space-y-6 sm:p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="-ml-2 mb-2 text-[#8B5A3C] hover:text-[#5D4037]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-[#5D4037] sm:text-3xl">
          Create Purchase Order
        </h1>
        <p className="mt-1 text-sm text-[#8B5A3C] sm:text-base">
          Create a new purchase order for vendors
        </p>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="vendor">
                    Vendor <span className="text-red-500">*</span>
                  </Label>
                  <Select onValueChange={(value) => setValue("vendor", value)}>
                    <SelectTrigger
                      className={errors.vendor ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors.map((vendor: any) => (
                        <SelectItem
                          key={vendor.id}
                          value={vendor.id.toString()}
                        >
                          {vendor.company_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.vendor && (
                    <p className="text-xs text-red-500">
                      {errors.vendor.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="po_date">
                    PO Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="po_date"
                    type="date"
                    {...register("po_date")}
                    className={errors.po_date ? "border-red-500" : ""}
                  />
                  {errors.po_date && (
                    <p className="text-xs text-red-500">
                      {errors.po_date.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="expected_delivery_date">
                    Expected Delivery Date{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="expected_delivery_date"
                    type="date"
                    {...register("expected_delivery_date")}
                    className={
                      errors.expected_delivery_date ? "border-red-500" : ""
                    }
                  />
                  {errors.expected_delivery_date && (
                    <p className="text-xs text-red-500">
                      {errors.expected_delivery_date.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shipping_method">Shipping Method</Label>
                  <Input
                    id="shipping_method"
                    {...register("shipping_method")}
                    placeholder="e.g., Road Transport, Courier"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="delivery_address">
                  Delivery Address <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="delivery_address"
                  {...register("delivery_address")}
                  placeholder="Enter delivery address"
                  rows={3}
                  className={errors.delivery_address ? "border-red-500" : ""}
                />
                {errors.delivery_address && (
                  <p className="text-xs text-red-500">
                    {errors.delivery_address.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Line Items</CardTitle>
                <Button
                  type="button"
                  size="sm"
                  onClick={() =>
                    append({
                      item_name: "",
                      description: "",
                      quantity: 1,
                      unit: "kg",
                      unit_price: 0,
                      tax_percentage: 0,
                      discount_percentage: 0,
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="rounded-lg border p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="font-semibold">Item {index + 1}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Product *</Label>
                      <Select
                        onValueChange={(value) =>
                          handleProductSelect(index, value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem
                              key={product.id}
                              value={String(product.id)}
                            >
                              {product.name} ({product.unit})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <input
                        type="hidden"
                        {...register(`items.${index}.item_name`)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Quantity *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        {...register(`items.${index}.quantity`, {
                          valueAsNumber: true,
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Unit *</Label>
                      <Input
                        {...register(`items.${index}.unit`)}
                        placeholder="kg, liter, piece"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Unit Price *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        {...register(`items.${index}.unit_price`, {
                          valueAsNumber: true,
                        })}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Tax %</Label>
                      <Input
                        type="number"
                        step="0.01"
                        {...register(`items.${index}.tax_percentage`, {
                          valueAsNumber: true,
                        })}
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Discount %</Label>
                      <Input
                        type="number"
                        step="0.01"
                        {...register(`items.${index}.discount_percentage`, {
                          valueAsNumber: true,
                        })}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      {...register(`items.${index}.description`)}
                      placeholder="Item description"
                      rows={2}
                    />
                  </div>
                </div>
              ))}
              {errors.items && (
                <p className="text-xs text-red-500">
                  At least one item is required
                </p>
              )}
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="terms_and_conditions">Terms & Conditions</Label>
                <Textarea
                  id="terms_and_conditions"
                  {...register("terms_and_conditions")}
                  placeholder="Enter terms and conditions"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  {...register("notes")}
                  placeholder="Additional notes"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
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
              disabled={createPoMutation.isPending}
            >
              {createPoMutation.isPending ? (
                "Creating..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Purchase Order
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
