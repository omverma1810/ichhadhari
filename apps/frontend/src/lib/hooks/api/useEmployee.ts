/**
 * Employee React Query Hooks
 * Custom hooks for managing employee, attendance, and salary data with React Query
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { employeeService } from "@/lib/services/employee.service";
import type {
  Employee,
  EmployeeFormData,
  Attendance,
  AttendanceFormData,
  Salary,
  SalaryFormData,
  EmployeeFilters,
} from "@/lib/services/employee.service";

// ==================== QUERY KEYS ====================

export const employeeKeys = {
  all: ["employees"] as const,
  employees: () => [...employeeKeys.all, "list"] as const,
  employee: (id: number) => [...employeeKeys.all, id] as const,
  employeesList: (filters?: EmployeeFilters) =>
    [...employeeKeys.employees(), filters] as const,
  attendance: () => [...employeeKeys.all, "attendance"] as const,
  attendanceRecord: (id: number) => [...employeeKeys.attendance(), id] as const,
  attendanceList: (filters?: EmployeeFilters) =>
    [...employeeKeys.attendance(), "list", filters] as const,
  salaries: () => [...employeeKeys.all, "salaries"] as const,
  salary: (id: number) => [...employeeKeys.salaries(), id] as const,
  salariesList: (filters?: EmployeeFilters) =>
    [...employeeKeys.salaries(), "list", filters] as const,
};

// ==================== EMPLOYEES ====================

export function useEmployees(filters?: EmployeeFilters) {
  return useQuery({
    queryKey: employeeKeys.employeesList(filters),
    queryFn: () => employeeService.getEmployees(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useEmployee(id: number) {
  return useQuery({
    queryKey: employeeKeys.employee(id),
    queryFn: () => employeeService.getEmployee(id),
    enabled: !!id && id > 0,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EmployeeFormData) =>
      employeeService.createEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.employees() });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Employee created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create employee");
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<EmployeeFormData>;
    }) => employeeService.updateEmployee(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.employees() });
      queryClient.invalidateQueries({
        queryKey: employeeKeys.employee(variables.id),
      });
      toast.success("Employee updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update employee");
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => employeeService.deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.employees() });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Employee deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete employee");
    },
  });
}

export function useUploadProfileImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      employeeService.uploadProfileImage(id, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: employeeKeys.employee(variables.id),
      });
      toast.success("Profile image uploaded successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to upload profile image");
    },
  });
}

// ==================== ATTENDANCE ====================

export function useAttendance(filters?: EmployeeFilters) {
  return useQuery({
    queryKey: employeeKeys.attendanceList(filters),
    queryFn: () => employeeService.getAttendance(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useAttendanceRecord(id: number) {
  return useQuery({
    queryKey: employeeKeys.attendanceRecord(id),
    queryFn: () => employeeService.getAttendanceRecord(id),
    enabled: !!id && id > 0,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AttendanceFormData) =>
      employeeService.createAttendance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.attendance() });
      toast.success("Attendance recorded successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to record attendance");
    },
  });
}

export function useUpdateAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<AttendanceFormData>;
    }) => employeeService.updateAttendance(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.attendance() });
      queryClient.invalidateQueries({
        queryKey: employeeKeys.attendanceRecord(variables.id),
      });
      toast.success("Attendance updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update attendance");
    },
  });
}

export function useDeleteAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => employeeService.deleteAttendance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.attendance() });
      toast.success("Attendance deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete attendance");
    },
  });
}

export function useMarkAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AttendanceFormData[]) =>
      employeeService.markAttendance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.attendance() });
      toast.success("Bulk attendance marked successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to mark attendance");
    },
  });
}

// ==================== SALARY ====================

export function useSalaries(filters?: EmployeeFilters) {
  return useQuery({
    queryKey: employeeKeys.salariesList(filters),
    queryFn: () => employeeService.getSalaries(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSalary(id: number) {
  return useQuery({
    queryKey: employeeKeys.salary(id),
    queryFn: () => employeeService.getSalary(id),
    enabled: !!id && id > 0,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateSalary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SalaryFormData) => employeeService.createSalary(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.salaries() });
      toast.success("Salary record created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create salary record");
    },
  });
}

export function useUpdateSalary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<SalaryFormData> }) =>
      employeeService.updateSalary(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.salaries() });
      queryClient.invalidateQueries({
        queryKey: employeeKeys.salary(variables.id),
      });
      toast.success("Salary record updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update salary record");
    },
  });
}

export function useDeleteSalary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => employeeService.deleteSalary(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.salaries() });
      toast.success("Salary record deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete salary record");
    },
  });
}

export function useProcessSalary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => employeeService.processSalary(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.salaries() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.salary(id) });
      toast.success("Salary processed successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to process salary");
    },
  });
}

export function useGeneratePayslip() {
  return useMutation({
    mutationFn: (id: number) => employeeService.generatePayslip(id),
    onSuccess: (blob) => {
      // Create download link for the PDF blob
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `payslip-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Payslip downloaded successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to generate payslip");
    },
  });
}
