# 🎯 ULTIMATE API INTEGRATION - Complete & Perfect

## 📋 PROJECT SPECIFICATIONS

**Backend API:** `https://ichhadhari-backend-162541991773.asia-south1.run.app`
**API Documentation:** `https://ichhadhari-backend-162541991773.asia-south1.run.app/api/docs/`
**Authentication:** JWT Bearer Token
**Response Format:** JSON
**Content-Type:** application/json

---

## 🔐 AUTHENTICATION ENDPOINTS

### 1. Login (POST /api/auth/login/)

**Request:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (200 OK):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "username": "omverma",
    "email": "omverma1234q@gmail.com",
    "first_name": "Om",
    "last_name": "Verma"
  }
}
```

### 2. Logout (POST /api/auth/logout/)

**Request Headers:**
```
Authorization: Bearer {access_token}
```

**Response (204 No Content)**

### 3. Token Refresh (POST /api/auth/token/refresh/)

**Request:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

## 🥛 MILK MANAGEMENT MODULE

### Base URL: `/api/milk/`

### 1. List Collections (GET /api/milk/collections/)

**Query Parameters:**
- `page` (integer): Page number
- `page_size` (integer): Items per page (default: 20, max: 100)
- `supplier` (integer): Filter by supplier ID
- `date_from` (string): Start date (YYYY-MM-DD)
- `date_to` (string): End date (YYYY-MM-DD)
- `milk_type` (string): Filter by type (cow/buffalo/mixed)
- `quality_status` (string): Filter by status (accepted/rejected/pending)

**Response (200 OK):**
```json
{
  "count": 150,
  "next": "http://...?page=2",
  "previous": null,
  "total_pages": 8,
  "current_page": 1,
  "page_size": 20,
  "results": [
    {
      "id": 1,
      "collection_id": "MC202511050001",
      "supplier": 5,
      "supplier_name": "Ram Kumar",
      "collected_by": 1,
      "collected_by_name": "Om Verma",
      "collection_date": "2025-11-05",
      "collection_time": "06:30:00",
      "milk_type": "cow",
      "quantity": "15.50",
      "fat_percentage": "4.50",
      "snf_percentage": "8.50",
      "temperature": "4.0",
      "quality_score": "85.83",
      "quality_status": "accepted",
      "rate_per_liter": "35.00",
      "total_amount": "542.50",
      "source": "Farm A",
      "notes": "",
      "created_at": "2025-11-05T06:30:00Z",
      "updated_at": "2025-11-05T06:30:00Z"
    }
  ]
}
```

### 2. Create Collection (POST /api/milk/collections/)

**Request Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "supplier": 5,
  "collection_date": "2025-11-05",
  "collection_time": "06:30:00",
  "milk_type": "cow",
  "quantity": "15.50",
  "fat_percentage": "4.50",
  "snf_percentage": "8.50",
  "temperature": "4.0",
  "source": "Farm A, Route 1",
  "notes": "Good quality milk"
}
```

**Required Fields:**
- `collection_date` (string, YYYY-MM-DD)
- `milk_type` (string: "cow" | "buffalo" | "mixed")
- `quantity` (string or number)
- `fat_percentage` (string or number)
- `snf_percentage` (string or number)

**Optional Fields:**
- `supplier` (integer, can be null)
- `collection_time` (string HH:MM:SS, defaults to current time)
- `temperature` (string or number, defaults to "4.0")
- `source` (string)
- `notes` (string)

**Response (201 Created):**
```json
{
  "id": 100,
  "collection_id": "MC202511050100",
  "supplier": 5,
  "supplier_name": "Ram Kumar",
  "collected_by": 1,
  "collected_by_name": "Om Verma",
  "collection_date": "2025-11-05",
  "collection_time": "06:30:00",
  "milk_type": "cow",
  "quantity": "15.50",
  "fat_percentage": "4.50",
  "snf_percentage": "8.50",
  "temperature": "4.0",
  "quality_score": "85.83",
  "quality_status": "accepted",
  "rate_per_liter": "35.00",
  "total_amount": "542.50",
  "source": "Farm A, Route 1",
  "notes": "Good quality milk",
  "created_at": "2025-11-05T06:30:00Z",
  "updated_at": "2025-11-05T06:30:00Z"
}
```

