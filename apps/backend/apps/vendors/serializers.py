from rest_framework import serializers
from .models import (
    Vendor, PurchaseOrder, PurchaseOrderItem,
    VendorPayment, GoodsReceiptNote, GRNItem,
    VendorInvoice, VendorInvoiceItem
)
from decimal import Decimal


class VendorSerializer(serializers.ModelSerializer):
    """
    Complete serializer for Vendor model.
    """
    
    class Meta:
        model = Vendor
        fields = [
            'id', 'vendor_id', 'company_name', 'category', 'status',
            'contact_person', 'phone', 'alternate_phone', 'email', 'website',
            'billing_address', 'shipping_address', 'gst_number', 'pan_number',
            'company_registration_number', 'bank_name', 'account_number',
            'ifsc_code', 'account_holder_name', 'credit_period_days',
            'credit_limit', 'payment_method', 'discount_percentage', 'rating',
            'total_purchases', 'total_payments', 'outstanding_balance',
            'documents', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class VendorListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for vendor list views.
    """
    
    class Meta:
        model = Vendor
        fields = [
            'id', 'vendor_id', 'company_name', 'category', 'status',
            'contact_person', 'phone', 'email', 'outstanding_balance',
            'total_purchases', 'rating'
        ]


class PurchaseOrderItemSerializer(serializers.ModelSerializer):
    """
    Serializer for PurchaseOrderItem.
    """
    inventory_item_name = serializers.CharField(
        source='inventory_item.name',
        read_only=True,
        allow_null=True
    )
    
    class Meta:
        model = PurchaseOrderItem
        fields = [
            'id', 'purchase_order', 'item_name', 'description', 'quantity',
            'unit', 'unit_price', 'tax_percentage', 'discount_percentage',
            'line_total', 'quantity_received', 'inventory_item',
            'inventory_item_name'
        ]
        read_only_fields = ['line_total']
    
    def validate_quantity(self, value):
        """Ensure quantity is positive."""
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0.")
        return value


class PurchaseOrderItemCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating PO items within a purchase order (nested).
    Does not require purchase_order field as it's set automatically.
    """
    class Meta:
        model = PurchaseOrderItem
        fields = [
            'item_name', 'description', 'quantity', 'unit', 'unit_price',
            'tax_percentage', 'discount_percentage', 'inventory_item'
        ]
    
    def validate_quantity(self, value):
        """Ensure quantity is positive."""
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0.")
        return value


class PurchaseOrderSerializer(serializers.ModelSerializer):
    """
    Complete serializer for PurchaseOrder with nested items.
    """
    items = PurchaseOrderItemSerializer(many=True, read_only=True)
    vendor_name = serializers.CharField(source='vendor.company_name', read_only=True)
    created_by_name = serializers.CharField(
        source='created_by.get_full_name',
        read_only=True,
        allow_null=True
    )
    approved_by_name = serializers.CharField(
        source='approved_by.get_full_name',
        read_only=True,
        allow_null=True
    )
    
    class Meta:
        model = PurchaseOrder
        fields = [
            'id', 'po_number', 'vendor', 'vendor_name', 'po_date',
            'expected_delivery_date', 'actual_delivery_date', 'status',
            'created_by', 'created_by_name', 'approved_by', 'approved_by_name',
            'approved_at', 'subtotal', 'tax_amount', 'discount_amount',
            'total_amount', 'delivery_address', 'shipping_method',
            'tracking_number', 'terms_and_conditions', 'notes',
            'is_recurring', 'recurrence_frequency', 'items',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'po_number', 'subtotal', 'tax_amount', 'discount_amount',
            'total_amount', 'approved_by', 'approved_at', 'created_at', 'updated_at'
        ]


class PurchaseOrderListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for PO list views.
    """
    vendor_name = serializers.CharField(source='vendor.company_name', read_only=True)
    items_count = serializers.SerializerMethodField()
    
    class Meta:
        model = PurchaseOrder
        fields = [
            'id', 'po_number', 'vendor', 'vendor_name', 'po_date',
            'expected_delivery_date', 'status', 'total_amount',
            'items_count', 'created_at'
        ]
    
    def get_items_count(self, obj):
        return obj.items.count()


class PurchaseOrderCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating PO with nested items.
    """
    items = PurchaseOrderItemCreateSerializer(many=True)
    
    class Meta:
        model = PurchaseOrder
        fields = [
            'vendor', 'po_date', 'expected_delivery_date', 'delivery_address',
            'shipping_method', 'terms_and_conditions', 'notes',
            'is_recurring', 'recurrence_frequency', 'items'
        ]
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        purchase_order = PurchaseOrder.objects.create(**validated_data)
        
        # Create items and calculate totals
        subtotal = Decimal('0.00')
        tax_amount = Decimal('0.00')
        discount_amount = Decimal('0.00')
        
        for item_data in items_data:
            item_data['purchase_order'] = purchase_order
            item = PurchaseOrderItem.objects.create(**item_data)
            
            # Calculate amounts
            base_amount = item.quantity * item.unit_price
            item_discount = base_amount * (item.discount_percentage / 100)
            amount_after_discount = base_amount - item_discount
            item_tax = amount_after_discount * (item.tax_percentage / 100)
            
            subtotal += base_amount
            discount_amount += item_discount
            tax_amount += item_tax
        
        # Update PO totals
        purchase_order.subtotal = subtotal
        purchase_order.discount_amount = discount_amount
        purchase_order.tax_amount = tax_amount
        purchase_order.total_amount = subtotal - discount_amount + tax_amount
        purchase_order.save()
        
        return purchase_order


class VendorPaymentSerializer(serializers.ModelSerializer):
    """
    Serializer for VendorPayment.
    """
    vendor_name = serializers.CharField(source='vendor.company_name', read_only=True)
    processed_by_name = serializers.CharField(
        source='processed_by.get_full_name',
        read_only=True,
        allow_null=True
    )
    purchase_orders_list = serializers.SerializerMethodField()
    generated_invoice = serializers.SerializerMethodField()
    
    class Meta:
        model = VendorPayment
        fields = [
            'id', 'payment_id', 'vendor', 'vendor_name', 'payment_date',
            'amount', 'payment_method', 'status', 'is_advance',
            'transaction_reference', 'upi_transaction_id', 'cheque_number',
            'processed_by', 'processed_by_name', 'notes', 'purchase_orders',
            'purchase_orders_list', 'generated_invoice', 'created_at', 'updated_at'
        ]
        read_only_fields = ['payment_id', 'created_at', 'updated_at']
    
    def get_purchase_orders_list(self, obj):
        return [po.po_number for po in obj.purchase_orders.all()]
    
    def get_generated_invoice(self, obj):
        """Return the auto-generated invoice if it exists."""
        # Find invoice with matching reference number (payment_id)
        try:
            invoice = VendorInvoice.objects.filter(
                vendor=obj.vendor,
                reference_number=obj.payment_id
            ).first()
            
            if invoice:
                return {
                    'id': invoice.id,
                    'invoice_number': invoice.invoice_number,
                    'invoice_date': invoice.invoice_date,
                    'total_amount': str(invoice.total_amount),
                    'amount_paid': str(invoice.amount_paid),
                    'status': invoice.status,
                    'payment_status': invoice.payment_status
                }
        except:
            pass
        return None
    
    def validate_amount(self, value):
        """Ensure amount is positive."""
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0.")
        return value



class GRNItemSerializer(serializers.ModelSerializer):
    """
    Serializer for GRNItem.
    """
    item_name = serializers.CharField(source='po_item.item_name', read_only=True)
    unit = serializers.CharField(source='po_item.unit', read_only=True)
    
    class Meta:
        model = GRNItem
        fields = [
            'id', 'grn', 'po_item', 'item_name', 'unit', 'ordered_quantity',
            'received_quantity', 'accepted_quantity', 'rejected_quantity',
            'quality_check_passed', 'rejection_reason', 'batch_number',
            'expiry_date'
        ]


class GRNItemCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating GRN items within a GRN (nested).
    Does not require grn field as it's set automatically.
    """
    class Meta:
        model = GRNItem
        fields = [
            'po_item', 'ordered_quantity', 'received_quantity',
            'accepted_quantity', 'rejected_quantity', 'quality_check_passed',
            'rejection_reason', 'batch_number', 'expiry_date'
        ]


class GoodsReceiptNoteSerializer(serializers.ModelSerializer):
    """
    Complete serializer for GRN with nested items.
    """
    items = GRNItemSerializer(many=True, read_only=True)
    po_number = serializers.CharField(source='purchase_order.po_number', read_only=True)
    vendor_name = serializers.CharField(
        source='purchase_order.vendor.company_name',
        read_only=True
    )
    received_by_name = serializers.CharField(
        source='received_by.get_full_name',
        read_only=True,
        allow_null=True
    )
    quality_checked_by_name = serializers.CharField(
        source='quality_checked_by.get_full_name',
        read_only=True,
        allow_null=True
    )
    
    class Meta:
        model = GoodsReceiptNote
        fields = [
            'id', 'grn_number', 'purchase_order', 'po_number', 'vendor_name',
            'receipt_date', 'received_by', 'received_by_name', 'quality_status',
            'quality_notes', 'quality_checked_by', 'quality_checked_by_name',
            'delivery_challan_number', 'invoice_number', 'notes', 'items',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['grn_number', 'created_at', 'updated_at']


class GoodsReceiptNoteCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating GRN with nested items.
    """
    items = GRNItemCreateSerializer(many=True)
    
    class Meta:
        model = GoodsReceiptNote
        fields = [
            'purchase_order', 'receipt_date', 'quality_status', 'quality_notes',
            'delivery_challan_number', 'invoice_number', 'notes', 'items'
        ]
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        grn = GoodsReceiptNote.objects.create(**validated_data)
        
        for item_data in items_data:
            item_data['grn'] = grn
            GRNItem.objects.create(**item_data)
        
        return grn


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
    vendor_name = serializers.CharField(source='vendor.company_name', read_only=True)
    created_by_name = serializers.CharField(
        source='created_by.get_full_name', 
        read_only=True,
        allow_null=True
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
    vendor_name = serializers.CharField(source='vendor.company_name', read_only=True)
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
