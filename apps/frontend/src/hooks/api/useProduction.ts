/**
 * Production API Hooks
 * React Query hooks for production operations
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  productsService,
  batchesService,
  qualityControlService,
  schedulesService,
} from "@/services/api";
import { getErrorMessage } from "@/lib/utils/api-helpers";
import { toast } from "sonner";
import type {
  ProductFilters,
  CreateProductPayload,
  UpdateProductPayload,
  ProductionBatchFilters,
  CreateProductionBatchPayload,
  UpdateProductionBatchPayload,
  QualityControlFilters,
  CreateQualityControlPayload,
  UpdateQualityControlPayload,
  ProductionScheduleFilters,
  CreateProductionSchedulePayload,
  UpdateProductionSchedulePayload,
} from "@/types/api";

// ============ QUERY KEYS ============

export const productionKeys = {
  all: ["production"] as const,

  // Products
  products: () => [...productionKeys.all, "products"] as const,
  productsList: (filters?: ProductFilters) =>
    [...productionKeys.products(), "list", filters] as const,
  product: (id: number) =>
    [...productionKeys.products(), "detail", id] as const,
  productBatches: (id: number) =>
    [...productionKeys.product(id), "batches"] as const,
  productStats: (id: number, days?: number) =>
    [...productionKeys.product(id), "stats", days] as const,

  // Batches
  batches: () => [...productionKeys.all, "batches"] as const,
  batchesList: (filters?: ProductionBatchFilters) =>
    [...productionKeys.batches(), "list", filters] as const,
  batch: (id: number) => [...productionKeys.batches(), "detail", id] as const,
  batchStats: (days?: number) =>
    [...productionKeys.batches(), "stats", days] as const,
  productionReport: (startDate?: string, endDate?: string) =>
    [...productionKeys.batches(), "report", startDate, endDate] as const,

  // Quality Control
  quality: () => [...productionKeys.all, "quality"] as const,
  qualityList: (filters?: QualityControlFilters) =>
    [...productionKeys.quality(), "list", filters] as const,
  qualityRecord: (id: number) =>
    [...productionKeys.quality(), "detail", id] as const,
  schedules: () => [...productionKeys.all, "schedules"] as const,
  schedulesList: (filters?: ProductionScheduleFilters) =>
    [...productionKeys.schedules(), "list", filters] as const,
  schedule: (id: number) =>
    [...productionKeys.schedules(), "detail", id] as const,
  upcomingSchedules: (days?: number) =>
    [...productionKeys.schedules(), "upcoming", days] as const,
  todaySchedules: () => [...productionKeys.schedules(), "today"] as const,
};

// ============ PRODUCTS - QUERIES ============

export const useProducts = (filters?: ProductFilters) => {
  return useQuery({
    queryKey: productionKeys.productsList(filters),
    queryFn: () => productsService.getProducts(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useProduct = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: productionKeys.product(id),
    queryFn: () => productsService.getProduct(id),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};

export const useProductBatches = (id: number) => {
  return useQuery({
    queryKey: productionKeys.productBatches(id),
    queryFn: () => productsService.getProductBatches(id),
    staleTime: 3 * 60 * 1000,
  });
};

/**
 * Get product statistics
 */
export const useProductStats = (id: number, days: number = 30) => {
  return useQuery({
    queryKey: productionKeys.productStats(id, days),
    queryFn: () => productsService.getProductStats(id, days),
    staleTime: 5 * 60 * 1000,
  });
};

// ============ PRODUCTS - MUTATIONS ============

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProductPayload) =>
      productsService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productionKeys.products() });
      toast.success("Product created successfully");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProductPayload }) =>
      productsService.updateProduct(id, data),
    onSuccess: (_: any, variables: any) => {
      queryClient.invalidateQueries({
        queryKey: productionKeys.product(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: productionKeys.productsList(),
      });
      toast.success("Product updated successfully");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => productsService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productionKeys.products() });
      toast.success("Product deleted successfully");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

// ============ BATCHES - QUERIES ============

export const useBatches = (filters?: ProductionBatchFilters) => {
  return useQuery({
    queryKey: productionKeys.batchesList(filters),
    queryFn: () => batchesService.getBatches(filters),
    staleTime: 3 * 60 * 1000,
  });
};

export const useBatch = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: productionKeys.batch(id),
    queryFn: () => batchesService.getBatch(id),
    enabled,
    staleTime: 3 * 60 * 1000,
  });
};

export const useProductionReport = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: productionKeys.productionReport(startDate, endDate),
    queryFn: () => batchesService.getProductionReport(startDate, endDate),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Get production batch statistics
 */
export const useBatchStats = (days: number = 30) => {
  return useQuery({
    queryKey: productionKeys.batchStats(days),
    queryFn: () => batchesService.getBatchStats(days),
    staleTime: 5 * 60 * 1000,
  });
};

// ============ BATCHES - MUTATIONS ============

