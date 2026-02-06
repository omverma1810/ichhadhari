import { apiClient, handleApiError } from "@/lib/api-client";
import type { PaginatedResponse, Employee, Attendance } from "@/types/api";

export const employeeService = {
  /**
   * Get all employees
   */
  getEmployees: async (params?: {
    page?: number;
    page_size?: number;
    department?: string;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<Employee>> => {
    try {
      return await apiClient.get<PaginatedResponse<Employee>>(
        "/api/employees/",
        params,
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get single employee
   */
  getEmployee: async (id: number): Promise<Employee> => {
    try {
      return await apiClient.get<Employee>(`/api/employees/${id}/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Create employee
   */
  createEmployee: async (data: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    date_of_birth: string;
    gender: "male" | "female" | "other";
    address: string;
    city: string;
    state: string;
    pincode: string;
    department: string;
    designation: string;
    date_of_joining: string;
    employment_type: "permanent" | "contract" | "temporary";
    salary: string | number;
    bank_account_number?: string;
    bank_ifsc_code?: string;
  }): Promise<Employee> => {
    try {
      const formattedData = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        date_of_birth: data.date_of_birth,
        gender: data.gender,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        department: data.department,
        designation: data.designation,
        date_of_joining: data.date_of_joining,
        employment_type: data.employment_type,
        salary: String(data.salary),
        bank_account_number: data.bank_account_number || "",
        bank_ifsc_code: data.bank_ifsc_code || "",
        status: "active",
        is_active: true,
      };

      console.log("📤 Creating employee:", formattedData);
      const response = await apiClient.post<Employee>(
        "/api/employees/",
        formattedData,
      );
      console.log("✅ Employee created:", response);
      return response;
    } catch (error) {
      console.error("❌ Failed to create employee:", error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Update employee
   */
  updateEmployee: async (
    id: number,
    data: Partial<Employee>,
  ): Promise<Employee> => {
    try {
      const formattedData: any = {};
      if (data.first_name !== undefined)
        formattedData.first_name = data.first_name;
      if (data.last_name !== undefined)
        formattedData.last_name = data.last_name;
      if (data.email !== undefined) formattedData.email = data.email;
      if (data.phone !== undefined) formattedData.phone = data.phone;
      if (data.department !== undefined)
        formattedData.department = data.department;
      if (data.designation !== undefined)
        formattedData.designation = data.designation;
      if (data.basic_salary !== undefined)
        formattedData.basic_salary = String(data.basic_salary);
      if (data.status !== undefined) formattedData.status = data.status;
      if (data.is_active !== undefined)
        formattedData.is_active = data.is_active;

      console.log("📤 Updating employee:", formattedData);
      const response = await apiClient.put<Employee>(
        `/api/employees/${id}/`,
        formattedData,
      );
      console.log("✅ Employee updated:", response);
      return response;
    } catch (error) {
      console.error("❌ Failed to update employee:", error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Delete employee
   */
  deleteEmployee: async (id: number): Promise<void> => {
    try {
      console.log("🗑️ Deleting employee:", id);
      await apiClient.delete(`/api/employees/${id}/`);
      console.log("✅ Employee deleted");
    } catch (error) {
      console.error("❌ Failed to delete employee:", error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get attendance records
   */
  getAttendance: async (params?: {
    page?: number;
    page_size?: number;
    employee?: number;
    date_from?: string;
    date_to?: string;
  }): Promise<PaginatedResponse<Attendance>> => {
    try {
      return await apiClient.get<PaginatedResponse<Attendance>>(
        "/api/employees/attendance/",
        params,
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Mark attendance
   */
  markAttendance: async (data: {
    employee: number;
    date: string;
    check_in_time: string;
    check_out_time?: string;
    status: "present" | "absent" | "half_day" | "leave";
    notes?: string;
  }): Promise<Attendance> => {
    try {
      console.log("📤 Marking attendance:", data);
      const response = await apiClient.post<Attendance>(
        "/api/employees/attendance/",
        data,
      );
      console.log("✅ Attendance marked:", response);
      return response;
    } catch (error) {
      console.error("❌ Failed to mark attendance:", error);
      throw new Error(handleApiError(error));
    }
  },
};
