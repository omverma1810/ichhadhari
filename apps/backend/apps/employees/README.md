# Employee Management & HR System

## Overview

Complete Employee Management and HR system with comprehensive features for managing employees, attendance, leave, performance reviews, and payroll.

## Features

### 1. **Department Management**

- Create and manage organizational departments
- Assign department heads
- Track active/inactive departments
- Employee count per department

### 2. **Employee Management**

- Complete employee profiles with personal and employment details
- Bank account information for payroll
- Government ID tracking (Aadhaar, PAN)
- Hierarchical reporting structure
- Employment type tracking (Full-time, Part-time, Contract, Intern)
- Probation period management
- Document storage (JSON field)

### 3. **Attendance Tracking**

- Daily attendance marking
- Multiple status types: Present, Absent, Half Day, On Leave, WFH, Holiday
- Check-in/Check-out time tracking
- Working hours and overtime calculation
- Bulk attendance marking feature
- Approval workflow
- Monthly attendance summary per employee

### 4. **Leave Management**

- Multiple leave types (Casual, Sick, Earned, etc.)
- Annual leave balance tracking
- Leave request workflow (Pending → Approved/Rejected)
- Automatic leave balance deduction
- Automatic attendance marking for approved leaves
- Leave history tracking

### 5. **Performance Reviews**

- Structured performance evaluation system
- 5 rating parameters (1-5 scale):
  - Quality of Work
  - Productivity
  - Communication
  - Teamwork
  - Initiative
- Overall rating calculation
- Strengths and areas for improvement
- Goal setting for next period
- Performance history with average ratings

### 6. **Salary Structure**

- Flexible salary components:
  - **Allowances**: Basic, HRA, DA, Transport, Medical, Special
  - **Deductions**: Provident Fund, Professional Tax, Income Tax
- Automatic calculation of:
  - Gross Salary (sum of all allowances)
  - Total Deductions
  - Net Salary (gross - deductions)
- Effective date range support
- Historical salary tracking

### 7. **Payroll Management**

- Monthly payroll generation
- Integration with salary structure and attendance
- Automatic calculation of days present/absent/on leave
- Bonus and incentive support
- Overtime payment calculation
- Payroll approval workflow (Draft → Pending → Approved → Paid)
- Payment tracking with transaction reference
- Unique constraint: One payroll per employee per month

## API Endpoints

All endpoints are prefixed with `/api/employees/`

### Departments

- `GET /departments/` - List all departments
- `POST /departments/` - Create department
- `GET /departments/{id}/` - Get department details
- `PUT /departments/{id}/` - Update department
- `DELETE /departments/{id}/` - Delete department

### Employees

- `GET /employees/` - List all employees
- `POST /employees/` - Create employee
- `GET /employees/{id}/` - Get employee details
- `PUT /employees/{id}/` - Update employee
- `DELETE /employees/{id}/` - Delete employee
- `GET /employees/{id}/attendance_summary/` - Get monthly attendance summary
- `GET /employees/{id}/performance_history/` - Get performance review history
- `GET /employees/{id}/salary_details/` - Get current and historical salary

### Attendance

- `GET /attendance/` - List attendance records
- `POST /attendance/` - Mark attendance
- `GET /attendance/{id}/` - Get attendance details
- `PUT /attendance/{id}/` - Update attendance
- `DELETE /attendance/{id}/` - Delete attendance
- `POST /attendance/mark_bulk/` - Mark attendance for multiple employees

### Leave Types

- `GET /leave-types/` - List leave types
- `POST /leave-types/` - Create leave type
- `GET /leave-types/{id}/` - Get leave type details
- `PUT /leave-types/{id}/` - Update leave type
- `DELETE /leave-types/{id}/` - Delete leave type

### Leave Balances

- `GET /leave-balances/` - List leave balances
- `POST /leave-balances/` - Create leave balance
- `GET /leave-balances/{id}/` - Get leave balance details
- `PUT /leave-balances/{id}/` - Update leave balance
- `DELETE /leave-balances/{id}/` - Delete leave balance

