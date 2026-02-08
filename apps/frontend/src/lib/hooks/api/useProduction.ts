/**
 * Production React Query Hooks
 * Custom hooks for managing production data with React Query
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { productionService } from "@/lib/services/production.service";
import type {
  Product,
  ProductFormData,
  ProductionBatch,
  ProductionBatchFormData,
  ProductionSchedule,
  ProductionScheduleFormData,
  ProductionFilters,
} from "@/lib/services/production.service";

// ==================== QUERY KEYS ====================

export const productionKeys = {
  all: ["production"] as const,
  products: () => [...productionKeys.all, "products"] as const,
  product: (id: number) => [...productionKeys.products(), id] as const,
  productsList: (filters?: ProductionFilters) =>
    [...productionKeys.products(), "list", filters] as const,
  batches: () => [...productionKeys.all, "batches"] as const,
  batch: (id: number) => [...productionKeys.batches(), id] as const,
  batchesList: (filters?: ProductionFilters) =>
    [...productionKeys.batches(), "list", filters] as const,
  schedules: () => [...productionKeys.all, "schedules"] as const,
  schedule: (id: number) => [...productionKeys.schedules(), id] as const,
  schedulesList: (filters?: ProductionFilters) =>
    [...productionKeys.schedules(), "list", filters] as const,
};

// ==================== PRODUCTS ====================

export function useProducts(filters?: ProductionFilters) {
  return useQuery({
    queryKey: productionKeys.productsList(filters),
    queryFn: async () => {
      try {
        const response = await productionService.getProducts(filters);
        return response;
      } catch (error) {
        console.error("Failed to fetch products:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: productionKeys.product(id),
    queryFn: async () => {
      try {
        const product = await productionService.getProduct(id);
        return product;
      } catch (error) {
        console.error("Failed to fetch product:", error);
        throw error;
      }
    },
    enabled: !!id && id > 0,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductFormData) =>
      productionService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productionKeys.products() });
      toast.success("Product created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create product");
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<ProductFormData>;
    }) => productionService.updateProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productionKeys.products() });
      queryClient.invalidateQueries({
        queryKey: productionKeys.product(variables.id),
      });
      toast.success("Product updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update product");
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => productionService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productionKeys.products() });
      toast.success("Product deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete product");
    },
  });
}

// ==================== PRODUCTION BATCHES ====================

export function useBatches(filters?: ProductionFilters) {
  return useQuery({
    queryKey: productionKeys.batchesList(filters),
    queryFn: () => productionService.getBatches(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useBatch(id: number) {
  return useQuery({
    queryKey: productionKeys.batch(id),
    queryFn: () => productionService.getBatch(id),
    enabled: !!id && id > 0,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductionBatchFormData) =>
      productionService.createBatch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productionKeys.batches() });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Production batch created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create production batch");
    },
  });
}

export function useUpdateBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<ProductionBatchFormData>;
    }) => productionService.updateBatch(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productionKeys.batches() });
      queryClient.invalidateQueries({
        queryKey: productionKeys.batch(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Production batch updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update production batch");
    },
  });
}

export function useDeleteBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => productionService.deleteBatch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productionKeys.batches() });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Production batch deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete production batch");
    },
  });
}

export function useUpdateActualQuantity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      actualQuantity,
    }: {
      id: number;
      actualQuantity: number;
    }) => productionService.updateActualQuantity(id, actualQuantity),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productionKeys.batches() });
      queryClient.invalidateQueries({
        queryKey: productionKeys.batch(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Actual quantity updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update actual quantity");
    },
  });
}

// ==================== PRODUCTION SCHEDULES ====================

export function useSchedules(filters?: ProductionFilters) {
  return useQuery({
    queryKey: productionKeys.schedulesList(filters),
    queryFn: () => productionService.getSchedules(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useSchedule(id: number) {
  return useQuery({
    queryKey: productionKeys.schedule(id),
    queryFn: () => productionService.getSchedule(id),
    enabled: !!id && id > 0,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductionScheduleFormData) =>
      productionService.createSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productionKeys.schedules() });
      toast.success("Production schedule created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create production schedule");
    },
  });
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<ProductionScheduleFormData>;
    }) => productionService.updateSchedule(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productionKeys.schedules() });
      queryClient.invalidateQueries({
        queryKey: productionKeys.schedule(variables.id),
      });
      toast.success("Production schedule updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update production schedule");
    },
  });
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => productionService.deleteSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productionKeys.schedules() });
      toast.success("Production schedule deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete production schedule");
    },
  });
}
