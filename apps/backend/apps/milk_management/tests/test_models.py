"""
Tests for Milk Management Models

Tests model creation, validation, and business logic.
"""

from decimal import Decimal
from datetime import date, time, timedelta
from django.test import TestCase
from django.core.exceptions import ValidationError
from django.utils import timezone

from apps.authentication.models import User
from apps.milk_management.models import Supplier, MilkCollection, MilkPayment


class SupplierModelTest(TestCase):
    """Test cases for Supplier model."""
    
    def setUp(self):
        """Set up test data."""
        self.supplier_data = {
            'supplier_id': 'SUP001',
            'name': 'Test Farmer',
            'supplier_type': 'farmer',
            'status': 'active',
            'phone': '+1234567890',
            'address': '123 Farm Road',
            'route_name': 'Route A',
            'collection_time': time(6, 0),
            'payment_cycle': 'monthly',
        }
    
    def test_create_supplier(self):
        """Test creating a basic supplier."""
        supplier = Supplier.objects.create(**self.supplier_data)
        
        self.assertEqual(supplier.supplier_id, 'SUP001')
        self.assertEqual(supplier.name, 'Test Farmer')
        self.assertEqual(supplier.status, 'active')
        self.assertEqual(supplier.avg_quality_score, Decimal('0.00'))
        self.assertEqual(supplier.total_milk_supplied, Decimal('0.00'))
        self.assertEqual(supplier.outstanding_balance, Decimal('0.00'))
    
    def test_supplier_str_representation(self):
        """Test string representation of supplier."""
        supplier = Supplier.objects.create(**self.supplier_data)
        expected = "SUP001 - Test Farmer"
        self.assertEqual(str(supplier), expected)
    
    def test_supplier_unique_id(self):
        """Test that supplier_id must be unique."""
        Supplier.objects.create(**self.supplier_data)
        
        # Try to create another supplier with same ID
        with self.assertRaises(Exception):
            Supplier.objects.create(**self.supplier_data)
    
    def test_supplier_validation_bank_details(self):
        """Test that bank details are required for non-daily payment cycles."""
        supplier = Supplier(**self.supplier_data)
        
        # Should raise validation error for monthly payment without bank details
        with self.assertRaises(ValidationError):
            supplier.full_clean()
    
    def test_supplier_with_complete_bank_details(self):
        """Test supplier creation with complete bank details."""
        self.supplier_data.update({
            'bank_name': 'Test Bank',
            'account_number': '1234567890',
            'ifsc_code': 'TEST0001234',
            'account_holder_name': 'Test Farmer',
        })
        
        supplier = Supplier.objects.create(**self.supplier_data)
        supplier.full_clean()  # Should not raise any errors
        
        self.assertEqual(supplier.bank_name, 'Test Bank')


class MilkCollectionModelTest(TestCase):
    """Test cases for MilkCollection model."""
    
    def setUp(self):
        """Set up test data."""
        # Create supplier
        self.supplier = Supplier.objects.create(
            supplier_id='SUP001',
            name='Test Farmer',
            supplier_type='farmer',
            status='active',
            phone='+1234567890',
            address='123 Farm Road',
            route_name='Route A',
            collection_time=time(6, 0),
            payment_cycle='monthly',
            bank_name='Test Bank',
            account_number='1234567890',
        )
        
        # Create user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.collection_data = {
            'collection_id': 'MC202510210001',
            'supplier': self.supplier,
            'collected_by': self.user,
            'collection_date': date.today(),
            'collection_time': time(6, 30),
            'milk_type': 'cow',
            'quantity': Decimal('10.5'),
            'fat': Decimal('4.5'),
            'snf': Decimal('8.5'),
            'temperature': Decimal('4.0'),
            'rate_per_fat': Decimal('60.00'),
            'rate_per_snf': Decimal('10.00'),
        }
    
    def test_create_collection(self):
        """Test creating a milk collection."""
        collection = MilkCollection.objects.create(**self.collection_data)
        
        self.assertEqual(collection.supplier, self.supplier)
        self.assertEqual(collection.quantity, Decimal('10.5'))
        self.assertGreater(collection.quality_score, 0)
    
    def test_quality_score_calculation(self):
        """Test quality score calculation."""
        collection = MilkCollection(**self.collection_data)
        
        # Calculate quality score
        score = collection.calculate_quality_score()
        
        # With fat=4.5 kg/L, SNF=8.5 kg/L, temp=4°C (ideal range)
        # Fat score: (4.5/6.0) * 50 = 37.5
        # SNF score: (8.5/9.0) * 30 = 28.33
        # Temp score: 20 (in ideal range)
        # Total: ~85.83
        
        self.assertGreater(score, 80)
        self.assertLess(score, 90)
    
    def test_quality_score_with_high_temperature(self):
        """Test quality score with high temperature (outside ideal range)."""
        self.collection_data['temperature'] = Decimal('15.0')
        collection = MilkCollection(**self.collection_data)
        
        score = collection.calculate_quality_score()
        
        # Should not get temperature bonus
        self.assertLess(score, 70)
    
    def test_total_amount_calculation(self):
        """Test that total amount is calculated on save."""
        collection = MilkCollection.objects.create(**self.collection_data)
        
        expected_amount = self.collection_data['quantity'] * self.collection_data['rate_per_liter']
        self.assertEqual(collection.total_amount, expected_amount)
    
    def test_collection_str_representation(self):
        """Test string representation of collection."""
        collection = MilkCollection.objects.create(**self.collection_data)
        
        self.assertIn(collection.collection_id, str(collection))
        self.assertIn(self.supplier.name, str(collection))
    
    def test_rejected_collection_requires_reason(self):
        """Test that rejected collections require a rejection reason."""
        self.collection_data['quality_status'] = 'rejected'
        collection = MilkCollection(**self.collection_data)
        
        with self.assertRaises(ValidationError):
            collection.full_clean()
    
    def test_unique_together_constraint(self):
        """Test that supplier, date, and time combination must be unique."""
        MilkCollection.objects.create(**self.collection_data)
        
        # Try to create another collection with same supplier, date, and time
        with self.assertRaises(Exception):
            MilkCollection.objects.create(**self.collection_data)
    
    def test_quantity_validation(self):
        """Test that quantity must be positive."""
        self.collection_data['quantity'] = Decimal('-5.0')
        collection = MilkCollection(**self.collection_data)
        
        with self.assertRaises(ValidationError):
            collection.full_clean()
    
    def test_percentage_validation(self):
        """Test that percentages are within valid range."""
        # Test fat percentage > 100
        self.collection_data['fat'] = Decimal('150.0')
        collection = MilkCollection(**self.collection_data)
        
        with self.assertRaises(ValidationError):
            collection.full_clean()
    
    def test_supplier_metrics_update_on_collection_save(self):
        """Test that supplier metrics are updated when collection is saved."""
        # Initial state
        self.assertEqual(self.supplier.total_milk_supplied, Decimal('0.00'))
        
        # Create collection
        collection = MilkCollection.objects.create(**self.collection_data)
        
        # Refresh supplier from database
        self.supplier.refresh_from_db()
        
        # Check metrics updated
        self.assertEqual(self.supplier.total_milk_supplied, collection.quantity)
        self.assertGreater(self.supplier.avg_quality_score, 0)


