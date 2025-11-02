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
  ColdStorage,
  ColdStorageFormData,
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
  storages: () => [...inventoryKeys.all, "cold-storage"] as const,
  storage: (id: number) => [...inventoryKeys.storages(), id] as const,
  storagesList: (filters?: InventoryFilters) =>
    [...inventoryKeys.storages(), "list", filters] as const,
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

// ==================== COLD STORAGE ====================
// NOTE: Cold Storage endpoints are not yet implemented in the backend.
// Using mock data until backend API is ready.

const mockColdStorages = {
  count: 4,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      unit_id: "CS-001",
      location: "Main Warehouse - Section A",
      capacity_liters: 5000,
      current_load_liters: 3200,
      temperature_celsius: 4.2,
      target_temperature: 4.0,
      humidity_percentage: 65,
      status: "operational",
      power_backup: true,
      assigned_technician: "Rajesh Kumar",
      next_maintenance_due: "2025-11-15",
      last_maintenance: "2025-10-10",
      created_at: "2024-01-15T10:00:00Z",
      updated_at: "2025-10-26T08:30:00Z",
    },
    {
      id: 2,
      unit_id: "CS-002",
      location: "Main Warehouse - Section B",
      capacity_liters: 5000,
      current_load_liters: 4800,
      temperature_celsius: 3.8,
      target_temperature: 4.0,
      humidity_percentage: 68,
      status: "operational",
      power_backup: true,
      assigned_technician: "Priya Sharma",
      next_maintenance_due: "2025-12-01",
      last_maintenance: "2025-10-15",
      created_at: "2024-01-15T10:00:00Z",
      updated_at: "2025-10-26T08:30:00Z",
    },
    {
      id: 3,
      unit_id: "CS-003",
      location: "Secondary Storage - Floor 2",
      capacity_liters: 3000,
      current_load_liters: 1500,
      temperature_celsius: 5.5,
      target_temperature: 4.0,
      humidity_percentage: 70,
      status: "maintenance",
      power_backup: false,
      assigned_technician: "Amit Patel",
      next_maintenance_due: "2025-10-20",
      last_maintenance: "2025-09-20",
      created_at: "2024-02-01T10:00:00Z",
      updated_at: "2025-10-26T08:30:00Z",
    },
    {
      id: 4,
      unit_id: "CS-004",
      location: "Distribution Center",
      capacity_liters: 4000,
      current_load_liters: 2800,
      temperature_celsius: 4.0,
      target_temperature: 4.0,
      humidity_percentage: 62,
      status: "operational",
      power_backup: true,
      assigned_technician: "Sunita Verma",
      next_maintenance_due: "2025-11-25",
      last_maintenance: "2025-10-12",
      created_at: "2024-02-15T10:00:00Z",
      updated_at: "2025-10-26T08:30:00Z",
    },
  ],
};

export function useColdStorages(filters?: InventoryFilters) {
  return useQuery({
    queryKey: inventoryKeys.storagesList(filters),
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      return mockColdStorages;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
}

export function useColdStorage(id: number) {
  return useQuery({
    queryKey: inventoryKeys.storage(id),
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      const storage = mockColdStorages.results.find((s: any) => s.id === id);
      if (!storage) throw new Error("Storage unit not found");
      return storage;
    },
    enabled: !!id && id > 0,
    staleTime: 1 * 60 * 1000, // 1 minute (more frequent for monitoring)
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
}

export function useCreateColdStorage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ColdStorageFormData) =>
      inventoryService.createStorage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.storages() });
      toast.success("Cold storage unit created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create cold storage unit");
    },
  });
}

export function useUpdateColdStorage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<ColdStorageFormData>;
    }) => inventoryService.updateStorage(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.storages() });
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.storage(variables.id),
      });
      toast.success("Cold storage unit updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update cold storage unit");
    },
  });
}

export function useDeleteColdStorage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => inventoryService.deleteStorage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.storages() });
      toast.success("Cold storage unit deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete cold storage unit");
    },
  });
}

export function useUpdateTemperature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      temperature,
      humidity,
    }: {
      id: number;
      temperature: number;
      humidity: number;
    }) => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      // Update the mock data
      const storage = mockColdStorages.results.find((s: any) => s.id === id);
      if (storage) {
        storage.temperature_celsius = temperature;
        storage.humidity_percentage = humidity;
        storage.updated_at = new Date().toISOString();
      }
      return storage;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.storages() });
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.storage(variables.id),
      });
      toast.success("Temperature updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update temperature");
    },
  });
}

export function useMaintenanceAlerts() {
  return useQuery({
    queryKey: [...inventoryKeys.storages(), "maintenance-alerts"] as const,
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      // Return storage units with overdue maintenance
      const today = new Date().toISOString().split("T")[0];
      const overdueUnits = mockColdStorages.results.filter(
        (s: any) => s.next_maintenance_due < today
      );
      return {
        count: overdueUnits.length,
        next: null,
        previous: null,
        results: overdueUnits,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}
