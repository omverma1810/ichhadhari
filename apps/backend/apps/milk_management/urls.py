"""
URL configuration for Milk Management System
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SupplierViewSet, MilkCollectionViewSet, MilkPaymentViewSet, MilkSegregationPlanViewSet

# Create a router and register viewsets
router = DefaultRouter()
router.register(r'suppliers', SupplierViewSet, basename='supplier')
router.register(r'collections', MilkCollectionViewSet, basename='collection')
router.register(r'payments', MilkPaymentViewSet, basename='payment')
router.register(r'segregation-plans', MilkSegregationPlanViewSet, basename='segregation-plan')

urlpatterns = [
    path('', include(router.urls)),
]
