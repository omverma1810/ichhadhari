from rest_framework import serializers
from .models import (
    InventoryItem, StockTransaction, RawMaterialStock,
    FinishedGoodsStock, StockAlert
)
from decimal import Decimal


class InventoryItemSerializer(serializers.ModelSerializer):
    """
    Complete serializer for InventoryItem with computed fields.
    """
    is_below_min_stock = serializers.BooleanField(read_only=True)
    is_below_reorder_point = serializers.BooleanField(read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True, allow_null=True)
    
    class Meta:
        model = InventoryItem
        fields = [
            'id', 'item_id', 'name', 'item_type', 'description', 'unit',
            'cost_per_unit', 'current_stock', 'min_stock_level', 'max_stock_level',
            'reorder_point', 'storage_location', 'storage_temperature',
            'is_active', 'product', 'product_name', 'is_below_min_stock',
            'is_below_reorder_point', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class InventoryItemListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for list views.
    """
    is_below_min_stock = serializers.BooleanField(read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True, allow_null=True)
    
    class Meta:
        model = InventoryItem
        fields = [
            'id', 'item_id', 'name', 'item_type', 'unit', 'current_stock',
            'min_stock_level', 'reorder_point', 'is_active', 'product_name',
            'is_below_min_stock'
        ]


class StockTransactionSerializer(serializers.ModelSerializer):
    """
    Serializer for StockTransaction with validation and computed fields.
    """
    item_name = serializers.CharField(source='item.name', read_only=True)
    performed_by_name = serializers.CharField(
        source='performed_by.get_full_name',
        read_only=True,
        allow_null=True
    )
    
    class Meta:
        model = StockTransaction
        fields = [
            'id', 'transaction_id', 'item', 'item_name', 'transaction_type',
            'transaction_date', 'quantity', 'is_addition', 'stock_before',
            'stock_after', 'unit_cost', 'total_cost', 'reference_type',
            'reference_id', 'batch_number', 'expiry_date', 'performed_by',
            'performed_by_name', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'transaction_id', 'stock_before', 'stock_after', 'total_cost',
            'created_at', 'updated_at'
        ]
    
    def validate_quantity(self, value):
        """Ensure quantity is positive."""
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0.")
        return value
    
    def validate(self, data):
        """
        Validate that stock won't go negative for outgoing transactions.
        """
        if not data.get('is_addition', True):
            item = data.get('item')
            quantity = data.get('quantity', 0)
            if item and item.current_stock < quantity:
                raise serializers.ValidationError(
                    f"Insufficient stock. Current stock: {item.current_stock}, "
                    f"requested: {quantity}"
                )
        return data


class RawMaterialStockSerializer(serializers.ModelSerializer):
    """
    Serializer for RawMaterialStock.
    """
    item_name = serializers.CharField(source='item.name', read_only=True)
    
    class Meta:
        model = RawMaterialStock
        fields = [
            'id', 'item', 'item_name', 'supplier_name', 'batch_number',
            'purchase_date', 'expiry_date', 'quantity', 'cost_per_unit',
            'total_cost', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class FinishedGoodsStockSerializer(serializers.ModelSerializer):
    """
    Serializer for FinishedGoodsStock with related data.
    """
    item_name = serializers.CharField(source='item.name', read_only=True)
    batch_id = serializers.CharField(source='batch.batch_id', read_only=True)
    product_name = serializers.CharField(source='batch.product.name', read_only=True)
    
    class Meta:
        model = FinishedGoodsStock
        fields = [
            'id', 'item', 'item_name', 'batch', 'batch_id', 'product_name',
            'quantity', 'production_date', 'expiry_date', 'quality_check_passed',
            'shop_location', 'is_sold', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class StockAlertSerializer(serializers.ModelSerializer):
    """
    Serializer for StockAlert with user details.
    """
    item_name = serializers.CharField(source='item.name', read_only=True)
    acknowledged_by_name = serializers.CharField(
        source='acknowledged_by.get_full_name',
        read_only=True,
        allow_null=True
    )
    resolved_by_name = serializers.CharField(
        source='resolved_by.get_full_name',
        read_only=True,
        allow_null=True
    )
    
    class Meta:
        model = StockAlert
        fields = [
            'id', 'item', 'item_name', 'alert_type', 'status', 'message',
            'acknowledged_by', 'acknowledged_by_name', 'acknowledged_at',
            'resolved_by', 'resolved_by_name', 'resolved_at', 'created_at'
        ]
        read_only_fields = [
            'acknowledged_by', 'acknowledged_at', 'resolved_by',
            'resolved_at', 'created_at'
        ]
