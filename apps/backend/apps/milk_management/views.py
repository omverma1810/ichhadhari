"""
Views for Milk Management System

Provides ViewSets for:
- Supplier management
- Milk collection recording
- Payment processing
"""

from datetime import datetime, timedelta
from decimal import Decimal
from django.db.models import Sum, Avg, Count, Q
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Supplier, MilkCollection, MilkPayment, MilkSegregationPlan
from .serializers import (
    SupplierSerializer,
    SupplierListSerializer,
    MilkCollectionSerializer,
    MilkCollectionListSerializer,
    MilkPaymentSerializer,
    MilkPaymentListSerializer,
    MilkSegregationPlanSerializer,
)
from .permissions import MilkManagementPermission


class SupplierViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing suppliers.
    
    Provides CRUD operations and custom actions for:
    - Listing suppliers with filtering and search
    - Creating and updating supplier records
    - Viewing supplier collections
    - Viewing supplier statistics
    """
    
    queryset = Supplier.objects.all()
    permission_classes = [IsAuthenticated, MilkManagementPermission]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'supplier_type', 'route_name', 'payment_cycle']
    search_fields = ['supplier_id', 'name', 'phone', 'email']
    ordering_fields = ['supplier_id', 'name', 'avg_quality_score', 'outstanding_balance']
    ordering = ['supplier_id']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'list':
            return SupplierListSerializer
        return SupplierSerializer
    
    @action(detail=True, methods=['get'])
    def collections(self, request, pk=None):
        """
        Get all collections for a specific supplier.
        
        Query Parameters:
            - start_date: Filter collections from this date
            - end_date: Filter collections until this date
            - limit: Limit number of results (default: 100)
        """
        supplier = self.get_object()
        collections_qs = supplier.collections.all()
        
        # Apply date filters
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if start_date:
            collections_qs = collections_qs.filter(collection_date__gte=start_date)
        if end_date:
            collections_qs = collections_qs.filter(collection_date__lte=end_date)
        
        # Limit results
        limit = int(request.query_params.get('limit', 100))
        collections_qs = collections_qs[:limit]
        
        serializer = MilkCollectionListSerializer(collections_qs, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """
        Get statistics for a specific supplier.
        
        Returns:
            - total_quantity: Total liters supplied
            - avg_fat: Average fat percentage
            - avg_snf: Average SNF percentage
            - avg_quality_score: Average quality score
            - total_amount: Total amount for collections
            - collection_count: Number of collections
            - days: Period in days for the stats
        """
        supplier = self.get_object()
        
        # Get date range from query params
        days = int(request.query_params.get('days', 30))
        from datetime import date
        end_date = date.today()
        start_date = end_date - timedelta(days=days)
        
        # Calculate statistics
        collections = supplier.collections.filter(
            collection_date__gte=start_date,
            collection_date__lte=end_date
        )
        
        stats = collections.aggregate(
            total_quantity=Sum('quantity'),
            avg_fat=Avg('fat'),
            avg_snf=Avg('snf'),
            avg_quality_score=Avg('quality_score'),
            total_amount=Sum('total_amount'),
            collection_count=Count('id')
        )
        
        # Handle None values
        for key, value in stats.items():
            if value is None:
                stats[key] = 0 if key == 'collection_count' else Decimal('0.00')
        
        stats['days'] = days
        stats['start_date'] = start_date
        stats['end_date'] = end_date
        
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def by_route(self, request):
        """
        Get suppliers grouped by route.
        
        Returns a list of routes with supplier counts and total outstanding balance.
        """
        from django.db.models import Count, Sum
        
        routes = Supplier.objects.values('route_name').annotate(
            supplier_count=Count('id'),
            total_outstanding=Sum('outstanding_balance'),
            active_count=Count('id', filter=Q(status='active'))
        ).order_by('route_name')
        
        return Response(list(routes))


class MilkCollectionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing milk collections.
    
    Provides CRUD operations and custom actions for:
    - Recording milk collections
    - Viewing collection history
    - Getting collection statistics
    - Grouping collections by supplier
    """
    
    queryset = MilkCollection.objects.select_related('supplier', 'collected_by').all()
    permission_classes = [IsAuthenticated, MilkManagementPermission]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = [
        'supplier',
        'collection_date',
        'milk_type',
        'quality_status',
        'collected_by'
    ]
    search_fields = ['collection_id', 'supplier__name', 'supplier__supplier_id']
    ordering_fields = ['collection_date', 'collection_time', 'quantity', 'quality_score']
    ordering = ['-collection_date', '-collection_time']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'list':
            return MilkCollectionListSerializer
        return MilkCollectionSerializer
    
    def perform_create(self, serializer):
        """
        Override create to auto-generate collection_id and set collected_by.
        
        Collection ID Format: MC{YYYYMMDD}{0001}
        """
        # Generate collection_id
        today = datetime.now().date()
        date_str = today.strftime('%Y%m%d')
        
        # Get the last collection for today
        last_collection = MilkCollection.objects.filter(
            collection_id__startswith=f'MC{date_str}'
        ).order_by('-collection_id').first()
        
        if last_collection:
            # Extract the sequence number and increment
            last_seq = int(last_collection.collection_id[-4:])
            seq = last_seq + 1
        else:
            seq = 1
        
        collection_id = f'MC{date_str}{seq:04d}'
        
        # Save with auto-generated ID and current user
        serializer.save(
            collection_id=collection_id,
            collected_by=self.request.user
        )
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get collection statistics for a period.
        
        Query Parameters:
            - days: Number of days to include (default: 7)
            - start_date: Start date for stats
            - end_date: End date for stats
        
        Returns:
            - total_quantity: Total liters collected
            - avg_fat: Average fat percentage
            - avg_snf: Average SNF percentage
            - avg_quality_score: Average quality score
            - total_amount: Total amount
            - collection_count: Number of collections
            - supplier_count: Number of unique suppliers
        """
        # Get date range
        if request.query_params.get('start_date') and request.query_params.get('end_date'):
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
        else:
            days = int(request.query_params.get('days', 7))
            end_date = timezone.now().date()
            start_date = end_date - timedelta(days=days)
        
        # Calculate statistics
        collections = MilkCollection.objects.filter(
            collection_date__gte=start_date,
            collection_date__lte=end_date
        )
        
        stats = collections.aggregate(
            total_quantity=Sum('quantity'),
            avg_fat=Avg('fat'),
            avg_snf=Avg('snf'),
            avg_quality_score=Avg('quality_score'),
            total_amount=Sum('total_amount'),
            collection_count=Count('id'),
            supplier_count=Count('supplier', distinct=True)
        )
        
        # Handle None values
        for key, value in stats.items():
            if value is None:
                stats[key] = 0 if 'count' in key else Decimal('0.00')
        
        stats['start_date'] = start_date
        stats['end_date'] = end_date
        
        return Response(stats)


class MilkSegregationPlanViewSet(viewsets.ModelViewSet):
    """
    ViewSet for manual milk segregation plans.
    """

    queryset = MilkSegregationPlan.objects.prefetch_related('items', 'items__product').all()
    serializer_class = MilkSegregationPlanSerializer
    permission_classes = [IsAuthenticated, MilkManagementPermission]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['plan_date']
    ordering_fields = ['plan_date', 'created_at', 'total_liters']
    ordering = ['-plan_date', '-created_at']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def by_supplier(self, request):
        """
        Get collections grouped by supplier with aggregates.
        
        Query Parameters:
            - days: Number of days to include (default: 7)
            - start_date: Start date
            - end_date: End date
        
        Returns a list of suppliers with their collection statistics.
        """
        # Get date range
        if request.query_params.get('start_date') and request.query_params.get('end_date'):
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
        else:
            days = int(request.query_params.get('days', 7))
            end_date = timezone.now().date()
            start_date = end_date - timedelta(days=days)
        
        # Group by supplier
        collections = MilkCollection.objects.filter(
            collection_date__gte=start_date,
            collection_date__lte=end_date
        ).values(
            'supplier__id',
            'supplier__supplier_id',
            'supplier__name'
        ).annotate(
            total_quantity=Sum('quantity'),
            avg_fat=Avg('fat'),
            avg_snf=Avg('snf'),
            avg_quality_score=Avg('quality_score'),
            total_amount=Sum('total_amount'),
            collection_count=Count('id')
        ).order_by('-total_quantity')
        
        return Response(list(collections))
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        """
        Get today's collections with summary statistics.
        
        Returns:
            - collections: List of today's collections
            - summary: Aggregated statistics for today
        """
        today = timezone.now().date()
        
        collections = MilkCollection.objects.filter(
            collection_date=today
        ).select_related('supplier', 'collected_by')
        
        # Calculate summary
        summary = collections.aggregate(
            total_quantity=Sum('quantity'),
            avg_quality_score=Avg('quality_score'),
            total_amount=Sum('total_amount'),
            collection_count=Count('id'),
            supplier_count=Count('supplier', distinct=True)
        )
        
        # Handle None values
        for key, value in summary.items():
            if value is None:
                summary[key] = 0 if 'count' in key else Decimal('0.00')
        
        serializer = MilkCollectionListSerializer(collections, many=True)
        
        return Response({
            'date': today,
            'collections': serializer.data,
            'summary': summary
        })


class MilkPaymentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing milk payments.
    
    Provides CRUD operations and custom actions for:
    - Recording payments to suppliers
    - Viewing payment history
    - Getting payment statistics
    - Processing pending payments
    """
    
    queryset = MilkPayment.objects.select_related('supplier', 'processed_by').prefetch_related('collections').all()
    permission_classes = [IsAuthenticated, MilkManagementPermission]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = [
        'supplier',
        'payment_date',
        'payment_method',
        'status',
        'processed_by'
    ]
    search_fields = ['payment_id', 'supplier__name', 'supplier__supplier_id', 'transaction_reference']
    ordering_fields = ['payment_date', 'amount', 'status']
    ordering = ['-payment_date']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'list':
            return MilkPaymentListSerializer
        return MilkPaymentSerializer
    
    def perform_create(self, serializer):
        """
        Override create to auto-generate payment_id and set processed_by.
        
        Payment ID Format: MP{YYYYMMDD}{0001}
        """
        # Generate payment_id
        today = datetime.now().date()
        date_str = today.strftime('%Y%m%d')
        
        # Get the last payment for today
        last_payment = MilkPayment.objects.filter(
            payment_id__startswith=f'MP{date_str}'
        ).order_by('-payment_id').first()
        
        if last_payment:
            # Extract the sequence number and increment
            last_seq = int(last_payment.payment_id[-4:])
            seq = last_seq + 1
        else:
            seq = 1
        
        payment_id = f'MP{date_str}{seq:04d}'
        
        # Save with auto-generated ID and current user
        serializer.save(
            payment_id=payment_id,
            processed_by=self.request.user
        )
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """
        Get all pending payments.
        
        Returns payments with status='pending' ordered by payment date.
        """
        pending_payments = self.queryset.filter(status='pending')
        serializer = MilkPaymentListSerializer(pending_payments, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_completed(self, request, pk=None):
        """
        Mark a payment as completed.
        
        Updates the payment status to 'completed' and updates supplier's
        outstanding balance and total amount paid.
        """
        payment = self.get_object()
        
        if payment.status == 'completed':
            return Response(
                {'detail': 'Payment is already marked as completed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update payment status
        payment.status = 'completed'
        payment.save()
        
        # Update supplier totals
        supplier = payment.supplier
        supplier.total_amount_paid += payment.amount
        supplier.outstanding_balance -= payment.amount
        supplier.save()
        
        serializer = self.get_serializer(payment)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_failed(self, request, pk=None):
        """
        Mark a payment as failed.
        
        Updates the payment status to 'failed' with optional notes.
        """
        payment = self.get_object()
        
        if payment.status == 'completed':
            return Response(
                {'detail': 'Cannot mark completed payment as failed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update payment status
        payment.status = 'failed'
        
        # Add notes if provided
        notes = request.data.get('notes', '')
        if notes:
            payment.notes = f"{payment.notes}\n\nFailed: {notes}" if payment.notes else f"Failed: {notes}"
        
        payment.save()
        
        serializer = self.get_serializer(payment)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get payment statistics for a period.
        
        Query Parameters:
            - days: Number of days to include (default: 30)
            - start_date: Start date for stats
            - end_date: End date for stats
        
        Returns:
            - total_paid: Total amount paid
            - completed_count: Number of completed payments
            - pending_count: Number of pending payments
            - failed_count: Number of failed payments
            - supplier_count: Number of unique suppliers paid
        """
        # Get date range
        if request.query_params.get('start_date') and request.query_params.get('end_date'):
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
        else:
            days = int(request.query_params.get('days', 30))
            end_date = timezone.now().date()
            start_date = end_date - timedelta(days=days)
        
        # Calculate statistics
        payments = MilkPayment.objects.filter(
            payment_date__gte=start_date,
            payment_date__lte=end_date
        )
        
        stats = {
            'total_paid': payments.filter(status='completed').aggregate(
                total=Sum('amount')
            )['total'] or Decimal('0.00'),
            'completed_count': payments.filter(status='completed').count(),
            'pending_count': payments.filter(status='pending').count(),
            'failed_count': payments.filter(status='failed').count(),
            'supplier_count': payments.values('supplier').distinct().count(),
            'start_date': start_date,
            'end_date': end_date,
        }
        
        return Response(stats)
