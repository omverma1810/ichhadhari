# Vendor Management API Examples

Comprehensive API usage examples for the Vendor Management module.

## Authentication

All requests require JWT authentication:

```bash
# Get tokens
POST /api/auth/login/
Content-Type: application/json

{
    "username": "admin",
    "password": "password"
}

# Response
{
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}

# Use in requests
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

## Vendor API

### List All Vendors

```bash
GET /api/vendors/vendors/
```

**Response:**

```json
{
  "count": 5,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "vendor_id": "VEN-001",
      "company_name": "ABC Suppliers Ltd",
      "category": "raw_material",
      "status": "active",
      "contact_person": "John Doe",
      "phone": "9876543210",
      "email": "john@abc.com",
      "total_purchases": "250000.00",
      "outstanding_balance": "50000.00",
      "rating": 4.5
    }
  ]
}
```

### Filter Vendors

```bash
# By status
GET /api/vendors/vendors/?status=active

# By category
GET /api/vendors/vendors/?category=raw_material

# Search by name
GET /api/vendors/vendors/?search=ABC

# Multiple filters
GET /api/vendors/vendors/?status=active&category=raw_material
```

### Get Vendor Details

```bash
GET /api/vendors/vendors/1/
```

**Response:**

```json
{
  "id": 1,
  "vendor_id": "VEN-001",
  "company_name": "ABC Suppliers Ltd",
  "category": "raw_material",
  "status": "active",
  "contact_person": "John Doe",
  "designation": "Sales Manager",
  "phone": "9876543210",
  "alternate_phone": "9876543211",
  "email": "john@abc.com",
  "website": "https://abcsuppliers.com",
  "billing_address": "123 Industrial Area, City - 400001",
  "shipping_address": "123 Industrial Area, City - 400001",
  "gst_number": "27AABCT1234H1Z0",
  "pan_number": "AABCT1234H",
  "company_registration_number": "U12345MH2020PTC123456",
  "bank_name": "HDFC Bank",
  "bank_account_number": "12345678901234",
  "bank_ifsc_code": "HDFC0001234",
  "bank_account_holder_name": "ABC Suppliers Ltd",
  "credit_period_days": 30,
  "credit_limit": "100000.00",
  "discount_percentage": "5.00",
  "payment_method": "bank_transfer",
  "total_purchases": "250000.00",
  "total_payments": "200000.00",
  "outstanding_balance": "50000.00",
  "rating": 4.5,
  "notes": "Reliable supplier",
  "documents": {},
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-22T15:45:00Z"
}
```

### Create Vendor

```bash
POST /api/vendors/vendors/
Content-Type: application/json

{
    "vendor_id": "VEN-002",
    "company_name": "XYZ Packaging Co",
    "category": "packaging",
    "status": "active",
    "contact_person": "Jane Smith",
    "phone": "9876543220",
    "email": "jane@xyzpack.com",
    "billing_address": "456 Industrial Park, City - 400002",
    "gst_number": "27XYZPK5678G1Z1",
    "pan_number": "XYZPK5678G",
    "credit_period_days": 45,
    "credit_limit": "150000.00",
    "discount_percentage": "3.50",
    "payment_method": "cheque",
    "bank_name": "ICICI Bank",
    "bank_account_number": "98765432109876",
    "bank_ifsc_code": "ICIC0005678",
    "rating": 4.0
}
```

### Update Vendor

```bash
PUT /api/vendors/vendors/1/
Content-Type: application/json

{
    "vendor_id": "VEN-001",
    "company_name": "ABC Suppliers Ltd",
    "category": "raw_material",
    "status": "active",
    "contact_person": "John Doe",
    "phone": "9876543210",
    "email": "john@abc.com",
    "rating": 4.8
}
```

### Partial Update Vendor

```bash
PATCH /api/vendors/vendors/1/
Content-Type: application/json

