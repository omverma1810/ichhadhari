"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import {
  ArrowLeft,
  ShoppingCart,
  Building2,
  Calendar as CalendarIcon,
  MapPin,
  Save,
  Loader2,
  RefreshCcw,
  FileText,
  Plus,
  Trash2,
  Package,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

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
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useVendors } from "@/lib/hooks/api/useProcurement";
import { useCreatePurchaseOrder } from "@/lib/hooks/api/useProcurement";
import { useProducts } from "@/lib/hooks/api/useProduction";
import { formatNumber } from "@/lib/utils/formatters";
import { useVendorPrices } from "@/hooks/api/useVendorPricing";

// Schema for items
const purchaseOrderItemSchema = z.object({
  product_id: z.string().min(1, "Product is required"),
  item_name: z.string().min(1, "Item name is required"),
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
  unit: z.string().min(1, "Unit is required"),
  unit_price: z.number().min(0, "Unit price is required"),
  tax_percentage: z.number().min(0).max(100).default(0),
  discount_percentage: z.number().min(0).max(100).default(0),
});

const purchaseOrderSchema = z.object({
  vendor: z.string().min(1, "Vendor is required"),
  po_date: z.string().min(1, "PO date is required"),
  expected_delivery_date: z
    .string()
    .min(1, "Expected delivery date is required"),
  delivery_address: z.string().min(5, "Delivery address is required"),
  shipping_method: z.string().optional(),
  terms_and_conditions: z.string().optional(),
  notes: z.string().optional(),
  is_recurring: z.boolean().optional(),
  recurrence_frequency: z.enum(["daily", "weekly", "monthly"]).optional(),
  items: z
    .array(purchaseOrderItemSchema)
    .min(1, "At least one item is required"),
});

type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>;

