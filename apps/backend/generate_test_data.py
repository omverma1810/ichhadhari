"""
Test data generation script for the Ichhadhari Dairy Management System.

Run with:
    python manage.py shell < generate_test_data.py
"""

import calendar
import random
from datetime import datetime, timedelta, time
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.db.models import Sum
from django.utils import timezone

from apps.milk_management.models import Supplier, MilkCollection, MilkPayment
from apps.production.models import Product, ProductionBatch, ProductionSchedule
from apps.inventory.models import InventoryItem, StockTransaction
from apps.vendors.models import (
    Vendor,
    PurchaseOrder,
    PurchaseOrderItem,
    VendorPayment,
    GoodsReceiptNote,
    GRNItem,
)
from apps.employees.models import (
    Department,
    Employee,
    Attendance,
    SalaryStructure,
    PayrollRecord,
)

RANDOM_SEED = 20251028
TWO_PLACES = Decimal("0.01")
ONE_DECIMAL = Decimal("0.1")


def safe_decimal(value, places=TWO_PLACES):
    """Return a Decimal rounded to the requested precision."""
    if isinstance(value, Decimal):
        return value.quantize(places)
    return Decimal(str(value)).quantize(places)


def add_months(source_date, months):
    """Shift ``source_date`` by the provided number of months."""
    month = source_date.month - 1 + months
    year = source_date.year + month // 12
    month = month % 12 + 1
    day = min(source_date.day, calendar.monthrange(year, month)[1])
    return source_date.replace(year=year, month=month, day=day)


def month_bounds(reference_date):
    """Return the first and last day of the month for ``reference_date``."""
    start = reference_date.replace(day=1)
    last_day = calendar.monthrange(reference_date.year, reference_date.month)[1]
    end = reference_date.replace(day=last_day)
    return start, end


def ensure_users():
    User = get_user_model()
    user_entries = [
        {
            "username": "admin",
            "password": "Admin@123",
            "defaults": {
                "email": "admin@ichhadhari.com",
                "first_name": "Admin",
                "last_name": "User",
                "role": "admin",
                "department": "executive",
                "is_staff": True,
                "is_superuser": True,
            },
        },
        {
            "username": "manager.singh",
            "password": "Manager@123",
            "defaults": {
                "email": "manager@ichhadhari.com",
                "first_name": "Manager",
                "last_name": "Singh",
                "role": "manager",
                "department": "operations",
                "is_staff": True,
            },
        },
        {
            "username": "raj.kumar",
            "password": "Staff@123",
            "defaults": {
                "email": "raj.kumar@ichhadhari.com",
                "first_name": "Raj",
                "last_name": "Kumar",
                "role": "supervisor",
                "department": "procurement",
            },
        },
        {
            "username": "priya.sharma",
            "password": "Staff@123",
            "defaults": {
                "email": "priya.sharma@ichhadhari.com",
                "first_name": "Priya",
                "last_name": "Sharma",
                "role": "operator",
                "department": "quality",
            },
        },
        {
            "username": "amit.patel",
            "password": "Staff@123",
            "defaults": {
                "email": "amit.patel@ichhadhari.com",
                "first_name": "Amit",
                "last_name": "Patel",
                "role": "finance",
                "department": "finance",
            },
        },
        {
            "username": "neha.gupta",
            "password": "Staff@123",
            "defaults": {
                "email": "neha.gupta@ichhadhari.com",
                "first_name": "Neha",
                "last_name": "Gupta",
                "role": "hr",
                "department": "human-resources",
            },
        },
    ]

    created = 0
    for entry in user_entries:
        defaults = entry["defaults"].copy()
        user, was_created = User.objects.get_or_create(
            username=entry["username"],
            defaults=defaults,
        )
        if was_created:
            if entry.get("password"):
                user.set_password(entry["password"])
                user.save()
            created += 1
        else:
            changed = False
            for field, value in defaults.items():
                if getattr(user, field) != value:
                    setattr(user, field, value)
                    changed = True
            if changed:
                user.save()
        entry["instance"] = user

    admin_user = next(e["instance"] for e in user_entries if e["username"] == "admin")
    manager_user = next(e["instance"] for e in user_entries if e["username"] == "manager.singh")
    staff_pool = list(
        User.objects.filter(role__in=["manager", "supervisor", "operator", "finance", "hr"]).order_by("id")
    )
    print(f"[Users] Ensured {len(user_entries)} core accounts ({created} created).")
    return {
        "admin": admin_user,
        "manager": manager_user,
        "staff_pool": staff_pool,
    }


