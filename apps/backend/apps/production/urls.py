"""
Production Management URL Configuration

Defines URL patterns for production API endpoints.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, ProductionBatchViewSet, ProductionScheduleViewSet

# Create router and register viewsets
router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'batches', ProductionBatchViewSet, basename='batch')
router.register(r'schedules', ProductionScheduleViewSet, basename='schedule')

# URL patterns
urlpatterns = [
    path('', include(router.urls)),
]
