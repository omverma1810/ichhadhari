"""
Serializers for Milk Management System

Provides serialization/deserialization for:
- Supplier (full and list versions)
- MilkCollection (full and list versions)
- MilkPayment
"""

from decimal import Decimal
from rest_framework import serializers
from .models import Supplier, MilkCollection, MilkPayment


class SupplierSerializer(serializers.ModelSerializer):
    """
    Full serializer for Supplier model.
    
    Used for create, update, and retrieve operations.
    Includes all fields with auto-calculated metrics as read-only.
    """
    
    class Meta:
        model = Supplier
        fields = [
            'id',
            'supplier_id',
            'name',
            'supplier_type',
            'status',
            'phone',
            'alternate_phone',
            'email',
            'address',
            'route_name',
            'collection_time',
            'bank_name',
            'account_number',
            'ifsc_code',
            'account_holder_name',
            'payment_cycle',
            'avg_quality_score',
            'total_milk_supplied',
            'total_amount_paid',
            'outstanding_balance',
            'documents',
            'notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'created_at',
            'updated_at',
            'avg_quality_score',
            'total_milk_supplied',
            'total_amount_paid',
            'outstanding_balance',
        ]
    
    def validate_phone(self, value):
        """Validate phone number format."""
        if value and not value.replace('+', '').replace('-', '').replace(' ', '').isdigit():
            raise serializers.ValidationError(
                "Phone number must contain only digits, spaces, hyphens, and plus sign"
            )
        return value
    
    def validate_alternate_phone(self, value):
        """Validate alternate phone number format."""
        if value and not value.replace('+', '').replace('-', '').replace(' ', '').isdigit():
            raise serializers.ValidationError(
                "Phone number must contain only digits, spaces, hyphens, and plus sign"
            )
        return value
    
    def validate(self, attrs):
        """Validate supplier data."""
        # Check if payment cycle requires bank details
        payment_cycle = attrs.get('payment_cycle', self.instance.payment_cycle if self.instance else None)
        
        if payment_cycle in ['weekly', 'fortnightly', 'monthly']:
            bank_name = attrs.get('bank_name', self.instance.bank_name if self.instance else None)
            account_number = attrs.get('account_number', self.instance.account_number if self.instance else None)
            
            if not bank_name or not account_number:
                raise serializers.ValidationError(
                    "Bank name and account number are required for non-daily payment cycles"
                )
        
        return attrs


class SupplierListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for Supplier list view.
    
    Contains only essential fields for list display.
    """
    
    class Meta:
        model = Supplier
        fields = [
            'id',
            'supplier_id',
            'name',
            'supplier_type',
            'status',
            'phone',
            'route_name',
            'avg_quality_score',
            'outstanding_balance',
        ]


class MilkCollectionSerializer(serializers.ModelSerializer):
    """
    Full serializer for MilkCollection model.
    
    Includes supplier and collector names as read-only fields.
    Auto-calculates quality score and total amount.
    """
    
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    collected_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = MilkCollection
        fields = [
            'id',
            'collection_id',
            'supplier',
            'supplier_name',
            'collected_by',
            'collected_by_name',
            'collection_date',
            'collection_time',
            'milk_type',
            'quantity',
            'fat',
            'snf',
            'temperature',
            'quality_score',
            'quality_status',
            'rejection_reason',
            'rate_per_fat',
            'rate_per_snf',
            'price_per_liter',
            'total_amount',
            'notes',
            'bmc_integration_data',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'collection_id',
            'quality_score',
            'price_per_liter',
            'total_amount',
            'created_at',
            'updated_at',
        ]
    
    def get_collected_by_name(self, obj):
        """Get the name of the staff member who collected the milk."""
        if obj.collected_by:
            return obj.collected_by.get_full_name() or obj.collected_by.username
        return None
    
    def validate_quantity(self, value):
        """Validate quantity is positive."""
        if value <= Decimal('0.00'):
            raise serializers.ValidationError("Quantity must be greater than 0")
        return value
    
    def validate_fat(self, value):
        """Validate fat content is within valid range."""
        if value < Decimal('0.00') or value > Decimal('15.00'):
            raise serializers.ValidationError("Fat content must be between 0 and 15 kg/L")
        return value
    
    def validate_snf(self, value):
        """Validate SNF content is within valid range."""
        if value < Decimal('0.00') or value > Decimal('15.00'):
            raise serializers.ValidationError("SNF content must be between 0 and 15 kg/L")
        return value
    
    def validate_temperature(self, value):
        """Validate temperature is within reasonable range."""
        if value < Decimal('0.0'):
            raise serializers.ValidationError("Temperature cannot be negative")
        if value > Decimal('50.0'):
            raise serializers.ValidationError(
                "Temperature seems unusually high. Please verify the reading."
            )
        return value
    
    def validate(self, attrs):
        """Validate collection data."""
        # If quality status is rejected, rejection reason is required
        quality_status = attrs.get('quality_status', 'accepted')
        rejection_reason = attrs.get('rejection_reason', '')
        
        if quality_status == 'rejected' and not rejection_reason:
            raise serializers.ValidationError({
                'rejection_reason': 'Rejection reason is required when quality status is rejected'
            })
        
        return attrs


class MilkCollectionListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for MilkCollection list view.
    
    Contains only essential fields for list display.
    """
    
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    
    class Meta:
        model = MilkCollection
        fields = [
            'id',
            'collection_id',
            'supplier',
            'supplier_name',
            'collection_date',
            'collection_time',
            'quantity',
            'quality_score',
            'total_amount',
        ]


