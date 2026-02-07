"""
Production Management Models

Defines models for products, production batches, and scheduling.
"""

from decimal import Decimal
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _

from apps.core.models import TimeStampedModel
from apps.authentication.models import User


class Product(TimeStampedModel):
    """
    Product Master Data
    
    Stores information about all products manufactured by the dairy.
    """
    
    CATEGORY_CHOICES = [
        ('dairy', 'Dairy Products'),
        ('sweets', 'Sweets'),
        ('beverages', 'Beverages'),
    ]
    
    UNIT_CHOICES = [
        ('kg', 'Kilogram'),
        ('liter', 'Liter'),
        ('piece', 'Piece'),
        ('pack', 'Pack'),
    ]
    
    product_id = models.CharField(
        max_length=20,
        unique=True,
        db_index=True,
        help_text="Unique product identifier"
    )
    name = models.CharField(
        max_length=200,
        help_text="Product name"
    )
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        db_index=True,
        help_text="Product category"
    )
    description = models.TextField(
        blank=True,
        help_text="Detailed product description"
    )
    unit = models.CharField(
        max_length=20,
        choices=UNIT_CHOICES,
        help_text="Unit of measurement"
    )
    cost_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Cost price per unit"
    )
    selling_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Selling price per unit"
    )
    shelf_life_days = models.IntegerField(
        help_text="Shelf life in days"
    )
    storage_temperature = models.CharField(
        max_length=50,
        blank=True,
        help_text="Required storage temperature"
    )
    milk_required_per_unit = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        help_text="Milk required per unit (in liters)"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether product is currently active"
    )
    image = models.ImageField(
        upload_to='products/',
        null=True,
        blank=True,
        help_text="Product image"
    )
    
    class Meta:
        db_table = 'products'
        ordering = ['product_id']
        indexes = [
            models.Index(fields=['product_id']),
            models.Index(fields=['category']),
        ]
        verbose_name = 'Product'
        verbose_name_plural = 'Products'
    
    def __str__(self):
        return f"{self.product_id} - {self.name}"
    
    @property
    def profit_margin(self):
        """Calculate profit margin percentage."""
        if self.cost_price > 0:
            return ((self.selling_price - self.cost_price) / self.cost_price) * 100
        return Decimal('0.00')


