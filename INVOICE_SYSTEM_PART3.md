# 🧾 INVOICE SYSTEM - PART 3: Create/Edit Forms & Deployment

## ✏️ CREATE INVOICE FORM

**File:** `apps/frontend/src/app/(dashboard)/vendors/invoices/create/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { invoiceService } from '@/services/invoiceService';
import { vendorService } from '@/services/vendorService';
import { Vendor } from '@/types/api';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

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
    vendor: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    reference_number: '',
    notes: '',
    terms_and_conditions: 'Payment due within 30 days of invoice date.',
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      item_description: '',
      quantity: '1',
      unit: 'piece',
      unit_price: '0',
      tax_rate: '0',
      discount_percentage: '0',
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
      toast.error('Failed to load vendors');
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

    items.forEach(item => {
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
        item_description: '',
        quantity: '1',
        unit: 'piece',
        unit_price: '0',
        tax_rate: '0',
        discount_percentage: '0',
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) {
      toast.error('Invoice must have at least one item');
      return;
    }
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.vendor) {
      toast.error('Please select a vendor');
      return;
    }

    if (items.some(item => !item.item_description.trim())) {
      toast.error('All items must have a description');
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
        items: items.map(item => ({
          item_description: item.item_description,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unit_price,
          tax_rate: item.tax_rate,
          discount_percentage: item.discount_percentage,
        })),
      };

      console.log('Creating invoice:', invoiceData);

      const result = await invoiceService.createInvoice(invoiceData);

      toast.success('Invoice created successfully!');
      router.push(`/vendors/invoices/${result.id}`);
    } catch (err: any) {
      console.error('Failed to create invoice:', err);
      toast.error(err.message || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  const vendorOptions = vendors.map(v => ({
    value: String(v.id),
    label: v.name,
  }));

  const unitOptions = [
    { value: 'piece', label: 'Piece' },
    { value: 'kilogram', label: 'Kilogram (kg)' },
    { value: 'liter', label: 'Liter (L)' },
    { value: 'meter', label: 'Meter (m)' },
    { value: 'box', label: 'Box' },
    { value: 'pack', label: 'Pack' },
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
            <p className="text-gray-600 mt-1">Fill in the details below to create a new invoice</p>
          </div>
          <Link href="/vendors/invoices">
            <Button variant="outline" icon={<ArrowLeft className="h-4 w-4" />}>
              Cancel
            </Button>
          </Link>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Vendor & Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <Select
                label="Vendor *"
                options={vendorOptions}
                value={formData.vendor}
                onChange={(value) => setFormData({ ...formData, vendor: value })}
                required
              />
            </div>
            <Input
              label="Invoice Date *"
              type="date"
              value={formData.invoice_date}
              onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
              required
            />
            <Input
              label="Due Date *"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              required
            />
          </div>

          <Input
            label="Reference Number (optional)"
            type="text"
            placeholder="PO-2025-001"
            value={formData.reference_number}
            onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
          />

          {/* Items */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Invoice Items</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={<Plus className="h-4 w-4" />}
                onClick={addItem}
              >
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-medium text-gray-700">Item {index + 1}</h3>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <Input
                    label="Description *"
                    type="text"
                    placeholder="Item description"
                    value={item.item_description}
                    onChange={(e) => updateItem(index, 'item_description', e.target.value)}
                    required
                  />

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <Input
                      label="Quantity *"
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      required
                    />

                    <Select
                      label="Unit *"
                      options={unitOptions}
                      value={item.unit}
                      onChange={(value) => updateItem(index, 'unit', value)}
                    />

                    <Input
                      label="Unit Price *"
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                      required
                    />

                    <Input
                      label="Tax %"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={item.tax_rate}
                      onChange={(e) => updateItem(index, 'tax_rate', e.target.value)}
                    />

                    <Input
                      label="Discount %"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={item.discount_percentage}
                      onChange={(e) => updateItem(index, 'discount_percentage', e.target.value)}
                    />
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
                  <span className="font-medium">₹{totals.subtotal.toFixed(2)}</span>
                </div>
                {totals.discountTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-medium text-red-600">-₹{totals.discountTotal.toFixed(2)}</span>
                  </div>
                )}
                {totals.taxTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">₹{totals.taxTotal.toFixed(2)}</span>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Additional notes or instructions..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          {/* Terms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Terms & Conditions
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={formData.terms_and_conditions}
              onChange={(e) => setFormData({ ...formData, terms_and_conditions: e.target.value })}
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
          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            icon={<Save className="h-4 w-4" />}
          >
            Create Invoice
          </Button>
        </div>
      </form>
    </div>
  );
}
```

