from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
from django.utils import timezone
from decimal import Decimal
from apps.core.models import TimeStampedModel
from apps.inventory.models import InventoryItem

User = get_user_model()


class Vendor(TimeStampedModel):
    """
    Vendor/Supplier management model.
    """
    
    CATEGORY_CHOICES = [
        ('dairy_counter', 'Dairy Counter'),
        ('hotel', 'Hotel'),
        ('cafe', 'Cafe'),
        ('restaurant', 'Restaurant'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('suspended', 'Suspended'),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('cheque', 'Cheque'),
        ('bank_transfer', 'Bank Transfer'),
        ('upi', 'UPI'),
    ]
    
    vendor_id = models.CharField(max_length=20, unique=True, db_index=True)
    company_name = models.CharField(max_length=200)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    # Contact Information
    contact_person = models.CharField(max_length=200)
    phone = models.CharField(max_length=15)
    alternate_phone = models.CharField(max_length=15, blank=True)
    email = models.EmailField(blank=True)
    website = models.URLField(blank=True)
    
    # Address Information
    billing_address = models.TextField()
    shipping_address = models.TextField(blank=True)
    
    # Legal Information
    gst_number = models.CharField(max_length=20, blank=True)
    pan_number = models.CharField(max_length=20, blank=True)
    company_registration_number = models.CharField(max_length=50, blank=True)
    
    # Banking Information
    bank_name = models.CharField(max_length=100, blank=True)
    account_number = models.CharField(max_length=50, blank=True)
    ifsc_code = models.CharField(max_length=20, blank=True)
    account_holder_name = models.CharField(max_length=200, blank=True)
    
    # Payment Terms
    credit_period_days = models.IntegerField(default=30)
    credit_limit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    payment_method = models.CharField(
        max_length=20, 
        choices=PAYMENT_METHOD_CHOICES, 
        default='bank_transfer'
    )
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Performance Metrics
    rating = models.DecimalField(
        max_digits=3, 
        decimal_places=2, 
        default=0,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    total_purchases = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_payments = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    outstanding_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Additional Information
    documents = models.JSONField(
        default=dict, 
        blank=True,
        help_text='Optional. Leave empty or enter valid JSON (e.g., {} for empty, or {"license": "ABC123"})'
    )
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'vendors'
        ordering = ['vendor_id']
        indexes = [
            models.Index(fields=['vendor_id']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.vendor_id} - {self.company_name}"


class PurchaseOrder(TimeStampedModel):
    """
    Purchase Order model for managing vendor orders.
    """
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('pending_approval', 'Pending Approval'),
        ('approved', 'Approved'),
        ('sent', 'Sent'),
        ('confirmed', 'Confirmed'),
        ('partially_received', 'Partially Received'),
        ('fully_received', 'Fully Received'),
        ('cancelled', 'Cancelled'),
    ]
    
    RECURRENCE_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    ]
    
    po_number = models.CharField(max_length=30, unique=True, db_index=True)
    vendor = models.ForeignKey(
        Vendor,
        on_delete=models.PROTECT,
        related_name='purchase_orders'
    )
    po_date = models.DateField()
    expected_delivery_date = models.DateField()
    actual_delivery_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=25, choices=STATUS_CHOICES, default='draft')
    
    # Approval Information
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_pos'
    )
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_pos'
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    
    # Financial Information
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Delivery Information
    delivery_address = models.TextField()
    shipping_method = models.CharField(max_length=100, blank=True)
    tracking_number = models.CharField(max_length=100, blank=True)
    
    # Additional Information
    terms_and_conditions = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    
    # Recurring Orders
    is_recurring = models.BooleanField(default=False)
    recurrence_frequency = models.CharField(
        max_length=20,
        choices=RECURRENCE_CHOICES,
        blank=True
    )
    
    class Meta:
        db_table = 'purchase_orders'
        ordering = ['-po_date']
        indexes = [
            models.Index(fields=['po_number']),
            models.Index(fields=['vendor', 'po_date']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.po_number} - {self.vendor.company_name}"


class PurchaseOrderItem(models.Model):
    """
    Individual line items in a purchase order.
    """
    
    purchase_order = models.ForeignKey(
        PurchaseOrder,
        on_delete=models.CASCADE,
        related_name='items'
    )
    item_name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=20)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    tax_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    line_total = models.DecimalField(max_digits=12, decimal_places=2)
    quantity_received = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    inventory_item = models.ForeignKey(
        InventoryItem,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='po_items'
    )
    
    class Meta:
        db_table = 'purchase_order_items'
    
    def save(self, *args, **kwargs):
        """Calculate line total before saving."""
        from decimal import Decimal
        
        # Calculate base amount
        base_amount = self.quantity * self.unit_price
        
        # Apply discount
        discount_amount = base_amount * (self.discount_percentage / Decimal('100'))
        amount_after_discount = base_amount - discount_amount
        
        # Apply tax
        tax_amount = amount_after_discount * (self.tax_percentage / Decimal('100'))
        self.line_total = amount_after_discount + tax_amount
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.item_name} - {self.quantity} {self.unit}"


