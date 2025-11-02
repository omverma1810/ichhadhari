"""
URL configuration for Milk Management System
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SupplierViewSet, MilkCollectionViewSet, MilkPaymentViewSet

# Create a router and register viewsets
router = DefaultRouter()
router.register(r'suppliers', SupplierViewSet, basename='supplier')
router.register(r'collections', MilkCollectionViewSet, basename='collection')
router.register(r'payments', MilkPaymentViewSet, basename='payment')

urlpatterns = [
    path('', include(router.urls)),
]
