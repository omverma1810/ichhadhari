from rest_framework import serializers
from django.db import transaction
from .models import (
    Vendor, PurchaseOrder, PurchaseOrderItem,
    VendorPayment, GoodsReceiptNote, GRNItem,
    VendorInvoice, VendorInvoiceItem, VendorProductPrice
)
from decimal import Decimal


class AddressField(serializers.CharField):
    """Coerce address objects into a single string."""

    def to_internal_value(self, data):
        if isinstance(data, dict):
            parts = [
                str(data.get("street", "")).strip(),
                str(data.get("city", "")).strip(),
                str(data.get("state", "")).strip(),
                str(data.get("postal_code", "")).strip(),
                str(data.get("country", "")).strip(),
            ]
            normalized = ", ".join([part for part in parts if part])
            return super().to_internal_value(normalized)
        return super().to_internal_value(data)


class VendorSerializer(serializers.ModelSerializer):
    """
    Complete serializer for Vendor model.
    """
    
    contact_persons = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False,
    )
    bank_details = serializers.DictField(write_only=True, required=False)
    payment_methods = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False,
    )
    preferred_payment_method = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        allow_null=True,
    )
    registration_number = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
    )
    warehouse_address = serializers.DictField(write_only=True, required=False)
    billing_address = AddressField()
    shipping_address = AddressField(required=False, allow_blank=True)

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
            'documents', 'notes', 'created_at', 'updated_at',
            'contact_persons', 'bank_details', 'payment_methods',
            'preferred_payment_method', 'registration_number', 'warehouse_address'
        ]
        read_only_fields = ['created_at', 'updated_at']
        extra_kwargs = {
            'vendor_id': {'required': False, 'allow_blank': True},
            'contact_person': {'required': False, 'allow_blank': True},
        }

    def _generate_vendor_id(self):
        prefix = "VND"
        last_vendor = (
            Vendor.objects
            .filter(vendor_id__startswith=prefix)
            .order_by("-vendor_id")
            .first()
        )
        if last_vendor:
            suffix = last_vendor.vendor_id.replace(prefix, "")
            if suffix.isdigit():
                next_number = int(suffix) + 1
            else:
                next_number = Vendor.objects.count() + 1
        else:
            next_number = 1
        return f"{prefix}{next_number:04d}"

    def _normalize_contact_person(self, validated_data):
        contact_person = validated_data.get("contact_person")
        if contact_person:
            return contact_person
        contact_persons = self.initial_data.get("contact_persons")
        if isinstance(contact_persons, list) and contact_persons:
            primary = contact_persons[0]
            if isinstance(primary, dict):
                name = str(primary.get("name", "")).strip()
                if name:
                    return name
        company_name = validated_data.get("company_name")
        if company_name:
            return company_name
        return "Unknown"

    def _normalize_bank_details(self, validated_data):
        bank_details = self.initial_data.get("bank_details")
        if not isinstance(bank_details, dict):
            return
        if "bank_name" in bank_details:
            validated_data.setdefault("bank_name", bank_details.get("bank_name") or "")
        if "account_number" in bank_details:
            validated_data.setdefault(
                "account_number",
                bank_details.get("account_number") or "",
            )
        if "ifsc_code" in bank_details:
            validated_data.setdefault("ifsc_code", bank_details.get("ifsc_code") or "")
        if "account_holder" in bank_details:
            validated_data.setdefault(
                "account_holder_name",
                bank_details.get("account_holder") or "",
            )

    def _normalize_payment_method(self, validated_data):
        preferred = self.initial_data.get("preferred_payment_method")
        payment_methods = self.initial_data.get("payment_methods")
        if preferred:
            validated_data.setdefault("payment_method", preferred)
        elif isinstance(payment_methods, list) and payment_methods:
            validated_data.setdefault("payment_method", payment_methods[0])

    def _normalize_registration_number(self, validated_data):
        registration_number = self.initial_data.get("registration_number")
        if registration_number and not validated_data.get("company_registration_number"):
            validated_data["company_registration_number"] = registration_number

    @transaction.atomic
    def create(self, validated_data):
        if not validated_data.get("vendor_id"):
            validated_data["vendor_id"] = self._generate_vendor_id()
        validated_data["contact_person"] = self._normalize_contact_person(validated_data)
        self._normalize_bank_details(validated_data)
        self._normalize_payment_method(validated_data)
        self._normalize_registration_number(validated_data)
        validated_data.pop("contact_persons", None)
        validated_data.pop("bank_details", None)
        validated_data.pop("payment_methods", None)
        validated_data.pop("preferred_payment_method", None)
        validated_data.pop("registration_number", None)
        validated_data.pop("warehouse_address", None)
        return super().create(validated_data)

    @transaction.atomic
    def update(self, instance, validated_data):
        if "vendor_id" in validated_data and not validated_data.get("vendor_id"):
            validated_data.pop("vendor_id", None)
        if "contact_person" not in validated_data:
            validated_data["contact_person"] = self._normalize_contact_person(
                {**validated_data, "company_name": instance.company_name}
            )
        self._normalize_bank_details(validated_data)
        self._normalize_payment_method(validated_data)
        self._normalize_registration_number(validated_data)
        validated_data.pop("contact_persons", None)
        validated_data.pop("bank_details", None)
        validated_data.pop("payment_methods", None)
        validated_data.pop("preferred_payment_method", None)
        validated_data.pop("registration_number", None)
        validated_data.pop("warehouse_address", None)
        return super().update(instance, validated_data)


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
            'vehicle_number', 'driver_name', 'driver_phone', 'receipt_timestamp',
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
            'vehicle_number', 'driver_name', 'driver_phone', 'receipt_timestamp',
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
    purchase_orders = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=PurchaseOrder.objects.all(),
        required=False
    )
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
            'items', 'purchase_orders', 'created_by', 'created_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'invoice_number', 'amount_due', 'created_by', 'created_at', 'updated_at'
        ]
    
    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        purchase_orders = validated_data.pop('purchase_orders', [])
        validated_data['created_by'] = self.context['request'].user
        
        invoice = VendorInvoice.objects.create(**validated_data)

        if purchase_orders:
            invoice.purchase_orders.set(purchase_orders)
        
        # Create invoice items
        for item_data in items_data:
            VendorInvoiceItem.objects.create(invoice=invoice, **item_data)
        
        # Recalculate totals
        invoice.subtotal = sum(item.line_total for item in invoice.items.all())
        invoice.save()
        
        return invoice
    
    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        purchase_orders = validated_data.pop('purchase_orders', None)
        
        # Update invoice fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if purchase_orders is not None:
            instance.purchase_orders.set(purchase_orders)
        
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


