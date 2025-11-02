"""
Employee Management Models

Defines models for employees, departments, attendance, leave management,
performance reviews, salary structures, and payroll.
"""

from decimal import Decimal
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
from django.utils import timezone

from apps.core.models import TimeStampedModel
from apps.authentication.models import User


class Department(TimeStampedModel):
    """
    Department Master Data
    
    Stores information about organizational departments.
    """
    
    department_id = models.CharField(
        max_length=20,
        unique=True,
        db_index=True,
        help_text="Unique department identifier"
    )
    name = models.CharField(
        max_length=100,
        help_text="Department name"
    )
    description = models.TextField(
        blank=True,
        help_text="Department description"
    )
    head = models.ForeignKey(
        'Employee',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='department_head_of',
        help_text="Department head"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether department is active"
    )
    
    class Meta:
        db_table = 'departments'
        ordering = ['name']
        verbose_name = 'Department'
        verbose_name_plural = 'Departments'
    
    def __str__(self):
        return f"{self.department_id} - {self.name}"


class Employee(TimeStampedModel):
    """
    Employee Profile
    
    Stores comprehensive employee information including personal details,
    employment information, and documents.
    """
    
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    ]
    
    MARITAL_STATUS_CHOICES = [
        ('single', 'Single'),
        ('married', 'Married'),
        ('divorced', 'Divorced'),
        ('widowed', 'Widowed'),
    ]
    
    EMPLOYMENT_TYPE_CHOICES = [
        ('full_time', 'Full Time'),
        ('part_time', 'Part Time'),
        ('contract', 'Contract'),
        ('temporary', 'Temporary'),
    ]
    
    # Link to User
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='employee_profile',
        help_text="User account"
    )
    
    # Basic Information
    employee_id = models.CharField(
        max_length=20,
        unique=True,
        db_index=True,
        help_text="Unique employee identifier"
    )
    first_name = models.CharField(
        max_length=100,
        help_text="First name"
    )
    last_name = models.CharField(
        max_length=100,
        help_text="Last name"
    )
    date_of_birth = models.DateField(
        help_text="Date of birth"
    )
    gender = models.CharField(
        max_length=10,
        choices=GENDER_CHOICES,
        help_text="Gender"
    )
    marital_status = models.CharField(
        max_length=20,
        choices=MARITAL_STATUS_CHOICES,
        help_text="Marital status"
    )
    
    # Contact Information
    personal_email = models.EmailField(
        blank=True,
        help_text="Personal email address"
    )
    phone = models.CharField(
        max_length=15,
        help_text="Primary phone number"
    )
    alternate_phone = models.CharField(
        max_length=15,
        blank=True,
        help_text="Alternate phone number"
    )
    
    # Address Information
    current_address = models.TextField(
        help_text="Current address"
    )
    permanent_address = models.TextField(
        blank=True,
        help_text="Permanent address"
    )
    city = models.CharField(
        max_length=100,
        help_text="City"
    )
    state = models.CharField(
        max_length=100,
        help_text="State"
    )
    pincode = models.CharField(
        max_length=10,
        help_text="Pincode"
    )
    
    # Emergency Contact
    emergency_contact_name = models.CharField(
        max_length=200,
        help_text="Emergency contact name"
    )
    emergency_contact_phone = models.CharField(
        max_length=15,
        help_text="Emergency contact phone"
    )
    emergency_contact_relation = models.CharField(
        max_length=50,
        help_text="Emergency contact relation"
    )
    
    # Employment Details
    date_of_joining = models.DateField(
        help_text="Date of joining"
    )
    date_of_leaving = models.DateField(
        null=True,
        blank=True,
        help_text="Date of leaving"
    )
    employment_type = models.CharField(
        max_length=20,
        choices=EMPLOYMENT_TYPE_CHOICES,
        help_text="Employment type"
    )
    probation_period_months = models.IntegerField(
        default=6,
        help_text="Probation period in months"
    )
    is_probation_completed = models.BooleanField(
        default=False,
        help_text="Whether probation is completed"
    )
    
    # Department & Reporting
    department = models.ForeignKey(
        Department,
        on_delete=models.PROTECT,
        related_name='employees',
        help_text="Department"
    )
    designation = models.CharField(
        max_length=100,
        help_text="Designation"
    )
    reporting_manager = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='team_members',
        help_text="Reporting manager"
    )
    
    # Government IDs
    aadhaar_number = models.CharField(
        max_length=12,
        blank=True,
        help_text="Aadhaar number"
    )
    pan_number = models.CharField(
        max_length=10,
        blank=True,
        help_text="PAN number"
    )
    
    # Documents
    documents = models.JSONField(
        default=dict,
        blank=True,
        help_text="Employee documents metadata"
    )
    
    # Bank Details
    bank_name = models.CharField(
        max_length=100,
        blank=True,
        help_text="Bank name"
    )
    account_number = models.CharField(
        max_length=50,
        blank=True,
        help_text="Bank account number"
    )
    ifsc_code = models.CharField(
        max_length=20,
        blank=True,
        help_text="IFSC code"
    )
    
    # Status
    is_active = models.BooleanField(
        default=True,
        help_text="Whether employee is active"
    )
    notes = models.TextField(
        blank=True,
        help_text="Additional notes"
    )
    
    @property
    def full_name(self):
        """Return full name of employee."""
        return f"{self.first_name} {self.last_name}"
    
    class Meta:
        db_table = 'employees'
        ordering = ['employee_id']
        verbose_name = 'Employee'
        verbose_name_plural = 'Employees'
        indexes = [
            models.Index(fields=['employee_id']),
            models.Index(fields=['department']),
        ]
    
    def __str__(self):
        return f"{self.employee_id} - {self.full_name}"


