"""
Models for Milk Management System

This module contains models for:
- Supplier: Milk suppliers/farmers
- MilkCollection: Daily milk collection records
- MilkPayment: Payment records to suppliers
"""

from decimal import Decimal
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from apps.core.models import TimeStampedModel
from apps.authentication.models import User
from apps.production.models import Product


class Supplier(TimeStampedModel):
    """
    Model representing a milk supplier (farmer or cooperative).
    
    Suppliers provide milk to the dairy and are tracked for collections,
    quality, and payments.
    """
    
    SUPPLIER_TYPE_CHOICES = [
        ('milk_supplier', 'Milk Supplier'),
        ('equipment', 'Equipment'),
        ('packaging', 'Packaging'),
        ('chemical', 'Chemical'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('suspended', 'Suspended'),
    ]
    
    PAYMENT_CYCLE_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('fortnightly', 'Fortnightly'),
        ('monthly', 'Monthly'),
    ]
    
    # Basic Information
    supplier_id = models.CharField(
        max_length=20,
        unique=True,
        db_index=True,
        help_text="Unique identifier for the supplier"
    )
    name = models.CharField(max_length=200, help_text="Supplier name")
    supplier_type = models.CharField(
        max_length=20,
        choices=SUPPLIER_TYPE_CHOICES,
        help_text="Type of supplier"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active',
        db_index=True,
        help_text="Current status of the supplier"
    )
    
    # Contact Information
    phone = models.CharField(max_length=15, help_text="Primary phone number")
    alternate_phone = models.CharField(
        max_length=15,
        blank=True,
        help_text="Alternate phone number"
    )
    email = models.EmailField(blank=True, help_text="Email address")
    address = models.TextField(help_text="Full address")
    
    # Collection Details
    route_name = models.CharField(
        max_length=100,
        db_index=True,
        help_text="Collection route name"
    )
    collection_time = models.TimeField(help_text="Usual collection time")
    
    # Banking Information
    bank_name = models.CharField(max_length=100, blank=True)
    account_number = models.CharField(max_length=50, blank=True)
    ifsc_code = models.CharField(max_length=20, blank=True)
    account_holder_name = models.CharField(max_length=200, blank=True)
    payment_cycle = models.CharField(
        max_length=20,
        choices=PAYMENT_CYCLE_CHOICES,
        default='monthly',
        help_text="Payment frequency"
    )
    
    # Metrics (auto-calculated)
    avg_quality_score = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Average quality score across all collections"
    )
    total_milk_supplied = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Total liters of milk supplied"
    )
    total_amount_paid = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Total amount paid to supplier"
    )
    outstanding_balance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Amount pending to be paid"
    )
    
    # Additional Information
    documents = models.JSONField(
        default=dict,
        blank=True,
        help_text="Document references and metadata"
    )
    notes = models.TextField(blank=True, help_text="Additional notes")
    
    class Meta:
        db_table = 'suppliers'
        ordering = ['supplier_id']
        indexes = [
            models.Index(fields=['supplier_id']),
            models.Index(fields=['route_name']),
            models.Index(fields=['status']),
        ]
        verbose_name = 'Supplier'
        verbose_name_plural = 'Suppliers'
    
    def __str__(self):
        return f"{self.supplier_id} - {self.name}"
    
    def clean(self):
        """Validate the model data."""
        if self.payment_cycle in ['weekly', 'fortnightly', 'monthly']:
            if not self.bank_name or not self.account_number:
                raise ValidationError(
                    "Bank details are required for non-daily payment cycles"
                )


