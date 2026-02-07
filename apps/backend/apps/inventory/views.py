from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.utils import timezone
from django.db.models import Sum, Q, F
from datetime import datetime, timedelta
from decimal import Decimal

from .models import (
    InventoryItem, StockTransaction, RawMaterialStock,
    FinishedGoodsStock, StockAlert
)
from .serializers import (
    InventoryItemSerializer, InventoryItemListSerializer,
    StockTransactionSerializer, RawMaterialStockSerializer,
    FinishedGoodsStockSerializer, StockAlertSerializer
)


class InventoryItemViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing inventory items.
    
    Provides CRUD operations and custom actions for stock management.
    """
    queryset = InventoryItem.objects.select_related('product').all()
    serializer_class = InventoryItemSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['item_type', 'is_active']
    search_fields = ['item_id', 'name']
    ordering_fields = ['item_id', 'current_stock', 'created_at']
    ordering = ['item_id']
    
    def get_serializer_class(self):
        """Use lightweight serializer for list view."""
        if self.action == 'list':
            return InventoryItemListSerializer
        return InventoryItemSerializer

    def _generate_item_id(self, item_type: str) -> str:
        prefix_map = {
            'raw_milk': 'MILK',
            'raw_material': 'RM',
            'finished_good': 'FG',
            'packaging': 'PKG',
        }
        prefix = prefix_map.get(item_type, 'INV')
        last_item = InventoryItem.objects.filter(
            item_id__startswith=f"{prefix}-"
        ).order_by('-item_id').first()
        if last_item and last_item.item_id:
            try:
                last_seq = int(last_item.item_id.split('-')[-1])
            except ValueError:
                last_seq = 0
        else:
            last_seq = 0
        return f"{prefix}-{last_seq + 1:03d}"

    def _generate_transaction_id(self, date_value):
        date_str = date_value.strftime('%Y%m%d')
        last_transaction = StockTransaction.objects.filter(
            transaction_id__startswith=f'ST{date_str}'
        ).order_by('-transaction_id').first()
        if last_transaction:
            last_number = int(last_transaction.transaction_id[-4:])
            new_number = last_number + 1
        else:
            new_number = 1
        return f'ST{date_str}{new_number:04d}'

    def perform_create(self, serializer):
        item_id = serializer.validated_data.get('item_id')
        item_type = serializer.validated_data.get('item_type')

        if not item_id:
            item_id = self._generate_item_id(item_type)

        item = serializer.save(item_id=item_id)

        if item.current_stock > 0:
            transaction_date = timezone.now()
            transaction_id = self._generate_transaction_id(transaction_date)
            unit_cost = item.cost_per_unit or Decimal('0.00')
            total_cost = item.current_stock * unit_cost
            StockTransaction.objects.create(
                transaction_id=transaction_id,
                item=item,
                transaction_type='adjustment',
                transaction_date=transaction_date,
                quantity=item.current_stock,
                is_addition=True,
                stock_before=Decimal('0.00'),
                stock_after=item.current_stock,
                unit_cost=unit_cost,
                total_cost=total_cost,
                performed_by=self.request.user,
                notes='Initial stock on item creation',
            )
    
    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """
        Get all items where current_stock is below min_stock_level.
        
        Returns items that need restocking.
        """
        low_stock_items = self.queryset.filter(
            current_stock__lt=F('min_stock_level'),
            is_active=True
        )
        serializer = InventoryItemListSerializer(low_stock_items, many=True)
        return Response({
            'count': low_stock_items.count(),
            'results': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def stock_levels(self, request):
        """
        Get summary of all items with current stock levels.
        
        Returns a summary report of all active inventory items.
        """
        items = self.queryset.filter(is_active=True)
        
        summary = {
            'total_items': items.count(),
            'low_stock_items': items.filter(current_stock__lt=F('min_stock_level')).count(),
            'reorder_point_items': items.filter(current_stock__lte=F('reorder_point')).count(),
            'items': []
        }
        
        for item in items:
            summary['items'].append({
                'id': item.id,
                'item_id': item.item_id,
                'name': item.name,
                'item_type': item.item_type,
                'current_stock': float(item.current_stock),
                'unit': item.unit,
                'min_stock_level': float(item.min_stock_level),
                'reorder_point': float(item.reorder_point),
                'is_below_min_stock': item.is_below_min_stock,
                'is_below_reorder_point': item.is_below_reorder_point,
            })
        
        return Response(summary)
    
    @action(detail=True, methods=['get'])
    def transaction_history(self, request, pk=None):
        """
        Get all transactions for a specific item.
        
        Returns transaction history with pagination.
        """
        item = self.get_object()
        transactions = item.transactions.all()
        
        # Apply date range filter if provided
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if start_date:
            transactions = transactions.filter(transaction_date__gte=start_date)
        if end_date:
            transactions = transactions.filter(transaction_date__lte=end_date)
        
        serializer = StockTransactionSerializer(transactions, many=True)
        
        # Calculate summary statistics
        stats = transactions.aggregate(
            total_in=Sum('quantity', filter=Q(is_addition=True)),
            total_out=Sum('quantity', filter=Q(is_addition=False)),
        )
        
        return Response({
            'item': InventoryItemSerializer(item).data,
            'stats': {
                'total_in': float(stats['total_in'] or 0),
                'total_out': float(stats['total_out'] or 0),
            },
            'transactions': serializer.data
        })


class StockTransactionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing stock transactions.
    
    Handles stock movements with automatic stock level updates.
    """
    queryset = StockTransaction.objects.select_related('item', 'performed_by').all()
    serializer_class = StockTransactionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['item', 'transaction_type', 'transaction_date']
    search_fields = ['transaction_id', 'item__name', 'batch_number']
    ordering_fields = ['transaction_date', 'created_at']
    ordering = ['-transaction_date']
    
    def perform_create(self, serializer):
        """
        Override to handle stock updates and transaction ID generation.
        """
        item = serializer.validated_data['item']
        quantity = serializer.validated_data['quantity']
        is_addition = serializer.validated_data['is_addition']
        unit_cost = serializer.validated_data.get('unit_cost', Decimal('0.00'))
        
        # Get current stock
        stock_before = item.current_stock
        
        # Calculate new stock
        if is_addition:
            stock_after = stock_before + quantity
        else:
            stock_after = stock_before - quantity
            if stock_after < 0:
                raise serializers.ValidationError(
                    f"Transaction would result in negative stock: {stock_after}"
                )
        
        # Calculate total cost
        total_cost = quantity * unit_cost
        
        # Generate transaction ID: ST{YYYYMMDD}{0001}
        today = timezone.now().date()
        date_str = today.strftime('%Y%m%d')
        
        # Get last transaction ID for today
        last_transaction = StockTransaction.objects.filter(
            transaction_id__startswith=f'ST{date_str}'
        ).order_by('-transaction_id').first()
        
        if last_transaction:
            last_number = int(last_transaction.transaction_id[-4:])
            new_number = last_number + 1
        else:
            new_number = 1
        
        transaction_id = f'ST{date_str}{new_number:04d}'
        
        # Save transaction
        transaction = serializer.save(
            transaction_id=transaction_id,
            stock_before=stock_before,
            stock_after=stock_after,
            total_cost=total_cost,
            performed_by=self.request.user
        )
        
        # Update item stock
        item.current_stock = stock_after
        item.save(update_fields=['current_stock', 'updated_at'])
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get transaction statistics.
        
        Returns summary of all transactions with totals by type.
        """
        transactions = self.queryset.all()
        
        # Apply date range filter if provided
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if start_date:
            transactions = transactions.filter(transaction_date__gte=start_date)
        if end_date:
            transactions = transactions.filter(transaction_date__lte=end_date)
        
        stats = {
            'total_transactions': transactions.count(),
            'total_in': float(transactions.filter(is_addition=True).aggregate(
                total=Sum('quantity'))['total'] or 0),
            'total_out': float(transactions.filter(is_addition=False).aggregate(
                total=Sum('quantity'))['total'] or 0),
            'total_wastage': float(transactions.filter(
                transaction_type='wastage').aggregate(
                total=Sum('quantity'))['total'] or 0),
            'by_type': {}
        }
        
        # Get counts by transaction type
        for transaction_type, _ in StockTransaction.TRANSACTION_TYPE_CHOICES:
            count = transactions.filter(transaction_type=transaction_type).count()
            total = transactions.filter(transaction_type=transaction_type).aggregate(
                total=Sum('quantity'))['total'] or 0
            stats['by_type'][transaction_type] = {
                'count': count,
                'quantity': float(total)
            }
        
        return Response(stats)


class RawMaterialStockViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only ViewSet for raw material stock batches.
    """
    queryset = RawMaterialStock.objects.select_related('item').all()
    serializer_class = RawMaterialStockSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['item', 'is_active', 'purchase_date']
    search_fields = ['batch_number', 'supplier_name', 'item__name']
    ordering_fields = ['purchase_date', 'expiry_date']
    ordering = ['-purchase_date']


class FinishedGoodsStockViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only ViewSet for finished goods stock.
    """
    queryset = FinishedGoodsStock.objects.select_related(
        'item', 'batch', 'batch__product'
    ).all()
    serializer_class = FinishedGoodsStockSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['item', 'batch', 'is_sold', 'quality_check_passed']
    search_fields = ['item__name', 'batch__batch_id', 'shop_location']
    ordering_fields = ['production_date', 'expiry_date']
    ordering = ['-production_date']


class StockAlertViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing stock alerts.
    
    Provides actions to acknowledge and resolve alerts.
    """
    queryset = StockAlert.objects.select_related(
        'item', 'acknowledged_by', 'resolved_by'
    ).all()
    serializer_class = StockAlertSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['alert_type', 'status', 'item']
    search_fields = ['item__name', 'message']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    
    @action(detail=True, methods=['post'])
    def acknowledge(self, request, pk=None):
        """
        Acknowledge an alert.
        
        Sets status to 'acknowledged' and records who acknowledged it.
        """
        alert = self.get_object()
        
        if alert.status != 'active':
            return Response(
                {'error': 'Only active alerts can be acknowledged.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        alert.status = 'acknowledged'
        alert.acknowledged_by = request.user
        alert.acknowledged_at = timezone.now()
        alert.save()
        
        serializer = self.get_serializer(alert)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """
        Resolve an alert.
        
        Sets status to 'resolved' and records who resolved it.
        """
        alert = self.get_object()
        
        if alert.status == 'resolved':
            return Response(
                {'error': 'Alert is already resolved.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        alert.status = 'resolved'
        alert.resolved_by = request.user
        alert.resolved_at = timezone.now()
        alert.save()
        
        serializer = self.get_serializer(alert)
        return Response(serializer.data)


class InventoryAnalyticsViewSet(viewsets.ViewSet):
    """
    ViewSet for inventory analytics and reports.
    """
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """
        Get dashboard statistics for inventory overview.
        """
        # Get active items
        items = InventoryItem.objects.filter(is_active=True)
        
        # Stock status counts
        total_items = items.count()
        low_stock_count = items.filter(current_stock__lt=F('min_stock_level')).count()
        out_of_stock_count = items.filter(current_stock=0).count()
        reorder_count = items.filter(current_stock__lte=F('reorder_point')).count()
        
        # Inventory valuation
        total_value = sum(float(item.current_stock * item.cost_per_unit) for item in items)
        
        # Recent transactions (last 7 days)
        week_ago = timezone.now().date() - timedelta(days=7)
        recent_transactions = StockTransaction.objects.filter(
            transaction_date__gte=week_ago
        )
        
        inward_this_week = recent_transactions.filter(is_addition=True).count()
        outward_this_week = recent_transactions.filter(is_addition=False).count()
        wastage_this_week = recent_transactions.filter(transaction_type='wastage').count()
        
        # Expiring items (next 30 days)
        thirty_days = timezone.now().date() + timedelta(days=30)
        expiring_soon = RawMaterialStock.objects.filter(
            expiry_date__lte=thirty_days,
            expiry_date__gte=timezone.now().date(),
            is_active=True
        ).count()
        
        # Active alerts
        active_alerts = StockAlert.objects.filter(status='active').count()
        
        return Response({
            'stock_overview': {
                'total_items': total_items,
                'low_stock': low_stock_count,
                'out_of_stock': out_of_stock_count,
                'reorder_required': reorder_count,
                'total_value': round(total_value, 2),
            },
            'recent_activity': {
                'inward_transactions': inward_this_week,
                'outward_transactions': outward_this_week,
                'wastage_transactions': wastage_this_week,
            },
            'alerts': {
                'active_alerts': active_alerts,
                'expiring_soon': expiring_soon,
            }
        })
    
    @action(detail=False, methods=['get'])
    def stock_movement_report(self, request):
        """
        Get detailed stock movement report with date range filtering.
        """
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        item_type = request.query_params.get('item_type')
        
        transactions = StockTransaction.objects.select_related('item').all()
        
        if start_date:
            transactions = transactions.filter(transaction_date__gte=start_date)
        if end_date:
            transactions = transactions.filter(transaction_date__lte=end_date)
        if item_type:
            transactions = transactions.filter(item__item_type=item_type)
        
        # Group by transaction type
        report = {
            'summary': {
                'total_transactions': transactions.count(),
                'total_inward': float(transactions.filter(is_addition=True).aggregate(
                    total=Sum('quantity'))['total'] or 0),
                'total_outward': float(transactions.filter(is_addition=False).aggregate(
                    total=Sum('quantity'))['total'] or 0),
            },
            'by_type': {},
            'by_item': []
        }
        
        # Transaction type breakdown
        for trans_type, _ in StockTransaction.TRANSACTION_TYPE_CHOICES:
            type_transactions = transactions.filter(transaction_type=trans_type)
            report['by_type'][trans_type] = {
                'count': type_transactions.count(),
                'total_quantity': float(type_transactions.aggregate(
                    total=Sum('quantity'))['total'] or 0),
            }
        
        # Top items by transaction volume
        from django.db.models import Count
        top_items = transactions.values('item__name', 'item__item_id').annotate(
            transaction_count=Count('id'),
            total_quantity=Sum('quantity')
        ).order_by('-transaction_count')[:10]
        
        report['by_item'] = list(top_items)
        
        return Response(report)
    
    @action(detail=False, methods=['get'])
    def valuation_report(self, request):
        """
        Get inventory valuation report by item type.
        """
        items = InventoryItem.objects.filter(is_active=True)
        
        report = {
            'total_valuation': 0,
            'by_type': {},
            'top_value_items': []
        }
        
        # Calculate total and by type
        for item_type, _ in InventoryItem.ITEM_TYPE_CHOICES:
            type_items = items.filter(item_type=item_type)
            type_value = sum(float(item.current_stock * item.cost_per_unit) for item in type_items)
            
            report['by_type'][item_type] = {
                'count': type_items.count(),
                'total_value': round(type_value, 2),
                'total_stock': float(type_items.aggregate(
                    total=Sum('current_stock'))['total'] or 0),
            }
            report['total_valuation'] += type_value
        
        report['total_valuation'] = round(report['total_valuation'], 2)
        
        # Top 10 items by value
        items_with_value = [
            {
                'item_id': item.item_id,
                'name': item.name,
                'item_type': item.item_type,
                'current_stock': float(item.current_stock),
                'cost_per_unit': float(item.cost_per_unit),
                'total_value': round(float(item.current_stock * item.cost_per_unit), 2),
            }
            for item in items
        ]
        items_with_value.sort(key=lambda x: x['total_value'], reverse=True)
        report['top_value_items'] = items_with_value[:10]
        
        return Response(report)
    
    @action(detail=False, methods=['get'])
    def turnover_analysis(self, request):
        """
        Get inventory turnover analysis.
        """
        days = int(request.query_params.get('days', 30))
        start_date = timezone.now().date() - timedelta(days=days)
        
        items = InventoryItem.objects.filter(is_active=True)
        transactions = StockTransaction.objects.filter(
            transaction_date__gte=start_date
        )
        
        analysis = []
        
        for item in items:
            item_transactions = transactions.filter(item=item)
            
            # Calculate sales/outward movements
            outward_qty = float(item_transactions.filter(
                is_addition=False,
                transaction_type__in=['sale', 'production']
            ).aggregate(total=Sum('quantity'))['total'] or 0)
            
            # Calculate average stock
            avg_stock = float(item.current_stock)  # Simplified - could be more accurate with historical data
            
            # Calculate turnover ratio
            turnover_ratio = (outward_qty / avg_stock) if avg_stock > 0 else 0
            
            analysis.append({
                'item_id': item.item_id,
                'name': item.name,
                'item_type': item.item_type,
                'current_stock': float(item.current_stock),
                'outward_quantity': outward_qty,
                'turnover_ratio': round(turnover_ratio, 2),
                'days_of_stock': round(days / turnover_ratio, 1) if turnover_ratio > 0 else 999,
            })
        
        # Sort by turnover ratio
        analysis.sort(key=lambda x: x['turnover_ratio'], reverse=True)
        
        return Response({
            'period_days': days,
            'items': analysis
        })
