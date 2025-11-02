"""
Production Management Admin Configuration

Registers models with Django admin interface.
"""

from django.contrib import admin
from .models import Product, ProductionBatch, ProductionSchedule


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """Admin interface for Product model."""
    
    list_display = [
        'product_id',
        'name',
        'category',
        'unit',
        'selling_price',
        'is_active',
        'created_at',
    ]
    list_filter = ['category', 'is_active', 'unit']
    search_fields = ['product_id', 'name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'product_id',
                'name',
                'category',
                'description',
                'unit',
                'is_active',
                'image',
            )
        }),
        ('Pricing', {
            'fields': (
                'cost_price',
                'selling_price',
            )
        }),
        ('Production Details', {
            'fields': (
                'milk_required_per_unit',
                'shelf_life_days',
                'storage_temperature',
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )


@admin.register(ProductionBatch)
class ProductionBatchAdmin(admin.ModelAdmin):
    """Admin interface for ProductionBatch model."""
    
    list_display = [
        'batch_id',
        'product',
        'batch_date',
        'planned_quantity',
        'actual_quantity',
        'status',
        'yield_percentage',
        'supervisor',
    ]
    list_filter = ['status', 'batch_date', 'quality_check_passed']
    search_fields = ['batch_id', 'product__name', 'notes']
    readonly_fields = ['batch_id', 'yield_percentage', 'created_at', 'updated_at']
    date_hierarchy = 'batch_date'
    
    filter_horizontal = ['operators']
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'batch_id',
                'product',
                'batch_date',
                'status',
            )
        }),
        ('Production Details', {
            'fields': (
                'start_time',
                'end_time',
                'planned_quantity',
                'actual_quantity',
                'wastage_quantity',
                'yield_percentage',
            )
        }),
        ('Milk Usage', {
            'fields': (
                'milk_allocated',
                'milk_used',
            )
        }),
        ('Quality Control', {
            'fields': (
                'quality_check_passed',
                'quality_notes',
            )
        }),
        ('Team', {
            'fields': (
                'supervisor',
                'operators',
            )
        }),
        ('Additional Information', {
            'fields': (
                'notes',
                'recipe_details',
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )


@admin.register(ProductionSchedule)
class ProductionScheduleAdmin(admin.ModelAdmin):
    """Admin interface for ProductionSchedule model."""
    
    list_display = [
        'schedule_date',
        'product',
        'planned_quantity',
        'priority',
        'batch',
        'created_at',
    ]
    list_filter = ['schedule_date', 'priority']
    search_fields = ['product__name', 'notes']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'schedule_date'
    
    fieldsets = (
        ('Schedule Information', {
            'fields': (
                'schedule_date',
                'product',
                'planned_quantity',
                'priority',
            )
        }),
        ('Execution', {
            'fields': (
                'batch',
            )
        }),
        ('Additional Information', {
            'fields': (
                'notes',
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
