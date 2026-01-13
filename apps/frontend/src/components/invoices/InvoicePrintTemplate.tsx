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
      {/* Header - Centered for thermal printer */}
      <div className="thermal-header">
        <h1 className="company-name">ICHHADHARI PREMIUM PUNJABI</h1>
        <h1 className="company-name">DAIRY</h1>
        <p className="company-address">Jabalpur, Madhya Pradesh, India</p>
        <p className="company-contact">Phone: +91-9174530128</p>
      </div>

      <div className="divider" />

      {/* Invoice Info - Centered */}
      <div className="invoice-info-thermal">
        <h2 className="invoice-title">INVOICE</h2>
        <p className="invoice-detail">Invoice #: {invoice.invoice_number}</p>
        <p className="invoice-detail">
          Date: {formatDate(invoice.invoice_date)}
        </p>
        <p className="invoice-detail">
          Due Date: {formatDate(invoice.due_date)}
        </p>
      </div>

      <div className="divider" />

      {/* Vendor Information */}
      <div className="vendor-section-thermal">
        <p className="section-label">BILL TO:</p>
        <p className="vendor-name-thermal">{invoice.vendor_name}</p>
        {invoice.reference_number && (
          <p className="reference-thermal">Ref: {invoice.reference_number}</p>
        )}
      </div>

      <div className="divider" />

      {/* Items - Simple list format for thermal */}
      <div className="items-section-thermal">
        <div className="items-header-thermal">
          <span className="item-desc-header">DESCRIPTION</span>
          <span className="item-qty-header">QTY</span>
          <span className="item-total-header">TOTAL</span>
        </div>
        <div className="divider-thin" />
        {invoice.items.map((item, index) => (
          <div key={item.id || index} className="item-row-thermal">
            <div className="item-desc-thermal">{item.item_description}</div>
            <div className="item-details-thermal">
              <span>
                {parseFloat(String(item.quantity)).toFixed(2)} {item.unit} x{" "}
                {formatCurrency(item.unit_price)}
              </span>
              <span className="item-total-thermal">
                {formatCurrency(item.line_total)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="divider" />

      {/* Totals Section - Thermal format */}
      <div className="totals-section-thermal">
        <div className="totals-row-thermal">
          <span className="totals-label-thermal">Subtotal:</span>
          <span className="totals-value-thermal">
            {formatCurrency(invoice.subtotal)}
          </span>
        </div>
        {parseFloat(invoice.tax_amount) > 0 && (
          <div className="totals-row-thermal">
            <span className="totals-label-thermal">Tax:</span>
            <span className="totals-value-thermal">
              {formatCurrency(invoice.tax_amount)}
            </span>
          </div>
        )}
        {parseFloat(invoice.discount_amount) > 0 && (
          <div className="totals-row-thermal">
            <span className="totals-label-thermal">Discount:</span>
            <span className="totals-value-thermal">
              -{formatCurrency(invoice.discount_amount)}
            </span>
          </div>
        )}
        <div className="divider" />
        <div className="totals-row-thermal total-row-thermal">
          <span className="totals-label-thermal">TOTAL:</span>
          <span className="totals-value-thermal">
            {formatCurrency(invoice.total_amount)}
          </span>
        </div>
        {parseFloat(invoice.amount_paid) > 0 && (
          <>
            <div className="totals-row-thermal">
              <span className="totals-label-thermal">Paid:</span>
              <span className="totals-value-thermal">
                {formatCurrency(invoice.amount_paid)}
              </span>
            </div>
            <div className="divider-thin" />
            <div className="totals-row-thermal balance-row-thermal">
              <span className="totals-label-thermal">Balance Due:</span>
              <span className="totals-value-thermal">
                {formatCurrency(invoice.amount_due)}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Notes - Thermal format */}
      {invoice.notes && (
        <>
          <div className="divider" />
          <div className="notes-section-thermal">
            <p className="section-label-thermal">Notes:</p>
            <p className="notes-text-thermal">{invoice.notes}</p>
          </div>
        </>
      )}

      {/* Terms and Conditions - Thermal format */}
      {invoice.terms_and_conditions && (
        <>
          <div className="divider-thin" />
          <div className="terms-section-thermal">
            <p className="section-label-thermal">Terms & Conditions:</p>
            <p className="terms-text-thermal">{invoice.terms_and_conditions}</p>
          </div>
        </>
      )}

      <div className="divider" />

      {/* Footer - Centered for thermal */}
      <div className="invoice-footer-thermal">
        <p className="footer-text-thermal">Thank you for your business!</p>
        <p className="footer-text-thermal">
          Generated: {new Date().toLocaleString("en-IN")}
        </p>
        <p className="footer-text-thermal">
          ichhadhari-dairy.vercel.app/vendors/in
        </p>
        <p className="footer-text-thermal">voices/{invoice.id}</p>
      </div>
    </div>
  );
}
