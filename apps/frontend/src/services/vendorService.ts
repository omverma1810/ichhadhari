import { apiClient, handleApiError } from "@/lib/api-client";
import type { PaginatedResponse, Vendor } from "@/types/api";

export const vendorService = {
  /**
   * Get all vendors
   */
  getVendors: async (params?: {
    page?: number;
    page_size?: number;
    vendor_type?: string;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<Vendor>> => {
    try {
      return await apiClient.get<PaginatedResponse<Vendor>>(
        "/api/vendors/vendors/",
        params
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get single vendor
   */
  getVendor: async (id: number): Promise<Vendor> => {
    try {
      return await apiClient.get<Vendor>(`/api/vendors/vendors/${id}/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Create vendor
   */
  createVendor: async (data: {
    company_name: string;
    category: string;
    contact_person: string;
    phone: string;
    alternate_phone?: string;
    email?: string;
    website?: string;
    billing_address: string;
    shipping_address?: string;
    gst_number?: string;
    pan_number?: string;
    company_registration_number?: string;
    bank_name?: string;
    account_number?: string;
    ifsc_code?: string;
    account_holder_name?: string;
    credit_period_days?: number;
    credit_limit?: string | number;
    payment_method?: string;
    discount_percentage?: number;
    rating?: number;
    notes?: string;
  }): Promise<Vendor> => {
    try {
      const formattedData = {
        company_name: data.company_name,
        category: data.category,
        contact_person: data.contact_person,
        phone: data.phone,
        alternate_phone: data.alternate_phone || "",
        email: data.email || "",
        website: data.website || "",
        billing_address: data.billing_address,
        shipping_address: data.shipping_address || "",
        gst_number: data.gst_number || "",
        pan_number: data.pan_number || "",
        company_registration_number: data.company_registration_number || "",
        bank_name: data.bank_name || "",
        account_number: data.account_number || "",
        ifsc_code: data.ifsc_code || "",
        account_holder_name: data.account_holder_name || "",
        credit_period_days: data.credit_period_days ?? 30,
        credit_limit: data.credit_limit ? String(data.credit_limit) : "0.00",
        payment_method: data.payment_method || "bank_transfer",
        discount_percentage: data.discount_percentage ?? 0,
        rating: data.rating ?? 3,
        status: "active",
        notes: data.notes || "",
      };

      console.log("📤 Creating vendor:", formattedData);
      const response = await apiClient.post<Vendor>(
        "/api/vendors/vendors/",
        formattedData
      );
      console.log("✅ Vendor created:", response);
      return response;
    } catch (error) {
      console.error("❌ Failed to create vendor:", error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Update vendor
   */
  updateVendor: async (id: number, data: Partial<Vendor>): Promise<Vendor> => {
    try {
      const formattedData: any = {};
      if (data.company_name !== undefined)
        formattedData.company_name = data.company_name;
      if (data.category !== undefined) formattedData.category = data.category;
      if (data.contact_person !== undefined)
        formattedData.contact_person = data.contact_person;
      if (data.phone !== undefined) formattedData.phone = data.phone;
      if (data.alternate_phone !== undefined)
        formattedData.alternate_phone = data.alternate_phone;
      if (data.email !== undefined) formattedData.email = data.email;
      if (data.website !== undefined) formattedData.website = data.website;
      if (data.billing_address !== undefined)
        formattedData.billing_address = data.billing_address;
      if (data.shipping_address !== undefined)
        formattedData.shipping_address = data.shipping_address;
      if (data.gst_number !== undefined)
        formattedData.gst_number = data.gst_number;
      if (data.pan_number !== undefined)
        formattedData.pan_number = data.pan_number;
      if (data.company_registration_number !== undefined)
        formattedData.company_registration_number =
          data.company_registration_number;
      if (data.bank_name !== undefined)
        formattedData.bank_name = data.bank_name;
      if (data.account_number !== undefined)
        formattedData.account_number = data.account_number;
      if (data.ifsc_code !== undefined)
        formattedData.ifsc_code = data.ifsc_code;
      if (data.account_holder_name !== undefined)
        formattedData.account_holder_name = data.account_holder_name;
      if (data.credit_period_days !== undefined)
        formattedData.credit_period_days = data.credit_period_days;
      if (data.credit_limit !== undefined)
        formattedData.credit_limit = String(data.credit_limit);
      if (data.payment_method !== undefined)
        formattedData.payment_method = data.payment_method;
      if (data.discount_percentage !== undefined)
        formattedData.discount_percentage = data.discount_percentage;
      if (data.rating !== undefined) formattedData.rating = data.rating;
      if (data.status !== undefined) formattedData.status = data.status;
      if (data.notes !== undefined) formattedData.notes = data.notes;

      console.log("📤 Updating vendor:", formattedData);
      const response = await apiClient.put<Vendor>(
        `/api/vendors/vendors/${id}/`,
        formattedData
      );
      console.log("✅ Vendor updated:", response);
      return response;
    } catch (error) {
      console.error("❌ Failed to update vendor:", error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Delete vendor
   */
  deleteVendor: async (id: number): Promise<void> => {
    try {
      console.log("🗑️ Deleting vendor:", id);
      await apiClient.delete(`/api/vendors/vendors/${id}/`);
      console.log("✅ Vendor deleted");
    } catch (error) {
      console.error("❌ Failed to delete vendor:", error);
      throw new Error(handleApiError(error));
    }
  },
};
