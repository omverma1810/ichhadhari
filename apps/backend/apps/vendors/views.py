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
    VendorInvoice, VendorProductPrice
)
from .serializers import (
    VendorSerializer, VendorListSerializer,
    PurchaseOrderSerializer, PurchaseOrderListSerializer,
    PurchaseOrderCreateSerializer, PurchaseOrderItemSerializer,
    VendorPaymentSerializer, GoodsReceiptNoteSerializer,
    GoodsReceiptNoteCreateSerializer,
    VendorInvoiceSerializer, VendorInvoiceListSerializer,
    VendorProductPriceSerializer, VendorProductPriceListSerializer
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
        """Create payment, always create or update its invoice, and sync balances."""
        today = timezone.now().date()
        date_str = today.strftime('%Y%m%d')

        last_payment = VendorPayment.objects.filter(
            payment_id__startswith=f'VP{date_str}'
        ).order_by('-payment_id').first()

        new_number = int(last_payment.payment_id[-4:]) + 1 if last_payment else 1
        payment_id = f'VP{date_str}{new_number:04d}'

        payment = serializer.save(
            payment_id=payment_id,
            processed_by=self.request.user
        )

        # Update vendor aggregates and always sync invoice (advance/partial/full)
        self._update_vendor_balances(payment)
        self._create_or_update_invoice_from_payment(payment)

    def perform_update(self, serializer):
        """Ensure updates keep invoice and vendor balances in sync."""
        payment = serializer.save()
        self._update_vendor_balances(payment)
        self._create_or_update_invoice_from_payment(payment)
    
    def _create_or_update_invoice_from_payment(self, payment):
        """Create or update an invoice tied to this payment (advance/partial/full)."""
        from .models import VendorInvoice, VendorInvoiceItem
        from datetime import timedelta
        
        # Calculate due date (vendor's credit period)
        vendor = payment.vendor
        due_date = payment.payment_date + timedelta(days=vendor.credit_period_days)
        invoice, _ = VendorInvoice.objects.get_or_create(
            reference_number=payment.payment_id,
            vendor=vendor,
            defaults={
                'invoice_date': payment.payment_date,
                'due_date': due_date,
                'subtotal': Decimal('0.00'),
                'tax_amount': Decimal('0.00'),
                'discount_amount': Decimal('0.00'),
                'total_amount': Decimal('0.00'),
                'amount_paid': Decimal('0.00'),
                'amount_due': Decimal('0.00'),
                'notes': f"Auto-generated from payment {payment.payment_id}",
                'created_by': payment.processed_by,
            }
        )

        # Reset items if we need to recalc
        invoice.items.all().delete()

        purchase_orders = payment.purchase_orders.all()
        subtotal = Decimal('0.00')
        tax_total = Decimal('0.00')
        discount_total = Decimal('0.00')

        if purchase_orders.exists():
            for po in purchase_orders:
                for po_item in po.items.all():
                    base_amount = po_item.quantity * po_item.unit_price
                    discount_amt = base_amount * (po_item.discount_percentage / Decimal('100'))
                    after_discount = base_amount - discount_amt
                    tax_amt = after_discount * (po_item.tax_percentage / Decimal('100'))
                    line_total = after_discount + tax_amt

                    VendorInvoiceItem.objects.create(
                        invoice=invoice,
                        item_description=po_item.item_name,
                        quantity=po_item.quantity,
                        unit=po_item.unit,
                        unit_price=po_item.unit_price,
                        line_total=line_total,
                        tax_rate=po_item.tax_percentage,
                        discount_percentage=po_item.discount_percentage
                    )

                    subtotal += after_discount
                    tax_total += tax_amt
                    discount_total += discount_amt
        else:
            # Generic line item when no POs are linked
            VendorInvoiceItem.objects.create(
                invoice=invoice,
                item_description=f"Payment for {vendor.company_name}",
                quantity=Decimal('1.00'),
                unit='service',
                unit_price=payment.amount,
                line_total=payment.amount,
                tax_rate=Decimal('0.00'),
                discount_percentage=Decimal('0.00')
            )
            subtotal = payment.amount

        invoice.subtotal = subtotal
        invoice.tax_amount = tax_total
        invoice.discount_amount = discount_total
        invoice.total_amount = subtotal + tax_total

        # Determine paid amount based on payment status
        amount_paid = payment.amount if payment.status == 'completed' else Decimal('0.00')
        invoice.amount_paid = amount_paid
        invoice.amount_due = invoice.total_amount - amount_paid

        if invoice.amount_paid >= invoice.total_amount:
            invoice.payment_status = 'paid'
            invoice.status = 'paid'
        elif invoice.amount_paid > 0:
            invoice.payment_status = 'partially_paid'
            invoice.status = 'sent'
        else:
            invoice.payment_status = 'unpaid'
            invoice.status = 'draft'

        invoice.invoice_date = payment.payment_date
        invoice.due_date = due_date
        invoice.save()
        return invoice

    def _update_vendor_balances(self, payment: VendorPayment):
        """Update vendor aggregates based on payment status and amount."""
        vendor = payment.vendor

        # Recalculate total_purchases from all invoices
        total_invoiced = VendorInvoice.objects.filter(
            vendor=vendor
        ).aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
        vendor.total_purchases = total_invoiced

        # Basic totals (idempotent-ish update using fresh aggregates)
        completed_payments = VendorPayment.objects.filter(
            vendor=vendor,
            status='completed'
        )

        total_paid = completed_payments.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        vendor.total_payments = total_paid

        # Outstanding balance: purchases - paid
        vendor.outstanding_balance = vendor.total_purchases - total_paid
        vendor.save(update_fields=['total_purchases', 'total_payments', 'outstanding_balance', 'updated_at'])


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

    def _update_vendor_balances_from_invoice(self, invoice, previous_paid):
        """Sync vendor totals when an invoice payment changes."""
        vendor = invoice.vendor
        delta_paid = invoice.amount_paid - previous_paid
        if delta_paid == 0:
            return

        # Recalculate total_purchases from all invoices for this vendor
        from django.db.models import Sum
        total_invoiced = VendorInvoice.objects.filter(
            vendor=vendor
        ).aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
        vendor.total_purchases = total_invoiced

        vendor.total_payments = (vendor.total_payments or Decimal('0.00')) + delta_paid
        vendor.outstanding_balance = vendor.total_purchases - (vendor.total_payments)
        vendor.save(update_fields=['total_purchases', 'total_payments', 'outstanding_balance', 'updated_at'])

    def _create_vendor_payment_from_invoice(self, invoice, amount, user):
        """Create a completed VendorPayment tied to an invoice payment."""
        if amount <= 0:
            return

        today = timezone.now().date()
        date_str = today.strftime('%Y%m%d')

        last_payment = VendorPayment.objects.filter(
            payment_id__startswith=f'VP{date_str}'
        ).order_by('-payment_id').first()

        new_number = int(last_payment.payment_id[-4:]) + 1 if last_payment else 1
        payment_id = f'VP{date_str}{new_number:04d}'

        payment = VendorPayment.objects.create(
            payment_id=payment_id,
            vendor=invoice.vendor,
            payment_date=today,
            amount=amount,
            payment_method=invoice.vendor.payment_method or 'bank_transfer',
            status='completed',
            is_advance=False,
            transaction_reference=invoice.invoice_number,
            processed_by=user,
            notes=f"Payment recorded from invoice {invoice.invoice_number}",
        )

        if invoice.purchase_orders.exists():
            payment.purchase_orders.set(invoice.purchase_orders.all())
    
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
        previous_paid = invoice.amount_paid
        invoice.amount_paid = invoice.total_amount
        invoice.payment_status = 'paid'
        invoice.status = 'paid'
        invoice.save()

        self._update_vendor_balances_from_invoice(invoice, previous_paid)
        self._create_vendor_payment_from_invoice(
            invoice,
            invoice.amount_paid - previous_paid,
            request.user,
        )
        
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

        if amount <= 0:
            return Response(
                {'error': 'Amount must be greater than 0'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        previous_paid = invoice.amount_paid
        invoice.amount_paid += amount
        if invoice.amount_paid >= invoice.total_amount:
            invoice.payment_status = 'paid'
            invoice.status = 'paid'
        else:
            invoice.payment_status = 'partially_paid'
        
        invoice.save()

        self._update_vendor_balances_from_invoice(invoice, previous_paid)
        self._create_vendor_payment_from_invoice(invoice, amount, request.user)
        
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


class VendorProductPriceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing vendor-specific product pricing.
    
    Allows setting custom prices for vendor-product combinations,
    enabling bulk deals and special pricing arrangements.
    """
    queryset = VendorProductPrice.objects.select_related('vendor', 'product').all()
    serializer_class = VendorProductPriceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['vendor', 'product', 'is_active']
    search_fields = ['vendor__company_name', 'product__name', 'notes']
    ordering_fields = ['vendor_price', 'created_at', 'valid_from']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Use lightweight serializer for list view."""
        if self.action == 'list':
            return VendorProductPriceListSerializer
        return VendorProductPriceSerializer
    
    def get_queryset(self):
        """Filter by vendor or product if specified in query params."""
        queryset = super().get_queryset()
        
        # Additional filtering options
        active_only = self.request.query_params.get('active_only')
        if active_only and active_only.lower() == 'true':
            queryset = queryset.filter(is_active=True)
        
        # Filter by validity date
        valid_on = self.request.query_params.get('valid_on')
        if valid_on:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(valid_from__isnull=True) | Q(valid_from__lte=valid_on),
                Q(valid_until__isnull=True) | Q(valid_until__gte=valid_on)
            )
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def for_vendor(self, request):
        """Get all active product prices for a specific vendor."""
        vendor_id = request.query_params.get('vendor_id')
        if not vendor_id:
            return Response(
                {'error': 'vendor_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        prices = self.get_queryset().filter(
            vendor_id=vendor_id,
            is_active=True
        )
        
        serializer = VendorProductPriceListSerializer(prices, many=True)
        return Response({
            'vendor_id': vendor_id,
            'prices': serializer.data,
            'count': prices.count()
        })
    
    @action(detail=False, methods=['get'])
    def for_product(self, request):
        """Get all active vendor prices for a specific product."""
        product_id = request.query_params.get('product_id')
        if not product_id:
            return Response(
                {'error': 'product_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        prices = self.get_queryset().filter(
            product_id=product_id,
            is_active=True
        )
        
        serializer = VendorProductPriceListSerializer(prices, many=True)
        return Response({
            'product_id': product_id,
            'prices': serializer.data,
            'count': prices.count()
        })

