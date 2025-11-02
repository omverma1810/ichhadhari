"""
Model Tests for Production Management

Tests for Product, ProductionBatch, and ProductionSchedule models.
"""

from decimal import Decimal
from datetime import date, timedelta
from django.test import TestCase
from django.core.exceptions import ValidationError
from django.db import IntegrityError

from apps.authentication.models import User
from apps.production.models import Product, ProductionBatch, ProductionSchedule


class ProductModelTest(TestCase):
    """Test cases for Product model."""
    
    def setUp(self):
        """Set up test data."""
        self.product_data = {
            'product_id': 'PRD001',
            'name': 'Paneer',
            'category': 'dairy',
            'unit': 'kg',
            'cost_price': Decimal('200.00'),
            'selling_price': Decimal('300.00'),
            'shelf_life_days': 7,
            'milk_required_per_unit': Decimal('5.00'),
        }
    
    def test_create_product(self):
        """Test creating a product."""
        product = Product.objects.create(**self.product_data)
        
        self.assertEqual(product.product_id, 'PRD001')
        self.assertEqual(product.name, 'Paneer')
        self.assertEqual(product.category, 'dairy')
        self.assertTrue(product.is_active)
    
    def test_product_str(self):
        """Test product string representation."""
        product = Product.objects.create(**self.product_data)
        self.assertEqual(str(product), 'PRD001 - Paneer')
    
    def test_product_profit_margin(self):
        """Test profit margin calculation."""
        product = Product.objects.create(**self.product_data)
        expected_margin = ((Decimal('300.00') - Decimal('200.00')) / Decimal('200.00')) * 100
        self.assertEqual(product.profit_margin, expected_margin)
    
    def test_unique_product_id(self):
        """Test product_id uniqueness constraint."""
        Product.objects.create(**self.product_data)
        
        with self.assertRaises(IntegrityError):
            Product.objects.create(**self.product_data)
    
    def test_product_ordering(self):
        """Test default ordering by product_id."""
        Product.objects.create(
            product_id='PRD003',
            name='Product 3',
            category='dairy',
            unit='kg',
            cost_price=Decimal('100.00'),
            selling_price=Decimal('150.00'),
            shelf_life_days=5,
            milk_required_per_unit=Decimal('2.00'),
        )
        Product.objects.create(
            product_id='PRD001',
            name='Product 1',
            category='dairy',
            unit='kg',
            cost_price=Decimal('100.00'),
            selling_price=Decimal('150.00'),
            shelf_life_days=5,
            milk_required_per_unit=Decimal('2.00'),
        )
        
        products = list(Product.objects.all())
        self.assertEqual(products[0].product_id, 'PRD001')
        self.assertEqual(products[1].product_id, 'PRD003')