### 3. Get Single Collection (GET /api/milk/collections/{id}/)

**Response (200 OK):** Same as single item in list

### 4. Update Collection (PUT /api/milk/collections/{id}/)

**Request:** Same format as POST, all fields required

### 5. Partial Update (PATCH /api/milk/collections/{id}/)

**Request:** Same format as POST, only send fields to update

### 6. Delete Collection (DELETE /api/milk/collections/{id}/)

**Response (204 No Content)**

---

## 🏭 PRODUCTION MODULE

### Base URL: `/api/production/`

### 1. List Products (GET /api/production/products/)

**Query Parameters:**
- `page`, `page_size`
- `category` (string): Filter by category
- `is_active` (boolean): Filter active products
- `search` (string): Search by name

**Response (200 OK):**
```json
{
  "count": 25,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "product_code": "PRD-001",
      "name": "Full Cream Milk",
      "category": "dairy",
      "subcategory": "milk",
      "description": "Full fat milk with 6% fat content",
      "unit": "liter",
      "standard_cost": "45.00",
      "selling_price": "60.00",
      "min_fat_percentage": "6.00",
      "min_snf_percentage": "9.00",
      "shelf_life_days": 2,
      "storage_temperature": "4.0",
      "packaging_type": "plastic_pouch",
      "packaging_size": "1.0",
      "is_active": true,
      "created_at": "2025-10-01T10:00:00Z",
      "updated_at": "2025-10-21T10:00:00Z"
    }
  ]
}
```

### 2. Create Product (POST /api/production/products/)

**Request Body:**
```json
{
  "name": "Premium Paneer",
  "category": "dairy",
  "subcategory": "cheese",
  "description": "High-quality cottage cheese made from cow milk",
  "unit": "kilogram",
  "standard_cost": "280.00",
  "selling_price": "350.00",
  "min_fat_percentage": "22.00",
  "min_snf_percentage": null,
  "shelf_life_days": 5,
  "storage_temperature": "4.0",
  "packaging_type": "vacuum_pack",
  "packaging_size": "0.5"
}
```

**Required Fields:**
- `name` (string)
- `category` (string)
- `unit` (string: "liter" | "kilogram" | "piece" | "pack")
- `standard_cost` (string or number)
- `selling_price` (string or number)
- `shelf_life_days` (integer)
- `packaging_type` (string)
- `packaging_size` (string or number)

**Optional Fields:**
- `subcategory`, `description`, `min_fat_percentage`, `min_snf_percentage`, `storage_temperature`

**Response (201 Created):** Same structure as list item + auto-generated `product_code`

### 3. Update/Delete Product

Same patterns as Milk Collections

### 4. List Production Batches (GET /api/production/batches/)

**Query Parameters:**
- `page`, `page_size`
- `product` (integer): Filter by product ID
- `status` (string): "planned" | "in_progress" | "completed" | "cancelled"
- `date_from`, `date_to`

**Response (200 OK):**
```json
{
  "count": 50,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 10,
      "batch_number": "BATCH-20251105-A1B2",
      "product": 1,
      "product_name": "Full Cream Milk",
      "production_date": "2025-11-05",
      "quantity_produced": "500.00",
      "unit": "liter",
      "status": "completed",
      "start_time": "06:00:00",
      "end_time": "12:00:00",
      "produced_by": 1,
      "produced_by_name": "Om Verma",
      "notes": "Batch produced successfully",
      "created_at": "2025-11-05T06:00:00Z",
      "updated_at": "2025-11-05T12:00:00Z"
    }
  ]
}
```

### 5. Create Production Batch (POST /api/production/batches/)

**Request Body:**
```json
{
  "product": 1,
  "production_date": "2025-11-05",
  "quantity_produced": "500.00",
  "status": "planned",
  "start_time": "06:00:00",
  "end_time": null,
  "notes": "Planned batch for morning production"
}
```

**Required Fields:**
- `product` (integer: must be existing product ID)
- `production_date` (string: YYYY-MM-DD)
- `quantity_produced` (string or number)