def ensure_suppliers():
    supplier_seed = [
        {
            "supplier_id": "SUP-0001",
            "name": "Ram Dairy Farm",
            "supplier_type": "farmer",
            "phone": "9876543210",
            "alternate_phone": "9876543211",
            "email": "ram.farm@example.com",
            "address": "1 Dairy Road, Mumbai, Maharashtra",
            "route_name": "Route A",
            "collection_time": time(hour=6, minute=0),
            "bank_name": "State Bank of India",
            "account_number": "123456789001",
            "ifsc_code": "SBIN0001001",
            "account_holder_name": "Ram Dairy Farm",
            "payment_cycle": "monthly",
            "milk_type": "cow",
            "base_rate": Decimal("45.00"),
        },
        {
            "supplier_id": "SUP-0002",
            "name": "Krishna Milk Suppliers",
            "supplier_type": "cooperative",
            "phone": "9876543212",
            "alternate_phone": "9876543213",
            "email": "krishna.suppliers@example.com",
            "address": "22 Milk Colony, Pune, Maharashtra",
            "route_name": "Route B",
            "collection_time": time(hour=7, minute=0),
            "bank_name": "Bank of Maharashtra",
            "account_number": "123456789002",
            "ifsc_code": "MAHB0002002",
            "account_holder_name": "Krishna Milk Suppliers",
            "payment_cycle": "fortnightly",
            "milk_type": "buffalo",
            "base_rate": Decimal("55.00"),
        },
        {
            "supplier_id": "SUP-0003",
            "name": "Govind Agro",
            "supplier_type": "farmer",
            "phone": "9876543214",
            "alternate_phone": "9876543215",
            "email": "govind.agro@example.com",
            "address": "78 Village Road, Nashik, Maharashtra",
            "route_name": "Route C",
            "collection_time": time(hour=5, minute=30),
            "bank_name": "ICICI Bank",
            "account_number": "123456789003",
            "ifsc_code": "ICIC0003003",
            "account_holder_name": "Govind Agro",
            "payment_cycle": "monthly",
            "milk_type": "mixed",
            "base_rate": Decimal("50.00"),
        },
        {
            "supplier_id": "SUP-0004",
            "name": "Shyam Cooperative",
            "supplier_type": "cooperative",
            "phone": "9876543216",
            "alternate_phone": "9876543217",
            "email": "shyam.coop@example.com",
            "address": "54 Market Street, Nagpur, Maharashtra",
            "route_name": "Route D",
            "collection_time": time(hour=6, minute=30),
            "bank_name": "HDFC Bank",
            "account_number": "123456789004",
            "ifsc_code": "HDFC0004004",
            "account_holder_name": "Shyam Cooperative",
            "payment_cycle": "monthly",
            "milk_type": "cow",
            "base_rate": Decimal("46.00"),
        },
    ]

    suppliers = []
    supplier_meta = {}
    created = 0

    for entry in supplier_seed:
        defaults = {
            "name": entry["name"],
            "supplier_type": entry["supplier_type"],
            "status": "active",
            "phone": entry["phone"],
            "alternate_phone": entry["alternate_phone"],
            "email": entry["email"],
            "address": entry["address"],
            "route_name": entry["route_name"],
            "collection_time": entry["collection_time"],
            "bank_name": entry["bank_name"],
            "account_number": entry["account_number"],
            "ifsc_code": entry["ifsc_code"],
            "account_holder_name": entry["account_holder_name"],
            "payment_cycle": entry["payment_cycle"],
            "documents": {},
            "notes": "Auto-generated supplier",
        }
        supplier, was_created = Supplier.objects.get_or_create(
            supplier_id=entry["supplier_id"],
            defaults=defaults,
        )
        if was_created:
            created += 1
        suppliers.append(supplier)
        supplier_meta[supplier.pk] = {
            "milk_type": entry["milk_type"],
            "base_rate": entry["base_rate"],
        }

    print(f"[Milk] Ensured {len(suppliers)} suppliers ({created} created).")
    return suppliers, supplier_meta


def create_milk_collections(suppliers, supplier_meta, actors):
    staff_pool = actors["staff_pool"]
    admin_user = actors["admin"]
    today = timezone.now().date()
    created = 0
    shifts = [
        ("morning", time(hour=6, minute=0)),
        ("evening", time(hour=18, minute=0)),
    ]

    for day_offset in range(60):
        collection_date = today - timedelta(days=day_offset)
        for supplier in suppliers[:3]:
            meta = supplier_meta[supplier.pk]
            for shift_name, shift_time in shifts:
                collection_id = f"COL-{supplier.supplier_id}-{collection_date.strftime('%Y%m%d')}-{shift_name[0].upper()}"
                quantity = safe_decimal(random.randint(120, 420))
                fat = safe_decimal(random.uniform(3.6, 6.0))
                snf = safe_decimal(random.uniform(8.0, 9.5))
                temperature = Decimal(str(round(random.uniform(3.0, 7.5), 1))).quantize(ONE_DECIMAL)
                status = random.choices(
                    population=["accepted", "accepted", "accepted", "conditional", "rejected"],
                    k=1,
                )[0]
                rejection_reason = ""
                if status == "rejected":
                    rejection_reason = "Fat percentage below threshold"
                elif status == "conditional":
                    rejection_reason = "Hold for supervisor review"

                collection, created_flag = MilkCollection.objects.get_or_create(
                    supplier=supplier,
                    collection_date=collection_date,
                    collection_time=shift_time,
                    defaults={
                        "collection_id": collection_id,
                        "milk_type": meta["milk_type"],
                        "quantity": quantity,
                        "fat_percentage": fat,
                        "snf_percentage": snf,
                        "temperature": temperature,
                        "quality_status": status,
                        "rejection_reason": rejection_reason,
                        "rate_per_liter": meta["base_rate"],
                        "collected_by": random.choice(staff_pool) if staff_pool else admin_user,
                        "notes": f"Auto-generated {shift_name} record",
                    },
                )
                if created_flag:
                    collection.save()
                    created += 1

    print(f"[Milk] Created {created} milk collection records.")


def create_milk_payments(suppliers, admin_user):
    today = timezone.now().date()
    created = 0

    for supplier in suppliers:
        for months_back in range(3):
            period_reference = add_months(today, -months_back)
            period_start, period_end = month_bounds(period_reference)
            if months_back == 0 and period_end > today:
                period_end = today

            collections = supplier.collections.filter(
                collection_date__gte=period_start,
                collection_date__lte=period_end,
                quality_status__in=["accepted", "conditional"],
            )
            if not collections.exists():
                continue

            total_amount = sum((c.total_amount or Decimal("0.00")) for c in collections)
            if total_amount == 0:
                continue

            payment_id = f"MP-{supplier.supplier_id}-{period_start.strftime('%Y%m')}"
            status = "pending" if months_back == 0 else "completed"

            payment, created_flag = MilkPayment.objects.get_or_create(
                payment_id=payment_id,
                defaults={
                    "supplier": supplier,
                    "processed_by": admin_user,
                    "payment_date": period_end,
                    "amount": safe_decimal(total_amount),
                    "payment_method": "bank_transfer",
                    "status": status,
                    "period_start": period_start,
                    "period_end": period_end,
                    "transaction_reference": f"BNK-{payment_id[-6:]}",
                    "notes": "Auto-generated payment for test data",
                },
            )
            if created_flag:
                payment.collections.set(collections)
                payment.save()
                created += 1

    print(f"[Milk] Created {created} milk payment records.")


