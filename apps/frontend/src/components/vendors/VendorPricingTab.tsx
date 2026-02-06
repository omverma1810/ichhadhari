"use client";

import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  IndianRupee,
  TrendingDown,
  Package,
  CheckCircle2,
  XCircle,
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import {
  useVendorPrices,
  useCreateVendorProductPrice,
  useUpdateVendorProductPrice,
  useDeleteVendorProductPrice,
  vendorPricingKeys,
} from "@/hooks/api/useVendorPricing";
import { useProducts } from "@/lib/hooks/useProduction";
import { useQueryClient } from "@tanstack/react-query";
import type {
  VendorProductPriceListItem,
  CreateVendorProductPricePayload,
} from "@/types/api/vendor-pricing";

const formatCurrency = (value: number | string) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

interface VendorPricingTabProps {
  vendorId: number;
  vendorName: string;
}

interface PriceFormData {
  product: string;
  vendor_price: string;
  min_quantity: string;
  is_active: boolean;
  valid_from: string;
  valid_until: string;
  notes: string;
}

const emptyForm: PriceFormData = {
  product: "",
  vendor_price: "",
  min_quantity: "0",
  is_active: true,
  valid_from: "",
  valid_until: "",
  notes: "",
};

export default function VendorPricingTab({
  vendorId,
  vendorName,
}: VendorPricingTabProps) {
  const queryClient = useQueryClient();

  // Queries
  const { data: pricesData, isLoading: pricesLoading } =
    useVendorPrices(vendorId);
  const { data: productsData } = useProducts();

  // Mutations
  const createPrice = useCreateVendorProductPrice();
  const updatePrice = useUpdateVendorProductPrice();
  const deletePrice = useDeleteVendorProductPrice();

  // Local state
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingPrice, setEditingPrice] =
    useState<VendorProductPriceListItem | null>(null);
  const [deletingPriceId, setDeletingPriceId] = useState<number | null>(null);
  const [form, setForm] = useState<PriceFormData>(emptyForm);

  const prices = pricesData?.prices ?? [];
  const products = (productsData as any)?.results ?? productsData ?? [];

  // Products already priced for this vendor
  const pricedProductIds = new Set(prices.map((p) => p.product));

  // Available products for adding (not already priced, unless editing)
  const availableProducts = Array.isArray(products)
    ? products.filter(
        (p: any) =>
          !pricedProductIds.has(p.id) || editingPrice?.product === p.id,
      )
    : [];

  const openCreateForm = () => {
    setEditingPrice(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEditForm = (price: VendorProductPriceListItem) => {
    setEditingPrice(price);
    setForm({
      product: String(price.product),
      vendor_price: String(price.vendor_price),
      min_quantity: String(price.min_quantity),
      is_active: price.is_active,
      valid_from: price.valid_from ?? "",
      valid_until: price.valid_until ?? "",
      notes: price.notes ?? "",
    });
    setFormOpen(true);
  };

  const confirmDelete = (priceId: number) => {
    setDeletingPriceId(priceId);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (deletingPriceId === null) return;
    deletePrice.mutate(deletingPriceId, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: vendorPricingKeys.forVendor(vendorId),
        });
        setDeleteDialogOpen(false);
        setDeletingPriceId(null);
      },
    });
  };

  const handleSubmit = () => {
    if (!form.product || !form.vendor_price) {
      toast.error("Please select a product and enter a price");
      return;
    }

    const payload: CreateVendorProductPricePayload = {
      vendor: vendorId,
      product: Number(form.product),
      vendor_price: Number(form.vendor_price),
      min_quantity: Number(form.min_quantity) || 0,
      is_active: form.is_active,
      valid_from: form.valid_from || null,
      valid_until: form.valid_until || null,
      notes: form.notes,
    };

    if (editingPrice) {
      updatePrice.mutate(
        { id: editingPrice.id, data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: vendorPricingKeys.forVendor(vendorId),
            });
            setFormOpen(false);
            setEditingPrice(null);
          },
        },
      );
    } else {
      createPrice.mutate(payload, {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: vendorPricingKeys.forVendor(vendorId),
          });
          setFormOpen(false);
        },
      });
    }
  };

  const isMutating = createPrice.isPending || updatePrice.isPending;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Product Pricing</h3>
          <p className="text-sm text-muted-foreground">
            Manage vendor-specific product prices for {vendorName}
          </p>
        </div>
        <Button size="sm" onClick={openCreateForm}>
          <Plus className="mr-1 h-4 w-4" />
          Add Price
        </Button>
      </div>

      {/* Prices List */}
      {pricesLoading ? (
        <Card>
          <CardContent className="flex h-40 items-center justify-center text-muted-foreground">
            Loading prices...
          </CardContent>
        </Card>
      ) : prices.length === 0 ? (
        <Card>
          <CardContent className="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground">
            <Package className="h-8 w-8" />
            <p>No product prices configured for this vendor</p>
            <Button size="sm" variant="outline" onClick={openCreateForm}>
              <Plus className="mr-1 h-4 w-4" />
              Add First Price
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {prices.map((price) => (
            <Card key={price.id} className="relative">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-sm font-semibold leading-tight">
                      {price.product_name}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {price.product_unit ? `Unit: ${price.product_unit}` : ""}
                    </CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "shrink-0 text-xs",
                      price.is_active
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-slate-50 text-slate-500",
                    )}
                  >
                    {price.is_active ? (
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                    ) : (
                      <XCircle className="mr-1 h-3 w-3" />
                    )}
                    {price.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 pb-3">
                {/* Price */}
                <div className="flex items-baseline gap-1">
                  <IndianRupee className="h-4 w-4 text-emerald-600" />
                  <span className="text-xl font-bold text-emerald-700">
                    {Number(price.vendor_price).toFixed(2)}
                  </span>
                  {price.product_unit && (
                    <span className="text-xs text-muted-foreground">
                      / {price.product_unit}
                    </span>
                  )}
                </div>

                {/* Min Quantity */}
                {Number(price.min_quantity) > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Min. order: {price.min_quantity} {price.product_unit}
                  </p>
                )}

                {/* Validity */}
                {(price.valid_from || price.valid_until) && (
                  <p className="text-xs text-muted-foreground">
                    Valid: {formatDate(price.valid_from)} →{" "}
                    {formatDate(price.valid_until)}
                  </p>
                )}

                {/* Notes */}
                {price.notes && (
                  <p className="line-clamp-2 text-xs text-muted-foreground italic">
                    {price.notes}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 flex-1 text-xs"
                    onClick={() => openEditForm(price)}
                  >
                    <Pencil className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => confirmDelete(price.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingPrice ? "Edit Product Price" : "Add Product Price"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Product Select */}
            <div className="space-y-1.5">
              <Label htmlFor="product">Product *</Label>
              <Select
                value={form.product}
                onValueChange={(val) =>
                  setForm((f) => ({ ...f, product: val }))
                }
                disabled={!!editingPrice}
              >
                <SelectTrigger id="product">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {availableProducts.map((p: any) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name}
                      {p.unit ? ` (${p.unit})` : ""}
                    </SelectItem>
                  ))}
                  {availableProducts.length === 0 && (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                      All products already have prices
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Vendor Price */}
            <div className="space-y-1.5">
              <Label htmlFor="vendor_price">Vendor Price (₹) *</Label>
              <Input
                id="vendor_price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={form.vendor_price}
                onChange={(e) =>
                  setForm((f) => ({ ...f, vendor_price: e.target.value }))
                }
              />
            </div>

            {/* Min Quantity */}
            <div className="space-y-1.5">
              <Label htmlFor="min_quantity">Minimum Order Quantity</Label>
              <Input
                id="min_quantity"
                type="number"
                step="0.01"
                min="0"
                placeholder="0"
                value={form.min_quantity}
                onChange={(e) =>
                  setForm((f) => ({ ...f, min_quantity: e.target.value }))
                }
              />
            </div>

            {/* Active toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={form.is_active}
                onChange={(e) =>
                  setForm((f) => ({ ...f, is_active: e.target.checked }))
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="is_active" className="text-sm">
                Active
              </Label>
            </div>

            {/* Validity Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="valid_from">Valid From</Label>
                <Input
                  id="valid_from"
                  type="date"
                  value={form.valid_from}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, valid_from: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="valid_until">Valid Until</Label>
                <Input
                  id="valid_until"
                  type="date"
                  value={form.valid_until}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, valid_until: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                rows={2}
                placeholder="Optional notes about this price..."
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
              />
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setFormOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isMutating || !form.product || !form.vendor_price}
              className="w-full sm:w-auto"
            >
              {isMutating
                ? "Saving..."
                : editingPrice
                  ? "Update Price"
                  : "Add Price"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Price</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this product price? This action
            cannot be undone.
          </p>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeletingPriceId(null);
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deletePrice.isPending}
              className="w-full sm:w-auto"
            >
              {deletePrice.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
