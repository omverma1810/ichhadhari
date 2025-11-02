"""
Employee Management URLs

URL configuration for employee management endpoints.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    DepartmentViewSet,
    EmployeeViewSet,
    AttendanceViewSet,
    LeaveTypeViewSet,
    LeaveBalanceViewSet,
    LeaveRequestViewSet,
    PerformanceReviewViewSet,
    SalaryStructureViewSet,
    PayrollRecordViewSet,
)

app_name = 'employees'

router = DefaultRouter()
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'attendance', AttendanceViewSet, basename='attendance')
router.register(r'leave-types', LeaveTypeViewSet, basename='leave-type')
router.register(r'leave-balances', LeaveBalanceViewSet, basename='leave-balance')
router.register(r'leave-requests', LeaveRequestViewSet, basename='leave-request')
router.register(r'performance-reviews', PerformanceReviewViewSet, basename='performance-review')
router.register(r'salary-structures', SalaryStructureViewSet, basename='salary-structure')
router.register(r'payroll-records', PayrollRecordViewSet, basename='payroll-record')

urlpatterns = [
    path('', include(router.urls)),
]
