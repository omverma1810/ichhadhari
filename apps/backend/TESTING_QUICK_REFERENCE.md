# Quick Testing Commands

## 🚀 Quick Start

### Activate Virtual Environment

```bash
source /Users/apple/Desktop/ichhadhari/.venv/bin/activate
cd apps/backend
```

### Run All Tests

```bash
pytest
```

### Run Tests with Coverage

```bash
pytest --cov=apps --cov-report=html --cov-report=term-missing
```

### View Coverage Report

```bash
open htmlcov/index.html  # macOS
```

## 📦 Test by App

```bash
pytest apps/authentication/tests/     # Authentication tests
pytest apps/milk_management/tests/    # Milk management tests
pytest apps/production/tests/         # Production tests
pytest apps/inventory/tests/          # Inventory tests
pytest apps/vendors/tests/            # Vendor tests
pytest apps/employees/tests/          # Employee tests
```

## 🎯 Test by Type

```bash
pytest -m unit          # Unit tests only
pytest -m integration   # Integration tests only
pytest -m api          # API tests only
pytest -m model        # Model tests only
```

## 🔍 Debugging

```bash
pytest -v               # Verbose output
pytest -s               # Show print statements
pytest --pdb            # Drop into debugger on failure
pytest --lf             # Run last failed tests
pytest -x               # Stop on first failure
```

## ⚡ Fast Testing

```bash
# Install parallel execution
pip install pytest-xdist

# Run tests in parallel
pytest -n auto
```

## 📊 Coverage Reports

```bash
# HTML report (best for browsing)
pytest --cov=apps --cov-report=html

# Terminal report with missing lines
pytest --cov=apps --cov-report=term-missing

# XML report (for CI/CD)
pytest --cov=apps --cov-report=xml
```

## 🧪 Using Factories in Tests

```python
from apps.employees.factories import EmployeeFactory, DepartmentFactory

# Create single object
employee = EmployeeFactory()

# Create with overrides
employee = EmployeeFactory(first_name="John", last_name="Doe")

# Create multiple objects
employees = EmployeeFactory.create_batch(10)

# Build without saving to DB
employee = EmployeeFactory.build()

# Create with related objects
employee = EmployeeFactory(department=DepartmentFactory())
```

## 🔑 Using Fixtures

```python
def test_something(authenticated_api_client, test_user):
    # authenticated_api_client is ready to use
    # test_user is created and ready
    response = authenticated_api_client.get('/api/employees/')
    assert response.status_code == 200
```

## 📝 Writing New Tests

### Model Test Template

```python
import pytest
from apps.employees.factories import EmployeeFactory

@pytest.mark.django_db
class TestEmployeeModel:
    def test_create_employee(self):
        employee = EmployeeFactory()
        assert employee.pk is not None
        assert str(employee) == f"{employee.first_name} {employee.last_name}"
```

### API Test Template

```python
import pytest
from apps.employees.factories import EmployeeFactory

@pytest.mark.django_db
class TestEmployeeAPI:
    def test_list_employees(self, authenticated_api_client):
        EmployeeFactory.create_batch(3)
        response = authenticated_api_client.get('/api/employees/')
        assert response.status_code == 200
        assert len(response.data['results']) == 3
```

## 📈 Coverage Targets

| App             | Target | Status |
| --------------- | ------ | ------ |
| authentication  | 80%    | ✅     |
| milk_management | 80%    | ✅     |
| production      | 80%    | ✅     |
| inventory       | 80%    | ✅     |
| vendors         | 80%    | ✅     |
| employees       | 80%    | ✅     |

## 🐛 Common Issues

### Django Settings Error

```bash
# Make sure DJANGO_SETTINGS_MODULE is set
export DJANGO_SETTINGS_MODULE=dairy.settings.test
```

### Database Error

```bash
# Tests use in-memory SQLite, no setup needed
# If you see DB errors, check pytest.ini
```

### Import Errors

```bash
# Make sure you're in the backend directory
cd apps/backend
# Make sure virtual environment is activated
source ../../.venv/bin/activate
```

### Factory Import Errors

```bash
# Install factory-boy and faker
pip install factory-boy faker
```

## 🎨 Test Markers

```python
@pytest.mark.unit          # Unit test
@pytest.mark.integration   # Integration test
@pytest.mark.slow          # Slow running test
@pytest.mark.api           # API endpoint test
@pytest.mark.model         # Model test
@pytest.mark.view          # View test
@pytest.mark.serializer    # Serializer test
@pytest.mark.permission    # Permission test
```

## 📦 Factory Reference

### Available Factories

```python
# Authentication
from apps.authentication.factories import UserFactory, AdminUserFactory, StaffUserFactory

# Milk Management
from apps.milk_management.factories import SupplierFactory, MilkCollectionFactory, PaymentFactory

# Production
from apps.production.factories import ProductFactory, ProductionBatchFactory, ProductionScheduleFactory

# Inventory
from apps.inventory.factories import InventoryItemFactory, InventoryTransactionFactory, InventoryAlertFactory

# Vendors
from apps.vendors.factories import VendorFactory, PurchaseOrderFactory, VendorPaymentFactory

# Employees
from apps.employees.factories import (
    DepartmentFactory,
    EmployeeFactory,
    AttendanceFactory,
    LeaveTypeFactory,
    LeaveRequestFactory,
    PerformanceReviewFactory,
    SalaryStructureFactory,
    PayrollFactory
)
```

## 🌐 API Testing

```python
def test_employee_crud(authenticated_api_client):
    # CREATE
    data = {'first_name': 'John', 'last_name': 'Doe', ...}
    response = authenticated_api_client.post('/api/employees/', data)
    assert response.status_code == 201

    # READ
    employee_id = response.data['id']
    response = authenticated_api_client.get(f'/api/employees/{employee_id}/')
    assert response.status_code == 200

    # UPDATE
    data = {'first_name': 'Jane'}
    response = authenticated_api_client.patch(f'/api/employees/{employee_id}/', data)
    assert response.status_code == 200

    # DELETE
    response = authenticated_api_client.delete(f'/api/employees/{employee_id}/')
    assert response.status_code == 204
```

## 🔐 Authentication Testing

```python
def test_requires_authentication(api_client):
    # Unauthenticated should fail
    response = api_client.get('/api/employees/')
    assert response.status_code == 401

def test_with_authentication(authenticated_api_client):
    # Authenticated should succeed
    response = authenticated_api_client.get('/api/employees/')
    assert response.status_code == 200
```

## ⏱️ Performance Testing

```bash
# Install pytest-benchmark
pip install pytest-benchmark

# Run with timing
pytest --durations=10  # Show 10 slowest tests

# Benchmark specific test
pytest --benchmark-only
```

## 📚 Additional Resources

- [pytest documentation](https://docs.pytest.org/)
- [pytest-django documentation](https://pytest-django.readthedocs.io/)
- [factory-boy documentation](https://factoryboy.readthedocs.io/)
- [Django testing documentation](https://docs.djangoproject.com/en/5.0/topics/testing/)
- [DRF testing documentation](https://www.django-rest-framework.org/api-guide/testing/)

---

**Created**: 2025
**Last Updated**: After complete testing infrastructure setup
**Status**: ✅ Ready for use