def update_supplier_metrics(suppliers):
    for supplier in suppliers:
        collections = supplier.collections.all()
        if not collections.exists():
            continue

        total_qty = sum((c.quantity or Decimal("0.00")) for c in collections)
        total_amount = sum((c.total_amount or Decimal("0.00")) for c in collections)
        quality_sum = sum((c.quality_score or Decimal("0.00")) for c in collections)
        avg_quality = Decimal("0.00")
        if collections.count():
            avg_quality = quality_sum / Decimal(collections.count())

        completed_payments = supplier.payments.filter(status="completed")
        paid_amount = sum((p.amount or Decimal("0.00")) for p in completed_payments)

        supplier.total_milk_supplied = safe_decimal(total_qty)
        supplier.avg_quality_score = safe_decimal(avg_quality)
        supplier.total_amount_paid = safe_decimal(paid_amount)
        supplier.outstanding_balance = safe_decimal(total_amount - paid_amount)
        supplier.save(
            update_fields=[
                "total_milk_supplied",
                "avg_quality_score",
                "total_amount_paid",
                "outstanding_balance",
            ]
        )

    print("[Milk] Updated supplier aggregates.")


def ensure_products():
    product_seed = [
        {
            "product_id": "PRD-0001",
            "name": "Full Cream Milk",
            "category": "dairy",
            "unit": "liter",
            "cost_price": Decimal("35.00"),
            "selling_price": Decimal("50.00"),
            "shelf_life_days": 3,
            "storage_temperature": "2-6 C",
            "milk_required_per_unit": Decimal("1.00"),
            "description": "High quality full cream milk",
        },
        {
            "product_id": "PRD-0002",
            "name": "Toned Milk",
            "category": "dairy",
            "unit": "liter",
            "cost_price": Decimal("30.00"),
            "selling_price": Decimal("45.00"),
            "shelf_life_days": 3,
            "storage_temperature": "2-6 C",
            "milk_required_per_unit": Decimal("1.00"),
            "description": "Low fat toned milk",
        },
        {
            "product_id": "PRD-0003",
            "name": "Fresh Curd",
            "category": "dairy",
            "unit": "kg",
            "cost_price": Decimal("80.00"),
            "selling_price": Decimal("120.00"),
            "shelf_life_days": 7,
            "storage_temperature": "2-6 C",
            "milk_required_per_unit": Decimal("1.20"),
            "description": "Probiotic rich curd",
        },
        {
            "product_id": "PRD-0004",
            "name": "Paneer",
            "category": "dairy",
            "unit": "kg",
            "cost_price": Decimal("150.00"),
            "selling_price": Decimal("220.00"),
            "shelf_life_days": 5,
            "storage_temperature": "2-6 C",
            "milk_required_per_unit": Decimal("5.00"),
            "description": "Soft paneer blocks",
        },
        {
            "product_id": "PRD-0005",
            "name": "Pure Ghee",
            "category": "dairy",
            "unit": "kg",
            "cost_price": Decimal("450.00"),
            "selling_price": Decimal("600.00"),
            "shelf_life_days": 365,
            "storage_temperature": "Ambient",
            "milk_required_per_unit": Decimal("14.00"),
            "description": "Traditional clarified butter",
        },
    ]

    products = []
    created = 0

    for entry in product_seed:
        defaults = {
            "name": entry["name"],
            "category": entry["category"],
            "description": entry["description"],
            "unit": entry["unit"],
            "cost_price": entry["cost_price"],
            "selling_price": entry["selling_price"],
            "shelf_life_days": entry["shelf_life_days"],
            "storage_temperature": entry["storage_temperature"],
            "milk_required_per_unit": entry["milk_required_per_unit"],
            "is_active": True,
        }
        product, was_created = Product.objects.get_or_create(
            product_id=entry["product_id"],
            defaults=defaults,
        )
        if was_created:
            created += 1
        products.append(product)

    print(f"[Production] Ensured {len(products)} product records ({created} created).")
    return products