# ==================== VENDOR PRODUCT PRICING ====================

class VendorProductPriceListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for vendor product price list views."""
    vendor_name = serializers.CharField(source='vendor.company_name', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_unit = serializers.CharField(source='product.unit', read_only=True)
    
    class Meta:
        model = VendorProductPrice
        fields = [
            'id', 'vendor', 'vendor_name', 'product', 'product_name',
            'product_unit', 'vendor_price', 'min_quantity', 'is_active',
            'valid_from', 'valid_until', 'notes', 'created_at'
        ]


class VendorProductPriceSerializer(serializers.ModelSerializer):
    """Full serializer for vendor product price CRUD operations."""
    vendor_name = serializers.CharField(source='vendor.company_name', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_unit = serializers.CharField(source='product.unit', read_only=True)
    market_price = serializers.DecimalField(
        source='product.cost_price',
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    discount_percentage = serializers.SerializerMethodField()
    discount_amount = serializers.SerializerMethodField()
    
    class Meta:
        model = VendorProductPrice
        fields = [
            'id', 'vendor', 'vendor_name', 'product', 'product_name',
            'product_unit', 'vendor_price', 'min_quantity', 'is_active',
            'valid_from', 'valid_until', 'notes',
            'market_price', 'discount_percentage', 'discount_amount',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_discount_percentage(self, obj):
        """Calculate discount percentage from market price."""
        try:
            if obj.product and obj.product.cost_price and obj.product.cost_price > 0:
                discount = ((obj.product.cost_price - obj.vendor_price) / obj.product.cost_price) * 100
                return round(discount, 2)
        except:
            pass
        return 0
    
    def get_discount_amount(self, obj):
        """Calculate discount amount from market price."""
        try:
            if obj.product and obj.product.cost_price:
                return float(obj.product.cost_price - obj.vendor_price)
        except:
            pass
        return 0
    
    def validate(self, data):
        """Ensure unique vendor-product combination for overlapping dates."""
        vendor = data.get('vendor')
        product = data.get('product')
        valid_from = data.get('valid_from')
        valid_until = data.get('valid_until')
        
        if valid_from and valid_until and valid_from > valid_until:
            raise serializers.ValidationError({
                'valid_until': 'Valid until date must be after valid from date.'
            })
        
        # Check for overlapping active prices
        instance = getattr(self, 'instance', None)
        qs = VendorProductPrice.objects.filter(
            vendor=vendor,
            product=product,
            is_active=True
        )
        
        if instance:
            qs = qs.exclude(pk=instance.pk)
        
        if qs.exists() and data.get('is_active', True):
            # Check if there's an overlapping date range
            for existing in qs:
                if self._dates_overlap(valid_from, valid_until, existing.valid_from, existing.valid_until):
                    raise serializers.ValidationError({
                        'product': f'An active price for this vendor-product already exists for the specified date range.'
                    })
        
        return data
    
    def _dates_overlap(self, start1, end1, start2, end2):
        """Check if two date ranges overlap."""
        # If either range has no dates, consider them as overlapping
        if not start1 and not end1:
            return True
        if not start2 and not end2:
            return True
        
        # Convert None to min/max dates for comparison
        from datetime import date
        min_date = date.min
        max_date = date.max
        
        s1 = start1 or min_date
        e1 = end1 or max_date
        s2 = start2 or min_date
        e2 = end2 or max_date
        
        return s1 <= e2 and s2 <= e1
