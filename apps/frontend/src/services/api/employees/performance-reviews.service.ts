/**
 * Performance Reviews Service
 * Handles performance review operations
 */

import { apiClient } from "@/lib/api/client";
import type {
  PerformanceReview,
  CreatePerformanceReviewPayload,
  UpdatePerformanceReviewPayload,
  PerformanceReviewFilters,
  PaginatedResponse,
} from "@/types/api";

class PerformanceReviewsService {
  private readonly BASE_PATH = "/api/employees/performance-reviews";

  /**
   * Get list of performance reviews with optional filters
   */
  async getPerformanceReviews(
    filters?: PerformanceReviewFilters
  ): Promise<PaginatedResponse<PerformanceReview>> {
    return apiClient.get<PaginatedResponse<PerformanceReview>>(
      `${this.BASE_PATH}/`,
      {
        params: filters,
      }
    );
  }

  /**
   * Get a single performance review by ID
   */
  async getPerformanceReview(id: number): Promise<PerformanceReview> {
    return apiClient.get<PerformanceReview>(`${this.BASE_PATH}/${id}/`);
  }

  /**
   * Create a new performance review
   */
  async createPerformanceReview(
    data: CreatePerformanceReviewPayload
  ): Promise<PerformanceReview> {
    return apiClient.post<PerformanceReview>(`${this.BASE_PATH}/`, data);
  }

  /**
   * Update a performance review
   */
  async updatePerformanceReview(
    id: number,
    data: UpdatePerformanceReviewPayload
  ): Promise<PerformanceReview> {
    return apiClient.put<PerformanceReview>(`${this.BASE_PATH}/${id}/`, data);
  }

  /**
   * Delete a performance review
   */
  async deletePerformanceReview(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.BASE_PATH}/${id}/`);
  }
}

// Export singleton instance
export const performanceReviewsService = new PerformanceReviewsService();
export default performanceReviewsService;
