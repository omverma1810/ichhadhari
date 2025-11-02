import type { PaginatedResponse, PaginationParams } from "./milk";
import type {
  Payment,
  OutstandingBalance,
  PaymentReminder,
} from "@/types/payment";
import {
  mockPayments,
  mockOutstandingBalances,
  mockPaymentReminders,
} from "./mockData";

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const clone = <T>(value: T): T => {
  if (typeof globalThis.structuredClone === "function") {
    return globalThis.structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
};

export interface PaymentFilters extends PaginationParams {
  vendorId?: string;
  paymentType?: Payment["payment_type"];
  reconciled?: boolean;
}

const filterPayments = (payments: Payment[], filters: PaymentFilters) => {
  let output = [...payments];

  if (filters.vendorId) {
    output = output.filter((entry) => entry.vendor_id === filters.vendorId);
  }

  if (filters.paymentType) {
    output = output.filter(
      (entry) => entry.payment_type === filters.paymentType
    );
  }

  if (filters.reconciled !== undefined) {
    output = output.filter((entry) => entry.reconciled === filters.reconciled);
  }

  if (filters.search) {
    const query = filters.search.toLowerCase();
    output = output.filter((entry) =>
      [entry.payment_id, entry.reference_number, entry.remarks ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }

  return output;
};

export const paymentAPI = {
  async getPayments(
    params: PaymentFilters = {}
  ): Promise<PaginatedResponse<Payment>> {
    await delay(400);
    const filtered = filterPayments(mockPayments, params);
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

  async getPayment(id: string): Promise<Payment> {
    await delay(300);
    const payment = mockPayments.find(
      (entry) => entry.id === id || entry.payment_id === id
    );
    if (!payment) {
      throw new Error("Payment not found");
    }
    return clone(payment);
  },

  async recordPayment(data: Partial<Payment>): Promise<Payment> {
    await delay(600);
    const payment: Payment = {
      id: `payment-${Date.now()}`,
      payment_id:
        data.payment_id ??
        `PAY-${new Date().getFullYear()}-${String(
          mockPayments.length + 1
        ).padStart(3, "0")}`,
      vendor_id: data.vendor_id ?? "",
      payment_date: data.payment_date ?? new Date().toISOString(),
      amount: data.amount ?? 0,
      payment_method: data.payment_method ?? "bank_transfer",
      reference_number: data.reference_number ?? "",
      payment_type: data.payment_type ?? "full",
      purchase_order_ids: data.purchase_order_ids ?? [],
      invoice_ids: data.invoice_ids ?? [],
      reconciled: data.reconciled ?? false,
      reconciliation_date: data.reconciliation_date,
      remarks: data.remarks,
      documents: data.documents ?? [],
      created_by: data.created_by ?? "accounts@ichhadhari.com",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockPayments.unshift(payment);
    return clone(payment);
  },

  async updatePayment(id: string, data: Partial<Payment>): Promise<Payment> {
    await delay(500);
    const index = mockPayments.findIndex((entry) => entry.id === id);
    if (index === -1) {
      throw new Error("Payment not found");
    }

    mockPayments[index] = {
      ...mockPayments[index],
      ...data,
      updated_at: new Date().toISOString(),
    };

    return clone(mockPayments[index]);
  },

  async getOutstandingBalances(): Promise<OutstandingBalance[]> {
    await delay(350);
    return clone(mockOutstandingBalances);
  },

  async getPaymentReminders(): Promise<PaymentReminder[]> {
    await delay(350);
    return clone(mockPaymentReminders);
  },
};
