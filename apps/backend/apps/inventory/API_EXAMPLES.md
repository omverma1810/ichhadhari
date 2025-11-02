# Inventory Management API Examples

Complete API usage examples for the Inventory Management system.

## Authentication

All API requests require authentication. First, obtain a JWT token:

```bash
# Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "1234567890",
    "password": "yourpassword"
  }'

# Response
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {...}
}

# Use the access token in subsequent requests
TOKEN="eyJ0eXAiOiJKV1QiLCJhbGc..."
```

## Inventory Items

### 1. List All Inventory Items

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/inventory/items/
```

**Response:**

```json
{
  "count": 10,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "item_id": "RM-001",
      "name": "Whole Milk Powder",
      "item_type": "raw_material",
      "unit": "kg",
      "current_stock": "500.00",
      "min_stock_level": "100.00",
      "reorder_point": "150.00",
      "is_active": true,
      "product_name": null,
      "is_below_min_stock": false
    }
  ]
}
```

### 2. Create Inventory Item

```bash
curl -X POST http://localhost:8000/api/inventory/items/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "item_id": "RM-005",
    "name": "Cocoa Powder",
    "item_type": "raw_material",
    "description": "Premium cocoa powder for chocolate milk",
    "unit": "kg",
    "cost_per_unit": "850.00",
    "current_stock": "50.00",
    "min_stock_level": "20.00",
    "max_stock_level": "100.00",
    "reorder_point": "30.00",
    "storage_location": "Dry Storage A",
    "storage_temperature": "Room Temperature"
  }'
```

### 3. Get Inventory Item Details

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/inventory/items/1/
```

### 4. Update Inventory Item

```bash
curl -X PATCH http://localhost:8000/api/inventory/items/1/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "min_stock_level": "120.00",
    "reorder_point": "180.00"
  }'
```

### 5. Filter by Item Type

```bash
# Get only raw materials
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/api/inventory/items/?item_type=raw_material"

# Get only active items
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/api/inventory/items/?is_active=true"

# Combine filters
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/api/inventory/items/?item_type=packaging&is_active=true"
```

### 6. Search Items

```bash
# Search by name or item_id
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/api/inventory/items/?search=milk"
```

### 7. Get Low Stock Items

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/inventory/items/low_stock/
```

**Response:**

```json
{
  "count": 2,
  "results": [
    {
      "id": 3,
      "item_id": "RM-003",
      "name": "Cultures & Enzymes",
      "current_stock": "3.00",
      "min_stock_level": "5.00",
      "is_below_min_stock": true
    }
  ]
}
```

### 8. Get Stock Levels Summary

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/inventory/items/stock_levels/
```

**Response:**

```json
{
  "total_items": 10,
  "low_stock_items": 2,
  "reorder_point_items": 3,
  "items": [
    {
      "id": 1,
      "item_id": "RM-001",
      "name": "Whole Milk Powder",
      "item_type": "raw_material",
      "current_stock": 500.0,
      "unit": "kg",
      "min_stock_level": 100.0,
      "reorder_point": 150.0,
      "is_below_min_stock": false,
      "is_below_reorder_point": false
    }
  ]
}
```

### 9. Get Transaction History for Item

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/inventory/items/1/transaction_history/

# With date range
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/api/inventory/items/1/transaction_history/?start_date=2025-10-01&end_date=2025-10-31"
```

## Stock Transactions

### 1. Create Purchase Transaction (Stock IN)

```bash
curl -X POST http://localhost:8000/api/inventory/transactions/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "item": 1,
    "transaction_type": "purchase",
    "transaction_date": "2025-10-22T10:30:00Z",
    "quantity": "100.00",
    "is_addition": true,
    "unit_cost": "450.00",
    "batch_number": "BATCH-20251022-001",
    "notes": "Purchase from Supplier ABC"
  }'
