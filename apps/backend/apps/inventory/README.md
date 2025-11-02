# Inventory Management System

Complete inventory management module for the Ichhadhari Dairy Management System.

## Overview

The Inventory Management system tracks all inventory items including raw materials, finished goods, packaging materials, and raw milk. It provides comprehensive stock tracking, transaction history, and automated alerting for low stock conditions.

## Features

- **Inventory Items Management**: Track all types of inventory items with detailed information
- **Stock Transactions**: Record all stock movements (purchases, production, sales, wastage, etc.)
- **Raw Material Tracking**: Batch-wise tracking of raw materials with supplier details
- **Finished Goods Tracking**: Track finished goods from production batches
- **Stock Alerts**: Automated alerts for low stock and reorder points
- **Transaction History**: Complete audit trail of all stock movements
- **Stock Level Reports**: Real-time stock level monitoring and reporting

## Models

### 1. InventoryItem

Core inventory item model representing any item in the inventory system.

**Fields:**

- `item_id`: Unique identifier (e.g., "RM-001", "FG-001")
- `name`: Item name
- `item_type`: Type (raw_milk, raw_material, finished_good, packaging)
- `unit`: Unit of measurement (kg, liter, piece, pack, bag, box)
- `current_stock`: Current stock quantity
- `min_stock_level`: Minimum stock level threshold
- `max_stock_level`: Maximum stock level
- `reorder_point`: Reorder point threshold
- `storage_location`: Storage location
- `storage_temperature`: Storage temperature requirements
- `product`: Link to Product model (for finished goods)

**Properties:**

- `is_below_min_stock`: Check if stock is below minimum
- `is_below_reorder_point`: Check if stock is below reorder point

### 2. StockTransaction

Records all stock movements in and out of inventory.

**Fields:**

- `transaction_id`: Auto-generated (format: ST{YYYYMMDD}{0001})
- `item`: Link to InventoryItem
- `transaction_type`: Type (purchase, production, sale, wastage, adjustment, return, transfer)
- `quantity`: Transaction quantity
- `is_addition`: True for IN, False for OUT
- `stock_before`: Stock before transaction
- `stock_after`: Stock after transaction
- `unit_cost`: Cost per unit
- `total_cost`: Total transaction cost
- `batch_number`: Batch number (if applicable)
- `expiry_date`: Expiry date (if applicable)
- `performed_by`: User who performed the transaction

### 3. RawMaterialStock

Tracks batch-wise raw material stock with supplier details.

**Fields:**

- `item`: Link to InventoryItem
- `supplier_name`: Supplier name
- `batch_number`: Batch number
- `purchase_date`: Purchase date
- `expiry_date`: Expiry date
- `quantity`: Quantity purchased
- `cost_per_unit`: Cost per unit
- `total_cost`: Total cost

### 4. FinishedGoodsStock

Tracks finished goods from production with quality details.

**Fields:**

- `item`: Link to InventoryItem
- `batch`: Link to ProductionBatch
- `quantity`: Quantity produced
- `production_date`: Production date
- `expiry_date`: Expiry date
- `quality_check_passed`: Quality check status
- `shop_location`: Shop location
- `is_sold`: Sale status

### 5. StockAlert

Alerts for low stock, expiring items, and other inventory issues.

**Fields:**

- `item`: Link to InventoryItem
- `alert_type`: Type (low_stock, reorder_point, expiring_soon, expired)
- `status`: Status (active, acknowledged, resolved)
- `message`: Alert message
- `acknowledged_by`: User who acknowledged
- `resolved_by`: User who resolved

## API Endpoints

### Inventory Items

- `GET /api/inventory/items/` - List all inventory items
- `POST /api/inventory/items/` - Create new inventory item
- `GET /api/inventory/items/{id}/` - Retrieve inventory item details
- `PUT/PATCH /api/inventory/items/{id}/` - Update inventory item
- `DELETE /api/inventory/items/{id}/` - Delete inventory item
- `GET /api/inventory/items/low_stock/` - Get items below minimum stock
- `GET /api/inventory/items/stock_levels/` - Get stock level summary
- `GET /api/inventory/items/{id}/transaction_history/` - Get transaction history

### Stock Transactions

- `GET /api/inventory/transactions/` - List all transactions
- `POST /api/inventory/transactions/` - Create new transaction
- `GET /api/inventory/transactions/{id}/` - Retrieve transaction details
- `GET /api/inventory/transactions/stats/` - Get transaction statistics

### Raw Material Stock

- `GET /api/inventory/raw-materials/` - List raw material batches
- `GET /api/inventory/raw-materials/{id}/` - Retrieve batch details

### Finished Goods Stock

- `GET /api/inventory/finished-goods/` - List finished goods
- `GET /api/inventory/finished-goods/{id}/` - Retrieve finished goods details

### Stock Alerts

- `GET /api/inventory/alerts/` - List all alerts
- `POST /api/inventory/alerts/` - Create new alert
- `GET /api/inventory/alerts/{id}/` - Retrieve alert details
- `POST /api/inventory/alerts/{id}/acknowledge/` - Acknowledge alert
- `POST /api/inventory/alerts/{id}/resolve/` - Resolve alert

## Usage Examples

### Creating an Inventory Item

