import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { productionAPI } from "@/lib/api/production";
import { getErrorMessage } from "@/lib/utils/api-helpers";
import type { PaginationParams } from "@/lib/api/milk";

// Products
export function useProducts(params?: PaginationParams) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => productionAPI.getProducts(params),
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => productionAPI.getProduct(Number(id)),
    enabled: Boolean(id),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => productionAPI.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created successfully!", {
        description: "The product recipe has been saved.",
      });
    },
    onError: (error: unknown) => {
      toast.error("Failed to create product", {
        description: getErrorMessage(error),
      });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) =>
      productionAPI.updateProduct(Number(id), data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", variables.id] });
      toast.success("Product updated successfully!");
    },
    onError: (error: unknown) => {
      toast.error("Failed to update product", {
        description: getErrorMessage(error),
      });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productionAPI.deleteProduct(Number(id)),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.removeQueries({ queryKey: ["product", id] });
      toast.success("Product deleted successfully!");
    },
    onError: (error: unknown) => {
      toast.error("Failed to delete product", {
        description: getErrorMessage(error),
      });
    },
  });
}

// Batches
export function useBatches(params?: PaginationParams) {
  return useQuery({
    queryKey: ["production-batches", params],
    queryFn: () => productionAPI.getBatches(params),
    refetchInterval: 30_000,
  });
}

export function useBatch(id: string | undefined) {
  return useQuery({
    queryKey: ["production-batch", id],
    queryFn: () => productionAPI.getBatch(Number(id)),
    enabled: Boolean(id),
    refetchInterval: 10_000,
  });
}

export function useCreateBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => productionAPI.createBatch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["production-batches"] });
      queryClient.invalidateQueries({ queryKey: ["production-stats"] });
      toast.success("Production batch created successfully!", {
        description: "Workers have been notified.",
      });
    },
    onError: (error: unknown) => {
      toast.error("Failed to create batch", {
        description: getErrorMessage(error),
      });
    },
  });
}

export function useUpdateBatchStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      productionAPI.updateBatch(Number(id), { status } as any),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["production-batches"] });
      queryClient.invalidateQueries({
        queryKey: ["production-batch", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["production-stats"] });
      toast.success("Batch status updated!");
    },
    onError: (error: unknown) => {
      toast.error("Failed to update batch status", {
        description: getErrorMessage(error),
      });
    },
  });
}

export function useUpdateBatchStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      batchId,
      stepNumber,
      data,
    }: {
      batchId: string;
      stepNumber: number;
      data: Record<string, any>;
    }) =>
      productionAPI.updateBatch(Number(batchId), {
        step: stepNumber,
        ...data,
      } as any),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["production-batches"] });
      queryClient.invalidateQueries({
        queryKey: ["production-batch", variables.batchId],
      });
      queryClient.invalidateQueries({ queryKey: ["production-stats"] });
      toast.success("Step updated successfully!");
    },
    onError: (error: unknown) => {
      toast.error("Failed to update step", {
        description: getErrorMessage(error),
      });
    },
  });
}

export function useCompleteBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      actual_quantity,
    }: {
      id: string;
      actual_quantity?: number;
    }) => productionAPI.completeBatch(Number(id), actual_quantity ?? 0),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["production-batches"] });
      queryClient.invalidateQueries({ queryKey: ["production-batch", id] });
      queryClient.invalidateQueries({ queryKey: ["production-stats"] });
      toast.success("Batch completed successfully!", {
        description: "Stock has been updated.",
      });
    },
    onError: (error: unknown) => {
      toast.error("Failed to complete batch", {
        description: getErrorMessage(error),
      });
    },
  });
}

export function useDeleteBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productionAPI.deleteBatch(Number(id)),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["production-batches"] });
      queryClient.removeQueries({ queryKey: ["production-batch", id] });
      toast.success("Batch deleted successfully!");
    },
    onError: (error: unknown) => {
      toast.error("Failed to delete batch", {
        description: getErrorMessage(error),
      });
    },
  });
}

// Stats
export function useProductionStats() {
  return useQuery({
    queryKey: ["production-stats"],
    queryFn: () => productionAPI.getBatchStats(),
    refetchInterval: 30_000,
  });
}

// Workers - use employees API as fallback
export function useWorkers() {
  return useQuery({
    queryKey: ["workers"],
    queryFn: () =>
      productionAPI.getProducts().then((res) => ({
        results: [] as any[],
        count: 0,
      })),
    enabled: false,
  });
}
