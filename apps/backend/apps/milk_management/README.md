# Milk Management System

Complete milk collection, supplier management, and payment processing system for dairy operations.

## 📋 Overview

The Milk Management system provides comprehensive functionality for:

- **Supplier Management**: Track farmers and cooperatives supplying milk
- **Milk Collection**: Record daily milk collections with quality parameters
- **Payment Processing**: Manage payments to suppliers with multiple payment methods

## 🏗️ Architecture

### Models

#### 1. **Supplier**

Represents milk suppliers (farmers or cooperatives).

**Key Fields:**

- `supplier_id`: Unique identifier
- `name`: Supplier name
- `supplier_type`: farmer | cooperative
- `status`: active | inactive | suspended
- `route_name`: Collection route
- `payment_cycle`: daily | weekly | fortnightly | monthly
- `avg_quality_score`: Auto-calculated average quality
- `outstanding_balance`: Amount pending payment

#### 2. **MilkCollection**

Records individual milk collection transactions.

**Key Fields:**

- `collection_id`: Auto-generated (MC{YYYYMMDD}{0001})
- `supplier`: Foreign key to Supplier
- `quantity`: Liters collected
- `fat_percentage`: Fat content
- `snf_percentage`: SNF (Solids Not Fat) content
- `temperature`: Milk temperature
- `quality_score`: Auto-calculated (0-100)
- `rate_per_liter`: Price per liter
- `total_amount`: Auto-calculated

**Quality Score Calculation:**

```
Fat Score: (fat_percentage / 6.0) * 50 (max 50 points)
SNF Score: (snf_percentage / 9.0) * 30 (max 30 points)
Temperature Score: 20 points if 2-6°C, else 0
Total: 0-100 points
```

#### 3. **MilkPayment**

Tracks payments made to suppliers.

**Key Fields:**

- `payment_id`: Auto-generated (MP{YYYYMMDD}{0001})
- `supplier`: Foreign key to Supplier
- `amount`: Payment amount
- `payment_method`: cash | bank_transfer | upi | cheque
- `status`: pending | completed | failed
- `collections`: Many-to-many to MilkCollection

## 🚀 API Endpoints

### Suppliers

```
GET    /api/milk/suppliers/              - List all suppliers
POST   /api/milk/suppliers/              - Create supplier
GET    /api/milk/suppliers/{id}/         - Get supplier details
PATCH  /api/milk/suppliers/{id}/         - Update supplier
DELETE /api/milk/suppliers/{id}/         - Delete supplier
GET    /api/milk/suppliers/{id}/collections/  - Get supplier's collections
GET    /api/milk/suppliers/{id}/stats/   - Get supplier statistics
GET    /api/milk/suppliers/by_route/     - Group suppliers by route
```

**Query Parameters:**

- `status`: Filter by status (active, inactive, suspended)
- `supplier_type`: Filter by type (farmer, cooperative)
- `route_name`: Filter by route
- `search`: Search by ID, name, or phone

### Collections

```
GET    /api/milk/collections/            - List all collections
POST   /api/milk/collections/            - Create collection
GET    /api/milk/collections/{id}/       - Get collection details
PATCH  /api/milk/collections/{id}/       - Update collection
DELETE /api/milk/collections/{id}/       - Delete collection
GET    /api/milk/collections/stats/      - Get collection statistics
GET    /api/milk/collections/by_supplier/ - Group by supplier
GET    /api/milk/collections/today/      - Get today's collections
```

**Query Parameters:**

- `supplier`: Filter by supplier ID
- `collection_date`: Filter by date
- `milk_type`: Filter by type (cow, buffalo, mixed)
- `quality_status`: Filter by status (accepted, rejected, conditional)
- `days`: Period for statistics (default: 7)

### Payments

```
GET    /api/milk/payments/               - List all payments
POST   /api/milk/payments/               - Create payment
GET    /api/milk/payments/{id}/          - Get payment details
PATCH  /api/milk/payments/{id}/          - Update payment
DELETE /api/milk/payments/{id}/          - Delete payment
GET    /api/milk/payments/pending/       - Get pending payments
POST   /api/milk/payments/{id}/mark_completed/ - Mark as completed
POST   /api/milk/payments/{id}/mark_failed/    - Mark as failed
GET    /api/milk/payments/stats/         - Get payment statistics
```

**Query Parameters:**

- `supplier`: Filter by supplier ID
- `payment_date`: Filter by date
- `payment_method`: Filter by method
- `status`: Filter by status (pending, completed, failed)

## 💻 Usage Examples

### Create a Supplier

```bash
curl -X POST http://localhost:8000/api/milk/suppliers/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "supplier_id": "SUP001",
    "name": "John Farmer",
    "supplier_type": "farmer",
    "phone": "+1234567890",
    "address": "123 Farm Road",
    "route_name": "Route A",
    "collection_time": "06:00:00",
    "payment_cycle": "monthly",
    "bank_name": "XYZ Bank",
    "account_number": "1234567890"
  }'
```

### Record Milk Collection

```bash
curl -X POST http://localhost:8000/api/milk/collections/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "supplier": 1,
    "collection_date": "2025-10-21",
    "collection_time": "06:30:00",
    "milk_type": "cow",
    "quantity": "15.5",
    "fat_percentage": "4.5",
    "snf_percentage": "8.5",
    "temperature": "4.0",
    "rate_per_liter": "35.00"
  }'
```