class Attendance(TimeStampedModel):
    """
    Attendance Record
    
    Tracks daily attendance for employees.
    """
    
    STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('half_day', 'Half Day'),
        ('on_leave', 'On Leave'),
        ('wfh', 'Work From Home'),
        ('holiday', 'Holiday'),
    ]
    
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='attendance_records',
        help_text="Employee"
    )
    date = models.DateField(
        help_text="Attendance date"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        help_text="Attendance status"
    )
    check_in_time = models.TimeField(
        null=True,
        blank=True,
        help_text="Check-in time"
    )
    check_out_time = models.TimeField(
        null=True,
        blank=True,
        help_text="Check-out time"
    )
    working_hours = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Total working hours"
    )
    overtime_hours = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Overtime hours"
    )
    check_in_location = models.CharField(
        max_length=200,
        blank=True,
        help_text="Check-in location"
    )
    check_out_location = models.CharField(
        max_length=200,
        blank=True,
        help_text="Check-out location"
    )
    marked_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='marked_attendance',
        help_text="Marked by user"
    )
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_attendance',
        help_text="Approved by user"
    )
    reason_for_absence = models.TextField(
        blank=True,
        help_text="Reason for absence"
    )
    notes = models.TextField(
        blank=True,
        help_text="Additional notes"
    )
    
    class Meta:
        db_table = 'attendance'
        ordering = ['-date']
        verbose_name = 'Attendance'
        verbose_name_plural = 'Attendance Records'
        unique_together = ['employee', 'date']
        indexes = [
            models.Index(fields=['employee', 'date']),
        ]
    
    def __str__(self):
        return f"{self.employee.employee_id} - {self.date} - {self.status}"


class LeaveType(models.Model):
    """
    Leave Type Master
    
    Defines different types of leaves available.
    """
    
    name = models.CharField(
        max_length=100,
        unique=True,
        help_text="Leave type name"
    )
    code = models.CharField(
        max_length=20,
        unique=True,
        help_text="Leave type code"
    )
    description = models.TextField(
        blank=True,
        help_text="Leave type description"
    )
    days_per_year = models.IntegerField(
        help_text="Number of days allocated per year"
    )
    is_paid = models.BooleanField(
        default=True,
        help_text="Whether leave is paid"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether leave type is active"
    )
    
    class Meta:
        db_table = 'leave_types'
        verbose_name = 'Leave Type'
        verbose_name_plural = 'Leave Types'
    
    def __str__(self):
        return f"{self.code} - {self.name}"


