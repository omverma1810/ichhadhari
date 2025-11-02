"""
API Tests for Production Management

Tests for Product, ProductionBatch, and ProductionSchedule APIs.
"""

from decimal import Decimal
from datetime import date, time, timedelta
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.authentication.models import User
from apps.production.models import Product, ProductionBatch, ProductionSchedule


class ProductAPITest(APITestCase):
    """Test cases for Product API."""
    
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
        
        # Create test product
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
    
    def test_list_products(self):
        """Test listing products."""
        url = reverse('product-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_create_product(self):
        """Test creating a product."""
        url = reverse('product-list')
        data = {
            'product_id': 'PRD002',
            'name': 'Butter',
            'category': 'dairy',
            'unit': 'kg',
            'cost_price': '300.00',
            'selling_price': '400.00',
            'shelf_life_days': 30,
            'milk_required_per_unit': '10.00',
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Product.objects.count(), 2)
        self.assertEqual(response.data['name'], 'Butter')
    
    def test_retrieve_product(self):
        """Test retrieving a specific product."""
        url = reverse('product-detail', args=[self.product.id])
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['product_id'], 'PRD001')
    
    def test_update_product(self):
        """Test updating a product."""
        url = reverse('product-detail', args=[self.product.id])
        data = {
            'product_id': 'PRD001',
            'name': 'Fresh Paneer',
            'category': 'dairy',
            'unit': 'kg',
            'cost_price': '220.00',
            'selling_price': '320.00',
            'shelf_life_days': 7,
            'milk_required_per_unit': '5.00',
        }
        
        response = self.client.put(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.product.refresh_from_db()
        self.assertEqual(self.product.name, 'Fresh Paneer')
        self.assertEqual(self.product.cost_price, Decimal('220.00'))
    
    def test_delete_product(self):
        """Test deleting a product."""
        url = reverse('product-detail', args=[self.product.id])
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Product.objects.count(), 0)
    
    def test_filter_products_by_category(self):
        """Test filtering products by category."""
        Product.objects.create(
            product_id='PRD002',
            name='Gulab Jamun',
            category='sweets',
            unit='piece',
            cost_price=Decimal('10.00'),
            selling_price=Decimal('15.00'),
            shelf_life_days=3,
            milk_required_per_unit=Decimal('0.05'),
        )
        
        url = reverse('product-list')
        response = self.client.get(url, {'category': 'dairy'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['category'], 'dairy')
    
    def test_search_products(self):
        """Test searching products."""
        url = reverse('product-list')
        response = self.client.get(url, {'search': 'Paneer'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_product_batches_action(self):
        """Test getting batches for a product."""
        # Create a batch
        ProductionBatch.objects.create(
            batch_id='PB202510220001',
            product=self.product,
            batch_date=date.today(),
            planned_quantity=Decimal('100.00'),
            milk_allocated=Decimal('500.00'),
        )
        
        url = reverse('product-batches', args=[self.product.id])
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
    
    def test_product_stats_action(self):
        """Test getting statistics for a product."""
        # Create batches
        for i in range(3):
            ProductionBatch.objects.create(
                batch_id=f'PB2025102200{i+1:02d}',
                product=self.product,
                batch_date=date.today() - timedelta(days=i),
                planned_quantity=Decimal('100.00'),
                actual_quantity=Decimal('95.00'),
                milk_allocated=Decimal('500.00'),
                milk_used=Decimal('475.00'),
                status='completed',
            )
        
        url = reverse('product-stats', args=[self.product.id])
        response = self.client.get(url, {'days': 7})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_batches'], 3)
        self.assertEqual(response.data['completed_batches'], 3)


class ProductionBatchAPITest(APITestCase):
    """Test cases for ProductionBatch API."""
    
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
        
        # Create test product
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
        
        # Create test batch
        self.batch = ProductionBatch.objects.create(
            batch_id='PB202510220001',
            product=self.product,
            batch_date=date.today(),
            planned_quantity=Decimal('100.00'),
            milk_allocated=Decimal('500.00'),
            supervisor=self.user,
        )
    
    def test_list_batches(self):
        """Test listing batches."""
        url = reverse('batch-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_create_batch(self):
        """Test creating a batch with auto-generated batch_id."""
        url = reverse('batch-list')
        data = {
            'product': self.product.id,
            'batch_date': str(date.today()),
            'planned_quantity': '150.00',
            'milk_allocated': '750.00',
            'supervisor': self.user.id,
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ProductionBatch.objects.count(), 2)
        self.assertIsNotNone(response.data['batch_id'])
        self.assertTrue(response.data['batch_id'].startswith('PB'))
    
    def test_retrieve_batch(self):
        """Test retrieving a specific batch."""
        url = reverse('batch-detail', args=[self.batch.id])
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['batch_id'], 'PB202510220001')
    
    def test_update_batch(self):
        """Test updating a batch."""
        url = reverse('batch-detail', args=[self.batch.id])
        data = {
            'product': self.product.id,
            'batch_date': str(date.today()),
            'planned_quantity': '120.00',
            'milk_allocated': '600.00',
        }
        
        response = self.client.patch(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.batch.refresh_from_db()
        self.assertEqual(self.batch.planned_quantity, Decimal('120.00'))
    
    def test_delete_batch(self):
        """Test deleting a batch."""
        url = reverse('batch-detail', args=[self.batch.id])
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(ProductionBatch.objects.count(), 0)
    
    def test_start_batch_action(self):
        """Test starting a batch."""
        url = reverse('batch-start', args=[self.batch.id])
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.batch.refresh_from_db()
        self.assertEqual(self.batch.status, 'in_progress')
        self.assertIsNotNone(self.batch.start_time)
    
    def test_start_batch_invalid_status(self):
        """Test starting a batch with invalid status."""
        self.batch.status = 'completed'
        self.batch.save()
        
        url = reverse('batch-start', args=[self.batch.id])
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_complete_batch_action(self):
        """Test completing a batch."""
        # Start the batch first
        self.batch.status = 'in_progress'
        self.batch.save()
        
        url = reverse('batch-complete', args=[self.batch.id])
        data = {
            'actual_quantity': '95.00',
            'milk_used': '475.00',
            'wastage_quantity': '2.00',
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.batch.refresh_from_db()
        self.assertEqual(self.batch.status, 'completed')
        self.assertEqual(self.batch.actual_quantity, Decimal('95.00'))
        self.assertIsNotNone(self.batch.end_time)
        self.assertEqual(self.batch.yield_percentage, Decimal('95.00'))
    
    def test_complete_batch_invalid_status(self):
        """Test completing a batch with invalid status."""
        url = reverse('batch-complete', args=[self.batch.id])
        data = {
            'actual_quantity': '95.00',
            'milk_used': '475.00',
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_complete_batch_missing_data(self):
        """Test completing a batch with missing required data."""
        self.batch.status = 'in_progress'
        self.batch.save()
        
        url = reverse('batch-complete', args=[self.batch.id])
        data = {
            'actual_quantity': '95.00',
            # Missing milk_used
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_batch_stats_action(self):
        """Test getting overall batch statistics."""
        # Create multiple batches
        for i in range(3):
            ProductionBatch.objects.create(
                batch_id=f'PB2025102200{i+2:02d}',
                product=self.product,
                batch_date=date.today() - timedelta(days=i),
                planned_quantity=Decimal('100.00'),
                actual_quantity=Decimal('95.00'),
                milk_allocated=Decimal('500.00'),
                milk_used=Decimal('475.00'),
                status='completed',
            )
        
        url = reverse('batch-stats')
        response = self.client.get(url, {'days': 7})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(response.data['total_batches'], 3)


class ProductionScheduleAPITest(APITestCase):
    """Test cases for ProductionSchedule API."""
    
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
        
        # Create test product
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
        
        # Create test schedule
        self.schedule = ProductionSchedule.objects.create(
            schedule_date=date.today() + timedelta(days=1),
            product=self.product,
            planned_quantity=Decimal('100.00'),
            priority=1,
        )
    
    def test_list_schedules(self):
        """Test listing schedules."""
        url = reverse('schedule-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_create_schedule(self):
        """Test creating a schedule."""
        url = reverse('schedule-list')
        data = {
            'schedule_date': str(date.today() + timedelta(days=2)),
            'product': self.product.id,
            'planned_quantity': '150.00',
            'priority': 2,
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ProductionSchedule.objects.count(), 2)
    
    def test_create_duplicate_schedule(self):
        """Test creating a duplicate schedule (same date and product)."""
        url = reverse('schedule-list')
        data = {
            'schedule_date': str(self.schedule.schedule_date),
            'product': self.product.id,
            'planned_quantity': '150.00',
            'priority': 2,
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_retrieve_schedule(self):
        """Test retrieving a specific schedule."""
        url = reverse('schedule-detail', args=[self.schedule.id])
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['planned_quantity'], '100.00')
    
    def test_update_schedule(self):
        """Test updating a schedule."""
        url = reverse('schedule-detail', args=[self.schedule.id])
        data = {
            'schedule_date': str(self.schedule.schedule_date),
            'product': self.product.id,
            'planned_quantity': '120.00',
            'priority': 1,
        }
        
        response = self.client.put(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.schedule.refresh_from_db()
        self.assertEqual(self.schedule.planned_quantity, Decimal('120.00'))
    
    def test_delete_schedule(self):
        """Test deleting a schedule."""
        url = reverse('schedule-detail', args=[self.schedule.id])
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(ProductionSchedule.objects.count(), 0)
    
    def test_upcoming_schedules_action(self):
        """Test getting upcoming schedules."""
        # Create more schedules
        for i in range(1, 4):
            ProductionSchedule.objects.create(
                schedule_date=date.today() + timedelta(days=i + 1),
                product=self.product,
                planned_quantity=Decimal('100.00'),
                priority=i,
            )
        
        url = reverse('schedule-upcoming')
        response = self.client.get(url, {'days': 7})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
    
    def test_today_schedules_action(self):
        """Test getting today's schedules."""
        # Create a schedule for today
        ProductionSchedule.objects.create(
            schedule_date=date.today(),
            product=self.product,
            planned_quantity=Decimal('100.00'),
            priority=1,
        )
        
        url = reverse('schedule-today')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