{
    "rating": 4.8,
    "notes": "Excellent supplier, always on time"
}
```

### Delete Vendor

```bash
DELETE /api/vendors/vendors/1/
```

### Get Vendor Purchase Orders

```bash
GET /api/vendors/vendors/1/purchase_orders/
```

**Response:**

```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "po_number": "PO202501150001",
      "po_date": "2025-01-15",
      "status": "fully_received",
      "total_amount": "250000.00"
    }
  ]
}
```

### Get Vendor Statistics

```bash
GET /api/vendors/vendors/1/stats/
```

**Response:**

```json
{
  "total_purchase_orders": 5,
  "total_amount": "250000.00",
  "completed_orders": 3,
  "pending_orders": 2,
  "average_order_value": "50000.00",
  "total_payments": "200000.00",
  "outstanding_balance": "50000.00"
}
```

## Purchase Order API

### List All Purchase Orders

```bash
GET /api/vendors/purchase-orders/
```

**Response:**

```json
{
  "count": 10,
  "results": [
    {
      "id": 1,
      "po_number": "PO202501150001",
      "vendor": {
        "id": 1,
        "vendor_id": "VEN-001",
        "company_name": "ABC Suppliers Ltd"
      },
      "po_date": "2025-01-15",
      "status": "fully_received",
      "total_amount": "250000.00"
    }
  ]
}
```

### Filter Purchase Orders

```bash
# By vendor
GET /api/vendors/purchase-orders/?vendor=1

# By status
GET /api/vendors/purchase-orders/?status=approved

# By date range
GET /api/vendors/purchase-orders/?po_date_after=2025-01-01&po_date_before=2025-01-31

# Search
GET /api/vendors/purchase-orders/?search=PO202501
```

### Get Purchase Order Details

```bash
GET /api/vendors/purchase-orders/1/
```

**Response:**

```json
{
  "id": 1,
  "po_number": "PO202501150001",
  "vendor": {
    "id": 1,
    "vendor_id": "VEN-001",
    "company_name": "ABC Suppliers Ltd",
    "phone": "9876543210",
    "email": "john@abc.com"
  },
  "po_date": "2025-01-15",
  "expected_delivery_date": "2025-01-22",
  "actual_delivery_date": "2025-01-21",
  "status": "fully_received",
  "notes": "Urgent order",
  "terms_and_conditions": "Standard terms apply",
  "delivery_address": "Factory Warehouse, Main St",
  "shipping_method": "truck",
  "tracking_number": "TRK123456",
  "is_recurring": false,
  "recurring_frequency": null,
  "subtotal": "220000.00",
  "tax_amount": "39600.00",
  "discount_amount": "9600.00",
  "total_amount": "250000.00",
  "items": [
    {
      "id": 1,
      "item_name": "Milk Powder",
      "description": "High quality milk powder",
      "quantity": "500.00",
      "unit": "kg",
      "unit_price": "450.00",
      "tax_percentage": "18.00",
      "discount_percentage": "5.00",
      "line_total": "213750.00",
      "quantity_received": "500.00",
      "inventory_item": {
        "id": 1,
        "item_name": "Milk Powder",
        "current_stock": "1500.00"
      }
    }
  ],
  "created_by": {
    "id": 1,
    "username": "admin",
    "full_name": "Admin User"
  },
  "approved_by": {
    "id": 2,
    "username": "manager",
    "full_name": "Manager User"
  },
  "created_at": "2025-01-15T10:00:00Z",
  "updated_at": "2025-01-21T16:30:00Z"
}
```

### Create Purchase Order

```bash
POST /api/vendors/purchase-orders/
Content-Type: application/json