def create_production_batches(products, actors):
    staff_pool = actors["staff_pool"]
    manager_user = actors["manager"]
    today = timezone.now()
    created = 0

    for days_back in range(30):
        batch_date = (today - timedelta(days=days_back)).date()
        if not products:
            break
        daily_products = random.sample(products, k=min(3, len(products)))
        for index, product in enumerate(daily_products, start=1):
            batch_id = f"BATCH-{batch_date.strftime('%Y%m%d')}-{index:02d}"
            planned_quantity = safe_decimal(random.randint(200, 600))
            actual_multiplier = Decimal(str(random.uniform(0.90, 1.05)))
            actual_quantity = safe_decimal(planned_quantity * actual_multiplier)
            wastage = safe_decimal(max(Decimal("0.00"), planned_quantity - actual_quantity) * Decimal("0.05"))
            milk_allocated = safe_decimal(planned_quantity * product.milk_required_per_unit)
            milk_used = safe_decimal(actual_quantity * product.milk_required_per_unit * Decimal("0.98"))
            start_dt = timezone.make_aware(datetime.combine(batch_date, time(hour=6 + index * 2)))
            end_dt = start_dt + timedelta(hours=8)

            batch, created_flag = ProductionBatch.objects.get_or_create(
                batch_id=batch_id,
                defaults={
                    "product": product,
                    "batch_date": batch_date,
                    "start_time": start_dt,
                    "end_time": end_dt,
                    "planned_quantity": planned_quantity,
                    "actual_quantity": actual_quantity,
                    "wastage_quantity": wastage,
                    "milk_allocated": milk_allocated,
                    "milk_used": milk_used,
                    "status": "completed",
                    "quality_check_passed": random.choice([True, True, True, False]),
                    "quality_notes": "Auto-generated batch data",
                    "supervisor": random.choice(staff_pool) if staff_pool else manager_user,
                },
            )
            if created_flag:
                operators = random.sample(staff_pool, k=min(3, len(staff_pool))) if staff_pool else []
                if operators:
                    batch.operators.set(operators)
                batch.save()
                created += 1

    print(f"[Production] Created {created} production batch records.")


def create_production_schedules(products):
    today = timezone.now().date()
    created = 0

    for day_offset in range(7):
        schedule_date = today + timedelta(days=day_offset)
        if not products:
            break
        daily_products = random.sample(products, k=min(3, len(products)))
        for priority, product in enumerate(daily_products, start=1):
            schedule, created_flag = ProductionSchedule.objects.get_or_create(
                schedule_date=schedule_date,
                product=product,
                defaults={
                    "planned_quantity": safe_decimal(random.randint(180, 480)),
                    "priority": priority,
                    "notes": "Auto-generated schedule",
                },
            )
            if created_flag:
                created += 1

    print(f"[Production] Created {created} production schedules.")


def ensure_inventory_items():
    item_seed = [
        {
            "item_id": "INV-0001",
            "name": "Raw Milk",
            "item_type": "raw_milk",
            "unit": "liter",
            "cost_per_unit": Decimal("45.00"),
            "current_stock": Decimal("2500.00"),
            "min_stock_level": Decimal("800.00"),
            "max_stock_level": Decimal("6000.00"),
            "reorder_point": Decimal("1200.00"),
            "storage_location": "Warehouse A",
        },
        {
            "item_id": "INV-0002",
            "name": "Paneer Packaging",
            "item_type": "packaging",
            "unit": "piece",
            "cost_per_unit": Decimal("6.50"),
            "current_stock": Decimal("1500.00"),
            "min_stock_level": Decimal("400.00"),
            "max_stock_level": Decimal("5000.00"),
            "reorder_point": Decimal("600.00"),
            "storage_location": "Warehouse B",
        },
        {
            "item_id": "INV-0003",
            "name": "Curd Cups",
            "item_type": "packaging",
            "unit": "piece",
            "cost_per_unit": Decimal("4.20"),
            "current_stock": Decimal("3200.00"),
            "min_stock_level": Decimal("800.00"),
            "max_stock_level": Decimal("6000.00"),
            "reorder_point": Decimal("1200.00"),
            "storage_location": "Warehouse C",
        },
        {
            "item_id": "INV-0004",
            "name": "Cleaning Solution",
            "item_type": "raw_material",
            "unit": "liter",
            "cost_per_unit": Decimal("120.00"),
            "current_stock": Decimal("220.00"),
            "min_stock_level": Decimal("60.00"),
            "max_stock_level": Decimal("600.00"),
            "reorder_point": Decimal("120.00"),
            "storage_location": "Maintenance Room",
        },
    ]

    items = []
    created = 0

    for entry in item_seed:
        defaults = {
            "name": entry["name"],
            "item_type": entry["item_type"],
            "description": "Auto-generated inventory item",
            "unit": entry["unit"],
            "cost_per_unit": entry["cost_per_unit"],
            "current_stock": entry["current_stock"],
            "min_stock_level": entry["min_stock_level"],
            "max_stock_level": entry["max_stock_level"],
            "reorder_point": entry["reorder_point"],
            "storage_location": entry["storage_location"],
            "storage_temperature": "",
            "is_active": True,
        }
        item, was_created = InventoryItem.objects.get_or_create(
            item_id=entry["item_id"],
            defaults=defaults,
        )
        if was_created:
            created += 1
        items.append(item)

    print(f"[Inventory] Ensured {len(items)} inventory items ({created} created).")
    return items


def create_stock_transactions(items, staff_pool):
    if not items:
        return

    today = timezone.now().date()
    created = 0

    for days_back in range(30):
        transaction_date = today - timedelta(days=days_back)
        transactions_per_day = random.randint(4, 7)
        for seq in range(transactions_per_day):
            item = random.choice(items)
            txn_id = f"TRX-{transaction_date.strftime('%Y%m%d')}-{seq:02d}-{item.item_id}"
            if StockTransaction.objects.filter(transaction_id=txn_id).exists():
                continue

            quantity = safe_decimal(random.randint(10, 90))
            is_addition = random.random() < 0.6
            stock_before = item.current_stock

            if not is_addition:
                if stock_before <= Decimal("0.00"):
                    continue
                if stock_before < quantity:
                    quantity = stock_before
            stock_after = stock_before + quantity if is_addition else stock_before - quantity

            transaction_type = random.choice(["purchase", "production", "sale", "adjustment"])
            if is_addition:
                transaction_type = random.choice(["purchase", "return", "production"])
            else:
                transaction_type = random.choice(["sale", "wastage", "transfer"])

            trans_datetime = timezone.make_aware(
                datetime.combine(transaction_date, time(hour=9 + seq))
            )

            StockTransaction.objects.create(
                transaction_id=txn_id,
                item=item,
                transaction_type=transaction_type,
                transaction_date=trans_datetime,
                quantity=quantity,
                is_addition=is_addition,
                stock_before=stock_before,
                stock_after=stock_after,
                unit_cost=item.cost_per_unit,
                total_cost=safe_decimal(item.cost_per_unit * quantity),
                reference_type="auto",
                reference_id=f"AUTO-{txn_id[-4:]}",
                performed_by=random.choice(staff_pool) if staff_pool else None,
                notes="Auto-generated inventory movement",
            )

            item.current_stock = stock_after
            item.save(update_fields=["current_stock"])
            created += 1

    print(f"[Inventory] Created {created} stock transactions.")


