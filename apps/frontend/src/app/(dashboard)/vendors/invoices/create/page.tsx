"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
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
import { invoiceService } from "@/services/invoiceService";
import { vendorService } from "@/services/vendorService";
import type { Vendor } from "@/types/api";

interface InvoiceItem {
  item_description: string;
  quantity: string;
  unit: string;
  unit_price: string;
  tax_rate: string;
  discount_percentage: string;
}

export default function CreateInvoicePage() {
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingVendors, setLoadingVendors] = useState(true);

  const [formData, setFormData] = useState({
    vendor: "",
    invoice_date: new Date().toISOString().split("T")[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    reference_number: "",
    notes: "",
    terms_and_conditions: "Payment due within 30 days of invoice date.",
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      item_description: "",
      quantity: "1",
      unit: "piece",
      unit_price: "0",
      tax_rate: "0",
      discount_percentage: "0",
    },
  ]);

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      const response = await vendorService.getVendors({ page_size: 100 });
      setVendors(response.results || []);
    } catch (err: any) {
      alert("Failed to load vendors");
    } finally {
      setLoadingVendors(false);
    }
  };

  const calculateLineTotal = (item: InvoiceItem) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unit_price) || 0;
    const discount = parseFloat(item.discount_percentage) || 0;
    const tax = parseFloat(item.tax_rate) || 0;

    const subtotal = qty * price;
    const discountAmount = subtotal * (discount / 100);
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * (tax / 100);

    return afterDiscount + taxAmount;
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let taxTotal = 0;
    let discountTotal = 0;

    items.forEach((item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unit_price) || 0;
      const discount = parseFloat(item.discount_percentage) || 0;
      const tax = parseFloat(item.tax_rate) || 0;

      const itemSubtotal = qty * price;
      const discountAmount = itemSubtotal * (discount / 100);
      const afterDiscount = itemSubtotal - discountAmount;
      const taxAmount = afterDiscount * (tax / 100);

      subtotal += itemSubtotal;
      discountTotal += discountAmount;
      taxTotal += taxAmount;
    });

    const total = subtotal - discountTotal + taxTotal;

    return { subtotal, discountTotal, taxTotal, total };
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        item_description: "",
        quantity: "1",
        unit: "piece",
        unit_price: "0",
        tax_rate: "0",
        discount_percentage: "0",
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) {
      alert("Invoice must have at least one item");
      return;
    }
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const updateItem = (
    index: number,
    field: keyof InvoiceItem,
    value: string
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.vendor) {
      alert("Please select a vendor");
      return;
    }

    if (items.some((item) => !item.item_description.trim())) {
      alert("All items must have a description");
      return;
    }

    setLoading(true);

    try {
      const totals = calculateTotals();

      const invoiceData = {
        vendor: parseInt(formData.vendor),
        invoice_date: formData.invoice_date,
        due_date: formData.due_date,
        total_amount: totals.total.toFixed(2),
        reference_number: formData.reference_number,
        notes: formData.notes,
        terms_and_conditions: formData.terms_and_conditions,
        items: items.map((item) => ({
          item_description: item.item_description,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unit_price,
          tax_rate: item.tax_rate,
          discount_percentage: item.discount_percentage,
        })),
      };

      const result = await invoiceService.createInvoice(invoiceData);

      router.push(`/vendors/invoices/${result.id}`);
    } catch (err: any) {
      console.error("Failed to create invoice:", err);
      alert(err.message || "Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  const unitOptions = [
    { value: "piece", label: "Piece" },
    { value: "kilogram", label: "Kilogram (kg)" },
    { value: "liter", label: "Liter (L)" },
    { value: "meter", label: "Meter (m)" },
    { value: "box", label: "Box" },
    { value: "pack", label: "Pack" },
  ];

  if (loadingVendors) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-2" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Invoice</h1>
            <p className="text-gray-600 mt-1">
              Fill in the details below to create a new invoice
            </p>
          </div>
          <Link href="/vendors/invoices">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </Link>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Vendor & Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="vendor">Vendor *</Label>
              <Select
                value={formData.vendor}
                onValueChange={(value) =>
                  setFormData({ ...formData, vendor: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={String(vendor.id)}>
                      {vendor.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="invoice_date">Invoice Date *</Label>
              <Input
                id="invoice_date"
                type="date"
                value={formData.invoice_date}
                onChange={(e) =>
                  setFormData({ ...formData, invoice_date: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="due_date">Due Date *</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) =>
                  setFormData({ ...formData, due_date: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="reference_number">
              Reference Number (optional)
            </Label>
            <Input
              id="reference_number"
              type="text"
              placeholder="PO-2025-001"
              value={formData.reference_number}
              onChange={(e) =>
                setFormData({ ...formData, reference_number: e.target.value })
              }
            />
          </div>

          {/* Items */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Invoice Items
              </h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-medium text-gray-700">
                      Item {index + 1}
                    </h3>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </div>

                  <div>
                    <Label>Description *</Label>
                    <Input
                      type="text"
                      placeholder="Item description"
                      value={item.item_description}
                      onChange={(e) =>
                        updateItem(index, "item_description", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div>
                      <Label>Quantity *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(index, "quantity", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div>
                      <Label>Unit *</Label>
                      <Select
                        value={item.unit}
                        onValueChange={(value) =>
                          updateItem(index, "unit", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {unitOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Unit Price *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unit_price}
                        onChange={(e) =>
                          updateItem(index, "unit_price", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div>
                      <Label>Tax %</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={item.tax_rate}
                        onChange={(e) =>
                          updateItem(index, "tax_rate", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <Label>Discount %</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={item.discount_percentage}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "discount_percentage",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm text-gray-600">Line Total: </span>
                    <span className="text-lg font-semibold text-gray-900">
                      ₹{calculateLineTotal(item).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">
                    ₹{totals.subtotal.toFixed(2)}
                  </span>
                </div>
                {totals.discountTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-medium text-red-600">
                      -₹{totals.discountTotal.toFixed(2)}
                    </span>
                  </div>
                )}
                {totals.taxTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">
                      ₹{totals.taxTotal.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                  <span>Total:</span>
                  <span>₹{totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <textarea
              id="notes"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Additional notes or instructions..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
          </div>

          {/* Terms */}
          <div>
            <Label htmlFor="terms">Terms & Conditions</Label>
            <textarea
              id="terms"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={formData.terms_and_conditions}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  terms_and_conditions: e.target.value,
                })
              }
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link href="/vendors/invoices">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" variant="default" disabled={loading}>
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Invoice
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
