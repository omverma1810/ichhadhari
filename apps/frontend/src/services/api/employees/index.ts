/**
 * Employees Module Services
 * Centralized export for all employees-related services
 */

import { departmentsService } from "./departments.service";
import { employeesService } from "./employees.service";
import { attendanceService } from "./attendance.service";
import { leaveTypesService } from "./leave-types.service";
import { leaveBalancesService } from "./leave-balances.service";
import { leaveRequestsService } from "./leave-requests.service";
import { performanceReviewsService } from "./performance-reviews.service";
import { salaryStructuresService } from "./salary-structures.service";
import { payrollRecordsService } from "./payroll-records.service";

export {
  departmentsService,
  employeesService,
  attendanceService,
  leaveTypesService,
  leaveBalancesService,
  leaveRequestsService,
  performanceReviewsService,
  salaryStructuresService,
  payrollRecordsService,
};

export default {
  departments: departmentsService,
  employees: employeesService,
  attendance: attendanceService,
  leaveTypes: leaveTypesService,
  leaveBalances: leaveBalancesService,
  leaveRequests: leaveRequestsService,
  performanceReviews: performanceReviewsService,
  salaryStructures: salaryStructuresService,
  payrollRecords: payrollRecordsService,
};
