"""
Employee Management Views

ViewSets for employee, attendance, leave, performance, and payroll management.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q, Count, Avg, Sum
from django.utils import timezone
from datetime import datetime, timedelta
from decimal import Decimal

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
from .serializers import (
    DepartmentSerializer,
    EmployeeSerializer,
    EmployeeListSerializer,
    AttendanceSerializer,
    BulkAttendanceSerializer,
    LeaveTypeSerializer,
    LeaveBalanceSerializer,
    LeaveRequestSerializer,
    LeaveApprovalSerializer,
    PerformanceReviewSerializer,
    SalaryStructureSerializer,
    PayrollRecordSerializer,
    PayrollApprovalSerializer,
)


class DepartmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Department management.
    
    Provides CRUD operations for departments.
    """
    
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['department_id', 'name']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class EmployeeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Employee management.
    
    Provides CRUD operations and custom actions for employees.
    """
    
    queryset = Employee.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['department', 'employment_type', 'is_active']
    search_fields = ['employee_id', 'first_name', 'last_name', 'designation']
    ordering_fields = ['employee_id', 'first_name', 'date_of_joining']
    ordering = ['employee_id']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'list':
            return EmployeeListSerializer
        return EmployeeSerializer
    
    @action(detail=True, methods=['get'])
    def attendance_summary(self, request, pk=None):
        """
        Get attendance summary for an employee.
        
        Query params:
        - month: Month (1-12)
        - year: Year (YYYY)
        """
        employee = self.get_object()
        month = request.query_params.get('month', timezone.now().month)
        year = request.query_params.get('year', timezone.now().year)
        
        # Get attendance records for the month
        attendance_records = Attendance.objects.filter(
            employee=employee,
            date__month=month,
            date__year=year
        )
        
        # Calculate summary
        total_days = attendance_records.count()
        present_days = attendance_records.filter(status='present').count()
        absent_days = attendance_records.filter(status='absent').count()
        half_days = attendance_records.filter(status='half_day').count()
        leave_days = attendance_records.filter(status='on_leave').count()
        wfh_days = attendance_records.filter(status='wfh').count()
        
        total_working_hours = attendance_records.aggregate(
            total=Sum('working_hours')
        )['total'] or Decimal('0.00')
        
        total_overtime = attendance_records.aggregate(
            total=Sum('overtime_hours')
        )['total'] or Decimal('0.00')
        
        summary = {
            'employee_id': employee.employee_id,
            'employee_name': employee.full_name,
            'month': month,
            'year': year,
            'total_days': total_days,
            'present_days': present_days,
            'absent_days': absent_days,
            'half_days': half_days,
            'leave_days': leave_days,
            'wfh_days': wfh_days,
            'total_working_hours': str(total_working_hours),
            'total_overtime_hours': str(total_overtime),
        }
        
        return Response(summary)
    
    @action(detail=True, methods=['get'])
    def performance_history(self, request, pk=None):
        """Get performance review history for an employee."""
        employee = self.get_object()
        reviews = PerformanceReview.objects.filter(employee=employee)
        serializer = PerformanceReviewSerializer(reviews, many=True)
        
        # Calculate average ratings
        avg_ratings = reviews.aggregate(
            avg_quality=Avg('quality_of_work'),
            avg_productivity=Avg('productivity'),
            avg_communication=Avg('communication'),
            avg_teamwork=Avg('teamwork'),
            avg_initiative=Avg('initiative'),
            avg_overall=Avg('overall_rating'),
        )
        
        return Response({
            'reviews': serializer.data,
            'average_ratings': avg_ratings,
        })
    
    @action(detail=True, methods=['get'])
    def salary_details(self, request, pk=None):
        """Get salary structure details for an employee."""
        employee = self.get_object()
        
        # Get active salary structure
        active_salary = SalaryStructure.objects.filter(
            employee=employee,
            is_active=True
        ).first()
        
        # Get all salary structures
        all_salaries = SalaryStructure.objects.filter(employee=employee)
        
        response_data = {
            'active_salary': SalaryStructureSerializer(active_salary).data if active_salary else None,
            'salary_history': SalaryStructureSerializer(all_salaries, many=True).data,
        }
        
        return Response(response_data)


class AttendanceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Attendance management.
    
    Provides CRUD operations and bulk attendance marking.
    """
    
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['employee', 'date', 'status']
    search_fields = ['employee__employee_id', 'employee__first_name', 'employee__last_name']
    ordering_fields = ['date', 'created_at']
    ordering = ['-date']
    
    def perform_create(self, serializer):
        """Set marked_by user when creating attendance."""
        serializer.save(marked_by=self.request.user)
    
    @action(detail=False, methods=['post'])
    def mark_bulk(self, request):
        """
        Mark attendance for multiple employees.
        
        Expected payload:
        {
            "employee_ids": [1, 2, 3],
            "date": "2025-10-22",
            "status": "present",
            "check_in_time": "09:00:00",
            "check_out_time": "17:00:00",
            "working_hours": "8.00",
            "notes": "Optional notes"
        }
        """
        serializer = BulkAttendanceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        employee_ids = serializer.validated_data['employee_ids']
        date = serializer.validated_data['date']
        status_value = serializer.validated_data['status']
        check_in_time = serializer.validated_data.get('check_in_time')
        check_out_time = serializer.validated_data.get('check_out_time')
        working_hours = serializer.validated_data.get('working_hours', Decimal('0.00'))
        notes = serializer.validated_data.get('notes', '')
        
        created_count = 0
        updated_count = 0
        errors = []
        
        for emp_id in employee_ids:
            try:
                employee = Employee.objects.get(id=emp_id)
                
                # Check if attendance already exists
                attendance, created = Attendance.objects.update_or_create(
                    employee=employee,
                    date=date,
                    defaults={
                        'status': status_value,
                        'check_in_time': check_in_time,
                        'check_out_time': check_out_time,
                        'working_hours': working_hours,
                        'marked_by': request.user,
                        'notes': notes,
                    }
                )
                
                if created:
                    created_count += 1
                else:
                    updated_count += 1
                    
            except Employee.DoesNotExist:
                errors.append(f"Employee with ID {emp_id} not found")
            except Exception as e:
                errors.append(f"Error for employee {emp_id}: {str(e)}")
        
        return Response({
            'message': 'Bulk attendance marking completed',
            'created': created_count,
            'updated': updated_count,
            'errors': errors,
        }, status=status.HTTP_200_OK)


class LeaveTypeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for LeaveType management.
    
    Provides CRUD operations for leave types.
    """
    
    queryset = LeaveType.objects.all()
    serializer_class = LeaveTypeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_active', 'is_paid']
    search_fields = ['name', 'code']
    ordering_fields = ['name', 'days_per_year']
    ordering = ['name']


class LeaveBalanceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for LeaveBalance management.
    
    Provides CRUD operations for leave balances.
    """
    
    queryset = LeaveBalance.objects.all()
    serializer_class = LeaveBalanceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['employee', 'leave_type', 'year']
    ordering_fields = ['year', 'available']
    ordering = ['-year']


class LeaveRequestViewSet(viewsets.ModelViewSet):
    """
    ViewSet for LeaveRequest management.
    
    Provides CRUD operations and approval workflow for leave requests.
    """
    
    queryset = LeaveRequest.objects.all()
    serializer_class = LeaveRequestSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['employee', 'status', 'leave_type']
    search_fields = ['employee__employee_id', 'employee__first_name', 'employee__last_name']
    ordering_fields = ['from_date', 'created_at']
    ordering = ['-created_at']
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a leave request."""
        leave_request = self.get_object()
        
        if leave_request.status != 'pending':
            return Response(
                {'error': 'Only pending leave requests can be approved'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update leave request
        leave_request.status = 'approved'
        leave_request.approved_by = request.user
        leave_request.approved_at = timezone.now()
        leave_request.save()
        
        # Update leave balance
        year = leave_request.from_date.year
        try:
            leave_balance = LeaveBalance.objects.get(
                employee=leave_request.employee,
                leave_type=leave_request.leave_type,
                year=year
            )
            leave_balance.used += leave_request.number_of_days
            leave_balance.save()
        except LeaveBalance.DoesNotExist:
            pass
        
        # Mark attendance as on_leave for the leave period
        current_date = leave_request.from_date
        while current_date <= leave_request.to_date:
            Attendance.objects.update_or_create(
                employee=leave_request.employee,
                date=current_date,
                defaults={
                    'status': 'on_leave',
                    'marked_by': request.user,
                    'notes': f'Leave approved: {leave_request.leave_type.name}',
                }
            )
            current_date += timedelta(days=1)
        
        serializer = self.get_serializer(leave_request)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a leave request."""
        leave_request = self.get_object()
        
        if leave_request.status != 'pending':
            return Response(
                {'error': 'Only pending leave requests can be rejected'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = LeaveApprovalSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        rejection_reason = serializer.validated_data.get('rejection_reason', '')
        
        # Update leave request
        leave_request.status = 'rejected'
        leave_request.approved_by = request.user
        leave_request.approved_at = timezone.now()
        leave_request.rejection_reason = rejection_reason
        leave_request.save()
        
        serializer = self.get_serializer(leave_request)
        return Response(serializer.data)


class PerformanceReviewViewSet(viewsets.ModelViewSet):
    """
    ViewSet for PerformanceReview management.
    
    Provides CRUD operations for performance reviews.
    """
    
    queryset = PerformanceReview.objects.all()
    serializer_class = PerformanceReviewSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['employee', 'reviewer', 'review_date']
    search_fields = ['employee__employee_id', 'employee__first_name', 'employee__last_name']
    ordering_fields = ['review_date', 'overall_rating']
    ordering = ['-review_date']
    
    def perform_create(self, serializer):
        """Set reviewer when creating review."""
        serializer.save(reviewer=self.request.user)


class SalaryStructureViewSet(viewsets.ModelViewSet):
    """
    ViewSet for SalaryStructure management.
    
    Provides CRUD operations for salary structures.
    """
    
    queryset = SalaryStructure.objects.all()
    serializer_class = SalaryStructureSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['employee', 'is_active']
    search_fields = ['employee__employee_id', 'employee__first_name', 'employee__last_name']
    ordering_fields = ['effective_from', 'net_salary']
    ordering = ['-effective_from']


class PayrollRecordViewSet(viewsets.ModelViewSet):
    """
    ViewSet for PayrollRecord management.
    
    Provides CRUD operations and approval workflow for payroll records.
    """
    
    queryset = PayrollRecord.objects.all()
    serializer_class = PayrollRecordSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['employee', 'month', 'year', 'status']
    search_fields = ['employee__employee_id', 'employee__first_name', 'employee__last_name']
    ordering_fields = ['year', 'month', 'created_at']
    ordering = ['-year', '-month']
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a payroll record and mark as paid."""
        payroll = self.get_object()
        
        if payroll.status not in ['draft', 'pending']:
            return Response(
                {'error': 'Only draft or pending payroll records can be approved'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = PayrollApprovalSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Update payroll
        payroll.status = 'approved'
        payroll.approved_by = request.user
        
        if serializer.validated_data.get('payment_date'):
            payroll.payment_date = serializer.validated_data['payment_date']
            payroll.status = 'paid'
        
        if serializer.validated_data.get('payment_method'):
            payroll.payment_method = serializer.validated_data['payment_method']
        
        if serializer.validated_data.get('transaction_reference'):
            payroll.transaction_reference = serializer.validated_data['transaction_reference']
        
        payroll.save()
        
        serializer = self.get_serializer(payroll)
        return Response(serializer.data)