**Optional Fields:**
- `status` (string, defaults to "planned")
- `start_time`, `end_time`, `notes`

**Response (201 Created):** Same structure + auto-generated `batch_number`

---

## 📦 INVENTORY MODULE

### Base URL: `/api/inventory/`

### 1. List Items (GET /api/inventory/items/)

**Query Parameters:**
- `page`, `page_size`
- `category` (string)
- `low_stock` (boolean): Filter items below reorder level
- `search` (string)

**Response (200 OK):**
```json
{
  "count": 30,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 5,
      "item_code": "INV-005",
      "name": "Plastic Milk Pouches (1L)",
      "category": "packaging",
      "unit": "piece",
      "current_stock": "5000",
      "minimum_stock": "1000",
      "maximum_stock": "10000",
      "reorder_level": "2000",
      "unit_cost": "0.50",
      "location": "Warehouse A - Shelf 3",
      "is_active": true,
      "created_at": "2025-10-01T10:00:00Z",
      "updated_at": "2025-11-05T10:00:00Z"
    }
  ]
}
```

### 2. Create Inventory Item (POST /api/inventory/items/)

**Request Body:**
```json
{
  "name": "Plastic Milk Pouches (1L)",
  "category": "packaging",
  "unit": "piece",
  "current_stock": "5000",
  "minimum_stock": "1000",
  "maximum_stock": "10000",
  "reorder_level": "2000",
  "unit_cost": "0.50",
  "location": "Warehouse A - Shelf 3"
}
```

**Required Fields:**
- `name`, `category`, `unit`
- `current_stock`, `minimum_stock`, `reorder_level`, `unit_cost`

**Optional Fields:**
- `maximum_stock` (defaults to minimum_stock * 3)
- `location`

**Response (201 Created):** Same structure + auto-generated `item_code`

### 3. List Stock Transactions (GET /api/inventory/transactions/)

**Query Parameters:**
- `page`, `page_size`
- `item` (integer): Filter by item ID
- `transaction_type` (string): "purchase" | "production" | "sale" | "adjustment" | "transfer"
- `date_from`, `date_to`

**Response (200 OK):**
```json
{
  "count": 200,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 50,
      "transaction_id": "TXN-20251105-0050",
      "item": 5,
      "item_name": "Plastic Milk Pouches (1L)",
      "transaction_type": "purchase",
      "quantity": "1000",
      "unit_price": "0.48",
      "total_amount": "480.00",
      "transaction_date": "2025-11-05",
      "reference_number": "PO-2025-100",
      "notes": "Bulk purchase from supplier",
      "created_by": 1,
      "created_by_name": "Om Verma",
      "created_at": "2025-11-05T10:00:00Z"
    }
  ]
}
```

### 4. Create Stock Transaction (POST /api/inventory/transactions/)

**Request Body:**
```json
{
  "item": 5,
  "transaction_type": "purchase",
  "quantity": "1000",
  "unit_price": "0.48",
  "transaction_date": "2025-11-05",
  "reference_number": "PO-2025-100",
  "notes": "Bulk purchase from supplier"
}
```

**Required Fields:**
- `item` (integer: must be existing item ID)
- `transaction_type` (string)
- `quantity` (string or number)
- `unit_price` (string or number)
- `transaction_date` (string: YYYY-MM-DD)

**Note:** `total_amount` is auto-calculated as quantity × unit_price

### 5. Get Stock Alerts (GET /api/inventory/stock-alerts/)

**Response (200 OK):**
```json
[
  {
    "id": 5,
    "item_code": "INV-005",
    "name": "Plastic Milk Pouches (1L)",
    "current_stock": "800",
    "reorder_level": "2000",
    "minimum_stock": "1000",
    "shortage": "1200"
  }
]
```

---

## 🏢 VENDORS MODULE

### Base URL: `/api/vendors/`

### 1. List Vendors (GET /api/vendors/)

**Query Parameters:**
- `page`, `page_size`
- `vendor_type` (string): "supplier" | "service_provider" | "both"
- `status` (string): "active" | "inactive" | "blocked"
- `search` (string)

