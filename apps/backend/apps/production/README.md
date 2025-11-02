# Production Management System

Complete production management system for dairy operations including product master data, production batches, and scheduling.

## Features

### 1. Product Management

- Product master data with categories (dairy, sweets, beverages)
- Pricing information (cost price, selling price, profit margin)
- Production specifications (milk requirement, shelf life, storage conditions)
- Multiple unit types (kg, liter, piece, pack)
- Active/inactive product status

### 2. Production Batch Management

- Batch lifecycle management (planned → in_progress → completed)
- Real-time quantity tracking (planned vs actual vs wastage)
- Milk allocation and usage tracking
- Quality control checks and notes
- Yield percentage calculation
- Efficiency scoring
- Supervisor and operator assignment
- Recipe and ingredient details (JSON)
- Production duration tracking

### 3. Production Scheduling

- Future production planning
- Priority-based scheduling
- Milk requirement calculation
- Batch linking and completion tracking
- Date and product-based uniqueness

## Models

### Product

- `product_id`: Unique identifier
- `name`: Product name
- `category`: dairy/sweets/beverages
- `unit`: kg/liter/piece/pack
- `cost_price`: Manufacturing cost
- `selling_price`: Retail price
- `shelf_life_days`: Storage duration
- `milk_required_per_unit`: Milk consumption per unit
- `is_active`: Product status

### ProductionBatch

- `batch_id`: Auto-generated (PB{YYYYMMDD}{0001})
- `product`: Foreign key to Product
- `batch_date`: Production date
- `start_time`, `end_time`: Production duration
- `planned_quantity`, `actual_quantity`, `wastage_quantity`
- `milk_allocated`, `milk_used`
- `status`: planned/in_progress/completed/cancelled
- `yield_percentage`: Auto-calculated (actual/planned \* 100)
- `supervisor`, `operators`: Team assignment
- `quality_check_passed`, `quality_notes`
- `recipe_details`: JSON field for ingredients

### ProductionSchedule

- `schedule_date`: Planned production date
- `product`: Foreign key to Product
- `planned_quantity`: Target quantity
- `priority`: Production priority (1=highest)
- `batch`: Linked production batch

## API Endpoints

### Products

```
GET    /api/production/products/           - List all products
POST   /api/production/products/           - Create product
GET    /api/production/products/{id}/      - Get product details
PUT    /api/production/products/{id}/      - Update product
DELETE /api/production/products/{id}/      - Delete product
GET    /api/production/products/{id}/batches/  - Get product batches
GET    /api/production/products/{id}/stats/    - Get product statistics
```

### Production Batches

```
GET    /api/production/batches/            - List all batches
POST   /api/production/batches/            - Create batch (auto-generates batch_id)
GET    /api/production/batches/{id}/       - Get batch details
PUT    /api/production/batches/{id}/       - Update batch
DELETE /api/production/batches/{id}/       - Delete batch
POST   /api/production/batches/{id}/start/ - Start production
POST   /api/production/batches/{id}/complete/ - Complete production
GET    /api/production/batches/stats/      - Get overall statistics
```

### Production Schedules

```
GET    /api/production/schedules/          - List all schedules
POST   /api/production/schedules/          - Create schedule
GET    /api/production/schedules/{id}/     - Get schedule details
PUT    /api/production/schedules/{id}/     - Update schedule
DELETE /api/production/schedules/{id}/     - Delete schedule
GET    /api/production/schedules/upcoming/ - Get upcoming schedules
GET    /api/production/schedules/today/    - Get today's schedules
```

## Query Parameters

### Filtering

- Products: `category`, `is_active`
- Batches: `product`, `batch_date`, `status`
- Schedules: `schedule_date`, `product`

### Search

- Products: Search by `product_id`, `name`
- Batches: Search by `batch_id`, `product__name`
- Schedules: Search by `product__name`

### Ordering

- Products: Order by `product_id`, `name`, `selling_price`
- Batches: Order by `batch_date`, `planned_quantity`, `status`
- Schedules: Order by `schedule_date`, `priority`

## Usage Examples

### 1. Create a Product

```json
POST /api/production/products/
{
  "product_id": "PRD001",
  "name": "Fresh Paneer",
  "category": "dairy",
  "unit": "kg",
  "cost_price": "200.00",
  "selling_price": "300.00",
  "shelf_life_days": 7,
  "storage_temperature": "2-4°C",
  "milk_required_per_unit": "5.00",
  "is_active": true
}
```

### 2. Create a Production Batch

