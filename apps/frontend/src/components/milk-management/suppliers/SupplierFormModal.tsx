"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import type {
  Supplier,
  CreateSupplierPayload,
  PaymentCycle,
  SupplierStatus,
  SupplierType,
} from "@/types/api";

const paymentCycleOptions: PaymentCycle[] = [
  "daily",
  "weekly",
  "fortnightly",
  "monthly",
];

const supplierTypeOptions: SupplierType[] = [
  "milk_supplier",
  "equipment",
  "packaging",
  "chemical",
  "other",
];

const supplierTypeLabels: Record<SupplierType, string> = {
  milk_supplier: "Milk Supplier",
  equipment: "Equipment",
  packaging: "Packaging",
  chemical: "Chemical",
  other: "Other",
};

const supplierStatusOptions: SupplierStatus[] = [
  "active",
  "inactive",
  "suspended",
];

const supplierSchema = z
  .object({
    supplier_id: z.string().min(1, "Supplier ID is required"),
    name: z.string().min(1, "Name is required"),
    supplier_type: z.enum(supplierTypeOptions),
    status: z.enum(supplierStatusOptions),
    phone: z
      .string()
      .min(1, "Phone number is required")
      .regex(/^\+?[0-9]{10,15}$/u, "Phone number must be 10-15 digits"),
    alternate_phone: z
      .string()
      .refine(
        (value) => !value || /^\+?[0-9]{10,15}$/u.test(value),
        "Alternate phone must be 10-15 digits",
      ),
    email: z
      .string()
      .refine(
        (value) => !value || z.string().email().safeParse(value).success,
        "Invalid email address",
      ),
    address: z.string().min(1, "Address is required"),
    route_name: z.string().min(1, "Route is required"),
    collection_time: z
      .string()
      .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/u, "Use 24h format HH:MM"),
    payment_cycle: z.enum(paymentCycleOptions),
    bank_name: z.string().optional(),
    account_number: z.string().optional(),
    ifsc_code: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine(
    (values) => {
      if (["weekly", "fortnightly", "monthly"].includes(values.payment_cycle)) {
        return Boolean(values.bank_name) && Boolean(values.account_number);
      }
      return true;
    },
    {
      path: ["bank_name"],
      message: "Bank details required for selected payment cycle",
    },
  );

export type SupplierFormValues = z.infer<typeof supplierSchema>;

export interface SupplierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: SupplierFormValues) => Promise<void> | void;
  initialData?: Supplier | null;
  loading?: boolean;
}

const defaultValues: SupplierFormValues = {
  supplier_id: "",
  name: "",
  supplier_type: "milk_supplier",
  status: "active",
  phone: "",
  alternate_phone: "",
  email: "",
  address: "",
  route_name: "",
  collection_time: "06:00",
  payment_cycle: "monthly",
  bank_name: "",
  account_number: "",
  ifsc_code: "",
  notes: "",
};

const toTimeInputValue = (value?: string | null) => {
  if (!value) return "06:00";
  if (value.length === 5) return value;
  if (value.length >= 8) return value.slice(0, 5);
  return "06:00";
};

const toApiTimeValue = (value: string) =>
  value.length === 5 ? `${value}:00` : value;