```

**Response:**

```json
{
  "id": 15,
  "transaction_id": "ST202510220001",
  "item": 1,
  "item_name": "Whole Milk Powder",
  "transaction_type": "purchase",
  "transaction_date": "2025-10-22T10:30:00Z",
  "quantity": "100.00",
  "is_addition": true,
  "stock_before": "500.00",
  "stock_after": "600.00",
  "unit_cost": "450.00",
  "total_cost": "45000.00",
  "batch_number": "BATCH-20251022-001",
  "performed_by": 1,
  "performed_by_name": "Admin User",
  "notes": "Purchase from Supplier ABC"
}
```

### 2. Create Sale Transaction (Stock OUT)

```bash
curl -X POST http://localhost:8000/api/inventory/transactions/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "item": 1,
    "transaction_type": "sale",
    "transaction_date": "2025-10-22T14:00:00Z",
    "quantity": "50.00",
    "is_addition": false,
    "unit_cost": "450.00",
    "notes": "Sale to Customer XYZ"
  }'
```

### 3. Create Wastage Transaction

```bash
curl -X POST http://localhost:8000/api/inventory/transactions/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "item": 1,
    "transaction_type": "wastage",
    "transaction_date": "2025-10-22T16:00:00Z",
    "quantity": "5.00",
    "is_addition": false,
    "unit_cost": "450.00",
    "notes": "Damaged during handling"
  }'
```

### 4. Create Adjustment Transaction

```bash
curl -X POST http://localhost:8000/api/inventory/transactions/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "item": 1,
    "transaction_type": "adjustment",
    "transaction_date": "2025-10-22T18:00:00Z",
    "quantity": "10.00",
    "is_addition": true,
    "unit_cost": "0.00",
    "notes": "Stock count adjustment after physical verification"
  }'
```

### 5. List Transactions

```bash
# All transactions
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/inventory/transactions/

# Filter by item
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/api/inventory/transactions/?item=1"

# Filter by type
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/api/inventory/transactions/?transaction_type=purchase"

# Filter by date
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/api/inventory/transactions/?transaction_date=2025-10-22"

# Search
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/api/inventory/transactions/?search=ST20251022"
```

### 6. Get Transaction Statistics

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/inventory/transactions/stats/

# With date range
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/api/inventory/transactions/stats/?start_date=2025-10-01&end_date=2025-10-31"
```

**Response:**

```json
{
  "total_transactions": 25,
  "total_in": 1500.0,
  "total_out": 450.0,
  "total_wastage": 15.0,
  "by_type": {
    "purchase": {
      "count": 10,
      "quantity": 1200.0
    },
    "production": {
      "count": 5,
      "quantity": 300.0
    },
    "sale": {
      "count": 8,
      "quantity": 400.0
    },
    "wastage": {
      "count": 2,
      "quantity": 15.0
    }
  }
}
```

## Stock Alerts

### 1. List All Alerts

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/inventory/alerts/
```

### 2. Filter Alerts

```bash
# Active alerts only
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/api/inventory/alerts/?status=active"

# Low stock alerts
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/api/inventory/alerts/?alert_type=low_stock"

# By item
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/api/inventory/alerts/?item=1"
```

### 3. Create Manual Alert

```bash
curl -X POST http://localhost:8000/api/inventory/alerts/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "item": 1,
    "alert_type": "expiring_soon",
    "message": "Batch BATCH-001 expiring in 7 days"
  }'
```

### 4. Acknowledge Alert

```bash
curl -X POST http://localhost:8000/api/inventory/alerts/5/acknowledge/ \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**

```json
{
  "id": 5,
  "item": 1,
  "item_name": "Whole Milk Powder",
  "alert_type": "low_stock",
  "status": "acknowledged",
  "message": "Stock for Whole Milk Powder is below minimum level...",
  "acknowledged_by": 1,
  "acknowledged_by_name": "Admin User",
  "acknowledged_at": "2025-10-22T11:00:00Z"
}
```

### 5. Resolve Alert

```bash
curl -X POST http://localhost:8000/api/inventory/alerts/5/resolve/ \
  -H "Authorization: Bearer $TOKEN"
```

## Raw Material Stock

### 1. List Raw Material Batches

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/inventory/raw-materials/
```

### 2. Filter by Item

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/api/inventory/raw-materials/?item=1"
```

### 3. Search by Batch or Supplier

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/api/inventory/raw-materials/?search=ABC"
```

## Finished Goods Stock

### 1. List Finished Goods

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/inventory/finished-goods/
```

### 2. Filter by Status