### Leave Requests

- `GET /leave-requests/` - List leave requests
- `POST /leave-requests/` - Create leave request
- `GET /leave-requests/{id}/` - Get leave request details
- `PUT /leave-requests/{id}/` - Update leave request
- `DELETE /leave-requests/{id}/` - Delete leave request
- `POST /leave-requests/{id}/approve/` - Approve leave request
- `POST /leave-requests/{id}/reject/` - Reject leave request

### Performance Reviews

- `GET /performance-reviews/` - List performance reviews
- `POST /performance-reviews/` - Create performance review
- `GET /performance-reviews/{id}/` - Get review details
- `PUT /performance-reviews/{id}/` - Update review
- `DELETE /performance-reviews/{id}/` - Delete review

### Salary Structures

- `GET /salary-structures/` - List salary structures
- `POST /salary-structures/` - Create salary structure
- `GET /salary-structures/{id}/` - Get salary structure details
- `PUT /salary-structures/{id}/` - Update salary structure
- `DELETE /salary-structures/{id}/` - Delete salary structure

### Payroll Records

- `GET /payroll-records/` - List payroll records
- `POST /payroll-records/` - Create payroll record
- `GET /payroll-records/{id}/` - Get payroll record details
- `PUT /payroll-records/{id}/` - Update payroll record
- `DELETE /payroll-records/{id}/` - Delete payroll record
- `POST /payroll-records/{id}/approve/` - Approve payroll record

## Filters & Search

### Department

- Filter: `is_active`
- Search: `name`, `department_id`

### Employee

- Filter: `department`, `is_active`, `employment_type`
- Search: `first_name`, `last_name`, `employee_id`, `personal_email`

### Attendance

- Filter: `employee`, `status`, `date`
- Search: `employee__first_name`, `employee__last_name`

### Leave Request

- Filter: `employee`, `leave_type`, `status`, `from_date`, `to_date`
- Search: `employee__first_name`, `employee__last_name`

### Payroll Record

- Filter: `employee`, `month`, `year`, `status`
- Search: `employee__first_name`, `employee__last_name`

## Models

### Department

- `department_id` - Unique department identifier
- `name` - Department name
- `description` - Department description
- `head` - Foreign key to Employee (department head)
- `is_active` - Active status

### Employee

- `employee_id` - Unique employee identifier
- `user` - OneToOne relationship with User model
- `department` - Foreign key to Department
- `reporting_manager` - Self-referencing foreign key
- Personal details (name, DOB, gender, marital status)
- Contact details (email, phone, address)
- Employment details (joining date, type, designation)
- Government IDs (Aadhaar, PAN)
- Bank details (bank name, account number, IFSC)

### Attendance

- `employee` - Foreign key to Employee
- `date` - Attendance date
- `status` - Attendance status (choices)
- `check_in_time`, `check_out_time` - Time tracking
- `working_hours`, `overtime_hours` - Hour calculations
- `marked_by`, `approved_by` - User tracking
- **Unique constraint**: (employee, date)

### LeaveType

- `name` - Leave type name
- `code` - Short code (e.g., CL, SL, EL)
- `days_per_year` - Annual allocation
- `is_paid` - Paid/unpaid status

### LeaveBalance

- `employee` - Foreign key to Employee
- `leave_type` - Foreign key to LeaveType
- `year` - Year
- `allocated`, `used`, `available` - Balance tracking
- **Unique constraint**: (employee, leave_type, year)
- **Auto-calculation**: `available = allocated - used`

### LeaveRequest

- `employee` - Foreign key to Employee
- `leave_type` - Foreign key to LeaveType
- `from_date`, `to_date` - Leave period
- `number_of_days` - Duration
- `reason` - Leave reason
- `status` - Workflow status (Pending, Approved, Rejected, Cancelled)
- `approved_by` - Approver

### PerformanceReview

