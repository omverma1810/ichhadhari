import type { GoodsReceiptNote, ReturnOrder } from "@/types/purchase-order";
import { mockGoodsReceiptNotes, mockReturnOrders } from "./mockData";

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const clone = <T>(value: T): T => {
  if (typeof globalThis.structuredClone === "function") {
    return globalThis.structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
};

export const goodsReceiptAPI = {
  async createGoodsReceipt(data: GoodsReceiptNote): Promise<GoodsReceiptNote> {
    await delay(600);
    const note: GoodsReceiptNote = {
      ...data,
      id: data.id ?? `grn-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockGoodsReceiptNotes.unshift(note);
    return clone(note);
  },

  async getGoodsReceipt(id: string): Promise<GoodsReceiptNote> {
    await delay(350);
    const note = mockGoodsReceiptNotes.find((entry) => entry.id === id);
    if (!note) {
      throw new Error("Goods receipt not found");
    }
    return clone(note);
  },

  async updateGoodsReceipt(id: string, data: Partial<GoodsReceiptNote>) {
    await delay(500);
    const index = mockGoodsReceiptNotes.findIndex((entry) => entry.id === id);
    if (index === -1) {
      throw new Error("Goods receipt not found");
    }

    mockGoodsReceiptNotes[index] = {
      ...mockGoodsReceiptNotes[index],
      ...data,
      updated_at: new Date().toISOString(),
    };

    return clone(mockGoodsReceiptNotes[index]);
  },

  async createReturnOrder(data: ReturnOrder): Promise<ReturnOrder> {
    await delay(600);
    const order: ReturnOrder = {
      ...data,
      id: data.id ?? `return-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockReturnOrders.unshift(order);
    return clone(order);
  },

  async getReturnOrder(id: string): Promise<ReturnOrder> {
    await delay(300);
    const entry = mockReturnOrders.find((order) => order.id === id);
    if (!entry) {
      throw new Error("Return order not found");
    }
    return clone(entry);
  },
};
