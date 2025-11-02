# Vendor Management System

Complete vendor/supplier management module for Ichhadhari Dairy Management System.

## Overview

The Vendor Management system handles all aspects of supplier relationships, purchase orders, payments, and goods receipt. It provides comprehensive vendor tracking, PO management, payment processing, and quality control through GRNs.

## Features

- **Vendor Management**: Track suppliers with complete contact, legal, and banking information
- **Purchase Orders**: Create and manage purchase orders with multi-item support
- **PO Workflow**: Draft → Approval → Sent → Confirmed → Received workflow
- **Payment Processing**: Track vendor payments with multiple payment methods
- **Goods Receipt Notes (GRN)**: Record received items with quality checks
- **Inventory Integration**: Automatically update inventory on GRN creation
- **Vendor Performance**: Track vendor ratings, purchases, and outstanding balances

## Models

### 1. Vendor

Complete supplier information and performance tracking.

**Fields:**

- Basic: vendor_id, company_name, category, status
- Contact: contact_person, phone, email, website
- Legal: GST number, PAN, company registration
- Banking: bank details, account info
- Terms: credit period, credit limit, discount percentage
- Metrics: total purchases, total payments, outstanding balance, rating

**Categories:** raw_material, packaging, equipment, service, other
**Status:** active, inactive, suspended

### 2. PurchaseOrder

Purchase orders with approval workflow.

**Fields:**

- po_number (auto-generated: PO{YYYYMMDD}{0001})
- vendor, dates (PO, expected, actual delivery)
- status, approval information
- Financial: subtotal, tax, discount, total
- Delivery: address, shipping method, tracking
- Recurring order support

**Status Flow:**
draft → pending_approval → approved → sent → confirmed → partially_received → fully_received

### 3. PurchaseOrderItem

Individual line items in PO with auto-calculation.

**Fields:**

- item details, quantity, unit, unit_price
- tax_percentage, discount_percentage
- line_total (auto-calculated)
- quantity_received (updated via GRN)
- inventory_item (link to inventory)

### 4. VendorPayment

Payment records for vendors.

**Fields:**

- payment_id (auto-generated: VP{YYYYMMDD}{0001})
- vendor, amount, payment_date
- payment_method, status
- Transaction details (reference, UPI ID, cheque number)
- is_advance flag
- Link to multiple POs

### 5. GoodsReceiptNote (GRN)

Record of received goods with quality checks.

**Fields:**

- grn_number (auto-generated: GRN{YYYYMMDD}{0001})
- purchase_order, receipt_date
- Quality: status, notes, checked_by
- Documents: delivery challan, invoice numbers

### 6. GRNItem

Individual items in GRN with acceptance/rejection.

**Fields:**

- ordered/received/accepted/rejected quantities
- quality_check_passed, rejection_reason
- batch_number, expiry_date

## API Endpoints

### Vendors

- `GET/POST /api/vendors/vendors/` - List/Create vendors
- `GET/PUT/PATCH/DELETE /api/vendors/vendors/{id}/` - Vendor details
- `GET /api/vendors/vendors/{id}/purchase_orders/` - Vendor POs
- `GET /api/vendors/vendors/{id}/stats/` - Vendor statistics

### Purchase Orders

- `GET/POST /api/vendors/purchase-orders/` - List/Create POs
- `GET/PUT/PATCH/DELETE /api/vendors/purchase-orders/{id}/` - PO details
- `POST /api/vendors/purchase-orders/{id}/approve/` - Approve PO
- `POST /api/vendors/purchase-orders/{id}/send/` - Send PO to vendor
- `POST /api/vendors/purchase-orders/{id}/confirm/` - Confirm PO
- `POST /api/vendors/purchase-orders/{id}/cancel/` - Cancel PO

### Payments

- `GET/POST /api/vendors/payments/` - List/Create payments
- `GET /api/vendors/payments/{id}/` - Payment details

### GRNs

- `GET/POST /api/vendors/grns/` - List/Create GRNs
- `GET /api/vendors/grns/{id}/` - GRN details

## Usage Examples

### Creating a Vendor

```python
POST /api/vendors/vendors/
{
    "vendor_id": "VEN-001",
    "company_name": "ABC Suppliers Ltd",
    "category": "raw_material",
    "status": "active",
    "contact_person": "John Doe",
    "phone": "9876543210",
    "email": "john@abcsuppliers.com",
    "billing_address": "123 Industrial Area, City",
    "gst_number": "27AABCT1234H1Z0",
    "credit_period_days": 30,
    "credit_limit": "100000.00",
    "payment_method": "bank_transfer"
}
```

### Creating a Purchase Order

```python
POST /api/vendors/purchase-orders/
{
    "vendor": 1,
    "po_date": "2025-10-22",
    "expected_delivery_date": "2025-10-30",
    "delivery_address": "Factory Warehouse, Main St",
    "items": [
        {
            "item_name": "Milk Powder",
            "quantity": "500.00",
            "unit": "kg",
            "unit_price": "450.00",
            "tax_percentage": "18.00",
            "discount_percentage": "5.00",
            "inventory_item": 1
        }
    ]
}
```

