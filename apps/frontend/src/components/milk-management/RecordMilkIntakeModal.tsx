'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/button';
import { Droplet, Thermometer, MapPin, Calendar, FileText, DollarSign } from 'lucide-react';
import { milkService } from '@/services/milkService';
import { handleApiError } from '@/lib/api-client';
import type { MilkType, CollectionShift } from '@/types/api';

interface RecordMilkIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  supplierId?: number;
}

const MILK_TYPES = [
  { value: 'cow', label: 'Cow Milk' },
  { value: 'buffalo', label: 'Buffalo Milk' },
  { value: 'mixed', label: 'Mixed Milk' },
];

const SHIFT_OPTIONS = [
  { value: 'morning', label: 'Morning' },
  { value: 'evening', label: 'Evening' },
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
    quantity: '',
    fatPercentage: '',
    snfPercentage: '',
    temperature: '4.0',
    milkType: 'cow' as MilkType,
    shift: 'morning' as CollectionShift,
    ratePerLiter: '',
    collectionDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate form data
      if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
        throw new Error('Please enter a valid quantity');
      }
      if (!formData.fatPercentage || parseFloat(formData.fatPercentage) <= 0) {
        throw new Error('Please enter a valid fat percentage');
      }
      if (!formData.snfPercentage || parseFloat(formData.snfPercentage) <= 0) {
        throw new Error('Please enter a valid SNF percentage');
      }
      if (!formData.ratePerLiter || parseFloat(formData.ratePerLiter) <= 0) {
        throw new Error('Please enter a valid rate per liter');
      }

      console.log('📝 Submitting milk collection form:', formData);

      // Create collection via API
      const result = await milkService.createCollection({
        supplier: supplierId || 1, // Use provided supplierId or default to 1
        milk_type: formData.milkType,
        shift: formData.shift,
        quantity: parseFloat(formData.quantity),
        fat_percentage: parseFloat(formData.fatPercentage),
        snf_percentage: parseFloat(formData.snfPercentage),
        temperature: parseFloat(formData.temperature),
        rate_per_liter: parseFloat(formData.ratePerLiter),
        collection_date: formData.collectionDate,
        notes: formData.notes,
      });

      console.log('✅ Milk collection created successfully:', result);

      // Show success message
      alert('✅ Milk collection recorded successfully!');

      // Reset form
      setFormData({
        quantity: '',
        fatPercentage: '',
        snfPercentage: '',
        temperature: '4.0',
        milkType: 'cow',
        shift: 'morning',
        ratePerLiter: '',
        collectionDate: new Date().toISOString().split('T')[0],
        notes: '',
      });

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

      // Close modal
      onClose();
    } catch (err: any) {
      console.error('❌ Failed to create milk collection:', err);
      const errorMessage =
        err.message || 'Failed to record milk collection. Please try again.';
      setError(errorMessage);
      alert(`❌ Error: ${errorMessage}`);
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
    <Modal isOpen={isOpen} onClose={handleCancel} title="Record milk intake" size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Milk Type and Shift */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Milk Type"
            options={MILK_TYPES}
            value={formData.milkType}
            onChange={(value) => setFormData({ ...formData, milkType: value as MilkType })}
            required
          />

          <Select
            label="Shift"
            options={SHIFT_OPTIONS}
            value={formData.shift}
            onChange={(value) => setFormData({ ...formData, shift: value as CollectionShift })}
            required
          />
        </div>

        {/* Row 1: Quantity and Fat Percentage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Quantity (liters)"
            type="number"
            step="0.01"
            min="0"
            placeholder="e.g., 15.50"
            icon={<Droplet className="h-5 w-5" />}
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            required
          />

          <Input
            label="Fat percentage (%)"
            type="number"
            step="0.01"
            min="0"
            max="100"
            placeholder="e.g., 4.50"
            icon={<Droplet className="h-5 w-5" />}
            value={formData.fatPercentage}
            onChange={(e) => setFormData({ ...formData, fatPercentage: e.target.value })}
            required
          />
        </div>

        {/* Row 2: SNF and Temperature */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="SNF percentage (%)"
            type="number"
            step="0.01"
            min="0"
            max="100"
            placeholder="e.g., 8.50"
            value={formData.snfPercentage}
            onChange={(e) => setFormData({ ...formData, snfPercentage: e.target.value })}
            required
          />

          <Input
            label="Temperature (°C)"
            type="number"
            step="0.1"
            placeholder="e.g., 4.0"
            icon={<Thermometer className="h-5 w-5" />}
            value={formData.temperature}
            onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
            required
          />
        </div>

        {/* Row 3: Rate Per Liter */}
        <Input
          label="Rate per liter (₹)"
          type="number"
          step="0.01"
          min="0"
          placeholder="e.g., 45.00"
          icon={<DollarSign className="h-5 w-5" />}
          value={formData.ratePerLiter}
          onChange={(e) => setFormData({ ...formData, ratePerLiter: e.target.value })}
          required
          helperText="Price per liter of milk"
        />

        {/* Row 4: Collection Date */}
        <Input
          label="Collection Date"
          type="date"
          icon={<Calendar className="h-5 w-5" />}
          value={formData.collectionDate}
          onChange={(e) => setFormData({ ...formData, collectionDate: e.target.value })}
          required
        />

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
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
          <Button type="submit" variant="primary" disabled={isSubmitting}>
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
