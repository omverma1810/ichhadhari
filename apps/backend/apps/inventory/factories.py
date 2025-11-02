"""
Factory classes for inventory models.

Uses factory_boy to generate test data.
"""

import factory
from factory.django import DjangoModelFactory
from decimal import Decimal

from apps.inventory.models import InventoryItem, InventoryTransaction, InventoryAlert
from apps.authentication.factories import UserFactory


class InventoryItemFactory(DjangoModelFactory):
    """Factory for creating InventoryItem instances."""
    
    class Meta:
        model = InventoryItem
        django_get_or_create = ('code',)
    
    name = factory.Sequence(lambda n: f'Item {n}')
    code = factory.Sequence(lambda n: f'ITEM{n:04d}')
    category = factory.Iterator(['raw_material', 'finished_good', 'packaging', 'other'])
    unit = factory.Iterator(['Kg', 'Liters', 'Pieces', 'Boxes'])
    current_quantity = factory.Faker('pydecimal', left_digits=4, right_digits=2, positive=True, min_value=0, max_value=1000)
    min_stock_level = factory.Faker('pydecimal', left_digits=3, right_digits=2, positive=True, min_value=50, max_value=200)
    max_stock_level = factory.Faker('pydecimal', left_digits=4, right_digits=2, positive=True, min_value=500, max_value=2000)
    reorder_point = factory.LazyAttribute(lambda obj: obj.min_stock_level * Decimal('1.5'))
    location = factory.Faker('word')
    description = factory.Faker('text', max_nb_chars=200)
    is_active = True


class InventoryTransactionFactory(DjangoModelFactory):
    """Factory for creating InventoryTransaction instances."""
    
    class Meta:
        model = InventoryTransaction
    
    item = factory.SubFactory(InventoryItemFactory)
    transaction_type = factory.Iterator(['in', 'out', 'adjustment'])
    quantity = factory.Faker('pydecimal', left_digits=3, right_digits=2, positive=True, min_value=10, max_value=500)
    unit_price = factory.Faker('pydecimal', left_digits=4, right_digits=2, positive=True, min_value=10, max_value=1000)
    total_price = factory.LazyAttribute(lambda obj: obj.quantity * obj.unit_price if obj.unit_price else None)
    reference_type = None
    reference_id = None
    notes = factory.Faker('sentence')
    created_by = factory.SubFactory(UserFactory)


class InventoryAlertFactory(DjangoModelFactory):
    """Factory for creating InventoryAlert instances."""
    
    class Meta:
        model = InventoryAlert
    
    item = factory.SubFactory(InventoryItemFactory)
    alert_type = factory.Iterator(['low_stock', 'out_of_stock', 'expiry', 'overstock'])
    severity = factory.Iterator(['low', 'medium', 'high', 'critical'])
    message = factory.LazyAttribute(lambda obj: f'{obj.alert_type.replace("_", " ").title()} alert for {obj.item.name}')
    status = 'active'
    acknowledged_by = None
    acknowledged_at = None
    resolved_by = None
    resolved_at = None
