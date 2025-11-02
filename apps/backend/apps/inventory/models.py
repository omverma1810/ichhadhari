from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
from decimal import Decimal
from apps.core.models import TimeStampedModel
from apps.production.models import Product, ProductionBatch

User = get_user_model()


class InventoryItem(TimeStampedModel):
    """
    Core inventory item model representing any item in the inventory system.
    """
    
    ITEM_TYPE_CHOICES = [
        ('raw_milk', 'Raw Milk'),
        ('raw_material', 'Raw Material'),
        ('finished_good', 'Finished Good'),
        ('packaging', 'Packaging Material'),
    ]
    
    UNIT_CHOICES = [
        ('kg', 'Kilogram'),
        ('liter', 'Liter'),
        ('piece', 'Piece'),
        ('pack', 'Pack'),
        ('bag', 'Bag'),
        ('box', 'Box'),
    ]
    
    item_id = models.CharField(max_length=30, unique=True, db_index=True)
    name = models.CharField(max_length=200)
    item_type = models.CharField(max_length=20, choices=ITEM_TYPE_CHOICES)
    description = models.TextField(blank=True)
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES)
    cost_per_unit = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    current_stock = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=0,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    min_stock_level = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    max_stock_level = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    reorder_point = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    storage_location = models.CharField(max_length=100, blank=True)
    storage_temperature = models.CharField(max_length=50, blank=True)
    is_active = models.BooleanField(default=True)
    product = models.OneToOneField(
        Product,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='inventory'
    )
    
    class Meta:
        db_table = 'inventory_items'
        ordering = ['item_id']
        indexes = [
            models.Index(fields=['item_id']),
            models.Index(fields=['item_type']),
        ]
    
    def __str__(self):
        return f"{self.item_id} - {self.name}"
    
    @property
    def is_below_min_stock(self):
        """Check if current stock is below minimum stock level."""
        return self.current_stock < self.min_stock_level
    
    @property
    def is_below_reorder_point(self):
        """Check if current stock is below reorder point."""
        return self.current_stock <= self.reorder_point


class StockTransaction(TimeStampedModel):
    """
    Records all stock movements in and out of inventory.
    """
    
    TRANSACTION_TYPE_CHOICES = [
        ('purchase', 'Purchase'),
        ('production', 'Production'),
        ('sale', 'Sale'),
        ('wastage', 'Wastage'),
        ('adjustment', 'Adjustment'),
        ('return', 'Return'),
        ('transfer', 'Transfer'),
    ]
    
    transaction_id = models.CharField(max_length=30, unique=True, db_index=True)
    item = models.ForeignKey(
        InventoryItem,
        on_delete=models.PROTECT,
        related_name='transactions'
    )
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPE_CHOICES)
    transaction_date = models.DateTimeField()
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    is_addition = models.BooleanField(help_text="True for IN, False for OUT")
    stock_before = models.DecimalField(max_digits=12, decimal_places=2)
    stock_after = models.DecimalField(max_digits=12, decimal_places=2)
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2)
    total_cost = models.DecimalField(max_digits=12, decimal_places=2)
    reference_type = models.CharField(max_length=50, blank=True)
    reference_id = models.CharField(max_length=50, blank=True)
    batch_number = models.CharField(max_length=50, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    performed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'stock_transactions'
        ordering = ['-transaction_date']
        indexes = [
            models.Index(fields=['transaction_id']),
            models.Index(fields=['item', 'transaction_date']),
            models.Index(fields=['transaction_type']),
        ]
    
    def __str__(self):
        return f"{self.transaction_id} - {self.item.name} ({self.transaction_type})"


class RawMaterialStock(TimeStampedModel):
    """
    Tracks batch-wise raw material stock with supplier and expiry details.
    """
    
    item = models.ForeignKey(
        InventoryItem,
        on_delete=models.PROTECT,
        related_name='raw_material_batches'
    )
    supplier_name = models.CharField(max_length=200)
    batch_number = models.CharField(max_length=50)
    purchase_date = models.DateField()
    expiry_date = models.DateField(null=True, blank=True)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    cost_per_unit = models.DecimalField(max_digits=10, decimal_places=2)
    total_cost = models.DecimalField(max_digits=12, decimal_places=2)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'raw_material_stocks'
        ordering = ['-purchase_date']
    
    def __str__(self):
        return f"{self.item.name} - Batch {self.batch_number}"


class FinishedGoodsStock(TimeStampedModel):
    """
    Tracks finished goods from production with quality and location details.
    """
    
    item = models.ForeignKey(
        InventoryItem,
        on_delete=models.PROTECT,
        related_name='finished_goods_batches'
    )
    batch = models.ForeignKey(
        ProductionBatch,
        on_delete=models.CASCADE,
        related_name='finished_stock'
    )
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    production_date = models.DateField()
    expiry_date = models.DateField()
    quality_check_passed = models.BooleanField(default=True)
    shop_location = models.CharField(max_length=100, blank=True)
    is_sold = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'finished_goods_stocks'
        ordering = ['-production_date']
    
    def __str__(self):
        return f"{self.item.name} - Batch {self.batch.batch_id}"


class StockAlert(models.Model):
    """
    Alerts for low stock, expiring items, and other inventory issues.
    """
    
    ALERT_TYPE_CHOICES = [
        ('low_stock', 'Low Stock'),
        ('reorder_point', 'Reorder Point Reached'),
        ('expiring_soon', 'Expiring Soon'),
        ('expired', 'Expired'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('acknowledged', 'Acknowledged'),
        ('resolved', 'Resolved'),
    ]
    
    item = models.ForeignKey(
        InventoryItem,
        on_delete=models.CASCADE,
        related_name='alerts'
    )
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    message = models.TextField()
    acknowledged_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='acknowledged_alerts'
    )
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='resolved_alerts'
    )
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'stock_alerts'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.alert_type} - {self.item.name} ({self.status})"
