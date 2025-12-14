/**
 * Payroll Records Service
 * Handles payroll record management and approval workflow
 */

import { apiClient } from "@/lib/api/client";
import type {
  PayrollRecord,
  CreatePayrollRecordPayload,
  UpdatePayrollRecordPayload,
  PayrollRecordFilters,
  ApprovePayrollPayload,
  PaginatedResponse,
} from "@/types/api";

class PayrollRecordsService {
  private readonly BASE_PATH = "/api/employees/payroll-records";

  /**
   * Get list of payroll records with optional filters
   */
  async getPayrollRecords(
    filters?: PayrollRecordFilters
  ): Promise<PaginatedResponse<PayrollRecord>> {
    return apiClient.get<PaginatedResponse<PayrollRecord>>(
      `${this.BASE_PATH}/`,
      {
        params: filters,
      }
    );
  }

  /**
   * Get a single payroll record by ID
   */
  async getPayrollRecord(id: number): Promise<PayrollRecord> {
    return apiClient.get<PayrollRecord>(`${this.BASE_PATH}/${id}/`);
  }

  /**
   * Create a new payroll record
   */
  async createPayrollRecord(
    data: CreatePayrollRecordPayload
  ): Promise<PayrollRecord> {
    return apiClient.post<PayrollRecord>(`${this.BASE_PATH}/`, data);
  }

  /**
   * Update a payroll record
   */
  async updatePayrollRecord(
    id: number,
    data: UpdatePayrollRecordPayload
  ): Promise<PayrollRecord> {
    return apiClient.put<PayrollRecord>(`${this.BASE_PATH}/${id}/`, data);
  }

  /**
   * Delete a payroll record
   */
  async deletePayrollRecord(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.BASE_PATH}/${id}/`);
  }

  /**
   * Approve a payroll record (and optionally mark as paid)
   * @param id - Payroll record ID
   * @param data - Approval data with optional payment details
   */
  async approvePayrollRecord(
    id: number,
    data?: ApprovePayrollPayload
  ): Promise<PayrollRecord> {
    return apiClient.post<PayrollRecord>(
      `${this.BASE_PATH}/${id}/approve/`,
      data || {}
    );
  }
}

// Export singleton instance
export const payrollRecordsService = new PayrollRecordsService();
export default payrollRecordsService;
