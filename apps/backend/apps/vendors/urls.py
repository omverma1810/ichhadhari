from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    VendorViewSet,
    PurchaseOrderViewSet,
    VendorPaymentViewSet,
    GoodsReceiptNoteViewSet,
    VendorInvoiceViewSet,
    VendorProductPriceViewSet
)

# Create router and register viewsets
router = DefaultRouter()
router.register(r'vendors', VendorViewSet, basename='vendor')
router.register(r'purchase-orders', PurchaseOrderViewSet, basename='purchase-order')
router.register(r'payments', VendorPaymentViewSet, basename='vendor-payment')
router.register(r'grns', GoodsReceiptNoteViewSet, basename='grn')
router.register(r'invoices', VendorInvoiceViewSet, basename='vendor-invoice')
router.register(r'product-prices', VendorProductPriceViewSet, basename='vendor-product-price')

urlpatterns = [
    path('', include(router.urls)),
]