---

## 🚀 IMPLEMENTATION STEPS

### Step 1: Backend Setup (Django)

```bash
# Navigate to backend
cd apps/backend

# Create migrations
python manage.py makemigrations vendors

# Run migrations
python manage.py migrate

# Create superuser (if needed)
python manage.py createsuperuser

# Run server
python manage.py runserver
```

### Step 2: Frontend Setup

```bash
# Navigate to frontend
cd apps/frontend

# Install dependencies (if not already installed)
npm install react-hot-toast lucide-react

# Run development server
npm run dev
```

### Step 3: Test Invoice System

1. **Create a Vendor** (if not already done):
   - Go to `http://localhost:3000/vendors`
   - Click "Add Vendor"
   - Fill in vendor details
   - Save

2. **Create an Invoice**:
   - Go to `http://localhost:3000/vendors/invoices`
   - Click "Create Invoice"
   - Select vendor
   - Add items
   - Save

3. **View Invoice**:
   - Click on invoice number
   - Should see formatted invoice

4. **Test Printing**:
   - Click "Print" button
   - Should open print dialog
   - Preview should show clean, formatted invoice

5. **Test PDF Download**:
   - Click "Download PDF"
   - Select "Save as PDF" in print dialog
   - PDF should be generated with proper formatting

---

## 🖨️ PRINTER SETUP GUIDE

### For TVS RP-45 Dot Matrix Printer

#### Windows Setup:

1. **Install Printer Driver**:
   ```
   - Download TVS RP-45 driver from TVS Electronics website
   - Run installer
   - Follow on-screen instructions
   ```

2. **Connect Printer**:
   ```
   - USB: Plug into computer, Windows will auto-detect
   - Parallel: Connect to LPT1 port
   - Serial: Connect to COM port
   ```

3. **Configure Printer**:
   ```
   - Open Settings > Devices > Printers & Scanners
   - Select "TVS RP-45"
   - Click "Manage"
   - Click "Printing Preferences"
   - Set paper size to "Custom" or "A4"
   - Set quality to "Draft" (fastest)
   ```

4. **Test Print**:
   ```
   - Open invoice in browser
   - Press Ctrl+P
   - Select "TVS RP-45"
   - Click "Print"
   ```

#### Mac Setup:

1. **Install Printer Driver**:
   ```
   - Download Mac driver from TVS Electronics
   - Open .dmg file
   - Run installer
   ```

2. **Add Printer**:
   ```
   - System Preferences > Printers & Scanners
   - Click "+"
   - Select TVS RP-45
   - Click "Add"
   ```

3. **Test Print**:
   ```
   - Open invoice in browser
   - Press Cmd+P
   - Select "TVS RP-45"
   - Click "Print"
   ```

---

## ✅ TESTING CHECKLIST

### Invoice Creation:
- [ ] Can select vendor from dropdown
- [ ] Can add multiple items
- [ ] Can remove items (minimum 1)
- [ ] Calculations are correct (subtotal, tax, discount, total)
- [ ] Can add notes and terms
- [ ] Invoice number auto-generates
- [ ] Successfully saves to database

### Invoice Viewing:
- [ ] List page loads all invoices
- [ ] Can view invoice details
- [ ] All information displays correctly
- [ ] Status badges show correct colors
- [ ] Payment status displays correctly

### Printing:
- [ ] Print button opens print dialog
- [ ] Print preview shows clean format
- [ ] Headers and footers display correctly
- [ ] Table formats properly
- [ ] Totals section aligns correctly
- [ ] Footer shows company info

### PDF Download:
- [ ] Download PDF button works
- [ ] PDF contains all invoice data
- [ ] PDF formatting matches print preview
- [ ] PDF is readable and professional

