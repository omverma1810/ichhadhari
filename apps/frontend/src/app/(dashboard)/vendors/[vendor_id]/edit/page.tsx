"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
import { useVendor, useUpdateVendor } from "@/lib/hooks/api/useProcurement";

const vendorSchema = z.object({
  name: z.string().min(2, "Vendor name is required"),
  contact_person: z.string().min(2, "Contact person is required"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^\+?[\d\s-()]+$/, "Invalid phone number format"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z
    .string()
    .min(6, "Pincode must be 6 characters")
    .max(6, "Pincode must be 6 characters"),
  milk_type: z.enum(["cow", "buffalo", "mixed"]),
  rate_per_liter: z.string().min(1, "Rate per liter is required"),
  bank_account_number: z.string().optional(),
  ifsc_code: z.string().optional(),
  pan_number: z.string().optional(),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
});

type VendorFormData = z.infer<typeof vendorSchema>;

export default function EditVendorPage() {
  const params = useParams<{ vendor_id: string }>();
  const router = useRouter();
  const vendorId = params?.vendor_id ? parseInt(params.vendor_id) : 0;

  const { data: vendor, isLoading, isError } = useVendor(vendorId);
  const updateVendor = useUpdateVendor();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
  });

  const milkType = watch("milk_type");

  useEffect(() => {
    if (vendor) {
      setValue("name", vendor.name);
      setValue("contact_person", vendor.contact_person);
      setValue("phone", vendor.phone);
      setValue("email", vendor.email);
      setValue("address", vendor.address);
      setValue("city", vendor.city);
      setValue("state", vendor.state);
      setValue("pincode", vendor.pincode);
      setValue("milk_type", vendor.milk_type);
      setValue("rate_per_liter", vendor.rate_per_liter.toString());
      setValue("bank_account_number", vendor.bank_account_number || "");
      setValue("ifsc_code", vendor.ifsc_code || "");
      setValue("pan_number", vendor.pan_number || "");
      setValue("status", vendor.status);
    }
  }, [vendor, setValue]);

  const onSubmit = (data: VendorFormData) => {
    updateVendor.mutate(
      {
        id: vendorId,
        data: {
          ...data,
          rate_per_liter: parseFloat(data.rate_per_liter),
        },
      },
      {
        onSuccess: () => {
          router.push("/vendors/list");
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
              onClick={() => router.push("/vendors/list")}
              className="mt-4"
              variant="outline"
            >
              Back to Vendors
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            onClick={() => router.push("/vendors/list")}
            className="mb-2 rounded-full hover:bg-[#F4A920]/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Vendors
          </Button>
          <h1 className="text-3xl font-bold text-[#5D4037]">
            Edit {vendor.name}
          </h1>
          <p className="text-sm text-[#8B5A3C]">
            Update vendor information and settings
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#F4A920]" />
              Basic Information
            </CardTitle>
            <CardDescription>Core details about the vendor</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Vendor Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="e.g., Shri Krishna Dairy"
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_person">
                  Contact Person <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contact_person"
                  {...register("contact_person")}
                  placeholder="e.g., Ramesh Kumar"
                />
                {errors.contact_person && (
                  <p className="text-sm text-red-600">
                    {errors.contact_person.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  {...register("phone")}
                  placeholder="+91 9876543210"
                />
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="contact@vendor.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="milk_type">
                  Milk Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={milkType}
                  onValueChange={(value) =>
                    setValue("milk_type", value as VendorFormData["milk_type"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select milk type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cow">Cow Milk</SelectItem>
                    <SelectItem value="buffalo">Buffalo Milk</SelectItem>
                    <SelectItem value="mixed">Mixed Milk</SelectItem>
                  </SelectContent>
                </Select>
                {errors.milk_type && (
                  <p className="text-sm text-red-600">
                    {errors.milk_type.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="rate_per_liter">
                  Rate per Liter (₹) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="rate_per_liter"
                  type="number"
                  step="0.01"
                  {...register("rate_per_liter")}
                  placeholder="e.g., 45.50"
                />
                {errors.rate_per_liter && (
                  <p className="text-sm text-red-600">
                    {errors.rate_per_liter.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={watch("status")}
                  onValueChange={(value) =>
                    setValue("status", value as VendorFormData["status"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#F4A920]" />
              Address
            </CardTitle>
            <CardDescription>Physical location details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">
                Street Address <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="address"
                {...register("address")}
                placeholder="Enter complete street address"
                rows={2}
              />
              {errors.address && (
                <p className="text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="city">
                  City <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="city"
                  {...register("city")}
                  placeholder="e.g., Mumbai"
                />
                {errors.city && (
                  <p className="text-sm text-red-600">{errors.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">
                  State <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="state"
                  {...register("state")}
                  placeholder="e.g., Maharashtra"
                />
                {errors.state && (
                  <p className="text-sm text-red-600">{errors.state.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pincode">
                  Pincode <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="pincode"
                  {...register("pincode")}
                  placeholder="400001"
                  maxLength={6}
                />
                {errors.pincode && (
                  <p className="text-sm text-red-600">
                    {errors.pincode.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[#F4A920]" />
              Banking & Tax Details
            </CardTitle>
            <CardDescription>
              Bank account and tax information (optional)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="bank_account_number">Bank Account Number</Label>
                <Input
                  id="bank_account_number"
                  {...register("bank_account_number")}
                  placeholder="1234567890"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ifsc_code">IFSC Code</Label>
                <Input
                  id="ifsc_code"
                  {...register("ifsc_code")}
                  placeholder="SBIN0001234"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pan_number">PAN Number</Label>
                <Input
                  id="pan_number"
                  {...register("pan_number")}
                  placeholder="ABCDE1234F"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/vendors/list")}
            disabled={updateVendor.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={updateVendor.isPending}
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
    </motion.section>
  );
}
