/**
 * Milk Management API Hooks
 * React Query hooks for milk management operations (Suppliers, Collections, Payments)
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  suppliersService,
  collectionsService,
  paymentsService,
} from "@/services/api";
import { getErrorMessage } from "@/lib/utils/api-helpers";
import { toast } from "sonner";
import type {
  SupplierFilters,
  CreateSupplierPayload,
  UpdateSupplierPayload,
  MilkCollectionFilters,
  CreateMilkCollectionPayload,
  UpdateMilkCollectionPayload,
  PaymentFilters,
  CreatePaymentPayload,
  UpdatePaymentPayload,
  SupplierCollectionFilters,
} from "@/types/api";

// ============ QUERY KEYS ============

export const milkManagementKeys = {
  all: ["milk-management"] as const,

  // Suppliers
  suppliers: () => [...milkManagementKeys.all, "suppliers"] as const,
  suppliersList: (filters?: SupplierFilters) =>
    [...milkManagementKeys.suppliers(), "list", filters] as const,
  supplier: (id: number) =>
    [...milkManagementKeys.suppliers(), "detail", id] as const,
  supplierCollections: (id: number, params?: SupplierCollectionFilters) =>
    [...milkManagementKeys.supplier(id), "collections", params] as const,
  supplierStats: (id: number, days?: number) =>
    [...milkManagementKeys.supplier(id), "stats", days] as const,
  suppliersByRoute: () =>
    [...milkManagementKeys.suppliers(), "by-route"] as const,

  // Collections
  collections: () => [...milkManagementKeys.all, "collections"] as const,
  collectionsList: (filters?: MilkCollectionFilters) =>
    [...milkManagementKeys.collections(), "list", filters] as const,
  collection: (id: number) =>
    [...milkManagementKeys.collections(), "detail", id] as const,
  collectionStats: (days?: number) =>
    [...milkManagementKeys.collections(), "stats", days] as const,
  collectionsBySupplier: (days?: number) =>
    [...milkManagementKeys.collections(), "by-supplier", days] as const,
  todayCollections: () =>
    [...milkManagementKeys.collections(), "today"] as const,

  // Payments
  payments: () => [...milkManagementKeys.all, "payments"] as const,
  paymentsList: (filters?: PaymentFilters) =>
    [...milkManagementKeys.payments(), "list", filters] as const,
  payment: (id: number) =>
    [...milkManagementKeys.payments(), "detail", id] as const,
  pendingPayments: () => [...milkManagementKeys.payments(), "pending"] as const,
  paymentStats: (days?: number) =>
    [...milkManagementKeys.payments(), "stats", days] as const,
};

// ============ SUPPLIERS - QUERIES ============

/**
 * Get suppliers list with filters
 */