```json
POST /api/production/batches/
{
  "product": 1,
  "batch_date": "2025-10-22",
  "planned_quantity": "100.00",
  "milk_allocated": "500.00",
  "supervisor": 1
}
```

Response includes auto-generated `batch_id`: "PB202510220001"

### 3. Start Production

```json
POST /api/production/batches/1/start/
```

Sets status to 'in_progress' and records start_time

### 4. Complete Production

```json
POST /api/production/batches/1/complete/
{
  "actual_quantity": "95.00",
  "milk_used": "475.00",
  "wastage_quantity": "2.00",
  "quality_check_passed": true,
  "quality_notes": "Quality meets standards"
}
```

Automatically calculates yield_percentage (95%)

### 5. Create Production Schedule

```json
POST /api/production/schedules/
{
  "schedule_date": "2025-10-23",
  "product": 1,
  "planned_quantity": "150.00",
  "priority": 1,
  "notes": "Priority order for festival season"
}
```

### 6. Get Product Statistics

```
GET /api/production/products/1/stats/?days=30
```

Returns:

- total_batches
- total_quantity_produced
- avg_yield_percentage
- total_milk_used
- completed_batches
- in_progress_batches

## Business Logic

### Batch ID Generation

- Format: `PB{YYYYMMDD}{0001}`
- Auto-increments sequence number per day
- Example: PB202510220001, PB202510220002, etc.

### Yield Percentage Calculation

```
yield_percentage = (actual_quantity / planned_quantity) * 100
```

- Automatically calculated on save
- Can exceed 100% if production is better than planned

### Efficiency Score

```
efficiency = yield_percentage - wastage_percentage
```

- Measures overall production efficiency
- Accounts for both yield and wastage

### Status Transitions

Valid transitions:

- planned → in_progress
- planned → cancelled
- in_progress → completed
- in_progress → cancelled
- completed → (final state)
- cancelled → (final state)

### Milk Requirement

```
required_milk = planned_quantity * product.milk_required_per_unit
```

- Calculated automatically for schedules
- Helps in raw material planning

## Validation Rules

### Product

- `selling_price` must be > 0
- `cost_price` must be > 0
- `milk_required_per_unit` must be >= 0
- `product_id` must be unique

### ProductionBatch

- `planned_quantity` must be > 0
- `actual_quantity` must be >= 0
- `wastage_quantity` must be >= 0
- `end_time` must be after `start_time`
- Status transitions must be valid

### ProductionSchedule

- `planned_quantity` must be > 0
- `priority` must be >= 1
- Unique constraint on (schedule_date, product)

## Permissions

- All endpoints require authentication
- Uses `ProductionPermission` (extends `IsAuthenticated`)
- Can be extended for role-based access control

## Testing

### Run All Tests

```bash
python manage.py test apps.production.tests
```

### Run Specific Test Categories

```bash
# Model tests only
python manage.py test apps.production.tests.test_models

# API tests only
python manage.py test apps.production.tests.test_api
```

### Test Coverage

- 47 tests total
- 100% passing
- Model tests: 19 tests
- API tests: 28 tests

## Database Tables

- `products`: Product master data
- `production_batches`: Production batch records
- `production_batches_operators`: Many-to-many for operators
- `production_schedules`: Production scheduling

## Indexes

- products: product_id, category
- production_batches: batch_id, (product, batch_date), status
- production_schedules: (schedule_date, product)

## Future Enhancements

1. Inventory integration (auto-update stock on batch completion)
2. Cost calculation (materials, labor, overhead)
3. Batch splitting and merging
4. Recipe management with step-by-step instructions
5. Equipment utilization tracking
6. Shift-based production tracking
7. Real-time production monitoring
8. Automated scheduling based on demand forecasting
9. Quality metrics and trends analysis
10. Production reports and analytics

## Integration Points

- **Milk Management**: Milk allocation from available stock
- **Inventory**: Auto-update stock levels on completion
- **Analytics**: Production metrics and KPIs
- **Employees**: Supervisor and operator management

## Admin Interface

All models are registered in Django admin with:

- List displays with key fields
- Filters for quick searching
- Search functionality
- Field grouping in detail views
- Read-only calculated fields

## Notes

- Batch IDs are auto-generated and cannot be changed
- Yield percentage is auto-calculated on save
- Status transitions are validated
- All decimal fields use proper precision (2 decimal places)
- JSONField used for flexible recipe data storage
- Timezone-aware datetime fields for accurate tracking
