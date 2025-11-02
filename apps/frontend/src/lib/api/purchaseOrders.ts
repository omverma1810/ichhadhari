import type { PaginatedResponse, PaginationParams } from "./milk";
import type {
  PurchaseOrder,
  POStatus,
  PurchaseRequisition,
  GoodsReceiptNote,
  ReturnOrder,
} from "@/types/purchase-order";
import {
  mockPurchaseOrders,
  mockPurchaseRequisitions,
  mockGoodsReceiptNotes,
  mockReturnOrders,
  mockVendors,
} from "./mockData";

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const clone = <T>(value: T): T => {
  if (typeof globalThis.structuredClone === "function") {
    return globalThis.structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
};

export interface PurchaseOrderFilters extends PaginationParams {
  status?: POStatus;
  vendorId?: string;
  deliveryLocation?: string;
  recurring?: boolean;
}

const filterOrders = (
  orders: PurchaseOrder[],
  filters: PurchaseOrderFilters
) => {
  let output = [...orders];

  if (filters.vendorId) {
    output = output.filter((order) => order.vendor_id === filters.vendorId);
  }

  if (filters.status) {
    output = output.filter((order) => order.status === filters.status);
  }

  if (filters.deliveryLocation) {
    output = output.filter(
      (order) => order.delivery_location === filters.deliveryLocation
    );
  }

  if (filters.recurring !== undefined) {
    output = output.filter((order) => order.is_recurring === filters.recurring);
  }

  if (filters.search) {
    const query = filters.search.toLowerCase();
    output = output.filter((order) =>
      [
        order.po_number,
        order.vendor.company_name,
        order.vendor.vendor_id,
        ...order.items.map((item) => item.product_name),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }

  if (filters.sortBy) {
    const { sortBy, sortOrder } = filters;
    output = output.sort((a, b) => {
      const order = sortOrder === "desc" ? -1 : 1;
      switch (sortBy) {
        case "order_date":
          return (
            order *
            (new Date(a.order_date).getTime() -
              new Date(b.order_date).getTime())
          );
        case "total_amount":
          return order * (a.total_amount - b.total_amount);
        default:
          return order * a.po_number.localeCompare(b.po_number);
      }
    });
  }

  return output;
};

export const purchaseOrderAPI = {
  async getPurchaseOrders(
    params: PurchaseOrderFilters = {}
  ): Promise<PaginatedResponse<PurchaseOrder>> {
    await delay(450);
    const filtered = filterOrders(mockPurchaseOrders, params);
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

  async getPurchaseOrder(id: string): Promise<PurchaseOrder> {
    await delay(350);
    const order = mockPurchaseOrders.find(
      (entry) => entry.id === id || entry.po_number === id
    );
    if (!order) {
      throw new Error("Purchase order not found");
    }
    return clone(order);
  },

  async getRequisitions(): Promise<PurchaseRequisition[]> {
    await delay(400);
    return clone(mockPurchaseRequisitions);
  },

  async getRequisition(id: string): Promise<PurchaseRequisition> {
    await delay(350);
    const requisition = mockPurchaseRequisitions.find(
      (entry) => entry.id === id || entry.requisition_id === id
    );
    if (!requisition) {
      throw new Error("Requisition not found");
    }
    return clone(requisition);
  },

  async createPurchaseOrder(
    data: Partial<PurchaseOrder>
  ): Promise<PurchaseOrder> {
    await delay(700);
    const vendor = mockVendors.find((entry) => entry.id === data.vendor_id);
    if (!vendor) {
      throw new Error("Vendor not found");
    }

    const order: PurchaseOrder = {
      id: `po-${Date.now()}`,
      po_number: `PO-${new Date().getFullYear()}-${String(
        mockPurchaseOrders.length + 1
      ).padStart(3, "0")}`,
      vendor_id: vendor.id,
      vendor,
      status: data.status ?? "draft",
      order_date: data.order_date ?? new Date().toISOString(),
      expected_delivery_date:
        data.expected_delivery_date ??
        new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      actual_delivery_date: data.actual_delivery_date,
      items: data.items ?? [],
      subtotal: data.subtotal ?? 0,
      tax_amount: data.tax_amount ?? 0,
      total_amount: data.total_amount ?? 0,
      delivery_location: data.delivery_location ?? "warehouse",
      is_recurring: data.is_recurring ?? false,
      recurring_frequency: data.recurring_frequency,
      next_recurring_date: data.next_recurring_date,
      po_qr_code: data.po_qr_code,
      special_instructions: data.special_instructions,
      created_by: data.created_by ?? "procurement@ichhadhari.com",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockPurchaseOrders.unshift(order);
    return clone(order);
  },

  async updatePurchaseOrder(
    id: string,
    data: Partial<PurchaseOrder>
  ): Promise<PurchaseOrder> {
    await delay(600);
    const index = mockPurchaseOrders.findIndex((entry) => entry.id === id);
    if (index === -1) {
      throw new Error("Purchase order not found");
    }

    mockPurchaseOrders[index] = {
      ...mockPurchaseOrders[index],
      ...data,
      updated_at: new Date().toISOString(),
    };

    return clone(mockPurchaseOrders[index]);
  },

  async updateStatus(id: string, status: POStatus): Promise<PurchaseOrder> {
    return this.updatePurchaseOrder(id, { status });
  },

  async getGoodsReceipts(poId: string): Promise<GoodsReceiptNote[]> {
    await delay(400);
    return clone(
      mockGoodsReceiptNotes.filter((note) => note.purchase_order_id === poId)
    );
  },

  async getReturnOrders(poId: string): Promise<ReturnOrder[]> {
    await delay(400);
    const grnIds = mockGoodsReceiptNotes
      .filter((note) => note.purchase_order_id === poId)
      .map((note) => note.id);
    return clone(
      mockReturnOrders.filter((entry) => grnIds.includes(entry.grn_id))
    );
  },
};
