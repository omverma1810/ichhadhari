"""
Employee Management Serializers

Serializers for employee, attendance, leave, performance, and payroll data.
"""

from rest_framework import serializers
from decimal import Decimal
from django.utils import timezone

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
from apps.authentication.models import User


class DepartmentSerializer(serializers.ModelSerializer):
    """Serializer for Department model."""
    
    head_name = serializers.SerializerMethodField()
    employee_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Department
        fields = [
            'id',
            'department_id',
            'name',
            'description',
            'head',
            'head_name',
            'employee_count',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_head_name(self, obj):
        """Get department head name."""
        return obj.head.full_name if obj.head else None
    
    def get_employee_count(self, obj):
        """Get number of employees in department."""
        return obj.employees.filter(is_active=True).count()


class EmployeeListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for employee listing."""
    
    department_name = serializers.CharField(source='department.name', read_only=True)
    
    class Meta:
        model = Employee
        fields = [
            'id',
            'employee_id',
            'first_name',
            'last_name',
            'full_name',
            'department',
            'department_name',
            'designation',
            'employment_type',
            'is_active',
        ]


class EmployeeSerializer(serializers.ModelSerializer):
    """Full serializer for Employee model."""
    
    full_name = serializers.CharField(read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    reporting_manager_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Employee
        fields = [
            'id',
            'user',
            'employee_id',
            'first_name',
            'last_name',
            'full_name',
            'date_of_birth',
            'gender',
            'marital_status',
            'personal_email',
            'phone',
            'alternate_phone',
            'current_address',
            'permanent_address',
            'city',
            'state',
            'pincode',
            'emergency_contact_name',
            'emergency_contact_phone',
            'emergency_contact_relation',
            'date_of_joining',
            'date_of_leaving',
            'employment_type',
            'probation_period_months',
            'is_probation_completed',
            'department',
            'department_name',
            'designation',
            'reporting_manager',
            'reporting_manager_name',
            'aadhaar_number',
            'pan_number',
            'documents',
            'bank_name',
            'account_number',
            'ifsc_code',
            'is_active',
            'notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['full_name', 'created_at', 'updated_at']
    
    def get_reporting_manager_name(self, obj):
        """Get reporting manager name."""
        return obj.reporting_manager.full_name if obj.reporting_manager else None


class AttendanceSerializer(serializers.ModelSerializer):
    """Serializer for Attendance model."""
    
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_id = serializers.CharField(source='employee.employee_id', read_only=True)
    marked_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Attendance
        fields = [
            'id',
            'employee',
            'employee_id',
            'employee_name',
            'date',
            'status',
            'check_in_time',
            'check_out_time',
            'working_hours',
            'overtime_hours',
            'check_in_location',
            'check_out_location',
            'marked_by',
            'marked_by_name',
            'approved_by',
            'reason_for_absence',
            'notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_marked_by_name(self, obj):
        """Get marked by user name."""
        if obj.marked_by:
            return f"{obj.marked_by.first_name} {obj.marked_by.last_name}"
        return None


class BulkAttendanceSerializer(serializers.Serializer):
    """Serializer for bulk attendance marking."""
    
    employee_ids = serializers.ListField(
        child=serializers.IntegerField(),
        help_text="List of employee IDs"
    )
    date = serializers.DateField(help_text="Attendance date")
    status = serializers.ChoiceField(
        choices=Attendance.STATUS_CHOICES,
        help_text="Attendance status"
    )
    check_in_time = serializers.TimeField(required=False, allow_null=True)
    check_out_time = serializers.TimeField(required=False, allow_null=True)
    working_hours = serializers.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=Decimal('0.00'),
        required=False
    )
    notes = serializers.CharField(required=False, allow_blank=True)


class LeaveTypeSerializer(serializers.ModelSerializer):
    """Serializer for LeaveType model."""
    
    class Meta:
        model = LeaveType
        fields = [
            'id',
            'name',
            'code',
            'description',
            'days_per_year',
            'is_paid',
            'is_active',
        ]


class LeaveBalanceSerializer(serializers.ModelSerializer):
    """Serializer for LeaveBalance model."""
    
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_id = serializers.CharField(source='employee.employee_id', read_only=True)
    leave_type_name = serializers.CharField(source='leave_type.name', read_only=True)
    
    class Meta:
        model = LeaveBalance
        fields = [
            'id',
            'employee',
            'employee_id',
            'employee_name',
            'leave_type',
            'leave_type_name',
            'year',
            'allocated',
            'used',
            'available',
        ]
        read_only_fields = ['available']


class LeaveRequestSerializer(serializers.ModelSerializer):
    """Serializer for LeaveRequest model."""
    
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_id = serializers.CharField(source='employee.employee_id', read_only=True)
    leave_type_name = serializers.CharField(source='leave_type.name', read_only=True)
    approved_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = LeaveRequest
        fields = [
            'id',
            'employee',
            'employee_id',
            'employee_name',
            'leave_type',
            'leave_type_name',
            'from_date',
            'to_date',
            'number_of_days',
            'reason',
            'status',
            'approved_by',
            'approved_by_name',
            'approved_at',
            'rejection_reason',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['status', 'approved_by', 'approved_at', 'created_at', 'updated_at']
    
    def get_approved_by_name(self, obj):
        """Get approved by user name."""
        if obj.approved_by:
            return f"{obj.approved_by.first_name} {obj.approved_by.last_name}"
        return None
    
    def validate(self, data):
        """Validate leave request dates and balance."""
        if data['from_date'] > data['to_date']:
            raise serializers.ValidationError("From date cannot be after to date")
        
        # Check leave balance if updating
        employee = data.get('employee')
        leave_type = data.get('leave_type')
        number_of_days = data.get('number_of_days')
        
        if employee and leave_type and number_of_days:
            year = data['from_date'].year
            try:
                leave_balance = LeaveBalance.objects.get(
                    employee=employee,
                    leave_type=leave_type,
                    year=year
                )
                if leave_balance.available < number_of_days:
                    raise serializers.ValidationError(
                        f"Insufficient leave balance. Available: {leave_balance.available} days"
                    )
            except LeaveBalance.DoesNotExist:
                raise serializers.ValidationError(
                    f"Leave balance not found for {leave_type.name} in {year}"
                )
        
        return data


class LeaveApprovalSerializer(serializers.Serializer):
    """Serializer for leave approval/rejection."""
    
    action = serializers.ChoiceField(choices=['approve', 'reject'])
    rejection_reason = serializers.CharField(required=False, allow_blank=True)


class PerformanceReviewSerializer(serializers.ModelSerializer):
    """Serializer for PerformanceReview model."""
    
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_id = serializers.CharField(source='employee.employee_id', read_only=True)
    reviewer_name = serializers.SerializerMethodField()
    
    class Meta:
        model = PerformanceReview
        fields = [
            'id',
            'employee',
            'employee_id',
            'employee_name',
            'reviewer',
            'reviewer_name',
            'review_period_start',
            'review_period_end',
            'review_date',
            'quality_of_work',
            'productivity',
            'communication',
            'teamwork',
            'initiative',
            'overall_rating',
            'strengths',
            'areas_of_improvement',
            'goals_for_next_period',
            'reviewer_comments',
            'employee_comments',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_reviewer_name(self, obj):
        """Get reviewer user name."""
        if obj.reviewer:
            return f"{obj.reviewer.first_name} {obj.reviewer.last_name}"
        return None
    
    def validate(self, data):
        """Validate review period dates."""
        if data['review_period_start'] > data['review_period_end']:
            raise serializers.ValidationError(
                "Review period start date cannot be after end date"
            )
        return data


class SalaryStructureSerializer(serializers.ModelSerializer):
    """Serializer for SalaryStructure model."""
    
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_id = serializers.CharField(source='employee.employee_id', read_only=True)
    
    class Meta:
        model = SalaryStructure
        fields = [
            'id',
            'employee',
            'employee_id',
            'employee_name',
            'basic_salary',
            'hra',
            'da',
            'transport_allowance',
            'medical_allowance',
            'special_allowance',
            'provident_fund',
            'professional_tax',
            'income_tax',
            'gross_salary',
            'total_deductions',
            'net_salary',
            'effective_from',
            'effective_to',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['gross_salary', 'total_deductions', 'net_salary', 'created_at', 'updated_at']


class PayrollRecordSerializer(serializers.ModelSerializer):
    """Serializer for PayrollRecord model."""
    
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_id = serializers.CharField(source='employee.employee_id', read_only=True)
    approved_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = PayrollRecord
        fields = [
            'id',
            'employee',
            'employee_id',
            'employee_name',
            'salary_structure',
            'month',
            'year',
            'working_days',
            'days_present',
            'days_absent',
            'days_on_leave',
            'gross_salary',
            'deductions',
            'net_salary',
            'bonus',
            'incentive',
            'overtime_payment',
            'total_payable',
            'status',
            'payment_date',
            'payment_method',
            'transaction_reference',
            'approved_by',
            'approved_by_name',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_approved_by_name(self, obj):
        """Get approved by user name."""
        if obj.approved_by:
            return f"{obj.approved_by.first_name} {obj.approved_by.last_name}"
        return None


class PayrollApprovalSerializer(serializers.Serializer):
    """Serializer for payroll approval."""
    
    payment_date = serializers.DateField(required=False)
    payment_method = serializers.CharField(required=False, max_length=50)
    transaction_reference = serializers.CharField(required=False, max_length=100)
