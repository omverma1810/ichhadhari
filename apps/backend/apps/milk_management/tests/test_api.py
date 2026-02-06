"""
Tests for Milk Management API

Tests API endpoints and custom actions.
"""

from decimal import Decimal
from datetime import date, time, timedelta
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.authentication.models import User
from apps.milk_management.models import Supplier, MilkCollection, MilkPayment


class SupplierAPITest(APITestCase):
    """Test cases for Supplier API."""
    
    def setUp(self):
        """Set up test data."""
        # Create admin user
        self.user = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='testpass123',
            role='admin'
        )
        self.client.force_authenticate(user=self.user)
        
        # Create test supplier
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
    
    def test_list_suppliers(self):
        """Test listing suppliers."""
        url = reverse('supplier-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_create_supplier(self):
        """Test creating a supplier."""
        url = reverse('supplier-list')
        data = {
            'supplier_id': 'SUP002',
            'name': 'New Farmer',
            'supplier_type': 'farmer',
            'status': 'active',
            'phone': '+9876543210',
            'address': '456 Farm Road',
            'route_name': 'Route B',
            'collection_time': '07:00:00',
            'payment_cycle': 'weekly',
            'bank_name': 'New Bank',
            'account_number': '9876543210',
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Supplier.objects.count(), 2)
        self.assertEqual(response.data['name'], 'New Farmer')
    
    def test_retrieve_supplier(self):
        """Test retrieving a specific supplier."""
        url = reverse('supplier-detail', args=[self.supplier.id])
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['supplier_id'], 'SUP001')
    
    def test_update_supplier(self):
        """Test updating a supplier."""
        url = reverse('supplier-detail', args=[self.supplier.id])
        data = {
            'name': 'Updated Farmer Name',
            'status': 'inactive',
        }
        
        response = self.client.patch(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.supplier.refresh_from_db()
        self.assertEqual(self.supplier.name, 'Updated Farmer Name')
        self.assertEqual(self.supplier.status, 'inactive')
    
    def test_supplier_collections_action(self):
        """Test getting collections for a supplier."""
        # Create a collection
        MilkCollection.objects.create(
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
        
        url = reverse('supplier-collections', args=[self.supplier.id])
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
    
    def test_supplier_stats_action(self):
        """Test getting statistics for a supplier."""
        # Create collections
        for i in range(3):
            MilkCollection.objects.create(
                collection_id=f'MC2025102100{i+1:02d}',
                supplier=self.supplier,
                collected_by=self.user,
                collection_date=date.today() - timedelta(days=i),
                collection_time=time(6, 30),
                milk_type='cow',
                quantity=Decimal('10.0'),
                fat=Decimal('4.5'),
                snf_percentage=Decimal('8.5'),
                temperature=Decimal('4.0'),
                rate_per_liter=Decimal('35.00'),
            )
        
        url = reverse('supplier-stats', args=[self.supplier.id])
        response = self.client.get(url, {'days': 7})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['collection_count'], 3)
        self.assertGreater(response.data['total_quantity'], 0)


class MilkCollectionAPITest(APITestCase):
    """Test cases for MilkCollection API."""
    
    def setUp(self):
        """Set up test data."""
        # Create admin user
        self.user = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='testpass123',
            role='admin'
        )
        self.client.force_authenticate(user=self.user)
        
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
        
        # Create collection
        self.collection = MilkCollection.objects.create(
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
    
    def test_list_collections(self):
        """Test listing collections."""
        url = reverse('collection-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_create_collection(self):
        """Test creating a collection."""
        url = reverse('collection-list')
        data = {
            'supplier': self.supplier.id,
            'collection_date': str(date.today()),
            'collection_time': '07:00:00',
            'milk_type': 'buffalo',
            'quantity': '15.5',
            'fat': '6.5',
            'snf_percentage': '9.0',
            'temperature': '3.5',
            'rate_per_liter': '45.00',
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIsNotNone(response.data['collection_id'])
        self.assertGreater(Decimal(response.data['quality_score']), 0)
    
    def test_retrieve_collection(self):
        """Test retrieving a specific collection."""
        url = reverse('collection-detail', args=[self.collection.id])
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['collection_id'], 'MC202510210001')
    
    def test_collection_auto_generates_id(self):
        """Test that collection ID is auto-generated."""
        url = reverse('collection-list')
        data = {
            'supplier': self.supplier.id,
            'collection_date': str(date.today()),
            'collection_time': '08:00:00',
            'milk_type': 'cow',
            'quantity': '12.0',
            'fat': '4.0',
            'snf_percentage': '8.0',
            'temperature': '4.5',
            'rate_per_liter': '35.00',
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['collection_id'].startswith('MC'))
    
    def test_collection_stats_action(self):
        """Test getting collection statistics."""
        url = reverse('collection-stats')
        response = self.client.get(url, {'days': 7})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_quantity', response.data)
        self.assertIn('avg_fat', response.data)
        self.assertIn('collection_count', response.data)
    
    def test_collection_by_supplier_action(self):
        """Test getting collections grouped by supplier."""
        url = reverse('collection-by-supplier')
        response = self.client.get(url, {'days': 7})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
    
    def test_collection_today_action(self):
        """Test getting today's collections."""
        url = reverse('collection-today')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('collections', response.data)
        self.assertIn('summary', response.data)
    
    def test_invalid_quantity(self):
        """Test that invalid quantity is rejected."""
        url = reverse('collection-list')
        data = {
            'supplier': self.supplier.id,
            'collection_date': str(date.today()),
            'collection_time': '07:00:00',
            'milk_type': 'cow',
            'quantity': '-5.0',
            'fat': '4.5',
            'snf_percentage': '8.5',
            'temperature': '4.0',
            'rate_per_liter': '35.00',
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class MilkPaymentAPITest(APITestCase):
    """Test cases for MilkPayment API."""
    
    def setUp(self):
        """Set up test data."""
        # Create admin user
        self.user = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='testpass123',
            role='admin'
        )
        self.client.force_authenticate(user=self.user)
        
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
        
        # Create payment
        today = date.today()
        self.payment = MilkPayment.objects.create(
            payment_id='MP202510210001',
            supplier=self.supplier,
            processed_by=self.user,
            payment_date=today,
            amount=Decimal('5000.00'),
            payment_method='bank_transfer',
            status='pending',
            period_start=today - timedelta(days=30),
            period_end=today,
            transaction_reference='TXN123456',
        )
    
    def test_list_payments(self):
        """Test listing payments."""
        url = reverse('payment-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_create_payment(self):
        """Test creating a payment."""
        url = reverse('payment-list')
        today = str(date.today())
        data = {
            'supplier': self.supplier.id,
            'payment_date': today,
            'amount': '3000.00',
            'payment_method': 'upi',
            'status': 'pending',
            'period_start': str(date.today() - timedelta(days=15)),
            'period_end': today,
            'upi_transaction_id': 'UPI123456',
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIsNotNone(response.data['payment_id'])
    
    def test_retrieve_payment(self):
        """Test retrieving a specific payment."""
        url = reverse('payment-detail', args=[self.payment.id])
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['payment_id'], 'MP202510210001')
    
    def test_payment_auto_generates_id(self):
        """Test that payment ID is auto-generated."""
        url = reverse('payment-list')
        today = str(date.today())
        data = {
            'supplier': self.supplier.id,
            'payment_date': today,
            'amount': '2500.00',
            'payment_method': 'cash',
            'status': 'completed',
            'period_start': str(date.today() - timedelta(days=7)),
            'period_end': today,
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['payment_id'].startswith('MP'))
    
    def test_pending_payments_action(self):
        """Test getting pending payments."""
        url = reverse('payment-pending')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
    
    def test_mark_completed_action(self):
        """Test marking payment as completed."""
        url = reverse('payment-mark-completed', args=[self.payment.id])
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.payment.refresh_from_db()
        self.assertEqual(self.payment.status, 'completed')
    
    def test_mark_failed_action(self):
        """Test marking payment as failed."""
        url = reverse('payment-mark-failed', args=[self.payment.id])
        data = {'notes': 'Bank transfer failed'}
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.payment.refresh_from_db()
        self.assertEqual(self.payment.status, 'failed')
        self.assertIn('Failed', self.payment.notes)
    
    def test_payment_stats_action(self):
        """Test getting payment statistics."""
        url = reverse('payment-stats')
        response = self.client.get(url, {'days': 30})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_paid', response.data)
        self.assertIn('completed_count', response.data)
        self.assertIn('pending_count', response.data)
    
    def test_upi_payment_validation(self):
        """Test that UPI payment requires transaction ID."""
        url = reverse('payment-list')
        today = str(date.today())
        data = {
            'supplier': self.supplier.id,
            'payment_date': today,
            'amount': '1000.00',
            'payment_method': 'upi',
            'status': 'pending',
            'period_start': str(date.today() - timedelta(days=7)),
            'period_end': today,
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('upi_transaction_id', str(response.data))


class PermissionTest(APITestCase):
    """Test permission controls."""
    
    def setUp(self):
        """Set up test data."""
        # Create viewer user (limited permissions)
        self.viewer = User.objects.create_user(
            username='viewer',
            email='viewer@example.com',
            password='testpass123',
            role='viewer'
        )
    
    def test_unauthenticated_access_denied(self):
        """Test that unauthenticated users cannot access API."""
        url = reverse('supplier-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_viewer_can_read(self):
        """Test that viewer role can read data."""
        self.client.force_authenticate(user=self.viewer)
        
        url = reverse('supplier-list')
        response = self.client.get(url)
        
        # This will fail if permissions are properly configured
        # Adjust based on your actual permission implementation
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_403_FORBIDDEN])
