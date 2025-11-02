"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useCreateVendor } from "@/lib/hooks/api/useProcurement";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const vendorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  contact_person: z.string().min(1, "Contact person is required"),
  phone: z.string().regex(/^[0-9]{10}$/, "Invalid phone number"),
  email: z.string().email("Invalid email"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().regex(/^[0-9]{6}$/, "Invalid pincode"),
  milk_type: z.enum(["cow", "buffalo", "mixed"]),
  rate_per_liter: z.number().min(0, "Rate must be positive"),
  bank_account_number: z.string().optional(),
  ifsc_code: z.string().optional(),
  pan_number: z.string().optional(),
});

type VendorFormData = z.infer<typeof vendorSchema>;

export default function CreateVendorSimplePage() {
  const router = useRouter();
  const createVendor = useCreateVendor();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
  });

  const onSubmit = async (data: VendorFormData) => {
    try {
      await createVendor.mutateAsync(data);
      router.push("/vendors/list");
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/vendors/list">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Vendor</h1>
          <p className="text-gray-500 mt-1">Fill in the vendor details</p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6"
      >
        {/* Basic Information */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Vendor Name *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Enter vendor name"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="contact_person">Contact Person *</Label>
              <Input
                id="contact_person"
                {...register("contact_person")}
                placeholder="Enter contact person"
              />
              {errors.contact_person && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.contact_person.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="10-digit phone number"
              />
              {errors.phone && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="vendor@example.com"
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Address Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                {...register("address")}
                placeholder="Enter full address"
              />
              {errors.address && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.address.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="city">City *</Label>
              <Input id="city" {...register("city")} placeholder="City" />
              {errors.city && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.city.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="state">State *</Label>
              <Input id="state" {...register("state")} placeholder="State" />
              {errors.state && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.state.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="pincode">Pincode *</Label>
              <Input
                id="pincode"
                {...register("pincode")}
                placeholder="6-digit pincode"
              />
              {errors.pincode && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.pincode.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Milk Details */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Milk Supply Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="milk_type">Milk Type *</Label>
              <select
                id="milk_type"
                {...register("milk_type")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select milk type</option>
                <option value="cow">Cow Milk</option>
                <option value="buffalo">Buffalo Milk</option>
                <option value="mixed">Mixed</option>
              </select>
              {errors.milk_type && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.milk_type.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="rate_per_liter">Rate per Liter (₹) *</Label>
              <Input
                id="rate_per_liter"
                type="number"
                step="0.01"
                {...register("rate_per_liter", { valueAsNumber: true })}
                placeholder="Enter rate"
              />
              {errors.rate_per_liter && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.rate_per_liter.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Banking Details */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Banking Details (Optional)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bank_account_number">Bank Account Number</Label>
              <Input
                id="bank_account_number"
                {...register("bank_account_number")}
                placeholder="Account number"
              />
            </div>

            <div>
              <Label htmlFor="ifsc_code">IFSC Code</Label>
              <Input
                id="ifsc_code"
                {...register("ifsc_code")}
                placeholder="IFSC code"
              />
            </div>

            <div>
              <Label htmlFor="pan_number">PAN Number</Label>
              <Input
                id="pan_number"
                {...register("pan_number")}
                placeholder="PAN number"
              />
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center gap-4 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting || createVendor.isPending}
          >
            {createVendor.isPending ? "Creating..." : "Create Vendor"}
          </Button>
          <Link href="/vendors/list">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
