# 🧾 COMPLETE INVOICE SYSTEM - Ichhadhari Dairy Management

## 📋 PROJECT OVERVIEW

Implement a complete vendor invoice management system with:
- ✅ Invoice creation, viewing, editing, deletion
- ✅ PDF download functionality
- ✅ Direct printing (Ctrl+P / Cmd+P)
- ✅ Optimized for TVS RP-45 Dot Matrix Printer (40 columns)
- ✅ Professional design matching existing theme
- ✅ Multi-invoice management

---

## 🖨️ PRINTER SPECIFICATIONS

### TVS RP-45 Shoppe POS Dot Matrix Printer

**Print Specifications:**
- Type: 9-pin serial impact dot matrix
- Print Width: 2.25" – 3.9" (40 columns)
- Print Font: 7 x 9 dot matrix
- Speed: 5 lps @ 16 cpi, 15 bills/minute
- Resolution: Character-based (not graphic)
- Color: Monochrome (black only)

**Paper:**
- Width: Up to 4.13" (104.9mm)
- Type: Plain paper, continuous or single sheet

**Connectivity:**
- USB, Parallel, Serial, Cash Drawer

**Design Requirements:**
- Text-based layout (no complex graphics)
- Maximum 40 characters per line
- Simple borders using ASCII characters
- High contrast black text on white

---

## 🗄️ DATABASE SCHEMA

### Backend Models (Django)

**File:** `apps/backend/vendors/models.py`

Add to existing vendors app:

```python
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal

User = get_user_model()

class VendorInvoice(models.Model):
    """Vendor Invoice Model"""
    
    INVOICE_STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('sent', 'Sent'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
        ('cancelled', 'Cancelled'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('unpaid', 'Unpaid'),
        ('partially_paid', 'Partially Paid'),
        ('paid', 'Paid'),
    ]
    
    # Primary Fields
    invoice_number = models.CharField(
        max_length=50, 
        unique=True, 
        editable=False,
        help_text="Auto-generated invoice number"
    )
    vendor = models.ForeignKey(
        'Vendor', 
        on_delete=models.CASCADE, 
        related_name='invoices'
    )
    
    # Dates
    invoice_date = models.DateField(default=timezone.now)
    due_date = models.DateField()
    
    # Status
    status = models.CharField(
        max_length=20, 
        choices=INVOICE_STATUS_CHOICES, 
        default='draft'
    )
    payment_status = models.CharField(
        max_length=20, 
        choices=PAYMENT_STATUS_CHOICES, 
        default='unpaid'
    )
    
    # Financial Fields
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    amount_due = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Additional Info
    notes = models.TextField(blank=True, null=True)
    terms_and_conditions = models.TextField(blank=True, null=True)
    reference_number = models.CharField(max_length=100, blank=True, null=True)
    
    # Tracking
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='created_invoices'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-invoice_date', '-created_at']
        indexes = [
            models.Index(fields=['vendor', 'status']),
            models.Index(fields=['invoice_date']),
        ]
    
    def __str__(self):
        return f"{self.invoice_number} - {self.vendor.name}"
    
    def save(self, *args, **kwargs):
        # Auto-generate invoice number
        if not self.invoice_number:
            last_invoice = VendorInvoice.objects.order_by('-id').first()
            if last_invoice:
                last_num = int(last_invoice.invoice_number.split('-')[-1])
                new_num = last_num + 1
            else:
                new_num = 1
            
            date_str = timezone.now().strftime('%Y%m')
            self.invoice_number = f"INV-{date_str}-{new_num:05d}"
        
        # Calculate amount due
        self.amount_due = self.total_amount - self.amount_paid
        
        # Update payment status
        if self.amount_paid == 0:
            self.payment_status = 'unpaid'
        elif self.amount_paid >= self.total_amount:
            self.payment_status = 'paid'
        else:
            self.payment_status = 'partially_paid'
        
        super().save(*args, **kwargs)


class VendorInvoiceItem(models.Model):
    """Invoice Line Items"""
    
    invoice = models.ForeignKey(
        VendorInvoice, 
        on_delete=models.CASCADE, 
        related_name='items'
    )
    
    # Item Details
    item_description = models.CharField(max_length=255)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=50, default='piece')
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Calculated
    line_total = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Optional
    tax_rate = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=0,
        help_text="Tax rate in percentage"
    )
    discount_percentage = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=0
    )
    
    class Meta:
        ordering = ['id']
    
    def __str__(self):
        return f"{self.item_description} - {self.quantity} {self.unit}"
    
    def save(self, *args, **kwargs):
        # Calculate line total
        subtotal = self.quantity * self.unit_price
        discount = subtotal * (self.discount_percentage / 100)
        after_discount = subtotal - discount
        tax = after_discount * (self.tax_rate / 100)
        self.line_total = after_discount + tax
        
        super().save(*args, **kwargs)
```