```python
POST /api/inventory/items/
{
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
}
```

### Creating a Stock Transaction

```python
POST /api/inventory/transactions/
{
    "item": 1,
    "transaction_type": "purchase",
    "transaction_date": "2025-10-22T10:30:00Z",
    "quantity": "100.00",
    "is_addition": true,
    "unit_cost": "450.00",
    "batch_number": "BATCH-001",
    "notes": "Purchase from Supplier ABC"
}
```

**Note:** The system automatically:

- Generates `transaction_id` (e.g., ST202510220001)
- Calculates `stock_before`, `stock_after`, and `total_cost`
- Updates `InventoryItem.current_stock`
- Creates alerts if stock falls below thresholds

### Getting Low Stock Items

```python
GET /api/inventory/items/low_stock/

Response:
{
    "count": 3,
    "results": [
        {
            "id": 1,
            "item_id": "RM-001",
            "name": "Whole Milk Powder",
            "current_stock": "85.00",
            "min_stock_level": "100.00",
            "is_below_min_stock": true
        }
    ]
}
```

### Acknowledging an Alert

```python
POST /api/inventory/alerts/1/acknowledge/

Response:
{
    "id": 1,
    "item": 1,
    "alert_type": "low_stock",
    "status": "acknowledged",
    "acknowledged_by": 1,
    "acknowledged_at": "2025-10-22T11:00:00Z"
}
```

## Signals

### 1. Stock Transaction Signal

**Trigger:** After creating a `StockTransaction`
**Action:**

- Creates `StockAlert` if item is below minimum stock level
- Creates `StockAlert` if item is below reorder point

### 2. Production Batch Completion Signal

**Trigger:** When `ProductionBatch.status` changes to 'completed'
**Action:**

- Creates `FinishedGoodsStock` entry
- Creates `StockTransaction` (type='production')
- Updates `InventoryItem.current_stock`

### 3. Inventory Item Update Signal

**Trigger:** When `InventoryItem` is updated
**Action:**

- Auto-resolves low stock alerts if stock is now above thresholds

## Filters and Search

### Inventory Items

- **Filters:** `item_type`, `is_active`
- **Search:** `item_id`, `name`
- **Ordering:** `item_id`, `current_stock`, `created_at`

### Stock Transactions

- **Filters:** `item`, `transaction_type`, `transaction_date`
- **Search:** `transaction_id`, `item__name`, `batch_number`
- **Ordering:** `transaction_date`, `created_at`

### Stock Alerts

- **Filters:** `alert_type`, `status`, `item`
- **Search:** `item__name`, `message`
- **Ordering:** `created_at`

## Testing

Run the inventory tests:

```bash
# Run all inventory tests
pytest apps/inventory/tests/ -v

# Run model tests only
pytest apps/inventory/tests/test_models.py -v

# Run API tests only
pytest apps/inventory/tests/test_api.py -v

# Run with coverage
pytest apps/inventory/tests/ --cov=apps.inventory --cov-report=html
```

## Database Migrations

Create and apply migrations:

```bash
# Create migrations
python manage.py makemigrations inventory

# Apply migrations
python manage.py migrate inventory

# Check migration status
python manage.py showmigrations inventory
```

## Admin Interface

All models are registered in the Django admin with comprehensive list displays, filters, and search functionality:

- **InventoryItem**: View and manage all inventory items
- **StockTransaction**: View transaction history with filters
- **RawMaterialStock**: Manage raw material batches
- **FinishedGoodsStock**: Track finished goods
- **StockAlert**: Monitor and manage alerts

Access admin at: `http://localhost:8000/admin/`

## Integration with Other Modules

### Production Module

- Automatically creates `FinishedGoodsStock` when production batches are completed
- Links finished goods to `ProductionBatch` for traceability

### Milk Management Module

- Can track raw milk as inventory items
- Integration for milk collection to inventory

## Best Practices

1. **Always use transactions through API**: Don't manually update `current_stock`
2. **Set appropriate thresholds**: Configure `min_stock_level` and `reorder_point`
3. **Monitor alerts**: Regularly check and resolve stock alerts
4. **Use batch numbers**: Always include batch numbers for traceability
5. **Regular audits**: Use transaction history for stock audits

## Troubleshooting

### Stock Discrepancies

If stock levels don't match:

1. Check transaction history: `/api/inventory/items/{id}/transaction_history/`
2. Verify all transactions are recorded
3. Use adjustment transactions to correct discrepancies

### Missing Alerts

If alerts are not being generated:

1. Verify signals are properly configured in `apps.py`
2. Check `min_stock_level` and `reorder_point` are set
3. Ensure transactions are created through the API (not direct DB updates)

### Negative Stock Prevention

The system prevents negative stock through:

- Validation in serializers
- Stock checks in views
- Constraints in models

## Future Enhancements

- [ ] Barcode/QR code scanning for items
- [ ] Expiry date tracking and alerts
- [ ] Stock transfer between locations
- [ ] Inventory valuation reports (FIFO, LIFO, Average)
- [ ] Integration with purchase orders
- [ ] Mobile app for stock counting
- [ ] Automated reorder suggestions
- [ ] Supplier performance tracking

## Support

For issues or questions, please contact the development team or create an issue in the repository.
