import type { PaginationParams, PaginatedResponse } from "./milk";
import type {
  Vendor,
  VendorPerformance,
  VendorSummary,
  VendorDocument,
  VendorStatus,
  VendorType,
} from "@/types/vendor";
import {
  mockVendors,
  mockVendorPerformance,
  mockVendorSummary,
  mockPurchaseOrders,
  mockPayments,
  mockInvoices,
  mockVendorListReport,
} from "./mockData";

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const clone = <T>(value: T): T => {
  if (typeof globalThis.structuredClone === "function") {
    return globalThis.structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
};

const matchesFilter = (vendor: Vendor, filters?: VendorFilters) => {
  if (!filters) return true;
  if (filters.status && vendor.status !== filters.status) return false;
  if (filters.type && vendor.vendor_type !== filters.type) return false;
  if (filters.search) {
    const query = filters.search.toLowerCase();
    const pool = [
      vendor.company_name,
      vendor.vendor_id,
      vendor.contact_persons[0]?.name ?? "",
      vendor.email,
      vendor.phone,
    ]
      .join(" ")
      .toLowerCase();
    if (!pool.includes(query)) return false;
  }
  return true;
};

export interface VendorFilters extends PaginationParams {
  status?: VendorStatus;
  type?: VendorType;
}

export const vendorAPI = {
  async getVendors(
    params: VendorFilters = {}
  ): Promise<PaginatedResponse<Vendor>> {
    await delay(400);

    const filtered = mockVendors.filter((vendor) =>
      matchesFilter(vendor, params)
    );
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      results: clone(filtered.slice(start, end)),
      total: filtered.length,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
    };
  },

  async getVendor(id: string): Promise<Vendor> {
    await delay(300);
    const vendor = mockVendors.find(
      (entry) => entry.id === id || entry.vendor_id === id
    );
    if (!vendor) {
      throw new Error("Vendor not found");
    }
    return clone(vendor);
  },

  async createVendor(data: Partial<Vendor>): Promise<Vendor> {
    await delay(600);
    const newVendor: Vendor = {
      id: `vendor-${Date.now()}`,
      vendor_id: `VEN-${String(mockVendors.length + 1).padStart(3, "0")}`,
      company_name: data.company_name ?? "New Vendor",
      vendor_type: data.vendor_type ?? "other",
      status: data.status ?? "active",
      contact_persons: data.contact_persons ?? [],
      phone: data.phone ?? "",
      email: data.email ?? "",
      gst_number: data.gst_number,
      pan_number: data.pan_number,
      registration_number: data.registration_number,
      billing_address: data.billing_address ?? {
        street: "",
        city: "",
        state: "",
        postal_code: "",
        country: "India",
      },
      shipping_address: data.shipping_address ??
        data.billing_address ?? {
          street: "",
          city: "",
          state: "",
          postal_code: "",
          country: "India",
        },
      warehouse_address: data.warehouse_address,
      bank_details: data.bank_details,
      credit_period_days: data.credit_period_days ?? 30,
      credit_limit: data.credit_limit ?? 0,
      payment_methods: data.payment_methods ?? ["bank_transfer"],
      preferred_payment_method:
        data.preferred_payment_method ?? "bank_transfer",
      discount_percentage: data.discount_percentage ?? 0,
      rating: data.rating ?? 4,
      total_purchases: 0,
      total_payments: 0,
      outstanding_balance: 0,
      documents: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: data.created_by ?? "admin@ichhadhari.com",
    };

    mockVendors.unshift(newVendor);
    return clone(newVendor);
  },

  async updateVendor(id: string, data: Partial<Vendor>): Promise<Vendor> {
    await delay(500);
    const index = mockVendors.findIndex((vendor) => vendor.id === id);
    if (index === -1) {
      throw new Error("Vendor not found");
    }

    mockVendors[index] = {
      ...mockVendors[index],
      ...data,
      updated_at: new Date().toISOString(),
    };

    return clone(mockVendors[index]);
  },

  async deleteVendor(id: string): Promise<void> {
    await delay(400);
    const index = mockVendors.findIndex((vendor) => vendor.id === id);
    if (index !== -1) {
      mockVendors.splice(index, 1);
    }
  },

  async getPerformance(id: string): Promise<VendorPerformance> {
    await delay(300);
    const performance = mockVendorPerformance.find(
      (entry) => entry.vendor_id === id
    );
    if (!performance) {
      return {
        vendor_id: id,
        quality_score: 0,
        delivery_punctuality: 0,
        order_accuracy: 0,
        payment_reliability: 0,
        overall_rating: 0,
        total_orders: 0,
        on_time_deliveries: 0,
        defective_items_count: 0,
        performance_level: "average",
        recommendation: "review",
        last_updated: new Date().toISOString(),
      };
    }
    return clone(performance);
  },

  async getSummary(): Promise<VendorSummary> {
    await delay(250);
    return clone(mockVendorSummary);
  },

  async getVendorOrders(vendorId: string) {
    await delay(350);
    return clone(
      mockPurchaseOrders.filter((order) => order.vendor_id === vendorId)
    );
  },

  async getVendorPayments(vendorId: string) {
    await delay(350);
    return clone(
      mockPayments.filter((payment) => payment.vendor_id === vendorId)
    );
  },

  async getVendorInvoices(vendorId: string) {
    await delay(350);
    return clone(
      mockInvoices.filter((invoice) => invoice.vendor_id === vendorId)
    );
  },

  async addDocument(
    id: string,
    document: VendorDocument
  ): Promise<VendorDocument[]> {
    await delay(400);
    const vendor = mockVendors.find((entry) => entry.id === id);
    if (!vendor) {
      throw new Error("Vendor not found");
    }
    vendor.documents.push(document);
    vendor.updated_at = new Date().toISOString();
    return clone(vendor.documents);
  },

  async removeDocument(id: string, documentId: string): Promise<void> {
    await delay(300);
    const vendor = mockVendors.find((entry) => entry.id === id);
    if (!vendor) {
      throw new Error("Vendor not found");
    }
    vendor.documents = vendor.documents.filter((doc) => doc.id !== documentId);
    vendor.updated_at = new Date().toISOString();
  },

  async exportVendors(): Promise<Blob> {
    await delay(800);
    return new Blob(["mock vendor export"], { type: "text/csv" });
  },

  async getVendorReport() {
    await delay(400);
    return clone(mockVendorListReport);
  },
};
