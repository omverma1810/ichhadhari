"""
Signal handlers for Milk Management System

Automatically updates supplier metrics when collections are created or updated.
"""

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Avg, Sum
from .models import MilkCollection, MilkPayment


@receiver(post_save, sender=MilkCollection)
def update_supplier_metrics_on_collection_save(sender, instance, created, **kwargs):
    """
    Update supplier metrics when a collection is saved.
    
    Updates:
    - total_milk_supplied
    - avg_quality_score
    - outstanding_balance (if collection is accepted)
    """
    from decimal import Decimal, ROUND_HALF_UP
    import logging
    
    logger = logging.getLogger(__name__)
    
    # Wrap entire signal in try-except to prevent breaking saves
    try:
        supplier = instance.supplier
        
        # Recalculate total milk supplied
        total_supplied = supplier.collections.aggregate(
            total=Sum('quantity')
        )['total']
        
        if total_supplied is not None:
            supplier.total_milk_supplied = Decimal(str(total_supplied)).quantize(
                Decimal('0.01'), rounding=ROUND_HALF_UP
            )
        else:
            supplier.total_milk_supplied = Decimal('0.00')
        
        # Recalculate average quality score
        avg_quality = supplier.collections.aggregate(
            avg=Avg('quality_score')
        )['avg']
        
        if avg_quality is not None:
            supplier.avg_quality_score = Decimal(str(float(avg_quality))).quantize(
                Decimal('0.01'), rounding=ROUND_HALF_UP
            )
        else:
            supplier.avg_quality_score = Decimal('0.00')
        
        # Update outstanding balance for accepted collections
        if instance.quality_status == 'accepted':
            # If this is a new collection, add to outstanding balance
            if created:
                supplier.outstanding_balance += instance.total_amount
        
        # Save only the specific fields we're updating to avoid triggering other signals
        supplier.save(update_fields=['total_milk_supplied', 'avg_quality_score', 'outstanding_balance', 'updated_at'])
        
    except Exception as e:
        logger.error(f"Error updating supplier metrics in signal: {e}")


@receiver(post_delete, sender=MilkCollection)
def update_supplier_metrics_on_collection_delete(sender, instance, **kwargs):
    """
    Update supplier metrics when a collection is deleted.
    
    Recalculates all metrics after deletion.
    """
    from decimal import Decimal, ROUND_HALF_UP
    import logging
    
    logger = logging.getLogger(__name__)
    
    try:
        supplier = instance.supplier
        
        # Recalculate total milk supplied
        total_supplied = supplier.collections.aggregate(
            total=Sum('quantity')
        )['total']
        
        if total_supplied is not None:
            supplier.total_milk_supplied = Decimal(str(total_supplied)).quantize(
                Decimal('0.01'), rounding=ROUND_HALF_UP
            )
        else:
            supplier.total_milk_supplied = Decimal('0.00')
        
        # Recalculate average quality score
        avg_quality = supplier.collections.aggregate(
            avg=Avg('quality_score')
        )['avg']
        
        if avg_quality is not None:
            supplier.avg_quality_score = Decimal(str(float(avg_quality))).quantize(
                Decimal('0.01'), rounding=ROUND_HALF_UP
            )
        else:
            supplier.avg_quality_score = Decimal('0.00')
        
        # Update outstanding balance if collection was accepted
        if instance.quality_status == 'accepted':
            supplier.outstanding_balance -= instance.total_amount
            # Ensure balance doesn't go negative
            if supplier.outstanding_balance < Decimal('0.00'):
                supplier.outstanding_balance = Decimal('0.00')
        
        # Save only the specific fields we're updating
        supplier.save(update_fields=['total_milk_supplied', 'avg_quality_score', 'outstanding_balance', 'updated_at'])
        
    except Exception as e:
        logger.error(f"Error updating supplier metrics on collection delete: {e}")


@receiver(post_save, sender=MilkPayment)
def update_supplier_on_payment_status_change(sender, instance, created, **kwargs):
    """
    Update supplier totals when payment status changes to completed.
    
    Note: The actual update is handled in the view's mark_completed action
    to ensure it only happens once when explicitly marked as completed.
    """
    # This signal can be used for additional logging or notifications
    # The main update logic is in the view to have better control
    pass