def ensure_vendors():
    vendor_seed = [
        {
            "vendor_id": "VEN-0001",
            "company_name": "Ram Dairy Supplies",
            "category": "raw_material",
            "contact_person": "Ram Lal",
            "phone": "9123456780",
            "email": "ram.supplies@example.com",
            "billing_address": "1 Trade Avenue, Mumbai, Maharashtra",
            "shipping_address": "1 Trade Avenue, Mumbai, Maharashtra",
            "gst_number": "27ABCDE1234F1Z5",
            "pan_number": "ABCDE1234F",
            "credit_limit": Decimal("500000.00"),
        },
        {
            "vendor_id": "VEN-0002",
            "company_name": "Krishna Packaging",
            "category": "packaging",
            "contact_person": "Krishna Kumar",
            "phone": "9123456781",
            "email": "krishna.pack@example.com",
            "billing_address": "18 Industrial Estate, Pune, Maharashtra",
            "shipping_address": "18 Industrial Estate, Pune, Maharashtra",
            "gst_number": "27ABCDE1234F1Z6",
            "pan_number": "ABCDE1235F",
            "credit_limit": Decimal("350000.00"),
        },
        {
            "vendor_id": "VEN-0003",
            "company_name": "Govind Agro Inputs",
            "category": "raw_material",
            "contact_person": "Govind Singh",
            "phone": "9123456782",
            "email": "govind.agro@example.com",
            "billing_address": "75 Market Yard, Nashik, Maharashtra",
            "shipping_address": "75 Market Yard, Nashik, Maharashtra",
            "gst_number": "27ABCDE1234F1Z7",
            "pan_number": "ABCDE1236F",
            "credit_limit": Decimal("400000.00"),
        },
    ]

    vendors = []
    created = 0

    for entry in vendor_seed:
        defaults = {
            "company_name": entry["company_name"],
            "category": entry["category"],
            "status": "active",
            "contact_person": entry["contact_person"],
            "phone": entry["phone"],
            "alternate_phone": "",
            "email": entry["email"],
            "website": "",
            "billing_address": entry["billing_address"],
            "shipping_address": entry["shipping_address"],
            "gst_number": entry["gst_number"],
            "pan_number": entry["pan_number"],
            "company_registration_number": "",
            "bank_name": "",
            "account_number": "",
            "ifsc_code": "",
            "account_holder_name": entry["company_name"],
            "credit_period_days": 30,
            "credit_limit": entry["credit_limit"],
            "payment_method": "bank_transfer",
            "discount_percentage": Decimal("0.00"),
            "rating": Decimal("4.00"),
            "total_purchases": Decimal("0.00"),
            "total_payments": Decimal("0.00"),
            "outstanding_balance": Decimal("0.00"),
            "documents": {},
            "notes": "Auto-generated vendor",
        }
        vendor, was_created = Vendor.objects.get_or_create(
            vendor_id=entry["vendor_id"],
            defaults=defaults,
        )
        if was_created:
            created += 1
        vendors.append(vendor)

    print(f"[Vendors] Ensured {len(vendors)} vendors ({created} created).")
    return vendors


