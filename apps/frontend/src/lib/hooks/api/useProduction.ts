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

// ==================== MOCK DATA ====================

const mockProducts = {
  count: 8,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      product_code: "PROD-001",
      name: "Full Cream Milk",
      description: "Fresh full cream milk - 1L pack",
      category: "milk" as const,
      unit_of_measurement: "liters" as const,
      shelf_life_days: 5,
      storage_temperature_min: 2,
      storage_temperature_max: 6,
      is_active: true,
      created_at: new Date(
        Date.now() - 1000 * 60 * 60 * 24 * 365
      ).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      product_code: "PROD-002",
      name: "Toned Milk",
      description: "Toned milk - 1L pack",
      category: "milk" as const,
      unit_of_measurement: "liters" as const,
      shelf_life_days: 5,
      storage_temperature_min: 2,
      storage_temperature_max: 6,
      is_active: true,
      created_at: new Date(
        Date.now() - 1000 * 60 * 60 * 24 * 365
      ).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 3,
      product_code: "PROD-003",
      name: "Fresh Paneer",
      description: "Fresh paneer made from pure milk - 200g pack",
      category: "paneer" as const,
      unit_of_measurement: "kg" as const,
      shelf_life_days: 3,
      storage_temperature_min: 2,
      storage_temperature_max: 6,
      is_active: true,
      created_at: new Date(
        Date.now() - 1000 * 60 * 60 * 24 * 300
      ).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 4,
      product_code: "PROD-004",
      name: "Fresh Curd",
      description: "Fresh curd - 500g pack",
      category: "curd" as const,
      unit_of_measurement: "kg" as const,
      shelf_life_days: 4,
      storage_temperature_min: 2,
      storage_temperature_max: 6,
      is_active: true,
      created_at: new Date(
        Date.now() - 1000 * 60 * 60 * 24 * 300
      ).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 5,
      product_code: "PROD-005",
      name: "Pure Ghee",
      description: "Pure cow ghee - 500ml jar",
      category: "ghee" as const,
      unit_of_measurement: "kg" as const,
      shelf_life_days: 180,
      storage_temperature_min: 15,
      storage_temperature_max: 25,
      is_active: true,
      created_at: new Date(
        Date.now() - 1000 * 60 * 60 * 24 * 250
      ).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 6,
      product_code: "PROD-006",
      name: "Table Butter",
      description: "Premium table butter - 100g pack",
      category: "butter" as const,
      unit_of_measurement: "kg" as const,
      shelf_life_days: 60,
      storage_temperature_min: 2,
      storage_temperature_max: 6,
      is_active: true,
      created_at: new Date(
        Date.now() - 1000 * 60 * 60 * 24 * 200
      ).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 7,
      product_code: "PROD-007",
      name: "Cheese Slices",
      description: "Premium cheese slices - 200g pack",
      category: "cheese" as const,
      unit_of_measurement: "kg" as const,
      shelf_life_days: 90,
      storage_temperature_min: 2,
      storage_temperature_max: 6,
      is_active: true,
      created_at: new Date(
        Date.now() - 1000 * 60 * 60 * 24 * 150
      ).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 8,
      product_code: "PROD-008",
      name: "Lassi",
      description: "Sweet lassi - 200ml bottle",
      category: "other" as const,
      unit_of_measurement: "liters" as const,
      shelf_life_days: 2,
      storage_temperature_min: 2,
      storage_temperature_max: 6,
      is_active: true,
      created_at: new Date(
        Date.now() - 1000 * 60 * 60 * 24 * 100
      ).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
};

// ==================== PRODUCTS ====================

export function useProducts(filters?: ProductionFilters) {
  return useQuery({
    queryKey: productionKeys.productsList(filters),
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Filter mock data
      let filteredResults = [...mockProducts.results];

      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredResults = filteredResults.filter(
          (p) =>
            p.name.toLowerCase().includes(searchLower) ||
            p.product_code.toLowerCase().includes(searchLower) ||
            p.category.toLowerCase().includes(searchLower)
        );
      }

      if (filters?.category) {
        filteredResults = filteredResults.filter(
          (p) => p.category === filters.category
        );
      }

      if (filters?.status) {
        const isActive = filters.status === "active";
        filteredResults = filteredResults.filter(
          (p) => p.is_active === isActive
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

export function useProduct(id: number) {
  return useQuery({
    queryKey: productionKeys.product(id),
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      const product = mockProducts.results.find((p) => p.id === id);
      if (!product) throw new Error("Product not found");
      return product;
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