export default function CreatePurchaseOrderPage() {
  const router = useRouter();
  const [poDate, setPoDate] = useState<Date>(new Date());
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<Date>();

  const { data: vendorsData } = useVendors({ status: "active" });
  const { data: productsData } = useProducts();
  const createPO = useCreatePurchaseOrder();

  const vendors = vendorsData?.results || [];
  const products = productsData?.results || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderSchema) as any,
    defaultValues: {
      is_recurring: false,
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const isRecurring = watch("is_recurring");
  const recurrenceFrequency = watch("recurrence_frequency");
  const selectedVendorId = watch("vendor");
  const { data: vendorPricesData } = useVendorPrices(
    selectedVendorId ? parseInt(selectedVendorId) : 0,
  );
  const vendorPrices = vendorPricesData?.prices ?? [];
  const watchedItems = watch("items") || [];

  // Calculate totals
  const calculateLineTotal = useCallback((item: (typeof watchedItems)[0]) => {
    if (!item) return 0;
    const baseAmount = (item.quantity || 0) * (item.unit_price || 0);
    const discountAmount = baseAmount * ((item.discount_percentage || 0) / 100);
    const afterDiscount = baseAmount - discountAmount;
    const taxAmount = afterDiscount * ((item.tax_percentage || 0) / 100);
    return afterDiscount + taxAmount;
  }, []);

  const subtotal = watchedItems.reduce((acc, item) => {
    return acc + (item?.quantity || 0) * (item?.unit_price || 0);
  }, 0);

  const totalTax = watchedItems.reduce((acc, item) => {
    const baseAmount = (item?.quantity || 0) * (item?.unit_price || 0);
    const discountAmount =
      baseAmount * ((item?.discount_percentage || 0) / 100);
    const afterDiscount = baseAmount - discountAmount;
    return acc + afterDiscount * ((item?.tax_percentage || 0) / 100);
  }, 0);

  const totalDiscount = watchedItems.reduce((acc, item) => {
    const baseAmount = (item?.quantity || 0) * (item?.unit_price || 0);
    return acc + baseAmount * ((item?.discount_percentage || 0) / 100);
  }, 0);

  const grandTotal = subtotal - totalDiscount + totalTax;

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find((p) => p.id.toString() === productId);
    if (product) {
      setValue(`items.${index}.product_id`, productId);
      setValue(`items.${index}.item_name`, product.name);
      setValue(`items.${index}.unit`, product.unit);

      const vendorPrice = vendorPrices.find(
        (vp) => vp.product === product.id && vp.is_active,
      );
      if (vendorPrice) {
        setValue(`items.${index}.unit_price`, vendorPrice.vendor_price);
        return;
      }

      const fallbackPrice =
        Number(product.selling_price) || Number(product.cost_price) || 0;
      if (selectedVendorId) {
        toast.message("No special price found", {
          description:
            "Using the standard product price for this vendor instead.",
        });
      } else {
        toast.message("Select a vendor to apply special pricing", {
          description: "Using the standard product price for now.",
        });
      }
      setValue(`items.${index}.unit_price`, fallbackPrice);
    }
  };

  const addItem = () => {
    append({
      product_id: "",
      item_name: "",
      quantity: 1,
      unit: "piece",
      unit_price: 0,
      tax_percentage: 0,
      discount_percentage: 0,
    });
  };

  const onSubmit = (data: PurchaseOrderFormData) => {
    createPO.mutate(
      {
        vendor: parseInt(data.vendor),
        po_date: data.po_date,
        expected_delivery_date: data.expected_delivery_date,
        delivery_address: data.delivery_address,
        shipping_method: data.shipping_method || undefined,
        terms_and_conditions: data.terms_and_conditions || undefined,
        notes: data.notes || undefined,
        is_recurring: data.is_recurring,
        recurrence_frequency: data.is_recurring
          ? data.recurrence_frequency
          : undefined,
        items: data.items.map((item) => ({
          item_name: item.item_name,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unit_price,
          tax_percentage: item.tax_percentage,
          discount_percentage: item.discount_percentage,
        })),
      } as any,
      {
        onSuccess: () => {
          router.push("/vendors/purchase-orders");
        },
      },
    );
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="space-y-6"
    >
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/vendors/purchase-orders")}
            className="mb-2 rounded-full hover:bg-[#F4A920]/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Purchase Orders
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#5D4037]">
            Create Purchase Order
          </h1>
          <p className="text-sm text-[#8B5A3C]">
            Create a new purchase order for vendor supplies
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#F4A920]" />
              Vendor Information
            </CardTitle>
            <CardDescription>
              Select the vendor for this purchase order
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vendor">
                Vendor <span className="text-red-500">*</span>
              </Label>
              <Select onValueChange={(value) => setValue("vendor", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id.toString()}>
                      {vendor.company_name} - {vendor.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.vendor && (
                <p className="text-sm text-red-600">{errors.vendor.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-[#F4A920]" />
              Order Details
            </CardTitle>
            <CardDescription>
              Set order dates and delivery information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="po_date">
                  PO Date <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {poDate ? format(poDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={poDate}
                      onSelect={(date) => {
                        if (date) {
                          setPoDate(date);
                          setValue("po_date", format(date, "yyyy-MM-dd"));
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.po_date && (
                  <p className="text-sm text-red-600">
                    {errors.po_date.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected_delivery_date">
                  Expected Delivery Date <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expectedDeliveryDate
                        ? format(expectedDeliveryDate, "PPP")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={expectedDeliveryDate}
                      onSelect={(date) => {
                        if (date) {
                          setExpectedDeliveryDate(date);
                          setValue(
                            "expected_delivery_date",
                            format(date, "yyyy-MM-dd"),
                          );
                        }
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.expected_delivery_date && (
                  <p className="text-sm text-red-600">
                    {errors.expected_delivery_date.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shipping_method">Shipping Method</Label>
              <Input
                id="shipping_method"
                {...register("shipping_method")}
                placeholder="e.g., Express Courier, Standard Delivery"
              />
            </div>
          </CardContent>
        </Card>

        {/* Product Items Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-[#F4A920]" />
              Order Items
            </CardTitle>
            <CardDescription>
              Add products to this purchase order
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No items added yet</p>
                <p className="text-sm">
                  Click the button below to add products
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="border rounded-lg p-4 bg-gray-50 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-gray-700">
                        Item #{index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="space-y-2 sm:col-span-2">
                        <Label>
                          Product <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={watchedItems[index]?.product_id || ""}
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
                                value={product.id.toString()}
                              >
                                {product.name} - ₹
                                {formatNumber(product.cost_price || 0)}/
                                {product.unit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.items?.[index]?.product_id && (
                          <p className="text-sm text-red-600">
                            {errors.items[index]?.product_id?.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>
                          Quantity <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          {...register(`items.${index}.quantity`, {
                            valueAsNumber: true,
                          })}
                          placeholder="1"
                        />
                        {errors.items?.[index]?.quantity && (
                          <p className="text-sm text-red-600">
                            {errors.items[index]?.quantity?.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Unit</Label>
                        <Input
                          {...register(`items.${index}.unit`)}
                          placeholder="kg"
                          readOnly
                          className="bg-gray-100"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Unit Price (₹)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
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
                          min="0"
                          max="100"
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
                          min="0"
                          max="100"
                          {...register(`items.${index}.discount_percentage`, {
                            valueAsNumber: true,
                          })}
                          placeholder="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Line Total</Label>
                        <Input
                          value={`₹${formatNumber(calculateLineTotal(watchedItems[index]))}`}
                          readOnly
                          className="bg-gray-100 font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={addItem}
              className="w-full border-dashed border-2"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>

            {errors.items && typeof errors.items.message === "string" && (
              <p className="text-sm text-red-600 text-center">
                {errors.items.message}
              </p>
            )}

            {/* Order Summary */}
            {fields.length > 0 && (
              <div className="border-t pt-4 mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>₹{formatNumber(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount:</span>
                  <span className="text-red-600">
                    -₹{formatNumber(totalDiscount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax:</span>
                  <span>₹{formatNumber(totalTax)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span className="text-[#F4A920]">
                    ₹{formatNumber(grandTotal)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#F4A920]" />
              Delivery Address
            </CardTitle>
            <CardDescription>
              Where should this order be delivered?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="delivery_address">
                Delivery Address <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="delivery_address"
                {...register("delivery_address")}
                placeholder="Enter complete delivery address"
                rows={3}
              />
              {errors.delivery_address && (
                <p className="text-sm text-red-600">
                  {errors.delivery_address.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCcw className="h-5 w-5 text-[#F4A920]" />
              Recurring Order
            </CardTitle>
            <CardDescription>Set up automatic recurring orders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_recurring">Enable Recurring Orders</Label>
                <p className="text-sm text-[#8B5A3C]">
                  Automatically create orders at regular intervals
                </p>
              </div>
              <Switch
                id="is_recurring"
                checked={isRecurring || false}
                onCheckedChange={(checked) => setValue("is_recurring", checked)}
              />
            </div>

            {isRecurring && (
              <div className="space-y-2">
                <Label htmlFor="recurrence_frequency">
                  Recurrence Frequency <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={recurrenceFrequency}
                  onValueChange={(value) =>
                    setValue(
                      "recurrence_frequency",
                      value as "daily" | "weekly" | "monthly",
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
                {errors.recurrence_frequency && (
                  <p className="text-sm text-red-600">
                    {errors.recurrence_frequency.message}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#F4A920]" />
              Additional Information
            </CardTitle>
            <CardDescription>Terms, conditions, and notes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="terms_and_conditions">Terms and Conditions</Label>
              <Textarea
                id="terms_and_conditions"
                {...register("terms_and_conditions")}
                placeholder="Enter terms and conditions for this purchase order"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder="Any additional notes or instructions"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/vendors/purchase-orders")}
            disabled={createPO.isPending}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createPO.isPending || fields.length === 0}
            className="bg-[#F4A920] hover:bg-[#F4A920]/90 w-full sm:w-auto"
          >
            {createPO.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Purchase Order
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.section>
  );
}
