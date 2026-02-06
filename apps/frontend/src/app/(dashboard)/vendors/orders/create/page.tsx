"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  Calendar as CalendarIcon,
  Package,
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  useVendors,
  useCreatePurchaseOrder,
} from "@/hooks/api/useVendorsEmployees";
import type { CreatePurchaseOrderPayload } from "@/types/api/vendors";

const itemSchema = z.object({
  item_name: z.string().min(1, "Item name is required"),
  description: z.string().optional(),
  quantity: z.coerce.number().min(0.01, "Quantity required"),
  unit: z.string().min(1, "Unit is required"),
  unit_price: z.coerce.number().min(0.01, "Price required"),
  tax_percentage: z.coerce.number().min(0).default(0),
  discount_percentage: z.coerce.number().min(0).default(0),
});

const orderSchema = z.object({
  vendor: z.string().min(1, "Vendor is required"),
  po_date: z.date({ required_error: "PO date is required" }),
  expected_delivery_date: z.date({
    required_error: "Expected delivery date is required",
  }),
  delivery_address: z.string().min(5, "Delivery address is required"),
  shipping_method: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1, "At least one item is required"),
});

type OrderFormData = z.infer<typeof orderSchema>;

export default function CreateOrderPage() {
  const router = useRouter();
  const [poDate, setPoDate] = useState<Date>(new Date());
  const [deliveryDate, setDeliveryDate] = useState<Date>();

  const { data: vendorsData, isLoading: vendorsLoading } = useVendors({
    page_size: 200,
    status: "active",
  });
  const createOrder = useCreatePurchaseOrder();

  const vendors = vendorsData?.results ?? [];

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      po_date: new Date(),
      items: [
        {
          item_name: "",
          quantity: 1,
          unit: "kg",
          unit_price: 0,
          tax_percentage: 0,
          discount_percentage: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const items = watch("items");
  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0),
    0,
  );

  const onSubmit = (data: OrderFormData) => {
    const payload: CreatePurchaseOrderPayload = {
      vendor: parseInt(data.vendor),
      po_date: format(data.po_date, "yyyy-MM-dd"),
      expected_delivery_date: format(data.expected_delivery_date, "yyyy-MM-dd"),
      delivery_address: data.delivery_address,
      shipping_method: data.shipping_method,
      notes: data.notes,
      items: data.items.map((item) => ({
        item_name: item.item_name,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
        tax_percentage: item.tax_percentage,
        discount_percentage: item.discount_percentage,
      })),
    };

    createOrder.mutate(payload, {
      onSuccess: () => router.push("/vendors/orders"),
    });
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header className="flex items-center gap-3">
        <Link href="/vendors/orders">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">
            Create Purchase Order
          </h1>
          <p className="text-sm text-muted-foreground">
            Create a new purchase order for a vendor
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Vendor *</Label>
                <Select
                  onValueChange={(v) =>
                    setValue("vendor", v, { shouldValidate: true })
                  }
                  disabled={vendorsLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        vendorsLoading ? "Loading..." : "Select vendor"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map((v: any) => (
                      <SelectItem key={v.id} value={String(v.id)}>
                        {v.company_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.vendor && (
                  <p className="text-sm text-red-500">
                    {errors.vendor.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>PO Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={
                        "w-full justify-start text-left font-normal " +
                        (!poDate ? "text-muted-foreground" : "")
                      }
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {poDate ? format(poDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={poDate}
                      onSelect={(d) => {
                        if (d) {
                          setPoDate(d);
                          setValue("po_date", d, { shouldValidate: true });
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.po_date && (
                  <p className="text-sm text-red-500">
                    {errors.po_date.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Expected Delivery Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={
                        "w-full justify-start text-left font-normal " +
                        (!deliveryDate ? "text-muted-foreground" : "")
                      }
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {deliveryDate
                        ? format(deliveryDate, "PPP")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={deliveryDate}
                      onSelect={(d) => {
                        if (d) {
                          setDeliveryDate(d);
                          setValue("expected_delivery_date", d, {
                            shouldValidate: true,
                          });
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.expected_delivery_date && (
                  <p className="text-sm text-red-500">
                    {errors.expected_delivery_date.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Shipping Method</Label>
                <Input
                  {...register("shipping_method")}
                  placeholder="e.g., Road transport"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Delivery Address *</Label>
              <Textarea
                {...register("delivery_address")}
                placeholder="Enter delivery address..."
                rows={2}
              />
              {errors.delivery_address && (
                <p className="text-sm text-red-500">
                  {errors.delivery_address.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Order Items</CardTitle>
              <CardDescription>
                Add items to this purchase order
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  item_name: "",
                  quantity: 1,
                  unit: "kg",
                  unit_price: 0,
                  tax_percentage: 0,
                  discount_percentage: 0,
                })
              }
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Item
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-lg border p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Item {index + 1}
                  </span>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-xs">Item Name *</Label>
                    <Input
                      {...register("items." + index + ".item_name")}
                      placeholder="Item name"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Quantity *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register("items." + index + ".quantity")}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Unit</Label>
                    <Select
                      value={watch("items." + index + ".unit")}
                      onValueChange={(v) =>
                        setValue("items." + index + ".unit", v)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="liters">liters</SelectItem>
                        <SelectItem value="pieces">pieces</SelectItem>
                        <SelectItem value="packs">packs</SelectItem>
                        <SelectItem value="tons">tons</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Unit Price (\u20b9) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register("items." + index + ".unit_price")}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Tax %</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register("items." + index + ".tax_percentage")}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Discount %</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register(
                        "items." + index + ".discount_percentage",
                      )}
                    />
                  </div>
                  <div className="flex items-end">
                    <p className="text-sm font-medium pb-2">
                      Line: \u20b9
                      {(
                        (Number(items[index]?.quantity) || 0) *
                        (Number(items[index]?.unit_price) || 0)
                      ).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {errors.items && typeof errors.items.message === "string" && (
              <p className="text-sm text-red-500">{errors.items.message}</p>
            )}

            {/* Subtotal */}
            <div className="flex justify-end pt-2">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Subtotal</p>
                <p className="text-xl font-bold">
                  \u20b9{subtotal.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              {...register("notes")}
              placeholder="Additional notes..."
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link href="/vendors/orders">
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
            disabled={createOrder.isPending}
            className="w-full sm:w-auto"
          >
            {createOrder.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Package className="mr-2 h-4 w-4" />
                Create Order
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
