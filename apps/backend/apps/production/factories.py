"""
Factory classes for production models.

Uses factory_boy to generate test data.
"""

import factory
from factory.django import DjangoModelFactory
from datetime import date, timedelta
from decimal import Decimal

from apps.production.models import Product, ProductionBatch, ProductionSchedule
from apps.authentication.factories import UserFactory


class ProductFactory(DjangoModelFactory):
    """Factory for creating Product instances."""
    
    class Meta:
        model = Product
        django_get_or_create = ('code',)
    
    name = factory.Sequence(lambda n: f'Product {n}')
    code = factory.Sequence(lambda n: f'PROD{n:04d}')
    category = factory.Iterator(['Dairy', 'Beverage', 'Dessert', 'Other'])
    description = factory.Faker('text', max_nb_chars=200)
    unit = factory.Iterator(['Liters', 'Kg', 'Pieces', 'Boxes'])
    shelf_life_days = factory.Faker('random_int', min=3, max=30)
    storage_temperature = factory.Faker('random_int', min=2, max=8)
    is_active = True
    created_by = factory.SubFactory(UserFactory)


class ProductionBatchFactory(DjangoModelFactory):
    """Factory for creating ProductionBatch instances."""
    
    class Meta:
        model = ProductionBatch
    
    batch_number = factory.Sequence(lambda n: f'BATCH{n:07d}')
    product = factory.SubFactory(ProductFactory)
    planned_quantity = factory.Faker('pydecimal', left_digits=4, right_digits=2, positive=True, min_value=100, max_value=5000)
    actual_quantity = None
    status = 'planned'
    start_date = None
    end_date = None
    completion_date = None
    quality_check_passed = None
    supervisor = factory.SubFactory(UserFactory)


class ProductionScheduleFactory(DjangoModelFactory):
    """Factory for creating ProductionSchedule instances."""
    
    class Meta:
        model = ProductionSchedule
    
    product = factory.SubFactory(ProductFactory)
    scheduled_date = factory.LazyFunction(lambda: date.today() + timedelta(days=1))
    shift = factory.Iterator(['morning', 'afternoon', 'night'])
    quantity = factory.Faker('pydecimal', left_digits=4, right_digits=2, positive=True, min_value=100, max_value=5000)
    priority = factory.Iterator(['low', 'medium', 'high', 'urgent'])
    status = 'scheduled'
    assigned_to = factory.SubFactory(UserFactory)
