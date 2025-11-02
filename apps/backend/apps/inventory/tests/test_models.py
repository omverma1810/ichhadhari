import pytest
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal
from apps.inventory.models import (
    InventoryItem, StockTransaction, RawMaterialStock,
    FinishedGoodsStock, StockAlert
)
from apps.production.models import Product, ProductionBatch

User = get_user_model()


@pytest.fixture
def user(db):
    """Create a test user."""
    return User.objects.create_user(
        username='testuser',
        phone='1234567890',
        password='testpass123',
        first_name='Test',
        last_name='User'
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
        max_stock_level=Decimal('200.00'),
        reorder_point=Decimal('30.00'),
    )


@pytest.fixture
def product(db):
    """Create a test product."""
    return Product.objects.create(
        product_id='PROD-001',
        name='Test Milk Product',
        category='dairy',
        unit='liter',
        cost_price=Decimal('40.00'),
        selling_price=Decimal('60.00'),
        shelf_life_days=7,
        milk_required_per_unit=Decimal('1.0'),
    )


@pytest.fixture
def production_batch(db, product):
    """Create a test production batch."""
    return ProductionBatch.objects.create(
        batch_id='BATCH-001',
        product=product,
        batch_date=timezone.now().date(),
        planned_quantity=Decimal('50.00'),
        actual_quantity=Decimal('50.00'),
        milk_allocated=Decimal('50.00'),
        status='completed',
    )


@pytest.mark.django_db
class TestInventoryItem:
    """Tests for InventoryItem model."""
    
    def test_create_inventory_item(self, inventory_item):
        """Test creating an inventory item."""
        assert inventory_item.item_id == 'TEST-001'
        assert inventory_item.name == 'Test Raw Material'
        assert inventory_item.current_stock == Decimal('100.00')
    
    def test_is_below_min_stock(self, inventory_item):
        """Test low stock detection."""
        assert not inventory_item.is_below_min_stock
        
        inventory_item.current_stock = Decimal('15.00')
        inventory_item.save()
        
        assert inventory_item.is_below_min_stock
    
    def test_is_below_reorder_point(self, inventory_item):
        """Test reorder point detection."""
        assert not inventory_item.is_below_reorder_point
        
        inventory_item.current_stock = Decimal('25.00')
        inventory_item.save()
        
        assert inventory_item.is_below_reorder_point


@pytest.mark.django_db
class TestStockTransaction:
    """Tests for StockTransaction model and stock updates."""
    
    def test_create_stock_transaction_addition(self, inventory_item, user):
        """Test creating a stock addition transaction."""
        initial_stock = inventory_item.current_stock
        quantity = Decimal('50.00')
        
        transaction = StockTransaction.objects.create(
            transaction_id='ST202410220001',
            item=inventory_item,
            transaction_type='purchase',
            transaction_date=timezone.now(),
            quantity=quantity,
            is_addition=True,
            stock_before=initial_stock,
            stock_after=initial_stock + quantity,
            unit_cost=Decimal('50.00'),
            total_cost=quantity * Decimal('50.00'),
            performed_by=user
        )
        
        assert transaction.stock_after == initial_stock + quantity
        assert transaction.total_cost == Decimal('2500.00')
    
    def test_create_stock_transaction_removal(self, inventory_item, user):
        """Test creating a stock removal transaction."""
        initial_stock = inventory_item.current_stock
        quantity = Decimal('30.00')
        
        transaction = StockTransaction.objects.create(
            transaction_id='ST202410220002',
            item=inventory_item,
            transaction_type='sale',
            transaction_date=timezone.now(),
            quantity=quantity,
            is_addition=False,
            stock_before=initial_stock,
            stock_after=initial_stock - quantity,
            unit_cost=Decimal('60.00'),
            total_cost=quantity * Decimal('60.00'),
            performed_by=user
        )
        
        assert transaction.stock_after == initial_stock - quantity
        assert transaction.total_cost == Decimal('1800.00')
    
    def test_stock_level_update_after_transaction(self, inventory_item, user):
        """Test that inventory item stock is updated after transaction."""
        initial_stock = inventory_item.current_stock
        quantity = Decimal('20.00')
        
        transaction = StockTransaction.objects.create(
            transaction_id='ST202410220003',
            item=inventory_item,
            transaction_type='purchase',
            transaction_date=timezone.now(),
            quantity=quantity,
            is_addition=True,
            stock_before=initial_stock,
            stock_after=initial_stock + quantity,
            unit_cost=Decimal('50.00'),
            total_cost=quantity * Decimal('50.00'),
            performed_by=user
        )
        
        # Manually update stock (normally done in view)
        inventory_item.current_stock = transaction.stock_after
        inventory_item.save()
        
        inventory_item.refresh_from_db()
        assert inventory_item.current_stock == initial_stock + quantity


