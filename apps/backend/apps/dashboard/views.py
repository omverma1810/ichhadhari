"""
Dashboard Views
Provides aggregated data endpoints for the frontend dashboard
"""

from datetime import datetime, timedelta
from django.db.models import Sum, F, Q
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.milk_management.models import MilkCollection, MilkPayment, Supplier
from apps.production.models import ProductionBatch
from apps.inventory.models import InventoryItem
from apps.employees.models import Employee


class DashboardViewSet(viewsets.ViewSet):
    """
    ViewSet for dashboard statistics and charts
    """
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='stats')
    def get_stats(self, request):
        """
        Get dashboard statistics with trends
        """
        today = timezone.now().date()
        yesterday = today - timedelta(days=1)
        last_week = today - timedelta(days=7)
        last_month = today - timedelta(days=30)

        # Total milk collected today
        milk_today = MilkCollection.objects.filter(
            collection_date=today,
            quality_status='accepted'
        ).aggregate(total=Sum('quantity'))['total'] or 0

        milk_yesterday = MilkCollection.objects.filter(
            collection_date=yesterday,
            quality_status='accepted'
        ).aggregate(total=Sum('quantity'))['total'] or 0

        milk_trend = self._calculate_trend(milk_today, milk_yesterday)

        # Total active vendors
        total_vendors = Supplier.objects.filter(status='active').count()
        vendors_last_week = Supplier.objects.filter(
            status='active',
            created_at__lte=timezone.now() - timedelta(days=7)
        ).count()
        vendors_trend = self._calculate_trend(total_vendors, vendors_last_week)

        # Total production today
        production_today = ProductionBatch.objects.filter(
            batch_date=today,
            status='completed'
        ).aggregate(total=Sum('actual_quantity'))['total'] or 0

        production_yesterday = ProductionBatch.objects.filter(
            batch_date=yesterday,
            status='completed'
        ).aggregate(total=Sum('actual_quantity'))['total'] or 0

        production_trend = self._calculate_trend(production_today, production_yesterday)

        # Total inventory value
        # Calculate using cost_per_unit; fallback to product selling_price if cost_per_unit is 0
        from django.db.models import Case, When, Value, DecimalField as DField
        from django.db.models.functions import Coalesce

        inventory_value = InventoryItem.objects.filter(
            is_active=True
        ).aggregate(
            total=Sum(
                F('current_stock') * Case(
                    When(cost_per_unit__gt=0, then=F('cost_per_unit')),
                    When(product__isnull=False, product__selling_price__gt=0, then=F('product__selling_price')),
                    default=Value(0),
                    output_field=DField(),
                )
            )
        )['total'] or 0

        # For trend, compare against stock transactions from 7 days ago
        # Use the current inventory value as-is and estimate previous value
        # by looking at what stock was a week ago from transactions
        from apps.inventory.models import StockTransaction
        
        week_ago = timezone.now() - timedelta(days=7)
        net_change_last_week = StockTransaction.objects.filter(
            transaction_date__gte=week_ago
        ).aggregate(
            additions=Sum('total_cost', filter=Q(is_addition=True)),
            deductions=Sum('total_cost', filter=Q(is_addition=False)),
        )
        additions = float(net_change_last_week['additions'] or 0)
        deductions = float(net_change_last_week['deductions'] or 0)
        inventory_value_last_week = float(inventory_value) - additions + deductions

        inventory_trend = self._calculate_trend(float(inventory_value), inventory_value_last_week)

        # Additional metrics
        active_employees = Employee.objects.filter(
            is_active=True
        ).count()

        pending_payments = MilkPayment.objects.filter(status='pending').count()

        low_stock_items = InventoryItem.objects.filter(
            is_active=True,
            current_stock__lte=F('reorder_point')
        ).count()

        quality_issues = MilkCollection.objects.filter(
            collection_date=today,
            quality_status='rejected'
        ).count()

        return Response({
            'total_milk_collected': float(milk_today),
            'total_milk_collected_trend': milk_trend,
            'total_vendors': total_vendors,
            'total_vendors_trend': vendors_trend,
            'total_production': float(production_today),
            'total_production_trend': production_trend,
            'total_inventory_value': float(inventory_value),
            'total_inventory_value_trend': inventory_trend,
            'active_employees': active_employees,
            'pending_payments': pending_payments,
            'low_stock_items': low_stock_items,
            'quality_issues': quality_issues,
        })

    @action(detail=False, methods=['get'], url_path='activities')
    def get_recent_activities(self, request):
        """
        Get recent activities across all modules
        """
        limit = int(request.query_params.get('limit', 10))
        activities = []

        # Recent milk collections
        recent_collections = MilkCollection.objects.select_related(
            'supplier', 'collected_by'
        ).order_by('-created_at')[:5]

        for collection in recent_collections:
            if collection.quality_status == 'accepted':
                activity_status = 'success'
            elif collection.quality_status == 'conditional':
                activity_status = 'warning'
            elif collection.quality_status == 'rejected':
                activity_status = 'error'
            else:
                activity_status = 'info'

            activities.append({
                'id': str(collection.collection_id),
                'type': 'Milk Collection',
                'status': activity_status,
                'title': f'Milk collected from {collection.supplier.name}',
                'description': f"{collection.quantity}L of {collection.get_milk_type_display()} collected",
                'user': collection.collected_by.get_full_name() if collection.collected_by else 'System',
                'timestamp': collection.created_at.isoformat(),
            })

        # Recent production batches
        recent_production = ProductionBatch.objects.select_related(
            'product', 'supervisor'
        ).order_by('-created_at')[:5]

        for batch in recent_production:
            activities.append({
                'id': str(batch.batch_id),
                'type': 'Production',
                'status': 'success' if batch.status == 'completed' else 'info',
                'title': f'Production batch {batch.batch_id}',
                'description': f'{batch.actual_quantity} units of {batch.product.name} produced',
                'user': batch.supervisor.get_full_name() if batch.supervisor else 'System',
                'timestamp': batch.created_at.isoformat(),
            })

        # Sort by timestamp and limit
        activities.sort(key=lambda x: x['timestamp'], reverse=True)
        return Response(activities[:limit])

    @action(detail=False, methods=['get'], url_path='milk-collection-chart')
    def get_milk_collection_chart(self, request):
        """
        Get milk collection data for charts
        """
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if not start_date or not end_date:
            end_date = timezone.now().date()
            start_date = end_date - timedelta(days=30)
        else:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()

        # Get daily milk collection data
        collections = MilkCollection.objects.filter(
            collection_date__range=[start_date, end_date],
            quality_status='accepted'
        ).values('collection_date', 'milk_type').annotate(
            total=Sum('quantity')
        ).order_by('collection_date')

        # Organize data by date
        data_by_date = {}
        current_date = start_date
        while current_date <= end_date:
            data_by_date[current_date.isoformat()] = {
                'date': current_date.isoformat(),
                'cow_milk': 0,
                'buffalo_milk': 0,
                'total': 0,
            }
            current_date += timedelta(days=1)

        # Fill in the data
        for collection in collections:
            date_key = collection['collection_date'].isoformat()
            if date_key in data_by_date:
                milk_type = collection['milk_type']
                total = float(collection['total'])
                
                if milk_type == 'cow':
                    data_by_date[date_key]['cow_milk'] = total
                elif milk_type == 'buffalo':
                    data_by_date[date_key]['buffalo_milk'] = total
                
                data_by_date[date_key]['total'] += total

        return Response(list(data_by_date.values()))

    @action(detail=False, methods=['get'], url_path='production-chart')
    def get_production_chart(self, request):
        """
        Get production data for charts
        """
        year = int(request.query_params.get('year', timezone.now().year))

        # Get monthly production data
        production_data = []
        months = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ]

        for month_num in range(1, 13):
            month_data = {
                'month': months[month_num - 1],
                'milk': 0,
                'curd': 0,
                'paneer': 0,
                'ghee': 0,
                'butter': 0,
            }

            # Get production for this month
            batches = ProductionBatch.objects.filter(
                batch_date__year=year,
                batch_date__month=month_num,
                status='completed'
            ).select_related('product')

            for batch in batches:
                product_name = batch.product.name.lower()
                quantity = float(batch.actual_quantity)

                if 'milk' in product_name:
                    month_data['milk'] += quantity
                elif 'curd' in product_name or 'yogurt' in product_name:
                    month_data['curd'] += quantity
                elif 'paneer' in product_name:
                    month_data['paneer'] += quantity
                elif 'ghee' in product_name:
                    month_data['ghee'] += quantity
                elif 'butter' in product_name:
                    month_data['butter'] += quantity

            production_data.append(month_data)

        return Response(production_data)

    @action(detail=False, methods=['get'], url_path='alerts')
    def get_alerts(self, request):
        """
        Get dashboard alerts
        """
        alerts = []
        today = timezone.now().date()

        # Low stock alerts
        low_stock_items = InventoryItem.objects.filter(
            is_active=True,
            current_stock__lte=F('reorder_point')
        )

        for item in low_stock_items:
            alerts.append({
                'id': f'stock-{item.id}',
                'type': 'warning',
                'message': f'Low stock alert: {item.name} is below reorder level',
                'timestamp': timezone.now().isoformat(),
            })

        # Quality issues today
        quality_issues = MilkCollection.objects.filter(
            collection_date=today,
            quality_status='rejected'
        ).count()

        if quality_issues > 0:
            alerts.append({
                'id': 'quality-issues',
                'type': 'error',
                'message': f'{quality_issues} milk collections rejected due to quality issues today',
                'timestamp': timezone.now().isoformat(),
            })

        # Pending payments
        pending_payments_count = MilkPayment.objects.filter(
            status='pending',
            period_end__lte=today - timedelta(days=7)
        ).count()

        if pending_payments_count > 0:
            alerts.append({
                'id': 'pending-payments',
                'type': 'warning',
                'message': f'{pending_payments_count} pending payments older than 7 days',
                'timestamp': timezone.now().isoformat(),
            })

        return Response(alerts)

    @staticmethod
    def _calculate_trend(current, previous):
        """
        Calculate percentage trend
        """
        if previous == 0:
            return 100 if current > 0 else 0
        
        trend = ((current - previous) / previous) * 100
        return round(trend, 2)
