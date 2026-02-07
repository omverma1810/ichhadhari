/**
 * Milk Management - Segregation Plans Service
 */

import { apiClient } from "@/lib/api/client";
import type { PaginatedResponse } from "@/types/api";
import type {
  MilkSegregationPlan,
  CreateMilkSegregationPlanPayload,
  MilkSegregationPlanFilters,
} from "@/types/api/milk-management";

class SegregationPlansService {
  private readonly BASE_PATH = "/api/milk/segregation-plans";

  async getPlans(
    filters?: MilkSegregationPlanFilters,
  ): Promise<PaginatedResponse<MilkSegregationPlan>> {
    return apiClient.get<PaginatedResponse<MilkSegregationPlan>>(
      `${this.BASE_PATH}/`,
      { params: filters },
    );
  }

  async getPlan(id: number): Promise<MilkSegregationPlan> {
    return apiClient.get<MilkSegregationPlan>(`${this.BASE_PATH}/${id}/`);
  }

  async createPlan(
    data: CreateMilkSegregationPlanPayload,
  ): Promise<MilkSegregationPlan> {
    return apiClient.post<MilkSegregationPlan>(`${this.BASE_PATH}/`, data);
  }
}

export const segregationPlansService = new SegregationPlansService();
export default segregationPlansService;
