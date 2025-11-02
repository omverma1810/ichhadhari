"""
Employee Management API Tests

Tests for employee, attendance, leave, and payroll APIs.
"""

import pytest
from decimal import Decimal
from datetime import date, time, timedelta
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status

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
def api_client():
    """Create API client."""
    return APIClient()


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
def authenticated_client(api_client, user):
    """Create authenticated API client."""
    api_client.force_authenticate(user=user)
    return api_client


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


@pytest.fixture
def leave_type(db):
    """Create test leave type."""
    return LeaveType.objects.create(
        name='Casual Leave',
        code='CL',
        days_per_year=12,
        is_paid=True,
        is_active=True
    )


@pytest.fixture
def leave_balance(db, employee, leave_type):
    """Create test leave balance."""
    return LeaveBalance.objects.create(
        employee=employee,
        leave_type=leave_type,
        year=timezone.now().year,
        allocated=Decimal('12.00'),
        used=Decimal('0.00')
    )


@pytest.fixture
def salary_structure(db, employee):
    """Create test salary structure."""
    return SalaryStructure.objects.create(
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


@pytest.mark.django_db
class TestDepartmentAPI:
    """Tests for Department API."""
    
    def test_list_departments(self, authenticated_client, department):
        """Test listing departments."""
        response = authenticated_client.get('/api/employees/departments/')
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
        assert response.data['results'][0]['department_id'] == 'DEPT-001'
    
    def test_create_department(self, authenticated_client):
        """Test creating a department."""
        data = {
            'department_id': 'DEPT-002',
            'name': 'HR Department',
            'description': 'Human Resources',
            'is_active': True
        }
        
        response = authenticated_client.post('/api/employees/departments/', data)
        
        assert response.status_code == status.HTTP_201_CREATED
        assert Department.objects.filter(department_id='DEPT-002').exists()
    
    def test_retrieve_department(self, authenticated_client, department):
        """Test retrieving a department."""
        response = authenticated_client.get(f'/api/employees/departments/{department.id}/')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['department_id'] == 'DEPT-001'


@pytest.mark.django_db
class TestEmployeeAPI:
    """Tests for Employee API."""
    
    def test_list_employees(self, authenticated_client, employee):
        """Test listing employees."""
        response = authenticated_client.get('/api/employees/employees/')
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
        assert response.data['results'][0]['employee_id'] == 'EMP-001'
    
    def test_create_employee(self, authenticated_client, department, user):
        """Test creating an employee."""
        new_user = User.objects.create_user(
            username='newemployee',
            phone='5555555555',
            password='testpass123',
            first_name='Jane',
            last_name='Smith'
        )
        
        data = {
            'user': new_user.id,
            'employee_id': 'EMP-002',
            'first_name': 'Jane',
            'last_name': 'Smith',
            'date_of_birth': '1992-05-15',
            'gender': 'female',
            'marital_status': 'single',
            'phone': '5555555555',
            'current_address': '456 Oak St',
            'city': 'Delhi',
            'state': 'Delhi',
            'pincode': '110001',
            'emergency_contact_name': 'John Smith',
            'emergency_contact_phone': '5555555556',
            'emergency_contact_relation': 'Brother',
            'date_of_joining': '2024-01-01',
            'employment_type': 'full_time',
            'department': department.id,
            'designation': 'Data Analyst',
            'is_active': True
        }
        
        response = authenticated_client.post('/api/employees/employees/', data)
        
        assert response.status_code == status.HTTP_201_CREATED
        assert Employee.objects.filter(employee_id='EMP-002').exists()
    
    def test_retrieve_employee(self, authenticated_client, employee):
        """Test retrieving an employee."""
        response = authenticated_client.get(f'/api/employees/employees/{employee.id}/')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['employee_id'] == 'EMP-001'
        assert response.data['full_name'] == 'John Doe'
    
    def test_attendance_summary(self, authenticated_client, employee):
        """Test employee attendance summary."""
        # Create some attendance records
        today = timezone.now().date()
        Attendance.objects.create(
            employee=employee,
            date=today,
            status='present',
            working_hours=Decimal('8.00')
        )
        
        response = authenticated_client.get(
            f'/api/employees/employees/{employee.id}/attendance_summary/',
            {'month': today.month, 'year': today.year}
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['present_days'] == 1
        assert float(response.data['total_working_hours']) == 8.00


@pytest.mark.django_db
class TestAttendanceAPI:
    """Tests for Attendance API."""
    
    def test_list_attendance(self, authenticated_client, employee):
        """Test listing attendance records."""
        Attendance.objects.create(
            employee=employee,
            date=timezone.now().date(),
            status='present',
            working_hours=Decimal('8.00')
        )
        
        response = authenticated_client.get('/api/employees/attendance/')
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
    
    def test_create_attendance(self, authenticated_client, employee, user):
        """Test creating attendance record."""
        data = {
            'employee': employee.id,
            'date': timezone.now().date().isoformat(),
            'status': 'present',
            'check_in_time': '09:00:00',
            'check_out_time': '17:00:00',
            'working_hours': '8.00'
        }
        
        response = authenticated_client.post('/api/employees/attendance/', data)
        
        assert response.status_code == status.HTTP_201_CREATED
        assert Attendance.objects.filter(employee=employee).exists()
    
    def test_bulk_attendance_marking(self, authenticated_client, employee):
        """Test bulk attendance marking."""
        data = {
            'employee_ids': [employee.id],
            'date': timezone.now().date().isoformat(),
            'status': 'present',
            'check_in_time': '09:00:00',
            'check_out_time': '17:00:00',
            'working_hours': '8.00',
            'notes': 'Bulk marked'
        }
        
        response = authenticated_client.post('/api/employees/attendance/mark_bulk/', data)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['created'] == 1
        assert Attendance.objects.filter(employee=employee).exists()


@pytest.mark.django_db
class TestLeaveRequestAPI:
    """Tests for Leave Request API."""
    
    def test_list_leave_requests(self, authenticated_client, employee, leave_type, leave_balance):
        """Test listing leave requests."""
        LeaveRequest.objects.create(
            employee=employee,
            leave_type=leave_type,
            from_date=timezone.now().date(),
            to_date=timezone.now().date() + timedelta(days=2),
            number_of_days=Decimal('3.00'),
            reason='Personal work',
            status='pending'
        )
        
        response = authenticated_client.get('/api/employees/leave-requests/')
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
    
    def test_create_leave_request(self, authenticated_client, employee, leave_type, leave_balance):
        """Test creating leave request."""
        data = {
            'employee': employee.id,
            'leave_type': leave_type.id,
            'from_date': (timezone.now().date() + timedelta(days=10)).isoformat(),
            'to_date': (timezone.now().date() + timedelta(days=12)).isoformat(),
            'number_of_days': '3.00',
            'reason': 'Family function'
        }
        
        response = authenticated_client.post('/api/employees/leave-requests/', data)
        
        assert response.status_code == status.HTTP_201_CREATED
        assert LeaveRequest.objects.filter(employee=employee).exists()
    
    def test_approve_leave_request(self, authenticated_client, employee, leave_type, leave_balance, user):
        """Test approving leave request."""
        leave_request = LeaveRequest.objects.create(
            employee=employee,
            leave_type=leave_type,
            from_date=timezone.now().date() + timedelta(days=5),
            to_date=timezone.now().date() + timedelta(days=7),
            number_of_days=Decimal('3.00'),
            reason='Personal work',
            status='pending'
        )
        
        response = authenticated_client.post(
            f'/api/employees/leave-requests/{leave_request.id}/approve/'
        )
        
        assert response.status_code == status.HTTP_200_OK
        
        leave_request.refresh_from_db()
        assert leave_request.status == 'approved'
        assert leave_request.approved_by == user


@pytest.mark.django_db
class TestPayrollAPI:
    """Tests for Payroll API."""
    
    def test_list_payroll_records(self, authenticated_client, employee, salary_structure):
        """Test listing payroll records."""
        PayrollRecord.objects.create(
            employee=employee,
            salary_structure=salary_structure,
            month=10,
            year=2024,
            working_days=26,
            days_present=24,
            days_absent=2,
            gross_salary=salary_structure.gross_salary,
            deductions=salary_structure.total_deductions,
            net_salary=salary_structure.net_salary,
            total_payable=salary_structure.net_salary,
            status='draft'
        )
        
        response = authenticated_client.get('/api/employees/payroll-records/')
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
    
    def test_create_payroll_record(self, authenticated_client, employee, salary_structure):
        """Test creating payroll record."""
        data = {
            'employee': employee.id,
            'salary_structure': salary_structure.id,
            'month': 11,
            'year': 2024,
            'working_days': 26,
            'days_present': 26,
            'days_absent': 0,
            'days_on_leave': 0,
            'gross_salary': str(salary_structure.gross_salary),
            'deductions': str(salary_structure.total_deductions),
            'net_salary': str(salary_structure.net_salary),
            'bonus': '0.00',
            'incentive': '0.00',
            'overtime_payment': '0.00',
            'total_payable': str(salary_structure.net_salary),
            'status': 'draft'
        }
        
        response = authenticated_client.post('/api/employees/payroll-records/', data)
        
        assert response.status_code == status.HTTP_201_CREATED
        assert PayrollRecord.objects.filter(employee=employee, month=11).exists()
    
    def test_approve_payroll(self, authenticated_client, employee, salary_structure, user):
        """Test approving payroll record."""
        payroll = PayrollRecord.objects.create(
            employee=employee,
            salary_structure=salary_structure,
            month=10,
            year=2024,
            working_days=26,
            days_present=26,
            gross_salary=salary_structure.gross_salary,
            deductions=salary_structure.total_deductions,
            net_salary=salary_structure.net_salary,
            total_payable=salary_structure.net_salary,
            status='draft'
        )
        
        response = authenticated_client.post(
            f'/api/employees/payroll-records/{payroll.id}/approve/',
            {'payment_date': timezone.now().date().isoformat()}
        )
        
        assert response.status_code == status.HTTP_200_OK
        
        payroll.refresh_from_db()
        assert payroll.status == 'paid'
        assert payroll.approved_by == user