class LeaveBalance(models.Model):
    """
    Leave Balance
    
    Tracks leave balance for each employee per leave type per year.
    """
    
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='leave_balances',
        help_text="Employee"
    )
    leave_type = models.ForeignKey(
        LeaveType,
        on_delete=models.CASCADE,
        help_text="Leave type"
    )
    year = models.IntegerField(
        help_text="Year"
    )
    allocated = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="Allocated leave days"
    )
    used = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Used leave days"
    )
    available = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="Available leave days"
    )
    
    def save(self, *args, **kwargs):
        """Calculate available balance."""
        self.available = self.allocated - self.used
        super().save(*args, **kwargs)
    
    class Meta:
        db_table = 'leave_balances'
        verbose_name = 'Leave Balance'
        verbose_name_plural = 'Leave Balances'
        unique_together = ['employee', 'leave_type', 'year']
    
    def __str__(self):
        return f"{self.employee.employee_id} - {self.leave_type.code} - {self.year}"


class LeaveRequest(TimeStampedModel):
    """
    Leave Request
    
    Tracks employee leave requests and approvals.
    """
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
    ]
    
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='leave_requests',
        help_text="Employee"
    )
    leave_type = models.ForeignKey(
        LeaveType,
        on_delete=models.PROTECT,
        help_text="Leave type"
    )
    from_date = models.DateField(
        help_text="Leave start date"
    )
    to_date = models.DateField(
        help_text="Leave end date"
    )
    number_of_days = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="Number of leave days"
    )
    reason = models.TextField(
        help_text="Reason for leave"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        help_text="Leave request status"
    )
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_leaves',
        help_text="Approved by user"
    )
    approved_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Approval timestamp"
    )
    rejection_reason = models.TextField(
        blank=True,
        help_text="Reason for rejection"
    )
    
    class Meta:
        db_table = 'leave_requests'
        ordering = ['-created_at']
        verbose_name = 'Leave Request'
        verbose_name_plural = 'Leave Requests'
        indexes = [
            models.Index(fields=['employee', 'from_date']),
        ]
    
    def __str__(self):
        return f"{self.employee.employee_id} - {self.leave_type.code} - {self.from_date}"


class PerformanceReview(TimeStampedModel):
    """
    Performance Review
    
    Tracks employee performance reviews and ratings.
    """
    
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='performance_reviews',
        help_text="Employee being reviewed"
    )
    reviewer = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='conducted_reviews',
        help_text="Reviewer"
    )
    review_period_start = models.DateField(
        help_text="Review period start date"
    )
    review_period_end = models.DateField(
        help_text="Review period end date"
    )
    review_date = models.DateField(
        help_text="Review conducted date"
    )
    
    # Rating Parameters (1-5 scale)
    quality_of_work = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Quality of work rating"
    )
    productivity = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Productivity rating"
    )
    communication = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Communication rating"
    )
    teamwork = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Teamwork rating"
    )
    initiative = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Initiative rating"
    )
    overall_rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        help_text="Overall rating"
    )
    
    # Review Details
    strengths = models.TextField(
        help_text="Employee strengths"
    )
    areas_of_improvement = models.TextField(
        help_text="Areas needing improvement"
    )
    goals_for_next_period = models.TextField(
        help_text="Goals for next review period"
    )
    reviewer_comments = models.TextField(
        blank=True,
        help_text="Reviewer comments"
    )
    employee_comments = models.TextField(
        blank=True,
        help_text="Employee comments"
    )
    
    class Meta:
        db_table = 'performance_reviews'
        ordering = ['-review_date']
        verbose_name = 'Performance Review'
        verbose_name_plural = 'Performance Reviews'
    
    def __str__(self):
        return f"{self.employee.employee_id} - {self.review_date}"