def create_purchase_orders(vendors, admin_user, manager_user, inventory_items):
    created_pos = 0
    created_items = 0
    created_grns = 0
    created_payments = 0
    today = timezone.now().date()

    for vendor in vendors:
        for index in range(1, 3):
            po_number = f"PO-{vendor.vendor_id}-{index:03d}"
            po_date = today - timedelta(days=14 * index)
            expected_delivery = po_date + timedelta(days=7)
            actual_delivery = expected_delivery + timedelta(days=random.randint(0, 2))

            purchase_order, po_created = PurchaseOrder.objects.get_or_create(
                po_number=po_number,
                defaults={
                    "vendor": vendor,
                    "po_date": po_date,
                    "expected_delivery_date": expected_delivery,
                    "actual_delivery_date": actual_delivery,
                    "status": "confirmed",
                    "created_by": admin_user,
                    "approved_by": manager_user,
                    "approved_at": timezone.make_aware(datetime.combine(po_date, time(hour=10))),
                    "subtotal": Decimal("0.00"),
                    "tax_amount": Decimal("0.00"),
                    "discount_amount": Decimal("0.00"),
                    "total_amount": Decimal("0.00"),
                    "delivery_address": vendor.billing_address,
                    "shipping_method": "Logistics Partner",
                    "tracking_number": f"TRK-{po_number[-4:]}",
                    "terms_and_conditions": "Standard payment terms apply.",
                    "notes": "Auto-generated purchase order for testing.",
                    "is_recurring": False,
                },
            )

            if po_created:
                created_pos += 1

                line_count = random.randint(2, 3)
                base_subtotal = Decimal("0.00")
                for item_index in range(line_count):
                    inventory_item = random.choice(inventory_items) if inventory_items else None
                    quantity = safe_decimal(random.randint(10, 80))
                    unit_price = safe_decimal(random.uniform(200, 800))
                    tax_percentage = safe_decimal(random.uniform(5, 12))
                    PurchaseOrderItem.objects.create(
                        purchase_order=purchase_order,
                        item_name=inventory_item.name if inventory_item else f"Item {item_index + 1}",
                        description="Auto-generated purchase order line item",
                        quantity=quantity,
                        unit=inventory_item.unit if inventory_item else "unit",
                        unit_price=unit_price,
                        tax_percentage=tax_percentage,
                        discount_percentage=Decimal("0.00"),
                        line_total=Decimal("0.00"),
                        inventory_item=inventory_item,
                    )
                    base_subtotal += safe_decimal(quantity * unit_price)
                    created_items += 1

                tax_amount = safe_decimal(base_subtotal * Decimal("0.10"))
                total_amount = safe_decimal(base_subtotal + tax_amount)
                purchase_order.subtotal = base_subtotal
                purchase_order.tax_amount = tax_amount
                purchase_order.discount_amount = Decimal("0.00")
                purchase_order.total_amount = total_amount
                purchase_order.save(update_fields=["subtotal", "tax_amount", "discount_amount", "total_amount"])

                grn_number = f"GRN-{po_number}"
                grn, grn_created = GoodsReceiptNote.objects.get_or_create(
                    grn_number=grn_number,
                    defaults={
                        "purchase_order": purchase_order,
                        "receipt_date": actual_delivery,
                        "received_by": manager_user,
                        "quality_status": "approved",
                        "quality_notes": "Auto-generated GRN",
                        "quality_checked_by": manager_user,
                        "delivery_challan_number": f"DC-{po_number[-4:]}",
                        "invoice_number": f"INV-{po_number[-4:]}",
                        "notes": "Auto-generated receipt entry.",
                    },
                )
                if grn_created:
                    created_grns += 1
                    for po_item in purchase_order.items.all():
                        GRNItem.objects.get_or_create(
                            grn=grn,
                            po_item=po_item,
                            defaults={
                                "ordered_quantity": po_item.quantity,
                                "received_quantity": po_item.quantity,
                                "accepted_quantity": po_item.quantity,
                                "rejected_quantity": Decimal("0.00"),
                                "quality_check_passed": True,
                                "rejection_reason": "",
                                "batch_number": f"BN-{po_number[-3:]}{po_item.id}",
                                "expiry_date": actual_delivery + timedelta(days=365),
                            },
                        )

                payment_id = f"VP-{po_number}"
                payment, payment_created = VendorPayment.objects.get_or_create(
                    payment_id=payment_id,
                    defaults={
                        "vendor": vendor,
                        "payment_date": actual_delivery + timedelta(days=5),
                        "amount": total_amount,
                        "payment_method": "bank_transfer",
                        "status": "completed",
                        "is_advance": False,
                        "transaction_reference": f"PAY-{po_number[-4:]}",
                        "processed_by": admin_user,
                        "notes": "Auto-generated vendor payment.",
                    },
                )
                if payment_created:
                    payment.purchase_orders.add(purchase_order)
                    created_payments += 1

    for vendor in vendors:
        total_po = vendor.purchase_orders.aggregate(total=Sum("total_amount"))["total"] or Decimal("0.00")
        total_payments = vendor.payments.aggregate(total=Sum("amount"))["total"] or Decimal("0.00")
        vendor.total_purchases = safe_decimal(total_po)
        vendor.total_payments = safe_decimal(total_payments)
        vendor.outstanding_balance = safe_decimal(total_po - total_payments)
        vendor.rating = safe_decimal(random.uniform(3.5, 4.8))
        vendor.save(update_fields=["total_purchases", "total_payments", "outstanding_balance", "rating"])

    print(
        f"[Vendors] Created {created_pos} purchase orders, {created_items} line items, "
        f"{created_grns} GRNs, and {created_payments} payments."
    )


def ensure_departments():
    department_seed = [
        {
            "department_id": "DEPT-PROD",
            "name": "Production",
            "description": "Production operations",
        },
        {
            "department_id": "DEPT-QUAL",
            "name": "Quality Assurance",
            "description": "Quality control and testing",
        },
        {
            "department_id": "DEPT-PROC",
            "name": "Procurement",
            "description": "Supplier and procurement management",
        },
        {
            "department_id": "DEPT-INV",
            "name": "Inventory",
            "description": "Inventory planning and stock control",
        },
        {
            "department_id": "DEPT-HR",
            "name": "Human Resources",
            "description": "Employee management",
        },
    ]

    departments = {}
    created = 0

    for entry in department_seed:
        dept, was_created = Department.objects.get_or_create(
            department_id=entry["department_id"],
            defaults={
                "name": entry["name"],
                "description": entry["description"],
                "is_active": True,
            },
        )
        if was_created:
            created += 1
        departments[entry["department_id"]] = dept

    print(f"[Employees] Ensured {len(departments)} departments ({created} created).")
    return departments


