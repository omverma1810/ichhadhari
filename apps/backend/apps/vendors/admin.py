from django.contrib import admin
from .models import (
    Vendor, PurchaseOrder, PurchaseOrderItem,
    VendorPayment, GoodsReceiptNote, GRNItem
)


class PurchaseOrderItemInline(admin.TabularInline):
    """
    Inline admin for PurchaseOrderItem.
    """
    model = PurchaseOrderItem
    extra = 1
    fields = [
        'item_name', 'quantity', 'unit', 'unit_price',
        'tax_percentage', 'discount_percentage', 'line_total',
        'quantity_received', 'inventory_item'
    ]
    readonly_fields = ['line_total']


class GRNItemInline(admin.TabularInline):
    """
    Inline admin for GRNItem.
    """
    model = GRNItem
    extra = 0
    fields = [
        'po_item', 'ordered_quantity', 'received_quantity',
        'accepted_quantity', 'rejected_quantity', 'quality_check_passed',
        'rejection_reason', 'batch_number', 'expiry_date'
    ]


@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    """
    Admin interface for Vendor model.
    """
    list_display = [
        'vendor_id', 'company_name', 'category', 'status',
        'contact_person', 'phone', 'outstanding_balance',
        'total_purchases', 'rating'
    ]
    list_filter = ['status', 'category', 'payment_method']
    search_fields = [
        'vendor_id', 'company_name', 'contact_person',
        'phone', 'email', 'gst_number'
    ]
    readonly_fields = [
        'total_purchases', 'total_payments', 'outstanding_balance',
        'created_at', 'updated_at'
    ]
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'vendor_id', 'company_name', 'category', 'status'
            )
        }),
        ('Contact Information', {
            'fields': (
                'contact_person', 'phone', 'alternate_phone',
                'email', 'website'
            )
        }),
        ('Address Information', {
            'fields': ('billing_address', 'shipping_address')
        }),
        ('Legal Information', {
            'fields': (
                'gst_number', 'pan_number', 'company_registration_number'
            )
        }),
        ('Banking Information', {
            'fields': (
                'bank_name', 'account_number', 'ifsc_code',
                'account_holder_name'
            ),
            'classes': ('collapse',)
        }),
        ('Payment Terms', {
            'fields': (
                'credit_period_days', 'credit_limit', 'payment_method',
                'discount_percentage'
            )
        }),
        ('Performance Metrics', {
            'fields': (
                'rating', 'total_purchases', 'total_payments',
                'outstanding_balance'
            )
        }),
        ('Additional Information', {
            'fields': ('documents', 'notes'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    """
    Admin interface for PurchaseOrder model.
    """
    list_display = [
        'po_number', 'vendor', 'po_date', 'expected_delivery_date',
        'status', 'total_amount', 'created_by'
    ]
    list_filter = ['status', 'po_date', 'is_recurring']
    search_fields = [
        'po_number', 'vendor__company_name', 'tracking_number'
    ]
    readonly_fields = [
        'po_number', 'subtotal', 'tax_amount', 'discount_amount',
        'total_amount', 'approved_by', 'approved_at',
        'created_at', 'updated_at'
    ]
    date_hierarchy = 'po_date'
    inlines = [PurchaseOrderItemInline]
    fieldsets = (
        ('Purchase Order Information', {
            'fields': (
                'po_number', 'vendor', 'po_date',
                'expected_delivery_date', 'actual_delivery_date', 'status'
            )
        }),
        ('Approval Information', {
            'fields': ('created_by', 'approved_by', 'approved_at')
        }),
        ('Financial Information', {
            'fields': (
                'subtotal', 'tax_amount', 'discount_amount', 'total_amount'
            )
        }),
        ('Delivery Information', {
            'fields': (
                'delivery_address', 'shipping_method', 'tracking_number'
            )
        }),
        ('Additional Information', {
            'fields': ('terms_and_conditions', 'notes'),
            'classes': ('collapse',)
        }),
        ('Recurring Options', {
            'fields': ('is_recurring', 'recurrence_frequency'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(PurchaseOrderItem)
class PurchaseOrderItemAdmin(admin.ModelAdmin):
    """
    Admin interface for PurchaseOrderItem model.
    """
    list_display = [
        'purchase_order', 'item_name', 'quantity', 'unit',
        'unit_price', 'line_total', 'quantity_received'
    ]
    list_filter = ['unit', 'purchase_order__status']
    search_fields = ['item_name', 'purchase_order__po_number']
    readonly_fields = ['line_total']


@admin.register(VendorPayment)
class VendorPaymentAdmin(admin.ModelAdmin):
    """
    Admin interface for VendorPayment model.
    """
    list_display = [
        'payment_id', 'vendor', 'payment_date', 'amount',
        'payment_method', 'status', 'is_advance', 'processed_by'
    ]
    list_filter = ['status', 'payment_method', 'is_advance', 'payment_date']
    search_fields = [
        'payment_id', 'vendor__company_name', 'transaction_reference',
        'cheque_number', 'upi_transaction_id'
    ]
    readonly_fields = ['payment_id', 'created_at', 'updated_at']
    date_hierarchy = 'payment_date'
    filter_horizontal = ['purchase_orders']
    fieldsets = (
        ('Payment Information', {
            'fields': (
                'payment_id', 'vendor', 'payment_date', 'amount',
                'payment_method', 'status', 'is_advance'
            )
        }),
        ('Transaction Details', {
            'fields': (
                'transaction_reference', 'upi_transaction_id',
                'cheque_number'
            )
        }),
        ('Processing Information', {
            'fields': ('processed_by', 'notes')
        }),
        ('Related Purchase Orders', {
            'fields': ('purchase_orders',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(GoodsReceiptNote)
class GoodsReceiptNoteAdmin(admin.ModelAdmin):
    """
    Admin interface for GoodsReceiptNote model.
    """
    list_display = [
        'grn_number', 'purchase_order', 'receipt_date',
        'quality_status', 'received_by', 'quality_checked_by'
    ]
    list_filter = ['quality_status', 'receipt_date']
    search_fields = [
        'grn_number', 'purchase_order__po_number',
        'delivery_challan_number', 'invoice_number'
    ]
    readonly_fields = ['grn_number', 'created_at', 'updated_at']
    date_hierarchy = 'receipt_date'
    inlines = [GRNItemInline]
    fieldsets = (
        ('GRN Information', {
            'fields': (
                'grn_number', 'purchase_order', 'receipt_date', 'received_by'
            )
        }),
        ('Quality Check', {
            'fields': (
                'quality_status', 'quality_notes', 'quality_checked_by'
            )
        }),
        ('Document References', {
            'fields': ('delivery_challan_number', 'invoice_number')
        }),
        ('Additional Information', {
            'fields': ('notes',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(GRNItem)
class GRNItemAdmin(admin.ModelAdmin):
    """
    Admin interface for GRNItem model.
    """
    list_display = [
        'grn', 'po_item', 'ordered_quantity', 'received_quantity',
        'accepted_quantity', 'rejected_quantity', 'quality_check_passed'
    ]
    list_filter = ['quality_check_passed', 'grn__quality_status']
    search_fields = [
        'grn__grn_number', 'po_item__item_name', 'batch_number'
    ]
