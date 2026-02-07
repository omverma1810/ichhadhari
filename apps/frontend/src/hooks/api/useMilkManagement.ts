/**
 * Milk Management API Hooks
 * React Query hooks for milk management operations (Suppliers, Collections, Payments)
 */

"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  suppliersService,
  collectionsService,
  paymentsService,
  segregationPlansService,
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
  MilkCollection,
  MilkSegregationPlanFilters,
  CreateMilkSegregationPlanPayload,
} from "@/types/api";
import type { SegregationStats, MilkTrendData } from "@/types/milk";

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
  collectionAnalytics: (days?: number) =>
    [...milkManagementKeys.collections(), "analytics", days] as const,

  // Payments
  payments: () => [...milkManagementKeys.all, "payments"] as const,
  paymentsList: (filters?: PaymentFilters) =>
    [...milkManagementKeys.payments(), "list", filters] as const,
  payment: (id: number) =>
    [...milkManagementKeys.payments(), "detail", id] as const,
  pendingPayments: () => [...milkManagementKeys.payments(), "pending"] as const,
  paymentStats: (days?: number) =>
    [...milkManagementKeys.payments(), "stats", days] as const,

  // Segregation Plans
  segregationPlans: () =>
    [...milkManagementKeys.all, "segregation-plans"] as const,
  segregationPlansList: (filters?: MilkSegregationPlanFilters) =>
    [...milkManagementKeys.segregationPlans(), "list", filters] as const,
  segregationPlan: (id: number) =>
    [...milkManagementKeys.segregationPlans(), "detail", id] as const,
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
  params?: SupplierCollectionFilters,
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

// ============ COLLECTION ANALYTICS (Segregation & Trends) ============

/**
 * Get milk segregation stats derived from raw collections data
 */
export const useSegregationStats = (days: number = 7) => {
  return useQuery({
    queryKey: milkManagementKeys.collectionAnalytics(days),
    queryFn: () => fetchCollectionsForAnalytics(days),
    select: ({ collections }) => buildSegregationStats(collections),
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
};

/**
 * Get milk trend data for charts derived from raw collections data
 */
export const useMilkTrends = (days: number = 7) => {
  return useQuery({
    queryKey: milkManagementKeys.collectionAnalytics(days),
    queryFn: () => fetchCollectionsForAnalytics(days),
    select: ({ collections, range }) =>
      buildTrendData(collections, range.startDate, range.endDate),
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
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

// ============ SEGREGATION PLANS ============

export const useSegregationPlans = (filters?: MilkSegregationPlanFilters) => {
  return useQuery({
    queryKey: milkManagementKeys.segregationPlansList(filters),
    queryFn: () => segregationPlansService.getPlans(filters),
    staleTime: 2 * 60 * 1000,
  });
};

export const useSegregationPlan = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: milkManagementKeys.segregationPlan(id),
    queryFn: () => segregationPlansService.getPlan(id),
    enabled,
    staleTime: 2 * 60 * 1000,
  });
};

export const useCreateSegregationPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMilkSegregationPlanPayload) =>
      segregationPlansService.createPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: milkManagementKeys.segregationPlans(),
      });
      toast.success("Segregation plan saved");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
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

// ============ INTERNAL HELPERS ============

type SegregationCategory = "premium" | "standard" | "other";

const ANALYTICS_PAGE_SIZE = 250;
const MAX_ANALYTICS_PAGES = 5;

const formatDateParam = (date: Date): string =>
  date.toISOString().split("T")[0];

const getDateRangeForDays = (days: number) => {
  const safeDays = Math.max(days, 1);
  const endDate = new Date();
  const startDate = new Date();
  endDate.setHours(0, 0, 0, 0);
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(endDate.getDate() - (safeDays - 1));
  return { startDate, endDate };
};

const fetchCollectionsForAnalytics = async (days: number) => {
  const range = getDateRangeForDays(days);
  const baseFilters: MilkCollectionFilters = {
    start_date: formatDateParam(range.startDate),
    end_date: formatDateParam(range.endDate),
    page_size: ANALYTICS_PAGE_SIZE,
    ordering: "-collection_date",
  };

  let page = 1;
  let hasMore = true;
  let total = 0;
  const collections: MilkCollection[] = [];

  while (hasMore && page <= MAX_ANALYTICS_PAGES) {
    const response = await collectionsService.getCollections({
      ...baseFilters,
      page,
    });

    collections.push(...response.results);
    total = response.count ?? collections.length;
    page += 1;
    hasMore = Boolean(response.next) && collections.length < total;
  }

  return { collections, range };
};

const toNumber = (value: unknown): number => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const round = (value: number, decimals: number = 2): number => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const resolveCategory = (fatPercentage: unknown): SegregationCategory => {
  const fat = toNumber(fatPercentage);
  if (fat >= 8) return "premium";
  if (fat >= 4) return "standard";
  return "other";
};

const buildSegregationStats = (
  collections: MilkCollection[],
): SegregationStats => {
  const buckets: Record<
    SegregationCategory,
    {
      liters: number;
      batches: number;
      fatSum: number;
    }
  > = {
    premium: { liters: 0, batches: 0, fatSum: 0 },
    standard: { liters: 0, batches: 0, fatSum: 0 },
    other: { liters: 0, batches: 0, fatSum: 0 },
  };

  collections.forEach((collection) => {
    const liters = toNumber(collection.quantity);
    if (liters <= 0) return;

    const category = resolveCategory(collection.fat);
    const bucket = buckets[category];
    bucket.liters += liters;
    bucket.batches += 1;
    bucket.fatSum += toNumber(collection.fat);
  });

  const totalLiters =
    buckets.premium.liters + buckets.standard.liters + buckets.other.liters;
  const totalBatches =
    buckets.premium.batches + buckets.standard.batches + buckets.other.batches;

  const buildCategory = (category: SegregationCategory) => {
    const bucket = buckets[category];
    const averageFat = bucket.batches
      ? round(bucket.fatSum / bucket.batches)
      : 0;
    const percentage = totalLiters
      ? round((bucket.liters / totalLiters) * 100, 1)
      : 0;

    return {
      totalLiters: round(bucket.liters),
      batches: bucket.batches,
      averageFat,
      percentage,
    };
  };

  return {
    premium: buildCategory("premium"),
    standard: buildCategory("standard"),
    other: buildCategory("other"),
    totalLiters: round(totalLiters),
    totalBatches,
    lastUpdated: new Date().toISOString(),
  };
};

const buildTrendData = (
  collections: MilkCollection[],
  startDate: Date,
  endDate: Date,
): MilkTrendData[] => {
  type TrendBucket = Record<SegregationCategory, number>;
  const buckets = new Map<string, TrendBucket>();

  const cursor = new Date(startDate);
  while (cursor <= endDate) {
    buckets.set(formatDateParam(cursor), {
      premium: 0,
      standard: 0,
      other: 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  collections.forEach((collection) => {
    const dateKey = collection.collection_date ?? collection.created_at;
    if (!dateKey) return;

    const normalizedDate = dateKey.split("T")[0];
    if (!buckets.has(normalizedDate)) {
      buckets.set(normalizedDate, { premium: 0, standard: 0, other: 0 });
    }

    const bucket = buckets.get(normalizedDate)!;
    const category = resolveCategory(collection.fat);
    bucket[category] += toNumber(collection.quantity);
  });

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, bucket]) => {
      const premium = round(bucket.premium);
      const standard = round(bucket.standard);
      const other = round(bucket.other);
      const total = round(premium + standard + other);
      return {
        date,
        premium,
        standard,
        other,
        total,
      };
    });
};
