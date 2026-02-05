/**
 * Inventory React Query Hooks
 * Custom hooks for managing inventory data with React Query
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { inventoryService } from "@/lib/services/inventory.service";
import type {
  InventoryItem,
  InventoryItemFormData,
  StockTransaction,
  StockTransactionFormData,
  InventoryFilters,
} from "@/lib/services/inventory.service";

// ==================== QUERY KEYS ====================

export const inventoryKeys = {
  all: ["inventory"] as const,
  items: () => [...inventoryKeys.all, "items"] as const,
  item: (id: number) => [...inventoryKeys.items(), id] as const,
  itemsList: (filters?: InventoryFilters) =>
    [...inventoryKeys.items(), "list", filters] as const,
  lowStock: () => [...inventoryKeys.items(), "low-stock"] as const,
  transactions: () => [...inventoryKeys.all, "transactions"] as const,
  transaction: (id: number) => [...inventoryKeys.transactions(), id] as const,
  transactionsList: (filters?: InventoryFilters) =>
    [...inventoryKeys.transactions(), "list", filters] as const,
};

// ==================== INVENTORY ITEMS ====================

export function useInventoryItems(filters?: InventoryFilters) {
  return useQuery({
    queryKey: inventoryKeys.itemsList(filters),
    queryFn: () => inventoryService.getItems(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useInventoryItem(id: number) {
  return useQuery({
    queryKey: inventoryKeys.item(id),
    queryFn: () => inventoryService.getItem(id),
    enabled: !!id && id > 0,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLowStockItems() {
  return useQuery({
    queryKey: inventoryKeys.lowStock(),
    queryFn: () => inventoryService.getLowStockItems(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

export function useOutOfStockItems() {
  return useQuery({
    queryKey: [...inventoryKeys.items(), "out-of-stock"] as const,
    queryFn: () => inventoryService.getOutOfStockItems(),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useBulkUpdateStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Array<{ id: number; current_stock: number }>) =>
      inventoryService.bulkUpdateStock(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.items() });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Stock levels updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update stock levels");
    },
  });
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InventoryItemFormData) =>
      inventoryService.createItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.items() });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Inventory item created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create inventory item");
    },
  });
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<InventoryItemFormData>;
    }) => inventoryService.updateItem(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.items() });
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.item(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lowStock() });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Inventory item updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update inventory item");
    },
  });
}

export function useDeleteInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => inventoryService.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.items() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lowStock() });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Inventory item deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete inventory item");
    },
  });
}

// ==================== STOCK TRANSACTIONS ====================

export function useStockTransactions(filters?: InventoryFilters) {
  return useQuery({
    queryKey: inventoryKeys.transactionsList(filters),
    queryFn: () => inventoryService.getTransactions(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useStockTransaction(id: number) {
  return useQuery({
    queryKey: inventoryKeys.transaction(id),
    queryFn: () => inventoryService.getTransaction(id),
    enabled: !!id && id > 0,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateStockTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StockTransactionFormData) =>
      inventoryService.createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.transactions() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.items() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lowStock() });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Stock transaction recorded successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to record stock transaction");
    },
  });
}

export function useUpdateStockTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<StockTransactionFormData>;
    }) => inventoryService.updateTransaction(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.transactions() });
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.transaction(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.items() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lowStock() });
      toast.success("Stock transaction updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update stock transaction");
    },
  });
}

export function useDeleteStockTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => inventoryService.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.transactions() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.items() });
      toast.success("Stock transaction deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete stock transaction");
    },
  });
}

export function useItemTransactionHistory(
  itemId: string | number,
  filters?: InventoryFilters,
) {
  return useQuery({
    queryKey: [
      ...inventoryKeys.item(Number(itemId)),
      "transactions",
      filters,
    ] as const,
    queryFn: () =>
      inventoryService.getTransactions({ ...filters, item: Number(itemId) }),
    enabled: !!itemId,
    staleTime: 2 * 60 * 1000,
  });
}