class MilkPaymentSerializer(serializers.ModelSerializer):
    """
    Full serializer for MilkPayment model.
    
    Includes supplier and processor names as read-only fields.
    """
    
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    processed_by_name = serializers.SerializerMethodField()
    collections_count = serializers.SerializerMethodField()
    
    class Meta:
        model = MilkPayment
        fields = [
            'id',
            'payment_id',
            'supplier',
            'supplier_name',
            'processed_by',
            'processed_by_name',
            'payment_date',
            'amount',
            'payment_method',
            'status',
            'period_start',
            'period_end',
            'transaction_reference',
            'upi_transaction_id',
            'cheque_number',
            'collections',
            'collections_count',
            'notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'payment_id',
            'created_at',
            'updated_at',
        ]
    
    def get_processed_by_name(self, obj):
        """Get the name of the staff member who processed the payment."""
        if obj.processed_by:
            return obj.processed_by.get_full_name() or obj.processed_by.username
        return None
    
    def get_collections_count(self, obj):
        """Get the count of collections covered by this payment."""
        return obj.collections.count()
    
    def validate_amount(self, value):
        """Validate amount is positive."""
        if value <= Decimal('0.00'):
            raise serializers.ValidationError("Amount must be greater than 0")
        return value
    
    def validate(self, attrs):
        """Validate payment data."""
        # Validate period dates
        period_start = attrs.get('period_start')
        period_end = attrs.get('period_end')
        
        if period_start and period_end and period_start > period_end:
            raise serializers.ValidationError({
                'period_end': 'Period end date must be after or equal to period start date'
            })
        
        # Validate payment method specific fields
        payment_method = attrs.get('payment_method')
        
        if payment_method == 'upi' and not attrs.get('upi_transaction_id'):
            raise serializers.ValidationError({
                'upi_transaction_id': 'UPI transaction ID is required for UPI payments'
            })
        
        if payment_method == 'cheque' and not attrs.get('cheque_number'):
            raise serializers.ValidationError({
                'cheque_number': 'Cheque number is required for cheque payments'
            })
        
        if payment_method == 'bank_transfer' and not attrs.get('transaction_reference'):
            raise serializers.ValidationError({
                'transaction_reference': 'Transaction reference is required for bank transfers'
            })
        
        return attrs


class MilkPaymentListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for MilkPayment list view.
    
    Contains only essential fields for list display.
    """
    
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    collections_count = serializers.SerializerMethodField()
    
    class Meta:
        model = MilkPayment
        fields = [
            'id',
            'payment_id',
            'supplier',
            'supplier_name',
            'payment_date',
            'amount',
            'payment_method',
            'status',
            'collections_count',
        ]
    
    def get_collections_count(self, obj):
        """Get the count of collections covered by this payment."""
        return obj.collections.count()
