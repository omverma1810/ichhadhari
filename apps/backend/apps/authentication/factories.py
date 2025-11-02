"""
Factory classes for authentication models.

Uses factory_boy to generate test data.
"""

import factory
from django.contrib.auth import get_user_model
from factory.django import DjangoModelFactory

User = get_user_model()


class UserFactory(DjangoModelFactory):
    """Factory for creating User instances."""
    
    class Meta:
        model = User
        django_get_or_create = ('username',)
    
    username = factory.Sequence(lambda n: f'user{n}')
    email = factory.LazyAttribute(lambda obj: f'{obj.username}@example.com')
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    password = factory.PostGenerationMethodCall('set_password', 'testpass123')
    is_active = True
    is_staff = False
    is_superuser = False


class AdminUserFactory(UserFactory):
    """Factory for creating admin User instances."""
    
    username = factory.Sequence(lambda n: f'admin{n}')
    is_staff = True
    is_superuser = True


class StaffUserFactory(UserFactory):
    """Factory for creating staff User instances."""
    
    username = factory.Sequence(lambda n: f'staff{n}')
    is_staff = True
    is_superuser = False