### Dot Matrix Printing:
- [ ] Text is clear and legible
- [ ] Borders print correctly
- [ ] All 40 columns fit properly
- [ ] No text cutoff
- [ ] Proper line spacing
- [ ] Company name stands out

---

## 🎨 CUSTOMIZATION OPTIONS

### Change Company Information:

Edit in `InvoicePrintTemplate.tsx`:

```typescript
<h1 className="company-name">YOUR COMPANY NAME</h1>
<p className="company-address">Your Address</p>
<p className="company-contact">Phone: Your Phone</p>
```

### Change Colors/Theme:

Edit `invoice-print.css`:

```css
/* Your color scheme */
.company-name {
  color: #your-brand-color;
}

.invoice-title {
  color: #your-accent-color;
}
```

### Add Logo:

In `InvoicePrintTemplate.tsx`:

```typescript
<div className="company-info">
  <img src="/logo.png" alt="Logo" className="company-logo" />
  <h1 className="company-name">COMPANY NAME</h1>
  ...
</div>
```

And in CSS:

```css
.company-logo {
  width: 80px;
  height: auto;
  margin-bottom: 10px;
}

@media print {
  .company-logo {
    width: 60px;
  }
}
```

---

## 🐛 TROUBLESHOOTING

### Issue: "Invoice page not loading"

**Solution:**
```typescript
// Check if router is properly configured
// Verify path in app/(dashboard)/vendors/invoices/page.tsx
```

### Issue: "Print preview shows wrong format"

**Solution:**
```css
/* Add to invoice-print.css */
@media print {
  * {
    -webkit-print-color-adjust: exact !important;
  }
}
```

### Issue: "PDF download not working"

**Solution:**
- Use browser's native "Save as PDF" from print dialog
- Or install `jspdf` and `html2canvas` for programmatic PDF generation

### Issue: "Printer not detecting"

**Solution:**
1. Check USB/cable connection
2. Reinstall printer driver
3. Set as default printer
4. Check Windows/Mac printer settings

### Issue: "Text cutoff on dot matrix printer"

**Solution:**
```css
/* Adjust in invoice-print.css */
@media print {
  .invoice-print-container {
    max-width: 95%; /* Reduce width */
    font-size: 9pt; /* Smaller font */
  }
}
```

---

## 📊 API ENDPOINTS SUMMARY

```
GET    /api/vendors/invoices/              - List all invoices
POST   /api/vendors/invoices/              - Create invoice
GET    /api/vendors/invoices/{id}/         - Get invoice details
PUT    /api/vendors/invoices/{id}/         - Update invoice
DELETE /api/vendors/invoices/{id}/         - Delete invoice
POST   /api/vendors/invoices/{id}/mark_as_paid/ - Mark as paid
POST   /api/vendors/invoices/{id}/record_payment/ - Record payment
GET    /api/vendors/invoices/{id}/print_format/ - Get print format
```

---

## 🎉 DEPLOYMENT

### Backend:

```bash
# Collect static files
python manage.py collectstatic --noinput

# Run migrations on production
python manage.py migrate

# Deploy to your hosting (Render, Heroku, etc.)
```

### Frontend:

```bash
# Build production
npm run build

# Deploy to Vercel
git push origin main  # Auto-deploys

# Or manual deploy
vercel --prod
```

---

## ✨ FEATURES SUMMARY

✅ **Complete Invoice Management**
- Create, view, edit, delete invoices
- Multi-item support
- Automatic calculations
- Status tracking

✅ **Professional Design**
- Matches Ichhadhari Dairy theme
- Clean, modern interface
- Mobile-responsive

✅ **Print-Optimized**
- Designed for TVS RP-45 printer
- 40-column layout
- High-contrast text
- Simple borders

✅ **PDF Support**
- Download as PDF
- Browser-based generation
- Professional formatting

✅ **Payment Tracking**
- Mark as paid
- Record partial payments
- Payment status badges
- Amount due calculation

---

## 🚀 YOU'RE DONE!

Your complete invoice system is now ready with:
- ✅ Backend API
- ✅ Frontend UI
- ✅ Print functionality
- ✅ PDF download
- ✅ Dot matrix printer support
- ✅ Professional design

**Test everything and start invoicing!** 🎉