class SalaryStructure(TimeStampedModel):
    """
    Salary Structure
    
    Defines salary components and calculations for employees.
    """
    
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='salary_structures',
        help_text="Employee"
    )
    
    # Salary Components
    basic_salary = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Basic salary"
    )
    hra = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="House Rent Allowance"
    )
    da = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Dearness Allowance"
    )
    transport_allowance = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Transport allowance"
    )
    medical_allowance = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Medical allowance"
    )
    special_allowance = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Special allowance"
    )
    
    # Deductions
    provident_fund = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Provident fund deduction"
    )
    professional_tax = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Professional tax"
    )
    income_tax = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Income tax"
    )
    
    # Calculated Fields
    gross_salary = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Gross salary"
    )
    total_deductions = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Total deductions"
    )
    net_salary = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Net salary"
    )
    
    # Validity Period
    effective_from = models.DateField(
        help_text="Effective from date"
    )
    effective_to = models.DateField(
        null=True,
        blank=True,
        help_text="Effective to date"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether salary structure is active"
    )
    
    def save(self, *args, **kwargs):
        """Calculate gross salary, deductions, and net salary."""
        # Calculate gross salary
        self.gross_salary = (
            self.basic_salary +
            self.hra +
            self.da +
            self.transport_allowance +
            self.medical_allowance +
            self.special_allowance
        )
        
        # Calculate total deductions
        self.total_deductions = (
            self.provident_fund +
            self.professional_tax +
            self.income_tax
        )
        
        # Calculate net salary
        self.net_salary = self.gross_salary - self.total_deductions
        
        super().save(*args, **kwargs)
    
    class Meta:
        db_table = 'salary_structures'
        ordering = ['-effective_from']
        verbose_name = 'Salary Structure'
        verbose_name_plural = 'Salary Structures'
    
    def __str__(self):
        return f"{self.employee.employee_id} - {self.effective_from}"


class PayrollRecord(TimeStampedModel):
    """
    Payroll Record
    
    Tracks monthly payroll for employees.
    """
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('paid', 'Paid'),
    ]
    
    employee = models.ForeignKey(
        Employee,
        on_delete=models.PROTECT,
        related_name='payroll_records',
        help_text="Employee"
    )
    salary_structure = models.ForeignKey(
        SalaryStructure,
        on_delete=models.PROTECT,
        help_text="Salary structure"
    )
    
    # Period
    month = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(12)],
        help_text="Month"
    )
    year = models.IntegerField(
        help_text="Year"
    )
    
    # Attendance
    working_days = models.IntegerField(
        help_text="Total working days in month"
    )
    days_present = models.IntegerField(
        help_text="Days present"
    )
    days_absent = models.IntegerField(
        default=0,
        help_text="Days absent"
    )
    days_on_leave = models.IntegerField(
        default=0,
        help_text="Days on leave"
    )
    
    # Salary Calculation
    gross_salary = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Gross salary for the month"
    )
    deductions = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Total deductions"
    )
    net_salary = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Net salary"
    )
    
    # Additional Components
    bonus = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Bonus amount"
    )
    incentive = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Incentive amount"
    )
    overtime_payment = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Overtime payment"
    )
    total_payable = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Total payable amount"
    )
    
    # Status & Payment
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft',
        help_text="Payroll status"
    )
    payment_date = models.DateField(
        null=True,
        blank=True,
        help_text="Payment date"
    )
    payment_method = models.CharField(
        max_length=50,
        blank=True,
        help_text="Payment method"
    )
    transaction_reference = models.CharField(
        max_length=100,
        blank=True,
        help_text="Transaction reference"
    )
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_payrolls',
        help_text="Approved by user"
    )
    
    class Meta:
        db_table = 'payroll_records'
        ordering = ['-year', '-month']
        verbose_name = 'Payroll Record'
        verbose_name_plural = 'Payroll Records'
        unique_together = ['employee', 'month', 'year']
    
    def __str__(self):
        return f"{self.employee.employee_id} - {self.month}/{self.year}"
