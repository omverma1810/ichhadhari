"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, Printer, CheckCircle, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { invoiceService } from "@/services/invoiceService";
import type { VendorInvoice } from "@/types/api";
import { InvoicePrintTemplate } from "@/components/invoices/InvoicePrintTemplate";
import { useQueryClient } from "@tanstack/react-query";
import { vendorKeys } from "@/hooks/api/useVendorsEmployees";

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
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
      alert(err.message || "Failed to load invoice");
      router.push("/vendors/invoices");
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
      window.print();
    } catch (err) {
      alert("Failed to download PDF");
    }
  };

  const handleMarkAsPaid = async () => {
    if (!invoice) return;

    try {
      const updated = await invoiceService.markAsPaid(invoice.id);
      setInvoice(updated);
      queryClient.invalidateQueries({ queryKey: vendorKeys.all });
    } catch (err: any) {
      alert(err.message || "Failed to mark as paid");
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
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Invoices
            </Button>
          </Link>
          <div className="flex gap-3">
            {invoice.payment_status !== ("paid" as any) && (
              <Button
                variant="default"
                size="sm"
                onClick={handleMarkAsPaid}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Paid
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="default" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
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
