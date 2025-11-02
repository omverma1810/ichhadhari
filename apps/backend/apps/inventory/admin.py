from django.contrib import admin
from .models import (
    InventoryItem,
    StockTransaction,
    RawMaterialStock,
    FinishedGoodsStock,
    StockAlert
)


@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    """
    Admin interface for InventoryItem model.
    """
    list_display = [
        'item_id', 'name', 'item_type', 'current_stock', 'unit',
        'min_stock_level', 'reorder_point', 'is_active', 'is_below_min_stock'
    ]
    list_filter = ['item_type', 'is_active', 'unit']
    search_fields = ['item_id', 'name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('item_id', 'name', 'item_type', 'description', 'unit')
        }),
        ('Stock Information', {
            'fields': (
                'current_stock', 'min_stock_level', 'max_stock_level',
                'reorder_point', 'cost_per_unit'
            )
        }),
        ('Storage Information', {
            'fields': ('storage_location', 'storage_temperature')
        }),
        ('Relationships', {
            'fields': ('product', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def is_below_min_stock(self, obj):
        return obj.is_below_min_stock
    is_below_min_stock.boolean = True
    is_below_min_stock.short_description = 'Low Stock'


@admin.register(StockTransaction)
class StockTransactionAdmin(admin.ModelAdmin):
    """
    Admin interface for StockTransaction model.
    """
    list_display = [
        'transaction_id', 'item', 'transaction_type', 'transaction_date',
        'quantity', 'is_addition', 'stock_after', 'performed_by'
    ]
    list_filter = ['transaction_type', 'is_addition', 'transaction_date']
    search_fields = ['transaction_id', 'item__name', 'batch_number']
    readonly_fields = [
        'transaction_id', 'stock_before', 'stock_after', 'total_cost',
        'created_at', 'updated_at'
    ]
    date_hierarchy = 'transaction_date'
    fieldsets = (
        ('Transaction Information', {
            'fields': (
                'transaction_id', 'item', 'transaction_type',
                'transaction_date', 'performed_by'
            )
        }),
        ('Stock Details', {
            'fields': (
                'quantity', 'is_addition', 'stock_before', 'stock_after',
                'unit_cost', 'total_cost'
            )
        }),
        ('Additional Information', {
            'fields': (
                'reference_type', 'reference_id', 'batch_number',
                'expiry_date', 'notes'
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(RawMaterialStock)
class RawMaterialStockAdmin(admin.ModelAdmin):
    """
    Admin interface for RawMaterialStock model.
    """
    list_display = [
        'item', 'batch_number', 'supplier_name', 'purchase_date',
        'expiry_date', 'quantity', 'cost_per_unit', 'is_active'
    ]
    list_filter = ['is_active', 'purchase_date', 'expiry_date']
    search_fields = ['batch_number', 'supplier_name', 'item__name']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'purchase_date'
    fieldsets = (
        ('Item Information', {
            'fields': ('item', 'batch_number', 'supplier_name')
        }),
        ('Dates', {
            'fields': ('purchase_date', 'expiry_date')
        }),
        ('Stock Details', {
            'fields': ('quantity', 'cost_per_unit', 'total_cost', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(FinishedGoodsStock)
class FinishedGoodsStockAdmin(admin.ModelAdmin):
    """
    Admin interface for FinishedGoodsStock model.
    """
    list_display = [
        'item', 'batch', 'quantity', 'production_date', 'expiry_date',
        'quality_check_passed', 'shop_location', 'is_sold'
    ]
    list_filter = ['quality_check_passed', 'is_sold', 'production_date']
    search_fields = ['item__name', 'batch__batch_id', 'shop_location']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'production_date'
    fieldsets = (
        ('Item Information', {
            'fields': ('item', 'batch', 'quantity')
        }),
        ('Dates', {
            'fields': ('production_date', 'expiry_date')
        }),
        ('Quality & Location', {
            'fields': ('quality_check_passed', 'shop_location', 'is_sold')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(StockAlert)
class StockAlertAdmin(admin.ModelAdmin):
    """
    Admin interface for StockAlert model.
    """
    list_display = [
        'item', 'alert_type', 'status', 'created_at',
        'acknowledged_by', 'resolved_by'
    ]
    list_filter = ['alert_type', 'status', 'created_at']
    search_fields = ['item__name', 'message']
    readonly_fields = [
        'created_at', 'acknowledged_by', 'acknowledged_at',
        'resolved_by', 'resolved_at'
    ]
    date_hierarchy = 'created_at'
    fieldsets = (
        ('Alert Information', {
            'fields': ('item', 'alert_type', 'status', 'message')
        }),
        ('Acknowledgment', {
            'fields': ('acknowledged_by', 'acknowledged_at')
        }),
        ('Resolution', {
            'fields': ('resolved_by', 'resolved_at')
        }),
        ('Timestamp', {
            'fields': ('created_at',),
        }),
    )
