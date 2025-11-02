from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from .models import StockTransaction, InventoryItem, StockAlert, FinishedGoodsStock
from apps.production.models import ProductionBatch


@receiver(post_save, sender=StockTransaction)
def check_stock_alerts(sender, instance, created, **kwargs):
    """
    Create stock alerts when inventory falls below thresholds.
    
    Triggered after a stock transaction is created.
    """
    if not created:
        return
    
    item = instance.item
    
    # Check for low stock alert
    if item.is_below_min_stock:
        # Check if there's already an active low_stock alert
        existing_alert = StockAlert.objects.filter(
            item=item,
            alert_type='low_stock',
            status='active'
        ).exists()
        
        if not existing_alert:
            StockAlert.objects.create(
                item=item,
                alert_type='low_stock',
                message=f"Stock for {item.name} is below minimum level. "
                        f"Current: {item.current_stock} {item.unit}, "
                        f"Minimum: {item.min_stock_level} {item.unit}"
            )
    
    # Check for reorder point alert
    if item.is_below_reorder_point:
        # Check if there's already an active reorder_point alert
        existing_alert = StockAlert.objects.filter(
            item=item,
            alert_type='reorder_point',
            status='active'
        ).exists()
        
        if not existing_alert:
            StockAlert.objects.create(
                item=item,
                alert_type='reorder_point',
                message=f"Stock for {item.name} has reached reorder point. "
                        f"Current: {item.current_stock} {item.unit}, "
                        f"Reorder Point: {item.reorder_point} {item.unit}"
            )


@receiver(post_save, sender=ProductionBatch)
def handle_production_batch_completion(sender, instance, created, **kwargs):
    """
    Handle inventory updates when a production batch is completed.
    
    Creates:
    - FinishedGoodsStock entry
    - StockTransaction (type='production')
    - Updates InventoryItem.current_stock
    """
    # Only process completed batches
    if instance.status != 'completed':
        return
    
    # Check if we've already processed this batch
    if FinishedGoodsStock.objects.filter(batch=instance).exists():
        return
    
    # Get or create inventory item for this product
    try:
        inventory_item = InventoryItem.objects.get(product=instance.product)
    except InventoryItem.DoesNotExist:
        # Create inventory item if it doesn't exist
        inventory_item = InventoryItem.objects.create(
            item_id=f"FG-{instance.product.product_id}",
            name=instance.product.name,
            item_type='finished_good',
            unit='piece',  # Default unit, adjust as needed
            product=instance.product,
            min_stock_level=10,  # Default values
            reorder_point=20,
        )
    
    # Calculate expiry date based on product shelf life
    from datetime import timedelta
    expiry_date = instance.batch_date + timedelta(days=instance.product.shelf_life_days)
    
    # Create FinishedGoodsStock entry
    finished_stock = FinishedGoodsStock.objects.create(
        item=inventory_item,
        batch=instance,
        quantity=instance.actual_quantity,
        production_date=instance.batch_date,
        expiry_date=expiry_date,
        quality_check_passed=True,
    )
    
    # Create StockTransaction
    from datetime import datetime
    
    # Get current stock before update
    stock_before = inventory_item.current_stock
    stock_after = stock_before + instance.actual_quantity
    
    # Generate transaction ID
    today = timezone.now().date()
    date_str = today.strftime('%Y%m%d')
    
    last_transaction = StockTransaction.objects.filter(
        transaction_id__startswith=f'ST{date_str}'
    ).order_by('-transaction_id').first()
    
    if last_transaction:
        last_number = int(last_transaction.transaction_id[-4:])
        new_number = last_number + 1
    else:
        new_number = 1
    
    transaction_id = f'ST{date_str}{new_number:04d}'
    
    # Create transaction
    StockTransaction.objects.create(
        transaction_id=transaction_id,
        item=inventory_item,
        transaction_type='production',
        transaction_date=timezone.now(),
        quantity=instance.actual_quantity,
        is_addition=True,
        stock_before=stock_before,
        stock_after=stock_after,
        unit_cost=instance.cost_per_unit if hasattr(instance, 'cost_per_unit') else 0,
        total_cost=instance.total_cost if hasattr(instance, 'total_cost') else 0,
        reference_type='ProductionBatch',
        reference_id=instance.batch_id,
        batch_number=instance.batch_id,
        notes=f"Stock added from production batch {instance.batch_id}"
    )
    
    # Update inventory item current stock
    inventory_item.current_stock = stock_after
    inventory_item.save(update_fields=['current_stock', 'updated_at'])


@receiver(post_save, sender=InventoryItem)
def check_inventory_item_alerts(sender, instance, created, **kwargs):
    """
    Check and create alerts when inventory item is updated.
    
    Monitors stock levels on item save.
    """
    if created:
        return
    
    # Resolve existing alerts if stock is now above thresholds
    if not instance.is_below_min_stock:
        # Auto-resolve low_stock alerts
        StockAlert.objects.filter(
            item=instance,
            alert_type='low_stock',
            status__in=['active', 'acknowledged']
        ).update(
            status='resolved',
            resolved_at=timezone.now()
        )
    
    if not instance.is_below_reorder_point:
        # Auto-resolve reorder_point alerts
        StockAlert.objects.filter(
            item=instance,
            alert_type='reorder_point',
            status__in=['active', 'acknowledged']
        ).update(
            status='resolved',
            resolved_at=timezone.now()
        )