def create_employees(departments):
    User = get_user_model()
    today = timezone.now().date()
    employee_seed = [
        {
            "employee_id": "EMP-0001",
            "username": "rahul.sharma",
            "email": "rahul.sharma@ichhadhari.com",
            "first_name": "Rahul",
            "last_name": "Sharma",
            "gender": "male",
            "marital_status": "married",
            "employment_type": "full_time",
            "department_key": "DEPT-PROD",
            "designation": "Production Manager",
            "role": "manager",
        },
        {
            "employee_id": "EMP-0002",
            "username": "priya.singh",
            "email": "priya.singh@ichhadhari.com",
            "first_name": "Priya",
            "last_name": "Singh",
            "gender": "female",
            "marital_status": "single",
            "employment_type": "full_time",
            "department_key": "DEPT-QUAL",
            "designation": "Quality Inspector",
            "role": "supervisor",
        },
        {
            "employee_id": "EMP-0003",
            "username": "amit.kumar",
            "email": "amit.kumar@ichhadhari.com",
            "first_name": "Amit",
            "last_name": "Kumar",
            "gender": "male",
            "marital_status": "married",
            "employment_type": "full_time",
            "department_key": "DEPT-PROC",
            "designation": "Procurement Officer",
            "role": "supervisor",
        },
        {
            "employee_id": "EMP-0004",
            "username": "neha.patel",
            "email": "neha.patel@ichhadhari.com",
            "first_name": "Neha",
            "last_name": "Patel",
            "gender": "female",
            "marital_status": "single",
            "employment_type": "full_time",
            "department_key": "DEPT-INV",
            "designation": "Inventory Manager",
            "role": "manager",
        },
        {
            "employee_id": "EMP-0005",
            "username": "anjali.verma",
            "email": "anjali.verma@ichhadhari.com",
            "first_name": "Anjali",
            "last_name": "Verma",
            "gender": "female",
            "marital_status": "single",
            "employment_type": "full_time",
            "department_key": "DEPT-QUAL",
            "designation": "Quality Technician",
            "role": "operator",
        },
    ]

    employees = []

    for entry in employee_seed:
        user_defaults = {
            "email": entry["email"],
            "first_name": entry["first_name"],
            "last_name": entry["last_name"],
            "role": entry["role"],
            "department": entry["department_key"],
            "is_staff": entry["role"] in {"manager", "supervisor"},
        }
        user, user_created = User.objects.get_or_create(
            username=entry["username"],
            defaults=user_defaults,
        )
        if user_created:
            user.set_password("Employee@123")
            user.save()
        else:
            changed = False
            for field, value in user_defaults.items():
                if getattr(user, field) != value:
                    setattr(user, field, value)
                    changed = True
            if changed:
                user.save()

        department = departments.get(entry["department_key"])
        employee, created_flag = Employee.objects.get_or_create(
            employee_id=entry["employee_id"],
            defaults={
                "user": user,
                "first_name": entry["first_name"],
                "last_name": entry["last_name"],
                "date_of_birth": today - timedelta(days=random.randint(9000, 16000)),
                "gender": entry["gender"],
                "marital_status": entry["marital_status"],
                "personal_email": entry["email"],
                "phone": f"98{random.randint(10000000, 99999999)}",
                "alternate_phone": "",
                "current_address": "Auto-generated employee address",
                "permanent_address": "Auto-generated employee address",
                "city": "Mumbai",
                "state": "Maharashtra",
                "pincode": "400001",
                "emergency_contact_name": "Test Contact",
                "emergency_contact_phone": f"98{random.randint(10000000, 99999999)}",
                "emergency_contact_relation": "Family",
                "date_of_joining": today - timedelta(days=random.randint(200, 1200)),
                "employment_type": entry["employment_type"],
                "probation_period_months": 6,
                "is_probation_completed": True,
                "department": department,
                "designation": entry["designation"],
                "reporting_manager": None,
                "aadhaar_number": f"1234{random.randint(10000000, 99999999)}",
                "pan_number": f"ABCDE{random.randint(1000, 9999)}F",
                "documents": {},
                "bank_name": "State Bank of India",
                "account_number": f"1234567890{random.randint(10, 99)}",
                "ifsc_code": "SBIN0000999",
                "is_active": True,
                "notes": "Auto-generated employee profile",
            },
        )
        if created_flag:
            employee.save()
        employees.append(employee)

    if employees:
        manager = employees[0]
        for employee in employees[1:]:
            if employee.reporting_manager_id != manager.id:
                employee.reporting_manager = manager
                employee.save(update_fields=["reporting_manager"])

    print(f"[Employees] Ensured {len(employees)} employee profiles.")
    return employees


def assign_department_heads(departments, employees):
    for dept in departments.values():
        manager = next(
            (emp for emp in employees if emp.department_id == dept.id and "Manager" in emp.designation),
            None,
        )
        if manager and dept.head_id != manager.id:
            dept.head = manager
            dept.save(update_fields=["head"])

    print("[Employees] Assigned department heads where available.")


def create_attendance_records(employees, admin_user, manager_user):
    today = timezone.now().date()
    created = 0

    for days_back in range(30):
        record_date = today - timedelta(days=days_back)
        for employee in employees:
            status = "present" if random.random() < 0.9 else "absent"
            check_in = None
            check_out = None
            working_hours = Decimal("0.00")
            overtime = Decimal("0.00")

            if status == "present":
                check_in = time(hour=9, minute=random.randint(0, 20))
                check_out = time(hour=18, minute=random.randint(0, 45))
                working_hours = safe_decimal(8 + random.uniform(0.0, 0.5))
                overtime = safe_decimal(random.uniform(0.0, 1.0)) if random.random() < 0.2 else Decimal("0.00")

            attendance, created_flag = Attendance.objects.get_or_create(
                employee=employee,
                date=record_date,
                defaults={
                    "status": status,
                    "check_in_time": check_in,
                    "check_out_time": check_out,
                    "working_hours": working_hours,
                    "overtime_hours": overtime,
                    "check_in_location": "Main Plant",
                    "check_out_location": "Main Plant",
                    "marked_by": admin_user,
                    "approved_by": manager_user,
                    "reason_for_absence": "Auto-generated test data" if status != "present" else "",
                    "notes": "Generated for testing",
                },
            )
            if created_flag:
                created += 1

    print(f"[Employees] Created {created} attendance records.")


