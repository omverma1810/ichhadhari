/**
 * Procurement React Query Hooks
 * Custom hooks for fetching and mutating procurement data
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  procurementService,
  type Vendor,
  type VendorFormData,
  type MilkCollection,
  type MilkCollectionFormData,
  type QualityTest,
  type QualityTestFormData,
} from "@/lib/services/procurement.service";

// ==================== QUERY KEYS ====================

export const procurementKeys = {
  all: ["procurement"] as const,
  vendors: () => [...procurementKeys.all, "vendors"] as const,
  vendorsList: (filters?: Record<string, any>) =>
    [...procurementKeys.vendors(), "list", filters] as const,
  vendor: (id: number) => [...procurementKeys.vendors(), id] as const,

  collections: () => [...procurementKeys.all, "collections"] as const,
  collectionsList: (filters?: Record<string, any>) =>
    [...procurementKeys.collections(), "list", filters] as const,
  collection: (id: number) => [...procurementKeys.collections(), id] as const,

  qualityTests: () => [...procurementKeys.all, "quality-tests"] as const,
  qualityTestsList: (filters?: Record<string, any>) =>
    [...procurementKeys.qualityTests(), "list", filters] as const,
  qualityTest: (id: number) => [...procurementKeys.qualityTests(), id] as const,
};

// ==================== VENDOR HOOKS ====================

/**
 * Hook to fetch vendors list with optional filters
 */
export function useVendors(filters?: {
  page?: number;
  search?: string;
  status?: string;
  milk_type?: string;
}) {
  return useQuery({
    queryKey: procurementKeys.vendorsList(filters),
    queryFn: async () => {
      try {
        const response = await procurementService.getVendors(filters);
        return response;
      } catch (error) {
        console.error("Failed to fetch vendors:", error);
        throw error;
      }
    },
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to fetch a single vendor
 */
export function useVendor(id: number) {
  return useQuery({
    queryKey: procurementKeys.vendor(id),
    queryFn: async () => {
      try {
        const vendor = await procurementService.getVendor(id);
        return vendor;
      } catch (error) {
        console.error("Failed to fetch vendor:", error);
        throw error;
      }
    },
    enabled: !!id && id > 0,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to create a new vendor
 */
export function useCreateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VendorFormData) => procurementService.createVendor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: procurementKeys.vendors() });
      toast.success("Vendor created successfully!");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to create vendor";
      toast.error(message);
    },
  });
}

/**
 * Hook to update a vendor
 */
export function useUpdateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<VendorFormData> }) =>
      procurementService.updateVendor(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: procurementKeys.vendors() });
      queryClient.invalidateQueries({
        queryKey: procurementKeys.vendor(variables.id),
      });
      toast.success("Vendor updated successfully!");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to update vendor";
      toast.error(message);
    },
  });
}

/**
 * Hook to delete a vendor
 */
export function useDeleteVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => procurementService.deleteVendor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: procurementKeys.vendors() });
      toast.success("Vendor deleted successfully!");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to delete vendor";
      toast.error(message);
    },
  });
}

// ==================== MILK COLLECTION HOOKS ====================

/**
 * Hook to fetch milk collections list with optional filters
 */
export function useMilkCollections(filters?: {
  page?: number;
  search?: string;
  vendor?: number;
  quality_status?: string;
  payment_status?: string;
  start_date?: string;
  end_date?: string;
}) {
  return useQuery({
    queryKey: procurementKeys.collectionsList(filters),
    queryFn: async () => {
      try {
        const response = await procurementService.getMilkCollections(filters);
        return response;
      } catch (error) {
        console.error("Failed to fetch milk collections:", error);
        throw error;
      }
    },
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to fetch a single milk collection
 */
export function useMilkCollection(id: number) {
  return useQuery({
    queryKey: procurementKeys.collection(id),
    queryFn: async () => {
      try {
        const collection = await procurementService.getMilkCollection(id);
        return collection;
      } catch (error) {
        console.error("Failed to fetch milk collection:", error);
        throw error;
      }
    },
    enabled: !!id && id > 0,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to create a new milk collection
 */
export function useCreateMilkCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MilkCollectionFormData) =>
      procurementService.createMilkCollection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: procurementKeys.collections(),
      });
      toast.success("Milk collection recorded successfully!");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to record collection";
      toast.error(message);
    },
  });
}

/**
 * Hook to update a milk collection
 */
export function useUpdateMilkCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<MilkCollectionFormData>;
    }) => procurementService.updateMilkCollection(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: procurementKeys.collections(),
      });
      queryClient.invalidateQueries({
        queryKey: procurementKeys.collection(variables.id),
      });
      toast.success("Collection updated successfully!");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to update collection";
      toast.error(message);
    },
  });
}

/**
 * Hook to delete a milk collection
 */