**System automatically:**

- Generates PO number (e.g., PO202510220001)
- Calculates line totals
- Calculates PO subtotal, tax, discount, total

### Approving a Purchase Order

```python
POST /api/vendors/purchase-orders/1/approve/
```

### Creating a GRN

```python
POST /api/vendors/grns/
{
    "purchase_order": 1,
    "receipt_date": "2025-10-30",
    "quality_status": "approved",
    "delivery_challan_number": "DC-001",
    "invoice_number": "INV-001",
    "items": [
        {
            "po_item": 1,
            "ordered_quantity": "500.00",
            "received_quantity": "500.00",
            "accepted_quantity": "500.00",
            "rejected_quantity": "0.00",
            "quality_check_passed": true,
            "batch_number": "BATCH-001"
        }
    ]
}
```

**System automatically:**

- Generates GRN number
- Updates PO item quantity_received
- Updates PO status (partially/fully received)
- Creates stock transaction in inventory
- Updates inventory item stock
- Updates vendor total purchases and balance

## PO Status Workflow

```
draft → pending_approval → approved → sent → confirmed
                                        ↓
                              partially_received → fully_received
```

**Status Transitions:**

- `draft`: Initial creation
- `pending_approval`: Submitted for approval
- `approved`: Approved by manager (can be sent)
- `sent`: Sent to vendor
- `confirmed`: Vendor confirmed receipt
- `partially_received`: Some items received (via GRN)
- `fully_received`: All items received
- `cancelled`: Order cancelled (any time before fully_received)

## Integration

### With Inventory Module

- Links PO items to inventory items
- Automatically creates stock transactions on GRN
- Updates inventory stock levels
- Tracks batch numbers and expiry dates

### Financial Tracking

- Tracks vendor outstanding balances
- Monitors credit limits
- Records all payments
- Links payments to specific POs

## Filters and Search

### Vendors

- **Filters:** status, category
- **Search:** vendor_id, company_name, contact_person, phone

### Purchase Orders

- **Filters:** vendor, status, po_date
- **Search:** po_number, vendor\_\_company_name

### Payments

- **Filters:** vendor, payment_method, status, payment_date
- **Search:** payment_id, vendor\_\_company_name, transaction_reference

### GRNs

- **Filters:** purchase_order, quality_status, receipt_date
- **Search:** grn_number, po_number, invoice_number

## Admin Interface

All models registered with:

- Inline editing for PO items and GRN items
- Comprehensive filters and search
- Organized fieldsets
- Readonly fields for auto-generated data

## Testing

```bash
# Run all vendor tests
pytest apps/vendors/tests/ -v

# Model tests only
pytest apps/vendors/tests/test_models.py -v

# API tests only
pytest apps/vendors/tests/test_api.py -v
```

## Database Schema

**Tables:**

- `vendors` - Vendor master data
- `purchase_orders` - Purchase orders
- `purchase_order_items` - PO line items
- `vendor_payments` - Payment records
- `goods_receipt_notes` - GRN headers
- `grn_items` - GRN line items

**Indexes:**

- vendor_id, status (vendors)
- po_number, vendor+po_date, status (purchase_orders)
- payment_id, vendor+payment_date (vendor_payments)
- grn_number, purchase_order (goods_receipt_notes)

## Best Practices

1. **Always use PO workflow**: Create → Approve → Send → Confirm
2. **Link to inventory**: Always link PO items to inventory items
3. **Quality checks**: Use GRN for quality control before accepting
4. **Batch tracking**: Record batch numbers and expiry dates
5. **Payment reconciliation**: Link payments to specific POs
6. **Vendor ratings**: Regularly update vendor performance ratings

## Troubleshooting

### PO totals not calculating

- Ensure items are created with the PO
- Check tax and discount percentages
- Line totals are auto-calculated on item save

### GRN not updating inventory

- Verify PO item has inventory_item linked
- Check that accepted_quantity > 0
- Ensure GRN creation is via API (not direct DB)

### Status workflow errors

- Follow correct status transitions
- Check current status before transition
- Some transitions require previous steps

## Security Features

✅ Authentication required for all endpoints
✅ User tracking in POs, payments, GRNs
✅ PROTECT on vendor foreign keys
✅ Approval workflow for POs
✅ Quality checks before acceptance

## Future Enhancements

- [ ] Vendor portal for PO confirmation
- [ ] Automatic reorder suggestions
- [ ] Vendor comparison reports
- [ ] Contract management
- [ ] Vendor document management
- [ ] Automated payment schedules
- [ ] Purchase analytics dashboard

---

For detailed API examples, see API_EXAMPLES.md
For setup instructions, see SETUP_GUIDE.md
