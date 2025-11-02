/**
 * Production - Schedules Service
 */

import { apiClient } from "@/lib/api/client";
import type {
  ProductionSchedule,
  ProductionScheduleFilters,
  CreateProductionSchedulePayload,
  UpdateProductionSchedulePayload,
  PaginatedResponse,
} from "@/types/api";

class SchedulesService {
  private readonly BASE_PATH = "/production/schedules";

  async getSchedules(
    filters?: ProductionScheduleFilters
  ): Promise<PaginatedResponse<ProductionSchedule>> {
    return apiClient.get<PaginatedResponse<ProductionSchedule>>(
      `${this.BASE_PATH}/`,
      { params: filters }
    );
  }

  async getSchedule(id: number): Promise<ProductionSchedule> {
    return apiClient.get<ProductionSchedule>(`${this.BASE_PATH}/${id}/`);
  }

  async createSchedule(
    data: CreateProductionSchedulePayload
  ): Promise<ProductionSchedule> {
    return apiClient.post<ProductionSchedule>(`${this.BASE_PATH}/`, data);
  }

  async updateSchedule(
    id: number,
    data: UpdateProductionSchedulePayload
  ): Promise<ProductionSchedule> {
    return apiClient.put<ProductionSchedule>(`${this.BASE_PATH}/${id}/`, data);
  }

  async deleteSchedule(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.BASE_PATH}/${id}/`);
  }

  /**
   * Get upcoming schedules
   */
  async getUpcomingSchedules(days: number = 7): Promise<ProductionSchedule[]> {
    return apiClient.get<ProductionSchedule[]>(`${this.BASE_PATH}/upcoming/`, {
      params: { days },
    });
  }

  /**
   * Get today's schedules
   */
  async getTodaySchedules(): Promise<ProductionSchedule[]> {
    return apiClient.get<ProductionSchedule[]>(`${this.BASE_PATH}/today/`);
  }
}

export const schedulesService = new SchedulesService();
export default schedulesService;