export function useDeleteMilkCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => procurementService.deleteMilkCollection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: procurementKeys.collections(),
      });
      toast.success("Collection deleted successfully!");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to delete collection";
      toast.error(message);
    },
  });
}

// ==================== QUALITY TEST HOOKS ====================

/**
 * Hook to fetch quality tests list with optional filters
 */
export function useQualityTests(filters?: {
  page?: number;
  collection?: number;
  overall_result?: string;
}) {
  return useQuery({
    queryKey: procurementKeys.qualityTestsList(filters),
    queryFn: () => procurementService.getQualityTests(filters),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch a single quality test
 */
export function useQualityTest(id: number) {
  return useQuery({
    queryKey: procurementKeys.qualityTest(id),
    queryFn: () => procurementService.getQualityTest(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to create a new quality test
 */
export function useCreateQualityTest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: QualityTestFormData) =>
      procurementService.createQualityTest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: procurementKeys.qualityTests(),
      });
      queryClient.invalidateQueries({
        queryKey: procurementKeys.collections(),
      });
      toast.success("Quality test recorded successfully!");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Failed to record test";
      toast.error(message);
    },
  });
}

/**
 * Hook to update a quality test
 */
export function useUpdateQualityTest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<QualityTestFormData>;
    }) => procurementService.updateQualityTest(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: procurementKeys.qualityTests(),
      });
      queryClient.invalidateQueries({
        queryKey: procurementKeys.qualityTest(variables.id),
      });
      toast.success("Quality test updated successfully!");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Failed to update test";
      toast.error(message);
    },
  });
}

/**
 * Hook to delete a quality test
 */
export function useDeleteQualityTest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => procurementService.deleteQualityTest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: procurementKeys.qualityTests(),
      });
      toast.success("Quality test deleted successfully!");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Failed to delete test";
      toast.error(message);
    },
  });
}

// ==================== VENDOR PAYMENT HOOKS ====================

export function useVendorPayments(filters?: {
  page?: number;
  vendor?: number;
  status?: string;
  start_date?: string;
  end_date?: string;
}) {
  return useQuery({
    queryKey: [...procurementKeys.vendors(), "payments", filters] as const,
    queryFn: () => procurementService.getVendorPayments(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useVendorPayment(id: number) {
  return useQuery({
    queryKey: [...procurementKeys.vendors(), "payments", id] as const,
    queryFn: () => procurementService.getVendorPayment(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateVendorPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: import("@/lib/services/procurement.service").VendorPaymentFormData,
    ) => procurementService.createVendorPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: procurementKeys.vendors() });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Payment created successfully!");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to create payment";
      toast.error(message);
    },
  });
}

export function useUpdateVendorPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<
        import("@/lib/services/procurement.service").VendorPaymentFormData
      >;
    }) => procurementService.updateVendorPayment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: procurementKeys.vendors() });
      toast.success("Payment updated successfully!");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to update payment";
      toast.error(message);
    },
  });
}

export function useDeleteVendorPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => procurementService.deleteVendorPayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: procurementKeys.vendors() });
      toast.success("Payment deleted successfully!");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to delete payment";
      toast.error(message);
    },
  });
}

export function useProcessVendorPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reference }: { id: number; reference: string }) =>
      procurementService.processVendorPayment(id, reference),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: procurementKeys.vendors() });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Payment processed successfully!");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to process payment";
      toast.error(message);
    },
  });
}

export function usePendingPayments() {
  return useQuery({
    queryKey: [...procurementKeys.vendors(), "payments", "pending"] as const,
    queryFn: () => procurementService.getPendingPayments(),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useVendorPaymentHistory(vendorId: number) {
  return useQuery({
    queryKey: [
      ...procurementKeys.vendors(),
      "payments",
      "history",
      vendorId,
    ] as const,
    queryFn: () => procurementService.getVendorPaymentHistory(vendorId),
    enabled: !!vendorId && vendorId > 0,
    staleTime: 5 * 60 * 1000,
  });
}

// ==================== PURCHASE ORDER HOOKS ====================

export function usePurchaseOrders(filters?: {
  page?: number;
  vendor?: number;
  status?: string;
  start_date?: string;
  end_date?: string;
}) {
  return useQuery({
    queryKey: [
      ...procurementKeys.vendors(),
      "purchase-orders",
      filters,
    ] as const,
    queryFn: () => procurementService.getPurchaseOrders(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePurchaseOrder(id: number) {
  return useQuery({
    queryKey: [...procurementKeys.vendors(), "purchase-orders", id] as const,
    queryFn: () => procurementService.getPurchaseOrder(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: import("@/lib/services/procurement.service").PurchaseOrderFormData,
    ) => procurementService.createPurchaseOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: procurementKeys.vendors() });
      toast.success("Purchase order created successfully!");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to create purchase order";
      toast.error(message);
    },
  });
}

export function useUpdatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<
        import("@/lib/services/procurement.service").PurchaseOrderFormData
      >;
    }) => procurementService.updatePurchaseOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: procurementKeys.vendors() });
      toast.success("Purchase order updated successfully!");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to update purchase order";
      toast.error(message);
    },
  });
}

