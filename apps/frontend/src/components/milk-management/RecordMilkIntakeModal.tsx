"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Droplet,
  Thermometer,
  Calendar,
  FileText,
  DollarSign,
} from "lucide-react";
import { milkService } from "@/services/milkService";
import { toast } from "sonner";
import type { MilkType, CollectionShift } from "@/types/api";

interface RecordMilkIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  supplierId?: number;
}

const MILK_TYPES = [
  { value: "cow", label: "Cow Milk" },
  { value: "buffalo", label: "Buffalo Milk" },
  { value: "mixed", label: "Mixed Milk" },
];

const SHIFT_OPTIONS = [
  { value: "morning", label: "Morning" },
  { value: "evening", label: "Evening" },
];

export function RecordMilkIntakeModal({
  isOpen,
  onClose,
  onSuccess,
  supplierId,
}: RecordMilkIntakeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    quantity: "",
    fat: "",
    snf: "",
    temperature: "4.0",
    milkType: "cow" as MilkType,
    shift: "morning" as CollectionShift,
    ratePerFat: "",
    ratePerSnf: "",
    collectionDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate form data
      if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
        throw new Error("Please enter a valid quantity");
      }
      if (!formData.fat || parseFloat(formData.fat) <= 0) {
        throw new Error("Please enter a valid fat content");
      }
      if (!formData.snf || parseFloat(formData.snf) <= 0) {
        throw new Error("Please enter a valid SNF content");
      }
      if (!formData.ratePerFat || parseFloat(formData.ratePerFat) <= 0) {
        throw new Error("Please enter a valid rate per fat");
      }
      if (!formData.ratePerSnf || parseFloat(formData.ratePerSnf) <= 0) {
        throw new Error("Please enter a valid rate per SNF");
      }

      console.log("📝 Submitting milk collection form:", formData);

      // Create collection via API
      const result = await milkService.createCollection({
        supplier: supplierId || 1,
        milk_type: formData.milkType,
        quantity: parseFloat(formData.quantity),
        fat: parseFloat(formData.fat),
        snf: parseFloat(formData.snf),
        temperature: parseFloat(formData.temperature),
        rate_per_fat: parseFloat(formData.ratePerFat),
        rate_per_snf: parseFloat(formData.ratePerSnf),
        collection_date: formData.collectionDate,
        notes: formData.notes,
      } as any);

      console.log("✅ Milk collection created successfully:", result);

      // Show success message
      toast.success("Milk collection recorded successfully!");

      // Reset form
      setFormData({
        quantity: "",
        fat: "",
        snf: "",
        temperature: "4.0",
        milkType: "cow",
        shift: "morning",
        ratePerFat: "",
        ratePerSnf: "",
        collectionDate: new Date().toISOString().split("T")[0],
        notes: "",
      });

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

      // Close modal
      onClose();
    } catch (err: any) {
      console.error("❌ Failed to create milk collection:", err);
      const errorMessage =
        err.message || "Failed to record milk collection. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Record milk intake"
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        {/* Milk Type and Shift */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Milk Type *
            </label>
            <Select
              value={formData.milkType}
              onValueChange={(value) =>
                setFormData({ ...formData, milkType: value as MilkType })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select milk type" />
              </SelectTrigger>
              <SelectContent>
                {MILK_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shift *
            </label>
            <Select
              value={formData.shift}
              onValueChange={(value) =>
                setFormData({ ...formData, shift: value as CollectionShift })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select shift" />
              </SelectTrigger>
              <SelectContent>
                {SHIFT_OPTIONS.map((shift) => (
                  <SelectItem key={shift.value} value={shift.value}>
                    {shift.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Row 1: Quantity and Fat Percentage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Droplet className="inline h-4 w-4 mr-1" />
              Quantity (liters) *
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g., 15.50"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Droplet className="inline h-4 w-4 mr-1" />
              Fat (kg/L) *
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              max="15"
              placeholder="e.g., 4.50"
              value={formData.fat}
              onChange={(e) =>
                setFormData({ ...formData, fat: e.target.value })
              }
              required
            />
          </div>
        </div>

        {/* Row 2: SNF and Temperature */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SNF (kg/L) *
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              max="15"
              placeholder="e.g., 8.50"
              value={formData.snf}
              onChange={(e) =>
                setFormData({ ...formData, snf: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Thermometer className="inline h-4 w-4 mr-1" />
              Temperature (°C) *
            </label>
            <Input
              type="number"
              step="0.1"
              placeholder="e.g., 4.0"
              value={formData.temperature}
              onChange={(e) =>
                setFormData({ ...formData, temperature: e.target.value })
              }
              required
            />
          </div>
        </div>

        {/* Row 3: Rate Per Fat and Rate Per SNF */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <DollarSign className="inline h-4 w-4 mr-1" />
              Rate per kg fat (₹) *
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g., 60.00"
              value={formData.ratePerFat}
              onChange={(e) =>
                setFormData({ ...formData, ratePerFat: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <DollarSign className="inline h-4 w-4 mr-1" />
              Rate per kg SNF (₹) *
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g., 10.00"
              value={formData.ratePerSnf}
              onChange={(e) =>
                setFormData({ ...formData, ratePerSnf: e.target.value })
              }
              required
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">Price per liter of milk</p>
        </div>

        {/* Row 4: Collection Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Calendar className="inline h-4 w-4 mr-1" />
            Collection Date *
          </label>
          <Input
            type="date"
            value={formData.collectionDate}
            onChange={(e) =>
              setFormData({ ...formData, collectionDate: e.target.value })
            }
            required
          />
        </div>

        {/* Row 5: Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <FileText className="inline h-4 w-4 mr-1" />
            Notes (optional)
          </label>
          <textarea
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Any additional information about this collection..."
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" variant="default" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Recording...
              </>
            ) : (
              <>
                <Droplet className="h-5 w-5" />
                Record milk intake
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
