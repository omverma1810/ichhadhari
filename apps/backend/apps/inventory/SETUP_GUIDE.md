# Inventory Management Setup Guide

This guide will help you set up and configure the Inventory Management system.

## Installation Steps

### 1. Verify App Installation

The inventory app is already included in `INSTALLED_APPS`. Verify in `dairy/settings/base.py`:

```python
INSTALLED_APPS = [
    # ...
    'apps.inventory',
    # ...
]
```

### 2. Run Migrations

Apply the inventory database migrations:

```bash
cd apps/backend
python manage.py migrate inventory
```

This will create the following tables:

- `inventory_items`
- `stock_transactions`
- `raw_material_stocks`
- `finished_goods_stocks`
- `stock_alerts`

### 3. Verify URL Configuration

Ensure inventory URLs are included in `dairy/urls.py`:

```python
urlpatterns = [
    # ...
    path('api/inventory/', include('apps.inventory.urls')),
    # ...
]
```

### 4. Create Initial Inventory Items

You can create inventory items through:

#### A. Django Admin

1. Access admin: `http://localhost:8000/admin/`
2. Navigate to "Inventory Management" section
3. Click "Add" for Inventory Items

#### B. API Endpoint

```bash
curl -X POST http://localhost:8000/api/inventory/items/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "item_id": "RM-001",
    "name": "Whole Milk Powder",
    "item_type": "raw_material",
    "unit": "kg",
    "cost_per_unit": "450.00",
    "current_stock": "500.00",
    "min_stock_level": "100.00",
    "max_stock_level": "1000.00",
    "reorder_point": "150.00",
    "storage_location": "Cold Storage A",
    "storage_temperature": "4°C"
  }'
```

#### C. Django Shell

```python
python manage.py shell

from apps.inventory.models import InventoryItem
from decimal import Decimal

# Create raw material
InventoryItem.objects.create(
    item_id='RM-001',
    name='Whole Milk Powder',
    item_type='raw_material',
    unit='kg',
    cost_per_unit=Decimal('450.00'),
    current_stock=Decimal('500.00'),
    min_stock_level=Decimal('100.00'),
    max_stock_level=Decimal('1000.00'),
    reorder_point=Decimal('150.00'),
    storage_location='Cold Storage A',
    storage_temperature='4°C'
)
```

## Initial Data Setup

### Sample Inventory Items

Here's a script to create sample inventory items:

```python
# Create sample_inventory_data.py in scripts/

from django.core.management.base import BaseCommand
from apps.inventory.models import InventoryItem
from decimal import Decimal


class Command(BaseCommand):
    help = 'Create sample inventory items'

    def handle(self, *args, **options):
        items = [
            # Raw Materials
            {
                'item_id': 'RM-001',
                'name': 'Whole Milk Powder',
                'item_type': 'raw_material',
                'unit': 'kg',
                'cost_per_unit': Decimal('450.00'),
                'min_stock_level': Decimal('100.00'),
                'reorder_point': Decimal('150.00'),
            },
            {
                'item_id': 'RM-002',
                'name': 'Sugar',
                'item_type': 'raw_material',
                'unit': 'kg',
                'cost_per_unit': Decimal('40.00'),
                'min_stock_level': Decimal('50.00'),
                'reorder_point': Decimal('75.00'),
            },
            # Packaging Materials
            {
                'item_id': 'PKG-001',
                'name': 'Milk Bottles (500ml)',
                'item_type': 'packaging',
                'unit': 'piece',
                'cost_per_unit': Decimal('5.00'),
                'min_stock_level': Decimal('500.00'),
                'reorder_point': Decimal('1000.00'),
            },
            {
                'item_id': 'PKG-002',
                'name': 'Yogurt Cups (200ml)',
                'item_type': 'packaging',
                'unit': 'piece',
                'cost_per_unit': Decimal('3.00'),
                'min_stock_level': Decimal('1000.00'),
                'reorder_point': Decimal('2000.00'),
            },
        ]

        for item_data in items:
            item, created = InventoryItem.objects.get_or_create(
                item_id=item_data['item_id'],
                defaults=item_data
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Created: {item.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Already exists: {item.name}')
                )
```

Save as: `apps/backend/apps/inventory/management/commands/create_sample_inventory.py`

Run with:

```bash
python manage.py create_sample_inventory
```

## Configuration

### Stock Alert Thresholds

For each inventory item, configure:

- **min_stock_level**: Triggers low stock alert
- **reorder_point**: Triggers reorder point alert
- **max_stock_level**: Maximum capacity

Example:

```python
item = InventoryItem.objects.get(item_id='RM-001')
item.min_stock_level = Decimal('100.00')
item.reorder_point = Decimal('150.00')
item.max_stock_level = Decimal('1000.00')
item.save()
```

### Permissions

Configure user permissions in Django admin:

- `inventory.view_inventoryitem`
- `inventory.add_inventoryitem`
- `inventory.change_inventoryitem`
- `inventory.delete_inventoryitem`
- `inventory.view_stocktransaction`
- `inventory.add_stocktransaction`
- `inventory.view_stockalert`
- `inventory.change_stockalert`

## Testing

### Run Unit Tests

```bash
# All tests
pytest apps/inventory/tests/ -v

# Specific test file
pytest apps/inventory/tests/test_models.py -v
pytest apps/inventory/tests/test_api.py -v

# With coverage
pytest apps/inventory/tests/ --cov=apps.inventory --cov-report=html
```

### Manual API Testing

Test endpoints using curl or Postman:

```bash
# Get authentication token
TOKEN=$(curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "YOUR_PHONE", "password": "YOUR_PASSWORD"}' \
  | jq -r '.access')

# List inventory items
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/inventory/items/

# Get low stock items
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/inventory/items/low_stock/

# Create stock transaction
curl -X POST http://localhost:8000/api/inventory/transactions/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "item": 1,
    "transaction_type": "purchase",
    "transaction_date": "2025-10-22T10:00:00Z",
    "quantity": "100.00",
    "is_addition": true,
    "unit_cost": "450.00"
  }'
```

## Integration with Production Module

The inventory system automatically integrates with production:

### Automatic Stock Updates

When a production batch is completed:

1. `FinishedGoodsStock` entry is created
2. `StockTransaction` is recorded (type='production')
3. `InventoryItem.current_stock` is updated

### Manual Integration Steps

If you need to manually link products to inventory:

```python
from apps.production.models import Product
from apps.inventory.models import InventoryItem

# Get product
product = Product.objects.get(product_id='PROD-001')

# Create or update inventory item
inventory_item, created = InventoryItem.objects.update_or_create(
    item_id=f'FG-{product.product_id}',
    defaults={
        'name': product.name,
        'item_type': 'finished_good',
        'unit': 'piece',
        'product': product,
        'min_stock_level': Decimal('50.00'),
        'reorder_point': Decimal('100.00'),
    }
)
```

## Monitoring and Maintenance

### Check Stock Levels

```python
# Low stock items
low_stock = InventoryItem.objects.filter(
    current_stock__lt=models.F('min_stock_level'),
    is_active=True
)

# Items at reorder point
reorder_needed = InventoryItem.objects.filter(
    current_stock__lte=models.F('reorder_point'),
    is_active=True
)
```

### Active Alerts

```python
from apps.inventory.models import StockAlert

# Get active alerts
active_alerts = StockAlert.objects.filter(status='active')

# Acknowledge all low stock alerts
for alert in active_alerts.filter(alert_type='low_stock'):
    alert.status = 'acknowledged'
    alert.acknowledged_by = request.user
    alert.acknowledged_at = timezone.now()
    alert.save()
```

### Transaction Reports

```python
from django.db.models import Sum, Count
from apps.inventory.models import StockTransaction

# Total transactions by type
stats = StockTransaction.objects.values('transaction_type').annotate(
    count=Count('id'),
    total_quantity=Sum('quantity')
)

# Wastage report
wastage = StockTransaction.objects.filter(
    transaction_type='wastage',
    transaction_date__gte='2025-01-01'
).aggregate(
    total_wastage=Sum('quantity'),
    total_cost=Sum('total_cost')
)
```

## Troubleshooting

### Issue: Signals not working

**Solution:**
Ensure signals are imported in `apps.py`:

```python
# apps/inventory/apps.py
def ready(self):
    import apps.inventory.signals
```

### Issue: Stock not updating after transaction

**Solution:**
Check that transactions are created through the API ViewSet, not directly in the database. The ViewSet handles stock updates automatically.

### Issue: Duplicate transaction IDs

**Solution:**
The transaction ID generation is atomic. If you encounter duplicates, check that transactions are created sequentially, not in parallel.

### Issue: Migration errors

**Solution:**

```bash
# Check migration status
python manage.py showmigrations inventory

# Fake migration if needed (BE CAREFUL)
python manage.py migrate inventory --fake

# Or rollback and reapply
python manage.py migrate inventory zero
python manage.py migrate inventory
```

## API Documentation

View complete API documentation:

- Swagger UI: `http://localhost:8000/api/docs/`
- ReDoc: `http://localhost:8000/api/redoc/`
- Schema: `http://localhost:8000/api/schema/`

## Next Steps

1. ✅ Install and configure inventory app
2. ✅ Run migrations
3. ✅ Create initial inventory items
4. ✅ Test API endpoints
5. ✅ Configure stock thresholds
6. ✅ Set up user permissions
7. Link products to inventory items
8. Configure automated reports
9. Set up backup procedures
10. Train users on the system

## Support

For additional help:

- Check the [README.md](README.md) for detailed documentation
- Review API documentation at `/api/docs/`
- Contact development team for issues

---

**Setup Complete!** Your inventory management system is now ready to use.