def ensure_salary_structures(employees):
    created = 0
    reference_date = timezone.now().date().replace(day=1) - timedelta(days=120)

    for employee in employees:
        base_salary = safe_decimal(random.randint(28000, 60000))
        defaults = {
            "employee": employee,
            "basic_salary": base_salary,
            "hra": safe_decimal(base_salary * Decimal("0.40")),
            "da": safe_decimal(base_salary * Decimal("0.10")),
            "transport_allowance": safe_decimal(2000),
            "medical_allowance": safe_decimal(1500),
            "special_allowance": safe_decimal(2500),
            "provident_fund": safe_decimal(base_salary * Decimal("0.12")),
            "professional_tax": safe_decimal(200),
            "income_tax": safe_decimal(base_salary * Decimal("0.10")),
            "effective_from": reference_date,
            "effective_to": None,
            "is_active": True,
        }
        salary_structure, created_flag = SalaryStructure.objects.get_or_create(
            employee=employee,
            effective_from=defaults["effective_from"],
            defaults=defaults,
        )
        if created_flag:
            created += 1

    print(f"[Employees] Ensured salary structures ({created} created).")


def create_payroll_records(employees, admin_user):
    today = timezone.now().date()
    created = 0

    for employee in employees:
        salary_structure = (
            employee.salary_structures.filter(is_active=True).order_by("-effective_from").first()
        )
        if not salary_structure:
            continue

        for months_back in range(3):
            period_date = add_months(today, -months_back)
            period_start, period_end = month_bounds(period_date)
            working_days = (period_end - period_start).days + 1
            attendance_records = employee.attendance_records.filter(
                date__gte=period_start,
                date__lte=period_end,
            )
            days_present = attendance_records.filter(status="present").count()
            days_absent = max(0, working_days - days_present)
            days_on_leave = attendance_records.filter(status="on_leave").count()

            gross_salary = salary_structure.gross_salary
            deductions = salary_structure.total_deductions
            net_salary = safe_decimal(gross_salary - deductions)

            bonus = safe_decimal(gross_salary * Decimal("0.10")) if months_back == 0 else Decimal("0.00")
            incentive = safe_decimal(gross_salary * Decimal("0.05")) if months_back == 0 else Decimal("0.00")
            overtime_hours = sum((record.overtime_hours or Decimal("0.00")) for record in attendance_records)
            overtime_payment = safe_decimal(overtime_hours * Decimal("150"))
            total_payable = safe_decimal(net_salary + bonus + incentive + overtime_payment)

            status = "pending" if months_back == 0 else "paid"
            payment_date = None if status == "pending" else period_end + timedelta(days=2)

            payroll_record, created_flag = PayrollRecord.objects.get_or_create(
                employee=employee,
                month=period_start.month,
                year=period_start.year,
                defaults={
                    "salary_structure": salary_structure,
                    "working_days": working_days,
                    "days_present": days_present,
                    "days_absent": days_absent,
                    "days_on_leave": days_on_leave,
                    "gross_salary": gross_salary,
                    "deductions": deductions,
                    "net_salary": net_salary,
                    "bonus": bonus,
                    "incentive": incentive,
                    "overtime_payment": overtime_payment,
                    "total_payable": total_payable,
                    "status": status,
                    "payment_date": payment_date,
                    "payment_method": "bank_transfer",
                    "transaction_reference": f"PAY-{employee.employee_id}-{period_start.strftime('%Y%m')}",
                    "approved_by": admin_user,
                },
            )

            if created_flag:
                created += 1

    print(f"[Employees] Created {created} payroll records.")


def print_summary():
    summary = {
        "Users": get_user_model().objects.count(),
        "Suppliers": Supplier.objects.count(),
        "MilkCollections": MilkCollection.objects.count(),
        "MilkPayments": MilkPayment.objects.count(),
        "Products": Product.objects.count(),
        "ProductionBatches": ProductionBatch.objects.count(),
        "ProductionSchedules": ProductionSchedule.objects.count(),
        "InventoryItems": InventoryItem.objects.count(),
        "StockTransactions": StockTransaction.objects.count(),
        "Vendors": Vendor.objects.count(),
        "PurchaseOrders": PurchaseOrder.objects.count(),
        "VendorPayments": VendorPayment.objects.count(),
        "GoodsReceiptNotes": GoodsReceiptNote.objects.count(),
        "Employees": Employee.objects.count(),
        "AttendanceRecords": Attendance.objects.count(),
        "SalaryStructures": SalaryStructure.objects.count(),
        "PayrollRecords": PayrollRecord.objects.count(),
    }

    print("\nGenerated data overview:")
    for label, count in summary.items():
        print(f"  {label}: {count}")

    print("\nTest login accounts:")
    print("  Admin: admin@ichhadhari.com / Admin@123")
    print("  Manager: manager@ichhadhari.com / Manager@123")


def main():
    random.seed(RANDOM_SEED)

    actors = ensure_users()
    suppliers, supplier_meta = ensure_suppliers()
    create_milk_collections(suppliers, supplier_meta, actors)
    create_milk_payments(suppliers, actors["admin"])
    update_supplier_metrics(suppliers)

    products = ensure_products()
    create_production_batches(products, actors)
    create_production_schedules(products)

    inventory_items = ensure_inventory_items()
    create_stock_transactions(inventory_items, actors["staff_pool"])

    vendors = ensure_vendors()
    create_purchase_orders(vendors, actors["admin"], actors["manager"], inventory_items)

    departments = ensure_departments()
    employees = create_employees(departments)
    assign_department_heads(departments, employees)
    create_attendance_records(employees, actors["admin"], actors["manager"])
    ensure_salary_structures(employees)
    create_payroll_records(employees, actors["admin"])

    print_summary()


if __name__ == "__main__":
    main()