- `employee` - Foreign key to Employee
- `reviewer` - Foreign key to User
- `review_period_start`, `review_period_end` - Review period
- `review_date` - Review date
- Rating parameters (1-5): `quality_of_work`, `productivity`, `communication`, `teamwork`, `initiative`
- `overall_rating` - Overall rating (calculated)
- `strengths`, `areas_of_improvement`, `goals_for_next_period` - Text fields

### SalaryStructure

- `employee` - Foreign key to Employee
- Allowances: `basic_salary`, `hra`, `da`, `transport_allowance`, `medical_allowance`, `special_allowance`
- Deductions: `provident_fund`, `professional_tax`, `income_tax`
- Calculated fields: `gross_salary`, `total_deductions`, `net_salary`
- `effective_from`, `effective_to` - Date range

### PayrollRecord

- `employee` - Foreign key to Employee
- `salary_structure` - Foreign key to SalaryStructure
- `month`, `year` - Payroll period
- `working_days`, `days_present`, `days_absent`, `days_on_leave` - Attendance summary
- `gross_salary`, `deductions`, `net_salary` - Salary components
- `bonus`, `incentive`, `overtime_payment` - Additional payments
- `total_payable` - Total amount
- `status` - Workflow status (Draft, Pending, Approved, Paid)
- `payment_date`, `payment_method`, `transaction_reference` - Payment tracking
- **Unique constraint**: (employee, month, year)

## Testing

All features are covered by comprehensive tests:

### Test Coverage

- **Total Tests**: 30 tests
- **Model Tests**: 14 tests (6 test classes)
- **API Tests**: 16 tests (5 test classes)
- **Status**: All tests passing ✅

### Test Suites

1. **Department Tests**: Create, list, retrieve, string representation
2. **Employee Tests**: Create, list, retrieve, full name property, attendance summary
3. **Attendance Tests**: Create, list, bulk marking, unique constraint
4. **Leave Request Tests**: Create, list, approve workflow, balance validation
5. **Leave Balance Tests**: Create, auto-calculation of available balance
6. **Performance Review Tests**: Create review
7. **Salary Structure Tests**: Create, salary calculations (gross, net, deductions)
8. **Payroll Record Tests**: Create, approve workflow, unique constraint

### Run Tests

```bash
# Run all employee tests
pytest apps/employees/ -v

# Run with coverage
pytest apps/employees/ -v --cov=apps/employees --cov-report=term-missing

# Run specific test file
pytest apps/employees/tests/test_api.py -v
pytest apps/employees/tests/test_models.py -v
```

## Database Migrations

Migration file: `apps/employees/migrations/0001_initial.py`

### To Apply Migrations

```bash
# Create migrations (if needed)
python manage.py makemigrations employees

# Apply migrations
python manage.py migrate employees
```

### Migration Contents

- 9 models created
- 3 indexes created:
  - Employee.employee_id
  - Employee.department
  - Attendance(employee, date)
- 2 unique constraints:
  - Attendance(employee, date)
  - PayrollRecord(employee, month, year)
  - LeaveBalance(employee, leave_type, year)

## Admin Interface

All models are registered in Django admin with:

- Organized fieldsets
- List displays with important fields
- Search functionality
- Filters for easy navigation
- Read-only fields for calculated values
- Date hierarchy on date fields

Access admin at: `/admin/employees/`

## Business Logic

### Leave Approval Workflow

1. Employee creates leave request
2. System validates leave balance availability
3. On approval:
   - Leave balance is updated (`used` field incremented)
   - Attendance records are automatically created for the leave period with status "on_leave"
4. On rejection: Leave balance remains unchanged

### Salary Calculation

Automatic calculation in `SalaryStructure.save()`:

```python
gross_salary = basic + hra + da + transport + medical + special
total_deductions = pf + professional_tax + income_tax
net_salary = gross_salary - total_deductions
```

### Leave Balance Calculation

Automatic calculation in `LeaveBalance.save()`:

```python
available = allocated - used
```

### Bulk Attendance Marking

`POST /attendance/mark_bulk/` accepts:

