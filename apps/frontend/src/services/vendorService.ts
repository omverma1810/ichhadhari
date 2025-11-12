import { apiClient, handleApiError } from '@/lib/api-client';
import type { PaginatedResponse, Vendor } from '@/types/api';

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
        '/api/vendors/',
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
      return await apiClient.get<Vendor>(`/api/vendors/${id}/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Create vendor
   */
  createVendor: async (data: {
    name: string;
    contact_person: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    gst_number?: string;
    pan_number?: string;
    vendor_type: 'supplier' | 'service_provider' | 'both';
    payment_terms?: string;
    credit_limit?: string | number;
  }): Promise<Vendor> => {
    try {
      const formattedData = {
        name: data.name,
        contact_person: data.contact_person,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        gst_number: data.gst_number || '',
        pan_number: data.pan_number || '',
        vendor_type: data.vendor_type,
        payment_terms: data.payment_terms || '30',
        credit_limit: data.credit_limit ? String(data.credit_limit) : '0.00',
        current_balance: '0.00',
        status: 'active',
        rating: 5,
        is_active: true,
      };

      console.log('📤 Creating vendor:', formattedData);
      const response = await apiClient.post<Vendor>('/api/vendors/', formattedData);
      console.log('✅ Vendor created:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to create vendor:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Update vendor
   */
  updateVendor: async (id: number, data: Partial<Vendor>): Promise<Vendor> => {
    try {
      const formattedData: any = {};
      if (data.name !== undefined) formattedData.name = data.name;
      if (data.contact_person !== undefined) formattedData.contact_person = data.contact_person;
      if (data.email !== undefined) formattedData.email = data.email;
      if (data.phone !== undefined) formattedData.phone = data.phone;
      if (data.address !== undefined) formattedData.address = data.address;
      if (data.city !== undefined) formattedData.city = data.city;
      if (data.state !== undefined) formattedData.state = data.state;
      if (data.pincode !== undefined) formattedData.pincode = data.pincode;
      if (data.vendor_type !== undefined) formattedData.vendor_type = data.vendor_type;
      if (data.status !== undefined) formattedData.status = data.status;
      if (data.is_active !== undefined) formattedData.is_active = data.is_active;

      console.log('📤 Updating vendor:', formattedData);
      const response = await apiClient.put<Vendor>(`/api/vendors/${id}/`, formattedData);
      console.log('✅ Vendor updated:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to update vendor:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Delete vendor
   */
  deleteVendor: async (id: number): Promise<void> => {
    try {
      console.log('🗑️ Deleting vendor:', id);
      await apiClient.delete(`/api/vendors/${id}/`);
      console.log('✅ Vendor deleted');
    } catch (error) {
      console.error('❌ Failed to delete vendor:', error);
      throw new Error(handleApiError(error));
    }
  },
};
