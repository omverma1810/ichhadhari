import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { inventoryAPI } from "@/lib/api/inventory";
import { getErrorMessage } from "@/lib/utils/api-helpers";
import type { PaginationParams } from "@/lib/api/milk";

// Items (mapped to existing API methods)
export function useLocations() {
  return useQuery({
    queryKey: ["locations"],
    queryFn: () => inventoryAPI.getStockLevels(),
  });
}

export function useLocation(id: string | undefined) {
  return useQuery({
    queryKey: ["location", id],
    queryFn: () => inventoryAPI.getItem(Number(id)),
    enabled: Boolean(id),
  });
}

// Stock Items
export function useStock(params?: PaginationParams) {
  return useQuery({
    queryKey: ["inventory-stock", params],
    queryFn: () => inventoryAPI.getItems(params),
    refetchInterval: 30_000,
  });
}

export function useStockByLocation(locationId: string | undefined) {
  return useQuery({
    queryKey: ["stock-by-location", locationId],
    queryFn: () => inventoryAPI.getLowStock({ search: locationId }),
    enabled: Boolean(locationId),
  });
}

// Stock Movements (mapped to Transactions)
export function useMovements(params?: PaginationParams) {
  return useQuery({
    queryKey: ["stock-movements", params],
    queryFn: () => inventoryAPI.getTransactions(params),
  });
}

export function useCreateMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => inventoryAPI.createTransaction(data),
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

// Stock Adjustments (mapped to Transactions)
export function useAdjustments(params?: PaginationParams) {
  return useQuery({
    queryKey: ["stock-adjustments", params],
    queryFn: () =>
      inventoryAPI.getTransactions({ ...params, type: "adjustment" } as any),
  });
}

export function useCreateAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) =>
      inventoryAPI.createTransaction({ ...data, type: "adjustment" }),
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
    mutationFn: (id: string) =>
      inventoryAPI.updateTransaction(Number(id), { status: "approved" } as any),
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
      inventoryAPI.updateTransaction(Number(variables.id), {
        status: "rejected",
        notes: variables.reason,
      } as any),
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
    mutationFn: (data: any) =>
      inventoryAPI.createTransaction({ ...data, type: "transfer" }),
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
    queryFn: () => inventoryAPI.getAlerts({ type: "expiry" } as any),
    refetchInterval: 60_000,
  });
}

// Statistics
export function useInventoryStats() {
  return useQuery({
    queryKey: ["inventory-stats"],
    queryFn: () => inventoryAPI.getStats(),
    refetchInterval: 30_000,
  });
}