export function useDeletePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => procurementService.deletePurchaseOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: procurementKeys.vendors() });
      toast.success("Purchase order deleted successfully!");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to delete purchase order";
      toast.error(message);
    },
  });
}

export function useApprovePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => procurementService.approvePurchaseOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: procurementKeys.vendors() });
      toast.success("Purchase order approved successfully!");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to approve purchase order";
      toast.error(message);
    },
  });
}

export function useActivePurchaseOrders() {
  return useQuery({
    queryKey: [
      ...procurementKeys.vendors(),
      "purchase-orders",
      "active",
    ] as const,
    queryFn: () => procurementService.getActivePurchaseOrders(),
    staleTime: 5 * 60 * 1000,
  });
}

// ==================== GOODS RECEIPT NOTES (GRN) HOOKS ====================

export const grnKeys = {
  all: ["grns"] as const,
  lists: () => [...grnKeys.all, "list"] as const,
  list: (filters?: any) => [...grnKeys.lists(), filters] as const,
  details: () => [...grnKeys.all, "detail"] as const,
  detail: (id: number) => [...grnKeys.details(), id] as const,
};

export function useGoodsReceiptNotes(filters?: {
  page?: number;
  purchase_order?: number;
  quality_status?: string;
  start_date?: string;
  end_date?: string;
}) {
  return useQuery({
    queryKey: grnKeys.list(filters),
    queryFn: () => procurementService.getGoodsReceiptNotes(filters),
    staleTime: 2 * 60 * 1000,
  });
}

export function useGoodsReceiptNote(id: number) {
  return useQuery({
    queryKey: grnKeys.detail(id),
    queryFn: () => procurementService.getGoodsReceiptNote(id),
    enabled: !!id && id > 0,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateGoodsReceiptNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => procurementService.createGoodsReceiptNote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: grnKeys.lists() });
      queryClient.invalidateQueries({ queryKey: procurementKeys.vendors() });
      toast.success("Goods receipt note created successfully!");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to create goods receipt note";
      toast.error(message);
    },
  });
}

export function useUpdateGoodsReceiptNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      procurementService.updateGoodsReceiptNote(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: grnKeys.lists() });
      queryClient.invalidateQueries({ queryKey: grnKeys.detail(variables.id) });
      toast.success("Goods receipt note updated successfully!");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to update goods receipt note";
      toast.error(message);
    },
  });
}

export function useDeleteGoodsReceiptNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => procurementService.deleteGoodsReceiptNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: grnKeys.lists() });
      toast.success("Goods receipt note deleted successfully!");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to delete goods receipt note";
      toast.error(message);
    },
  });
}

// ==================== INVENTORY ANALYTICS HOOKS ====================

export const analyticsKeys = {
  all: ["inventory-analytics"] as const,
  dashboard: () => [...analyticsKeys.all, "dashboard"] as const,
  stockMovement: (filters?: any) =>
    [...analyticsKeys.all, "stock-movement", filters] as const,
  valuation: () => [...analyticsKeys.all, "valuation"] as const,
  turnover: (days?: number) =>
    [...analyticsKeys.all, "turnover", days] as const,
};

export function useInventoryDashboard() {
  return useQuery({
    queryKey: analyticsKeys.dashboard(),
    queryFn: () => {
      // Import dynamically to avoid circular dependency
      return import("@/lib/services/procurement.service").then((mod) =>
        mod.inventoryAnalyticsService.getDashboardData(),
      );
    },
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useStockMovementReport(filters?: {
  start_date?: string;
  end_date?: string;
  item_type?: string;
}) {
  return useQuery({
    queryKey: analyticsKeys.stockMovement(filters),
    queryFn: () =>
      import("@/lib/services/procurement.service").then((mod) =>
        mod.inventoryAnalyticsService.getStockMovementReport(filters),
      ),
    staleTime: 2 * 60 * 1000,
    enabled: !!(filters?.start_date && filters?.end_date),
  });
}

export function useValuationReport() {
  return useQuery({
    queryKey: analyticsKeys.valuation(),
    queryFn: () =>
      import("@/lib/services/procurement.service").then((mod) =>
        mod.inventoryAnalyticsService.getValuationReport(),
      ),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTurnoverAnalysis(days: number = 30) {
  return useQuery({
    queryKey: analyticsKeys.turnover(days),
    queryFn: () =>
      import("@/lib/services/procurement.service").then((mod) =>
        mod.inventoryAnalyticsService.getTurnoverAnalysis({ days }),
      ),
    staleTime: 5 * 60 * 1000,
  });
}