**Response (200 OK):**
```json
{
  "count": 20,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 3,
      "vendor_code": "VEN-003",
      "name": "ABC Packaging Suppliers",
      "contact_person": "Suresh Kumar",
      "email": "suresh@abcpackaging.com",
      "phone": "+91-9876543210",
      "address": "123 Industrial Area",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "gst_number": "27ABCDE1234F1Z5",
      "pan_number": "ABCDE1234F",
      "vendor_type": "supplier",
      "payment_terms": "30",
      "credit_limit": "100000.00",
      "current_balance": "25000.00",
      "status": "active",
      "rating": 4,
      "is_active": true,
      "created_at": "2025-10-01T10:00:00Z",
      "updated_at": "2025-11-05T10:00:00Z"
    }
  ]
}
```

### 2. Create Vendor (POST /api/vendors/)

**Request Body:**
```json
{
  "name": "ABC Packaging Suppliers",
  "contact_person": "Suresh Kumar",
  "email": "suresh@abcpackaging.com",
  "phone": "+91-9876543210",
  "address": "123 Industrial Area",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "gst_number": "27ABCDE1234F1Z5",
  "pan_number": "ABCDE1234F",
  "vendor_type": "supplier",
  "payment_terms": "30",
  "credit_limit": "100000.00"
}
```

**Required Fields:**
- `name`, `contact_person`, `email`, `phone`
- `address`, `city`, `state`, `pincode`
- `vendor_type`

**Optional Fields:**
- `gst_number`, `pan_number`, `payment_terms`, `credit_limit`

**Response (201 Created):** Same structure + auto-generated `vendor_code`

---

## 👥 EMPLOYEES MODULE

### Base URL: `/api/employees/`

### 1. List Employees (GET /api/employees/)

**Query Parameters:**
- `page`, `page_size`
- `department` (string)
- `status` (string): "active" | "on_leave" | "resigned" | "terminated"
- `employment_type` (string): "permanent" | "contract" | "temporary"
- `search` (string)

**Response (200 OK):**
```json
{
  "count": 15,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 2,
      "employee_code": "EMP-002",
      "user": 2,
      "first_name": "Rajesh",
      "last_name": "Sharma",
      "email": "rajesh@ichhadhari.com",
      "phone": "+91-9876543211",
      "date_of_birth": "1990-05-15",
      "gender": "male",
      "address": "456 Main Street",
      "city": "Hyderabad",
      "state": "Telangana",
      "pincode": "500001",
      "department": "production",
      "designation": "Production Manager",
      "date_of_joining": "2024-01-15",
      "employment_type": "permanent",
      "salary": "35000.00",
      "bank_account_number": "1234567890",
      "bank_ifsc_code": "SBIN0001234",
      "emergency_contact_name": "Priya Sharma",
      "emergency_contact_phone": "+91-9876543299",
      "status": "active",
      "is_active": true,
      "created_at": "2024-01-10T10:00:00Z",
      "updated_at": "2025-11-05T10:00:00Z"
    }
  ]
}
```

### 2. Create Employee (POST /api/employees/)

**Request Body:**
```json
{
  "first_name": "Rajesh",
  "last_name": "Sharma",
  "email": "rajesh@ichhadhari.com",
  "phone": "+91-9876543211",
  "date_of_birth": "1990-05-15",
  "gender": "male",
  "address": "456 Main Street",
  "city": "Hyderabad",
  "state": "Telangana",
  "pincode": "500001",
  "department": "production",
  "designation": "Production Manager",
  "date_of_joining": "2024-01-15",
  "employment_type": "permanent",
  "salary": "35000.00",
  "bank_account_number": "1234567890",
  "bank_ifsc_code": "SBIN0001234",
  "emergency_contact_name": "Priya Sharma",
  "emergency_contact_phone": "+91-9876543299"
}
```

**Required Fields:**
- `first_name`, `last_name`, `email`, `phone`
- `date_of_birth`, `gender`
- `address`, `city`, `state`, `pincode`
- `department`, `designation`, `date_of_joining`, `employment_type`, `salary`

**Optional Fields:**
- `bank_account_number`, `bank_ifsc_code`
- `emergency_contact_name`, `emergency_contact_phone`

**Response (201 Created):** Same structure + auto-generated `employee_code`