class VendorPayment(TimeStampedModel):
    """
    Payment records for vendors.
    """
    
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('bank_transfer', 'Bank Transfer'),
        ('upi', 'UPI'),
        ('cheque', 'Cheque'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    payment_id = models.CharField(max_length=30, unique=True, db_index=True)
    vendor = models.ForeignKey(
        Vendor,
        on_delete=models.PROTECT,
        related_name='payments'
    )
    payment_date = models.DateField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    is_advance = models.BooleanField(default=False)
    
    # Transaction Details
    transaction_reference = models.CharField(max_length=100, blank=True)
    upi_transaction_id = models.CharField(max_length=100, blank=True)
    cheque_number = models.CharField(max_length=50, blank=True)
    
    processed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    notes = models.TextField(blank=True)
    
    purchase_orders = models.ManyToManyField(
        PurchaseOrder,
        related_name='payments',
        blank=True
    )
    
    class Meta:
        db_table = 'vendor_payments'
        ordering = ['-payment_date']
        indexes = [
            models.Index(fields=['payment_id']),
            models.Index(fields=['vendor', 'payment_date']),
        ]
    
    def __str__(self):
        return f"{self.payment_id} - {self.vendor.company_name} - {self.amount}"


class GoodsReceiptNote(TimeStampedModel):
    """
    Goods Receipt Note (GRN) for tracking received items.
    """
    
    QUALITY_STATUS_CHOICES = [
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('partial', 'Partial'),
    ]
    
    grn_number = models.CharField(max_length=30, unique=True, db_index=True)
    purchase_order = models.ForeignKey(
        PurchaseOrder,
        on_delete=models.PROTECT,
        related_name='grns'
    )
    receipt_date = models.DateField()
    received_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='received_grns'
    )
    
    # Quality Check
    quality_status = models.CharField(max_length=20, choices=QUALITY_STATUS_CHOICES)
    quality_notes = models.TextField(blank=True)
    quality_checked_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='quality_checked_grns'
    )
    
    # Delivery Tracking
    vehicle_number = models.CharField(max_length=50, blank=True)
    driver_name = models.CharField(max_length=200, blank=True)
    driver_phone = models.CharField(max_length=15, blank=True)
    receipt_timestamp = models.DateTimeField(null=True, blank=True)
    
    # Document References
    delivery_challan_number = models.CharField(max_length=50, blank=True)
    invoice_number = models.CharField(max_length=50, blank=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'goods_receipt_notes'
        ordering = ['-receipt_date']
        indexes = [
            models.Index(fields=['grn_number']),
            models.Index(fields=['purchase_order']),
        ]
    
    def __str__(self):
        return f"{self.grn_number} - {self.purchase_order.po_number}"


class GRNItem(models.Model):
    """
    Individual items in a Goods Receipt Note.
    """
    
    grn = models.ForeignKey(
        GoodsReceiptNote,
        on_delete=models.CASCADE,
        related_name='items'
    )
    po_item = models.ForeignKey(
        PurchaseOrderItem,
        on_delete=models.CASCADE
    )
    ordered_quantity = models.DecimalField(max_digits=10, decimal_places=2)
    received_quantity = models.DecimalField(max_digits=10, decimal_places=2)
    accepted_quantity = models.DecimalField(max_digits=10, decimal_places=2)
    rejected_quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    quality_check_passed = models.BooleanField(default=True)
    rejection_reason = models.TextField(blank=True)
    
    # Batch Information
    batch_number = models.CharField(max_length=50, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    
    class Meta:
        db_table = 'grn_items'
    
    def __str__(self):
        return f"{self.grn.grn_number} - {self.po_item.item_name}"


class VendorInvoice(TimeStampedModel):
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
    purchase_orders = models.ManyToManyField(
        PurchaseOrder,
        related_name='invoices',
        blank=True
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
    
    class Meta:
        db_table = 'vendor_invoices'
        ordering = ['-invoice_date', '-created_at']
        indexes = [
            models.Index(fields=['vendor', 'status']),
            models.Index(fields=['invoice_date']),
        ]
    
    def __str__(self):
        return f"{self.invoice_number} - {self.vendor.company_name}"
    
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
    
    # Vendor-specific pricing fields
    market_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Standard market price per unit"
    )
    applied_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Actual price applied (vendor-specific or market)"
    )
    is_vendor_price = models.BooleanField(
        default=False,
        help_text="True if vendor-specific pricing was applied"
    )
    price_savings = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text="Total savings vs market price"
    )
    
    class Meta:
        db_table = 'vendor_invoice_items'
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


