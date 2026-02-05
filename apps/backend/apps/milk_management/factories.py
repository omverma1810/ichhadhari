"""
Factory classes for milk management models.

Uses factory_boy to generate test data.
"""

import factory
from factory.django import DjangoModelFactory
from datetime import date, timedelta
from decimal import Decimal

from apps.milk_management.models import Supplier, MilkCollection, Payment
from apps.authentication.factories import UserFactory


class SupplierFactory(DjangoModelFactory):
    """Factory for creating Supplier instances."""
    
    class Meta:
        model = Supplier
        django_get_or_create = ('code',)
    
    name = factory.Sequence(lambda n: f'Dairy Farm {n}')
    code = factory.Sequence(lambda n: f'DF{n:04d}')
    contact_person = factory.Faker('name')
    phone_number = factory.Faker('phone_number')
    email = factory.LazyAttribute(lambda obj: f'{obj.code.lower()}@example.com')
    address = factory.Faker('address')
    status = 'active'
    payment_terms = 'Weekly'
    created_by = factory.SubFactory(UserFactory)


class MilkCollectionFactory(DjangoModelFactory):
    """Factory for creating MilkCollection instances."""
    
    class Meta:
        model = MilkCollection
    
    supplier = factory.SubFactory(SupplierFactory)
    collection_date = factory.LazyFunction(date.today)
    shift = factory.Iterator(['morning', 'evening'])
    quantity = factory.Faker('pydecimal', left_digits=3, right_digits=2, positive=True, min_value=50, max_value=500)
    fat = factory.Faker('pydecimal', left_digits=1, right_digits=2, positive=True, min_value=3, max_value=9)
    snf = factory.Faker('pydecimal', left_digits=1, right_digits=2, positive=True, min_value=7, max_value=10)
    temperature = factory.Faker('pydecimal', left_digits=1, right_digits=1, positive=True, min_value=2, max_value=8)
    rate_per_fat = Decimal('60.00')
    rate_per_snf = Decimal('10.00')
    quality_grade = factory.Iterator(['A', 'B', 'C'])
    status = 'approved'
    recorded_by = factory.SubFactory(UserFactory)


class PaymentFactory(DjangoModelFactory):
    """Factory for creating Payment instances."""
    
    class Meta:
        model = Payment
    
    supplier = factory.SubFactory(SupplierFactory)
    payment_date = factory.LazyFunction(date.today)
    amount = factory.Faker('pydecimal', left_digits=5, right_digits=2, positive=True, min_value=1000, max_value=50000)
    payment_method = factory.Iterator(['cash', 'bank_transfer', 'cheque', 'upi'])
    reference_number = factory.Sequence(lambda n: f'PAY{n:06d}')
    status = 'completed'
    created_by = factory.SubFactory(UserFactory)
