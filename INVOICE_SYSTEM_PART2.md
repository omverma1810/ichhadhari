# 🧾 INVOICE SYSTEM - PART 2: Frontend Components

## 📱 MAIN INVOICES PAGE

**File:** `apps/frontend/src/app/(dashboard)/vendors/invoices/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { invoiceService } from '@/services/invoiceService';
import { VendorInvoiceListItem } from '@/types/api';
import { Plus, RefreshCw, Eye, Download, Printer, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<VendorInvoiceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await invoiceService.getInvoices({ page_size: 100 });
      setInvoices(response.results || []);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load invoices';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;

    try {
      await invoiceService.deleteInvoice(id);
      toast.success('Invoice deleted successfully');
      loadInvoices();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete invoice');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partially_paid':
        return 'bg-yellow-100 text-yellow-800';
      case 'unpaid':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading invoices...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <Button onClick={loadInvoices} variant="outline" size="sm" className="mt-2">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendor Invoices</h1>
          <p className="text-gray-600 mt-1">Total: {invoices.length} invoices</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={loadInvoices}
            variant="outline"
            icon={<RefreshCw className="h-4 w-4" />}
          >
            Refresh
          </Button>
          <Link href="/vendors/invoices/create">
            <Button variant="primary" icon={<Plus className="h-4 w-4" />}>
              Create Invoice
            </Button>
          </Link>
        </div>
      </div>

      {/* Invoices Table */}
      {invoices.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">No invoices found</p>
          <Link href="/vendors/invoices/create">
            <Button variant="primary" icon={<Plus className="h-4 w-4" />}>
              Create First Invoice
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.invoice_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.vendor_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(invoice.invoice_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(invoice.due_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{parseFloat(invoice.total_amount).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          invoice.status
                        )}`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(
                          invoice.payment_status
                        )}`}
                      >
                        {invoice.payment_status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Link href={`/vendors/invoices/${invoice.id}`}>
                          <button
                            className="text-blue-600 hover:text-blue-900"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </Link>
                        <Link href={`/vendors/invoices/${invoice.id}/edit`}>
                          <button
                            className="text-gray-600 hover:text-gray-900"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(invoice.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 📄 INVOICE DETAIL/VIEW PAGE

**File:** `apps/frontend/src/app/(dashboard)/vendors/invoices/[id]/page.tsx`

```typescript
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { invoiceService } from '@/services/invoiceService';
import { VendorInvoice } from '@/types/api';
import { ArrowLeft, Download, Printer, CheckCircle, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { InvoicePrintTemplate } from '@/components/invoices/InvoicePrintTemplate';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);
  const [invoice, setInvoice] = useState<VendorInvoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadInvoice(Number(params.id));
    }
  }, [params.id]);

  const loadInvoice = async (id: number) => {
    setLoading(true);
    try {
      const data = await invoiceService.getInvoice(id);
      setInvoice(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load invoice');
      router.push('/vendors/invoices');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!invoice) return;

    try {
      // Use browser's print to PDF functionality
      toast.info('Please select "Save as PDF" in the print dialog');
      window.print();
    } catch (err) {
      toast.error('Failed to download PDF');
    }
  };

  const handleMarkAsPaid = async () => {
    if (!invoice) return;

    try {
      const updated = await invoiceService.markAsPaid(invoice.id);
      setInvoice(updated);
      toast.success('Invoice marked as paid');
    } catch (err: any) {
      toast.error(err.message || 'Failed to mark as paid');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-2" />
          <p className="text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return null;
  }

  return (
    <>
      {/* Screen View - Hidden when printing */}
      <div className="print:hidden p-6 space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <Link href="/vendors/invoices">
            <Button variant="outline" icon={<ArrowLeft className="h-4 w-4" />}>
              Back to Invoices
            </Button>
          </Link>
          <div className="flex gap-3">
            <Link href={`/vendors/invoices/${invoice.id}/edit`}>
              <Button variant="outline" icon={<Edit className="h-4 w-4" />}>
                Edit
              </Button>
            </Link>
            {invoice.payment_status !== 'paid' && (
              <Button
                variant="success"
                icon={<CheckCircle className="h-4 w-4" />}
                onClick={handleMarkAsPaid}
              >
                Mark as Paid
              </Button>
            )}
            <Button
              variant="outline"
              icon={<Download className="h-4 w-4" />}
              onClick={handleDownloadPDF}
            >
              Download PDF
            </Button>
            <Button
              variant="primary"
              icon={<Printer className="h-4 w-4" />}
              onClick={handlePrint}
            >
              Print
            </Button>
          </div>
        </div>

        {/* Invoice Preview */}
        <div className="bg-white rounded-lg shadow p-8">
          <InvoicePrintTemplate invoice={invoice} />
        </div>
      </div>

      {/* Print View - Only visible when printing */}
      <div className="hidden print:block">
        <InvoicePrintTemplate invoice={invoice} />
      </div>
    </>
  );
}
```

---

## 🖨️ INVOICE PRINT TEMPLATE

**File:** `apps/frontend/src/components/invoices/InvoicePrintTemplate.tsx`

```typescript
import { VendorInvoice } from '@/types/api';

interface InvoicePrintTemplateProps {
  invoice: VendorInvoice;
}

export function InvoicePrintTemplate({ invoice }: InvoicePrintTemplateProps) {
  const formatCurrency = (amount: string | number) => {
    return `₹${parseFloat(String(amount)).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="invoice-print-container">
      {/* Header */}
      <div className="invoice-header">
        <div className="company-info">
          <h1 className="company-name">ICHHADHARI PREMIUM PUNJABI DAIRY</h1>
          <p className="company-address">Jabalpur, Madhya Pradesh, India</p>
          <p className="company-contact">Phone: +91-XXXXXXXXXX</p>
        </div>
        <div className="invoice-info">
          <h2 className="invoice-title">INVOICE</h2>
          <div className="invoice-details">
            <p><strong>Invoice #:</strong> {invoice.invoice_number}</p>
            <p><strong>Date:</strong> {formatDate(invoice.invoice_date)}</p>
            <p><strong>Due Date:</strong> {formatDate(invoice.due_date)}</p>
          </div>
        </div>
      </div>

      <div className="divider" />

      {/* Vendor Information */}
      <div className="vendor-section">
        <h3 className="section-title">BILL TO:</h3>
        <p className="vendor-name">{invoice.vendor_name}</p>
        {invoice.reference_number && (
          <p className="reference">Ref: {invoice.reference_number}</p>
        )}
      </div>

      <div className="divider" />

      {/* Items Table */}
      <table className="items-table">
        <thead>
          <tr>
            <th className="col-desc">Description</th>
            <th className="col-qty">Qty</th>
            <th className="col-unit">Unit</th>
            <th className="col-price">Price</th>
            <th className="col-total">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => (
            <tr key={item.id || index}>
              <td className="item-desc">{item.item_description}</td>
              <td className="item-qty">{parseFloat(String(item.quantity)).toFixed(2)}</td>
              <td className="item-unit">{item.unit}</td>
              <td className="item-price">{formatCurrency(item.unit_price)}</td>
              <td className="item-total">{formatCurrency(item.line_total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="divider" />

      {/* Totals Section */}
      <div className="totals-section">
        <div className="totals-row">
          <span className="totals-label">Subtotal:</span>
          <span className="totals-value">{formatCurrency(invoice.subtotal)}</span>
        </div>
        {parseFloat(invoice.tax_amount) > 0 && (
          <div className="totals-row">
            <span className="totals-label">Tax:</span>
            <span className="totals-value">{formatCurrency(invoice.tax_amount)}</span>
          </div>
        )}
        {parseFloat(invoice.discount_amount) > 0 && (
          <div className="totals-row">
            <span className="totals-label">Discount:</span>
            <span className="totals-value">-{formatCurrency(invoice.discount_amount)}</span>
          </div>
        )}
        <div className="totals-row total-row">
          <span className="totals-label">Total Amount:</span>
          <span className="totals-value">{formatCurrency(invoice.total_amount)}</span>
        </div>
        {parseFloat(invoice.amount_paid) > 0 && (
          <>
            <div className="totals-row">
              <span className="totals-label">Amount Paid:</span>
              <span className="totals-value">{formatCurrency(invoice.amount_paid)}</span>
            </div>
            <div className="totals-row balance-row">
              <span className="totals-label">Balance Due:</span>
              <span className="totals-value">{formatCurrency(invoice.amount_due)}</span>
            </div>
          </>
        )}
      </div>

      {/* Notes */}
      {invoice.notes && (
        <>
          <div className="divider" />
          <div className="notes-section">
            <h3 className="section-title">Notes:</h3>
            <p className="notes-text">{invoice.notes}</p>
          </div>
        </>
      )}

      {/* Terms and Conditions */}
      {invoice.terms_and_conditions && (
        <>
          <div className="divider" />
          <div className="terms-section">
            <h3 className="section-title">Terms & Conditions:</h3>
            <p className="terms-text">{invoice.terms_and_conditions}</p>
          </div>
        </>
      )}

      {/* Footer */}
      <div className="invoice-footer">
        <p className="footer-text">Thank you for your business!</p>
        <p className="footer-text">Generated: {new Date().toLocaleString('en-IN')}</p>
      </div>
    </div>
  );
}
```

---

## 🎨 PRINT STYLES

**File:** `apps/frontend/src/styles/invoice-print.css`

```css
/* ============================================
   INVOICE PRINT STYLES
   Optimized for TVS RP-45 Dot Matrix Printer
   ============================================ */

/* Print-specific styles */
@media print {
  /* Reset page */
  @page {
    size: A4 portrait;
    margin: 1cm 1.5cm;
  }

  /* Hide everything except invoice */
  body * {
    visibility: hidden;
  }

  .invoice-print-container,
  .invoice-print-container * {
    visibility: visible;
  }

  .invoice-print-container {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }

  /* Remove shadows and backgrounds */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    box-shadow: none !important;
    text-shadow: none !important;
  }
}

/* ============================================
   INVOICE CONTAINER
   ============================================ */

.invoice-print-container {
  font-family: 'Courier New', Courier, monospace;
  font-size: 11pt;
  line-height: 1.4;
  color: #000;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

@media print {
  .invoice-print-container {
    padding: 0;
    font-size: 10pt;
  }
}

/* ============================================
   HEADER
   ============================================ */

.invoice-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

@media print {
  .invoice-header {
    margin-bottom: 15px;
  }
}

.company-info {
  flex: 1;
}

.company-name {
  font-size: 18pt;
  font-weight: bold;
  margin: 0 0 5px 0;
  letter-spacing: 0.5px;
}

@media print {
  .company-name {
    font-size: 14pt;
  }
}

.company-address,
.company-contact {
  font-size: 9pt;
  margin: 2px 0;
}

.invoice-info {
  text-align: right;
  flex: 1;
}

.invoice-title {
  font-size: 20pt;
  font-weight: bold;
  margin: 0 0 10px 0;
}

@media print {
  .invoice-title {
    font-size: 16pt;
  }
}

.invoice-details p {
  margin: 3px 0;
  font-size: 9pt;
}

/* ============================================
   DIVIDERS
   ============================================ */

.divider {
  border-top: 2px solid #000;
  margin: 15px 0;
}

@media print {
  .divider {
    border-top: 1px solid #000;
    margin: 10px 0;
  }
}

/* ============================================
   VENDOR SECTION
   ============================================ */

.vendor-section {
  margin-bottom: 15px;
}

.section-title {
  font-size: 10pt;
  font-weight: bold;
  margin: 0 0 5px 0;
  text-transform: uppercase;
}

.vendor-name {
  font-size: 11pt;
  font-weight: bold;
  margin: 3px 0;
}

.reference {
  font-size: 9pt;
  margin: 3px 0;
}

/* ============================================
   ITEMS TABLE
   ============================================ */

.items-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
}

.items-table thead {
  border-top: 2px solid #000;
  border-bottom: 2px solid #000;
}

@media print {
  .items-table thead {
    border-top: 1px solid #000;
    border-bottom: 1px solid #000;
  }
}

.items-table th {
  padding: 5px 8px;
  text-align: left;
  font-size: 9pt;
  font-weight: bold;
  text-transform: uppercase;
}

.items-table td {
  padding: 5px 8px;
  font-size: 10pt;
  border-bottom: 1px dotted #999;
}

@media print {
  .items-table th,
  .items-table td {
    padding: 3px 5px;
  }
}

/* Column widths */
.col-desc { width: 40%; }
.col-qty { width: 12%; text-align: right; }
.col-unit { width: 15%; text-align: center; }
.col-price { width: 15%; text-align: right; }
.col-total { width: 18%; text-align: right; }

.item-desc { text-align: left; }
.item-qty { text-align: right; }
.item-unit { text-align: center; }
.item-price { text-align: right; }
.item-total { text-align: right; font-weight: bold; }

/* ============================================
   TOTALS SECTION
   ============================================ */

.totals-section {
  margin-left: auto;
  width: 300px;
  margin-bottom: 15px;
}

@media print {
  .totals-section {
    width: 250px;
  }
}

.totals-row {
  display: flex;
  justify-content: space-between;
  padding: 5px 10px;
  font-size: 10pt;
}

.totals-label {
  font-weight: normal;
}

.totals-value {
  font-weight: bold;
  text-align: right;
}

.total-row {
  border-top: 2px solid #000;
  border-bottom: 2px solid #000;
  margin-top: 5px;
  font-size: 12pt;
  font-weight: bold;
}

@media print {
  .total-row {
    border-top: 1px solid #000;
    border-bottom: 1px solid #000;
    font-size: 11pt;
  }
}

.balance-row {
  border-top: 1px solid #000;
  margin-top: 5px;
  background-color: #f3f4f6;
}

@media print {
  .balance-row {
    background-color: #f5f5f5;
  }
}

/* ============================================
   NOTES AND TERMS
   ============================================ */

.notes-section,
.terms-section {
  margin-bottom: 15px;
}

.notes-text,
.terms-text {
  font-size: 9pt;
  line-height: 1.5;
  margin-top: 5px;
  white-space: pre-wrap;
}

/* ============================================
   FOOTER
   ============================================ */

.invoice-footer {
  text-align: center;
  margin-top: 30px;
  padding-top: 15px;
  border-top: 2px solid #000;
}

@media print {
  .invoice-footer {
    margin-top: 20px;
    padding-top: 10px;
    border-top: 1px solid #000;
  }
}

.footer-text {
  font-size: 9pt;
  margin: 3px 0;
}

/* ============================================
   DOT MATRIX PRINTER OPTIMIZATIONS
   ============================================ */

@media print {
  /* High contrast for dot matrix */
  .invoice-print-container {
    color: #000 !important;
    background: #fff !important;
  }

  /* Bold text for better visibility */
  .company-name,
  .invoice-title,
  .vendor-name,
  .section-title,
  .items-table th,
  .totals-value,
  .total-row {
    font-weight: bold !important;
  }

  /* Remove all colors (dot matrix is monochrome) */
  * {
    color: #000 !important;
    background-color: transparent !important;
  }

  .balance-row {
    background-color: #f0f0f0 !important;
  }

  /* Ensure borders are visible */
  .divider,
  .items-table thead,
  .total-row {
    border-color: #000 !important;
  }

  /* Optimize spacing for 40-column width */
  .invoice-print-container {
    max-width: 100%;
  }
}
```

Add this to your global styles:

**File:** `apps/frontend/src/app/globals.css`

```css
@import '../styles/invoice-print.css';
```

---

Continue to Part 3 for Create/Edit Forms...
