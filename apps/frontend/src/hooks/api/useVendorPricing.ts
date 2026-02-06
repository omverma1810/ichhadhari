/**
 * Vendor Pricing React Query Hooks
 * Custom hooks for fetching and mutating vendor product pricing data
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { vendorPricingService } from "@/services/api/vendors/vendor-pricing.service";
import type {
  VendorProductPriceFilters,
  CreateVendorProductPricePayload,
  UpdateVendorProductPricePayload,
} from "@/types/api/vendor-pricing";

// ==================== QUERY KEYS ====================

export const vendorPricingKeys = {
  all: ["vendor-pricing"] as const,
  lists: () => [...vendorPricingKeys.all, "list"] as const,
  list: (filters?: VendorProductPriceFilters) =>
    [...vendorPricingKeys.lists(), filters] as const,
  details: () => [...vendorPricingKeys.all, "detail"] as const,
  detail: (id: number) => [...vendorPricingKeys.details(), id] as const,
  forVendor: (vendorId: number) =>
    [...vendorPricingKeys.all, "for-vendor", vendorId] as const,
  forProduct: (productId: number) =>
    [...vendorPricingKeys.all, "for-product", productId] as const,
};

// ==================== QUERY HOOKS ====================

/**
 * Hook to fetch vendor product prices list with optional filters
 */
export function useVendorProductPrices(filters?: VendorProductPriceFilters) {
  return useQuery({
    queryKey: vendorPricingKeys.list(filters),
    queryFn: () => vendorPricingService.getVendorProductPrices(filters),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch a single vendor product price
 */
export function useVendorProductPrice(id: number) {
  return useQuery({
    queryKey: vendorPricingKeys.detail(id),
    queryFn: () => vendorPricingService.getVendorProductPrice(id),
    enabled: !!id && id > 0,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch all active prices for a vendor
 */
export function useVendorPrices(vendorId: number) {
  return useQuery({
    queryKey: vendorPricingKeys.forVendor(vendorId),
    queryFn: () => vendorPricingService.getPricesForVendor(vendorId),
    enabled: !!vendorId && vendorId > 0,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch all active vendor prices for a product
 */
export function useProductVendorPrices(productId: number) {
  return useQuery({
    queryKey: vendorPricingKeys.forProduct(productId),
    queryFn: () => vendorPricingService.getPricesForProduct(productId),
    enabled: !!productId && productId > 0,
    staleTime: 5 * 60 * 1000,
  });
}

// ==================== MUTATION HOOKS ====================

/**
 * Hook to create a new vendor product price
 */
export function useCreateVendorProductPrice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVendorProductPricePayload) =>
      vendorPricingService.createVendorProductPrice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorPricingKeys.lists() });
      toast.success("Vendor price created successfully!");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to create vendor price";
      toast.error(message);
    },
  });
}

/**
 * Hook to update a vendor product price
 */
export function useUpdateVendorProductPrice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateVendorProductPricePayload;
    }) => vendorPricingService.updateVendorProductPrice(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: vendorPricingKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: vendorPricingKeys.detail(variables.id),
      });
      toast.success("Vendor price updated successfully!");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to update vendor price";
      toast.error(message);
    },
  });
}

/**
 * Hook to delete a vendor product price
 */
export function useDeleteVendorProductPrice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      vendorPricingService.deleteVendorProductPrice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorPricingKeys.lists() });
      toast.success("Vendor price deleted successfully!");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to delete vendor price";
      toast.error(message);
    },
  });
}
