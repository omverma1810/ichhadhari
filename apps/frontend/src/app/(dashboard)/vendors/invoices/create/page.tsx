"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import {
  ArrowLeft,
  Building2,
  Calendar as CalendarIcon,
  Save,
  Loader2,
  FileText,
  Plus,
  Trash2,
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useVendors } from "@/lib/hooks/api/useProcurement";
import { invoiceService } from "@/services/invoiceService";
import { toast } from "sonner";

const invoiceItemSchema = z.object({
  item_description: z.string().min(1, "Item description is required"),
  quantity: z.string().min(1, "Quantity is required"),
  unit: z.string().min(1, "Unit is required"),
  unit_price: z.string().min(1, "Unit price is required"),
  tax_rate: z.string().default("0"),
  discount_percentage: z.string().default("0"),
});

const invoiceSchema = z.object({
  vendor: z.string().min(1, "Vendor is required"),
  invoice_date: z.string().min(1, "Invoice date is required"),
  due_date: z.string().min(1, "Due date is required"),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
  notes: z.string().default(""),
  terms_and_conditions: z.string().default(""),
  reference_number: z.string().default(""),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

export default function CreateInvoicePage() {
  const router = useRouter();
  const [invoiceDate, setInvoiceDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: vendorsData } = useVendors({ status: "active" });
  const vendors = vendorsData?.results || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema) as any,
    defaultValues: {
      vendor: "",
      invoice_date: format(new Date(), "yyyy-MM-dd"),
      due_date: "",
      items: [
        {
          item_description: "",
          quantity: "",
          unit: "pcs",
          unit_price: "",
          tax_rate: "0",
          discount_percentage: "0",
        },
      ],
      notes: "",
      terms_and_conditions: "",
      reference_number: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const items = watch("items");

  // Calculate totals
  const calculateLineTotal = (item: (typeof items)[0]) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unit_price) || 0;
    const tax = parseFloat(item.tax_rate || "0") || 0;
    const discount = parseFloat(item.discount_percentage || "0") || 0;

    const subtotal = qty * price;
    const taxAmount = (subtotal * tax) / 100;
    const discountAmount = (subtotal * discount) / 100;

    return subtotal + taxAmount - discountAmount;
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + calculateLineTotal(item),
    0,
  );

  const onSubmit = async (data: InvoiceFormData) => {
    setIsSubmitting(true);
    try {
      await invoiceService.createInvoice({
        vendor: parseInt(data.vendor),
        invoice_date: data.invoice_date,
        due_date: data.due_date,
        total_amount: totalAmount,
        items: data.items.map((item) => ({
          item_description: item.item_description,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unit_price,
          tax_rate: item.tax_rate || "0",
          discount_percentage: item.discount_percentage || "0",
        })),
        notes: data.notes || "",
        terms_and_conditions: data.terms_and_conditions || "",
        reference_number: data.reference_number || "",
      });

      toast.success("Invoice created successfully!");
      router.push("/vendors/invoices");
    } catch (error: any) {
      const errorMessage = error.message || "Failed to create invoice";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addItem = () => {
    append({
      item_description: "",
      quantity: "",
      unit: "pcs",
      unit_price: "",
      tax_rate: "0",
      discount_percentage: "0",
    });
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
            onClick={() => router.push("/vendors/invoices")}
            className="mb-2 rounded-full hover:bg-[#F4A920]/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Invoices
          </Button>
          <h1 className="text-3xl font-bold text-[#5D4037]">Create Invoice</h1>
          <p className="text-sm text-[#8B5A3C]">Create a new vendor invoice</p>
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
        {/* Vendor Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#F4A920]" />
              Vendor Information
            </CardTitle>
            <CardDescription>
              Select the vendor for this invoice
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
                      {vendor.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.vendor && (
                <p className="text-sm text-red-600">{errors.vendor.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference_number">Reference Number</Label>
              <Input
                id="reference_number"
                {...register("reference_number")}
                placeholder="e.g., PO-001 or external reference"
              />
            </div>
          </CardContent>
        </Card>

        {/* Invoice Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-[#F4A920]" />
              Invoice Details
            </CardTitle>
            <CardDescription>Set invoice and due dates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="invoice_date">
                  Invoice Date <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {invoiceDate ? format(invoiceDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={invoiceDate}
                      onSelect={(date) => {
                        if (date) {
                          setInvoiceDate(date);
                          setValue("invoice_date", format(date, "yyyy-MM-dd"));
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.invoice_date && (
                  <p className="text-sm text-red-600">
                    {errors.invoice_date.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="due_date">
                  Due Date <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={(date) => {
                        if (date) {
                          setDueDate(date);
                          setValue("due_date", format(date, "yyyy-MM-dd"));
                        }
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.due_date && (
                  <p className="text-sm text-red-600">
                    {errors.due_date.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#F4A920]" />
                Invoice Items
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </CardTitle>
            <CardDescription>Add items to the invoice</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid gap-4 p-4 border rounded-lg bg-gray-50"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Item {index + 1}
                  </span>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label>
                      Description <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      {...register(`items.${index}.item_description`)}
                      placeholder="Item description"
                    />
                    {errors.items?.[index]?.item_description && (
                      <p className="text-sm text-red-600">
                        {errors.items[index]?.item_description?.message}
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
                      {...register(`items.${index}.quantity`)}
                      placeholder="0"
                    />
                    {errors.items?.[index]?.quantity && (
                      <p className="text-sm text-red-600">
                        {errors.items[index]?.quantity?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Unit <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      defaultValue={field.unit}
                      onValueChange={(value) =>
                        setValue(`items.${index}.unit`, value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pcs">Pieces</SelectItem>
                        <SelectItem value="kg">Kilograms</SelectItem>
                        <SelectItem value="ltr">Liters</SelectItem>
                        <SelectItem value="box">Boxes</SelectItem>
                        <SelectItem value="unit">Units</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Unit Price (₹) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register(`items.${index}.unit_price`)}
                      placeholder="0.00"
                    />
                    {errors.items?.[index]?.unit_price && (
                      <p className="text-sm text-red-600">
                        {errors.items[index]?.unit_price?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Tax Rate (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register(`items.${index}.tax_rate`)}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Discount (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register(`items.${index}.discount_percentage`)}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Line Total</Label>
                    <div className="px-3 py-2 bg-white border rounded-md text-sm font-medium">
                      ₹{calculateLineTotal(items[index] || field).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {errors.items && !Array.isArray(errors.items) && (
              <p className="text-sm text-red-600">{errors.items.message}</p>
            )}

            {/* Total */}
            <div className="flex justify-end pt-4 border-t">
              <div className="text-right">
                <span className="text-sm text-gray-600">Total Amount: </span>
                <span className="text-xl font-bold text-[#5D4037]">
                  ₹{totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#F4A920]" />
              Additional Information
            </CardTitle>
            <CardDescription>Notes and terms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="terms_and_conditions">Terms and Conditions</Label>
              <Textarea
                id="terms_and_conditions"
                {...register("terms_and_conditions")}
                placeholder="Enter terms and conditions"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder="Any additional notes"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/vendors/invoices")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#F4A920] hover:bg-[#F4A920]/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Invoice
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.section>
  );
}