{
    "vendor": 1,
    "po_date": "2025-01-22",
    "expected_delivery_date": "2025-01-30",
    "delivery_address": "Factory Warehouse, Main St, City",
    "shipping_method": "truck",
    "notes": "Please deliver before 5 PM",
    "terms_and_conditions": "Payment within 30 days",
    "items": [
        {
            "item_name": "Milk Powder",
            "description": "Premium grade milk powder",
            "quantity": "500.00",
            "unit": "kg",
            "unit_price": "450.00",
            "tax_percentage": "18.00",
            "discount_percentage": "5.00",
            "inventory_item": 1
        },
        {
            "item_name": "Sugar",
            "description": "White refined sugar",
            "quantity": "200.00",
            "unit": "kg",
            "unit_price": "45.00",
            "tax_percentage": "5.00",
            "discount_percentage": "0.00",
            "inventory_item": 2
        }
    ]
}
```

**Response:**

```json
{
    "id": 2,
    "po_number": "PO202501220001",
    "vendor": {...},
    "po_date": "2025-01-22",
    "status": "draft",
    "subtotal": "234000.00",
    "tax_amount": "38430.00",
    "discount_amount": "11700.00",
    "total_amount": "260730.00",
    "items": [...]
}
```

### Update Purchase Order

```bash
PUT /api/vendors/purchase-orders/2/
Content-Type: application/json

{
    "vendor": 1,
    "po_date": "2025-01-22",
    "expected_delivery_date": "2025-01-29",
    "delivery_address": "Updated address",
    "items": [...]
}
```

### Approve Purchase Order

```bash
POST /api/vendors/purchase-orders/2/approve/
```

**Response:**

```json
{
  "id": 2,
  "po_number": "PO202501220001",
  "status": "approved",
  "approved_by": {
    "id": 2,
    "username": "manager"
  },
  "approval_date": "2025-01-22T14:30:00Z"
}
```

### Send Purchase Order

```bash
POST /api/vendors/purchase-orders/2/send/
```

**Response:**

```json
{
  "id": 2,
  "po_number": "PO202501220001",
  "status": "sent",
  "message": "Purchase order sent to vendor successfully"
}
```

### Confirm Purchase Order

```bash
POST /api/vendors/purchase-orders/2/confirm/
```

**Response:**

```json
{
  "id": 2,
  "po_number": "PO202501220001",
  "status": "confirmed",
  "message": "Purchase order confirmed by vendor"
}
```

### Cancel Purchase Order

```bash
POST /api/vendors/purchase-orders/2/cancel/
Content-Type: application/json

{
    "reason": "Vendor out of stock"
}
```

**Response:**

```json
{
  "id": 2,
  "po_number": "PO202501220001",
  "status": "cancelled",
  "message": "Purchase order cancelled successfully"
}
```

## Vendor Payment API

### List All Payments

```bash
GET /api/vendors/payments/
```

**Response:**

```json
{
  "count": 8,
  "results": [
    {
      "id": 1,
      "payment_id": "VP202501160001",
      "vendor": {
        "id": 1,
        "company_name": "ABC Suppliers Ltd"
      },
      "amount": "50000.00",
      "payment_date": "2025-01-16",
      "payment_method": "bank_transfer",
      "status": "completed"
    }
  ]
}
```

### Filter Payments

```bash
# By vendor
GET /api/vendors/payments/?vendor=1

# By status
GET /api/vendors/payments/?status=completed

# By payment method
GET /api/vendors/payments/?payment_method=bank_transfer

# Date range
GET /api/vendors/payments/?payment_date_after=2025-01-01
```

### Get Payment Details

```bash
GET /api/vendors/payments/1/
```

**Response:**

```json
{
  "id": 1,
  "payment_id": "VP202501160001",
  "vendor": {
    "id": 1,
    "vendor_id": "VEN-001",
    "company_name": "ABC Suppliers Ltd"
  },
  "amount": "50000.00",
  "payment_date": "2025-01-16",
  "payment_method": "bank_transfer",
  "transaction_reference": "TXN123456789",
  "bank_name": "HDFC Bank",
  "upi_id": null,
  "cheque_number": null,
  "status": "completed",
  "is_advance": false,
  "notes": "Payment for PO202501150001",
  "purchase_orders": [
    {
      "id": 1,
      "po_number": "PO202501150001",
      "total_amount": "250000.00"
    }
  ],
  "created_by": {
    "id": 1,
    "username": "admin"
  },
  "created_at": "2025-01-16T11:00:00Z"
}
```

### Create Payment

```bash
POST /api/vendors/payments/
Content-Type: application/json

