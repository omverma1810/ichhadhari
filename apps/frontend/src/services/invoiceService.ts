import { apiClient, handleApiError } from "@/lib/api-client";
import type {
  PaginatedResponse,
  VendorInvoice,
  VendorInvoiceListItem,
  CreateVendorInvoicePayload,
} from "@/types/api";

export const invoiceService = {
  /**
   * Get all invoices
   */
  getInvoices: async (params?: {
    page?: number;
    page_size?: number;
    vendor?: number;
    status?: string;
    payment_status?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<PaginatedResponse<VendorInvoiceListItem>> => {
    try {
      return await apiClient.get<PaginatedResponse<VendorInvoiceListItem>>(
        "/api/vendors/invoices/",
        params
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get single invoice
   */
  getInvoice: async (id: number): Promise<VendorInvoice> => {
    try {
      return await apiClient.get<VendorInvoice>(`/api/vendors/invoices/${id}/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Create invoice
   */
  createInvoice: async (
    data: CreateVendorInvoicePayload
  ): Promise<VendorInvoice> => {
    try {
      const formattedData = {
        vendor: data.vendor,
        invoice_date: data.invoice_date,
        due_date: data.due_date,
        total_amount: String(data.total_amount),
        items: data.items.map((item) => ({
          item_description: item.item_description,
          quantity: String(item.quantity),
          unit: item.unit,
          unit_price: String(item.unit_price),
          tax_rate: item.tax_rate ? String(item.tax_rate) : "0",
          discount_percentage: item.discount_percentage
            ? String(item.discount_percentage)
            : "0",
        })),
        notes: data.notes || "",
        terms_and_conditions: data.terms_and_conditions || "",
        reference_number: data.reference_number || "",
      };

      console.log("📤 Creating invoice:", formattedData);
      const response = await apiClient.post<VendorInvoice>(
        "/api/vendors/invoices/",
        formattedData
      );
      console.log("✅ Invoice created:", response);
      return response;
    } catch (error) {
      console.error("❌ Failed to create invoice:", error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Update invoice
   */
  updateInvoice: async (
    id: number,
    data: Partial<VendorInvoice>
  ): Promise<VendorInvoice> => {
    try {
      console.log("📤 Updating invoice:", data);
      const response = await apiClient.put<VendorInvoice>(
        `/api/vendors/invoices/${id}/`,
        data
      );
      console.log("✅ Invoice updated:", response);
      return response;
    } catch (error) {
      console.error("❌ Failed to update invoice:", error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Delete invoice
   */
  deleteInvoice: async (id: number): Promise<void> => {
    try {
      console.log("🗑️ Deleting invoice:", id);
      await apiClient.delete(`/api/vendors/invoices/${id}/`);
      console.log("✅ Invoice deleted");
    } catch (error) {
      console.error("❌ Failed to delete invoice:", error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Mark invoice as paid
   */
  markAsPaid: async (id: number): Promise<VendorInvoice> => {
    try {
      return await apiClient.post<VendorInvoice>(
        `/api/vendors/invoices/${id}/mark_as_paid/`
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Record payment
   */
  recordPayment: async (
    id: number,
    amount: string | number
  ): Promise<VendorInvoice> => {
    try {
      return await apiClient.post<VendorInvoice>(
        `/api/vendors/invoices/${id}/record_payment/`,
        { amount: String(amount) }
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get print format
   */
  getPrintFormat: async (id: number): Promise<{ text: string }> => {
    try {
      return await apiClient.get<{ text: string }>(
        `/api/vendors/invoices/${id}/print_format/`
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
