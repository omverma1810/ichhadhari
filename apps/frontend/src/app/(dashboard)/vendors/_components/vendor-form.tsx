"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  useFieldArray,
  useForm,
  type FieldErrors,
  type FieldValues,
  type Path,
  type UseFormRegister,
  type Resolver,
} from "react-hook-form";
import { z } from "zod";
import {
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  ClipboardCopy,
  Loader2,
  Plus,
  Save,
  Trash2,
  Undo2,
  UserPlus,
} from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  useVendor,
  useCreateVendor,
  useUpdateVendor,
} from "@/hooks/api/useVendorsEmployees";
import type {
  Address,
  BankDetails,
  ContactPerson,
  PaymentMethod,
  Vendor,
  VendorStatus,
  VendorType,
} from "@/types/vendor";

const paymentMethodOptions = [
  "cheque",
  "neft",
  "cash",
  "bank_transfer",
] as const satisfies readonly PaymentMethod[];
const vendorTypeOptions = [
  "dairy_counter",
  "hotel",
  "cafe",
  "restaurant",
] as const satisfies readonly VendorType[];

const vendorTypeLabels: Record<VendorType, string> = {
  dairy_counter: "Dairy Counter",
  hotel: "Hotel",
  cafe: "Cafe",
  restaurant: "Restaurant",
};
const vendorStatusOptions = [
  "active",
  "inactive",
  "suspended",
  "blocked",
] as const satisfies readonly VendorStatus[];

const addressSchema = z.object({
  street: z.string().min(2, "Street is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postal_code: z.string().min(4, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
});

const contactPersonSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(8, "Phone number is required"),
  email: z.string().email("Valid email is required"),
  designation: z.string().min(2, "Designation is required"),
});

const bankDetailsSchema = z
  .object({
    bank_name: z.string().min(2, "Bank name is required"),
    account_number: z.string().min(6, "Account number is required"),
    ifsc_code: z
      .string()
      .toUpperCase()
      .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/i, "Enter a valid IFSC code"),
    account_holder: z.string().min(2, "Account holder name is required"),
    account_type: z.enum(["savings", "current"]),
  })
  .nullable()
  .optional();

const vendorFormSchema = z
  .object({
    company_name: z.string().min(2, "Company name is required"),
    vendor_type: z.enum(vendorTypeOptions),
    status: z.enum(vendorStatusOptions),
    phone: z.string().min(8, "Phone number is required"),
    email: z.string().email("Provide a valid email"),
    gst_number: z.string().optional(),
    pan_number: z.string().optional(),
    registration_number: z.string().optional(),
    billing_address: addressSchema,
    shipping_address: addressSchema,
    warehouse_enabled: z.boolean(),
    warehouse_address: addressSchema.nullable().optional(),
    contact_persons: z
      .array(contactPersonSchema)
      .min(1, "Add at least one contact person"),
    bank_details: bankDetailsSchema,
    credit_period_days: z.coerce.number().min(0).max(180),
    credit_limit: z.coerce.number().min(0),
    payment_methods: z
      .array(z.enum(paymentMethodOptions))
      .min(1, "Select at least one payment method"),
    preferred_payment_method: z
      .enum(paymentMethodOptions)
      .nullable()
      .optional(),
    discount_percentage: z.coerce.number().min(0).max(100),
    payment_terms_enforced: z.boolean(),
    notes: z.string().max(2000, "Limit to 2000 characters").optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.preferred_payment_method &&
      !data.payment_methods.includes(data.preferred_payment_method)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["preferred_payment_method"],
        message: "Preferred method must be one of the selected payment methods",
      });
    }

    if (data.warehouse_enabled) {
      if (!data.warehouse_address) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["warehouse_address"],
          message: "Provide warehouse address details",
        });
      } else {
        const parsed = addressSchema.safeParse(data.warehouse_address);
        if (!parsed.success) {
          parsed.error.issues.forEach((issue) => {
            ctx.addIssue({
              ...issue,
              path: ["warehouse_address", ...(issue.path ?? [])],
            });
          });
        }
      }
    }

    if (data.bank_details) {
      const parsed = bankDetailsSchema.unwrap().safeParse(data.bank_details);
      if (!parsed.success) {
        parsed.error.issues.forEach((issue) =>
          ctx.addIssue({
            ...issue,
            path: ["bank_details", ...(issue.path ?? [])],
          }),
        );
      }
    }
  });

