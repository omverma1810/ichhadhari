/**
 * Inventory API Hooks
 * React Query hooks for inventory operations
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  inventoryItemsService,
  transactionsService,
  alertsService,
  rawMaterialsService,
  finishedGoodsService,
} from "@/services/api";
import { getErrorMessage } from "@/lib/utils/api-helpers";
import { toast } from "sonner";
import type {
  InventoryItemFilters,
  CreateInventoryItemPayload,
  UpdateInventoryItemPayload,
  StockTransactionFilters,
  CreateStockTransactionPayload,
  StockAlertFilters,
  CreateStockAlertPayload,
  UpdateStockAlertPayload,
  AcknowledgeAlertPayload,
  ResolveAlertPayload,
  RawMaterialStockFilters,
  FinishedGoodsStockFilters,
  StockAlertsSummary,
} from "@/types/api";

// Query Keys
export const inventoryKeys = {
  all: ["inventory"] as const,
  items: () => [...inventoryKeys.all, "items"] as const,
  itemsList: (filters?: InventoryItemFilters) =>
    [...inventoryKeys.items(), "list", filters] as const,
  item: (id: number) => [...inventoryKeys.items(), "detail", id] as const,
  lowStock: () => [...inventoryKeys.items(), "low-stock"] as const,
  stockLevels: () => [...inventoryKeys.items(), "stock-levels"] as const,
  transactionHistory: (id: number) =>
    [...inventoryKeys.item(id), "transactions"] as const,
  transactions: () => [...inventoryKeys.all, "transactions"] as const,
  transactionsList: (filters?: StockTransactionFilters) =>
    [...inventoryKeys.transactions(), "list", filters] as const,
  transactionStats: (params?: { start_date?: string; end_date?: string }) =>
    [...inventoryKeys.transactions(), "stats", params] as const,
  alerts: () => [...inventoryKeys.all, "alerts"] as const,
  alertsList: (filters?: StockAlertFilters) =>
    [...inventoryKeys.alerts(), "list", filters] as const,
  alert: (id: number) => [...inventoryKeys.alerts(), "detail", id] as const,
  alertsSummary: () => [...inventoryKeys.alerts(), "summary"] as const,
  rawMaterials: () => [...inventoryKeys.all, "raw-materials"] as const,
  rawMaterialsList: (filters?: RawMaterialStockFilters) =>
    [...inventoryKeys.rawMaterials(), "list", filters] as const,
  rawMaterial: (id: number) =>
    [...inventoryKeys.rawMaterials(), "detail", id] as const,
  finishedGoods: () => [...inventoryKeys.all, "finished-goods"] as const,
  finishedGoodsList: (filters?: FinishedGoodsStockFilters) =>
    [...inventoryKeys.finishedGoods(), "list", filters] as const,
  finishedGood: (id: number) =>
    [...inventoryKeys.finishedGoods(), "detail", id] as const,
};

// Items Queries
export const useInventoryItems = (filters?: InventoryItemFilters) => {
  return useQuery({
    queryKey: inventoryKeys.itemsList(filters),
    queryFn: () => inventoryItemsService.getItems(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useInventoryItem = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: inventoryKeys.item(id),
    queryFn: () => inventoryItemsService.getItem(id),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};

export const useLowStockItems = () => {
  return useQuery({
    queryKey: inventoryKeys.lowStock(),
    queryFn: () => inventoryItemsService.getLowStockItems(),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
};

export const useStockLevels = () => {
  return useQuery({
    queryKey: inventoryKeys.stockLevels(),
    queryFn: () => inventoryItemsService.getStockLevels(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useTransactionHistory = (
  id: number,
  params?: {
    start_date?: string;
    end_date?: string;
  }
) => {
  return useQuery({
    queryKey: inventoryKeys.transactionHistory(id),
    queryFn: () => inventoryItemsService.getTransactionHistory(id, params),
    staleTime: 3 * 60 * 1000,
  });
};

// Raw Materials Queries
export const useRawMaterials = (filters?: RawMaterialStockFilters) => {
  return useQuery({
    queryKey: inventoryKeys.rawMaterialsList(filters),
    queryFn: () => rawMaterialsService.getRawMaterials(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useRawMaterial = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: inventoryKeys.rawMaterial(id),
    queryFn: () => rawMaterialsService.getRawMaterial(id),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};

// Finished Goods Queries
export const useFinishedGoods = (filters?: FinishedGoodsStockFilters) => {
  return useQuery({
    queryKey: inventoryKeys.finishedGoodsList(filters),
    queryFn: () => finishedGoodsService.getFinishedGoods(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useFinishedGood = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: inventoryKeys.finishedGood(id),
    queryFn: () => finishedGoodsService.getFinishedGood(id),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};

// Items Mutations
export const useCreateInventoryItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInventoryItemPayload) =>
      inventoryItemsService.createItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.items() });
      toast.success("Inventory item created successfully");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateInventoryItemPayload;
    }) => inventoryItemsService.updateItem(id, data),
    onSuccess: (_: any, variables: any) => {
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.item(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.itemsList() });
      toast.success("Inventory item updated successfully");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useDeleteInventoryItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => inventoryItemsService.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.items() });
      toast.success("Inventory item deleted successfully");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

// Transactions Queries
export const useTransactions = (filters?: StockTransactionFilters) => {
  return useQuery({
    queryKey: inventoryKeys.transactionsList(filters),
    queryFn: () => transactionsService.getTransactions(filters),
    staleTime: 3 * 60 * 1000,
  });
};

export const useTransactionStats = (params?: {
  start_date?: string;
  end_date?: string;
}) => {
  return useQuery({
    queryKey: inventoryKeys.transactionStats(params),
    queryFn: () => transactionsService.getTransactionStats(params),
    staleTime: 5 * 60 * 1000,
  });
};

// Transactions Mutations
export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStockTransactionPayload) =>
      transactionsService.createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.transactions() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.items() });
      toast.success("Transaction recorded successfully");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

// Alerts Queries
export const useStockAlerts = (filters?: StockAlertFilters) => {
  return useQuery({
    queryKey: inventoryKeys.alertsList(filters),
    queryFn: () => alertsService.getAlerts(filters),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 3 * 60 * 1000,
  });
};

export const useStockAlert = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: inventoryKeys.alert(id),
    queryFn: () => alertsService.getAlert(id),
    enabled,
    staleTime: 3 * 60 * 1000,
  });
};

export const useStockAlertsSummary = () => {
  return useQuery<StockAlertsSummary>({
    queryKey: inventoryKeys.alertsSummary(),
    queryFn: () => alertsService.getAlertSummary(),
    staleTime: 2 * 60 * 1000,
  });
};

// Alerts Mutations
export const useCreateStockAlert = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStockAlertPayload) =>
      alertsService.createAlert(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.alerts() });
      toast.success("Alert created successfully");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useAcknowledgeStockAlert = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data?: AcknowledgeAlertPayload;
    }) => alertsService.acknowledgeAlert(id, data),
    onSuccess: (_: any, variables: any) => {
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.alert(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.alertsList() });
      toast.success("Alert acknowledged");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useResolveStockAlert = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ResolveAlertPayload }) =>
      alertsService.resolveAlert(id, data),
    onSuccess: (_: any, variables: any) => {
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.alert(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.alertsList() });
      toast.success("Alert resolved");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};
