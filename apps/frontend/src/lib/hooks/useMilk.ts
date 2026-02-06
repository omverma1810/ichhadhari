import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { milkAPI, type PaginationParams } from "@/lib/api/milk";
import { getErrorMessage } from "@/lib/utils/api-helpers";

export function useMilkIntakes(params: PaginationParams) {
  return useQuery({
    queryKey: ["milk-intakes", params],
    queryFn: () => milkAPI.getCollections(params),
    staleTime: 30_000,
  });
}

export function useMilkIntake(id: string) {
  return useQuery({
    queryKey: ["milk-intake", id],
    queryFn: () => milkAPI.getCollection(Number(id)),
    enabled: Boolean(id),
  });
}

export function useCreateMilkIntake() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => milkAPI.createCollection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["milk-intakes"] });
      queryClient.invalidateQueries({ queryKey: ["milk-segregation-stats"] });
      toast.success("Milk intake recorded successfully!", {
        description: "The data has been saved and categorized.",
      });
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error);
      toast.error("Failed to record milk intake", {
        description: message,
      });
    },
  });
}

export function useUpdateMilkIntake() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      milkAPI.updateCollection(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["milk-intakes"] });
      queryClient.invalidateQueries({ queryKey: ["milk-segregation-stats"] });
      toast.success("Milk intake updated successfully!");
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error);
      toast.error("Failed to update milk intake", {
        description: message,
      });
    },
  });
}

export function useDeleteMilkIntake() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => milkAPI.deleteCollection(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["milk-intakes"] });
      queryClient.invalidateQueries({ queryKey: ["milk-segregation-stats"] });
      toast.success("Milk intake deleted successfully!");
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error);
      toast.error("Failed to delete milk intake", {
        description: message,
      });
    },
  });
}

export function useSegregationStats() {
  return useQuery({
    queryKey: ["milk-segregation-stats"],
    queryFn: () => milkAPI.getCollectionStats(),
    refetchInterval: 30_000,
  });
}

export function useMilkTrends(days: number = 7) {
  return useQuery({
    queryKey: ["milk-trends", days],
    queryFn: () => milkAPI.getCollectionStats({ period: `${days}d` } as any),
    staleTime: 60_000,
  });
}