### 3. Get Attendance (GET /api/employees/attendance/)

**Query Parameters:**
- `page`, `page_size`
- `employee` (integer): Filter by employee ID
- `date_from`, `date_to`
- `status` (string): "present" | "absent" | "half_day" | "leave"

**Response (200 OK):**
```json
{
  "count": 100,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 50,
      "employee": 2,
      "employee_name": "Rajesh Sharma",
      "date": "2025-11-05",
      "check_in_time": "09:00:00",
      "check_out_time": "18:00:00",
      "status": "present",
      "total_hours": "9.0",
      "notes": ""
    }
  ]
}
```

### 4. Mark Attendance (POST /api/employees/attendance/)

**Request Body:**
```json
{
  "employee": 2,
  "date": "2025-11-05",
  "check_in_time": "09:00:00",
  "check_out_time": "18:00:00",
  "status": "present",
  "notes": ""
}
```

**Required Fields:**
- `employee` (integer: must be existing employee ID)
- `date` (string: YYYY-MM-DD)
- `check_in_time` (string: HH:MM:SS)
- `status` (string)

**Optional Fields:**
- `check_out_time`, `notes`

---

## 📊 DASHBOARD MODULE

### Base URL: `/api/v1/dashboard/`

### 1. Get Dashboard Stats (GET /api/v1/dashboard/stats/)

**Response (200 OK):**
```json
{
  "total_milk_collected": "15420.50",
  "total_suppliers": 25,
  "total_products": 12,
  "total_revenue": "850000.00",
  "milk_collection_today": "520.00",
  "active_batches": 3,
  "low_stock_items": 5,
  "pending_payments": "125000.00",
  "collections_this_month": 450,
  "average_fat_percentage": "4.35",
  "average_snf_percentage": "8.45"
}
```

### 2. Get Milk Trends (GET /api/v1/dashboard/milk-trends/)

**Query Parameters:**
- `period` (string): "week" | "month" | "year"
- `date_from`, `date_to`

**Response (200 OK):**
```json
[
  {
    "date": "2025-11-01",
    "quantity": "520.50",
    "average_fat": "4.45",
    "average_snf": "8.52"
  },
  {
    "date": "2025-11-02",
    "quantity": "485.00",
    "average_fat": "4.32",
    "average_snf": "8.48"
  }
]
```

### 3. Get Recent Activity (GET /api/v1/dashboard/recent-activity/)

**Query Parameters:**
- `limit` (integer): Number of activities (default: 10)

**Response (200 OK):**
```json
[
  {
    "id": 100,
    "action": "create",
    "model": "MilkCollection",
    "description": "Created milk collection MC202511050100",
    "user": "Om Verma",
    "timestamp": "2025-11-05T10:30:00Z"
  }
]
```

---

## 🚨 ERROR RESPONSES

### 400 Bad Request
```json
{
  "field_name": ["Error message for this field"],
  "another_field": ["Another error message"]
}
```

Or:
```json
{
  "detail": "Error message",
  "message": "User-friendly error message"
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

Or:
```json
{
  "detail": "Given token not valid for any token type",
  "code": "token_not_valid"
}
```

### 403 Forbidden
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error",
  "message": "Something went wrong. Please try again."
}
```

---

## 💡 IMPORTANT IMPLEMENTATION NOTES

### 1. String vs Number Fields

Django REST Framework accepts both strings and numbers for decimal/float fields. However, it always RETURNS strings for consistency:

**✅ CORRECT - Both work:**
```json
{ "quantity": "15.50" }  // String (recommended)
{ "quantity": 15.50 }     // Number (also works)
```

**Response always returns strings:**
```json
{ "quantity": "15.50" }
```

### 2. Date and Time Formats

**Dates:**
- Format: `YYYY-MM-DD`
- Example: `"2025-11-05"`

**Times:**
- Format: `HH:MM:SS`
- Example: `"14:30:00"`

**DateTimes (in responses):**
- Format: ISO 8601 with timezone
- Example: `"2025-11-05T14:30:00Z"`

### 3. Foreign Key References

When creating/updating records with foreign keys, use the **ID** (integer) of the related object:

