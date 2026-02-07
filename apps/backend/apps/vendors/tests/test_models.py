import pytest
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal
from apps.vendors.models import (
    Vendor, PurchaseOrder, PurchaseOrderItem,
    VendorPayment, GoodsReceiptNote, GRNItem
)
from apps.inventory.models import InventoryItem

User = get_user_model()


@pytest.fixture
def user(db):
    """Create test user"""
    return User.objects.create_user(
        username='testuser',
        email='test@test.com',
        password='testpass123'
    )


@pytest.fixture
def vendor(db):
    """Create a test vendor."""
    return Vendor.objects.create(
        vendor_id='VEN-001',
        company_name='Test Supplier Ltd',
        category='dairy_counter',
        status='active',
        contact_person='John Doe',
        phone='9876543210',
        email='john@testsupplier.com',
        billing_address='123 Test Street, Test City',
        gst_number='27AABCT1234H1Z0',
        credit_period_days=30,
        credit_limit=Decimal('100000.00')
    )


@pytest.fixture
def inventory_item(db):
    """Create a test inventory item."""
    return InventoryItem.objects.create(
        item_id='TEST-001',
        name='Test Raw Material',
        item_type='raw_material',
        unit='kg',
        cost_per_unit=Decimal('50.00'),
        current_stock=Decimal('100.00'),
        min_stock_level=Decimal('20.00'),
    )


@pytest.fixture
def purchase_order(db, vendor, user):
    """Create a test purchase order."""
    return PurchaseOrder.objects.create(
        po_number='PO202510220001',
        vendor=vendor,
        po_date=timezone.now().date(),
        expected_delivery_date=timezone.now().date(),
        status='draft',
        created_by=user,
        delivery_address='Factory Warehouse, Test Location'
    )


@pytest.mark.django_db
class TestVendor:
    """Tests for Vendor model."""
    
    def test_create_vendor(self, vendor):
        """Test creating a vendor."""
        assert vendor.vendor_id == 'VEN-001'
        assert vendor.company_name == 'Test Supplier Ltd'
        assert vendor.status == 'active'
        assert vendor.total_purchases == 0
        assert vendor.outstanding_balance == 0
    
    def test_vendor_string_representation(self, vendor):
        """Test vendor string representation."""
        assert str(vendor) == 'VEN-001 - Test Supplier Ltd'


@pytest.mark.django_db
class TestPurchaseOrder:
    """Tests for PurchaseOrder model."""
    
    def test_create_purchase_order(self, purchase_order):
        """Test creating a purchase order."""
        assert purchase_order.po_number == 'PO202510220001'
        assert purchase_order.status == 'draft'
        assert purchase_order.total_amount == 0
    
    def test_purchase_order_with_items(self, purchase_order):
        """Test PO with line items."""
        # Create PO items
        item1 = PurchaseOrderItem.objects.create(
            purchase_order=purchase_order,
            item_name='Raw Material A',
            quantity=Decimal('100.00'),
            unit='kg',
            unit_price=Decimal('50.00'),
            tax_percentage=Decimal('18.00'),
            discount_percentage=Decimal('5.00')
        )
        
        item2 = PurchaseOrderItem.objects.create(
            purchase_order=purchase_order,
            item_name='Raw Material B',
            quantity=Decimal('50.00'),
            unit='kg',
            unit_price=Decimal('80.00'),
            tax_percentage=Decimal('18.00'),
            discount_percentage=Decimal('0.00')
        )
        
        # Check line totals are calculated
        assert item1.line_total > 0
        assert item2.line_total > 0
        
        # Check items are linked to PO
        assert purchase_order.items.count() == 2
    
    def test_po_approval(self, purchase_order, user):
        """Test PO approval workflow."""
        assert purchase_order.approved_by is None
        assert purchase_order.approved_at is None
        
        # Approve PO
        purchase_order.status = 'approved'
        purchase_order.approved_by = user
        purchase_order.approved_at = timezone.now()
        purchase_order.save()
        
        assert purchase_order.status == 'approved'
        assert purchase_order.approved_by == user
        assert purchase_order.approved_at is not None


@pytest.mark.django_db
class TestPurchaseOrderItem:
    """Tests for PurchaseOrderItem model."""
    
    def test_line_total_calculation(self, purchase_order):
        """Test line total is calculated correctly."""
        item = PurchaseOrderItem.objects.create(
            purchase_order=purchase_order,
            item_name='Test Item',
            quantity=Decimal('100.00'),
            unit='kg',
            unit_price=Decimal('50.00'),
            tax_percentage=Decimal('18.00'),
            discount_percentage=Decimal('10.00')
        )
        
        # Expected calculation:
        # Base: 100 * 50 = 5000
        # Discount (10%): 500
        # After discount: 4500
        # Tax (18%): 810
        # Total: 5310
        expected_total = Decimal('5310.00')
        assert item.line_total == expected_total
    
    def test_line_total_without_discount_and_tax(self, purchase_order):
        """Test line total without discount and tax."""
        item = PurchaseOrderItem.objects.create(
            purchase_order=purchase_order,
            item_name='Test Item',
            quantity=Decimal('10.00'),
            unit='piece',
            unit_price=Decimal('100.00'),
            tax_percentage=Decimal('0.00'),
            discount_percentage=Decimal('0.00')
        )
        
        expected_total = Decimal('1000.00')
        assert item.line_total == expected_total


