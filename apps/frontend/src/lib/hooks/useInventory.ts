import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { inventoryAPI } from "@/lib/api/inventory";
import { getErrorMessage } from "@/lib/utils/api-helpers";
import type {
  StockAdjustment,
  StockTransferRequest,
  StockMovement,
} from "@/types/inventory";
import type { PaginationParams } from "@/lib/api/milk";

// Locations
export function useLocations() {
  return useQuery({
    queryKey: ["locations"],
    queryFn: () => inventoryAPI.getLocations(),
  });
}

export function useLocation(id: string | undefined) {
  return useQuery({
    queryKey: ["location", id],
    queryFn: () => inventoryAPI.getLocation(id as string),
    enabled: Boolean(id),
  });
}

// Stock Items
export function useStock(params?: PaginationParams) {
  return useQuery({
    queryKey: ["inventory-stock", params],
    queryFn: () => inventoryAPI.getStock(params),
    refetchInterval: 30_000,
  });
}

export function useStockByLocation(locationId: string | undefined) {
  return useQuery({
    queryKey: ["stock-by-location", locationId],
    queryFn: () => inventoryAPI.getStockByLocation(locationId as string),
    enabled: Boolean(locationId),
  });
}

// Stock Movements
export function useMovements(params?: PaginationParams) {
  return useQuery({
    queryKey: ["stock-movements", params],
    queryFn: () => inventoryAPI.getMovements(params),
  });
}

export function useCreateMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<StockMovement>) =>
      inventoryAPI.createMovement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-stock"] });
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-stats"] });
      toast.success("Stock movement recorded successfully!");
    },
    onError: (error: unknown) => {
      toast.error("Failed to record movement", {
        description: getErrorMessage(error),
      });
    },
  });
}

// Stock Adjustments
export function useAdjustments(params?: PaginationParams) {
  return useQuery({
    queryKey: ["stock-adjustments", params],
    queryFn: () => inventoryAPI.getAdjustments(params),
  });
}

export function useCreateAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<StockAdjustment>) =>
      inventoryAPI.createAdjustment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-adjustments"] });
      toast.success("Adjustment request created!", {
        description: "Awaiting approval",
      });
    },
    onError: (error: unknown) => {
      toast.error("Failed to create adjustment", {
        description: getErrorMessage(error),
      });
    },
  });
}

export function useApproveAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => inventoryAPI.approveAdjustment(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["stock-adjustments"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-stock"] });
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
      toast.success("Adjustment approved and applied!", {
        description: `Adjustment ${id} is now active`,
      });
    },
    onError: (error: unknown) => {
      toast.error("Failed to approve adjustment", {
        description: getErrorMessage(error),
      });
    },
  });
}

export function useRejectAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { id: string; reason: string }) =>
      inventoryAPI.rejectAdjustment(variables.id, variables.reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["stock-adjustments"] });
      toast.success("Adjustment rejected", {
        description: `Reason: ${variables.reason}`,
      });
    },
    onError: (error: unknown) => {
      toast.error("Failed to reject adjustment", {
        description: getErrorMessage(error),
      });
    },
  });
}

// Stock Transfer
export function useTransferStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StockTransferRequest) =>
      inventoryAPI.transferStock(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-stock"] });
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
      toast.success("Stock transfer initiated successfully!");
    },
    onError: (error: unknown) => {
      toast.error("Failed to transfer stock", {
        description: getErrorMessage(error),
      });
    },
  });
}

// Expiry Alerts
export function useExpiryAlerts() {
  return useQuery({
    queryKey: ["expiry-alerts"],
    queryFn: () => inventoryAPI.getExpiryAlerts(),
    refetchInterval: 60_000,
  });
}

// Statistics
export function useInventoryStats() {
  return useQuery({
    queryKey: ["inventory-stats"],
    queryFn: () => inventoryAPI.getInventoryStats(),
    refetchInterval: 30_000,
  });
}