```json
{
  "attendance_records": [
    {
      "employee_id": 1,
      "date": "2024-01-15",
      "status": "present",
      "working_hours": "8.00"
    },
    ...
  ]
}
```

Returns:

```json
{
  "created": 5,
  "updated": 2,
  "errors": []
}
```

## Permissions

All viewsets use `IsAuthenticated` permission class. Users must be authenticated to access any endpoint.

## Usage Examples

### 1. Create Employee

```bash
POST /api/employees/employees/
{
  "user": 1,
  "employee_id": "EMP001",
  "first_name": "John",
  "last_name": "Doe",
  "date_of_birth": "1990-01-01",
  "gender": "male",
  "marital_status": "single",
  "personal_email": "john@example.com",
  "phone": "9876543210",
  "department": 1,
  "designation": "Software Engineer",
  "date_of_joining": "2024-01-01",
  "employment_type": "full_time"
}
```

### 2. Mark Attendance

```bash
POST /api/employees/attendance/
{
  "employee": 1,
  "date": "2024-01-15",
  "status": "present",
  "check_in_time": "09:00:00",
  "check_out_time": "18:00:00",
  "working_hours": "8.00"
}
```

### 3. Create Leave Request

```bash
POST /api/employees/leave-requests/
{
  "employee": 1,
  "leave_type": 1,
  "from_date": "2024-01-20",
  "to_date": "2024-01-22",
  "number_of_days": "3.00",
  "reason": "Family function"
}
```

### 4. Approve Leave

```bash
POST /api/employees/leave-requests/1/approve/
{
  "approved": true
}
```

### 5. Create Salary Structure

```bash
POST /api/employees/salary-structures/
{
  "employee": 1,
  "basic_salary": "30000.00",
  "hra": "12000.00",
  "da": "5000.00",
  "transport_allowance": "2000.00",
  "medical_allowance": "1500.00",
  "provident_fund": "3600.00",
  "professional_tax": "200.00",
  "effective_from": "2024-01-01"
}
```

### 6. Generate Payroll

```bash
POST /api/employees/payroll-records/
{
  "employee": 1,
  "salary_structure": 1,
  "month": 1,
  "year": 2024,
  "working_days": 26,
  "days_present": 24,
  "days_absent": 0,
  "days_on_leave": 2
}
```

### 7. Get Attendance Summary

```bash
GET /api/employees/employees/1/attendance_summary/?month=1&year=2024
```

Response:

```json
{
  "employee_id": "EMP001",
  "employee_name": "John Doe",
  "month": 1,
  "year": 2024,
  "total_days": 31,
  "present_days": 24,
  "absent_days": 0,
  "half_days": 0,
  "leave_days": 2,
  "wfh_days": 5,
  "total_working_hours": "192.00",
  "total_overtime_hours": "8.00"
}
```

## Next Steps

Consider implementing:

1. **Automated Payroll Generation**: Automatically generate payroll based on attendance
2. **Leave Carry Forward**: Logic for year-end leave balance carry forward
3. **Performance Dashboard**: Analytics for HR metrics
4. **Notification System**: Email/SMS notifications for leave approvals, payroll, etc.
5. **Shift Management**: Support for multiple shifts
6. **Overtime Rules**: Configurable overtime calculation rules
7. **Holiday Calendar**: Master holiday calendar for automatic attendance marking
8. **Document Management**: File upload for employee documents
9. **Exit Management**: Process for employee resignation/termination
10. **Reports**: Comprehensive HR reports (attendance, leave, payroll summaries)

## Dependencies

- Django 5.0+
- Django REST Framework
- pytest & pytest-django (for testing)
- django-filter (for API filtering)

## Notes

- All financial fields use `DecimalField` for precision
- Timestamps are automatically tracked via `TimeStampedModel`
- All models include proper string representations
- Unique constraints prevent duplicate data
- Foreign key relationships maintain data integrity
- Calculated fields are automatically updated on save

## Support

For issues or questions, please refer to the main project documentation or contact the development team.
