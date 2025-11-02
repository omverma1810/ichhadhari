# Ichhadhari Dairy Management - Django Backend

Production-ready Django 5.0 backend for the Ichhadhari Dairy Management System.

## 📋 Overview

This is a modern Django REST API backend with:

- **Django 5.0** with Django REST Framework
- **JWT Authentication** with token rotation
- **PostgreSQL** database
- **Redis** for caching and Celery
- **Celery** for async task processing
- **Split settings** for different environments
- **Comprehensive test suite** with pytest
- **Production-ready** configuration

## 🏗️ Project Structure

```
apps/backend/
├── dairy/                      # Django project
│   ├── settings/              # Split settings
│   │   ├── base.py           # Base configuration
│   │   ├── development.py    # Development settings
│   │   ├── production.py     # Production settings
│   │   └── test.py           # Test settings
│   ├── urls.py               # Main URL configuration
│   ├── wsgi.py              # WSGI application
│   ├── asgi.py              # ASGI application
│   └── celery.py            # Celery configuration
│
├── apps/                     # Django apps
│   └── core/                # Core utilities
│       ├── models.py        # Abstract base models
│       ├── permissions.py   # Custom permissions
│       ├── pagination.py    # Custom pagination
│       ├── mixins.py        # Reusable mixins
│       └── utils.py         # Utility functions
│
├── requirements/            # Requirements files
│   ├── base.txt           # Base dependencies
│   ├── development.txt    # Dev dependencies
│   ├── production.txt     # Prod dependencies
│   └── test.txt           # Test dependencies
│
├── manage.py              # Django management script
├── pytest.ini            # Pytest configuration
└── .env.example          # Environment variables template
```

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- PostgreSQL 14+
- Redis 7+
- pip and virtualenv

### 1. Create Virtual Environment

```bash
cd apps/backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
# For development
pip install -r requirements/development.txt

# For production
pip install -r requirements/production.txt
```

### 3. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your values
nano .env
```

### 4. Setup Database

```bash
# Create PostgreSQL database
createdb ichhadhari_db

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### 5. Run Development Server

```bash
python manage.py runserver
```

The API will be available at:

- API Root: http://localhost:8000/api/v1/
- Admin Panel: http://localhost:8000/admin/
- API Docs: http://localhost:8000/api/docs/
- ReDoc: http://localhost:8000/api/redoc/

## 📦 Core Features

### Abstract Base Models

The `core` app provides reusable abstract models:

#### TimeStampedModel

Adds `created_at` and `updated_at` fields:

```python
from apps.core.models import TimeStampedModel

class Vendor(TimeStampedModel):
    name = models.CharField(max_length=255)
    # Automatically has created_at and updated_at
```

#### SoftDeleteModel

Implements soft delete functionality:

```python
from apps.core.models import SoftDeleteModel

class Product(SoftDeleteModel):
    name = models.CharField(max_length=255)
    # Can be soft-deleted instead of hard-deleted
```

#### BaseModel

Combines timestamps and soft delete:

```python
from apps.core.models import BaseModel

class MilkIntake(BaseModel):
    # Has created_at, updated_at, is_deleted, deleted_at
    pass
```

### Custom Permissions

Module-specific permission classes:

```python
from rest_framework import viewsets
from apps.core.permissions import MilkManagementPermission

class MilkIntakeViewSet(viewsets.ModelViewSet):
    permission_classes = [MilkManagementPermission]
```

Available permissions:

- `IsAdminOrManager` - Admin/Manager only
- `MilkManagementPermission` - Milk module access
- `ProductionPermission` - Production module access
- `InventoryPermission` - Inventory module access
- `VendorPermission` - Vendor module access
- `EmployeePermission` - Employee module access

### Custom Pagination

```python
from apps.core.pagination import CustomPagination

class VendorViewSet(viewsets.ModelViewSet):
    pagination_class = CustomPagination
```

API Response:

```json
{
    "count": 100,
    "next": "http://api.example.com/api/vendors/?page=3",
    "previous": "http://api.example.com/api/vendors/?page=1",
    "total_pages": 10,
    "current_page": 2,
    "page_size": 20,
    "results": [...]
}
```

### Utility Functions

```python
from apps.core.utils import (
    generate_vendor_code,
    generate_batch_number,
    validate_phone_number,
    calculate_fat_snf_value,
    get_date_range
)

# Generate codes
vendor_code = generate_vendor_code()  # VEN-A1B2C3
batch_number = generate_batch_number()  # BATCH-20231215-A1B2

# Validation
is_valid = validate_phone_number('+919876543210')  # True

# Calculations
milk_value = calculate_fat_snf_value(100, 4.5, 8.5)
# {'fat_value': 450.0, 'snf_value': 850.0, 'total_value': 1300.0}
```

