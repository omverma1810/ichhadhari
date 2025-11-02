"""
Factory classes for employee models.

Uses factory_boy to generate test data.
"""

import factory
from factory.django import DjangoModelFactory
from datetime import date, time, timedelta
from decimal import Decimal

from apps.employees.models import (
    Department, Employee, Attendance, LeaveType, LeaveRequest,
    PerformanceReview, SalaryStructure, Payroll
)
from apps.authentication.factories import UserFactory


class DepartmentFactory(DjangoModelFactory):
    """Factory for creating Department instances."""
    
    class Meta:
        model = Department
        django_get_or_create = ('code',)
    
    name = factory.Sequence(lambda n: f'Department {n}')
    code = factory.Sequence(lambda n: f'DEPT{n:02d}')
    description = factory.Faker('text', max_nb_chars=200)
    manager = factory.SubFactory(UserFactory)
    is_active = True


class EmployeeFactory(DjangoModelFactory):
    """Factory for creating Employee instances."""
    
    class Meta:
        model = Employee
        django_get_or_create = ('employee_code',)
    
    employee_code = factory.Sequence(lambda n: f'EMP{n:04d}')
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    email = factory.LazyAttribute(lambda obj: f'{obj.employee_code.lower()}@company.com')
    phone_number = factory.Faker('phone_number')
    date_of_birth = factory.Faker('date_of_birth', minimum_age=22, maximum_age=60)
    gender = factory.Iterator(['male', 'female', 'other'])
    address = factory.Faker('address')
    city = factory.Faker('city')
    state = factory.Faker('state')
    postal_code = factory.Faker('postcode')
    department = factory.SubFactory(DepartmentFactory)
    designation = factory.Iterator(['Manager', 'Supervisor', 'Worker', 'Technician', 'Accountant'])
    date_of_joining = factory.LazyFunction(lambda: date.today() - timedelta(days=365))
    employment_type = factory.Iterator(['full_time', 'part_time', 'contract', 'intern'])
    status = 'active'
    emergency_contact_name = factory.Faker('name')
    emergency_contact_phone = factory.Faker('phone_number')
    bank_account_number = factory.Sequence(lambda n: f'{n:016d}')
    bank_name = factory.Iterator(['State Bank', 'HDFC Bank', 'ICICI Bank', 'Axis Bank'])
    ifsc_code = factory.Sequence(lambda n: f'SBIN000{n:04d}')
    pan_number = factory.Sequence(lambda n: f'AAAAA{n:04d}A')
    aadhaar_number = factory.Sequence(lambda n: f'{n:012d}')


class AttendanceFactory(DjangoModelFactory):
    """Factory for creating Attendance instances."""
    
    class Meta:
        model = Attendance
    
    employee = factory.SubFactory(EmployeeFactory)
    date = factory.LazyFunction(date.today)
    check_in_time = time(9, 0)
    check_out_time = time(18, 0)
    status = factory.Iterator(['present', 'absent', 'half_day', 'on_leave', 'holiday'])
    work_hours = factory.LazyAttribute(lambda obj: Decimal('9.0') if obj.status == 'present' else Decimal('0.0'))
    overtime_hours = Decimal('0.0')
    notes = factory.Faker('sentence')
    marked_by = factory.SubFactory(UserFactory)


class LeaveTypeFactory(DjangoModelFactory):
    """Factory for creating LeaveType instances."""
    
    class Meta:
        model = LeaveType
        django_get_or_create = ('code',)
    
    name = factory.Sequence(lambda n: f'Leave Type {n}')
    code = factory.Sequence(lambda n: f'LT{n:02d}')
    max_days_per_year = factory.Faker('random_int', min=10, max=30)
    is_paid = True
    requires_approval = True
    is_active = True