export const useCreateBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProductionBatchPayload) =>
      batchesService.createBatch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productionKeys.batches() });
      toast.success("Production batch created successfully");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useUpdateBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateProductionBatchPayload;
    }) => batchesService.updateBatch(id, data),
    onSuccess: (_: any, variables: any) => {
      queryClient.invalidateQueries({
        queryKey: productionKeys.batch(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: productionKeys.batchesList() });
      toast.success("Batch updated successfully");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

/**
 * Start a production batch
 */
export const useStartBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => batchesService.startBatch(id),
    onSuccess: (_: any, id: number) => {
      queryClient.invalidateQueries({ queryKey: productionKeys.batch(id) });
      queryClient.invalidateQueries({ queryKey: productionKeys.batchesList() });
      toast.success("Batch started successfully");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

/**
 * Complete a production batch with details
 */
export const useCompleteBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: {
        actual_quantity: number;
        milk_used: number;
        wastage_quantity?: number;
        quality_check_passed?: boolean;
        quality_notes?: string;
      };
    }) => batchesService.completeBatch(id, data),
    onSuccess: (_: any, variables: any) => {
      queryClient.invalidateQueries({
        queryKey: productionKeys.batch(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: productionKeys.batchesList() });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Batch marked as completed");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useDeleteBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => batchesService.deleteBatch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productionKeys.batches() });
      toast.success("Batch deleted successfully");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

// ============ QUALITY CONTROL - QUERIES ============

export const useQualityRecords = (filters?: QualityControlFilters) => {
  return useQuery({
    queryKey: productionKeys.qualityList(filters),
    queryFn: () => qualityControlService.getQualityRecords(filters),
    staleTime: 3 * 60 * 1000,
  });
};

export const useQualityRecord = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: productionKeys.qualityRecord(id),
    queryFn: () => qualityControlService.getQualityRecord(id),
    enabled,
    staleTime: 3 * 60 * 1000,
  });
};

// ============ QUALITY CONTROL - MUTATIONS ============

export const useCreateQualityRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateQualityControlPayload) =>
      qualityControlService.createQualityRecord(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productionKeys.quality() });
      toast.success("Quality record created successfully");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useUpdateQualityRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateQualityControlPayload;
    }) => qualityControlService.updateQualityRecord(id, data),
    onSuccess: (_: any, variables: any) => {
      queryClient.invalidateQueries({
        queryKey: productionKeys.qualityRecord(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: productionKeys.qualityList() });
      toast.success("Quality record updated successfully");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useApproveQualityCheck = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => qualityControlService.approveQualityCheck(id),
    onSuccess: (_: any, id: number) => {
      queryClient.invalidateQueries({
        queryKey: productionKeys.qualityRecord(id),
      });
      queryClient.invalidateQueries({ queryKey: productionKeys.qualityList() });
      toast.success("Quality check approved");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useRejectQualityCheck = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      qualityControlService.rejectQualityCheck(id, reason),
    onSuccess: (_: any, variables: any) => {
      queryClient.invalidateQueries({
        queryKey: productionKeys.qualityRecord(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: productionKeys.qualityList() });
      toast.success("Quality check rejected");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useDeleteQualityRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => qualityControlService.deleteQualityRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productionKeys.quality() });
      toast.success("Quality record deleted successfully");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

// ============ SCHEDULES - QUERIES ============

export const useProductionSchedules = (filters?: ProductionScheduleFilters) => {
  return useQuery({
    queryKey: productionKeys.schedulesList(filters),
    queryFn: () => schedulesService.getSchedules(filters),
    staleTime: 3 * 60 * 1000,
  });
};

export const useProductionSchedule = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: productionKeys.schedule(id),
    queryFn: () => schedulesService.getSchedule(id),
    enabled,
    staleTime: 3 * 60 * 1000,
  });
};

/**
 * Get upcoming production schedules
 */
export const useUpcomingSchedules = (days: number = 7) => {
  return useQuery({
    queryKey: productionKeys.upcomingSchedules(days),
    queryFn: () => schedulesService.getUpcomingSchedules(days),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Get today's production schedules
 */
export const useTodaySchedules = () => {
  return useQuery({
    queryKey: productionKeys.todaySchedules(),
    queryFn: () => schedulesService.getTodaySchedules(),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

// ============ SCHEDULES - MUTATIONS ============

export const useCreateProductionSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProductionSchedulePayload) =>
      schedulesService.createSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productionKeys.schedules() });
      toast.success("Production schedule created successfully");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useUpdateProductionSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateProductionSchedulePayload;
    }) => schedulesService.updateSchedule(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: productionKeys.schedule(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: productionKeys.schedulesList(),
      });
      toast.success("Production schedule updated successfully");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useDeleteProductionSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => schedulesService.deleteSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productionKeys.schedules() });
      toast.success("Production schedule deleted successfully");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};