---

## 🔌 BACKEND API ENDPOINTS

### Serializers

**File:** `apps/backend/vendors/serializers.py`

```python
from rest_framework import serializers
from .models import VendorInvoice, VendorInvoiceItem, Vendor


class VendorInvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorInvoiceItem
        fields = [
            'id', 'item_description', 'quantity', 'unit', 
            'unit_price', 'line_total', 'tax_rate', 'discount_percentage'
        ]
        read_only_fields = ['line_total']


class VendorInvoiceSerializer(serializers.ModelSerializer):
    items = VendorInvoiceItemSerializer(many=True, required=False)
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)
    created_by_name = serializers.CharField(
        source='created_by.get_full_name', 
        read_only=True
    )
    
    class Meta:
        model = VendorInvoice
        fields = [
            'id', 'invoice_number', 'vendor', 'vendor_name',
            'invoice_date', 'due_date', 'status', 'payment_status',
            'subtotal', 'tax_amount', 'discount_amount', 
            'total_amount', 'amount_paid', 'amount_due',
            'notes', 'terms_and_conditions', 'reference_number',
            'items', 'created_by', 'created_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'invoice_number', 'amount_due', 'created_by', 'created_at', 'updated_at'
        ]
    
    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        validated_data['created_by'] = self.context['request'].user
        
        invoice = VendorInvoice.objects.create(**validated_data)
        
        # Create invoice items
        for item_data in items_data:
            VendorInvoiceItem.objects.create(invoice=invoice, **item_data)
        
        # Recalculate totals
        invoice.subtotal = sum(item.line_total for item in invoice.items.all())
        invoice.save()
        
        return invoice
    
    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        
        # Update invoice fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update items if provided
        if items_data is not None:
            # Delete existing items
            instance.items.all().delete()
            
            # Create new items
            for item_data in items_data:
                VendorInvoiceItem.objects.create(invoice=instance, **item_data)
            
            # Recalculate totals
            instance.subtotal = sum(item.line_total for item in instance.items.all())
            instance.save()
        
        return instance


class VendorInvoiceListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views"""
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)
    items_count = serializers.SerializerMethodField()
    
    class Meta:
        model = VendorInvoice
        fields = [
            'id', 'invoice_number', 'vendor', 'vendor_name',
            'invoice_date', 'due_date', 'status', 'payment_status',
            'total_amount', 'amount_paid', 'amount_due',
            'items_count', 'created_at'
        ]
    
    def get_items_count(self, obj):
        return obj.items.count()
```

### Views

**File:** `apps/backend/vendors/views.py`

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse
from django.template.loader import render_to_string
from django.utils import timezone
from .models import VendorInvoice, Vendor
from .serializers import (
    VendorInvoiceSerializer, 
    VendorInvoiceListSerializer
)


class VendorInvoiceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing vendor invoices
    """
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = VendorInvoice.objects.select_related('vendor', 'created_by').prefetch_related('items')
        
        # Filters
        vendor_id = self.request.query_params.get('vendor')
        status = self.request.query_params.get('status')
        payment_status = self.request.query_params.get('payment_status')
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if vendor_id:
            queryset = queryset.filter(vendor_id=vendor_id)
        if status:
            queryset = queryset.filter(status=status)
        if payment_status:
            queryset = queryset.filter(payment_status=payment_status)
        if date_from:
            queryset = queryset.filter(invoice_date__gte=date_from)
        if date_to:
            queryset = queryset.filter(invoice_date__lte=date_to)
        
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'list':
            return VendorInvoiceListSerializer
        return VendorInvoiceSerializer
    
    @action(detail=True, methods=['post'])
    def mark_as_paid(self, request, pk=None):
        """Mark invoice as fully paid"""
        invoice = self.get_object()
        invoice.amount_paid = invoice.total_amount
        invoice.payment_status = 'paid'
        invoice.status = 'paid'
        invoice.save()
        
        serializer = self.get_serializer(invoice)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def record_payment(self, request, pk=None):
        """Record a partial or full payment"""
        invoice = self.get_object()
        amount = request.data.get('amount')
        
        if not amount:
            return Response(
                {'error': 'Amount is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            amount = Decimal(str(amount))
        except:
            return Response(
                {'error': 'Invalid amount'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        invoice.amount_paid += amount
        if invoice.amount_paid >= invoice.total_amount:
            invoice.payment_status = 'paid'
            invoice.status = 'paid'
        else:
            invoice.payment_status = 'partially_paid'
        
        invoice.save()
        
        serializer = self.get_serializer(invoice)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def print_format(self, request, pk=None):
        """Return invoice data in dot matrix print format"""
        invoice = self.get_object()
        
        # Generate dot matrix formatted text
        lines = []
        lines.append("=" * 40)
        lines.append("ICHHADHARI PREMIUM PUNJABI DAIRY".center(40))
        lines.append("=" * 40)
        lines.append(f"Invoice: {invoice.invoice_number}".ljust(40))
        lines.append(f"Date: {invoice.invoice_date.strftime('%d-%b-%Y')}".ljust(40))
        lines.append(f"Vendor: {invoice.vendor.name}".ljust(40))
        lines.append("-" * 40)
        lines.append("Item                   Qty    Price")
        lines.append("-" * 40)
        
        for item in invoice.items.all():
            desc = item.item_description[:20].ljust(20)
            qty = f"{item.quantity:>5.1f}".rjust(7)
            price = f"{item.line_total:>8.2f}".rjust(8)
            lines.append(f"{desc} {qty} {price}")
        
        lines.append("-" * 40)
        lines.append(f"Subtotal:                 {invoice.subtotal:>10.2f}")
        lines.append(f"Tax:                      {invoice.tax_amount:>10.2f}")
        lines.append(f"Total:                    {invoice.total_amount:>10.2f}")
        lines.append("=" * 40)
        
        return Response({'text': '\n'.join(lines)})
```

### URLs

**File:** `apps/backend/vendors/urls.py`

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VendorInvoiceViewSet

router = DefaultRouter()
router.register(r'invoices', VendorInvoiceViewSet, basename='vendor-invoice')

urlpatterns = [
    path('', include(router.urls)),
]
```

---

## 🎨 FRONTEND IMPLEMENTATION

### TypeScript Types

**File:** `apps/frontend/src/types/api.ts`

Add these types:

```typescript
export interface VendorInvoice {
  id: number;
  invoice_number: string;
  vendor: number;
  vendor_name: string;
  invoice_date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  payment_status: 'unpaid' | 'partially_paid' | 'paid';
  subtotal: string;
  tax_amount: string;
  discount_amount: string;
  total_amount: string;
  amount_paid: string;
  amount_due: string;
  notes?: string;
  terms_and_conditions?: string;
  reference_number?: string;
  items: VendorInvoiceItem[];
  created_by?: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface VendorInvoiceItem {
  id?: number;
  item_description: string;
  quantity: string | number;
  unit: string;
  unit_price: string | number;
  line_total: string;
  tax_rate?: string | number;
  discount_percentage?: string | number;
}

export interface VendorInvoiceListItem {
  id: number;
  invoice_number: string;
  vendor: number;
  vendor_name: string;
  invoice_date: string;
  due_date: string;
  status: string;
  payment_status: string;
  total_amount: string;
  amount_paid: string;
  amount_due: string;
  items_count: number;
  created_at: string;
}
```

### Invoice Service

**File:** `apps/frontend/src/services/invoiceService.ts`

```typescript
import { apiClient, handleApiError } from '@/lib/api-client';
import type { PaginatedResponse, VendorInvoice, VendorInvoiceListItem } from '@/types/api';

export const invoiceService = {
  /**
   * Get all invoices
   */
  getInvoices: async (params?: {
    page?: number;
    page_size?: number;
    vendor?: number;
    status?: string;
    payment_status?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<PaginatedResponse<VendorInvoiceListItem>> => {
    try {
      return await apiClient.get<PaginatedResponse<VendorInvoiceListItem>>(
        '/api/vendors/invoices/',
        params
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get single invoice
   */
  getInvoice: async (id: number): Promise<VendorInvoice> => {
    try {
      return await apiClient.get<VendorInvoice>(`/api/vendors/invoices/${id}/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Create invoice
   */
  createInvoice: async (data: {
    vendor: number;
    invoice_date: string;
    due_date: string;
    total_amount: string | number;
    items: Array<{
      item_description: string;
      quantity: string | number;
      unit: string;
      unit_price: string | number;
      tax_rate?: string | number;
      discount_percentage?: string | number;
    }>;
    notes?: string;
    terms_and_conditions?: string;
    reference_number?: string;
  }): Promise<VendorInvoice> => {
    try {
      const formattedData = {
        vendor: data.vendor,
        invoice_date: data.invoice_date,
        due_date: data.due_date,
        total_amount: String(data.total_amount),
        items: data.items.map(item => ({
          item_description: item.item_description,
          quantity: String(item.quantity),
          unit: item.unit,
          unit_price: String(item.unit_price),
          tax_rate: item.tax_rate ? String(item.tax_rate) : '0',
          discount_percentage: item.discount_percentage ? String(item.discount_percentage) : '0',
        })),
        notes: data.notes || '',
        terms_and_conditions: data.terms_and_conditions || '',
        reference_number: data.reference_number || '',
      };

      console.log('📤 Creating invoice:', formattedData);
      const response = await apiClient.post<VendorInvoice>(
        '/api/vendors/invoices/',
        formattedData
      );
      console.log('✅ Invoice created:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to create invoice:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Update invoice
   */
  updateInvoice: async (id: number, data: Partial<VendorInvoice>): Promise<VendorInvoice> => {
    try {
      console.log('📤 Updating invoice:', data);
      const response = await apiClient.put<VendorInvoice>(
        `/api/vendors/invoices/${id}/`,
        data
      );
      console.log('✅ Invoice updated:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to update invoice:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Delete invoice
   */
  deleteInvoice: async (id: number): Promise<void> => {
    try {
      console.log('🗑️ Deleting invoice:', id);
      await apiClient.delete(`/api/vendors/invoices/${id}/`);
      console.log('✅ Invoice deleted');
    } catch (error) {
      console.error('❌ Failed to delete invoice:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Mark invoice as paid
   */
  markAsPaid: async (id: number): Promise<VendorInvoice> => {
    try {
      return await apiClient.post<VendorInvoice>(
        `/api/vendors/invoices/${id}/mark_as_paid/`
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Record payment
   */
  recordPayment: async (id: number, amount: string | number): Promise<VendorInvoice> => {
    try {
      return await apiClient.post<VendorInvoice>(
        `/api/vendors/invoices/${id}/record_payment/`,
        { amount: String(amount) }
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get print format
   */
  getPrintFormat: async (id: number): Promise<{ text: string }> => {
    try {
      return await apiClient.get<{ text: string }>(
        `/api/vendors/invoices/${id}/print_format/`
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
```

---

Continue to Part 2 for Frontend Components...