{
    "vendor": 1,
    "amount": "75000.00",
    "payment_date": "2025-01-22",
    "payment_method": "bank_transfer",
    "transaction_reference": "TXN987654321",
    "bank_name": "HDFC Bank",
    "status": "completed",
    "is_advance": false,
    "notes": "Payment for PO202501220001",
    "purchase_orders": [2]
}
```

**Response:**

```json
{
    "id": 2,
    "payment_id": "VP202501220001",
    "vendor": {...},
    "amount": "75000.00",
    "status": "completed"
}
```

### UPI Payment

```bash
POST /api/vendors/payments/
Content-Type: application/json

{
    "vendor": 1,
    "amount": "25000.00",
    "payment_date": "2025-01-22",
    "payment_method": "upi",
    "transaction_reference": "UPI987654321",
    "upi_id": "vendor@okhdfc",
    "status": "completed",
    "purchase_orders": [2]
}
```

### Cheque Payment

```bash
POST /api/vendors/payments/
Content-Type: application/json

{
    "vendor": 1,
    "amount": "100000.00",
    "payment_date": "2025-01-22",
    "payment_method": "cheque",
    "cheque_number": "123456",
    "bank_name": "HDFC Bank",
    "status": "pending",
    "purchase_orders": [2]
}
```

### Advance Payment

```bash
POST /api/vendors/payments/
Content-Type: application/json

{
    "vendor": 1,
    "amount": "50000.00",
    "payment_date": "2025-01-22",
    "payment_method": "bank_transfer",
    "transaction_reference": "TXN111222333",
    "status": "completed",
    "is_advance": true,
    "notes": "Advance payment for future orders"
}
```

## Goods Receipt Note (GRN) API

### List All GRNs

```bash
GET /api/vendors/grns/
```

**Response:**

```json
{
  "count": 6,
  "results": [
    {
      "id": 1,
      "grn_number": "GRN202501210001",
      "purchase_order": {
        "id": 1,
        "po_number": "PO202501150001"
      },
      "receipt_date": "2025-01-21",
      "quality_status": "approved"
    }
  ]
}
```

### Filter GRNs

```bash
# By PO
GET /api/vendors/grns/?purchase_order=1

# By quality status
GET /api/vendors/grns/?quality_status=approved

# By date
GET /api/vendors/grns/?receipt_date=2025-01-21

# Search
GET /api/vendors/grns/?search=GRN202501
```

### Get GRN Details

```bash
GET /api/vendors/grns/1/
```

**Response:**

```json
{
  "id": 1,
  "grn_number": "GRN202501210001",
  "purchase_order": {
    "id": 1,
    "po_number": "PO202501150001",
    "vendor": {
      "id": 1,
      "company_name": "ABC Suppliers Ltd"
    }
  },
  "receipt_date": "2025-01-21",
  "quality_status": "approved",
  "quality_notes": "All items meet quality standards",
  "checked_by": {
    "id": 3,
    "username": "storekeeper",
    "full_name": "Store Keeper"
  },
  "delivery_challan_number": "DC-001",
  "invoice_number": "INV-001",
  "items": [
    {
      "id": 1,
      "po_item": {
        "id": 1,
        "item_name": "Milk Powder",
        "inventory_item": 1
      },
      "ordered_quantity": "500.00",
      "received_quantity": "500.00",
      "accepted_quantity": "500.00",
      "rejected_quantity": "0.00",
      "quality_check_passed": true,
      "rejection_reason": null,
      "batch_number": "BATCH-001",
      "expiry_date": "2026-01-21",
      "notes": "Good quality"
    }
  ],
  "created_by": {
    "id": 3,
    "username": "storekeeper"
  },
  "created_at": "2025-01-21T16:00:00Z"
}
```

### Create GRN (Full Acceptance)

```bash
POST /api/vendors/grns/
Content-Type: application/json