class MilkCollection(TimeStampedModel):
    """
    Model representing a single milk collection transaction.
    
    Records milk received from suppliers with quality parameters
    and automatic calculation of quality scores and amounts.
    """
    
    MILK_TYPE_CHOICES = [
        ('cow', 'Cow Milk'),
        ('buffalo', 'Buffalo Milk'),
        ('mixed', 'Mixed Milk'),
    ]
    
    QUALITY_STATUS_CHOICES = [
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('conditional', 'Conditional'),
    ]
    
    # Identification
    collection_id = models.CharField(
        max_length=30,
        unique=True,
        db_index=True,
        help_text="Unique collection identifier (auto-generated)"
    )
    
    # Relationships
    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.PROTECT,
        related_name='collections',
        help_text="Supplier providing the milk"
    )
    collected_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='milk_collections',
        help_text="Staff member who collected the milk"
    )
    
    # Collection Details
    collection_date = models.DateField(
        db_index=True,
        help_text="Date of collection"
    )
    collection_time = models.TimeField(help_text="Time of collection")
    milk_type = models.CharField(
        max_length=20,
        choices=MILK_TYPE_CHOICES,
        help_text="Type of milk"
    )
    
    # Quantity and Quality
    quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Quantity in liters"
    )
    fat = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        validators=[
            MinValueValidator(Decimal('0.00')),
            MaxValueValidator(Decimal('15.00'))
        ],
        help_text="Fat content (kg per liter)"
    )
    snf = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[
            MinValueValidator(Decimal('0.00')),
            MaxValueValidator(Decimal('15.00'))
        ],
        help_text="SNF - Solids Not Fat (kg per liter)"
    )
    clr = models.DecimalField(
        max_digits=4,
        decimal_places=1,
        default=Decimal('0.0'),
        validators=[
            MinValueValidator(Decimal('0.0')),
            MaxValueValidator(Decimal('50.0'))
        ],
        help_text="Corrected Lactometer Reading for milk density (normal range: 25-32)"
    )
    
    # Quality Assessment
    quality_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Calculated quality score (0-100)"
    )
    quality_status = models.CharField(
        max_length=20,
        choices=QUALITY_STATUS_CHOICES,
        default='accepted',
        help_text="Quality assessment status"
    )
    rejection_reason = models.TextField(
        blank=True,
        help_text="Reason for rejection if applicable"
    )
    
    # Financial
    rate_per_fat = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        help_text="Fat rate - price per kg of fat content (₹)"
    )
    rate_per_snf = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="SNF rate - price per kg of SNF content (₹)"
    )
    price_per_liter = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Calculated price per liter"
    )
    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Total amount for this collection (quantity × price_per_liter)"
    )
    
    # Additional Information
    notes = models.TextField(blank=True, help_text="Additional notes")
    bmc_integration_data = models.JSONField(
        default=dict,
        blank=True,
        help_text="Data from BMC (Bulk Milk Cooler) integration"
    )
    
    class Meta:
        db_table = 'milk_collections'
        ordering = ['-collection_date', '-collection_time']
        unique_together = ['supplier', 'collection_date', 'collection_time']
        indexes = [
            models.Index(fields=['collection_id']),
            models.Index(fields=['supplier', 'collection_date']),
            models.Index(fields=['collection_date']),
        ]
        verbose_name = 'Milk Collection'
        verbose_name_plural = 'Milk Collections'
    
    def __str__(self):
        return f"{self.collection_id} - {self.supplier.name} - {self.collection_date}"
    
    def calculate_quality_score(self) -> Decimal:
        """
        Calculate quality score based on fat, SNF, and CLR.
        
        Scoring:
        - Fat: 0-50 points (proportional to fat content, max at 6.0 kg/L+)
        - SNF: 0-30 points (proportional to SNF content, max at 9.0 kg/L+)
        - CLR: 20 points if between 25-32 (normal density range), else 0
        
        Returns:
            Decimal: Quality score between 0 and 100
        """
        # Fat score (max 50 points, optimal at 6.0 kg/L or higher)
        fat_score = min(
            (float(self.fat) / 6.0) * 50,
            50.0
        )
        
        # SNF score (max 30 points, optimal at 9.0 kg/L or higher)
        snf_score = min(
            (float(self.snf) / 9.0) * 30,
            30.0
        )
        
        # CLR score (20 points if in normal density range 25-32)
        clr_val = float(self.clr)
        clr_score = 20.0 if 25.0 <= clr_val <= 32.0 else 0.0
        
        total_score = fat_score + snf_score + clr_score
        # Ensure score is between 0 and 100, rounded to 2 decimal places
        total_score = max(0.0, min(100.0, total_score))
        return Decimal(str(round(total_score, 2)))
    
    def save(self, *args, **kwargs):
        """Override save to auto-calculate quality score, price per liter, and total amount."""
        from decimal import ROUND_HALF_UP, InvalidOperation
        import logging
        
        logger = logging.getLogger(__name__)
        
        # Ensure all decimal fields have valid values and properly convert to Decimal
        try:
            if self.quantity is None or self.quantity == '':
                self.quantity = Decimal('0.00')
            else:
                self.quantity = Decimal(str(self.quantity)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        except (InvalidOperation, ValueError, TypeError):
            logger.error(f"Invalid quantity value: {self.quantity}")
            self.quantity = Decimal('0.00')
            
        try:
            if self.fat is None or self.fat == '':
                self.fat = Decimal('0.00')
            else:
                self.fat = Decimal(str(self.fat)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        except (InvalidOperation, ValueError, TypeError):
            logger.error(f"Invalid fat value: {self.fat}")
            self.fat = Decimal('0.00')
            
        try:
            if self.snf is None or self.snf == '':
                self.snf = Decimal('0.00')
            else:
                self.snf = Decimal(str(self.snf)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        except (InvalidOperation, ValueError, TypeError):
            logger.error(f"Invalid snf value: {self.snf}")
            self.snf = Decimal('0.00')
            
        try:
            if self.clr is None or self.clr == '':
                self.clr = Decimal('0.0')
            else:
                # CLR has decimal_places=1, so quantize to 0.1
                self.clr = Decimal(str(self.clr)).quantize(Decimal('0.1'), rounding=ROUND_HALF_UP)
        except (InvalidOperation, ValueError, TypeError):
            logger.error(f"Invalid CLR value: {self.clr}")
            self.clr = Decimal('0.0')
            
        try:
            if self.rate_per_fat is None or self.rate_per_fat == '':
                self.rate_per_fat = Decimal('0.00')
            else:
                self.rate_per_fat = Decimal(str(self.rate_per_fat)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        except (InvalidOperation, ValueError, TypeError):
            logger.error(f"Invalid rate_per_fat value: {self.rate_per_fat}")
            self.rate_per_fat = Decimal('0.00')
            
        try:
            if self.rate_per_snf is None or self.rate_per_snf == '':
                self.rate_per_snf = Decimal('0.00')
            else:
                self.rate_per_snf = Decimal(str(self.rate_per_snf)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        except (InvalidOperation, ValueError, TypeError):
            logger.error(f"Invalid rate_per_snf value: {self.rate_per_snf}")
            self.rate_per_snf = Decimal('0.00')
        
        # Calculate quality score and ensure it's valid
        try:
            self.quality_score = self.calculate_quality_score()
            # Ensure it's a valid Decimal with proper precision
            if self.quality_score is not None:
                self.quality_score = Decimal(str(self.quality_score)).quantize(
                    Decimal('0.01'),
                    rounding=ROUND_HALF_UP
                )
            else:
                self.quality_score = Decimal('0.00')
        except (InvalidOperation, ValueError, TypeError, AttributeError) as e:
            logger.error(f"Error calculating quality_score: {e}")
            self.quality_score = Decimal('0.00')
        
        # Calculate price per liter: (fat × rate_per_fat) + (snf × rate_per_snf)
        try:
            price = (self.fat * self.rate_per_fat) + (self.snf * self.rate_per_snf)
            if price is not None:
                self.price_per_liter = Decimal(str(price)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            else:
                self.price_per_liter = Decimal('0.00')
        except (InvalidOperation, ValueError, TypeError, AttributeError) as e:
            logger.error(f"Error calculating price_per_liter: {e}")
            self.price_per_liter = Decimal('0.00')
        
        # Calculate total amount (quantity × price_per_liter)
        try:
            amount = self.quantity * self.price_per_liter
            if amount is not None:
                self.total_amount = Decimal(str(amount)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            else:
                self.total_amount = Decimal('0.00')
        except (InvalidOperation, ValueError, TypeError, AttributeError) as e:
            logger.error(f"Error calculating total_amount: {e}")
            self.total_amount = Decimal('0.00')
        
        super().save(*args, **kwargs)
    
    def clean(self):
        """Validate the model data."""
        if self.quality_status == 'rejected' and not self.rejection_reason:
            raise ValidationError(
                "Rejection reason is required when quality status is 'rejected'"
            )
        
        # Validate CLR is reasonable
        if self.clr > Decimal('50.0'):
            raise ValidationError(
                "CLR value seems unusually high. Please verify."
            )

class MilkSegregationPlan(TimeStampedModel):
    """
    Manual milk segregation plan into finished products.
    """

    plan_date = models.DateField(
        db_index=True,
        help_text="Segregation plan date"
    )
    total_liters = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Total liters available for segregation"
    )
    notes = models.TextField(blank=True, help_text="Optional notes")
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="milk_segregation_plans",
        help_text="User who created the segregation plan"
    )

    class Meta:
        db_table = 'milk_segregation_plans'
        ordering = ['-plan_date', '-created_at']
        indexes = [
            models.Index(fields=['plan_date']),
            models.Index(fields=['created_by']),
        ]

    def __str__(self):
        return f"Segregation {self.plan_date} - {self.total_liters}L"


class MilkSegregationItem(TimeStampedModel):
    """
    Product-level allocation for a segregation plan.
    """

    plan = models.ForeignKey(
        MilkSegregationPlan,
        on_delete=models.CASCADE,
        related_name="items",
        help_text="Segregation plan"
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name="milk_segregation_items",
        help_text="Product receiving allocation"
    )
    allocated_liters = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Milk allocated to this product (liters)"
    )
    planned_units = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Planned units based on milk requirement"
    )
    notes = models.TextField(blank=True, help_text="Optional item notes")

    class Meta:
        db_table = 'milk_segregation_items'
        ordering = ['product__name']
        unique_together = ['plan', 'product']
        indexes = [
            models.Index(fields=['plan', 'product']),
        ]

    def __str__(self):
        return f"{self.product.name} - {self.allocated_liters}L"

class MilkPayment(TimeStampedModel):
    """
    Model representing a payment made to a supplier.
    
    Tracks payments with references to the collections covered
    in the payment period.
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
    
    # Identification
    payment_id = models.CharField(
        max_length=30,
        unique=True,
        db_index=True,
        help_text="Unique payment identifier (auto-generated)"
    )
    
    # Relationships
    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.PROTECT,
        related_name='payments',
        help_text="Supplier receiving the payment"
    )
    processed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='processed_payments',
        help_text="Staff member who processed the payment"
    )
    
    # Payment Details
    payment_date = models.DateField(
        db_index=True,
        help_text="Date of payment"
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Payment amount"
    )
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        help_text="Method of payment"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        help_text="Payment status"
    )
    
    # Period Covered
    period_start = models.DateField(help_text="Start date of payment period")
    period_end = models.DateField(help_text="End date of payment period")
    
    # Transaction References
    transaction_reference = models.CharField(
        max_length=100,
        blank=True,
        help_text="General transaction reference"
    )
    upi_transaction_id = models.CharField(
        max_length=100,
        blank=True,
        help_text="UPI transaction ID if applicable"
    )
    cheque_number = models.CharField(
        max_length=50,
        blank=True,
        help_text="Cheque number if applicable"
    )
    
    # Related Collections
    collections = models.ManyToManyField(
        MilkCollection,
        related_name='payments',
        blank=True,
        help_text="Collections covered by this payment"
    )
    
    # Additional Information
    notes = models.TextField(blank=True, help_text="Additional notes")
    
    class Meta:
        db_table = 'milk_payments'
        ordering = ['-payment_date']
        indexes = [
            models.Index(fields=['payment_id']),
            models.Index(fields=['supplier', 'payment_date']),
        ]
        verbose_name = 'Milk Payment'
        verbose_name_plural = 'Milk Payments'
    
    def __str__(self):
        return f"{self.payment_id} - {self.supplier.name} - {self.amount}"
    
    def clean(self):
        """Validate the model data."""
        if self.period_start > self.period_end:
            raise ValidationError(
                "Period start date must be before or equal to period end date"
            )
        
        if self.payment_method == 'upi' and not self.upi_transaction_id:
            raise ValidationError(
                "UPI transaction ID is required for UPI payments"
            )
        
        if self.payment_method == 'cheque' and not self.cheque_number:
            raise ValidationError(
                "Cheque number is required for cheque payments"
            )
        
        if self.payment_method == 'bank_transfer' and not self.transaction_reference:
            raise ValidationError(
                "Transaction reference is required for bank transfers"
            )
