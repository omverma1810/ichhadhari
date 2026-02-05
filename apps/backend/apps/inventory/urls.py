from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    InventoryItemViewSet,
    StockTransactionViewSet,
    RawMaterialStockViewSet,
    FinishedGoodsStockViewSet,
    StockAlertViewSet,
    InventoryAnalyticsViewSet
)

# Create router and register viewsets
router = DefaultRouter()
router.register(r'items', InventoryItemViewSet, basename='inventory-item')
router.register(r'transactions', StockTransactionViewSet, basename='stock-transaction')
router.register(r'raw-materials', RawMaterialStockViewSet, basename='raw-material-stock')
router.register(r'finished-goods', FinishedGoodsStockViewSet, basename='finished-goods-stock')
router.register(r'alerts', StockAlertViewSet, basename='stock-alert')
router.register(r'analytics', InventoryAnalyticsViewSet, basename='inventory-analytics')

urlpatterns = [
    path('', include(router.urls)),
]