class LeaveRequestFactory(DjangoModelFactory):
    """Factory for creating LeaveRequest instances."""
    
    class Meta:
        model = LeaveRequest
    
    employee = factory.SubFactory(EmployeeFactory)
    leave_type = factory.SubFactory(LeaveTypeFactory)
    start_date = factory.LazyFunction(lambda: date.today() + timedelta(days=1))
    end_date = factory.LazyAttribute(lambda obj: obj.start_date + timedelta(days=2))
    number_of_days = factory.LazyAttribute(lambda obj: (obj.end_date - obj.start_date).days + 1)
    reason = factory.Faker('sentence')
    status = factory.Iterator(['pending', 'approved', 'rejected', 'cancelled'])
    approved_by = None
    approved_at = None
    rejection_reason = None


class PerformanceReviewFactory(DjangoModelFactory):
    """Factory for creating PerformanceReview instances."""
    
    class Meta:
        model = PerformanceReview
    
    employee = factory.SubFactory(EmployeeFactory)
    reviewer = factory.SubFactory(UserFactory)
    review_period_start = factory.LazyFunction(lambda: date.today() - timedelta(days=90))
    review_period_end = factory.LazyFunction(date.today)
    rating = factory.Faker('random_int', min=1, max=5)
    strengths = factory.Faker('text', max_nb_chars=200)
    areas_for_improvement = factory.Faker('text', max_nb_chars=200)
    goals = factory.Faker('text', max_nb_chars=200)
    comments = factory.Faker('text', max_nb_chars=300)
    status = factory.Iterator(['draft', 'submitted', 'approved'])


class SalaryStructureFactory(DjangoModelFactory):
    """Factory for creating SalaryStructure instances."""
    
    class Meta:
        model = SalaryStructure
    
    employee = factory.SubFactory(EmployeeFactory)
    basic_salary = factory.Faker('pydecimal', left_digits=5, right_digits=2, positive=True, min_value=20000, max_value=100000)
    hra = factory.LazyAttribute(lambda obj: obj.basic_salary * Decimal('0.40'))
    transport_allowance = Decimal('2000.00')
    medical_allowance = Decimal('1500.00')
    other_allowances = Decimal('1000.00')
    pf_deduction = factory.LazyAttribute(lambda obj: obj.basic_salary * Decimal('0.12'))
    tax_deduction = factory.LazyAttribute(lambda obj: obj.basic_salary * Decimal('0.10'))
    other_deductions = Decimal('0.00')
    gross_salary = factory.LazyAttribute(lambda obj: (
        obj.basic_salary + obj.hra + obj.transport_allowance + 
        obj.medical_allowance + obj.other_allowances
    ))
    net_salary = factory.LazyAttribute(lambda obj: (
        obj.gross_salary - obj.pf_deduction - obj.tax_deduction - obj.other_deductions
    ))
    effective_from = factory.LazyFunction(lambda: date.today() - timedelta(days=30))
    effective_to = None
    is_active = True


class PayrollFactory(DjangoModelFactory):
    """Factory for creating Payroll instances."""
    
    class Meta:
        model = Payroll
    
    employee = factory.SubFactory(EmployeeFactory)
    salary_structure = factory.LazyAttribute(lambda obj: SalaryStructureFactory(employee=obj.employee))
    month = factory.LazyFunction(lambda: date.today().strftime('%B'))
    year = factory.LazyFunction(lambda: date.today().year)
    working_days = 26
    present_days = 24
    basic_salary = factory.LazyAttribute(lambda obj: obj.salary_structure.basic_salary)
    allowances = factory.LazyAttribute(lambda obj: (
        obj.salary_structure.hra + obj.salary_structure.transport_allowance + 
        obj.salary_structure.medical_allowance + obj.salary_structure.other_allowances
    ))
    deductions = factory.LazyAttribute(lambda obj: (
        obj.salary_structure.pf_deduction + obj.salary_structure.tax_deduction + 
        obj.salary_structure.other_deductions
    ))
    gross_salary = factory.LazyAttribute(lambda obj: obj.basic_salary + obj.allowances)
    net_salary = factory.LazyAttribute(lambda obj: obj.gross_salary - obj.deductions)
    status = factory.Iterator(['draft', 'approved', 'paid'])
    payment_date = None
    payment_method = None
    payment_reference = None
    approved_by = None
    approved_at = None
