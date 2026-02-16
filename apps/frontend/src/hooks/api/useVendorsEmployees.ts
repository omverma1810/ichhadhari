/**
 * Vendors & Employees API Hooks
 * React Query hooks for vendors and employees operations
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  vendorsService,
  purchaseOrdersService,
  vendorPaymentsService,
  grnsService,
  employeesService,
} from "@/services/api";
import { getErrorMessage } from "@/lib/utils/api-helpers";
import { toast } from "sonner";
import type {
  VendorFilters,
  CreateVendorPayload,
  UpdateVendorPayload,
  PurchaseOrderFilters,
  CreatePurchaseOrderPayload,
  UpdatePurchaseOrderPayload,
  VendorPaymentFilters,
  CreateVendorPaymentPayload,
  UpdateVendorPaymentPayload,
  GoodsReceiptNoteFilters,
  CreateGoodsReceiptNotePayload,
  UpdateGoodsReceiptNotePayload,
  EmployeeFilters,
  CreateEmployeePayload,
  UpdateEmployeePayload,
  MarkAttendancePayload,
  ProcessSalaryPayload,
  UpdateSalaryPayload,
  AttendanceFilters,
  SalaryFilters,
  DepartmentRecord,
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
  LeaveTypeRecord,
  CreateLeaveTypePayload,
  UpdateLeaveTypePayload,
  LeaveBalanceFilters,
  SalaryStructureRecord,
  CreateSalaryStructurePayload,
  UpdateSalaryStructurePayload,
  LeaveBalanceRecord,
  PaginatedResponse,
} from "@/types/api";

// ============ VENDORS ============

export const vendorKeys = {
  all: ["vendors"] as const,
  list: (filters?: VendorFilters) =>
    [...vendorKeys.all, "list", filters] as const,
  detail: (id: number) => [...vendorKeys.all, "detail", id] as const,
  purchaseOrders: (id: number) =>
    [...vendorKeys.detail(id), "purchase_orders"] as const,
  stats: (id: number) => [...vendorKeys.detail(id), "stats"] as const,
};

export const purchaseOrderKeys = {
  all: ["purchase-orders"] as const,
  list: (filters?: PurchaseOrderFilters) =>
    [...purchaseOrderKeys.all, "list", filters] as const,
  detail: (id: number) => [...purchaseOrderKeys.all, "detail", id] as const,
};

export const vendorPaymentKeys = {
  all: ["vendor-payments"] as const,
  list: (filters?: VendorPaymentFilters) =>
    [...vendorPaymentKeys.all, "list", filters] as const,
  detail: (id: number) => [...vendorPaymentKeys.all, "detail", id] as const,
};

export const grnKeys = {
  all: ["grns"] as const,
  list: (filters?: GoodsReceiptNoteFilters) =>
    [...grnKeys.all, "list", filters] as const,
  detail: (id: number) => [...grnKeys.all, "detail", id] as const,
};

export const useVendors = (filters?: VendorFilters) => {
  return useQuery({
    queryKey: vendorKeys.list(filters),
    queryFn: () => vendorsService.getVendors(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useVendor = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: vendorKeys.detail(id),
    queryFn: () => vendorsService.getVendor(id),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};

export const useVendorPurchaseOrders = (id: number, status?: string) => {
  return useQuery({
    queryKey: [...vendorKeys.purchaseOrders(id), status],
    queryFn: () => vendorsService.getVendorPurchaseOrders(id, status),
    staleTime: 3 * 60 * 1000,
  });
};

export const useVendorStats = (id: number) => {
  return useQuery({
    queryKey: vendorKeys.stats(id),
    queryFn: () => vendorsService.getVendorStats(id),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateVendorPayload) =>
      vendorsService.createVendor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.all });
      toast.success("Vendor created successfully");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useUpdateVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateVendorPayload }) =>
      vendorsService.updateVendor(id, data),
    onSuccess: (_: any, variables: any) => {
      queryClient.invalidateQueries({
        queryKey: vendorKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: vendorKeys.list() });
      toast.success("Vendor updated successfully");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useDeleteVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => vendorsService.deleteVendor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.all });
      toast.success("Vendor deleted successfully");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

// ============ PURCHASE ORDERS ============

export const usePurchaseOrders = (filters?: PurchaseOrderFilters) => {
  return useQuery({
    queryKey: purchaseOrderKeys.list(filters),
    queryFn: () => purchaseOrdersService.getPurchaseOrders(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const usePurchaseOrder = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: purchaseOrderKeys.detail(id),
    queryFn: () => purchaseOrdersService.getPurchaseOrder(id),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePurchaseOrderPayload) =>
      purchaseOrdersService.createPurchaseOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.all });
      toast.success("Purchase order created successfully");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useUpdatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdatePurchaseOrderPayload;
    }) => purchaseOrdersService.updatePurchaseOrder(id, data),
    onSuccess: (_: any, variables: any) => {
      queryClient.invalidateQueries({
        queryKey: purchaseOrderKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.list() });
      queryClient.invalidateQueries({ queryKey: vendorKeys.all });
      toast.success("Purchase order updated successfully");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useDeletePurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => purchaseOrdersService.deletePurchaseOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.all });
      queryClient.invalidateQueries({ queryKey: vendorKeys.all });
      toast.success("Purchase order deleted successfully");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useApprovePurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => purchaseOrdersService.approvePurchaseOrder(id),
    onSuccess: (_: any, id: number) => {
      queryClient.invalidateQueries({
        queryKey: purchaseOrderKeys.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.list() });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Purchase order approved successfully");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useSendPurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => purchaseOrdersService.sendPurchaseOrder(id),
    onSuccess: (_: any, id: number) => {
      queryClient.invalidateQueries({
        queryKey: purchaseOrderKeys.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.list() });
      toast.success("Purchase order sent to vendor");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useConfirmPurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => purchaseOrdersService.confirmPurchaseOrder(id),
    onSuccess: (_: any, id: number) => {
      queryClient.invalidateQueries({
        queryKey: purchaseOrderKeys.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.list() });
      toast.success("Purchase order confirmed");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useCancelPurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => purchaseOrdersService.cancelPurchaseOrder(id),
    onSuccess: (_: any, id: number) => {
      queryClient.invalidateQueries({
        queryKey: purchaseOrderKeys.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.list() });
      toast.success("Purchase order cancelled");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

// ============ VENDOR PAYMENTS ============

export const useVendorPayments = (filters?: VendorPaymentFilters) => {
  return useQuery({
    queryKey: vendorPaymentKeys.list(filters),
    queryFn: () => vendorPaymentsService.getVendorPayments(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useVendorPayment = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: vendorPaymentKeys.detail(id),
    queryFn: () => vendorPaymentsService.getVendorPayment(id),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateVendorPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateVendorPaymentPayload) =>
      vendorPaymentsService.createVendorPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorPaymentKeys.all });
      queryClient.invalidateQueries({ queryKey: vendorKeys.all });
      toast.success("Vendor payment created successfully");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useUpdateVendorPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateVendorPaymentPayload;
    }) => vendorPaymentsService.updateVendorPayment(id, data),
    onSuccess: (_: any, variables: any) => {
      queryClient.invalidateQueries({
        queryKey: vendorPaymentKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: vendorPaymentKeys.list() });
      queryClient.invalidateQueries({ queryKey: vendorKeys.all });
      toast.success("Vendor payment updated successfully");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useDeleteVendorPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => vendorPaymentsService.deleteVendorPayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorPaymentKeys.all });
      queryClient.invalidateQueries({ queryKey: vendorKeys.all });
      toast.success("Vendor payment deleted successfully");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

// ============ GOODS RECEIPT NOTES ============

export const useGRNs = (filters?: GoodsReceiptNoteFilters) => {
  return useQuery({
    queryKey: grnKeys.list(filters),
    queryFn: () => grnsService.getGRNs(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useGRN = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: grnKeys.detail(id),
    queryFn: () => grnsService.getGRN(id),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateGRN = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGoodsReceiptNotePayload) =>
      grnsService.createGRN(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: grnKeys.all });
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.all });
      queryClient.invalidateQueries({ queryKey: vendorKeys.all });
      toast.success("GRN created successfully");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useUpdateGRN = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateGoodsReceiptNotePayload;
    }) => grnsService.updateGRN(id, data),
    onSuccess: (_: any, variables: any) => {
      queryClient.invalidateQueries({ queryKey: grnKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: grnKeys.list() });
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.all });
      toast.success("GRN updated successfully");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useDeleteGRN = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => grnsService.deleteGRN(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: grnKeys.all });
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.all });
      toast.success("GRN deleted successfully");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

// ============ EMPLOYEES ============

export const employeeKeys = {
  all: ["employees"] as const,
  list: (filters?: EmployeeFilters) =>
    [...employeeKeys.all, "list", filters] as const,
  detail: (id: number) => [...employeeKeys.all, "detail", id] as const,
  attendance: (id: number, filters?: AttendanceFilters) =>
    [...employeeKeys.detail(id), "attendance", filters] as const,
  attendanceSummary: (id: number, startDate?: string, endDate?: string) =>
    [
      ...employeeKeys.detail(id),
      "attendance-summary",
      startDate,
      endDate,
    ] as const,
  salaries: (id: number, filters?: SalaryFilters) =>
    [...employeeKeys.detail(id), "salaries", filters] as const,
  departments: () => [...employeeKeys.all, "departments"] as const,
  department: (id: number) =>
    [...employeeKeys.departments(), "detail", id] as const,
  leaveTypes: () => [...employeeKeys.all, "leave-types"] as const,
  leaveType: (id: number) =>
    [...employeeKeys.leaveTypes(), "detail", id] as const,
  leaveBalances: (filters?: LeaveBalanceFilters) =>
    [...employeeKeys.all, "leave-balances", filters] as const,
  leaveBalance: (id: number) =>
    [...employeeKeys.leaveBalances(), "detail", id] as const,
  salaryStructures: (filters?: { employee?: number }) =>
    [...employeeKeys.all, "salary-structures", filters] as const,
  salaryStructure: (id: number) =>
    [...employeeKeys.salaryStructures(), "detail", id] as const,
};

export const useEmployees = (filters?: EmployeeFilters) => {
  return useQuery({
    queryKey: employeeKeys.list(filters),
    queryFn: () => employeesService.getEmployees(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useEmployee = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: () => employeesService.getEmployee(id),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};

export const useEmployeeAttendance = (
  id: number,
  filters?: AttendanceFilters,
) => {
  return useQuery({
    queryKey: employeeKeys.attendance(id, filters),
    queryFn: () => employeesService.getAttendance(id, filters),
    staleTime: 2 * 60 * 1000,
  });
};

export const useAttendanceSummary = (
  id: number,
  startDate?: string,
  endDate?: string,
) => {
  return useQuery({
    queryKey: employeeKeys.attendanceSummary(id, startDate, endDate),
    queryFn: () =>
      employeesService.getAttendanceSummary(id, startDate, endDate),
    staleTime: 5 * 60 * 1000,
  });
};

export const useEmployeeSalaries = (id: number, filters?: SalaryFilters) => {
  return useQuery({
    queryKey: employeeKeys.salaries(id, filters),
    queryFn: () => employeesService.getSalaries(id, filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useDepartments = () => {
  return useQuery<PaginatedResponse<DepartmentRecord>>({
    queryKey: employeeKeys.departments(),
    queryFn: () => employeesService.getDepartments(),
    staleTime: 10 * 60 * 1000,
  });
};

export const useDepartment = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: employeeKeys.department(id),
    queryFn: () => employeesService.getDepartment(id),
    enabled,
    staleTime: 10 * 60 * 1000,
  });
};

export const useLeaveTypes = () => {
  return useQuery<PaginatedResponse<LeaveTypeRecord>>({
    queryKey: employeeKeys.leaveTypes(),
    queryFn: () => employeesService.getLeaveTypes(),
    staleTime: 10 * 60 * 1000,
  });
};

export const useLeaveBalances = (filters?: LeaveBalanceFilters) => {
  return useQuery<PaginatedResponse<LeaveBalanceRecord>>({
    queryKey: employeeKeys.leaveBalances(filters),
    queryFn: () => employeesService.getLeaveBalances(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useLeaveBalance = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: employeeKeys.leaveBalance(id),
    queryFn: () => employeesService.getLeaveBalance(id),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};

export const useSalaryStructures = (filters?: { employee?: number }) => {
  return useQuery<PaginatedResponse<SalaryStructureRecord>>({
    queryKey: employeeKeys.salaryStructures(filters),
    queryFn: () => employeesService.getSalaryStructures(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useSalaryStructure = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: employeeKeys.salaryStructure(id),
    queryFn: () => employeesService.getSalaryStructure(id),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEmployeePayload) =>
      employeesService.createEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      toast.success("Employee created successfully");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEmployeePayload }) =>
      employeesService.updateEmployee(id, data),
    onSuccess: (_: any, variables: any) => {
      queryClient.invalidateQueries({
        queryKey: employeeKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: employeeKeys.list() });
      toast.success("Employee updated successfully");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => employeesService.deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      toast.success("Employee deleted successfully");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

// ============ DEPARTMENTS MANAGEMENT ============

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDepartmentPayload) =>
      employeesService.createDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.departments() });
      toast.success("Department created successfully");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDepartmentPayload }) =>
      employeesService.updateDepartment(id, data),
    onSuccess: (_: DepartmentRecord, variables) => {
      queryClient.invalidateQueries({
        queryKey: employeeKeys.department(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: employeeKeys.departments(),
      });
      toast.success("Department updated successfully");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => employeesService.deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.departments() });
      toast.success("Department deleted successfully");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

// ============ LEAVE TYPES MANAGEMENT ============

export const useCreateLeaveType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLeaveTypePayload) =>
      employeesService.createLeaveType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.leaveTypes() });
      toast.success("Leave type created successfully");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useUpdateLeaveType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateLeaveTypePayload }) =>
      employeesService.updateLeaveType(id, data),
    onSuccess: (_: LeaveTypeRecord, variables) => {
      queryClient.invalidateQueries({
        queryKey: employeeKeys.leaveType(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: employeeKeys.leaveTypes() });
      toast.success("Leave type updated successfully");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useDeleteLeaveType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => employeesService.deleteLeaveType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.leaveTypes() });
      toast.success("Leave type deleted successfully");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

// ============ SALARY STRUCTURES MANAGEMENT ============

export const useCreateSalaryStructure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSalaryStructurePayload) =>
      employeesService.createSalaryStructure(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: employeeKeys.salaryStructures(),
      });
      toast.success("Salary structure created successfully");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useUpdateSalaryStructure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateSalaryStructurePayload;
    }) => employeesService.updateSalaryStructure(id, data),
    onSuccess: (_: SalaryStructureRecord, variables) => {
      queryClient.invalidateQueries({
        queryKey: employeeKeys.salaryStructure(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: employeeKeys.salaryStructures(),
      });
      toast.success("Salary structure updated successfully");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useDeleteSalaryStructure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => employeesService.deleteSalaryStructure(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: employeeKeys.salaryStructures(),
      });
      toast.success("Salary structure deleted successfully");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useMarkAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: MarkAttendancePayload }) =>
      employeesService.markAttendance(id, data),
    onSuccess: (_: any, variables: any) => {
      queryClient.invalidateQueries({
        queryKey: employeeKeys.attendance(variables.id),
      });
      toast.success("Attendance marked successfully");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useProcessSalary = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProcessSalaryPayload }) =>
      employeesService.processSalary(id, data),
    onSuccess: (_: any, variables: any) => {
      queryClient.invalidateQueries({
        queryKey: employeeKeys.salaries(variables.id),
      });
      toast.success("Salary processed successfully");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useUpdateSalary = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      salaryId,
      data,
    }: {
      id: number;
      salaryId: number;
      data: UpdateSalaryPayload;
    }) => employeesService.updateSalary(id, salaryId, data),
    onSuccess: (_: any, variables: any) => {
      queryClient.invalidateQueries({
        queryKey: employeeKeys.salaries(variables.id),
      });
      toast.success("Salary updated successfully");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};
