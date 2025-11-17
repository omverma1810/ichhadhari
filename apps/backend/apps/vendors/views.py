from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.utils import timezone
from django.db.models import Sum, Count, Q, F
from decimal import Decimal

from .models import (
    Vendor, PurchaseOrder, PurchaseOrderItem,
    VendorPayment, GoodsReceiptNote, GRNItem,
    VendorInvoice
)
from .serializers import (
    VendorSerializer, VendorListSerializer,
    PurchaseOrderSerializer, PurchaseOrderListSerializer,
    PurchaseOrderCreateSerializer, PurchaseOrderItemSerializer,
    VendorPaymentSerializer, GoodsReceiptNoteSerializer,
    GoodsReceiptNoteCreateSerializer,
    VendorInvoiceSerializer, VendorInvoiceListSerializer
)
from apps.inventory.models import StockTransaction


class VendorViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing vendors/suppliers.
    """
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'category']
    search_fields = ['vendor_id', 'company_name', 'contact_person', 'phone']
    ordering_fields = ['vendor_id', 'company_name', 'rating', 'total_purchases']
    ordering = ['vendor_id']
    
    def get_serializer_class(self):
        """Use lightweight serializer for list view."""
        if self.action == 'list':
            return VendorListSerializer
        return VendorSerializer
    
    @action(detail=True, methods=['get'])
    def purchase_orders(self, request, pk=None):
        """
        Get all purchase orders for this vendor.
        """
        vendor = self.get_object()
        pos = vendor.purchase_orders.all()
        
        # Apply filters if provided
        status_filter = request.query_params.get('status')
        if status_filter:
            pos = pos.filter(status=status_filter)
        
        serializer = PurchaseOrderListSerializer(pos, many=True)
        return Response({
            'vendor': VendorSerializer(vendor).data,
            'purchase_orders': serializer.data,
            'count': pos.count()
        })
    
    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """
        Get vendor statistics.
        """
        vendor = self.get_object()
        
        # Purchase order statistics
        pos = vendor.purchase_orders.all()
        po_stats = pos.aggregate(
            total_pos=Count('id'),
            approved_pos=Count('id', filter=Q(status='approved')),
            pending_pos=Count('id', filter=Q(status__in=['draft', 'pending_approval'])),
            total_po_amount=Sum('total_amount'),
        )
        
        # Payment statistics
        payments = vendor.payments.filter(status='completed')
        payment_stats = payments.aggregate(
            total_payments_count=Count('id'),
            total_paid=Sum('amount'),
        )
        
        stats = {
            'vendor_info': {
                'vendor_id': vendor.vendor_id,
                'company_name': vendor.company_name,
                'status': vendor.status,
                'rating': float(vendor.rating),
            },
            'financial': {
                'total_purchases': float(vendor.total_purchases),
                'total_payments': float(vendor.total_payments),
                'outstanding_balance': float(vendor.outstanding_balance),
                'credit_limit': float(vendor.credit_limit),
            },
            'purchase_orders': {
                'total_pos': po_stats['total_pos'] or 0,
                'approved_pos': po_stats['approved_pos'] or 0,
                'pending_pos': po_stats['pending_pos'] or 0,
                'total_po_amount': float(po_stats['total_po_amount'] or 0),
            },
            'payments': {
                'total_payments': payment_stats['total_payments_count'] or 0,
                'total_paid': float(payment_stats['total_paid'] or 0),
            }
        }
        
        return Response(stats)


class PurchaseOrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing purchase orders.
    """
    queryset = PurchaseOrder.objects.select_related('vendor', 'created_by', 'approved_by').all()
    serializer_class = PurchaseOrderSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['vendor', 'status', 'po_date']
    search_fields = ['po_number', 'vendor__company_name', 'notes']
    ordering_fields = ['po_date', 'total_amount', 'created_at']
    ordering = ['-po_date']
    
    def get_serializer_class(self):
        """Use appropriate serializer based on action."""
        if self.action == 'list':
            return PurchaseOrderListSerializer
        elif self.action == 'create':
            return PurchaseOrderCreateSerializer
        return PurchaseOrderSerializer
    
    def create(self, request, *args, **kwargs):
        """
        Override to return full serializer after creation.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Use the full serializer to return complete data
        output_serializer = PurchaseOrderSerializer(serializer.instance)
        headers = self.get_success_headers(output_serializer.data)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def perform_create(self, serializer):
        """
        Override to generate PO number and set created_by.
        """
        # Generate PO number: PO{YYYYMMDD}{0001}
        today = timezone.now().date()
        date_str = today.strftime('%Y%m%d')
        
        last_po = PurchaseOrder.objects.filter(
            po_number__startswith=f'PO{date_str}'
        ).order_by('-po_number').first()
        
        if last_po:
            last_number = int(last_po.po_number[-4:])
            new_number = last_number + 1
        else:
            new_number = 1
        
        po_number = f'PO{date_str}{new_number:04d}'
        
        serializer.save(
            po_number=po_number,
            created_by=self.request.user
        )
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """
        Approve a purchase order.
        """
        po = self.get_object()
        
        if po.status not in ['draft', 'pending_approval']:
            return Response(
                {'error': f'Cannot approve PO with status: {po.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        po.status = 'approved'
        po.approved_by = request.user
        po.approved_at = timezone.now()
        po.save()
        
        serializer = self.get_serializer(po)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def send(self, request, pk=None):
        """
        Mark purchase order as sent to vendor.
        """
        po = self.get_object()
        
        if po.status != 'approved':
            return Response(
                {'error': 'Only approved POs can be sent'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        po.status = 'sent'
        po.save()
        
        serializer = self.get_serializer(po)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """
        Confirm purchase order (vendor confirmation received).
        """
        po = self.get_object()
        
        if po.status != 'sent':
            return Response(
                {'error': 'Only sent POs can be confirmed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        po.status = 'confirmed'
        po.save()
        
        serializer = self.get_serializer(po)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        Cancel a purchase order.
        """
        po = self.get_object()
        
        if po.status in ['fully_received', 'cancelled']:
            return Response(
                {'error': f'Cannot cancel PO with status: {po.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        po.status = 'cancelled'
        po.save()
        
        serializer = self.get_serializer(po)
        return Response(serializer.data)


class VendorPaymentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing vendor payments.
    """
    queryset = VendorPayment.objects.select_related('vendor', 'processed_by').all()
    serializer_class = VendorPaymentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['vendor', 'payment_method', 'status', 'payment_date']
    search_fields = ['payment_id', 'vendor__company_name', 'transaction_reference']
    ordering_fields = ['payment_date', 'amount']
    ordering = ['-payment_date']
    
    def perform_create(self, serializer):
        """
        Override to generate payment ID and set processed_by.
        """
        # Generate payment ID: VP{YYYYMMDD}{0001}
        today = timezone.now().date()
        date_str = today.strftime('%Y%m%d')
        
        last_payment = VendorPayment.objects.filter(
            payment_id__startswith=f'VP{date_str}'
        ).order_by('-payment_id').first()
        
        if last_payment:
            last_number = int(last_payment.payment_id[-4:])
            new_number = last_number + 1
        else:
            new_number = 1
        
        payment_id = f'VP{date_str}{new_number:04d}'
        
        payment = serializer.save(
            payment_id=payment_id,
            processed_by=self.request.user
        )
        
        # Update vendor balances if payment is completed
        if payment.status == 'completed':
            vendor = payment.vendor
            vendor.total_payments += payment.amount
            if not payment.is_advance:
                vendor.outstanding_balance -= payment.amount
            vendor.save(update_fields=['total_payments', 'outstanding_balance', 'updated_at'])


class GoodsReceiptNoteViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Goods Receipt Notes (GRNs).
    """
    queryset = GoodsReceiptNote.objects.select_related(
        'purchase_order', 'purchase_order__vendor', 'received_by', 'quality_checked_by'
    ).all()
    serializer_class = GoodsReceiptNoteSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['purchase_order', 'quality_status', 'receipt_date']
    search_fields = ['grn_number', 'purchase_order__po_number', 'invoice_number']
    ordering_fields = ['receipt_date', 'created_at']
    ordering = ['-receipt_date']
    
    def get_serializer_class(self):
        """Use create serializer for POST requests."""
        if self.action == 'create':
            return GoodsReceiptNoteCreateSerializer
        return GoodsReceiptNoteSerializer
    
    def create(self, request, *args, **kwargs):
        """
        Override to return full serializer after creation.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Use the full serializer to return complete data
        output_serializer = GoodsReceiptNoteSerializer(serializer.instance)
        headers = self.get_success_headers(output_serializer.data)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def perform_create(self, serializer):
        """
        Override to:
        - Generate GRN number
        - Update PO item quantities
        - Update PO status
        - Create inventory stock transactions
        """
        # Generate GRN number: GRN{YYYYMMDD}{0001}
        today = timezone.now().date()
        date_str = today.strftime('%Y%m%d')
        
        last_grn = GoodsReceiptNote.objects.filter(
            grn_number__startswith=f'GRN{date_str}'
        ).order_by('-grn_number').first()
        
        if last_grn:
            last_number = int(last_grn.grn_number[-4:])
            new_number = last_number + 1
        else:
            new_number = 1
        
        grn_number = f'GRN{date_str}{new_number:04d}'
        
        # Create GRN with nested items
        grn = serializer.save(
            grn_number=grn_number,
            received_by=self.request.user,
            quality_checked_by=self.request.user
        )
        
        # Update PO items and create stock transactions
        po = grn.purchase_order
        all_items_fully_received = True
        
        for grn_item in grn.items.all():
            po_item = grn_item.po_item
            
            # Update quantity received
            po_item.quantity_received += grn_item.accepted_quantity
            po_item.save(update_fields=['quantity_received'])
            
            # Check if all items fully received
            if po_item.quantity_received < po_item.quantity:
                all_items_fully_received = False
            
            # Create stock transaction if inventory item is linked
            if po_item.inventory_item and grn_item.accepted_quantity > 0:
                self._create_stock_transaction(grn_item, po_item)
        
        # Update PO status
        if all_items_fully_received:
            po.status = 'fully_received'
            po.actual_delivery_date = grn.receipt_date
        else:
            po.status = 'partially_received'
        po.save(update_fields=['status', 'actual_delivery_date', 'updated_at'])
        
        # Update vendor total purchases
        vendor = po.vendor
        vendor.total_purchases += po.total_amount
        vendor.outstanding_balance += po.total_amount
        vendor.save(update_fields=['total_purchases', 'outstanding_balance', 'updated_at'])
    
    def _create_stock_transaction(self, grn_item, po_item):
        """Create stock transaction for received inventory items."""
        from apps.inventory.models import StockTransaction
        
        item = po_item.inventory_item
        quantity = grn_item.accepted_quantity
        
        # Get current stock
        stock_before = item.current_stock
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
        
        # Create transaction
        StockTransaction.objects.create(
            transaction_id=transaction_id,
            item=item,
            transaction_type='purchase',
            transaction_date=timezone.now(),
            quantity=quantity,
            is_addition=True,
            stock_before=stock_before,
            stock_after=stock_after,
            unit_cost=po_item.unit_price,
            total_cost=quantity * po_item.unit_price,
            reference_type='GRN',
            reference_id=grn_item.grn.grn_number,
            batch_number=grn_item.batch_number,
            expiry_date=grn_item.expiry_date,
            performed_by=self.request.user,
            notes=f"Received via GRN {grn_item.grn.grn_number} - PO {grn_item.grn.purchase_order.po_number}"
        )
        
        # Update inventory item stock
        item.current_stock = stock_after
        item.save(update_fields=['current_stock', 'updated_at'])


class VendorInvoiceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing vendor invoices
    """
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = VendorInvoice.objects.select_related('vendor', 'created_by').prefetch_related('items')
        
        # Filters
        vendor_id = self.request.query_params.get('vendor')
        status = self.request.query_params.get('status')
        payment_status = self.request.query_params.get('payment_status')
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if vendor_id:
            queryset = queryset.filter(vendor_id=vendor_id)
        if status:
            queryset = queryset.filter(status=status)
        if payment_status:
            queryset = queryset.filter(payment_status=payment_status)
        if date_from:
            queryset = queryset.filter(invoice_date__gte=date_from)
        if date_to:
            queryset = queryset.filter(invoice_date__lte=date_to)
        
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'list':
            return VendorInvoiceListSerializer
        return VendorInvoiceSerializer
    
    @action(detail=True, methods=['post'])
    def mark_as_paid(self, request, pk=None):
        """Mark invoice as fully paid"""
        invoice = self.get_object()
        invoice.amount_paid = invoice.total_amount
        invoice.payment_status = 'paid'
        invoice.status = 'paid'
        invoice.save()
        
        serializer = self.get_serializer(invoice)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def record_payment(self, request, pk=None):
        """Record a partial or full payment"""
        invoice = self.get_object()
        amount = request.data.get('amount')
        
        if not amount:
            return Response(
                {'error': 'Amount is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            amount = Decimal(str(amount))
        except:
            return Response(
                {'error': 'Invalid amount'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        invoice.amount_paid += amount
        if invoice.amount_paid >= invoice.total_amount:
            invoice.payment_status = 'paid'
            invoice.status = 'paid'
        else:
            invoice.payment_status = 'partially_paid'
        
        invoice.save()
        
        serializer = self.get_serializer(invoice)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def print_format(self, request, pk=None):
        """Return invoice data in dot matrix print format"""
        invoice = self.get_object()
        
        # Generate dot matrix formatted text
        lines = []
        lines.append("=" * 40)
        lines.append("ICHHADHARI PREMIUM PUNJABI DAIRY".center(40))
        lines.append("=" * 40)
        lines.append(f"Invoice: {invoice.invoice_number}".ljust(40))
        lines.append(f"Date: {invoice.invoice_date.strftime('%d-%b-%Y')}".ljust(40))
        lines.append(f"Vendor: {invoice.vendor.company_name}".ljust(40))
        lines.append("-" * 40)
        lines.append("Item                   Qty    Price")
        lines.append("-" * 40)
        
        for item in invoice.items.all():
            desc = item.item_description[:20].ljust(20)
            qty = f"{item.quantity:>5.1f}".rjust(7)
            price = f"{item.line_total:>8.2f}".rjust(8)
            lines.append(f"{desc} {qty} {price}")
        
        lines.append("-" * 40)
        lines.append(f"Subtotal:                 {invoice.subtotal:>10.2f}")
        lines.append(f"Tax:                      {invoice.tax_amount:>10.2f}")
        lines.append(f"Total:                    {invoice.total_amount:>10.2f}")
        lines.append("=" * 40)
        
        return Response({'text': '\n'.join(lines)})