export type VendorFormValues = z.infer<typeof vendorFormSchema>;

interface VendorFormProps {
  mode: "create" | "edit";
  vendor?: Vendor;
}

const createEmptyAddress = (): Address => ({
  street: "",
  city: "",
  state: "",
  postal_code: "",
  country: "India",
});

const createBlankContact = (): ContactPerson => ({
  id: "",
  name: "",
  phone: "",
  email: "",
  designation: "",
});

const LOCAL_STORAGE_KEY = "vendor-form:draft";
const LOCAL_STORAGE_AUTOSAVE_KEY = "vendor-form:auto-save";

export function VendorForm({ mode, vendor }: VendorFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(LOCAL_STORAGE_AUTOSAVE_KEY) === "true";
  });
  const initialValues = useMemo<VendorFormValues>(
    () => ({
      company_name: vendor?.company_name ?? "",
      vendor_type:
        (vendor as Vendor | null | undefined)?.vendor_type ??
        (vendor as any)?.category ??
        "dairy_counter",
      status: vendor?.status ?? "active",
      phone: vendor?.phone ?? "",
      email: vendor?.email ?? "",
      gst_number: vendor?.gst_number ?? "",
      pan_number: vendor?.pan_number ?? "",
      registration_number: vendor?.registration_number ?? "",
      billing_address: vendor?.billing_address ?? createEmptyAddress(),
      shipping_address: vendor?.shipping_address ?? createEmptyAddress(),
      warehouse_enabled: Boolean(vendor?.warehouse_address),
      warehouse_address: vendor?.warehouse_address ?? null,
      contact_persons: vendor?.contact_persons?.length
        ? vendor.contact_persons
        : [createBlankContact()],
      bank_details: vendor?.bank_details ?? null,
      credit_period_days: vendor?.credit_period_days ?? 30,
      credit_limit: vendor?.credit_limit ?? 100_000,
      payment_methods: vendor?.payment_methods ?? ["neft"],
      preferred_payment_method: vendor?.preferred_payment_method ?? null,
      discount_percentage: vendor?.discount_percentage ?? 0,
      payment_terms_enforced: vendor?.status !== "inactive",
      notes: "",
    }),
    [vendor],
  );

  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorFormSchema) as Resolver<VendorFormValues>,
    defaultValues: initialValues,
    mode: "onBlur",
  });

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
    reset,
    setFocus,
  } = form;

  const {
    fields: contactFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "contact_persons",
  });

  const warehouseEnabled = watch("warehouse_enabled");

  useEffect(() => {
    if (!warehouseEnabled) {
      setValue("warehouse_address", null, { shouldValidate: true });
    } else if (!watch("warehouse_address")) {
      setValue("warehouse_address", createEmptyAddress());
    }
  }, [warehouseEnabled, setValue, watch]);

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (autoSaveEnabled) {
      localStorage.setItem(LOCAL_STORAGE_AUTOSAVE_KEY, "true");
      const subscription = watch((value) => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(value));
      });
      return () => subscription.unsubscribe();
    }

    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem(LOCAL_STORAGE_AUTOSAVE_KEY);
    return undefined;
  }, [autoSaveEnabled, watch]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!autoSaveEnabled) return;
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as VendorFormValues;
        reset(parsed, { keepDirty: false });
        toast.info("Restored draft from auto-save");
      } catch (error) {
        console.error("Failed to parse cached vendor draft", error);
      }
    }
  }, [autoSaveEnabled, reset]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      // eslint-disable-next-line no-param-reassign
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const handleCopyAddress = (
    from: "billing_address" | "shipping_address",
    to: "billing_address" | "shipping_address" | "warehouse_address",
  ) => {
    const source = watch(from);
    if (!source) return;
    setValue(to, source, { shouldDirty: true, shouldValidate: true });
    toast.success(
      `Copied ${from.replace("_", " ")} to ${to.replace("_", " ")}`,
    );
  };

  const togglePaymentMethod = (method: PaymentMethod) => {
    const current = watch("payment_methods");
    if (current.includes(method)) {
      const next = current.filter((item) => item !== method);
      if (next.length === 0) {
        toast.error("At least one payment method is required");
        return;
      }
      setValue("payment_methods", next, {
        shouldDirty: true,
        shouldValidate: true,
      });
      if (watch("preferred_payment_method") === method) {
        setValue("preferred_payment_method", next[0] ?? null, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
    } else {
      setValue("payment_methods", [...current, method], {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  const createVendor = useCreateVendor();
  const updateVendor = useUpdateVendor();

  const onSubmit = handleSubmit(
    async (values) => {
      setIsSubmitting(true);
      try {
        const now = new Date().toISOString();
        const ensureContactId = (contact: ContactPerson, index: number) =>
          contact.id && contact.id.length > 0
            ? contact.id
            : `contact-${Date.now()}-${index}`;

        const sanitizedWarehouse = values.warehouse_enabled
          ? (values.warehouse_address ?? createEmptyAddress())
          : undefined;
        const sanitizedBank = values.bank_details ?? undefined;

        const preparedContacts = values.contact_persons.map(
          (contact, index) => ({
            ...contact,
            id: ensureContactId(contact as ContactPerson, index),
          }),
        );

        const vendorPayload: any = {
          company_name: values.company_name,
          category: values.vendor_type,
          status: values.status,
          contact_persons: preparedContacts,
          phone: values.phone,
          email: values.email,
          gst_number: values.gst_number || undefined,
          pan_number: values.pan_number || undefined,
          registration_number: values.registration_number || undefined,
          billing_address: values.billing_address,
          shipping_address: values.shipping_address,
          warehouse_address: sanitizedWarehouse,
          bank_details: sanitizedBank,
          credit_period_days: values.credit_period_days,
          credit_limit: values.credit_limit,
          payment_methods: values.payment_methods,
          preferred_payment_method:
            values.preferred_payment_method ?? undefined,
          discount_percentage: values.discount_percentage,
        };

        if (mode === "create") {
          const result = await createVendor.mutateAsync(vendorPayload);
          toast.success("Vendor created successfully");
          localStorage.removeItem(LOCAL_STORAGE_KEY);
          router.push(`/vendors/${(result as any)?.id ?? ""}`);
        } else if (mode === "edit" && vendor) {
          await updateVendor.mutateAsync({
            id: vendor.id as any,
            data: vendorPayload,
          });
          toast.success("Vendor details updated");
          router.refresh();
        }
      } catch (error) {
        console.error("Failed to submit vendor form", error);
        toast.error("Something went wrong. Try again later.");
      } finally {
        setIsSubmitting(false);
      }
    },
    (submitErrors) => {
      const firstPath = findFirstErrorPath(submitErrors);
      if (firstPath) {
        setFocus(firstPath as Path<VendorFormValues>);
      }
      toast.error("Please resolve the highlighted issues before saving");
    },
  );

  const handleRestoreDefaults = () => {
    reset(initialValues);
    toast.info("Form restored to last saved state");
  };

  const handleDelete = () => {
    if (mode !== "edit" || !vendor) return;
    toast.warning("Vendor archived (mock action)");
    router.push("/vendors");
  };

  const preferredPaymentMethod = watch("preferred_payment_method");

  return (
    <motion.form
      onSubmit={onSubmit}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-6"
    >
      <Card className="border-none bg-gradient-to-br from-[#FFF3D9] via-[#FFF9EC] to-[#FFFEF7] shadow-[0_20px_60px_rgba(244,169,32,0.25)]">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-2xl text-[#5D4037]">
              {mode === "create"
                ? "Add New Vendor"
                : `Edit ${vendor?.company_name ?? "Vendor"}`}
            </CardTitle>
            <CardDescription className="text-sm text-[#8B5A3C]/80">
              Capture complete vendor profile, payment preferences, and required
              compliance documents.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-[#8B5A3C]/80">
              <Switch
                checked={autoSaveEnabled}
                onCheckedChange={(checked) => {
                  setAutoSaveEnabled(checked);
                  if (!checked && typeof window !== "undefined") {
                    localStorage.removeItem(LOCAL_STORAGE_KEY);
                    localStorage.removeItem(LOCAL_STORAGE_AUTOSAVE_KEY);
                  }
                }}
              />
              <span>Auto-save draft</span>
            </div>
            {mode === "edit" ? (
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-[#F4A920]/40 text-[#8B5A3C] hover:border-[#F4A920] hover:bg-[#F4A920]/10"
                onClick={handleRestoreDefaults}
              >
                <Undo2 className="mr-2 size-4" />
                Restore
              </Button>
            ) : null}
          </div>
        </CardHeader>
      </Card>

      <SectionCard
        title="Business Information"
        description="Core vendor identity and compliance details"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <FormField label="Company Name" error={errors.company_name?.message}>
            <Input
              placeholder="Punjab Milk Cooperative"
              {...register("company_name")}
              className="rounded-xl border-[#F4A920]/50"
            />
          </FormField>
          <FormField label="Vendor Type" error={errors.vendor_type?.message}>
            <select
              {...register("vendor_type")}
              className="h-11 w-full rounded-xl border border-[#F4A920]/50 bg-white px-3 text-sm text-[#5D4037]"
            >
              {vendorTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {vendorTypeLabels[option]}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Status" error={errors.status?.message}>
            <select
              {...register("status")}
              className="h-11 w-full rounded-xl border border-[#F4A920]/50 bg-white px-3 text-sm text-[#5D4037]"
            >
              {vendorStatusOptions.map((option) => (
                <option key={option} value={option} className="capitalize">
                  {option.replace("_", " ")}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Phone" error={errors.phone?.message}>
            <Input
              placeholder="+91-98765-43210"
              {...register("phone")}
              className="rounded-xl border-[#F4A920]/50"
            />
          </FormField>
          <FormField label="Email" error={errors.email?.message}>
            <Input
              placeholder="contact@vendor.com"
              type="email"
              {...register("email")}
              className="rounded-xl border-[#F4A920]/50"
            />
          </FormField>
          <FormField label="GST Number" error={errors.gst_number?.message}>
            <Input
              placeholder="03AABCA5055K1Z0"
              {...register("gst_number")}
              className="uppercase rounded-xl border-[#F4A920]/50"
            />
          </FormField>
          <FormField label="PAN Number" error={errors.pan_number?.message}>
            <Input
              placeholder="AAAPA1234A"
              {...register("pan_number")}
              className="uppercase rounded-xl border-[#F4A920]/50"
            />
          </FormField>
          <FormField
            label="Registration Number"
            error={errors.registration_number?.message}
          >
            <Input
              placeholder="REG-2024-001"
              {...register("registration_number")}
              className="rounded-xl border-[#F4A920]/50"
            />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard
        title="Contact Persons"
        description="Primary contacts associated with this vendor"
      >
        <div className="space-y-4">
          {contactFields.map((field, index) => (
            <div
              key={field.id}
              className="rounded-2xl border border-[#F4A920]/30 bg-white p-4 shadow-[0_12px_30px_rgba(93,64,55,0.1)]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#5D4037]">
                  <BadgeCheck className="size-4 text-[#F4A920]" />
                  Contact #{index + 1}
                </div>
                {contactFields.length > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="rounded-full text-red-600 hover:bg-red-50"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                ) : null}
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <FormField
                  label="Full Name"
                  error={errors.contact_persons?.[index]?.name?.message}
                >
                  <Input
                    placeholder="Rajinder Singh"
                    {...register(`contact_persons.${index}.name` as const)}
                    className="rounded-xl border-[#F4A920]/40"
                  />
                </FormField>
                <FormField
                  label="Designation"
                  error={errors.contact_persons?.[index]?.designation?.message}
                >
                  <Input
                    placeholder="Operations Manager"
                    {...register(
                      `contact_persons.${index}.designation` as const,
                    )}
                    className="rounded-xl border-[#F4A920]/40"
                  />
                </FormField>
                <FormField
                  label="Phone"
                  error={errors.contact_persons?.[index]?.phone?.message}
                >
                  <Input
                    placeholder="+91-98765-43210"
                    {...register(`contact_persons.${index}.phone` as const)}
                    className="rounded-xl border-[#F4A920]/40"
                  />
                </FormField>
                <FormField
                  label="Email"
                  error={errors.contact_persons?.[index]?.email?.message}
                >
                  <Input
                    placeholder="name@vendor.com"
                    type="email"
                    {...register(`contact_persons.${index}.email` as const)}
                    className="rounded-xl border-[#F4A920]/40"
                  />
                </FormField>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            className="mt-2 w-full rounded-full border-[#F4A920]/40 text-[#8B5A3C] hover:border-[#F4A920] hover:bg-[#F4A920]/10"
            onClick={() => append(createBlankContact())}
          >
            <UserPlus className="mr-2 size-4" />
            Add Contact Person
          </Button>
        </div>
      </SectionCard>

      <SectionCard
        title="Addresses"
        description="Maintain billing, shipping, and optional warehouse locations"
      >
        <div className="grid gap-6 lg:grid-cols-3">
          <AddressFields
            label="Billing Address"
            prefix="billing_address"
            register={register}
            errors={errors.billing_address}
            onCopy={() =>
              handleCopyAddress("shipping_address", "billing_address")
            }
            copyLabel="Copy from shipping"
          />
          <AddressFields
            label="Shipping Address"
            prefix="shipping_address"
            register={register}
            errors={errors.shipping_address}
            onCopy={() =>
              handleCopyAddress("billing_address", "shipping_address")
            }
            copyLabel="Copy from billing"
          />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold uppercase tracking-wide text-[#8B5A3C]/70">
                Warehouse Address
              </Label>
              <div className="flex items-center gap-2 text-xs text-[#8B5A3C]/70">
                <Switch
                  checked={warehouseEnabled}
                  onCheckedChange={(checked) =>
                    setValue("warehouse_enabled", checked, {
                      shouldDirty: true,
                    })
                  }
                />
                Enable
              </div>
            </div>
            {warehouseEnabled ? (
              <AddressFields
                label=""
                prefix="warehouse_address"
                register={register}
                errors={
                  errors.warehouse_address as FieldErrors<Address> | undefined
                }
                onCopy={() =>
                  handleCopyAddress("billing_address", "warehouse_address")
                }
                copyLabel="Copy from billing"
                isNested
              />
            ) : (
              <p className="rounded-xl border border-dashed border-[#F4A920]/40 bg-[#FFFEF7] p-4 text-sm text-[#8B5A3C]/70">
                Enable warehouse address if vendor ships to a dedicated
                logistics hub.
              </p>
            )}
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Banking & Compliance"
        description="Banking coordinates and documentation"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            label="Bank Name"
            error={(errors.bank_details as any)?.bank_name?.message}
          >
            <Input
              placeholder="Punjab National Bank"
              {...register("bank_details.bank_name" as const)}
              className="rounded-xl border-[#F4A920]/40"
            />
          </FormField>
          <FormField
            label="Account Number"
            error={(errors.bank_details as any)?.account_number?.message}
          >
            <Input
              placeholder="0123456789"
              {...register("bank_details.account_number" as const)}
              className="rounded-xl border-[#F4A920]/40"
            />
          </FormField>
          <FormField
            label="IFSC Code"
            error={(errors.bank_details as any)?.ifsc_code?.message}
          >
            <Input
              placeholder="PUNB0012345"
              {...register("bank_details.ifsc_code" as const)}
              className="uppercase rounded-xl border-[#F4A920]/40"
            />
          </FormField>
          <FormField
            label="Account Holder"
            error={(errors.bank_details as any)?.account_holder?.message}
          >
            <Input
              placeholder="Punjab Milk Cooperative"
              {...register("bank_details.account_holder" as const)}
              className="rounded-xl border-[#F4A920]/40"
            />
          </FormField>
          <FormField
            label="Account Type"
            error={(errors.bank_details as any)?.account_type?.message}
          >
            <select
              {...register("bank_details.account_type" as const)}
              className="h-11 w-full rounded-xl border border-[#F4A920]/40 bg-white px-3 text-sm text-[#5D4037]"
            >
              <option value="current">Current</option>
              <option value="savings">Savings</option>
            </select>
          </FormField>
          <FormField
            label="Notes"
            error={errors.notes?.message}
            className="md:col-span-2"
          >
            <Textarea
              placeholder="Additional compliance or onboarding notes"
              rows={4}
              {...register("notes")}
              className="rounded-xl border-[#F4A920]/40"
            />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard
        title="Payment Terms"
        description="Credit parameters and accepted methods"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Credit Limit" error={errors.credit_limit?.message}>
            <Input
              type="number"
              min={0}
              {...register("credit_limit")}
              className="rounded-xl border-[#F4A920]/40"
            />
          </FormField>
          <FormField
            label="Credit Period (days)"
            error={errors.credit_period_days?.message}
          >
            <Input
              type="number"
              min={0}
              max={180}
              {...register("credit_period_days")}
              className="rounded-xl border-[#F4A920]/40"
            />
          </FormField>
          <FormField
            label="Discount Percentage"
            error={errors.discount_percentage?.message}
          >
            <Input
              type="number"
              min={0}
              max={100}
              {...register("discount_percentage")}
              className="rounded-xl border-[#F4A920]/40"
            />
          </FormField>
          <div>
            <Label className="text-sm font-semibold uppercase tracking-wide text-[#8B5A3C]/70">
              Enforce Payment Terms
            </Label>
            <div className="mt-2 flex items-center gap-2 text-sm text-[#5D4037]">
              <Switch
                checked={watch("payment_terms_enforced")}
                onCheckedChange={(checked) =>
                  setValue("payment_terms_enforced", checked, {
                    shouldDirty: true,
                  })
                }
              />
              {watch("payment_terms_enforced")
                ? "Strict enforcement enabled"
                : "Reminder only"}
            </div>
          </div>
        </div>
        <Separator className="my-4" />
        <div className="space-y-3">
          <Label className="text-sm font-semibold uppercase tracking-wide text-[#8B5A3C]/70">
            Payment Methods Accepted
          </Label>
          <div className="flex flex-wrap gap-3">
            {paymentMethodOptions.map((method) => {
              const selected = watch("payment_methods").includes(method);
              return (
                <button
                  type="button"
                  key={method}
                  onClick={() => togglePaymentMethod(method)}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium capitalize shadow-sm transition",
                    selected
                      ? "border-[#F4A920] bg-[#F4A920]/15 text-[#8B5A3C]"
                      : "border-[#F4A920]/40 text-[#8B5A3C]/80 hover:border-[#F4A920] hover:bg-[#F4A920]/10",
                  )}
                >
                  {selected ? (
                    <CheckCircle2 className="size-4 text-[#F4A920]" />
                  ) : (
                    <Plus className="size-4" />
                  )}
                  {method.replace("_", " ")}
                </button>
              );
            })}
          </div>
          {errors.payment_methods?.message ? (
            <p className="text-xs font-medium text-red-600">
              {errors.payment_methods.message}
            </p>
          ) : null}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <FormField
            label="Preferred Payment Method"
            error={errors.preferred_payment_method?.message ?? undefined}
          >
            <select
              value={preferredPaymentMethod ?? ""}
              onChange={(event) =>
                setValue(
                  "preferred_payment_method",
                  (event.target.value || null) as PaymentMethod | null,
                  {
                    shouldDirty: true,
                    shouldValidate: true,
                  },
                )
              }
              className="h-11 w-full rounded-xl border border-[#F4A920]/40 bg-white px-3 text-sm text-[#5D4037]"
            >
              <option value="">Select preferred method</option>
              {paymentMethodOptions.map((method) => (
                <option
                  key={method}
                  value={method}
                  disabled={!watch("payment_methods").includes(method)}
                >
                  {method.replace("_", " ")}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </SectionCard>

      <div className="sticky bottom-0 left-0 right-0 z-10 -mx-4 flex flex-col gap-3 rounded-t-3xl border-t border-[#F4A920]/20 bg-white/95 p-4 pb-6 shadow-[0_-10px_30px_rgba(93,64,55,0.12)] backdrop-blur supports-[backdrop-filter]:bg-white/70 md:-mx-6">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[#8B5A3C]/70">
          <span className="flex items-center gap-2">
            <AlertCircle className="size-4 text-[#F4A920]" />
            {isDirty ? "Unsaved changes detected" : "All changes saved"}
          </span>
          <span>
            {mode === "create"
              ? "New vendor will appear in Vendor Management list upon save."
              : "Updating metadata for existing vendor."}
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3">
          {mode === "edit" ? (
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-red-200 text-red-600 hover:bg-red-50"
              onClick={handleDelete}
            >
              <Trash2 className="mr-2 size-4" />
              Delete Vendor
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            className="rounded-full border-[#F4A920]/40 text-[#8B5A3C] hover:border-[#F4A920] hover:bg-[#F4A920]/10"
            onClick={handleRestoreDefaults}
          >
            <Undo2 className="mr-2 size-4" />
            Reset
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-gradient-to-r from-[#F4A920] to-[#8B5A3C] px-6 text-white shadow-[0_20px_45px_rgba(139,90,60,0.25)] hover:scale-[1.01]"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Save className="mr-2 size-4" />
            )}
            {mode === "create" ? "Create Vendor" : "Save Changes"}
          </Button>
        </div>
      </div>
    </motion.form>
  );
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-none bg-white shadow-[0_18px_45px_rgba(93,64,55,0.12)]">
      <CardHeader>
        <CardTitle className="text-lg text-[#5D4037]">{title}</CardTitle>
        <CardDescription className="text-sm text-[#8B5A3C]/70">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function FormField({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="text-sm font-semibold uppercase tracking-wide text-[#8B5A3C]/70">
        {label}
      </Label>
      <div className="mt-2 space-y-1">
        {children}
        {error ? (
          <p className="text-xs font-medium text-red-600">{error}</p>
        ) : null}
      </div>
    </div>
  );
}

interface AddressFieldsProps {
  label: string;
  prefix: "billing_address" | "shipping_address" | "warehouse_address";
  register: UseFormRegister<VendorFormValues>;
  errors?: FieldErrors<Address>;
  onCopy: () => void;
  copyLabel: string;
  isNested?: boolean;
}

function AddressFields({
  label,
  prefix,
  register,
  errors,
  onCopy,
  copyLabel,
  isNested,
}: AddressFieldsProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-[#F4A920]/30 bg-white p-4 shadow-[0_12px_30px_rgba(93,64,55,0.1)]">
      {label ? (
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold uppercase tracking-wide text-[#8B5A3C]/70">
            {label}
          </Label>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-full text-[#8B5A3C] hover:bg-[#F4A920]/15 hover:text-[#F4A920]"
            onClick={onCopy}
          >
            <ClipboardCopy className="size-4" />
          </Button>
        </div>
      ) : (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-full text-[#8B5A3C] hover:bg-[#F4A920]/15 hover:text-[#F4A920]"
            onClick={onCopy}
          >
            <ClipboardCopy className="mr-1 size-4" />
            Copy from billing
          </Button>
        </div>
      )}
      <div className="space-y-3">
        <div>
          <Input
            placeholder="Street"
            {...register(`${prefix}.street` as const)}
            className="rounded-xl border-[#F4A920]/40"
          />
          {errors?.street?.message ? (
            <p className="mt-1 text-xs font-medium text-red-600">
              {errors.street.message}
            </p>
          ) : null}
        </div>
        <div>
          <Input
            placeholder="City"
            {...register(`${prefix}.city` as const)}
            className="rounded-xl border-[#F4A920]/40"
          />
          {errors?.city?.message ? (
            <p className="mt-1 text-xs font-medium text-red-600">
              {errors.city.message}
            </p>
          ) : null}
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Input
              placeholder="State"
              {...register(`${prefix}.state` as const)}
              className="rounded-xl border-[#F4A920]/40"
            />
            {errors?.state?.message ? (
              <p className="mt-1 text-xs font-medium text-red-600">
                {errors.state.message}
              </p>
            ) : null}
          </div>
          <div>
            <Input
              placeholder="Postal Code"
              {...register(`${prefix}.postal_code` as const)}
              className="rounded-xl border-[#F4A920]/40"
            />
            {errors?.postal_code?.message ? (
              <p className="mt-1 text-xs font-medium text-red-600">
                {errors.postal_code.message}
              </p>
            ) : null}
          </div>
        </div>
        <div>
          <Input
            placeholder="Country"
            {...register(`${prefix}.country` as const)}
            className="rounded-xl border-[#F4A920]/40"
          />
          {errors?.country?.message ? (
            <p className="mt-1 text-xs font-medium text-red-600">
              {errors.country.message}
            </p>
          ) : null}
        </div>
      </div>
      {copyLabel && label ? (
        <button
          type="button"
          className="text-xs font-semibold text-[#1E88E5] hover:underline"
          onClick={onCopy}
        >
          {copyLabel}
        </button>
      ) : null}
    </div>
  );
}

function findFirstErrorPath<TFieldValues extends FieldValues>(
  errors: FieldErrors<TFieldValues>,
): string | null {
  const explore = (
    errorMap: FieldErrors<TFieldValues>,
    prefix = "",
  ): string | null => {
    for (const key in errorMap) {
      if (!Object.prototype.hasOwnProperty.call(errorMap, key)) continue;
      const value = errorMap[key];
      if (!value) continue;
      const path = prefix ? `${prefix}.${key}` : key;
      if ("message" in value && value.message) {
        return path;
      }
      const nested = value as FieldErrors<TFieldValues>;
      const deeper = explore(nested, path);
      if (deeper) return deeper;
    }
    return null;
  };
  return explore(errors);
}
