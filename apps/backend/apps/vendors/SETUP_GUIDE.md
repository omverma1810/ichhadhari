# Vendor Management Setup Guide

Complete setup instructions for the Vendor Management module.

## Prerequisites

- Django 5.0+
- Django REST Framework 3.14+
- PostgreSQL/MySQL database
- Inventory Management app installed
- Authentication app installed

## Installation Steps

### 1. Verify Dependencies

The vendor app requires:

```
Django>=5.0
djangorestframework>=3.14
django-filter>=23.2
```

### 2. Add to Installed Apps

In `dairy/settings/base.py`:

```python
INSTALLED_APPS = [
    # ... other apps ...
    'apps.vendors',
    'apps.inventory',  # Required for inventory integration
    # ...
]
```

### 3. Include URLs

In `dairy/urls.py`:

```python
urlpatterns = [
    # ... other patterns ...
    path('api/vendors/', include('apps.vendors.urls')),
    # ...
]
```

### 4. Run Migrations

```bash
cd apps/backend
python manage.py makemigrations vendors
python manage.py migrate vendors
```

### 5. Create Sample Data (Optional)

```bash
python manage.py create_sample_vendors
```

This creates:

- 5 sample vendors
- 10 purchase orders
- 8 vendor payments
- 6 GRNs

### 6. Verify Installation

```bash
# Run vendor tests
pytest apps/vendors/tests/ -v

# Check admin interface
python manage.py runserver
# Visit: http://localhost:8000/admin/vendors/
```

## Configuration

### Default Settings

The vendor app uses these defaults (can be overridden in settings):

```python
# PO Number Format
VENDOR_PO_NUMBER_FORMAT = "PO{date}{sequence}"

# Payment ID Format
VENDOR_PAYMENT_ID_FORMAT = "VP{date}{sequence}"

# GRN Number Format
VENDOR_GRN_NUMBER_FORMAT = "GRN{date}{sequence}"

# Default PO Status
VENDOR_DEFAULT_PO_STATUS = "draft"

# Auto-create stock transactions on GRN
VENDOR_AUTO_CREATE_STOCK_TRANSACTION = True
```

### Permissions

Add these permissions to your groups:

**Purchasing Manager:**

- Can add/change/delete vendors
- Can add/change purchase orders
- Can approve purchase orders
- Can add/change/delete GRNs

**Accounts:**

- Can view vendors
- Can add/change vendor payments
- Can view purchase orders

**Store Keeper:**

- Can view vendors
- Can view purchase orders
- Can add/change GRNs

### API Permissions

Configure in `settings.py`:

```python
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
}
```

## Database Schema

### Tables Created

```sql
-- vendors
CREATE TABLE vendors (
    id SERIAL PRIMARY KEY,
    vendor_id VARCHAR(50) UNIQUE,
    company_name VARCHAR(255),
    category VARCHAR(20),
    status VARCHAR(20),
    -- ... 30+ fields
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- purchase_orders
CREATE TABLE purchase_orders (
    id SERIAL PRIMARY KEY,
    po_number VARCHAR(50) UNIQUE,
    vendor_id INTEGER REFERENCES vendors(id),
    status VARCHAR(20),
    -- ... financial fields
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- purchase_order_items
CREATE TABLE purchase_order_items (
    id SERIAL PRIMARY KEY,
    purchase_order_id INTEGER REFERENCES purchase_orders(id),
    inventory_item_id INTEGER REFERENCES inventory_items(id),
    quantity DECIMAL(15, 3),
    unit_price DECIMAL(10, 2),
    line_total DECIMAL(12, 2),
    -- ...
);

-- vendor_payments
CREATE TABLE vendor_payments (
    id SERIAL PRIMARY KEY,
    payment_id VARCHAR(50) UNIQUE,
    vendor_id INTEGER REFERENCES vendors(id),
    amount DECIMAL(12, 2),
    -- ...
);

-- goods_receipt_notes
CREATE TABLE goods_receipt_notes (
    id SERIAL PRIMARY KEY,
    grn_number VARCHAR(50) UNIQUE,
    purchase_order_id INTEGER REFERENCES purchase_orders(id),
    quality_status VARCHAR(20),
    -- ...
);

-- grn_items
CREATE TABLE grn_items (
    id SERIAL PRIMARY KEY,
    grn_id INTEGER REFERENCES goods_receipt_notes(id),
    po_item_id INTEGER REFERENCES purchase_order_items(id),
    ordered_quantity DECIMAL(15, 3),
    received_quantity DECIMAL(15, 3),
    -- ...
);
```

### Indexes

```sql
CREATE INDEX idx_vendors_vendor_id ON vendors(vendor_id);
CREATE INDEX idx_vendors_status ON vendors(status);
CREATE INDEX idx_po_number ON purchase_orders(po_number);
CREATE INDEX idx_po_vendor_date ON purchase_orders(vendor_id, po_date);
CREATE INDEX idx_payment_id ON vendor_payments(payment_id);
CREATE INDEX idx_grn_number ON goods_receipt_notes(grn_number);
```

## API Setup

### Authentication

All API endpoints require authentication. Get JWT token:

```bash
# Login
POST /api/auth/login/
{
    "username": "admin",
    "password": "password"
}

# Response
{
    "access": "eyJ0eXAiOiJKV1Q...",
    "refresh": "eyJ0eXAiOiJKV1Q..."
}

# Use token in requests
Authorization: Bearer eyJ0eXAiOiJKV1Q...
```

### Test API Connection

```bash
# List vendors
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/vendors/vendors/

# Create vendor
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"vendor_id":"VEN-001","company_name":"Test Supplier"}' \
  http://localhost:8000/api/vendors/vendors/
```

