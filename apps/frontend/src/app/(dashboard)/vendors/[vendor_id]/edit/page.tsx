"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  ArrowLeft,
  Building2,
  MapPin,
  CreditCard,
  Save,
  Loader2,
  AlertCircle,
  User,
  FileText,
} from "lucide-react";

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
import { useVendor, useUpdateVendor } from "@/hooks/api/useVendorsEmployees";
import type { UpdateVendorPayload, VendorCategory, VendorPaymentMethod, VendorStatus } from "@/types/api/vendors";

const vendorSchema = z.object({
  company_name: z.string().min(2, "Company name is required"),
  category: z.enum(["raw_material", "packaging", "equipment", "service", "other"]),
  contact_person: z.string().min(2, "Contact person is required"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  alternate_phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  website: z.string().optional(),
  billing_address: z.string().min(5, "Billing address is required"),
  shipping_address: z.string().optional(),
  gst_number: z.string().optional(),
  pan_number: z.string().optional(),
  company_registration_number: z.string().optional(),
  bank_name: z.string().optional(),
  account_number: z.string().optional(),
  ifsc_code: z.string().optional(),
  account_holder_name: z.string().optional(),
  credit_period_days: z.coerce.number().min(0).optional(),
  credit_limit: z.coerce.number().min(0).optional(),
  payment_method: z.enum(["cash", "cheque", "bank_transfer", "upi"]).optional(),
  discount_percentage: z.coerce.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
});

type VendorFormData = z.infer<typeof vendorSchema>;

const categoryLabels: Record<string, string> = {
  raw_material: "Raw Material",
  packaging: "Packaging",
  equipment: "Equipment",
  service: "Service",
  other: "Other",
};

const paymentMethodLabels: Record<string, string> = {
  cash: "Cash",
  cheque: "Cheque",
  bank_transfer: "Bank Transfer",
  upi: "UPI",
};

export default function EditVendorPage() {
  const params = useParams<{ vendor_id: string }>();
  const router = useRouter();
  const vendorId = params?.vendor_id ? parseInt(params.vendor_id) : 0;
  const isValidId = vendorId > 0;

  const { data: vendor, isLoading, isError } = useVendor(vendorId, isValidId);
  const updateVendor = useUpdateVendor();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
    reset,
  } = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
  });

  useEffect(() => {
    if (vendor) {
      reset({
        company_name: vendor.company_name || "",
        category: vendor.category as VendorCategory,
        contact_person: vendor.contact_person || "",
        phone: vendor.phone || "",
        alternate_phone: vendor.alternate_phone || "",
        email: vendor.email || "",
        website: vendor.website || "",
        billing_address: vendor.billing_address || "",
        shipping_address: vendor.shipping_address || "",
        gst_number: vendor.gst_number || "",
        pan_number: vendor.pan_number || "",
        company_registration_number: vendor.company_registration_number || "",
        bank_name: vendor.bank_name || "",
        account_number: vendor.account_number || "",
        ifsc_code: vendor.ifsc_code || "",
        account_holder_name: vendor.account_holder_name || "",
        credit_period_days: vendor.credit_period_days || 0,
        credit_limit: vendor.credit_limit || 0,
        payment_method: vendor.payment_method as VendorPaymentMethod,
        discount_percentage: vendor.discount_percentage || 0,
        notes: vendor.notes || "",
        status: vendor.status as VendorStatus,
      });
    }
  }, [vendor, reset]);

  const onSubmit = (data: VendorFormData) => {
    const payload: UpdateVendorPayload = {
      ...data,
      email: data.email || undefined,
    };
    updateVendor.mutate(
      { id: vendorId, data: payload },
      {
        onSuccess: () => {
          router.push(`/vendors/${vendorId}`);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#F4A920]" />
          <p className="mt-2 text-sm text-[#8B5A3C]">Loading vendor...</p>
        </div>
      </div>
    );
  }

  if (isError || !vendor) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="max-w-md border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              Vendor Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600">
              The vendor you are looking for could not be found.
            </p>
            <Button
              onClick={() => router.back()}
              className="mt-4"
              variant="outline"
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push(`/vendors/${vendorId}`)}
            className="mb-2 rounded-full hover:bg-[#F4A920]/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Vendor
          </Button>
          <h1 className="text-2xl font-bold text-[#5D4037] sm:text-3xl">
            Edit {vendor.company_name}
          </h1>
          <p className="text-sm text-[#8B5A3C]">
            Update vendor information and settings
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#F4A920]" />
              Basic Information
            </CardTitle>
            <CardDescription>Company details and classification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company_name">
                  Company Name <span className="text-red-500">*</span>
                </Label>
                <Input id="company_name" {...register("company_name")} placeholder="e.g., Shri Krishna Dairy" />
                {errors.company_name && <p className="text-sm text-red-600">{errors.company_name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watch("category")}
                  onValueChange={(v) => setValue("category", v as VendorCategory, { shouldDirty: true })}
                >
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-red-600">{errors.category.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={watch("status")}
                  onValueChange={(v) => setValue("status", v as VendorStatus, { shouldDirty: true })}
                >
                  <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-[#F4A920]" />
              Contact Information
            </CardTitle>
            <CardDescription>Contact person and reach details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contact_person">
                  Contact Person <span className="text-red-500">*</span>
                </Label>
                <Input id="contact_person" {...register("contact_person")} placeholder="e.g., Ramesh Kumar" />
                {errors.contact_person && <p className="text-sm text-red-600">{errors.contact_person.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone <span className="text-red-500">*</span>
                </Label>
                <Input id="phone" {...register("phone")} placeholder="+91 9876543210" />
                {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="alternate_phone">Alternate Phone</Label>
                <Input id="alternate_phone" {...register("alternate_phone")} placeholder="+91 9876543211" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} placeholder="contact@vendor.com" />
                {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" {...register("website")} placeholder="https://vendor.com" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#F4A920]" />
              Address
            </CardTitle>
            <CardDescription>Billing and shipping addresses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="billing_address">
                Billing Address <span className="text-red-500">*</span>
              </Label>
              <Textarea id="billing_address" {...register("billing_address")} placeholder="Enter full billing address" rows={2} />
              {errors.billing_address && <p className="text-sm text-red-600">{errors.billing_address.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="shipping_address">Shipping Address</Label>
              <Textarea id="shipping_address" {...register("shipping_address")} placeholder="Enter shipping address (if different)" rows={2} />
            </div>
          </CardContent>
        </Card>

        {/* Legal & Tax */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#F4A920]" />
              Legal & Tax Information
            </CardTitle>
            <CardDescription>GST, PAN, and registration details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="gst_number">GST Number</Label>
                <Input id="gst_number" {...register("gst_number")} placeholder="22AAAAA0000A1Z5" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pan_number">PAN Number</Label>
                <Input id="pan_number" {...register("pan_number")} placeholder="ABCDE1234F" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_registration_number">Registration No.</Label>
                <Input id="company_registration_number" {...register("company_registration_number")} placeholder="CIN/LLPIN" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Banking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[#F4A920]" />
              Banking Details
            </CardTitle>
            <CardDescription>Bank account for payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input id="bank_name" {...register("bank_name")} placeholder="e.g., State Bank of India" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account_holder_name">Account Holder</Label>
                <Input id="account_holder_name" {...register("account_holder_name")} placeholder="Account holder name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account_number">Account Number</Label>
                <Input id="account_number" {...register("account_number")} placeholder="1234567890" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ifsc_code">IFSC Code</Label>
                <Input id="ifsc_code" {...register("ifsc_code")} placeholder="SBIN0001234" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[#F4A920]" />
              Payment Terms
            </CardTitle>
            <CardDescription>Credit and payment settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="credit_period_days">Credit Period (days)</Label>
                <Input id="credit_period_days" type="number" {...register("credit_period_days")} placeholder="30" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="credit_limit">Credit Limit (\u20b9)</Label>
                <Input id="credit_limit" type="number" {...register("credit_limit")} placeholder="100000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select
                  value={watch("payment_method")}
                  onValueChange={(v) => setValue("payment_method", v as VendorPaymentMethod, { shouldDirty: true })}
                >
                  <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(paymentMethodLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount_percentage">Discount %</Label>
                <Input id="discount_percentage" type="number" step="0.01" {...register("discount_percentage")} placeholder="0" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea {...register("notes")} placeholder="Any additional notes about this vendor..." rows={3} />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/vendors/${vendorId}`)}
            disabled={updateVendor.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={updateVendor.isPending || !isDirty}
            className="bg-[#F4A920] hover:bg-[#F4A920]/90"
          >
            {updateVendor.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Update Vendor
              </>
            )}
          </Button>
        </div>
      </form>
    </section>
  );
}