class VendorProductPrice(TimeStampedModel):
    """
    Vendor-specific product pricing.
    
    Allows setting custom prices for each vendor-product combination,
    enabling bulk deals and special pricing arrangements.
    """
    from apps.production.models import Product
    
    vendor = models.ForeignKey(
        Vendor,
        on_delete=models.CASCADE,
        related_name='product_prices',
        help_text="Vendor receiving special pricing"
    )
    product = models.ForeignKey(
        'production.Product',
        on_delete=models.CASCADE,
        related_name='vendor_prices',
        help_text="Product with special pricing"
    )
    
    # Pricing
    vendor_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text="Special price for this vendor (per unit)"
    )
    min_quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Minimum order quantity to qualify for this price"
    )
    
    # Validity Period
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this pricing is currently active"
    )
    valid_from = models.DateField(
        null=True,
        blank=True,
        help_text="Start date for this pricing (optional)"
    )
    valid_until = models.DateField(
        null=True,
        blank=True,
        help_text="End date for this pricing (optional)"
    )
    
    # Additional Info
    notes = models.TextField(
        blank=True,
        help_text="Notes about this pricing arrangement (e.g., 'Bulk deal for Q1 2026')"
    )
    
    class Meta:
        db_table = 'vendor_product_prices'
        ordering = ['vendor', 'product']
        unique_together = ['vendor', 'product']
        verbose_name = 'Vendor Product Price'
        verbose_name_plural = 'Vendor Product Prices'
        indexes = [
            models.Index(fields=['vendor', 'is_active']),
            models.Index(fields=['product', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.vendor.company_name} - {self.product.name}: ₹{self.vendor_price}"
    
    @property
    def market_price(self):
        """Get the standard market price from product."""
        return self.product.selling_price
    
    @property
    def discount_amount(self):
        """Calculate discount amount per unit vs market price."""
        return self.market_price - self.vendor_price
    
    @property
    def discount_percentage(self):
        """Calculate discount percentage vs market price."""
        if self.market_price > 0:
            return ((self.market_price - self.vendor_price) / self.market_price) * 100
        return Decimal('0.00')
    
    def is_valid_on_date(self, date=None):
        """Check if this pricing is valid on a given date."""
        if date is None:
            date = timezone.now().date()
        
        if not self.is_active:
            return False
        
        if self.valid_from and date < self.valid_from:
            return False
        
        if self.valid_until and date > self.valid_until:
            return False
        
        return True
    
    @classmethod
    def get_price_for_vendor(cls, vendor, product, quantity=None, date=None):
        """
        Get the applicable price for a vendor-product combination.
        
        Returns (price, is_vendor_price) tuple.
        If vendor-specific price exists and is valid, returns it.
        Otherwise returns the market price.
        """
        if date is None:
            date = timezone.now().date()
        
        try:
            vendor_price = cls.objects.get(
                vendor=vendor,
                product=product,
                is_active=True
            )
            
            # Check validity
            if not vendor_price.is_valid_on_date(date):
                return (product.selling_price, False)
            
            # Check minimum quantity if specified
            if quantity is not None and vendor_price.min_quantity > 0:
                if quantity < vendor_price.min_quantity:
                    return (product.selling_price, False)
            
            return (vendor_price.vendor_price, True)
            
        except cls.DoesNotExist:
            return (product.selling_price, False)