### API Documentation

Access auto-generated API docs:

- Swagger: `http://localhost:8000/api/schema/swagger-ui/`
- ReDoc: `http://localhost:8000/api/schema/redoc/`

## Initial Data Setup

### 1. Create Vendors

```python
from apps.vendors.models import Vendor

vendor = Vendor.objects.create(
    vendor_id="VEN-001",
    company_name="ABC Suppliers Ltd",
    category="raw_material",
    status="active",
    contact_person="John Doe",
    phone="9876543210",
    email="john@abc.com",
    billing_address="123 Industrial Area",
    gst_number="27AABCT1234H1Z0",
    credit_period_days=30,
    credit_limit=100000
)
```

### 2. Create Purchase Order

```python
from apps.vendors.models import PurchaseOrder, PurchaseOrderItem
from apps.inventory.models import InventoryItem

po = PurchaseOrder.objects.create(
    vendor=vendor,
    po_date=date.today(),
    expected_delivery_date=date.today() + timedelta(days=7),
    created_by=user
)

# Add items
item = PurchaseOrderItem.objects.create(
    purchase_order=po,
    item_name="Milk Powder",
    quantity=500,
    unit="kg",
    unit_price=450.00,
    inventory_item=inventory_item
)
```

### 3. Create Payment

```python
from apps.vendors.models import VendorPayment

payment = VendorPayment.objects.create(
    vendor=vendor,
    amount=50000,
    payment_date=date.today(),
    payment_method="bank_transfer",
    transaction_reference="TXN123456",
    status="completed",
    created_by=user
)
payment.purchase_orders.add(po)
```

### 4. Create GRN

```python
from apps.vendors.models import GoodsReceiptNote, GRNItem

grn = GoodsReceiptNote.objects.create(
    purchase_order=po,
    receipt_date=date.today(),
    quality_status="approved",
    delivery_challan_number="DC-001",
    created_by=user
)

# Add items
grn_item = GRNItem.objects.create(
    grn=grn,
    po_item=item,
    ordered_quantity=500,
    received_quantity=500,
    accepted_quantity=500,
    rejected_quantity=0,
    quality_check_passed=True,
    batch_number="BATCH-001"
)
```

## Testing Setup

### Configure pytest

File: `pytest.ini`

```ini
[pytest]
DJANGO_SETTINGS_MODULE = dairy.settings.test
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = -v --tb=short
```

### Run Tests

```bash
# All vendor tests
pytest apps/vendors/tests/ -v

# Specific test file
pytest apps/vendors/tests/test_models.py -v

# Specific test
pytest apps/vendors/tests/test_models.py::TestVendorModel::test_create_vendor -v

# With coverage
pytest apps/vendors/tests/ --cov=apps.vendors --cov-report=html
```

## Admin Interface Setup

### Access Admin

1. Create superuser:

```bash
python manage.py createsuperuser
```

2. Visit: `http://localhost:8000/admin/`

3. Navigate to Vendors section

### Admin Features

- **Vendors**: Full CRUD with filters by status, category
- **Purchase Orders**: Inline item editing, status filters
- **Payments**: Quick add, filter by status and method
- **GRNs**: Inline item editing, quality status filters

## Integration Setup

### With Inventory Module

Ensure inventory app is installed:

```python
# settings.py
INSTALLED_APPS = [
    'apps.inventory',  # Must be before vendors
    'apps.vendors',
]
```

### Signal Handlers

The vendor app uses signals for:

- Creating stock transactions on GRN
- Updating vendor balances on payment
- Updating PO status on GRN

Signals are auto-registered in `apps.py`.

## Environment Variables

Set these in `.env`:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ichhadhari_db

# Django
DJANGO_SECRET_KEY=your-secret-key
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

# API
API_BASE_URL=http://localhost:8000
```

## Production Deployment

### 1. Database Migrations

```bash
python manage.py migrate vendors --database=production
```

### 2. Collect Static Files

```bash
python manage.py collectstatic --noinput
```

### 3. Create Initial Data

```bash
python manage.py create_sample_vendors --settings=dairy.settings.production
```

### 4. Setup Celery Tasks (Future)

```python
# For automated reordering, payment reminders
celery -A dairy worker -l info
```

## Troubleshooting

### Migration Issues

```bash
# Reset migrations (development only!)
python manage.py migrate vendors zero
rm apps/vendors/migrations/0*.py
python manage.py makemigrations vendors
python manage.py migrate vendors
```

### Import Errors

```python
# Ensure correct import paths
from apps.vendors.models import Vendor  # Not from vendors.models
```

### Foreign Key Issues

```python
# Ensure related apps are migrated
python manage.py migrate authentication
python manage.py migrate inventory
python manage.py migrate vendors
```

### Test Database Issues

```bash
# Recreate test database
pytest apps/vendors/tests/ --create-db
```

## Verification Checklist

- [ ] Migrations applied successfully
- [ ] Admin interface accessible
- [ ] API endpoints working
- [ ] Tests passing
- [ ] Sample data created
- [ ] Authentication working
- [ ] GRN creates stock transactions
- [ ] PO status workflow functioning
- [ ] Vendor balances updating

## Next Steps

1. **Create Initial Vendors**: Add your suppliers
2. **Configure Permissions**: Setup user groups
3. **Test Workflow**: Create test PO → Approve → Send → GRN
4. **Integration**: Link with production planning
5. **Reports**: Setup vendor performance reports
6. **Automation**: Configure reorder points

## Support

For issues or questions:

- Check README.md for features
- See API_EXAMPLES.md for usage
- Review test files for examples
- Check Django logs: `logs/django.log`

---

Setup complete! Start creating vendors and purchase orders.