```bash
# Unsold items only
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/api/inventory/finished-goods/?is_sold=false"

# Quality passed items
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/api/inventory/finished-goods/?quality_check_passed=true"
```

### 3. Filter by Batch

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/api/inventory/finished-goods/?batch=1"
```

## Advanced Examples

### 1. Daily Stock Report

```bash
#!/bin/bash
# get_daily_stock_report.sh

TOKEN="your_token_here"
DATE=$(date +%Y-%m-%d)

echo "Daily Stock Report - $DATE"
echo "================================"

# Get low stock items
echo -e "\nLow Stock Items:"
curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/inventory/items/low_stock/ \
  | jq '.results[] | "\(.item_id): \(.name) - \(.current_stock) \(.unit)"'

# Get active alerts
echo -e "\nActive Alerts:"
curl -s -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/api/inventory/alerts/?status=active" \
  | jq '.results[] | "\(.alert_type): \(.item_name)"'

# Get today's transactions
echo -e "\nToday's Transactions:"
curl -s -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/api/inventory/transactions/?transaction_date=$DATE" \
  | jq '.results[] | "\(.transaction_id): \(.transaction_type) - \(.quantity) \(.item_name)"'
```

### 2. Bulk Stock Update

```python
import requests
import json

TOKEN = "your_token_here"
BASE_URL = "http://localhost:8000"
headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

# List of items to restock
restock_items = [
    {"item_id": 1, "quantity": 100, "unit_cost": 450},
    {"item_id": 2, "quantity": 50, "unit_cost": 40},
    {"item_id": 3, "quantity": 5, "unit_cost": 2500},
]

for item_data in restock_items:
    transaction = {
        "item": item_data["item_id"],
        "transaction_type": "purchase",
        "transaction_date": "2025-10-22T10:00:00Z",
        "quantity": str(item_data["quantity"]),
        "is_addition": True,
        "unit_cost": str(item_data["unit_cost"]),
        "notes": "Bulk purchase order"
    }

    response = requests.post(
        f"{BASE_URL}/api/inventory/transactions/",
        headers=headers,
        json=transaction
    )

    if response.status_code == 201:
        print(f"✓ Created transaction: {response.json()['transaction_id']}")
    else:
        print(f"✗ Error: {response.text}")
```

### 3. Stock Valuation Report

```bash
# Get stock valuation
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/inventory/items/ \
  | jq '[.results[] | {
      item: .item_id,
      name: .name,
      stock: .current_stock,
      cost: .cost_per_unit,
      value: (.current_stock * .cost_per_unit)
    }] | {
      items: .,
      total_value: ([.[].value] | add)
    }'
```

## Error Handling

### Insufficient Stock Error

```bash
# Attempting to remove more stock than available
curl -X POST http://localhost:8000/api/inventory/transactions/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "item": 1,
    "transaction_type": "sale",
    "transaction_date": "2025-10-22T10:00:00Z",
    "quantity": "10000.00",
    "is_addition": false,
    "unit_cost": "450.00"
  }'
```

**Response (400 Bad Request):**

```json
{
  "non_field_errors": [
    "Insufficient stock. Current stock: 500.00, requested: 10000.00"
  ]
}
```

### Invalid Quantity Error

```bash
# Negative or zero quantity
curl -X POST http://localhost:8000/api/inventory/transactions/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "item": 1,
    "quantity": "-10.00",
    ...
  }'
```

**Response (400 Bad Request):**

```json
{
  "quantity": ["Quantity must be greater than 0."]
}
```

## Testing with Postman

Import this as a Postman collection:

```json
{
  "info": {
    "name": "Inventory Management API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get All Items",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/api/inventory/items/"
      }
    },
    {
      "name": "Create Transaction",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/api/inventory/transactions/",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"item\": 1,\n  \"transaction_type\": \"purchase\",\n  \"quantity\": \"100.00\",\n  \"is_addition\": true,\n  \"unit_cost\": \"450.00\"\n}"
        }
      }
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:8000"
    },
    {
      "key": "token",
      "value": "your_token_here"
    }
  ]
}
```

---

For more examples and documentation:

- API Documentation: http://localhost:8000/api/docs/
- README: apps/inventory/README.md
- Quick Reference: apps/inventory/QUICK_REFERENCE.md
