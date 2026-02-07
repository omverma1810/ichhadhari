"""
Production Management Serializers

Serializers for Product, ProductionBatch, and ProductionSchedule models.
"""

from decimal import Decimal
from rest_framework import serializers
from .models import Product, ProductionBatch, ProductionSchedule


class ProductSerializer(serializers.ModelSerializer):
    """
    Full serializer for Product model.
    
    Includes all fields with read-only timestamps.
    """
    
    profit_margin = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        read_only=True,
        help_text="Profit margin percentage"
    )
    
    class Meta:
        model = Product
        fields = [
            'id',
            'product_id',
            'name',
            'category',
            'description',
            'unit',
            'cost_price',
            'selling_price',
            'profit_margin',
            'shelf_life_days',
            'storage_temperature',
            'milk_required_per_unit',
            'is_active',
            'image',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def validate_selling_price(self, value):
        """Validate selling price is positive."""
        if value <= Decimal('0.00'):
            raise serializers.ValidationError("Selling price must be greater than 0")
        return value
    
    def validate_cost_price(self, value):
        """Validate cost price is positive."""
        if value <= Decimal('0.00'):
            raise serializers.ValidationError("Cost price must be greater than 0")
        return value
    
    def validate_milk_required_per_unit(self, value):
        """Validate milk requirement is non-negative."""
        if value < Decimal('0.00'):
            raise serializers.ValidationError("Milk requirement cannot be negative")
        return value


class ProductListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for Product list view.
    
    Contains only essential fields for listing.
    """
    
    class Meta:
        model = Product
        fields = [
            'id',
            'product_id',
            'name',
            'category',
            'unit',
            'selling_price',
            'is_active',
        ]


class ProductionBatchSerializer(serializers.ModelSerializer):
    """
    Full serializer for ProductionBatch model.
    
    Includes product and supervisor details as read-only fields.
    """
    
    product_name = serializers.CharField(
        source='product.name',
        read_only=True
    )
    product_id = serializers.CharField(
        source='product.product_id',
        read_only=True
    )
    supervisor_name = serializers.SerializerMethodField()
    operator_names = serializers.SerializerMethodField()
    duration_minutes = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    efficiency_score = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        read_only=True
    )
    
    class Meta:
        model = ProductionBatch
        fields = [
            'id',
            'batch_id',
            'product',
            'product_name',
            'product_id',
            'batch_date',
            'start_time',
            'end_time',
            'duration_minutes',
            'planned_quantity',
            'actual_quantity',
            'wastage_quantity',
            'milk_allocated',
            'milk_used',
            'status',
            'quality_check_passed',
            'quality_notes',
            'fat',
            'snf',
            'clr',
            'product_fat',
            'product_snf',
            'product_clr',
            'yield_percentage',
            'efficiency_score',
            'supervisor',
            'supervisor_name',
            'operators',
            'operator_names',
            'notes',
            'recipe_details',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'batch_id',
            'yield_percentage',
            'created_at',
            'updated_at',
        ]
    
    def get_supervisor_name(self, obj):
        """Get supervisor's full name."""
        if obj.supervisor:
            return obj.supervisor.get_full_name() or obj.supervisor.username
        return None
    
    def get_operator_names(self, obj):
        """Get list of operator names."""
        return [
            op.get_full_name() or op.username
            for op in obj.operators.all()
        ]
    
    def validate_planned_quantity(self, value):
        """Validate planned quantity is positive."""
        if value <= Decimal('0.00'):
            raise serializers.ValidationError("Planned quantity must be greater than 0")
        return value
    
    def validate_actual_quantity(self, value):
        """Validate actual quantity is non-negative."""
        if value < Decimal('0.00'):
            raise serializers.ValidationError("Actual quantity cannot be negative")
        return value
    
    def validate_wastage_quantity(self, value):
        """Validate wastage quantity is non-negative."""
        if value < Decimal('0.00'):
            raise serializers.ValidationError("Wastage quantity cannot be negative")
        return value
    
    def validate(self, data):
        """Validate batch data."""
        # Check that start_time is before end_time if both are set
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        
        if start_time and end_time and start_time >= end_time:
            raise serializers.ValidationError({
                'end_time': 'End time must be after start time'
            })
        
        # Validate status transitions
        if self.instance:
            old_status = self.instance.status
            new_status = data.get('status', old_status)
            
            # Define valid transitions
            valid_transitions = {
                'planned': ['in_progress', 'cancelled'],
                'in_progress': ['completed', 'cancelled'],
                'completed': [],
                'cancelled': [],
            }
            
            if new_status != old_status and new_status not in valid_transitions.get(old_status, []):
                raise serializers.ValidationError({
                    'status': f'Cannot transition from {old_status} to {new_status}'
                })
        
        return data


class ProductionBatchListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for ProductionBatch list view.
    
    Contains only essential fields for listing.
    """
    
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_id = serializers.CharField(source='product.product_id', read_only=True)
    
    class Meta:
        model = ProductionBatch
        fields = [
            'id',
            'batch_id',
            'product_name',
            'product_id',
            'batch_date',
            'planned_quantity',
            'actual_quantity',
            'status',
            'yield_percentage',
        ]


class ProductionScheduleSerializer(serializers.ModelSerializer):
    """
    Full serializer for ProductionSchedule model.
    
    Includes product and batch details as read-only fields.
    """
    
    product_name = serializers.CharField(
        source='product.name',
        read_only=True
    )
    product_id = serializers.CharField(
        source='product.product_id',
        read_only=True
    )
    batch_id = serializers.CharField(
        source='batch.batch_id',
        read_only=True,
        allow_null=True
    )
    batch_status = serializers.CharField(
        source='batch.status',
        read_only=True,
        allow_null=True
    )
    is_completed = serializers.BooleanField(read_only=True)
    required_milk = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    
    class Meta:
        model = ProductionSchedule
        fields = [
            'id',
            'schedule_date',
            'product',
            'product_name',
            'product_id',
            'planned_quantity',
            'required_milk',
            'priority',
            'notes',
            'batch',
            'batch_id',
            'batch_status',
            'is_completed',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def validate_planned_quantity(self, value):
        """Validate planned quantity is positive."""
        if value <= Decimal('0.00'):
            raise serializers.ValidationError("Planned quantity must be greater than 0")
        return value
    
    def validate_priority(self, value):
        """Validate priority is positive."""
        if value < 1:
            raise serializers.ValidationError("Priority must be at least 1")
        return value
    
    def validate(self, data):
        """Validate schedule data."""
        # Check for duplicate schedules (handled by unique_together but add custom message)
        schedule_date = data.get('schedule_date')
        product = data.get('product')
        
        if schedule_date and product:
            qs = ProductionSchedule.objects.filter(
                schedule_date=schedule_date,
                product=product
            )
            
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            
            if qs.exists():
                raise serializers.ValidationError(
                    f"A schedule for {product.name} already exists on {schedule_date}"
                )
        
        return data
