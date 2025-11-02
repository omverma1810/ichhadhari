"""
Root conftest.py for pytest configuration and shared fixtures.

This file provides common fixtures that can be used across all test modules.
"""

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


# ==============================================================================
# API Client Fixtures
# ==============================================================================

@pytest.fixture
def api_client():
    """Returns an unauthenticated API client."""
    return APIClient()


@pytest.fixture
def authenticated_api_client(test_user):
    """Returns an authenticated API client with JWT token."""
    client = APIClient()
    refresh = RefreshToken.for_user(test_user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {str(refresh.access_token)}')
    return client


@pytest.fixture
def admin_api_client(admin_user):
    """Returns an authenticated API client for admin user."""
    client = APIClient()
    refresh = RefreshToken.for_user(admin_user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {str(refresh.access_token)}')
    return client


# ==============================================================================
# User Fixtures
# ==============================================================================

@pytest.fixture
def test_user(db):
    """Creates a regular test user."""
    return User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass123',
        first_name='Test',
        last_name='User'
    )


@pytest.fixture
def admin_user(db):
    """Creates an admin test user."""
    return User.objects.create_superuser(
        username='admin',
        email='admin@example.com',
        password='admin123',
        first_name='Admin',
        last_name='User'
    )


@pytest.fixture
def manager_user(db):
    """Creates a manager test user."""
    user = User.objects.create_user(
        username='manager',
        email='manager@example.com',
        password='manager123',
        first_name='Manager',
        last_name='User'
    )
    # Add manager permissions if you have groups/permissions setup
    return user


@pytest.fixture
def test_users(db):
    """Creates multiple test users."""
    users = []
    for i in range(3):
        user = User.objects.create_user(
            username=f'user{i}',
            email=f'user{i}@example.com',
            password='testpass123',
            first_name=f'User{i}',
            last_name='Test'
        )
        users.append(user)
    return users


# ==============================================================================
# Milk Management Fixtures
# ==============================================================================

@pytest.fixture
def test_supplier(db, test_user):
    """Creates a test supplier."""
    from apps.milk_management.models import Supplier
    return Supplier.objects.create(
        name='Test Dairy Farm',
        code='TDF001',
        contact_person='John Doe',
        phone_number='+1234567890',
        email='john@testfarm.com',
        status='active',
        created_by=test_user
    )


@pytest.fixture
def test_collection(db, test_supplier, test_user):
    """Creates a test milk collection."""
    from apps.milk_management.models import MilkCollection
    from datetime import date
    return MilkCollection.objects.create(
        supplier=test_supplier,
        collection_date=date.today(),
        shift='morning',
        quantity=100.0,
        fat_percentage=6.5,
        snf_percentage=8.5,
        temperature=4.0,
        rate_per_liter=45.0,
        quality_grade='A',
        recorded_by=test_user
    )


# ==============================================================================
# Production Fixtures
# ==============================================================================

@pytest.fixture
def test_product(db, test_user):
    """Creates a test product."""
    from apps.production.models import Product
    return Product.objects.create(
        name='Full Cream Milk',
        code='FCM001',
        category='Dairy',
        unit='Liters',
        shelf_life_days=7,
        storage_temperature=4,
        is_active=True,
        created_by=test_user
    )


@pytest.fixture
def test_batch(db, test_product, test_user):
    """Creates a test production batch."""
    from apps.production.models import ProductionBatch
    return ProductionBatch.objects.create(
        product=test_product,
        planned_quantity=1000,
        status='planned',
        supervisor=test_user
    )


# ==============================================================================
# Inventory Fixtures
# ==============================================================================

@pytest.fixture
def test_inventory_item(db, test_user):
    """Creates a test inventory item."""
    from apps.inventory.models import InventoryItem
    return InventoryItem.objects.create(
        name='Milk Powder',
        code='MP001',
        category='raw_material',
        unit='Kg',
        current_quantity=500,
        min_stock_level=100,
        max_stock_level=1000,
        reorder_point=200,
        is_active=True
    )


@pytest.fixture
def test_transaction(db, test_inventory_item, test_user):
    """Creates a test inventory transaction."""
    from apps.inventory.models import InventoryTransaction
    return InventoryTransaction.objects.create(
        item=test_inventory_item,
        transaction_type='in',
        quantity=100,
        unit_price=450.0,
        created_by=test_user
    )


# ==============================================================================
# Vendor Fixtures
# ==============================================================================

@pytest.fixture
def test_vendor(db, test_user):
    """Creates a test vendor."""
    from apps.vendors.models import Vendor
    return Vendor.objects.create(
        name='ABC Suppliers',
        code='ABC001',
        vendor_type='supplier',
        contact_person='Jane Smith',
        phone_number='+1234567890',
        email='jane@abc.com',
        status='active',
        created_by=test_user
    )


@pytest.fixture
def test_purchase_order(db, test_vendor, test_inventory_item, test_user):
    """Creates a test purchase order."""
    from apps.vendors.models import PurchaseOrder, POItem
    from datetime import date, timedelta
    
    po = PurchaseOrder.objects.create(
        vendor=test_vendor,
        order_date=date.today(),
        expected_delivery_date=date.today() + timedelta(days=7),
        status='draft',
        total_amount=45000.0,
        grand_total=45000.0,
        created_by=test_user
    )
    
    # Add an item to the PO
    POItem.objects.create(
        purchase_order=po,
        item=test_inventory_item,
        quantity=100,
        unit='Kg',
        unit_price=450.0,
        total_price=45000.0
    )
    
    return po


# ==============================================================================
# Employee Fixtures
# ==============================================================================

@pytest.fixture
def test_department(db):
    """Creates a test department."""
    from apps.employees.models import Department
    return Department.objects.create(
        name='Production',
        code='PROD',
        description='Production Department',
        is_active=True
    )


@pytest.fixture
def test_employee(db, test_department, test_user):
    """Creates a test employee."""
    from apps.employees.models import Employee
    from datetime import date
    return Employee.objects.create(
        employee_code='EMP001',
        first_name='John',
        last_name='Doe',
        email='john.doe@company.com',
        phone_number='+1234567890',
        department=test_department,
        designation='Manager',
        date_of_joining=date(2025, 1, 1),
        employment_type='full_time',
        status='active'
    )


@pytest.fixture
def test_attendance(db, test_employee, test_user):
    """Creates a test attendance record."""
    from apps.employees.models import Attendance
    from datetime import date, time
    return Attendance.objects.create(
        employee=test_employee,
        date=date.today(),
        check_in_time=time(9, 0),
        check_out_time=time(18, 0),
        status='present',
        work_hours=9.0,
        marked_by=test_user
    )


# ==============================================================================
# Database Fixtures
# ==============================================================================

@pytest.fixture
def clear_database(db):
    """Clears all data from database."""
    from django.apps import apps
    
    for model in apps.get_models():
        if model._meta.app_label not in ['contenttypes', 'auth', 'sessions', 'admin']:
            model.objects.all().delete()


# ==============================================================================
# Utility Fixtures
# ==============================================================================

@pytest.fixture
def create_test_image():
    """Creates a test image file."""
    from PIL import Image
    from io import BytesIO
    from django.core.files.uploadedfile import SimpleUploadedFile
    
    def _create_image(name='test.jpg', size=(100, 100), color='red'):
        file = BytesIO()
        image = Image.new('RGB', size, color)
        image.save(file, 'JPEG')
        file.seek(0)
        return SimpleUploadedFile(
            name=name,
            content=file.read(),
            content_type='image/jpeg'
        )
    
    return _create_image


@pytest.fixture
def mock_datetime(monkeypatch):
    """Mocks datetime.datetime.now()."""
    from datetime import datetime
    
    class MockDatetime:
        @classmethod
        def now(cls):
            return datetime(2025, 10, 22, 12, 0, 0)
    
    def _set_datetime(dt):
        monkeypatch.setattr('datetime.datetime', MockDatetime)
    
    return _set_datetime
