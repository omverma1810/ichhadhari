"""
Admin configuration for Milk Management System
"""

from django.contrib import admin
from .models import Supplier, MilkCollection, MilkPayment


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    """Admin interface for Supplier model."""
    
    list_display = [
        'supplier_id',
        'name',
        'supplier_type',
        'status',
        'route_name',
        'phone',
        'avg_quality_score',
        'outstanding_balance',
    ]
    
    list_filter = [
        'status',
        'supplier_type',
        'route_name',
        'payment_cycle',
        'created_at',
    ]
    
    search_fields = [
        'supplier_id',
        'name',
        'phone',
        'email',
        'alternate_phone',
    ]
    
    readonly_fields = [
        'avg_quality_score',
        'total_milk_supplied',
        'total_amount_paid',
        'outstanding_balance',
        'created_at',
        'updated_at',
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'supplier_id',
                'name',
                'supplier_type',
                'status',
            )
        }),
        ('Contact Information', {
            'fields': (
                'phone',
                'alternate_phone',
                'email',
                'address',
            )
        }),
        ('Collection Details', {
            'fields': (
                'route_name',
                'collection_time',
            )
        }),
        ('Banking Information', {
            'fields': (
                'bank_name',
                'account_number',
                'ifsc_code',
                'account_holder_name',
                'payment_cycle',
            )
        }),
        ('Metrics', {
            'fields': (
                'avg_quality_score',
                'total_milk_supplied',
                'total_amount_paid',
                'outstanding_balance',
            )
        }),
        ('Additional Information', {
            'fields': (
                'documents',
                'notes',
            ),
            'classes': ('collapse',),
        }),
        ('Timestamps', {
            'fields': (
                'created_at',
                'updated_at',
            ),
            'classes': ('collapse',),
        }),
    )
    
    ordering = ['supplier_id']
    date_hierarchy = 'created_at'


@admin.register(MilkCollection)
class MilkCollectionAdmin(admin.ModelAdmin):
    """Admin interface for MilkCollection model."""
    
    list_display = [
        'collection_id',
        'supplier',
        'collection_date',
        'collection_time',
        'quantity',
        'quality_score',
        'quality_status',
        'total_amount',
    ]
    
    list_filter = [
        'collection_date',
        'milk_type',
        'quality_status',
        'supplier__route_name',
        'collected_by',
    ]
    
    search_fields = [
        'collection_id',
        'supplier__supplier_id',
        'supplier__name',
    ]
    
    readonly_fields = [
        'collection_id',
        'quality_score',
        'total_amount',
        'created_at',
        'updated_at',
    ]
    
    fieldsets = (
        ('Identification', {
            'fields': (
                'collection_id',
                'supplier',
                'collected_by',
            )
        }),
        ('Collection Details', {
            'fields': (
                'collection_date',
                'collection_time',
                'milk_type',
                'quantity',
            )
        }),
        ('Quality Parameters', {
            'fields': (
                'fat',
                'snf_percentage',
                'temperature',
                'quality_score',
                'quality_status',
                'rejection_reason',
            )
        }),
        ('Financial', {
            'fields': (
                'rate_per_liter',
                'total_amount',
            )
        }),
        ('Additional Information', {
            'fields': (
                'notes',
                'bmc_integration_data',
            ),
            'classes': ('collapse',),
        }),
        ('Timestamps', {
            'fields': (
                'created_at',
                'updated_at',
            ),
            'classes': ('collapse',),
        }),
    )
    
    ordering = ['-collection_date', '-collection_time']
    date_hierarchy = 'collection_date'
    
    def get_readonly_fields(self, request, obj=None):
        """Make collection_id readonly only when editing."""
        if obj:  # Editing an existing object
            return self.readonly_fields
        return ['quality_score', 'total_amount', 'created_at', 'updated_at']


@admin.register(MilkPayment)
class MilkPaymentAdmin(admin.ModelAdmin):
    """Admin interface for MilkPayment model."""
    
    list_display = [
        'payment_id',
        'supplier',
        'payment_date',
        'amount',
        'payment_method',
        'status',
        'processed_by',
    ]
    
    list_filter = [
        'payment_date',
        'payment_method',
        'status',
        'processed_by',
    ]
    
    search_fields = [
        'payment_id',
        'supplier__supplier_id',
        'supplier__name',
        'transaction_reference',
        'upi_transaction_id',
        'cheque_number',
    ]
    
    readonly_fields = [
        'payment_id',
        'created_at',
        'updated_at',
    ]
    
    fieldsets = (
        ('Identification', {
            'fields': (
                'payment_id',
                'supplier',
                'processed_by',
            )
        }),
        ('Payment Details', {
            'fields': (
                'payment_date',
                'amount',
                'payment_method',
                'status',
            )
        }),
        ('Period Covered', {
            'fields': (
                'period_start',
                'period_end',
            )
        }),
        ('Transaction References', {
            'fields': (
                'transaction_reference',
                'upi_transaction_id',
                'cheque_number',
            )
        }),
        ('Related Collections', {
            'fields': (
                'collections',
            )
        }),
        ('Additional Information', {
            'fields': (
                'notes',
            ),
            'classes': ('collapse',),
        }),
        ('Timestamps', {
            'fields': (
                'created_at',
                'updated_at',
            ),
            'classes': ('collapse',),
        }),
    )
    
    filter_horizontal = ['collections']
    ordering = ['-payment_date']
    date_hierarchy = 'payment_date'
    
    def get_readonly_fields(self, request, obj=None):
        """Make payment_id readonly only when editing."""
        if obj:  # Editing an existing object
            return self.readonly_fields
        return ['created_at', 'updated_at']
