"use client";

import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { milkManagementKeys } from "@/hooks/api/useMilkManagement";
import { suppliersService } from "@/services/api";
import type {
  Supplier,
  SupplierFilters,
  CreateSupplierPayload,
  UpdateSupplierPayload,
  SupplierStats,
  SupplierCollectionSummary,
  SupplierCollectionFilters,
  SuppliersByRoute,
  PaginatedResponse,
} from "@/types/api";

export const supplierKeys = {
  all: () => milkManagementKeys.suppliers(),
  list: (filters?: SupplierFilters) =>
    milkManagementKeys.suppliersList(filters),
  detail: (id: number) => milkManagementKeys.supplier(id),
  collections: (id: number, params?: SupplierCollectionFilters) =>
    milkManagementKeys.supplierCollections(id, params),
  stats: (id: number, days?: number) =>
    milkManagementKeys.supplierStats(id, days),
  byRoute: () => milkManagementKeys.suppliersByRoute(),
} as const;

export const useSuppliers = (filters?: SupplierFilters) =>
  useQuery<PaginatedResponse<Supplier>>({
    queryKey: supplierKeys.list(filters),
    queryFn: () => suppliersService.getSuppliers(filters),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });

export const useSuppliersInfinite = (filters?: SupplierFilters) =>
  useInfiniteQuery<PaginatedResponse<Supplier>>({
    queryKey: supplierKeys.list(filters),
    queryFn: ({ pageParam }) =>
      suppliersService.getSuppliers({ ...filters, page: pageParam as number }),
    getNextPageParam: (lastPage) => {
      if (lastPage.next) {
        const url = new URL(lastPage.next);
        const page = url.searchParams.get("page");
        return page ? parseInt(page, 10) : undefined;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
  });

export const useSupplier = (id: number, enabled: boolean = true) =>
  useQuery<Supplier>({
    queryKey: supplierKeys.detail(id),
    queryFn: () => suppliersService.getSupplier(id),
    enabled,
    staleTime: 5 * 60 * 1000,
  });

export const useSupplierCollections = (
  id: number,
  params?: SupplierCollectionFilters,
  enabled: boolean = true
) =>
  useQuery<SupplierCollectionSummary[]>({
    queryKey: supplierKeys.collections(id, params),
    queryFn: () => suppliersService.getSupplierCollections(id, params),
    enabled,
    staleTime: 3 * 60 * 1000,
  });

export const useSupplierStats = (
  id: number,
  days: number = 30,
  enabled: boolean = true
) =>
  useQuery<SupplierStats>({
    queryKey: supplierKeys.stats(id, days),
    queryFn: () => suppliersService.getSupplierStats(id, days),
    enabled,
    staleTime: 5 * 60 * 1000,
  });

export const useSuppliersByRoute = () =>
  useQuery<SuppliersByRoute[]>({
    queryKey: supplierKeys.byRoute(),
    queryFn: () => suppliersService.getSuppliersByRoute(),
    staleTime: 10 * 60 * 1000,
  });

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation<Supplier, unknown, CreateSupplierPayload>({
    mutationFn: (payload) => suppliersService.createSupplier(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.all() });
      queryClient.invalidateQueries({ queryKey: supplierKeys.list() });
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Supplier,
    unknown,
    { id: number; data: UpdateSupplierPayload }
  >({
    mutationFn: ({ id, data }) => suppliersService.updateSupplier(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: supplierKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: supplierKeys.list() });
      queryClient.invalidateQueries({ queryKey: supplierKeys.all() });
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, number>({
    mutationFn: (id) => suppliersService.deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.all() });
      queryClient.invalidateQueries({ queryKey: supplierKeys.list() });
    },
  });
};
