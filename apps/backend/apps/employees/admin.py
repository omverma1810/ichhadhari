"""
Employee Management Admin

Admin configuration for employee management models.
"""

from django.contrib import admin
from .models import (
    Department,
    Employee,
    Attendance,
    LeaveType,
    LeaveBalance,
    LeaveRequest,
    PerformanceReview,
    SalaryStructure,
    PayrollRecord,
)


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    """Admin for Department model."""
    
    list_display = ['department_id', 'name', 'head', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['department_id', 'name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('department_id', 'name', 'description')
        }),
        ('Management', {
            'fields': ('head', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    """Admin for Employee model."""
    
    list_display = [
        'employee_id',
        'full_name',
        'department',
        'designation',
        'employment_type',
        'date_of_joining',
        'is_active',
    ]
    list_filter = [
        'department',
        'employment_type',
        'gender',
        'is_active',
        'is_probation_completed',
        'date_of_joining',
    ]
    search_fields = ['employee_id', 'first_name', 'last_name', 'designation', 'phone']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'user',
                'employee_id',
                'first_name',
                'last_name',
                'date_of_birth',
                'gender',
                'marital_status',
            )
        }),
        ('Contact Information', {
            'fields': (
                'personal_email',
                'phone',
                'alternate_phone',
            )
        }),
        ('Address', {
            'fields': (
                'current_address',
                'permanent_address',
                'city',
                'state',
                'pincode',
            )
        }),
        ('Emergency Contact', {
            'fields': (
                'emergency_contact_name',
                'emergency_contact_phone',
                'emergency_contact_relation',
            )
        }),
        ('Employment Details', {
            'fields': (
                'date_of_joining',
                'date_of_leaving',
                'employment_type',
                'probation_period_months',
                'is_probation_completed',
                'department',
                'designation',
                'reporting_manager',
            )
        }),
        ('Government IDs', {
            'fields': ('aadhaar_number', 'pan_number')
        }),
        ('Bank Details', {
            'fields': ('bank_name', 'account_number', 'ifsc_code')
        }),
        ('Documents & Notes', {
            'fields': ('documents', 'notes'),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    """Admin for Attendance model."""
    
    list_display = [
        'employee',
        'date',
        'status',
        'check_in_time',
        'check_out_time',
        'working_hours',
        'overtime_hours',
    ]
    list_filter = ['status', 'date']
    search_fields = ['employee__employee_id', 'employee__first_name', 'employee__last_name']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'date'
    
    fieldsets = (
        ('Employee & Date', {
            'fields': ('employee', 'date', 'status')
        }),
        ('Timing', {
            'fields': (
                'check_in_time',
                'check_out_time',
                'working_hours',
                'overtime_hours',
            )
        }),
        ('Location', {
            'fields': ('check_in_location', 'check_out_location')
        }),
        ('Approval', {
            'fields': ('marked_by', 'approved_by')
        }),
        ('Notes', {
            'fields': ('reason_for_absence', 'notes'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(LeaveType)
class LeaveTypeAdmin(admin.ModelAdmin):
    """Admin for LeaveType model."""
    
    list_display = ['code', 'name', 'days_per_year', 'is_paid', 'is_active']
    list_filter = ['is_paid', 'is_active']
    search_fields = ['name', 'code']


@admin.register(LeaveBalance)
class LeaveBalanceAdmin(admin.ModelAdmin):
    """Admin for LeaveBalance model."""
    
    list_display = ['employee', 'leave_type', 'year', 'allocated', 'used', 'available']
    list_filter = ['year', 'leave_type']
    search_fields = ['employee__employee_id', 'employee__first_name', 'employee__last_name']
    readonly_fields = ['available']


@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    """Admin for LeaveRequest model."""
    
    list_display = [
        'employee',
        'leave_type',
        'from_date',
        'to_date',
        'number_of_days',
        'status',
        'approved_by',
    ]
    list_filter = ['status', 'leave_type', 'from_date']
    search_fields = ['employee__employee_id', 'employee__first_name', 'employee__last_name']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'from_date'
    
    fieldsets = (
        ('Employee & Leave Type', {
            'fields': ('employee', 'leave_type')
        }),
        ('Leave Period', {
            'fields': ('from_date', 'to_date', 'number_of_days', 'reason')
        }),
        ('Approval', {
            'fields': (
                'status',
                'approved_by',
                'approved_at',
                'rejection_reason',
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(PerformanceReview)
class PerformanceReviewAdmin(admin.ModelAdmin):
    """Admin for PerformanceReview model."""
    
    list_display = [
        'employee',
        'review_date',
        'reviewer',
        'overall_rating',
        'review_period_start',
        'review_period_end',
    ]
    list_filter = ['review_date', 'reviewer']
    search_fields = ['employee__employee_id', 'employee__first_name', 'employee__last_name']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'review_date'
    
    fieldsets = (
        ('Employee & Reviewer', {
            'fields': ('employee', 'reviewer', 'review_date')
        }),
        ('Review Period', {
            'fields': ('review_period_start', 'review_period_end')
        }),
        ('Ratings', {
            'fields': (
                'quality_of_work',
                'productivity',
                'communication',
                'teamwork',
                'initiative',
                'overall_rating',
            )
        }),
        ('Review Details', {
            'fields': (
                'strengths',
                'areas_of_improvement',
                'goals_for_next_period',
            )
        }),
        ('Comments', {
            'fields': ('reviewer_comments', 'employee_comments'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(SalaryStructure)
class SalaryStructureAdmin(admin.ModelAdmin):
    """Admin for SalaryStructure model."""
    
    list_display = [
        'employee',
        'effective_from',
        'effective_to',
        'gross_salary',
        'net_salary',
        'is_active',
    ]
    list_filter = ['is_active', 'effective_from']
    search_fields = ['employee__employee_id', 'employee__first_name', 'employee__last_name']
    readonly_fields = ['gross_salary', 'total_deductions', 'net_salary', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Employee & Period', {
            'fields': ('employee', 'effective_from', 'effective_to', 'is_active')
        }),
        ('Salary Components', {
            'fields': (
                'basic_salary',
                'hra',
                'da',
                'transport_allowance',
                'medical_allowance',
                'special_allowance',
            )
        }),
        ('Deductions', {
            'fields': (
                'provident_fund',
                'professional_tax',
                'income_tax',
            )
        }),
        ('Calculated Values', {
            'fields': ('gross_salary', 'total_deductions', 'net_salary'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(PayrollRecord)
class PayrollRecordAdmin(admin.ModelAdmin):
    """Admin for PayrollRecord model."""
    
    list_display = [
        'employee',
        'month',
        'year',
        'status',
        'net_salary',
        'total_payable',
        'payment_date',
    ]
    list_filter = ['status', 'month', 'year', 'payment_date']
    search_fields = ['employee__employee_id', 'employee__first_name', 'employee__last_name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Employee & Period', {
            'fields': ('employee', 'salary_structure', 'month', 'year')
        }),
        ('Attendance', {
            'fields': (
                'working_days',
                'days_present',
                'days_absent',
                'days_on_leave',
            )
        }),
        ('Salary Calculation', {
            'fields': (
                'gross_salary',
                'deductions',
                'net_salary',
                'bonus',
                'incentive',
                'overtime_payment',
                'total_payable',
            )
        }),
        ('Payment', {
            'fields': (
                'status',
                'payment_date',
                'payment_method',
                'transaction_reference',
                'approved_by',
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
