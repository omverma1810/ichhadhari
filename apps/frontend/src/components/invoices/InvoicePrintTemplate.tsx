import type { VendorInvoice } from "@/types/api";

interface InvoicePrintTemplateProps {
  invoice: VendorInvoice;
}

export function InvoicePrintTemplate({ invoice }: InvoicePrintTemplateProps) {
  const formatCurrency = (amount: string | number) => {
    return `₹${parseFloat(String(amount)).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
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
            <p>
              <strong>Invoice #:</strong> {invoice.invoice_number}
            </p>
            <p>
              <strong>Date:</strong> {formatDate(invoice.invoice_date)}
            </p>
            <p>
              <strong>Due Date:</strong> {formatDate(invoice.due_date)}
            </p>
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
              <td className="item-qty">
                {parseFloat(String(item.quantity)).toFixed(2)}
              </td>
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
          <span className="totals-value">
            {formatCurrency(invoice.subtotal)}
          </span>
        </div>
        {parseFloat(invoice.tax_amount) > 0 && (
          <div className="totals-row">
            <span className="totals-label">Tax:</span>
            <span className="totals-value">
              {formatCurrency(invoice.tax_amount)}
            </span>
          </div>
        )}
        {parseFloat(invoice.discount_amount) > 0 && (
          <div className="totals-row">
            <span className="totals-label">Discount:</span>
            <span className="totals-value">
              -{formatCurrency(invoice.discount_amount)}
            </span>
          </div>
        )}
        <div className="totals-row total-row">
          <span className="totals-label">Total Amount:</span>
          <span className="totals-value">
            {formatCurrency(invoice.total_amount)}
          </span>
        </div>
        {parseFloat(invoice.amount_paid) > 0 && (
          <>
            <div className="totals-row">
              <span className="totals-label">Amount Paid:</span>
              <span className="totals-value">
                {formatCurrency(invoice.amount_paid)}
              </span>
            </div>
            <div className="totals-row balance-row">
              <span className="totals-label">Balance Due:</span>
              <span className="totals-value">
                {formatCurrency(invoice.amount_due)}
              </span>
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
        <p className="footer-text">
          Generated: {new Date().toLocaleString("en-IN")}
        </p>
      </div>
    </div>
  );
}