```json
{
  "product": 5,          // ✅ Use ID
  "employee": 10         // ✅ Use ID
}
```

NOT:
```json
{
  "product": "Full Cream Milk",  // ❌ Don't use name
  "employee": {                   // ❌ Don't use object
    "name": "John"
  }
}
```

### 4. Null vs Empty String

- For **optional string fields**, use empty string `""` or omit the field
- For **optional foreign keys**, use `null` or omit the field
- For **optional number fields**, use `null` or omit the field

```json
{
  "supplier": null,      // ✅ Correct for optional FK
  "notes": "",           // ✅ Correct for optional string
  "notes": null          // ❌ Wrong - use empty string
}
```

### 5. Pagination

All list endpoints support pagination:
- Default page size: 20
- Maximum page size: 100
- Use `page_size=100` for bulk data fetching

### 6. Filtering and Search

Most list endpoints support:
- `search`: Searches across multiple fields (name, code, email, etc.)
- Specific filters: Each endpoint has its own filters (see above)

### 7. Authentication Header

ALL endpoints (except `/api/auth/login/` and `/api/auth/register/`) require authentication:

```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

### 8. Content-Type Header

Always include for POST/PUT/PATCH requests:

```
Content-Type: application/json
```

---

## ✅ VALIDATION RULES

### Milk Collections:
- `quantity` > 0
- `fat_percentage` > 0 and < 100
- `snf_percentage` > 0 and < 100
- `temperature` typically between 0 and 40
- `collection_date` cannot be future date

### Products:
- `name` max length: 255
- `selling_price` >= `standard_cost`
- `shelf_life_days` > 0
- `packaging_size` > 0

### Inventory:
- `current_stock` >= 0
- `minimum_stock` > 0
- `reorder_level` >= `minimum_stock`
- `maximum_stock` > `minimum_stock`

### Vendors:
- `email` must be valid email format
- `phone` must be valid phone format (+91-XXXXXXXXXX)
- `pincode` must be 6 digits
- `gst_number` must be valid GST format (15 chars)
- `pan_number` must be valid PAN format (10 chars)

### Employees:
- `email` must be unique and valid
- `phone` must be valid
- `date_of_birth` must be in past
- `date_of_joining` cannot be before date_of_birth
- `salary` > 0

---

## 🎯 IMPLEMENTATION CHECKLIST

When integrating each module, ensure:

- [ ] Correct endpoint URL
- [ ] Proper HTTP method (GET/POST/PUT/DELETE)
- [ ] Authorization header included
- [ ] Content-Type header for POST/PUT/PATCH
- [ ] Correct payload format (field names, data types)
- [ ] Handle pagination for list endpoints
- [ ] Display loading states
- [ ] Handle errors gracefully
- [ ] Show success/error toasts
- [ ] Refresh data after CRUD operations
- [ ] Format dates/numbers for display
- [ ] Validate form data before submission

---

## 🔧 TESTING CHECKLIST

For each module:

### CREATE (POST):
1. Fill all required fields
2. Submit form
3. Check for success response (201)
4. Verify toast notification
5. Verify item appears in list
6. Check Django admin - should be there

### READ (GET):
1. Load page
2. Verify loading state
3. Verify data displays correctly
4. Verify pagination works
5. Verify filters work
6. Check data matches Django admin

### UPDATE (PUT/PATCH):
1. Edit existing item
2. Submit changes
3. Check for success response (200)
4. Verify toast notification
5. Verify changes in list
6. Check Django admin - should be updated

### DELETE:
1. Click delete
2. Confirm deletion
3. Check for success response (204)
4. Verify toast notification
5. Verify item removed from list
6. Check Django admin - should be deleted

---

## 🚀 QUICK START IMPLEMENTATION

1. **Copy all service files from previous prompts**
2. **Update API payloads to match exact formats above**
3. **Test each endpoint individually**
4. **Verify data flow: Frontend → API → Database → Frontend**
5. **Check Django admin after each operation**

**Success = Data added in admin appears in frontend AND data added in frontend appears in admin!**

---

This is the COMPLETE, ACCURATE API specification based on your Django backend. Use this as the SINGLE SOURCE OF TRUTH for all API integrations!
