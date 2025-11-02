"""
Employee Management Model Tests

Tests for employee management models.
"""

import pytest
from decimal import Decimal
from datetime import date, timedelta
from django.utils import timezone
from django.core.exceptions import ValidationError

from apps.authentication.models import User
from apps.employees.models import (
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


@pytest.fixture
def user(db):
    """Create test user."""
    return User.objects.create_user(
        username='testuser',
        phone='1234567890',
        password='testpass123',
        first_name='Test',
        last_name='User'
    )


@pytest.fixture
def department(db):
    """Create test department."""
    return Department.objects.create(
        department_id='DEPT-001',
        name='IT Department',
        description='Information Technology',
        is_active=True
    )


@pytest.fixture
def employee_user(db):
    """Create user for employee."""
    return User.objects.create_user(
        username='employee1',
        phone='9876543210',
        password='testpass123',
        first_name='John',
        last_name='Doe'
    )


@pytest.fixture
def employee(db, department, employee_user):
    """Create test employee."""
    return Employee.objects.create(
        user=employee_user,
        employee_id='EMP-001',
        first_name='John',
        last_name='Doe',
        date_of_birth=date(1990, 1, 1),
        gender='male',
        marital_status='single',
        phone='9876543210',
        current_address='123 Main St',
        city='Mumbai',
        state='Maharashtra',
        pincode='400001',
        emergency_contact_name='Jane Doe',
        emergency_contact_phone='9876543211',
        emergency_contact_relation='Sister',
        date_of_joining=date(2020, 1, 1),
        employment_type='full_time',
        department=department,
        designation='Software Engineer',
        is_active=True
    )


@pytest.mark.django_db
class TestDepartment:
    """Tests for Department model."""
    
    def test_create_department(self, department):
        """Test creating a department."""
        assert department.department_id == 'DEPT-001'
        assert department.name == 'IT Department'
        assert department.is_active is True
    
    def test_department_string_representation(self, department):
        """Test department string representation."""
        assert str(department) == 'DEPT-001 - IT Department'


@pytest.mark.django_db
class TestEmployee:
    """Tests for Employee model."""
    
    def test_create_employee(self, employee):
        """Test creating an employee."""
        assert employee.employee_id == 'EMP-001'
        assert employee.first_name == 'John'
        assert employee.last_name == 'Doe'
        assert employee.is_active is True
    
    def test_employee_full_name(self, employee):
        """Test employee full name property."""
        assert employee.full_name == 'John Doe'
    
    def test_employee_string_representation(self, employee):
        """Test employee string representation."""
        assert str(employee) == 'EMP-001 - John Doe'


@pytest.mark.django_db
class TestAttendance:
    """Tests for Attendance model."""
    
    def test_create_attendance(self, employee):
        """Test creating attendance record."""
        attendance = Attendance.objects.create(
            employee=employee,
            date=timezone.now().date(),
            status='present',
            working_hours=Decimal('8.00')
        )
        
        assert attendance.employee == employee
        assert attendance.status == 'present'
        assert attendance.working_hours == Decimal('8.00')
    
    def test_attendance_unique_constraint(self, employee):
        """Test attendance unique constraint for employee and date."""
        today = timezone.now().date()
        
        Attendance.objects.create(
            employee=employee,
            date=today,
            status='present'
        )
        
        # Try to create duplicate
        with pytest.raises(Exception):  # Will raise IntegrityError
            Attendance.objects.create(
                employee=employee,
                date=today,
                status='absent'
            )


@pytest.mark.django_db
class TestLeaveBalance:
    """Tests for LeaveBalance model."""
    
    def test_create_leave_balance(self, employee):
        """Test creating leave balance."""
        leave_type = LeaveType.objects.create(
            name='Casual Leave',
            code='CL',
            days_per_year=12,
            is_paid=True
        )
        
        leave_balance = LeaveBalance.objects.create(
            employee=employee,
            leave_type=leave_type,
            year=2024,
            allocated=Decimal('12.00'),
            used=Decimal('3.00')
        )
        
        assert leave_balance.available == Decimal('9.00')
    
    def test_leave_balance_calculation(self, employee):
        """Test leave balance auto-calculation."""
        leave_type = LeaveType.objects.create(
            name='Sick Leave',
            code='SL',
            days_per_year=10,
            is_paid=True
        )
        
        leave_balance = LeaveBalance.objects.create(
            employee=employee,
            leave_type=leave_type,
            year=2024,
            allocated=Decimal('10.00'),
            used=Decimal('5.50')
        )
        
        # Check auto-calculated available
        assert leave_balance.available == Decimal('4.50')


@pytest.mark.django_db
class TestSalaryStructure:
    """Tests for SalaryStructure model."""
    
    def test_create_salary_structure(self, employee):
        """Test creating salary structure."""
        salary = SalaryStructure.objects.create(
            employee=employee,
            basic_salary=Decimal('50000.00'),
            hra=Decimal('10000.00'),
            da=Decimal('5000.00'),
            transport_allowance=Decimal('2000.00'),
            medical_allowance=Decimal('1000.00'),
            provident_fund=Decimal('6000.00'),
            professional_tax=Decimal('200.00'),
            income_tax=Decimal('5000.00'),
            effective_from=date(2024, 1, 1),
            is_active=True
        )
        
        # Check auto-calculated values
        assert salary.gross_salary == Decimal('68000.00')  # Sum of all allowances
        assert salary.total_deductions == Decimal('11200.00')  # Sum of all deductions
        assert salary.net_salary == Decimal('56800.00')  # Gross - Deductions
    
    def test_salary_calculation(self, employee):
        """Test salary calculation on save."""
        salary = SalaryStructure.objects.create(
            employee=employee,
            basic_salary=Decimal('100000.00'),
            hra=Decimal('20000.00'),
            da=Decimal('10000.00'),
            provident_fund=Decimal('12000.00'),
            income_tax=Decimal('10000.00'),
            effective_from=date(2024, 1, 1),
            is_active=True
        )
        
        # Verify calculations
        expected_gross = Decimal('100000.00') + Decimal('20000.00') + Decimal('10000.00')
        expected_deductions = Decimal('12000.00') + Decimal('10000.00')
        expected_net = expected_gross - expected_deductions
        
        assert salary.gross_salary == expected_gross
        assert salary.total_deductions == expected_deductions
        assert salary.net_salary == expected_net


@pytest.mark.django_db
class TestPayrollRecord:
    """Tests for PayrollRecord model."""
    
    def test_create_payroll_record(self, employee):
        """Test creating payroll record."""
        salary_structure = SalaryStructure.objects.create(
            employee=employee,
            basic_salary=Decimal('50000.00'),
            hra=Decimal('10000.00'),
            provident_fund=Decimal('6000.00'),
            effective_from=date(2024, 1, 1),
            is_active=True
        )
        
        payroll = PayrollRecord.objects.create(
            employee=employee,
            salary_structure=salary_structure,
            month=10,
            year=2024,
            working_days=26,
            days_present=24,
            days_absent=2,
            gross_salary=Decimal('60000.00'),
            deductions=Decimal('6000.00'),
            net_salary=Decimal('54000.00'),
            total_payable=Decimal('54000.00'),
            status='draft'
        )
        
        assert payroll.month == 10
        assert payroll.year == 2024
        assert payroll.status == 'draft'
    
    def test_payroll_unique_constraint(self, employee):
        """Test payroll unique constraint for employee, month, and year."""
        salary_structure = SalaryStructure.objects.create(
            employee=employee,
            basic_salary=Decimal('50000.00'),
            effective_from=date(2024, 1, 1),
            is_active=True
        )
        
        PayrollRecord.objects.create(
            employee=employee,
            salary_structure=salary_structure,
            month=10,
            year=2024,
            working_days=26,
            days_present=26,
            gross_salary=Decimal('50000.00'),
            deductions=Decimal('0.00'),
            net_salary=Decimal('50000.00'),
            total_payable=Decimal('50000.00')
        )
        
        # Try to create duplicate
        with pytest.raises(Exception):  # Will raise IntegrityError
            PayrollRecord.objects.create(
                employee=employee,
                salary_structure=salary_structure,
                month=10,
                year=2024,
                working_days=26,
                days_present=26,
                gross_salary=Decimal('50000.00'),
                deductions=Decimal('0.00'),
                net_salary=Decimal('50000.00'),
                total_payable=Decimal('50000.00')
            )


@pytest.mark.django_db
class TestPerformanceReview:
    """Tests for PerformanceReview model."""
    
    def test_create_performance_review(self, employee, user):
        """Test creating performance review."""
        review = PerformanceReview.objects.create(
            employee=employee,
            reviewer=user,
            review_period_start=date(2024, 1, 1),
            review_period_end=date(2024, 6, 30),
            review_date=date(2024, 7, 15),
            quality_of_work=4,
            productivity=5,
            communication=4,
            teamwork=4,
            initiative=5,
            overall_rating=Decimal('4.40'),
            strengths='Excellent technical skills',
            areas_of_improvement='Time management',
            goals_for_next_period='Learn new framework'
        )
        
        assert review.employee == employee
        assert review.overall_rating == Decimal('4.40')
