from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    VendorViewSet,
    PurchaseOrderViewSet,
    VendorPaymentViewSet,
    GoodsReceiptNoteViewSet,
    VendorInvoiceViewSet
)

# Create router and register viewsets
router = DefaultRouter()
router.register(r'vendors', VendorViewSet, basename='vendor')
router.register(r'purchase-orders', PurchaseOrderViewSet, basename='purchase-order')
router.register(r'payments', VendorPaymentViewSet, basename='vendor-payment')
router.register(r'grns', GoodsReceiptNoteViewSet, basename='grn')
router.register(r'invoices', VendorInvoiceViewSet, basename='vendor-invoice')

urlpatterns = [
    path('', include(router.urls)),
]