export const useSuppliers = (filters?: SupplierFilters) => {
  return useQuery({
    queryKey: milkManagementKeys.suppliersList(filters),
    queryFn: () => suppliersService.getSuppliers(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get single supplier
 */
export const useSupplier = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: milkManagementKeys.supplier(id),
    queryFn: () => suppliersService.getSupplier(id),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Get supplier's collections
 */
export const useSupplierCollections = (
  id: number,
  params?: SupplierCollectionFilters
) => {
  return useQuery({
    queryKey: milkManagementKeys.supplierCollections(id, params),
    queryFn: () => suppliersService.getSupplierCollections(id, params),
    staleTime: 3 * 60 * 1000,
  });
};

/**
 * Get supplier statistics
 */
export const useSupplierStats = (id: number, days: number = 30) => {
  return useQuery({
    queryKey: milkManagementKeys.supplierStats(id, days),
    queryFn: () => suppliersService.getSupplierStats(id, days),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Get suppliers grouped by route
 */
export const useSuppliersByRoute = () => {
  return useQuery({
    queryKey: milkManagementKeys.suppliersByRoute(),
    queryFn: () => suppliersService.getSuppliersByRoute(),
    staleTime: 10 * 60 * 1000, // 10 minutes (rarely changes)
  });
};

// ============ SUPPLIERS - MUTATIONS ============

/**
 * Create supplier
 */
export const useCreateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSupplierPayload) =>
      suppliersService.createSupplier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: milkManagementKeys.suppliers(),
      });
      toast.success("Supplier created successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

/**
 * Update supplier
 */
export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSupplierPayload }) =>
      suppliersService.updateSupplier(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: milkManagementKeys.supplier(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: milkManagementKeys.suppliersList(),
      });
      toast.success("Supplier updated successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

/**
 * Delete supplier
 */
export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => suppliersService.deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: milkManagementKeys.suppliers(),
      });
      toast.success("Supplier deleted successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

// ============ COLLECTIONS - QUERIES ============

/**
 * Get collections list with filters
 */
export const useCollections = (filters?: MilkCollectionFilters) => {
  return useQuery({
    queryKey: milkManagementKeys.collectionsList(filters),
    queryFn: () => collectionsService.getCollections(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Get single collection
 */
export const useCollection = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: milkManagementKeys.collection(id),
    queryFn: () => collectionsService.getCollection(id),
    enabled,
    staleTime: 3 * 60 * 1000,
  });
};

/**
 * Get collection statistics
 */
export const useCollectionStats = (days: number = 7) => {
  return useQuery({
    queryKey: milkManagementKeys.collectionStats(days),
    queryFn: () => collectionsService.getCollectionStats(days),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Get collections by supplier
 */
export const useCollectionsBySupplier = (days: number = 7) => {
  return useQuery({
    queryKey: milkManagementKeys.collectionsBySupplier(days),
    queryFn: () => collectionsService.getCollectionsBySupplier(days),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Get today's collections
 */
export const useTodayCollections = () => {
  return useQuery({
    queryKey: milkManagementKeys.todayCollections(),
    queryFn: () => collectionsService.getTodayCollections(),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
};

// ============ COLLECTIONS - MUTATIONS ============

/**
 * Create milk collection
 */
export const useCreateCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMilkCollectionPayload) =>
      collectionsService.createCollection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: milkManagementKeys.collections(),
      });
      queryClient.invalidateQueries({
        queryKey: milkManagementKeys.suppliers(),
      });
      toast.success("Collection recorded successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

/**
 * Update collection
 */
export const useUpdateCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateMilkCollectionPayload;
    }) => collectionsService.updateCollection(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: milkManagementKeys.collection(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: milkManagementKeys.collectionsList(),
      });
      toast.success("Collection updated successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

/**
 * Delete collection
 */
export const useDeleteCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => collectionsService.deleteCollection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: milkManagementKeys.collections(),
      });
      queryClient.invalidateQueries({
        queryKey: milkManagementKeys.suppliers(),
      });
      toast.success("Collection deleted successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

// ============ PAYMENTS - QUERIES ============

/**
 * Get payments list with filters
 */
export const usePayments = (filters?: PaymentFilters) => {
  return useQuery({
    queryKey: milkManagementKeys.paymentsList(filters),
    queryFn: () => paymentsService.getPayments(filters),
    staleTime: 3 * 60 * 1000,
  });
};

/**
 * Get single payment
 */
export const usePayment = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: milkManagementKeys.payment(id),
    queryFn: () => paymentsService.getPayment(id),
    enabled,
    staleTime: 3 * 60 * 1000,
  });
};

/**
 * Get pending payments
 */
export const usePendingPayments = () => {
  return useQuery({
    queryKey: milkManagementKeys.pendingPayments(),
    queryFn: () => paymentsService.getPendingPayments(),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
};

/**
 * Get payment statistics
 */
export const usePaymentStats = (days: number = 30) => {
  return useQuery({
    queryKey: milkManagementKeys.paymentStats(days),
    queryFn: () => paymentsService.getPaymentStats(days),
    staleTime: 5 * 60 * 1000,
  });
};

// ============ PAYMENTS - MUTATIONS ============

/**
 * Create payment
 */
export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePaymentPayload) =>
      paymentsService.createPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: milkManagementKeys.payments(),
      });
      queryClient.invalidateQueries({
        queryKey: milkManagementKeys.suppliers(),
      });
      toast.success("Payment created successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

/**
 * Update payment
 */
export const useUpdatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePaymentPayload }) =>
      paymentsService.updatePayment(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: milkManagementKeys.payment(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: milkManagementKeys.paymentsList(),
      });
      toast.success("Payment updated successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

/**
 * Delete payment
 */
export const useDeletePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => paymentsService.deletePayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: milkManagementKeys.payments(),
      });
      queryClient.invalidateQueries({
        queryKey: milkManagementKeys.suppliers(),
      });
      toast.success("Payment deleted successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

/**
 * Mark payment as completed
 */
export const useMarkPaymentCompleted = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reference }: { id: number; reference?: string }) =>
      paymentsService.markCompleted(id, reference),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: milkManagementKeys.payment(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: milkManagementKeys.paymentsList(),
      });
      queryClient.invalidateQueries({
        queryKey: milkManagementKeys.pendingPayments(),
      });
      toast.success("Payment marked as completed");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

/**
 * Mark payment as failed
 */
export const useMarkPaymentFailed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      paymentsService.markFailed(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: milkManagementKeys.payment(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: milkManagementKeys.paymentsList(),
      });
      toast.success("Payment marked as failed");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};