class ProductionBatchModelTest(TestCase):
    """Test cases for ProductionBatch model."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username='supervisor',
            email='supervisor@example.com',
            password='testpass123'
        )
        
        self.product = Product.objects.create(
            product_id='PRD001',
            name='Paneer',
            category='dairy',
            unit='kg',
            cost_price=Decimal('200.00'),
            selling_price=Decimal('300.00'),
            shelf_life_days=7,
            milk_required_per_unit=Decimal('5.00'),
        )
        
        self.batch_data = {
            'batch_id': 'PB202510220001',
            'product': self.product,
            'batch_date': date.today(),
            'planned_quantity': Decimal('100.00'),
            'milk_allocated': Decimal('500.00'),
            'supervisor': self.user,
        }
    
    def test_create_batch(self):
        """Test creating a production batch."""
        batch = ProductionBatch.objects.create(**self.batch_data)
        
        self.assertEqual(batch.batch_id, 'PB202510220001')
        self.assertEqual(batch.product, self.product)
        self.assertEqual(batch.status, 'planned')
        self.assertEqual(batch.yield_percentage, Decimal('0.00'))
    
    def test_batch_str(self):
        """Test batch string representation."""
        batch = ProductionBatch.objects.create(**self.batch_data)
        self.assertEqual(str(batch), 'PB202510220001 - Paneer')
    
    def test_yield_percentage_calculation(self):
        """Test automatic yield percentage calculation."""
        batch = ProductionBatch.objects.create(**self.batch_data)
        
        # Update with actual quantity
        batch.actual_quantity = Decimal('95.00')
        batch.save()
        
        expected_yield = (Decimal('95.00') / Decimal('100.00')) * 100
        self.assertEqual(batch.yield_percentage, expected_yield)
    
    def test_yield_percentage_over_100(self):
        """Test yield percentage when actual exceeds planned."""
        batch = ProductionBatch.objects.create(**self.batch_data)
        
        # Update with actual quantity exceeding planned
        batch.actual_quantity = Decimal('105.00')
        batch.save()
        
        expected_yield = (Decimal('105.00') / Decimal('100.00')) * 100
        self.assertEqual(batch.yield_percentage, Decimal('105.00'))
    
    def test_efficiency_score(self):
        """Test efficiency score calculation."""
        batch = ProductionBatch.objects.create(**self.batch_data)
        
        batch.actual_quantity = Decimal('95.00')
        batch.wastage_quantity = Decimal('3.00')
        batch.save()
        
        # Efficiency = yield_pct - wastage_pct
        # yield_pct = 95%
        # wastage_pct = 3%
        # efficiency = 95 - 3 = 92
        self.assertEqual(batch.efficiency_score, Decimal('92.00'))
    
    def test_duration_minutes_calculation(self):
        """Test duration calculation in minutes."""
        from django.utils import timezone
        
        batch = ProductionBatch.objects.create(**self.batch_data)
        
        start = timezone.now()
        end = start + timedelta(hours=2, minutes=30)
        
        batch.start_time = start
        batch.end_time = end
        batch.save()
        
        self.assertEqual(batch.duration_minutes, 150.0)
    
    def test_batch_ordering(self):
        """Test default ordering by batch_date descending."""
        batch1 = ProductionBatch.objects.create(
            batch_id='PB202510200001',
            product=self.product,
            batch_date=date.today() - timedelta(days=2),
            planned_quantity=Decimal('100.00'),
            milk_allocated=Decimal('500.00'),
        )
        batch2 = ProductionBatch.objects.create(
            batch_id='PB202510220001',
            product=self.product,
            batch_date=date.today(),
            planned_quantity=Decimal('100.00'),
            milk_allocated=Decimal('500.00'),
        )
        
        batches = list(ProductionBatch.objects.all())
        self.assertEqual(batches[0].batch_id, 'PB202510220001')
        self.assertEqual(batches[1].batch_id, 'PB202510200001')


class ProductionScheduleModelTest(TestCase):
    """Test cases for ProductionSchedule model."""
    
    def setUp(self):
        """Set up test data."""
        self.product = Product.objects.create(
            product_id='PRD001',
            name='Paneer',
            category='dairy',
            unit='kg',
            cost_price=Decimal('200.00'),
            selling_price=Decimal('300.00'),
            shelf_life_days=7,
            milk_required_per_unit=Decimal('5.00'),
        )
        
        self.schedule_data = {
            'schedule_date': date.today() + timedelta(days=1),
            'product': self.product,
            'planned_quantity': Decimal('100.00'),
            'priority': 1,
        }
    
    def test_create_schedule(self):
        """Test creating a production schedule."""
        schedule = ProductionSchedule.objects.create(**self.schedule_data)
        
        self.assertEqual(schedule.product, self.product)
        self.assertEqual(schedule.planned_quantity, Decimal('100.00'))
        self.assertEqual(schedule.priority, 1)
    
    def test_schedule_str(self):
        """Test schedule string representation."""
        schedule = ProductionSchedule.objects.create(**self.schedule_data)
        expected = f"{self.schedule_data['schedule_date']} - Paneer (100.00)"
        self.assertEqual(str(schedule), expected)
    
    def test_required_milk_calculation(self):
        """Test required milk calculation."""
        schedule = ProductionSchedule.objects.create(**self.schedule_data)
        
        # Product requires 5 liters per unit
        # Planned quantity is 100 units
        # Required milk = 100 * 5 = 500 liters
        expected_milk = Decimal('100.00') * Decimal('5.00')
        self.assertEqual(schedule.required_milk, expected_milk)
    
    def test_is_completed_without_batch(self):
        """Test is_completed property when no batch is linked."""
        schedule = ProductionSchedule.objects.create(**self.schedule_data)
        self.assertFalse(schedule.is_completed)
    
    def test_is_completed_with_completed_batch(self):
        """Test is_completed property with completed batch."""
        schedule = ProductionSchedule.objects.create(**self.schedule_data)
        
        batch = ProductionBatch.objects.create(
            batch_id='PB202510220001',
            product=self.product,
            batch_date=date.today(),
            planned_quantity=Decimal('100.00'),
            milk_allocated=Decimal('500.00'),
            status='completed',
        )
        
        schedule.batch = batch
        schedule.save()
        
        self.assertTrue(schedule.is_completed)
    
    def test_unique_together_constraint(self):
        """Test unique_together constraint on schedule_date and product."""
        ProductionSchedule.objects.create(**self.schedule_data)
        
        with self.assertRaises(IntegrityError):
            ProductionSchedule.objects.create(**self.schedule_data)
    
    def test_schedule_ordering(self):
        """Test default ordering by schedule_date and priority."""
        schedule1 = ProductionSchedule.objects.create(
            schedule_date=date.today() + timedelta(days=2),
            product=self.product,
            planned_quantity=Decimal('100.00'),
            priority=2,
        )
        
        product2 = Product.objects.create(
            product_id='PRD002',
            name='Butter',
            category='dairy',
            unit='kg',
            cost_price=Decimal('300.00'),
            selling_price=Decimal('400.00'),
            shelf_life_days=30,
            milk_required_per_unit=Decimal('10.00'),
        )
        
        schedule2 = ProductionSchedule.objects.create(
            schedule_date=date.today() + timedelta(days=1),
            product=product2,
            planned_quantity=Decimal('50.00'),
            priority=1,
        )
        
        schedules = list(ProductionSchedule.objects.all())
        self.assertEqual(schedules[0], schedule2)  # Earlier date
        self.assertEqual(schedules[1], schedule1)  # Later date
