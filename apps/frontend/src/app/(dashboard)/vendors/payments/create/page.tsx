"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  ArrowLeft,
  Wallet,
  Building2,
  Calendar as CalendarIcon,
  DollarSign,
  CreditCard,
  Banknote,
  Smartphone,
  FileText,
  Save,
  Loader2,
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
import {
  useVendors,
  useCreateVendorPayment,
} from "@/lib/hooks/api/useProcurement";

const paymentSchema = z.object({
  vendor: z.string().min(1, "Vendor is required"),
  payment_date: z.string().min(1, "Payment date is required"),
  amount: z.string().min(1, "Amount is required"),
  payment_method: z.enum(["cash", "bank_transfer", "upi", "cheque"]),
  is_advance: z.boolean().optional(),
  transaction_reference: z.string().optional(),
  upi_transaction_id: z.string().optional(),
  cheque_number: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

const PAYMENT_METHOD_OPTIONS = [
  {
    value: "cash" as const,
    label: "Cash",
    icon: Banknote,
    description: "Cash payment",
  },
  {
    value: "bank_transfer" as const,
    label: "Bank Transfer",
    icon: CreditCard,
    description: "Direct bank transfer",
  },
  {
    value: "upi" as const,
    label: "UPI",
    icon: Smartphone,
    description: "UPI payment",
  },
  {
    value: "cheque" as const,
    label: "Cheque",
    icon: FileText,
    description: "Cheque payment",
  },
];

export default function CreateVendorPaymentPage() {
  const router = useRouter();
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());

  const { data: vendorsData } = useVendors({ status: "active" });
  const createPayment = useCreateVendorPayment();

  const vendors = vendorsData?.results || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      is_advance: false,
      payment_method: "cash",
    },
  });

  const paymentMethod = watch("payment_method");
  const isAdvance = watch("is_advance");

  const onSubmit = (data: PaymentFormData) => {
    createPayment.mutate(
      {
        vendor: parseInt(data.vendor),
        payment_date: data.payment_date,
        amount: parseFloat(data.amount),
        payment_method: data.payment_method,
        is_advance: data.is_advance || false,
        transaction_reference: data.transaction_reference || undefined,
        upi_transaction_id: data.upi_transaction_id || undefined,
        cheque_number: data.cheque_number || undefined,
        notes: data.notes || undefined,
      },
      {
        onSuccess: () => {
          router.push("/vendors/payments");
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
            onClick={() => router.push("/vendors/payments")}
            className="mb-2 rounded-full hover:bg-[#F4A920]/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Payments
          </Button>
          <h1 className="text-3xl font-bold text-[#5D4037]">
            Record Vendor Payment
          </h1>
          <p className="text-sm text-[#8B5A3C]">
            Record a new payment to vendor
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
              Select the vendor for this payment
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
              <DollarSign className="h-5 w-5 text-[#F4A920]" />
              Payment Details
            </CardTitle>
            <CardDescription>Enter payment amount and date</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="payment_date">
                  Payment Date <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {paymentDate ? format(paymentDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={paymentDate}
                      onSelect={(date) => {
                        if (date) {
                          setPaymentDate(date);
                          setValue("payment_date", format(date, "yyyy-MM-dd"));
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.payment_date && (
                  <p className="text-sm text-red-600">
                    {errors.payment_date.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">
                  Amount (₹) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  {...register("amount")}
                  placeholder="e.g., 50000.00"
                />
                {errors.amount && (
                  <p className="text-sm text-red-600">
                    {errors.amount.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="is_advance">Advance Payment</Label>
                <p className="text-sm text-[#8B5A3C]">
                  Mark this as an advance payment
                </p>
              </div>
              <Switch
                id="is_advance"
                checked={isAdvance || false}
                onCheckedChange={(checked) => setValue("is_advance", checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-[#F4A920]" />
              Payment Method
            </CardTitle>
            <CardDescription>Select how this payment was made</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {PAYMENT_METHOD_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = paymentMethod === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setValue("payment_method", option.value)}
                    className={`flex items-center space-x-3 rounded-lg border p-4 text-left transition-colors ${
                      isSelected
                        ? "border-[#F4A920] bg-[#F4A920]/10"
                        : "border-gray-200 hover:bg-[#F4A920]/5"
                    }`}
                  >
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                        isSelected
                          ? "border-[#F4A920] bg-[#F4A920]"
                          : "border-gray-300"
                      }`}
                    >
                      {isSelected && (
                        <div className="h-2 w-2 rounded-full bg-white" />
                      )}
                    </div>
                    <Icon className="h-5 w-5 text-[#F4A920]" />
                    <div>
                      <p className="font-medium">{option.label}</p>
                      <p className="text-sm text-[#8B5A3C]">
                        {option.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Conditional Transaction Reference Fields */}
            {paymentMethod === "bank_transfer" && (
              <div className="space-y-2">
                <Label htmlFor="transaction_reference">
                  Transaction Reference Number
                </Label>
                <Input
                  id="transaction_reference"
                  {...register("transaction_reference")}
                  placeholder="e.g., TXN123456789"
                />
              </div>
            )}

            {paymentMethod === "upi" && (
              <div className="space-y-2">
                <Label htmlFor="upi_transaction_id">UPI Transaction ID</Label>
                <Input
                  id="upi_transaction_id"
                  {...register("upi_transaction_id")}
                  placeholder="e.g., 123456789012"
                />
              </div>
            )}

            {paymentMethod === "cheque" && (
              <div className="space-y-2">
                <Label htmlFor="cheque_number">Cheque Number</Label>
                <Input
                  id="cheque_number"
                  {...register("cheque_number")}
                  placeholder="e.g., 123456"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#F4A920]" />
              Additional Notes
            </CardTitle>
            <CardDescription>
              Add any relevant notes or comments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder="Add any additional information about this payment"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/vendors/payments")}
            disabled={createPayment.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createPayment.isPending}
            className="bg-[#F4A920] hover:bg-[#F4A920]/90"
          >
            {createPayment.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Recording...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Record Payment
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.section>
  );
}