export function SupplierFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  loading = false,
}: SupplierFormModalProps) {
  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues,
  });

  const isEditMode = useMemo(() => Boolean(initialData), [initialData]);

  useEffect(() => {
    if (initialData) {
      form.reset({
        supplier_id: initialData.supplier_id,
        name: initialData.name,
        supplier_type: initialData.supplier_type,
        status: initialData.status ?? "active",
        phone: initialData.phone,
        alternate_phone: initialData.alternate_phone ?? "",
        email: initialData.email ?? "",
        address: initialData.address,
        route_name: initialData.route_name,
        collection_time: toTimeInputValue(initialData.collection_time),
        payment_cycle: initialData.payment_cycle,
        bank_name: initialData.bank_name ?? "",
        account_number: initialData.account_number ?? "",
        ifsc_code: initialData.ifsc_code ?? "",
        notes: initialData.notes ?? "",
      });
    } else {
      form.reset(defaultValues);
    }
  }, [initialData, form]);

  const handleSubmit = form.handleSubmit(async (values: SupplierFormValues) => {
    const sanitize = (value?: string | null) => {
      if (!value) return undefined;
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    };

    const payload: SupplierFormValues = {
      ...values,
      alternate_phone: values.alternate_phone?.trim() ?? "",
      email: values.email?.trim() ?? "",
      collection_time: toApiTimeValue(values.collection_time),
      bank_name: sanitize(values.bank_name),
      account_number: sanitize(values.account_number),
      ifsc_code: sanitize(values.ifsc_code),
      notes: sanitize(values.notes),
    };

    await onSubmit(payload);
    if (!isEditMode) {
      form.reset(defaultValues);
    }
  });

  const isSubmitting = form.formState.isSubmitting || loading;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Supplier" : "Add Supplier"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update supplier details, banking information, or collection preferences."
              : "Create a new supplier profile with contact, routing, and payment preferences."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="grid gap-4 md:grid-cols-2">
            <FormField
              label="Supplier ID"
              error={form.formState.errors.supplier_id?.message}
            >
              <Input
                placeholder="SUP001"
                disabled={isEditMode || isSubmitting}
                {...form.register("supplier_id")}
              />
            </FormField>

            <FormField
              label="Supplier Name"
              error={form.formState.errors.name?.message}
            >
              <Input
                placeholder="John Farmer"
                disabled={isSubmitting}
                {...form.register("name")}
              />
            </FormField>

            <FormField label="Supplier Type">
              <Select
                value={form.watch("supplier_type")}
                onValueChange={(value: SupplierType) =>
                  form.setValue("supplier_type", value, { shouldDirty: true })
                }
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {supplierTypeOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {supplierTypeLabels[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Status">
              <Select
                value={form.watch("status")}
                onValueChange={(value: SupplierStatus) =>
                  form.setValue("status", value, { shouldDirty: true })
                }
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {supplierStatusOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              label="Primary Phone"
              error={form.formState.errors.phone?.message}
            >
              <Input
                placeholder="+919876543210"
                disabled={isSubmitting}
                {...form.register("phone")}
              />
            </FormField>

            <FormField
              label="Alternate Phone"
              error={form.formState.errors.alternate_phone?.message}
            >
              <Input
                placeholder="Optional"
                disabled={isSubmitting}
                {...form.register("alternate_phone")}
              />
            </FormField>

            <FormField
              label="Email"
              error={form.formState.errors.email?.message}
            >
              <Input
                placeholder="contact@supplier.com"
                type="email"
                disabled={isSubmitting}
                {...form.register("email")}
              />
            </FormField>

            <FormField
              label="Route"
              error={form.formState.errors.route_name?.message}
            >
              <Input
                placeholder="Route A"
                disabled={isSubmitting}
                {...form.register("route_name")}
              />
            </FormField>

            <FormField
              label="Collection Time"
              error={form.formState.errors.collection_time?.message}
            >
              <Input
                type="time"
                step={60}
                disabled={isSubmitting}
                {...form.register("collection_time")}
              />
            </FormField>

            <FormField label="Payment Cycle">
              <Select
                value={form.watch("payment_cycle")}
                onValueChange={(value: PaymentCycle) =>
                  form.setValue("payment_cycle", value, { shouldDirty: true })
                }
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select cycle" />
                </SelectTrigger>
                <SelectContent>
                  {paymentCycleOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </section>

          <FormField
            label="Address"
            error={form.formState.errors.address?.message}
          >
            <Textarea
              rows={3}
              placeholder="Full address"
              disabled={isSubmitting}
              {...form.register("address")}
            />
          </FormField>

          <section className="grid gap-4 md:grid-cols-3">
            <FormField
              label="Bank Name"
              error={form.formState.errors.bank_name?.message}
            >
              <Input
                placeholder="State Bank"
                disabled={isSubmitting}
                {...form.register("bank_name")}
              />
            </FormField>

            <FormField
              label="Account Number"
              error={form.formState.errors.account_number?.message}
            >
              <Input
                placeholder="XXXXXXXX1234"
                disabled={isSubmitting}
                {...form.register("account_number")}
              />
            </FormField>

            <FormField
              label="IFSC Code"
              error={form.formState.errors.ifsc_code?.message}
            >
              <Input
                placeholder="SBIN0001234"
                disabled={isSubmitting}
                {...form.register("ifsc_code")}
              />
            </FormField>
          </section>

          <FormField label="Notes">
            <Textarea
              rows={3}
              placeholder="Additional remarks..."
              disabled={isSubmitting}
              {...form.register("notes")}
            />
          </FormField>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : isEditMode
                  ? "Update Supplier"
                  : "Create Supplier"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      <div className="space-y-1">
        {children}
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}
