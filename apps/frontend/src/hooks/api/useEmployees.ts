/**
 * Employees Module Hooks
 * React Query hooks for all employee-related operations
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  departmentsService,
  employeesService,
  attendanceService,
  leaveTypesService,
  leaveBalancesService,
  leaveRequestsService,
  performanceReviewsService,
  salaryStructuresService,
  payrollRecordsService,
} from "@/services/api";
import type {
  Department,
  DepartmentFilters,
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
  Employee,
  EmployeeFilters,
  CreateEmployeePayload,
  UpdateEmployeePayload,
  Attendance,
  AttendanceFilters,
  CreateAttendancePayload,
  UpdateAttendancePayload,
  BulkAttendancePayload,
  AttendanceSummary,
  LeaveTypeRecord,
  LeaveTypeFilters,
  CreateLeaveTypePayload,
  UpdateLeaveTypePayload,
  LeaveBalance,
  LeaveBalanceFilters,
  CreateLeaveBalancePayload,
  UpdateLeaveBalancePayload,
  LeaveRequest,
  LeaveRequestFilters,
  CreateLeaveRequestPayload,
  UpdateLeaveRequestPayload,
  RejectLeaveRequestPayload,
  PerformanceReview,
  PerformanceReviewFilters,
  CreatePerformanceReviewPayload,
  UpdatePerformanceReviewPayload,
  SalaryStructure,
  SalaryStructureFilters,
  CreateSalaryStructurePayload,
  UpdateSalaryStructurePayload,
  PayrollRecord,
  PayrollRecordFilters,
  CreatePayrollRecordPayload,
  UpdatePayrollRecordPayload,
  ApprovePayrollPayload,
  PaginatedResponse,
  SalaryDetails,
} from "@/types/api";

// ============ DEPARTMENTS ============

export const useDepartments = (filters?: DepartmentFilters) => {
  return useQuery<PaginatedResponse<Department>>({
    queryKey: ["departments", filters],
    queryFn: () => departmentsService.getDepartments(filters),
  });
};

export const useDepartment = (id: number, enabled = true) => {
  return useQuery<Department>({
    queryKey: ["departments", id],
    queryFn: () => departmentsService.getDepartment(id),
    enabled: enabled && !!id,
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDepartmentPayload) =>
      departmentsService.createDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDepartmentPayload }) =>
      departmentsService.updateDepartment(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["departments", id] });
    },
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => departmentsService.deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
};

// ============ EMPLOYEES ============

export const useEmployees = (filters?: EmployeeFilters) => {
  return useQuery<PaginatedResponse<Employee>>({
    queryKey: ["employees", filters],
    queryFn: () => employeesService.getEmployees(filters),
  });
};

export const useEmployee = (id: number, enabled = true) => {
  return useQuery<Employee>({
    queryKey: ["employees", id],
    queryFn: () => employeesService.getEmployee(id),
    enabled: enabled && !!id,
  });
};

export const useEmployeeAttendanceSummary = (
  id: number,
  month?: number,
  year?: number,
  enabled = true
) => {
  return useQuery<AttendanceSummary>({
    queryKey: ["employees", id, "attendance-summary", month, year],
    queryFn: () => employeesService.getAttendanceSummary(id, month, year),
    enabled: enabled && !!id,
  });
};

export const useEmployeePerformanceHistory = (id: number, enabled = true) => {
  return useQuery<{
    reviews: PerformanceReview[];
    average_ratings: {
      avg_quality: number;
      avg_productivity: number;
      avg_communication: number;
      avg_teamwork: number;
      avg_initiative: number;
      avg_overall: number;
    };
  }>({
    queryKey: ["employees", id, "performance-history"],
    queryFn: () => employeesService.getPerformanceHistory(id),
    enabled: enabled && !!id,
  });
};

export const useEmployeeSalaryDetails = (id: number, enabled = true) => {
  return useQuery<SalaryDetails>({
    queryKey: ["employees", id, "salary-details"],
    queryFn: () => employeesService.getSalaryDetails(id),
    enabled: enabled && !!id,
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEmployeePayload) =>
      employeesService.createEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEmployeePayload }) =>
      employeesService.updateEmployee(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employees", id] });
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => employeesService.deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
};

// ============ ATTENDANCE ============

export const useAttendance = (filters?: AttendanceFilters) => {
  return useQuery<PaginatedResponse<Attendance>>({
    queryKey: ["attendance", filters],
    queryFn: () => attendanceService.getAttendance(filters),
  });
};

export const useAttendanceRecord = (id: number, enabled = true) => {
  return useQuery<Attendance>({
    queryKey: ["attendance", id],
    queryFn: () => attendanceService.getAttendanceRecord(id),
    enabled: enabled && !!id,
  });
};

export const useMarkAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAttendancePayload) =>
      attendanceService.createAttendance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
};

export const useUpdateAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAttendancePayload }) =>
      attendanceService.updateAttendance(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["attendance", id] });
    },
  });
};

export const useDeleteAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => attendanceService.deleteAttendance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
};

export const useMarkBulkAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkAttendancePayload) =>
      attendanceService.markBulkAttendance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
};

// ============ LEAVE TYPES ============

export const useLeaveTypes = (filters?: LeaveTypeFilters) => {
  return useQuery<PaginatedResponse<LeaveTypeRecord>>({
    queryKey: ["leave-types", filters],
    queryFn: () => leaveTypesService.getLeaveTypes(filters),
  });
};

export const useLeaveType = (id: number, enabled = true) => {
  return useQuery<LeaveTypeRecord>({
    queryKey: ["leave-types", id],
    queryFn: () => leaveTypesService.getLeaveType(id),
    enabled: enabled && !!id,
  });
};

export const useCreateLeaveType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLeaveTypePayload) =>
      leaveTypesService.createLeaveType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-types"] });
    },
  });
};

export const useUpdateLeaveType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateLeaveTypePayload }) =>
      leaveTypesService.updateLeaveType(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["leave-types"] });
      queryClient.invalidateQueries({ queryKey: ["leave-types", id] });
    },
  });
};

export const useDeleteLeaveType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => leaveTypesService.deleteLeaveType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-types"] });
    },
  });
};

// ============ LEAVE BALANCES ============

export const useLeaveBalances = (filters?: LeaveBalanceFilters) => {
  return useQuery<PaginatedResponse<LeaveBalance>>({
    queryKey: ["leave-balances", filters],
    queryFn: () => leaveBalancesService.getLeaveBalances(filters),
  });
};

export const useLeaveBalance = (id: number, enabled = true) => {
  return useQuery<LeaveBalance>({
    queryKey: ["leave-balances", id],
    queryFn: () => leaveBalancesService.getLeaveBalance(id),
    enabled: enabled && !!id,
  });
};

export const useCreateLeaveBalance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLeaveBalancePayload) =>
      leaveBalancesService.createLeaveBalance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-balances"] });
    },
  });
};

export const useUpdateLeaveBalance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateLeaveBalancePayload;
    }) => leaveBalancesService.updateLeaveBalance(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["leave-balances"] });
      queryClient.invalidateQueries({ queryKey: ["leave-balances", id] });
    },
  });
};

export const useDeleteLeaveBalance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => leaveBalancesService.deleteLeaveBalance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-balances"] });
    },
  });
};

// ============ LEAVE REQUESTS ============

export const useLeaveRequests = (filters?: LeaveRequestFilters) => {
  return useQuery<PaginatedResponse<LeaveRequest>>({
    queryKey: ["leave-requests", filters],
    queryFn: () => leaveRequestsService.getLeaveRequests(filters),
  });
};

export const useLeaveRequest = (id: number, enabled = true) => {
  return useQuery<LeaveRequest>({
    queryKey: ["leave-requests", id],
    queryFn: () => leaveRequestsService.getLeaveRequest(id),
    enabled: enabled && !!id,
  });
};

export const useCreateLeaveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLeaveRequestPayload) =>
      leaveRequestsService.createLeaveRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
      queryClient.invalidateQueries({ queryKey: ["leave-balances"] });
    },
  });
};

export const useUpdateLeaveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateLeaveRequestPayload;
    }) => leaveRequestsService.updateLeaveRequest(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
      queryClient.invalidateQueries({ queryKey: ["leave-requests", id] });
    },
  });
};

export const useDeleteLeaveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => leaveRequestsService.deleteLeaveRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
      queryClient.invalidateQueries({ queryKey: ["leave-balances"] });
    },
  });
};

export const useApproveLeaveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => leaveRequestsService.approveLeaveRequest(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
      queryClient.invalidateQueries({ queryKey: ["leave-requests", id] });
      queryClient.invalidateQueries({ queryKey: ["leave-balances"] });
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
};

export const useRejectLeaveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: RejectLeaveRequestPayload;
    }) => leaveRequestsService.rejectLeaveRequest(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
      queryClient.invalidateQueries({ queryKey: ["leave-requests", id] });
    },
  });
};

// ============ PERFORMANCE REVIEWS ============

export const usePerformanceReviews = (filters?: PerformanceReviewFilters) => {
  return useQuery<PaginatedResponse<PerformanceReview>>({
    queryKey: ["performance-reviews", filters],
    queryFn: () => performanceReviewsService.getPerformanceReviews(filters),
  });
};

export const usePerformanceReview = (id: number, enabled = true) => {
  return useQuery<PerformanceReview>({
    queryKey: ["performance-reviews", id],
    queryFn: () => performanceReviewsService.getPerformanceReview(id),
    enabled: enabled && !!id,
  });
};

export const useCreatePerformanceReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePerformanceReviewPayload) =>
      performanceReviewsService.createPerformanceReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performance-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
};

export const useUpdatePerformanceReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdatePerformanceReviewPayload;
    }) => performanceReviewsService.updatePerformanceReview(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["performance-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["performance-reviews", id] });
    },
  });
};

export const useDeletePerformanceReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      performanceReviewsService.deletePerformanceReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performance-reviews"] });
    },
  });
};

// ============ SALARY STRUCTURES ============

export const useSalaryStructures = (filters?: SalaryStructureFilters) => {
  return useQuery<PaginatedResponse<SalaryStructure>>({
    queryKey: ["salary-structures", filters],
    queryFn: () => salaryStructuresService.getSalaryStructures(filters),
  });
};

export const useSalaryStructure = (id: number, enabled = true) => {
  return useQuery<SalaryStructure>({
    queryKey: ["salary-structures", id],
    queryFn: () => salaryStructuresService.getSalaryStructure(id),
    enabled: enabled && !!id,
  });
};

export const useCreateSalaryStructure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSalaryStructurePayload) =>
      salaryStructuresService.createSalaryStructure(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salary-structures"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
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
    }) => salaryStructuresService.updateSalaryStructure(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["salary-structures"] });
      queryClient.invalidateQueries({ queryKey: ["salary-structures", id] });
    },
  });
};

export const useDeleteSalaryStructure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      salaryStructuresService.deleteSalaryStructure(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salary-structures"] });
    },
  });
};

// ============ PAYROLL RECORDS ============

export const usePayrollRecords = (filters?: PayrollRecordFilters) => {
  return useQuery<PaginatedResponse<PayrollRecord>>({
    queryKey: ["payroll-records", filters],
    queryFn: () => payrollRecordsService.getPayrollRecords(filters),
  });
};

export const usePayrollRecord = (id: number, enabled = true) => {
  return useQuery<PayrollRecord>({
    queryKey: ["payroll-records", id],
    queryFn: () => payrollRecordsService.getPayrollRecord(id),
    enabled: enabled && !!id,
  });
};

export const useCreatePayrollRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePayrollRecordPayload) =>
      payrollRecordsService.createPayrollRecord(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-records"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
};

export const useUpdatePayrollRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdatePayrollRecordPayload;
    }) => payrollRecordsService.updatePayrollRecord(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["payroll-records"] });
      queryClient.invalidateQueries({ queryKey: ["payroll-records", id] });
    },
  });
};

export const useDeletePayrollRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => payrollRecordsService.deletePayrollRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-records"] });
    },
  });
};

export const useApprovePayrollRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data?: ApprovePayrollPayload }) =>
      payrollRecordsService.approvePayrollRecord(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["payroll-records"] });
      queryClient.invalidateQueries({ queryKey: ["payroll-records", id] });
    },
  });
};
