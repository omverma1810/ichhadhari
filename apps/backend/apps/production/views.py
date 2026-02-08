"""
Production Management Views

ViewSets for Product, ProductionBatch, and ProductionSchedule APIs.
"""

from datetime import date
from decimal import Decimal
from django.db.models import Sum, Avg, Count, Q
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Product, ProductionBatch, ProductionSchedule
from .serializers import (
    ProductSerializer,
    ProductListSerializer,
    ProductionBatchSerializer,
    ProductionBatchListSerializer,
    ProductionScheduleSerializer,
)


class ProductionPermission(IsAuthenticated):
    """
    Custom permission for production management.
    
    Requires authentication and can be extended for role-based access.
    """
    pass


class ProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Product management.
    
    Provides CRUD operations and custom actions for product statistics.
    """
    
    queryset = Product.objects.all()
    permission_classes = [ProductionPermission]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'is_active']
    search_fields = ['product_id', 'name']
    ordering_fields = ['product_id', 'name', 'selling_price']
    ordering = ['product_id']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'list':
            return ProductListSerializer
        return ProductSerializer
    
    @action(detail=True, methods=['get'])
    def batches(self, request, pk=None):
        """
        Get all production batches for this product.
        
        Returns list of batches with optional filtering by status and date range.
        """
        product = self.get_object()
        
        # Get query parameters
        status_filter = request.query_params.get('status')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        # Build queryset
        batches = product.batches.all()
        
        if status_filter:
            batches = batches.filter(status=status_filter)
        
        if start_date:
            batches = batches.filter(batch_date__gte=start_date)
        
        if end_date:
            batches = batches.filter(batch_date__lte=end_date)
        
        # Serialize and return
        serializer = ProductionBatchListSerializer(batches, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """
        Get production statistics for this product.
        
        Returns:
            - total_batches: Total number of batches
            - total_quantity_produced: Total quantity produced
            - avg_yield_percentage: Average yield percentage
            - total_milk_used: Total milk consumed
            - completed_batches: Number of completed batches
            - in_progress_batches: Number of batches in progress
        """
        product = self.get_object()
        
        # Get date range from query params
        days = int(request.query_params.get('days', 30))
        end_date = date.today()
        from datetime import timedelta
        start_date = end_date - timedelta(days=days)
        
        # Calculate statistics
        batches = product.batches.filter(
            batch_date__gte=start_date,
            batch_date__lte=end_date
        )
        
        stats = batches.aggregate(
            total_batches=Count('id'),
            total_quantity_produced=Sum('actual_quantity'),
            avg_yield_percentage=Avg('yield_percentage'),
            total_milk_used=Sum('milk_used'),
            completed_batches=Count('id', filter=Q(status='completed')),
            in_progress_batches=Count('id', filter=Q(status='in_progress')),
        )
        
        # Handle None values
        for key, value in stats.items():
            if value is None:
                stats[key] = 0
        
        # Add date range info
        stats['start_date'] = start_date
        stats['end_date'] = end_date
        stats['days'] = days
        
        return Response(stats)


class ProductionBatchViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ProductionBatch management.
    
    Provides CRUD operations and custom actions for batch lifecycle management.
    """
    
    queryset = ProductionBatch.objects.select_related(
        'product',
        'supervisor'
    ).prefetch_related('operators')
    permission_classes = [ProductionPermission]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['product', 'batch_date', 'status']
    search_fields = ['batch_id', 'product__name']
    ordering_fields = ['batch_date', 'planned_quantity', 'status']
    ordering = ['-batch_date', '-created_at']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'list':
            return ProductionBatchListSerializer
        return ProductionBatchSerializer
    
    def perform_create(self, serializer):
        """
        Create a new batch with auto-generated batch_id.
        
        Batch ID format: PB{YYYYMMDD}{0001}
        """
        # Get batch date from serializer data
        batch_date = serializer.validated_data.get('batch_date', date.today())
        
        # Generate batch_id
        date_str = batch_date.strftime('%Y%m%d')
        prefix = f'PB{date_str}'
        
        # Find the last batch for this date
        last_batch = ProductionBatch.objects.filter(
            batch_id__startswith=prefix
        ).order_by('batch_id').last()
        
        if last_batch:
            # Extract sequence number and increment
            last_seq = int(last_batch.batch_id[-4:])
            new_seq = last_seq + 1
        else:
            new_seq = 1
        
        batch_id = f'{prefix}{new_seq:04d}'
        
        # Save with generated batch_id
        serializer.save(batch_id=batch_id)
    
    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """
        Start a production batch.
        
        Sets status to 'in_progress' and records start_time.
        """
        batch = self.get_object()
        
        # Validate current status
        if batch.status != 'planned':
            return Response(
                {'error': f'Cannot start batch with status: {batch.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update batch
        batch.status = 'in_progress'
        batch.start_time = timezone.now()
        batch.save(update_fields=['status', 'start_time', 'updated_at'])
        
        serializer = self.get_serializer(batch)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def update_actual_quantity(self, request, pk=None):
        """
        Update actual quantity produced and create inventory stock transaction.
        
        Expects: actual_quantity
        
        This will:
        1. Update the batch actual_quantity
        2. Calculate yield_percentage
        3. Create a stock transaction to increment inventory
        """
        batch = self.get_object()
        
        # Get actual_quantity from request
        actual_quantity = request.data.get('actual_quantity')
        
        if actual_quantity is None:
            return Response(
                {'error': 'actual_quantity is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            actual_quantity = Decimal(str(actual_quantity))
        except (ValueError, TypeError):
            return Response(
                {'error': 'Invalid numeric value for actual_quantity'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if actual_quantity < 0:
            return Response(
                {'error': 'actual_quantity cannot be negative'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Store previous quantity to calculate delta
        previous_quantity = batch.actual_quantity or Decimal('0.00')
        quantity_delta = actual_quantity - previous_quantity
        
        # Update batch actual_quantity (yield_percentage will be calculated in save)
        batch.actual_quantity = actual_quantity
        batch.save()
        
        # Create stock transaction if there's a positive delta
        if quantity_delta > 0:
            self._create_stock_transaction_for_production(batch, quantity_delta)
        
        serializer = self.get_serializer(batch)
        return Response(serializer.data)
    
    def _create_stock_transaction_for_production(self, batch, quantity):
        """Create a stock transaction for produced goods."""
        from apps.inventory.models import StockTransaction, InventoryItem
        from django.db.models import F
        
        # Get or create inventory item for the product
        try:
            inventory_item = InventoryItem.objects.get(name=batch.product.name)
        except InventoryItem.DoesNotExist:
            return  # Skip if inventory item doesn't exist
        
        # Get current stock
        stock_before = inventory_item.current_stock
        stock_after = stock_before + quantity
        
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
        
        # Create stock transaction
        StockTransaction.objects.create(
            transaction_id=transaction_id,
            item=inventory_item,
            transaction_type='production',
            transaction_date=timezone.now(),
            quantity=quantity,
            is_addition=True,
            stock_before=stock_before,
            stock_after=stock_after,
            unit_cost=batch.product.cost_price,
            total_cost=quantity * batch.product.cost_price,
            reference_type='Production Batch',
            reference_id=batch.batch_id,
            performed_by=self.request.user,
            notes=f"Production from batch {batch.batch_id}"
        )
        
        # Update inventory stock
        inventory_item.current_stock = stock_after
        inventory_item.save(update_fields=['current_stock', 'updated_at'])
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """
        Complete a production batch.
        
        Sets status to 'completed' and records end_time.
        Expects: actual_quantity, milk_used, wastage_quantity (optional)
        """
        batch = self.get_object()
        
        # Validate current status
        if batch.status != 'in_progress':
            return Response(
                {'error': f'Cannot complete batch with status: {batch.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get data from request
        actual_quantity = request.data.get('actual_quantity')
        milk_used = request.data.get('milk_used')
        wastage_quantity = request.data.get('wastage_quantity', 0)
        quality_check_passed = request.data.get('quality_check_passed', True)
        quality_notes = request.data.get('quality_notes', '')
        
        # Validate required fields
        if actual_quantity is None:
            return Response(
                {'error': 'actual_quantity is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if milk_used is None:
            return Response(
                {'error': 'milk_used is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            actual_quantity = Decimal(str(actual_quantity))
            milk_used = Decimal(str(milk_used))
            wastage_quantity = Decimal(str(wastage_quantity))
        except (ValueError, TypeError):
            return Response(
                {'error': 'Invalid numeric values'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate values are non-negative
        if actual_quantity < 0 or milk_used < 0 or wastage_quantity < 0:
            return Response(
                {'error': 'Quantities cannot be negative'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Store previous quantity to calculate delta
        previous_quantity = batch.actual_quantity or Decimal('0.00')
        quantity_delta = actual_quantity - previous_quantity
        
        # Update batch
        batch.status = 'completed'
        batch.end_time = timezone.now()
        batch.actual_quantity = actual_quantity
        batch.milk_used = milk_used
        batch.wastage_quantity = wastage_quantity
        batch.quality_check_passed = quality_check_passed
        batch.quality_notes = quality_notes
        
        # Save (yield_percentage will be calculated in save method)
        batch.save()
        
        # Create stock transaction for production
        if quantity_delta > 0:
            self._create_stock_transaction_for_production(batch, quantity_delta)
        
        serializer = self.get_serializer(batch)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get overall production statistics.
        
        Returns:
            - total_batches: Total number of batches
            - total_quantity: Total quantity produced
            - total_milk_used: Total milk consumed
            - avg_yield: Average yield percentage
            - completed_batches: Number of completed batches
            - in_progress_batches: Number of batches in progress
            - planned_batches: Number of planned batches
        """
        # Get date range from query params
        days = int(request.query_params.get('days', 30))
        end_date = date.today()
        from datetime import timedelta
        start_date = end_date - timedelta(days=days)
        
        # Calculate statistics
        batches = ProductionBatch.objects.filter(
            batch_date__gte=start_date,
            batch_date__lte=end_date
        )
        
        stats = batches.aggregate(
            total_batches=Count('id'),
            total_quantity=Sum('actual_quantity'),
            total_milk_used=Sum('milk_used'),
            avg_yield=Avg('yield_percentage'),
            completed_batches=Count('id', filter=Q(status='completed')),
            in_progress_batches=Count('id', filter=Q(status='in_progress')),
            planned_batches=Count('id', filter=Q(status='planned')),
        )
        
        # Handle None values
        for key, value in stats.items():
            if value is None:
                stats[key] = 0
        
        # Add date range info
        stats['start_date'] = start_date
        stats['end_date'] = end_date
        stats['days'] = days
        
        return Response(stats)


class ProductionScheduleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ProductionSchedule management.
    
    Provides CRUD operations for production scheduling.
    """
    
    queryset = ProductionSchedule.objects.select_related(
        'product',
        'batch'
    )
    serializer_class = ProductionScheduleSerializer
    permission_classes = [ProductionPermission]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['schedule_date', 'product']
    search_fields = ['product__name', 'notes']
    ordering_fields = ['schedule_date', 'priority']
    ordering = ['schedule_date', 'priority']
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """
        Get upcoming production schedules.
        
        Returns schedules for the next N days (default 7).
        """
        days = int(request.query_params.get('days', 7))
        from datetime import timedelta
        
        end_date = date.today() + timedelta(days=days)
        
        schedules = self.get_queryset().filter(
            schedule_date__gte=date.today(),
            schedule_date__lte=end_date
        )
        
        serializer = self.get_serializer(schedules, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        """
        Get today's production schedule.
        """
        schedules = self.get_queryset().filter(
            schedule_date=date.today()
        )
        
        serializer = self.get_serializer(schedules, many=True)
        return Response(serializer.data)