class MilkPaymentModelTest(TestCase):
    """Test cases for MilkPayment model."""
    
    def setUp(self):
        """Set up test data."""
        # Create supplier
        self.supplier = Supplier.objects.create(
            supplier_id='SUP001',
            name='Test Farmer',
            supplier_type='farmer',
            status='active',
            phone='+1234567890',
            address='123 Farm Road',
            route_name='Route A',
            collection_time=time(6, 0),
            payment_cycle='monthly',
            bank_name='Test Bank',
            account_number='1234567890',
        )
        
        # Create user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        today = date.today()
        self.payment_data = {
            'payment_id': 'MP202510210001',
            'supplier': self.supplier,
            'processed_by': self.user,
            'payment_date': today,
            'amount': Decimal('5000.00'),
            'payment_method': 'bank_transfer',
            'status': 'pending',
            'period_start': today - timedelta(days=30),
            'period_end': today,
            'transaction_reference': 'TXN123456',
        }
    
    def test_create_payment(self):
        """Test creating a payment."""
        payment = MilkPayment.objects.create(**self.payment_data)
        
        self.assertEqual(payment.supplier, self.supplier)
        self.assertEqual(payment.amount, Decimal('5000.00'))
        self.assertEqual(payment.status, 'pending')
    
    def test_payment_str_representation(self):
        """Test string representation of payment."""
        payment = MilkPayment.objects.create(**self.payment_data)
        
        self.assertIn(payment.payment_id, str(payment))
        self.assertIn(self.supplier.name, str(payment))
        self.assertIn('5000', str(payment))
    
    def test_period_validation(self):
        """Test that period_start must be before period_end."""
        today = date.today()
        self.payment_data['period_start'] = today
        self.payment_data['period_end'] = today - timedelta(days=30)
        
        payment = MilkPayment(**self.payment_data)
        
        with self.assertRaises(ValidationError):
            payment.full_clean()
    
    def test_upi_payment_requires_transaction_id(self):
        """Test that UPI payments require transaction ID."""
        self.payment_data['payment_method'] = 'upi'
        self.payment_data['upi_transaction_id'] = ''
        
        payment = MilkPayment(**self.payment_data)
        
        with self.assertRaises(ValidationError):
            payment.full_clean()
    
    def test_cheque_payment_requires_cheque_number(self):
        """Test that cheque payments require cheque number."""
        self.payment_data['payment_method'] = 'cheque'
        self.payment_data['cheque_number'] = ''
        
        payment = MilkPayment(**self.payment_data)
        
        with self.assertRaises(ValidationError):
            payment.full_clean()
    
    def test_bank_transfer_requires_reference(self):
        """Test that bank transfers require transaction reference."""
        self.payment_data['payment_method'] = 'bank_transfer'
        self.payment_data['transaction_reference'] = ''
        
        payment = MilkPayment(**self.payment_data)
        
        with self.assertRaises(ValidationError):
            payment.full_clean()
    
    def test_payment_with_collections(self):
        """Test payment linked to collections."""
        # Create a collection
        collection = MilkCollection.objects.create(
            collection_id='MC202510210001',
            supplier=self.supplier,
            collected_by=self.user,
            collection_date=date.today(),
            collection_time=time(6, 30),
            milk_type='cow',
            quantity=Decimal('10.5'),
            fat=Decimal('4.5'),
            snf_percentage=Decimal('8.5'),
            temperature=Decimal('4.0'),
            rate_per_liter=Decimal('35.00'),
        )
        
        # Create payment
        payment = MilkPayment.objects.create(**self.payment_data)
        payment.collections.add(collection)
        
        self.assertEqual(payment.collections.count(), 1)
        self.assertIn(collection, payment.collections.all())