@pytest.mark.django_db
class TestVendorPayment:
    """Tests for VendorPayment model."""
    
    def test_create_payment(self, vendor, user):
        """Test creating a vendor payment."""
        payment = VendorPayment.objects.create(
            payment_id='VP202510220001',
            vendor=vendor,
            payment_date=timezone.now().date(),
            amount=Decimal('5000.00'),
            payment_method='bank_transfer',
            status='completed',
            processed_by=user
        )
        
        assert payment.payment_id == 'VP202510220001'
        assert payment.amount == Decimal('5000.00')
        assert payment.status == 'completed'
    
    def test_advance_payment(self, vendor, user):
        """Test advance payment creation."""
        payment = VendorPayment.objects.create(
            payment_id='VP202510220002',
            vendor=vendor,
            payment_date=timezone.now().date(),
            amount=Decimal('10000.00'),
            payment_method='bank_transfer',
            status='completed',
            is_advance=True,
            processed_by=user
        )
        
        assert payment.is_advance is True


@pytest.mark.django_db
class TestGoodsReceiptNote:
    """Tests for GoodsReceiptNote model."""
    
    def test_create_grn(self, purchase_order, user):
        """Test creating a GRN."""
        grn = GoodsReceiptNote.objects.create(
            grn_number='GRN202510220001',
            purchase_order=purchase_order,
            receipt_date=timezone.now().date(),
            received_by=user,
            quality_status='approved',
            quality_checked_by=user
        )
        
        assert grn.grn_number == 'GRN202510220001'
        assert grn.quality_status == 'approved'
    
    def test_grn_with_items(self, purchase_order, user):
        """Test GRN with items."""
        # Create PO item
        po_item = PurchaseOrderItem.objects.create(
            purchase_order=purchase_order,
            item_name='Test Item',
            quantity=Decimal('100.00'),
            unit='kg',
            unit_price=Decimal('50.00')
        )
        
        # Create GRN
        grn = GoodsReceiptNote.objects.create(
            grn_number='GRN202510220001',
            purchase_order=purchase_order,
            receipt_date=timezone.now().date(),
            received_by=user,
            quality_status='approved',
            quality_checked_by=user
        )
        
        # Create GRN item
        grn_item = GRNItem.objects.create(
            grn=grn,
            po_item=po_item,
            ordered_quantity=Decimal('100.00'),
            received_quantity=Decimal('100.00'),
            accepted_quantity=Decimal('100.00'),
            rejected_quantity=Decimal('0.00'),
            quality_check_passed=True
        )
        
        assert grn.items.count() == 1
        assert grn_item.accepted_quantity == Decimal('100.00')


@pytest.mark.django_db
class TestGRNItem:
    """Tests for GRNItem model."""
    
    def test_partial_acceptance(self, purchase_order, user):
        """Test partial acceptance of items in GRN."""
        # Create PO item
        po_item = PurchaseOrderItem.objects.create(
            purchase_order=purchase_order,
            item_name='Test Item',
            quantity=Decimal('100.00'),
            unit='kg',
            unit_price=Decimal('50.00')
        )
        
        # Create GRN
        grn = GoodsReceiptNote.objects.create(
            grn_number='GRN202510220001',
            purchase_order=purchase_order,
            receipt_date=timezone.now().date(),
            received_by=user,
            quality_status='partial',
            quality_checked_by=user
        )
        
        # Create GRN item with partial acceptance
        grn_item = GRNItem.objects.create(
            grn=grn,
            po_item=po_item,
            ordered_quantity=Decimal('100.00'),
            received_quantity=Decimal('100.00'),
            accepted_quantity=Decimal('85.00'),
            rejected_quantity=Decimal('15.00'),
            quality_check_passed=False,
            rejection_reason='Quality issues - 15% rejected'
        )
        
        assert grn_item.accepted_quantity == Decimal('85.00')
        assert grn_item.rejected_quantity == Decimal('15.00')
        assert grn_item.quality_check_passed is False


@pytest.mark.django_db
class TestVendorMetrics:
    """Tests for vendor performance metrics."""
    
    def test_vendor_total_purchases_update(self, vendor):
        """Test that vendor total purchases is tracked."""
        initial_purchases = vendor.total_purchases
        
        # Simulate purchase
        vendor.total_purchases += Decimal('50000.00')
        vendor.save()
        
        vendor.refresh_from_db()
        assert vendor.total_purchases == initial_purchases + Decimal('50000.00')
    
    def test_vendor_outstanding_balance(self, vendor):
        """Test vendor outstanding balance tracking."""
        initial_balance = vendor.outstanding_balance
        
        # Simulate adding to balance
        vendor.outstanding_balance += Decimal('25000.00')
        vendor.save()
        
        vendor.refresh_from_db()
        assert vendor.outstanding_balance == initial_balance + Decimal('25000.00')
        
        # Simulate payment
        vendor.outstanding_balance -= Decimal('10000.00')
        vendor.total_payments += Decimal('10000.00')
        vendor.save()
        
        vendor.refresh_from_db()
        assert vendor.outstanding_balance == Decimal('15000.00')