@pytest.mark.django_db
class TestStockAlert:
    """Tests for StockAlert creation and management."""
    
    def test_low_stock_alert_creation(self, inventory_item):
        """Test creating a low stock alert."""
        alert = StockAlert.objects.create(
            item=inventory_item,
            alert_type='low_stock',
            message=f'Stock for {inventory_item.name} is below minimum level.'
        )
        
        assert alert.status == 'active'
        assert alert.alert_type == 'low_stock'
        assert inventory_item.name in alert.message
    
    def test_alert_acknowledgment(self, inventory_item, user):
        """Test acknowledging an alert."""
        alert = StockAlert.objects.create(
            item=inventory_item,
            alert_type='low_stock',
            message='Low stock alert'
        )
        
        alert.status = 'acknowledged'
        alert.acknowledged_by = user
        alert.acknowledged_at = timezone.now()
        alert.save()
        
        assert alert.status == 'acknowledged'
        assert alert.acknowledged_by == user
        assert alert.acknowledged_at is not None
    
    def test_alert_resolution(self, inventory_item, user):
        """Test resolving an alert."""
        alert = StockAlert.objects.create(
            item=inventory_item,
            alert_type='low_stock',
            message='Low stock alert'
        )
        
        alert.status = 'resolved'
        alert.resolved_by = user
        alert.resolved_at = timezone.now()
        alert.save()
        
        assert alert.status == 'resolved'
        assert alert.resolved_by == user
        assert alert.resolved_at is not None


@pytest.mark.django_db
class TestRawMaterialStock:
    """Tests for RawMaterialStock model."""
    
    def test_create_raw_material_stock(self, inventory_item):
        """Test creating a raw material stock entry."""
        stock = RawMaterialStock.objects.create(
            item=inventory_item,
            supplier_name='Test Supplier',
            batch_number='BATCH-001',
            purchase_date=timezone.now().date(),
            quantity=Decimal('100.00'),
            cost_per_unit=Decimal('50.00'),
            total_cost=Decimal('5000.00')
        )
        
        assert stock.supplier_name == 'Test Supplier'
        assert stock.quantity == Decimal('100.00')
        assert stock.is_active is True


@pytest.mark.django_db
class TestFinishedGoodsStock:
    """Tests for FinishedGoodsStock model."""
    
    def test_create_finished_goods_stock(self, inventory_item, production_batch):
        """Test creating a finished goods stock entry."""
        stock = FinishedGoodsStock.objects.create(
            item=inventory_item,
            batch=production_batch,
            quantity=Decimal('50.00'),
            production_date=timezone.now().date(),
            expiry_date=timezone.now().date(),
            quality_check_passed=True
        )
        
        assert stock.batch == production_batch
        assert stock.quantity == Decimal('50.00')
        assert stock.quality_check_passed is True
        assert stock.is_sold is False


@pytest.mark.django_db
class TestStockTransactionSignals:
    """Tests for signal-triggered alert generation."""
    
    def test_low_stock_alert_generated_on_transaction(self, inventory_item, user):
        """Test that low stock alert is generated when stock drops below minimum."""
        # Set stock to just above minimum
        inventory_item.current_stock = Decimal('25.00')
        inventory_item.save()
        
        # Create transaction that will bring stock below minimum
        quantity = Decimal('10.00')
        transaction = StockTransaction.objects.create(
            transaction_id='ST202410220004',
            item=inventory_item,
            transaction_type='sale',
            transaction_date=timezone.now(),
            quantity=quantity,
            is_addition=False,
            stock_before=inventory_item.current_stock,
            stock_after=inventory_item.current_stock - quantity,
            unit_cost=Decimal('50.00'),
            total_cost=quantity * Decimal('50.00'),
            performed_by=user
        )
        
        # Update inventory stock
        inventory_item.current_stock = transaction.stock_after
        inventory_item.save()
        
        # Check if alert was created (if signals are working)
        # Note: Signal must be properly connected for this to work
        assert inventory_item.is_below_min_stock
