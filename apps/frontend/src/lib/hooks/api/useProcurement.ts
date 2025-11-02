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

// ==================== MOCK DATA ====================

const mockVendors = {
  count: 10,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      vendor_code: "V-001",
      name: "Ramesh Dairy Farm",
      contact_person: "Ramesh Kumar",
      phone: "+91 98765 43210",
      email: "ramesh@dairyfarm.com",
      address: "Village Palampur",
      city: "Palampur",
      state: "Himachal Pradesh",
      pincode: "176061",
      milk_type: "cow" as const,
      status: "active" as const,
      rate_per_liter: 45.0,
      bank_account_number: "1234567890",
      ifsc_code: "SBIN0001234",
      created_at: new Date(
        Date.now() - 1000 * 60 * 60 * 24 * 180
      ).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      vendor_code: "V-002",
      name: "Lakshmi Farms",
      contact_person: "Lakshmi Devi",
      phone: "+91 98765 43211",
      email: "lakshmi@farms.com",
      address: "Village Dharampur",
      city: "Mandi",
      state: "Himachal Pradesh",
      pincode: "175001",
      milk_type: "buffalo" as const,
      status: "active" as const,
      rate_per_liter: 55.0,
      bank_account_number: "0987654321",
      ifsc_code: "HDFC0001234",
      created_at: new Date(
        Date.now() - 1000 * 60 * 60 * 24 * 150
      ).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 3,
      vendor_code: "V-003",
      name: "Gopal Dairy",
      contact_person: "Gopal Singh",
      phone: "+91 98765 43212",
      email: "gopal@dairy.com",
      address: "Village Baijnath",
      city: "Kangra",
      state: "Himachal Pradesh",
      pincode: "176125",
      milk_type: "cow" as const,
      status: "active" as const,
      rate_per_liter: 42.0,
      bank_account_number: "5678901234",
      ifsc_code: "ICIC0001234",
      created_at: new Date(
        Date.now() - 1000 * 60 * 60 * 24 * 120
      ).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
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
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Filter mock data
      let filteredResults = [...mockVendors.results];

      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredResults = filteredResults.filter(
          (v) =>
            v.name.toLowerCase().includes(searchLower) ||
            v.vendor_code.toLowerCase().includes(searchLower) ||
            v.contact_person.toLowerCase().includes(searchLower)
        );
      }

      if (filters?.status) {
        filteredResults = filteredResults.filter(
          (v) => v.status === filters.status
        );
      }

      if (filters?.milk_type) {
        filteredResults = filteredResults.filter(
          (v) => v.milk_type === filters.milk_type
        );
      }

      return {
        count: filteredResults.length,
        next: null,
        previous: null,
        results: filteredResults,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single vendor
 */
export function useVendor(id: number) {
  return useQuery({
    queryKey: procurementKeys.vendor(id),
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      const vendor = mockVendors.results.find((v) => v.id === id);
      if (!vendor) throw new Error("Vendor not found");
      return vendor;
    },
    enabled: !!id,
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

// Mock data for milk collections until backend is fully functional
const mockMilkCollections = {
  count: 15,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      collection_id: "MC-2025-001",
      vendor: {
        id: 1,
        vendor_code: "V-001",
        name: "Ramesh Dairy Farm",
        contact_person: "Ramesh Kumar",
        phone: "+91 98765 43210",
        email: "ramesh@dairyfarm.com",
        address: "Village Palampur",
        city: "Palampur",
        state: "Himachal Pradesh",
        pincode: "176061",
        milk_type: "cow" as const,
        status: "active" as const,
        rate_per_liter: 45.0,
        bank_account_number: "1234567890",
        ifsc_code: "SBIN0001234",
        created_at: new Date(
          Date.now() - 1000 * 60 * 60 * 24 * 180
        ).toISOString(),
        updated_at: new Date().toISOString(),
      },
      collection_date: new Date().toISOString().split("T")[0],
      shift: "morning" as const,
      milk_type: "cow" as const,
      quantity_liters: 450.5,
      fat_percentage: 4.2,
      snf_percentage: 8.5,
      temperature: 4.0,
      rate_per_liter: 45.0,
      total_amount: 20272.5,
      quality_status: "approved" as const,
      payment_status: "pending" as const,
      collected_by: {
        id: 1,
        first_name: "Rajesh",
        last_name: "Kumar",
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      collection_id: "MC-2025-002",
      vendor: {
        id: 2,
        vendor_code: "V-002",
        name: "Lakshmi Farms",
        contact_person: "Lakshmi Devi",
        phone: "+91 98765 43211",
        email: "lakshmi@farms.com",
        address: "Village Dharampur",
        city: "Mandi",
        state: "Himachal Pradesh",
        pincode: "175001",
        milk_type: "buffalo" as const,
        status: "active" as const,
        rate_per_liter: 55.0,
        bank_account_number: "0987654321",
        ifsc_code: "HDFC0001234",
        created_at: new Date(
          Date.now() - 1000 * 60 * 60 * 24 * 150
        ).toISOString(),
        updated_at: new Date().toISOString(),
      },
      collection_date: new Date().toISOString().split("T")[0],
      shift: "evening" as const,
      milk_type: "buffalo" as const,
      quantity_liters: 320.0,
      fat_percentage: 6.5,
      snf_percentage: 9.2,
      temperature: 4.5,
      rate_per_liter: 55.0,
      total_amount: 17600.0,
      quality_status: "approved" as const,
      payment_status: "paid" as const,
      collected_by: {
        id: 1,
        first_name: "Rajesh",
        last_name: "Kumar",
      },
      created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
    {
      id: 3,
      collection_id: "MC-2025-003",
      vendor: {
        id: 3,
        vendor_code: "V-003",
        name: "Gopal Dairy",
        contact_person: "Gopal Singh",
        phone: "+91 98765 43212",
        email: "gopal@dairy.com",
        address: "Village Baijnath",
        city: "Kangra",
        state: "Himachal Pradesh",
        pincode: "176125",
        milk_type: "cow" as const,
        status: "active" as const,
        rate_per_liter: 42.0,
        bank_account_number: "5678901234",
        ifsc_code: "ICIC0001234",
        created_at: new Date(
          Date.now() - 1000 * 60 * 60 * 24 * 120
        ).toISOString(),
        updated_at: new Date().toISOString(),
      },
      collection_date: new Date(Date.now() - 1000 * 60 * 60 * 24)
        .toISOString()
        .split("T")[0],
      shift: "morning" as const,
      milk_type: "cow" as const,
      quantity_liters: 280.0,
      fat_percentage: 3.8,
      snf_percentage: 8.3,
      temperature: 5.0,
      rate_per_liter: 42.0,
      total_amount: 11760.0,
      quality_status: "pending" as const,
      payment_status: "pending" as const,
      collected_by: {
        id: 2,
        first_name: "Priya",
        last_name: "Sharma",
      },
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
  ],
};

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
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Filter mock data based on filters
      let filteredResults = [...mockMilkCollections.results];

      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredResults = filteredResults.filter(
          (c) =>
            c.collection_id.toLowerCase().includes(searchLower) ||
            c.vendor.name.toLowerCase().includes(searchLower)
        );
      }

      if (filters?.quality_status) {
        filteredResults = filteredResults.filter(
          (c) => c.quality_status === filters.quality_status
        );
      }

      if (filters?.payment_status) {
        filteredResults = filteredResults.filter(
          (c) => c.payment_status === filters.payment_status
        );
      }

      return {
        count: filteredResults.length,
        next: null,
        previous: null,
        results: filteredResults,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch a single milk collection
 */
export function useMilkCollection(id: number) {
  return useQuery({
    queryKey: procurementKeys.collection(id),
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      const collection = mockMilkCollections.results.find((c) => c.id === id);
      if (!collection) throw new Error("Collection not found");
      return collection;
    },
    enabled: !!id,
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
      data: import("@/lib/services/procurement.service").VendorPaymentFormData
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
      data: import("@/lib/services/procurement.service").PurchaseOrderFormData
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