{
    "purchase_order": 2,
    "receipt_date": "2025-01-29",
    "quality_status": "approved",
    "quality_notes": "All items received in good condition",
    "delivery_challan_number": "DC-002",
    "invoice_number": "INV-002",
    "items": [
        {
            "po_item": 2,
            "ordered_quantity": "500.00",
            "received_quantity": "500.00",
            "accepted_quantity": "500.00",
            "rejected_quantity": "0.00",
            "quality_check_passed": true,
            "batch_number": "BATCH-002",
            "expiry_date": "2026-01-29",
            "notes": "Perfect condition"
        }
    ]
}
```

**Response:**

```json
{
    "id": 2,
    "grn_number": "GRN202501290001",
    "purchase_order": {...},
    "receipt_date": "2025-01-29",
    "quality_status": "approved",
    "items": [...]
}
```

### Create GRN (Partial Acceptance)

```bash
POST /api/vendors/grns/
Content-Type: application/json

{
    "purchase_order": 2,
    "receipt_date": "2025-01-29",
    "quality_status": "partial",
    "quality_notes": "Some items damaged",
    "delivery_challan_number": "DC-003",
    "invoice_number": "INV-003",
    "items": [
        {
            "po_item": 2,
            "ordered_quantity": "500.00",
            "received_quantity": "500.00",
            "accepted_quantity": "450.00",
            "rejected_quantity": "50.00",
            "quality_check_passed": false,
            "rejection_reason": "Packaging damaged",
            "batch_number": "BATCH-003",
            "expiry_date": "2026-01-29"
        }
    ]
}
```

### Create GRN (Full Rejection)

```bash
POST /api/vendors/grns/
Content-Type: application/json

{
    "purchase_order": 3,
    "receipt_date": "2025-01-25",
    "quality_status": "rejected",
    "quality_notes": "Poor quality, does not meet standards",
    "delivery_challan_number": "DC-004",
    "items": [
        {
            "po_item": 3,
            "ordered_quantity": "100.00",
            "received_quantity": "100.00",
            "accepted_quantity": "0.00",
            "rejected_quantity": "100.00",
            "quality_check_passed": false,
            "rejection_reason": "Quality does not meet specifications",
            "batch_number": "BATCH-004"
        }
    ]
}
```

## Error Responses

### 400 Bad Request

```json
{
  "error": "Validation error",
  "details": {
    "quantity": ["Quantity must be greater than 0"],
    "unit_price": ["Unit price must be greater than 0"]
  }
}
```

### 401 Unauthorized

```json
{
  "detail": "Authentication credentials were not provided."
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
  "error": "Internal server error",
  "detail": "An unexpected error occurred"
}
```

## Pagination

All list endpoints support pagination:

```bash
# Default page size (10)
GET /api/vendors/vendors/

# Custom page size
GET /api/vendors/vendors/?page_size=20

# Navigate pages
GET /api/vendors/vendors/?page=2

# Response includes pagination metadata
{
    "count": 50,
    "next": "http://localhost:8000/api/vendors/vendors/?page=3",
    "previous": "http://localhost:8000/api/vendors/vendors/?page=1",
    "results": [...]
}
```

## Ordering

```bash
# Order by field
GET /api/vendors/vendors/?ordering=company_name

# Reverse order
GET /api/vendors/vendors/?ordering=-created_at

# Multiple fields
GET /api/vendors/purchase-orders/?ordering=-po_date,vendor__company_name
```

---

For more details, see README.md and SETUP_GUIDE.md
