# Inventory Management - Quick Reference

## 🚀 Quick Start

```bash
# 1. Run migrations
python manage.py migrate inventory

# 2. Create sample data
python manage.py create_sample_inventory

# 3. Start server
python manage.py runserver

# 4. Access API
# http://localhost:8000/api/inventory/
```

## 📋 Common Operations

### Create Inventory Item

```bash
POST /api/inventory/items/
{
    "item_id": "RM-001",
    "name": "Milk Powder",
    "item_type": "raw_material",
    "unit": "kg",
    "cost_per_unit": "450.00",
    "current_stock": "500.00",
    "min_stock_level": "100.00",
    "reorder_point": "150.00"
}
```

### Create Stock Transaction

```bash
POST /api/inventory/transactions/
{
    "item": 1,
    "transaction_type": "purchase",
    "transaction_date": "2025-10-22T10:00:00Z",
    "quantity": "100.00",
    "is_addition": true,
    "unit_cost": "450.00"
}
```

### Get Low Stock Items

```bash
GET /api/inventory/items/low_stock/
```

### Get Stock Levels Summary

```bash
GET /api/inventory/items/stock_levels/
```

### Get Transaction History

```bash
GET /api/inventory/items/{id}/transaction_history/
```

### Acknowledge Alert

```bash
POST /api/inventory/alerts/{id}/acknowledge/
```

### Resolve Alert

```bash
POST /api/inventory/alerts/{id}/resolve/
```

## 🔑 Key Endpoints

| Endpoint                                  | Method                  | Description       |
| ----------------------------------------- | ----------------------- | ----------------- |
| `/api/inventory/items/`                   | GET, POST               | List/Create items |
| `/api/inventory/items/{id}/`              | GET, PUT, PATCH, DELETE | Item details      |
| `/api/inventory/items/low_stock/`         | GET                     | Low stock items   |
| `/api/inventory/items/stock_levels/`      | GET                     | Stock summary     |
| `/api/inventory/transactions/`            | GET, POST               | Transactions      |
| `/api/inventory/transactions/stats/`      | GET                     | Transaction stats |
| `/api/inventory/alerts/`                  | GET, POST               | Alerts            |
| `/api/inventory/alerts/{id}/acknowledge/` | POST                    | Acknowledge alert |
| `/api/inventory/alerts/{id}/resolve/`     | POST                    | Resolve alert     |

## 📊 Models Quick Reference

### InventoryItem

- `item_id`: Unique identifier
- `name`: Item name
- `item_type`: raw_milk, raw_material, finished_good, packaging
- `unit`: kg, liter, piece, pack, bag, box
- `current_stock`: Current quantity
- `min_stock_level`: Minimum threshold
- `reorder_point`: Reorder threshold

### StockTransaction

- `transaction_id`: Auto-generated (ST{YYYYMMDD}{0001})
- `transaction_type`: purchase, production, sale, wastage, adjustment, return, transfer
- `quantity`: Amount
- `is_addition`: true (IN) or false (OUT)
- `stock_before/after`: Automatic
- `total_cost`: Automatic (quantity × unit_cost)

### StockAlert

- `alert_type`: low_stock, reorder_point, expiring_soon, expired
- `status`: active, acknowledged, resolved
- `item`: Related inventory item

## 🔍 Filters & Search

### Inventory Items

- **Filter:** `?item_type=raw_material&is_active=true`
- **Search:** `?search=milk`
- **Order:** `?ordering=-current_stock`

### Stock Transactions

- **Filter:** `?transaction_type=purchase&item=1`
- **Search:** `?search=ST20251022`
- **Order:** `?ordering=-transaction_date`

### Stock Alerts

- **Filter:** `?alert_type=low_stock&status=active`
- **Search:** `?search=milk`

## 🧪 Testing

```bash
# All tests
pytest apps/inventory/tests/ -v

# Specific tests
pytest apps/inventory/tests/test_models.py -v
pytest apps/inventory/tests/test_api.py -v

# With coverage
pytest apps/inventory/tests/ --cov=apps.inventory
```

## 🛠️ Management Commands

```bash
# Create sample inventory items
python manage.py create_sample_inventory
```

## 🔐 Permissions Required

- `inventory.view_inventoryitem`
- `inventory.add_inventoryitem`
- `inventory.change_inventoryitem`
- `inventory.add_stocktransaction`
- `inventory.view_stockalert`
- `inventory.change_stockalert`

## ⚠️ Important Notes

1. **Always create transactions via API** - Never update `current_stock` directly
2. **Transaction ID is auto-generated** - Don't provide it in POST
3. **Stock validation** - System prevents negative stock
4. **Alerts are automatic** - Created by signals when stock is low
5. **Production integration** - Finished goods auto-created on batch completion

## 📚 Documentation

- **Full docs:** `apps/inventory/README.md`
- **Setup guide:** `apps/inventory/SETUP_GUIDE.md`
- **API docs:** `http://localhost:8000/api/docs/`
- **Admin:** `http://localhost:8000/admin/`

## 🐛 Troubleshooting

### Stock not updating?

- Ensure using API endpoint, not direct DB update
- Check transaction was created successfully
- Verify `stock_after` was calculated

### Alerts not generating?

- Check signals are imported in `apps.py`
- Verify thresholds are set (`min_stock_level`, `reorder_point`)
- Ensure transaction was created via API

### Permission denied?

- Check user authentication token
- Verify user has required permissions
- Check IsAuthenticated permission class

## 🔗 Related Modules

- **Production:** Auto-creates finished goods inventory
- **Milk Management:** Can track raw milk as inventory
- **Authentication:** User tracking in transactions

## 📞 Quick Help

```python
# Django shell quick commands
python manage.py shell

from apps.inventory.models import InventoryItem, StockTransaction, StockAlert

# Get low stock items
InventoryItem.objects.filter(current_stock__lt=F('min_stock_level'))

# Get active alerts
StockAlert.objects.filter(status='active')

# Get recent transactions
StockTransaction.objects.order_by('-transaction_date')[:10]
```

---

**For detailed information, see:**

- README.md - Complete documentation
- SETUP_GUIDE.md - Installation guide
- IMPLEMENTATION_SUMMARY.md - Technical details