**Response:**

```json
{
  "id": 1,
  "collection_id": "MC202510210001",
  "supplier": 1,
  "supplier_name": "John Farmer",
  "quantity": "15.50",
  "quality_score": "85.83",
  "total_amount": "542.50"
}
```

### Get Collection Statistics

```bash
curl -X GET "http://localhost:8000/api/milk/collections/stats/?days=7" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**

```json
{
  "total_quantity": "105.50",
  "avg_fat": "4.45",
  "avg_snf": "8.52",
  "avg_quality_score": "84.20",
  "total_amount": "3692.50",
  "collection_count": 7,
  "supplier_count": 3,
  "start_date": "2025-10-14",
  "end_date": "2025-10-21"
}
```

### Process Payment

```bash
curl -X POST http://localhost:8000/api/milk/payments/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "supplier": 1,
    "payment_date": "2025-10-21",
    "amount": "5000.00",
    "payment_method": "bank_transfer",
    "period_start": "2025-10-01",
    "period_end": "2025-10-21",
    "transaction_reference": "TXN123456"
  }'
```

### Mark Payment as Completed

```bash
curl -X POST http://localhost:8000/api/milk/payments/1/mark_completed/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔒 Permissions

All endpoints require authentication and appropriate permissions:

- **View**: Can list and retrieve data
- **Manage**: Can create, update, and delete records

Permissions are checked using the `MilkManagementPermission` class:

- Admins and superusers have full access
- Other users must have `milk_management.view` or `milk_management.manage` permissions

## 🧪 Testing

### Run All Tests

```bash
cd /Users/apple/Desktop/ichhadhari/apps/backend
python manage.py test apps.milk_management
```

### Run Specific Test Files

```bash
# Model tests
python manage.py test apps.milk_management.tests.test_models

# API tests
python manage.py test apps.milk_management.tests.test_api
```

### Run with Coverage

```bash
coverage run --source='apps.milk_management' manage.py test apps.milk_management
coverage report
coverage html
```

## 📊 Business Logic

### Automatic Calculations

1. **Quality Score**: Calculated automatically based on fat, SNF, and temperature
2. **Total Amount**: quantity × rate_per_liter
3. **Supplier Metrics**: Updated via signals when collections are saved

### Validation Rules

1. **Supplier**:
   - Bank details required for non-daily payment cycles
   - Unique supplier_id
2. **MilkCollection**:

   - Quantity must be > 0
   - Percentages must be 0-100
   - Temperature must be reasonable (< 50°C)
   - Unique combination of supplier, date, and time
   - Rejection reason required if status is 'rejected'

3. **MilkPayment**:
   - Period end must be >= period start
   - UPI payments require transaction ID
   - Cheque payments require cheque number
   - Bank transfers require reference

### Signals

**post_save on MilkCollection**:

- Updates supplier's total_milk_supplied
- Recalculates supplier's avg_quality_score
- Updates outstanding_balance for accepted collections

**post_delete on MilkCollection**:

- Recalculates all supplier metrics after deletion

## 🔧 Configuration

### Add to INSTALLED_APPS

```python
INSTALLED_APPS = [
    # ...
    'apps.milk_management',
    # ...
]
```

### Include URLs

```python
# In dairy/urls.py
urlpatterns = [
    # ...
    path('api/milk/', include('apps.milk_management.urls')),
    # ...
]
```

### Run Migrations

```bash
python manage.py makemigrations milk_management
python manage.py migrate milk_management
```

## 📈 Performance Considerations

1. **Query Optimization**:
   - Uses `select_related()` for foreign keys
   - Uses `prefetch_related()` for many-to-many relationships
2. **Database Indexes**:
   - Indexed fields: supplier_id, collection_id, payment_id
   - Composite indexes on frequently queried combinations
3. **List Serializers**:
   - Lightweight serializers for list views
   - Full serializers only for detail views

## 🎯 Future Enhancements

- [ ] SMS notifications to suppliers on collection/payment
- [ ] Automatic rate calculation based on quality score
- [ ] BMC (Bulk Milk Cooler) integration
- [ ] Mobile app for collection staff
- [ ] Automated payment processing
- [ ] Report generation (PDF/Excel)
- [ ] Dashboard analytics

## 📝 Notes

- Collection and payment IDs are auto-generated in format MC{YYYYMMDD}{0001} and MP{YYYYMMDD}{0001}
- Quality scores are calculated using industry-standard formulas
- Supplier metrics are updated automatically via signals
- All monetary values use DecimalField for precision

## 🐛 Troubleshooting

### Issue: Supplier metrics not updating

**Solution**: Ensure signals are loaded by checking `apps.py` has:

```python
def ready(self):
    import apps.milk_management.signals
```

### Issue: Permission denied errors

**Solution**: Ensure user has appropriate role or permissions:

```python
user.role = 'admin'  # or
user.permissions = {'milk_management': {'view': True, 'manage': True}}
```

### Issue: Duplicate collection ID

**Solution**: IDs are auto-generated. Don't include collection_id in POST requests.

## 📚 Related Documentation

- [Authentication System](../authentication/README.md)
- [Core Models](../core/models.py)
- [API Documentation](http://localhost:8000/api/docs/)

---

**Version**: 1.0.0  
**Last Updated**: October 21, 2025