## 🔧 Configuration

### Environment Variables

Key environment variables (see `.env.example` for full list):

```bash
# General
ENVIRONMENT=development
DEBUG=True
SECRET_KEY=your-secret-key

# Database
DB_NAME=ichhadhari_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379/0

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Settings Files

- **base.py**: Common settings for all environments
- **development.py**: Local development (DEBUG=True, SQLite option, etc.)
- **production.py**: Production deployment (Security headers, SSL, etc.)
- **test.py**: Test configuration (In-memory database, fast password hasher)

Switch environments:

```bash
export ENVIRONMENT=production
python manage.py runserver
```

## 🧪 Testing

### Run Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=apps

# Run specific test file
pytest apps/vendors/tests/test_models.py

# Run with specific marker
pytest -m unit
```

### Test Markers

- `@pytest.mark.unit` - Unit tests
- `@pytest.mark.integration` - Integration tests
- `@pytest.mark.api` - API endpoint tests
- `@pytest.mark.slow` - Slow running tests

### Writing Tests

```python
import pytest
from django.urls import reverse
from rest_framework import status

@pytest.mark.api
@pytest.mark.django_db
def test_vendor_list(api_client, vendor):
    url = reverse('vendor-list')
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
```

## 🔐 Authentication

### JWT Token Authentication

1. **Obtain Token**:

```bash
POST /api/auth/token/
{
    "email": "user@example.com",
    "password": "password"
}

Response:
{
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

2. **Use Token**:

```bash
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

3. **Refresh Token**:

```bash
POST /api/auth/token/refresh/
{
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

## 📚 API Documentation

Interactive API documentation is available at:

- **Swagger UI**: http://localhost:8000/api/docs/
- **ReDoc**: http://localhost:8000/api/redoc/
- **OpenAPI Schema**: http://localhost:8000/api/schema/

## 🔄 Celery Tasks

### Start Celery Worker

```bash
# In a separate terminal
celery -A dairy worker -l info
```

### Start Celery Beat (for periodic tasks)

```bash
celery -A dairy beat -l info
```

### Example Task

```python
from celery import shared_task

@shared_task
def generate_daily_report():
    # Task logic here
    pass
```

## 🚢 Production Deployment

### 1. Update Settings

```bash
# Set production environment variables
export ENVIRONMENT=production
export DEBUG=False
export SECRET_KEY=<strong-secret-key>
export ALLOWED_HOSTS=yourdomain.com
```

### 2. Collect Static Files

```bash
python manage.py collectstatic --noinput
```

### 3. Run with Gunicorn

```bash
gunicorn dairy.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 4 \
    --threads 2 \
    --timeout 60
```

### 4. Setup Nginx

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location /static/ {
        alias /path/to/staticfiles/;
    }

    location /media/ {
        alias /path/to/media/;
    }

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🔍 Common Commands

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Django shell
python manage.py shell

# Database shell
python manage.py dbshell

# Run tests
pytest

# Check for issues
python manage.py check

# Start development server
python manage.py runserver

# Collect static files
python manage.py collectstatic
```

## 📈 Performance

### Database Optimization

```python
# Use select_related for foreign keys
vendors = Vendor.objects.select_related('created_by').all()

# Use prefetch_related for many-to-many
products = Product.objects.prefetch_related('categories').all()

# Use only() to fetch specific fields
vendors = Vendor.objects.only('name', 'code')
```

### Caching

```python
from django.core.cache import cache

# Set cache
cache.set('key', 'value', timeout=300)

# Get cache
value = cache.get('key')

# Delete cache
cache.delete('key')
```

## 🛡️ Security Best Practices

1. **Never commit `.env` file**
2. **Use strong `SECRET_KEY` in production**
3. **Set `DEBUG=False` in production**
4. **Configure proper `ALLOWED_HOSTS`**
5. **Enable HTTPS and security headers**
6. **Use strong database passwords**
7. **Keep dependencies updated**
8. **Enable rate limiting**
9. **Implement proper authentication**
10. **Regular security audits**

## 📝 License

This project is part of the Ichhadhari Dairy Management System.

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Run tests and linting
5. Submit a pull request

---

**Built with Django 5.0, DRF, and ❤️**
