"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
} from "lucide-react";
import { format } from "date-fns";

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
});

type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>;

export default function CreatePurchaseOrderPage() {
  const router = useRouter();
  const [poDate, setPoDate] = useState<Date>(new Date());
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<Date>();

  const { data: vendorsData } = useVendors({ status: "active" });
  const createPO = useCreatePurchaseOrder();

  const vendors = vendorsData?.results || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      is_recurring: false,
    },
  });

  const isRecurring = watch("is_recurring");
  const recurrenceFrequency = watch("recurrence_frequency");

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
      },
      {
        onSuccess: () => {
          router.push("/vendors/purchase-orders");
        },
      }
    );
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="space-y-6"
    >
      <header className="flex items-center justify-between">
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
          <h1 className="text-3xl font-bold text-[#5D4037]">
            Create Purchase Order
          </h1>
          <p className="text-sm text-[#8B5A3C]">
            Create a new purchase order for vendor supplies
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                      {vendor.name} - {vendor.milk_type}
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
            <div className="grid gap-4 md:grid-cols-2">
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
                            format(date, "yyyy-MM-dd")
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
                      value as "daily" | "weekly" | "monthly"
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

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/vendors/purchase-orders")}
            disabled={createPO.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createPO.isPending}
            className="bg-[#F4A920] hover:bg-[#F4A920]/90"
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
