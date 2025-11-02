# ICHHADHARI DAIRY MANAGEMENT SYSTEM

## Complete Monorepo Restructuring & Django Backend Implementation Guide

**Version**: 1.0.0  
**Tech Stack**: Next.js 14 + Django 5.0 + PostgreSQL 15  
**Architecture**: Monorepo with Shared Types  
**Status**: Production-Ready Backend Implementation

---

## Table of Contents

1. [Monorepo Structure](#monorepo-structure)
2. [Backend Architecture](#backend-architecture)
3. [Database Schema](#database-schema)
4. [Django Models (All Phases)](#django-models)
5. [API Specifications](#api-specifications)
6. [Authentication & Permissions](#authentication--permissions)
7. [Implementation Steps](#implementation-steps)
8. [Integration with Frontend](#integration-with-frontend)
9. [Testing Strategy](#testing-strategy)
10. [Deployment Guide](#deployment-guide)

---

## Monorepo Structure

```text
ichhadhari-dairy-management/
|
|-- apps/
|   |
|   |-- frontend/
|   |   |-- src/
|   |   |   |-- app/
|   |   |   |   |-- (auth)/
|   |   |   |   |   |-- login/
|   |   |   |   |   `-- register/
|   |   |   |   |-- (dashboard)/
|   |   |   |   |   |-- layout.tsx
|   |   |   |   |   |-- page.tsx
|   |   |   |   |   |-- milk-procurement/
|   |   |   |   |   |-- production/
|   |   |   |   |   |-- inventory/
|   |   |   |   |   |-- vendors/
|   |   |   |   |   |-- employees/
|   |   |   |   |   |-- distribution/
|   |   |   |   |   `-- finance/
|   |   |   |   `-- layout.tsx
|   |   |   |
|   |   |   |-- components/
|   |   |   |   |-- auth/
|   |   |   |   |-- layout/
|   |   |   |   |-- milk-management/
|   |   |   |   |-- production/
|   |   |   |   |-- inventory/
|   |   |   |   |-- vendors/
|   |   |   |   |-- employees/
|   |   |   |   `-- ui/
|   |   |   |
|   |   |   |-- lib/
|   |   |   |   |-- api/
|   |   |   |   |   |-- client.ts
|   |   |   |   |   |-- auth.ts
|   |   |   |   |   |-- milk.ts
|   |   |   |   |   |-- production.ts
|   |   |   |   |   |-- inventory.ts
|   |   |   |   |   |-- vendors.ts
|   |   |   |   |   `-- employees.ts
|   |   |   |   |-- hooks/
|   |   |   |   `-- utils/
|   |   |   |
|   |   |   `-- types/ (imports from @ichhadhari/shared)
|   |   |
|   |   |-- public/
|   |   |-- package.json
|   |   |-- tsconfig.json
|   |   |-- tailwind.config.ts
|   |   `-- next.config.js
|   |
|   `-- backend/
|       |-- dairy/
|       |   |-- __init__.py
|       |   |-- settings/
|       |   |   |-- __init__.py
|       |   |   |-- base.py
|       |   |   |-- development.py
|       |   |   |-- production.py
|       |   |   `-- test.py
|       |   |-- urls.py
|       |   |-- wsgi.py
|       |   |-- asgi.py
|       |   `-- celery.py
|       |
|       |-- apps/
|       |   |-- core/
|       |   |   |-- __init__.py
|       |   |   |-- models.py
|       |   |   |-- permissions.py
|       |   |   |-- pagination.py
|       |   |   |-- mixins.py
|       |   |   `-- utils.py
|       |   |
|       |   |-- authentication/
|       |   |   |-- __init__.py
|       |   |   |-- models.py
|       |   |   |-- serializers.py
|       |   |   |-- views.py
|       |   |   |-- urls.py
|       |   |   |-- permissions.py
|       |   |   `-- tests/
|       |   |
|       |   |-- milk_management/
|       |   |-- production/
|       |   |-- inventory/
|       |   |-- vendors/
|       |   |-- employees/
|       |   `-- future apps
|       |
|       |-- static/
|       |-- media/
|       |-- templates/
|       |-- requirements/
|       |   |-- base.txt
|       |   |-- development.txt
|       |   |-- production.txt
|       |   `-- test.txt
|       |
|       |-- manage.py
|       |-- pytest.ini
|       |-- .env.example
|       `-- README.md
|
`-- packages/
    `-- shared/
        |-- src/
        |   |-- types/
        |   |   |-- index.ts
        |   |   |-- auth.ts
        |   |   |-- milk.ts
        |   |   |-- production.ts
        |   |   |-- inventory.ts
        |   |   |-- vendors.ts
        |   |   |-- employees.ts
        |   |   `-- common.ts
        |   |
        |   |-- constants/
        |   |   |-- status.ts
        |   |   |-- permissions.ts
        |   |   |-- roles.ts
        |   |   `-- enums.ts
        |   |
        |   `-- utils/
        |       |-- formatters.ts
        |       |-- validators.ts
        |       `-- helpers.ts
        |
        |-- package.json
        |-- tsconfig.json
        `-- README.md
```

Additional top-level directories:

- `docker/` with Dockerfiles, docker-compose files, and nginx config
- `docs/` for documentation
- `scripts/` for setup, install, test, run, and deploy scripts
- `.github/workflows/` for CI/CD pipelines
- Root-level `.gitignore`, `.env.example`, `README.md`, `package.json`, `pnpm-workspace.yaml`, and `tsconfig.json`

---

## Backend Architecture

### Tech Stack

- Framework: Django 5.0.x
- API: Django REST Framework 3.14.x
- Database: PostgreSQL 15.x
- Caching: Redis 7.x
- Task Queue: Celery 5.3.x
- Message Broker: Redis or RabbitMQ
- Authentication: JWT (djangorestframework-simplejwt)
- File Storage: AWS S3 or local (configurable)
- Search: PostgreSQL full-text search
- Testing: Pytest plus Factory Boy
- Documentation: drf-spectacular (OpenAPI/Swagger)

### Architecture Patterns

```text
CLIENT (Next.js Frontend)
    |
    | HTTP/HTTPS (REST API)
    v
API GATEWAY (Nginx)
    |
    v
DJANGO REST FRAMEWORK
    |-- Authentication
    |-- Permissions
    `-- Throttling
    |
    v
+------------------------+-----------------------+-----------------+
| PostgreSQL (Database)  | Redis (Cache)         | Celery (Tasks)  |
+------------------------+-----------------------+-----------------+
```

### Design Principles

1. Single responsibility per Django app
2. Reuse common functionality via the `core` app
3. Security-first mindset (JWT, permissions, throttling)
4. Stateless API ready for scaling, with caching and async tasks
5. High test coverage targets (80 percent or higher)
6. Automated documentation with OpenAPI/Swagger

---

## Database Schema

### Entity Relationship Overview

```text
User (Auth)
  |
  +-- Supplier (Milk Management)
  |
  +-- Employee (HR)
        |
        +-- Department
        |
        +-- Attendance
        |
        +-- Leave Management

MilkCollection <-- Supplier
ProductionBatch --> Product
Inventory Stock --> Vendor
```

---

## Django Models

The guide covers models for all phases, including authentication, milk management, production, inventory, vendors, and employees. See inline code listings for detailed implementations.

### Phase 1 and 2: Authentication and Core

```python
# apps/authentication/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models
from apps.core.models import TimeStampedModel

class User(AbstractUser, TimeStampedModel):
    """Custom User model extending Django's AbstractUser"""
    USER_ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('manager', 'Manager'),
        ('supervisor', 'Supervisor'),
        ('operator', 'Operator'),
        ('viewer', 'Viewer'),
        ('finance', 'Finance'),
        ('hr', 'HR'),
    ]

    phone = models.CharField(max_length=15, unique=True, null=True, blank=True)
    role = models.CharField(max_length=20, choices=USER_ROLE_CHOICES, default='operator')
    employee_id = models.CharField(max_length=20, unique=True, null=True, blank=True)
    department = models.CharField(max_length=50, blank=True)
    profile_picture = models.ImageField(upload_to='profiles/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    permissions = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = 'users'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['phone']),
            models.Index(fields=['employee_id']),
        ]

    def __str__(self):
        return f"{self.get_full_name()} ({self.role})"

    def has_permission(self, permission: str) -> bool:
        if self.is_superuser or self.role == 'admin':
            return True
        return self.permissions.get(permission, False)


class RefreshToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='refresh_tokens')
    token = models.CharField(max_length=255, unique=True)
    is_revoked = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        db_table = 'refresh_tokens'
        ordering = ['-created_at']
```

```python
# apps/core/models.py

from django.db import models

class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class AuditLog(models.Model):
    ACTION_CHOICES = [
        ('create', 'Create'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('view', 'View'),
    ]

    user = models.ForeignKey('authentication.User', on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    model_name = models.CharField(max_length=50)
    object_id = models.CharField(max_length=50)
    changes = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'audit_logs'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['model_name', 'object_id']),
            models.Index(fields=['user', 'timestamp']),
        ]
```

### Phase 3: Milk Procurement and Quality Control

```python
# apps/milk_management/models.py

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.core.models import TimeStampedModel
from decimal import Decimal

class Supplier(TimeStampedModel):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('suspended', 'Suspended'),
    ]

    SUPPLIER_TYPE_CHOICES = [
        ('farmer', 'Individual Farmer'),
        ('cooperative', 'Cooperative'),
    ]

    supplier_id = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=200)
    supplier_type = models.CharField(max_length=20, choices=SUPPLIER_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    phone = models.CharField(max_length=15)
    alternate_phone = models.CharField(max_length=15, blank=True)
    email = models.EmailField(blank=True)
    address = models.TextField()
    route_name = models.CharField(max_length=100)
    collection_time = models.TimeField()
    bank_name = models.CharField(max_length=100, blank=True)
    account_number = models.CharField(max_length=50, blank=True)
    ifsc_code = models.CharField(max_length=20, blank=True)
    account_holder_name = models.CharField(max_length=200, blank=True)
    payment_cycle = models.CharField(
        max_length=20,
        choices=[
            ('daily', 'Daily'),
            ('weekly', 'Weekly'),
            ('fortnightly', 'Fortnightly'),
            ('monthly', 'Monthly'),
        ],
        default='monthly'
    )
    avg_quality_score = models.DecimalField(max_digits=4, decimal_places=2, default=0)
    total_milk_supplied = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    outstanding_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    documents = models.JSONField(default=dict, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        db_table = 'suppliers'
        ordering = ['supplier_id']
        indexes = [
            models.Index(fields=['supplier_id']),
            models.Index(fields=['route_name']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.supplier_id} - {self.name}"
```

(Additional models follow in the same file for `MilkCollection` and `MilkPayment`.)

### Phase 4: Production Management

```python
# apps/production/models.py

from django.db import models
from django.core.validators import MinValueValidator
from apps.core.models import TimeStampedModel
from decimal import Decimal

class Product(TimeStampedModel):
    CATEGORY_CHOICES = [
        ('dairy', 'Dairy Products'),
        ('sweets', 'Sweets'),
        ('beverages', 'Beverages'),
    ]

    UNIT_CHOICES = [
        ('kg', 'Kilogram'),
        ('liter', 'Liter'),
        ('piece', 'Piece'),
        ('pack', 'Pack'),
    ]

    product_id = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=200)
    category = models.CharField(max_length="50", choices=CATEGORY_CHOICES)
    description = models.TextField(blank=True)
    unit = models.CharField(max_length=20, choices=UNIT_CHOICES)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2)
    shelf_life_days = models.IntegerField()
    storage_temperature = models.CharField(max_length=50, blank=True)
    milk_required_per_unit = models.DecimalField(max_digits=8, decimal_places=2)
    is_active = models.BooleanField(default=True)
    image = models.ImageField(upload_to='products/', null=True, blank=True)

    class Meta:
        db_table = 'products'
        ordering = ['product_id']
```

Subsequent models in `production/models.py` cover `ProductionBatch` and `ProductionSchedule`.

### Phase 5: Inventory Management

```python
# apps/inventory/models.py

from django.db import models
from django.core.validators import MinValueValidator
from apps.core.models import TimeStampedModel
from decimal import Decimal

class InventoryItem(TimeStampedModel):
    ITEM_TYPE_CHOICES = [
        ('raw_milk', 'Raw Milk'),
        ('raw_material', 'Raw Material'),
        ('finished_good', 'Finished Good'),
    ('packaging', 'Packaging Material'),
    ]

    UNIT_CHOICES = [
        ('kg', 'Kilogram'),
        ('liter', 'Liter'),
        ('piece', 'Piece'),
        ('pack', 'Pack'),
        ('bag', 'Bag'),
        ('box', 'Box'),
    ]

    item_id = models.CharField(max_length=30, unique=True)
    name = models.CharField(max_length=200)
    item_type = models.CharField(max_length=30, choices=ITEM_TYPE_CHOICES)
    description = models.TextField(blank=True)
    unit = models.CharField(max_length=20, choices=UNIT_CHOICES)
    cost_per_unit = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    current_stock = models.DecimalField(max_digits=12, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    min_stock_level = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    max_stock_level = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    reorder_point = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    storage_location = models.CharField(max_length=100, blank=True)
    storage_temperature = models.CharField(max_length=50, blank=True)
    is_active = models.BooleanField(default=True)
    product = models.OneToOneField('production.Product', on_delete=models.SET_NULL, null=True, blank=True, related_name='inventory')

    class Meta:
        db_table = 'inventory_items'
        ordering = ['item_id']
```

`StockTransaction`, `RawMaterialStock`, `FinishedGoodsStock`, and `StockAlert` are defined in the same module.

### Phase 6: Vendor Management

```python
# apps/vendors/models.py

from django.db import models
from django.core.validators import MinValueValidator
from apps.core.models import TimeStampedModel
from decimal import Decimal

class Vendor(TimeStampedModel):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('suspended', 'Suspended'),
    ]

    VENDOR_CATEGORY_CHOICES = [
        ('raw_material', 'Raw Material Supplier'),
        ('packaging', 'Packaging Supplier'),
        ('equipment', 'Equipment Supplier'),
        ('service', 'Service Provider'),
        ('other', 'Other'),
    ]

    vendor_id = models.CharField(max_length=20, unique=True)
    company_name = models.CharField(max_length=200)
    category = models.CharField(max_length=30, choices=VENDOR_CATEGORY_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    contact_person = models.CharField(max_length=200)
    phone = models.CharField(max_length=15)
    alternate_phone = models.CharField(max_length=15, blank=True)
    email = models.EmailField(blank=True)
    website = models.URLField(blank=True)
    billing_address = models.TextField()
    shipping_address = models.TextField(blank=True)
    gst_number = models.CharField(max_length=20, blank=True)
    pan_number = models.CharField(max_length=20, blank=True)
    company_registration_number = models.CharField(max_length=50, blank=True)
    bank_name = models.CharField(max_length=100, blank=True)
    account_number = models.CharField(max_length=50, blank=True)
    ifsc_code = models.CharField(max_length=20, blank=True)
    account_holder_name = models.CharField(max_length=200, blank=True)
    credit_period_days = models.IntegerField(default=30)
    credit_limit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    payment_method = models.CharField(
        max_length=20,
        choices=[
            ('cash', 'Cash'),
            ('cheque', 'Cheque'),
            ('bank_transfer', 'Bank Transfer'),
            ('upi', 'UPI'),
        ],
        default='bank_transfer'
    )
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    total_purchases = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_payments = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    outstanding_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    documents = models.JSONField(default=dict, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        db_table = 'vendors'
        ordering = ['vendor_id']
        indexes = [
            models.Index(fields=['vendor_id']),
            models.Index(fields=['status']),
        ]
```

Additional classes in this file define purchase orders, purchase order items, vendor payments, goods receipt notes, and GRN items.

### Phase 7: Employee Management and HR

```python
# apps/employees/models.py

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.core.models import TimeStampedModel
from decimal import Decimal

class Employee(TimeStampedModel):
    EMPLOYMENT_TYPE_CHOICES = [
        ('full_time', 'Full Time'),
        ('part_time', 'Part Time'),
        ('contract', 'Contract'),
        ('temporary', 'Temporary'),
    ]

    MARITAL_STATUS_CHOICES = [
        ('single', 'Single'),
        ('married', 'Married'),
        ('divorced', 'Divorced'),
        ('widowed', 'Widowed'),
    ]

    user = models.OneToOneField('authentication.User', on_delete=models.CASCADE, related_name='employee_profile')
    employee_id = models.CharField(max_length=20, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=10, choices=[('male', 'Male'), ('female', 'Female'), ('other', 'Other')])
    marital_status = models.CharField(max_length=20, choices=MARITAL_STATUS_CHOICES)
    personal_email = models.EmailField(blank=True)
    phone = models.CharField(max_length=15)
    alternate_phone = models.CharField(max_length=15, blank=True)
    current_address = models.TextField()
    permanent_address = models.TextField(blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    emergency_contact_name = models.CharField(max_length=200)
    emergency_contact_phone = models.CharField(max_length=15)
    emergency_contact_relation = models.CharField(max_length=50)
    date_of_joining = models.DateField()
    date_of_leaving = models.DateField(null=True, blank=True)
    employment_type = models.CharField(max_length=20, choices=EMPLOYMENT_TYPE_CHOICES)
    probation_period_months = models.IntegerField(default=6)
    is_probation_completed = models.BooleanField(default=False)
    department = models.ForeignKey('Department', on_delete=models.PROTECT, related_name='employees')
    designation = models.CharField(max_length=100)
    reporting_manager = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='team_members')
    aadhaar_number = models.CharField(max_length=12, blank=True)
    pan_number = models.CharField(max_length=10, blank=True)
    documents = models.JSONField(default=dict, blank=True)
    bank_name = models.CharField(max_length=100, blank=True)
    account_number = models.CharField(max_length=50, blank=True)
    ifsc_code = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True)

    class Meta:
        db_table = 'employees'
        ordering = ['employee_id']
        indexes = [
            models.Index(fields=['employee_id']),
            models.Index(fields=['department']),
        ]
```

The module continues with `Department`, `Attendance`, `LeaveType`, `LeaveBalance`, `LeaveRequest`, `PerformanceReview`, `SalaryStructure`, and `PayrollRecord` models.

---

## API Specifications

### API Structure Overview

```text
/api/v1/
|-- auth/
|   |-- register/ (POST)
|   |-- login/ (POST)
|   |-- logout/ (POST)
|   |-- refresh/ (POST)
|   |-- me/ (GET, PATCH)
|   `-- change-password/ (POST)
|
|-- milk-management/
|   |-- suppliers/ (GET, POST)
|   |-- suppliers/{id}/ (GET, PATCH, DELETE)
|   |-- collections/ (GET, POST)
|   |-- collections/{id}/ (GET, PATCH, DELETE)
|   |-- collections/stats/ (GET)
|   |-- collections/by-supplier/ (GET)
|   |-- payments/ (GET, POST)
|   |-- payments/{id}/ (GET, PATCH, DELETE)
|   `-- reports/ (GET)
|
|-- production/
|   |-- products/ (GET, POST)
|   |-- products/{id}/ (GET, PATCH, DELETE)
|   |-- batches/ (GET, POST)
|   |-- batches/{id}/ (GET, PATCH, DELETE)
|   |-- batches/{id}/start/ (POST)
|   |-- batches/{id}/complete/ (POST)
|   |-- schedules/ (GET, POST)
|   |-- schedules/{id}/ (GET, PATCH, DELETE)
|   `-- reports/ (GET)
|
|-- inventory/
|   |-- items/ (GET, POST)
|   |-- items/{id}/ (GET, PATCH, DELETE)
|   |-- transactions/ (GET, POST)
|   |-- transactions/{id}/ (GET)
|   |-- stock-levels/ (GET)
|   |-- alerts/ (GET, POST)
|   |-- alerts/{id}/acknowledge/ (POST)
|   |-- raw-materials/ (GET, POST)
|   |-- finished-goods/ (GET, POST)
|   `-- reports/ (GET)
|
|-- vendors/
|   |-- vendors/ (GET, POST)
|   |-- vendors/{id}/ (GET, PATCH, DELETE)
|   |-- purchase-orders/ (GET, POST)
|   |-- purchase-orders/{id}/ (GET, PATCH, DELETE)
|   |-- purchase-orders/{id}/approve/ (POST)
|   |-- purchase-orders/{id}/send/ (POST)
|   |-- payments/ (GET, POST)
|   |-- payments/{id}/ (GET, PATCH, DELETE)
|   |-- grns/ (GET, POST)
|   |-- grns/{id}/ (GET, PATCH, DELETE)
|   `-- reports/ (GET)
|
|-- employees/
|   |-- employees/ (GET, POST)
|   |-- employees/{id}/ (GET, PATCH, DELETE)
|   |-- departments/ (GET, POST)
|   |-- departments/{id}/ (GET, PATCH, DELETE)
|   |-- attendance/ (GET, POST)
|   |-- attendance/{id}/ (GET, PATCH)
|   |-- attendance/mark-bulk/ (POST)
|   |-- leave-types/ (GET, POST)
|   |-- leave-requests/ (GET, POST)
|   |-- leave-requests/{id}/ (GET, PATCH, DELETE)
|   |-- leave-requests/{id}/approve/ (POST)
|   |-- leave-requests/{id}/reject/ (POST)
|   |-- performance-reviews/ (GET, POST)
|   |-- performance-reviews/{id}/ (GET, PATCH, DELETE)
|   |-- salary-structures/ (GET, POST)
|   |-- salary-structures/{id}/ (GET, PATCH, DELETE)
|   |-- payroll/ (GET, POST)
|   |-- payroll/{id}/ (GET, PATCH)
|   |-- payroll/{id}/approve/ (POST)
|   `-- reports/ (GET)
|
`-- dashboard/
    |-- stats/ (GET)
    |-- recent-activity/ (GET)
    `-- charts/ (GET)
```

---

## Authentication & Permissions

### JWT Authentication Example

```python
# apps/authentication/views.py

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import authenticate

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'role': self.user.role,
            'full_name': self.user.get_full_name(),
            'permissions': self.user.permissions,
        }
        return data

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
```

Additional functions handle login, logout, and token rotation.

### Permission Classes

```python
# apps/core/permissions.py

from rest_framework import permissions

class IsAdminOrManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role in ['admin', 'manager']

class HasModulePermission(permissions.BasePermission):
    module_name = None

    def has_permission(self, request, view):
        if request.user.is_superuser or request.user.role == 'admin':
            return True
        if request.method in permissions.SAFE_METHODS:
            return request.user.has_permission(f'{self.module_name}_read')
        return request.user.has_permission(f'{self.module_name}_write')

class MilkManagementPermission(HasModulePermission):
    module_name = 'milk_management'
```

---

## Implementation Steps

### Step 1: Restructure Frontend into a Monorepo

```bash
mkdir ichhadhari-dairy-management
cd ichhadhari-dairy-management
git init
pnpm init -y
mkdir -p apps/frontend apps/backend packages/shared
mv ../dairy-management-system/* apps/frontend/
cat > pnpm-workspace.yaml <<'EOF'
packages:
  - 'apps/*'
  - 'packages/*'
EOF
```

### Step 2: Create Shared Types Package

```bash
cd packages/shared
pnpm init -y
mkdir -p src/types src/constants src/utils
```

Example `package.json`:

```json
{
  "name": "@ichhadhari/shared",
  "version": "1.0.0",
  "main": "src/index.ts",
  "types": "src/index.ts"
}
```

### Step 3: Set Up Django Backend

```bash
cd apps/backend
python -m venv venv
source venv/bin/activate
pip install django==5.0 djangorestframework==3.14 \
  djangorestframework-simplejwt psycopg2-binary python-decouple \
  django-cors-headers celery redis pillow drf-spectacular
```