class ProductionBatch(TimeStampedModel):
    """
    Production Batch
    
    Tracks individual production batches with quantities, status, and quality metrics.
    """
    
    STATUS_CHOICES = [
        ('planned', 'Planned'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    batch_id = models.CharField(
        max_length=30,
        unique=True,
        db_index=True,
        help_text="Unique batch identifier"
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name='batches',
        help_text="Product being manufactured"
    )
    batch_date = models.DateField(
        help_text="Date of production batch"
    )
    start_time = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Production start time"
    )
    end_time = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Production end time"
    )
    planned_quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Planned production quantity"
    )
    actual_quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Actual production quantity"
    )
    wastage_quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Wastage quantity"
    )
    milk_allocated = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Milk allocated for this batch (liters)"
    )
    milk_used = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Actual milk used (liters)"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='planned',
        help_text="Current batch status"
    )
    quality_check_passed = models.BooleanField(
        default=True,
        help_text="Whether quality check passed"
    )
    quality_notes = models.TextField(
        blank=True,
        help_text="Quality check notes"
    )
    # Milk quality parameters
    fat = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[
            MinValueValidator(Decimal('0.00')),
            MaxValueValidator(Decimal('15.00'))
        ],
        help_text="Fat content (kg per liter)"
    )
    snf = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[
            MinValueValidator(Decimal('0.00')),
            MaxValueValidator(Decimal('15.00'))
        ],
        help_text="SNF - Solids Not Fat (kg per liter)"
    )
    clr = models.DecimalField(
        max_digits=4,
        decimal_places=1,
        null=True,
        blank=True,
        validators=[
            MinValueValidator(Decimal('0.0')),
            MaxValueValidator(Decimal('50.0'))
        ],
        help_text="Corrected Lactometer Reading for milk density (normal range: 25-32)"
    )
    # Product quality parameters
    product_fat = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[
            MinValueValidator(Decimal('0.00')),
            MaxValueValidator(Decimal('15.00'))
        ],
        help_text="Product fat content (kg per liter)"
    )
    product_snf = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[
            MinValueValidator(Decimal('0.00')),
            MaxValueValidator(Decimal('15.00'))
        ],
        help_text="Product SNF - Solids Not Fat (kg per liter)"
    )
    product_clr = models.DecimalField(
        max_digits=4,
        decimal_places=1,
        null=True,
        blank=True,
        validators=[
            MinValueValidator(Decimal('0.0')),
            MaxValueValidator(Decimal('50.0'))
        ],
        help_text="Product Corrected Lactometer Reading for density (normal range: 25-32)"
    )
    yield_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Yield percentage (actual/planned * 100)"
    )
    supervisor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='supervised_batches',
        help_text="Production supervisor"
    )
    operators = models.ManyToManyField(
        User,
        related_name='operated_batches',
        blank=True,
        help_text="Production operators"
    )
    notes = models.TextField(
        blank=True,
        help_text="Additional notes"
    )
    recipe_details = models.JSONField(
        default=dict,
        blank=True,
        help_text="Recipe and ingredient details"
    )
    
    class Meta:
        db_table = 'production_batches'
        ordering = ['-batch_date', '-created_at']
        indexes = [
            models.Index(fields=['batch_id']),
            models.Index(fields=['product', 'batch_date']),
            models.Index(fields=['status']),
        ]
        verbose_name = 'Production Batch'
        verbose_name_plural = 'Production Batches'
    
    def __str__(self):
        return f"{self.batch_id} - {self.product.name}"
    
    def save(self, *args, **kwargs):
        """Override save to calculate yield percentage."""
        from decimal import ROUND_HALF_UP, InvalidOperation
        
        # Calculate yield percentage if actual quantity is set
        if self.actual_quantity and self.planned_quantity:
            try:
                yield_pct = (self.actual_quantity / self.planned_quantity) * 100
                self.yield_percentage = Decimal(str(yield_pct)).quantize(
                    Decimal('0.01'),
                    rounding=ROUND_HALF_UP
                )
            except (InvalidOperation, ValueError, ZeroDivisionError):
                self.yield_percentage = Decimal('0.00')
        
        super().save(*args, **kwargs)
    
    @property
    def duration_minutes(self):
        """Calculate production duration in minutes."""
        if self.start_time and self.end_time:
            duration = self.end_time - self.start_time
            return duration.total_seconds() / 60
        return None
    
    @property
    def efficiency_score(self):
        """Calculate efficiency score based on yield and wastage."""
        if self.planned_quantity > 0:
            wastage_pct = (self.wastage_quantity / self.planned_quantity) * 100
            efficiency = self.yield_percentage - wastage_pct
            return max(Decimal('0.00'), efficiency)
        return Decimal('0.00')


class ProductionSchedule(TimeStampedModel):
    """
    Production Schedule
    
    Plans future production with priorities and resource allocation.
    """
    
    schedule_date = models.DateField(
        help_text="Scheduled production date"
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='schedules',
        help_text="Product to be manufactured"
    )
    planned_quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Planned production quantity"
    )
    priority = models.IntegerField(
        default=1,
        help_text="Production priority (1=highest)"
    )
    notes = models.TextField(
        blank=True,
        help_text="Schedule notes"
    )
    batch = models.OneToOneField(
        ProductionBatch,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='schedule',
        help_text="Linked production batch"
    )
    
    class Meta:
        db_table = 'production_schedules'
        ordering = ['schedule_date', 'priority']
        unique_together = ['schedule_date', 'product']
        verbose_name = 'Production Schedule'
        verbose_name_plural = 'Production Schedules'
    
    def __str__(self):
        return f"{self.schedule_date} - {self.product.name} ({self.planned_quantity})"
    
    @property
    def is_completed(self):
        """Check if schedule has been completed."""
        return self.batch is not None and self.batch.status == 'completed'
    
    @property
    def required_milk(self):
        """Calculate required milk for this schedule."""
        return self.planned_quantity * self.product.milk_required_per_unit
