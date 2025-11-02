"""
Factory classes for vendor models.

Uses factory_boy to generate test data.
"""

import factory
from factory.django import DjangoModelFactory
from datetime import date, timedelta
from decimal import Decimal

from apps.vendors.models import Vendor, PurchaseOrder, POItem, VendorPayment, GoodsReceiptNote, GRNItem
from apps.inventory.factories import InventoryItemFactory
from apps.authentication.factories import UserFactory


class VendorFactory(DjangoModelFactory):
    """Factory for creating Vendor instances."""
    
    class Meta:
        model = Vendor
        django_get_or_create = ('code',)
    
    name = factory.Sequence(lambda n: f'Vendor {n}')
    code = factory.Sequence(lambda n: f'VEN{n:04d}')
    vendor_type = factory.Iterator(['supplier', 'contractor', 'service_provider'])
    contact_person = factory.Faker('name')
    phone_number = factory.Faker('phone_number')
    email = factory.LazyAttribute(lambda obj: f'{obj.code.lower()}@example.com')
    address = factory.Faker('address')
    city = factory.Faker('city')
    state = factory.Faker('state')
    postal_code = factory.Faker('postcode')
    country = 'India'
    gstin = factory.Sequence(lambda n: f'22AAAAA0000A{n:1d}Z{n:1d}')
    pan = factory.Sequence(lambda n: f'AAAAA{n:04d}A')
    payment_terms = 'Net 30'
    credit_limit = factory.Faker('pydecimal', left_digits=6, right_digits=2, positive=True, min_value=10000, max_value=500000)
    status = 'active'
    created_by = factory.SubFactory(UserFactory)


class PurchaseOrderFactory(DjangoModelFactory):
    """Factory for creating PurchaseOrder instances."""
    
    class Meta:
        model = PurchaseOrder
    
    po_number = factory.Sequence(lambda n: f'PO{n:07d}')
    vendor = factory.SubFactory(VendorFactory)
    order_date = factory.LazyFunction(date.today)
    expected_delivery_date = factory.LazyFunction(lambda: date.today() + timedelta(days=7))
    actual_delivery_date = None
    status = 'draft'
    total_amount = Decimal('0.00')
    tax_amount = Decimal('0.00')
    grand_total = Decimal('0.00')
    payment_terms = 'Net 30'
    delivery_address = factory.Faker('address')
    notes = factory.Faker('sentence')
    created_by = factory.SubFactory(UserFactory)
    approved_by = None
    approved_at = None


class POItemFactory(DjangoModelFactory):
    """Factory for creating POItem instances."""
    
    class Meta:
        model = POItem
    
    purchase_order = factory.SubFactory(PurchaseOrderFactory)
    item = factory.SubFactory(InventoryItemFactory)
    description = factory.Faker('sentence')
    quantity = factory.Faker('pydecimal', left_digits=3, right_digits=2, positive=True, min_value=10, max_value=500)
    unit = factory.LazyAttribute(lambda obj: obj.item.unit)
    unit_price = factory.Faker('pydecimal', left_digits=4, right_digits=2, positive=True, min_value=10, max_value=1000)
    total_price = factory.LazyAttribute(lambda obj: obj.quantity * obj.unit_price)


class VendorPaymentFactory(DjangoModelFactory):
    """Factory for creating VendorPayment instances."""
    
    class Meta:
        model = VendorPayment
    
    vendor = factory.SubFactory(VendorFactory)
    purchase_order = factory.SubFactory(PurchaseOrderFactory)
    payment_date = factory.LazyFunction(date.today)
    amount = factory.Faker('pydecimal', left_digits=6, right_digits=2, positive=True, min_value=1000, max_value=100000)
    payment_method = factory.Iterator(['cash', 'bank_transfer', 'cheque', 'upi', 'credit_card'])
    reference_number = factory.Sequence(lambda n: f'VPAY{n:06d}')
    notes = factory.Faker('sentence')
    status = 'completed'
    created_by = factory.SubFactory(UserFactory)


class GoodsReceiptNoteFactory(DjangoModelFactory):
    """Factory for creating GoodsReceiptNote instances."""
    
    class Meta:
        model = GoodsReceiptNote
    
    grn_number = factory.Sequence(lambda n: f'GRN{n:07d}')
    purchase_order = factory.SubFactory(PurchaseOrderFactory)
    vendor = factory.LazyAttribute(lambda obj: obj.purchase_order.vendor)
    receipt_date = factory.LazyFunction(date.today)
    status = 'pending'
    notes = factory.Faker('sentence')
    received_by = factory.SubFactory(UserFactory)
    verified_by = None
    verified_at = None


class GRNItemFactory(DjangoModelFactory):
    """Factory for creating GRNItem instances."""
    
    class Meta:
        model = GRNItem
    
    grn = factory.SubFactory(GoodsReceiptNoteFactory)
    po_item = factory.SubFactory(POItemFactory)
    item = factory.LazyAttribute(lambda obj: obj.po_item.item)
    ordered_quantity = factory.LazyAttribute(lambda obj: obj.po_item.quantity)
    received_quantity = factory.LazyAttribute(lambda obj: obj.ordered_quantity * Decimal('0.95'))
    unit = factory.LazyAttribute(lambda obj: obj.item.unit)
    status = factory.Iterator(['accepted', 'rejected', 'partial'])
    notes = factory.Faker('sentence')
