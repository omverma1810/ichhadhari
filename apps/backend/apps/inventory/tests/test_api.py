import pytest
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal
from apps.inventory.models import (
    InventoryItem, StockTransaction, StockAlert
)

User = get_user_model()


@pytest.fixture
def api_client():
    """Create API client."""
    return APIClient()


@pytest.fixture
def authenticated_client(db, user):
    """Create authenticated API client."""
    client = APIClient()
    client.force_authenticate(user=user)
    return client


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


@pytest.mark.django_db
class TestInventoryItemAPI:
    """Tests for InventoryItem API endpoints."""
    
    def test_list_inventory_items(self, authenticated_client, inventory_item):
        """Test listing inventory items."""
        response = authenticated_client.get('/api/inventory/items/')
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) > 0
    
    def test_create_inventory_item(self, authenticated_client):
        """Test creating an inventory item."""
        data = {
            'item_id': 'TEST-002',
            'name': 'New Test Item',
            'item_type': 'raw_material',
            'unit': 'kg',
            'cost_per_unit': '75.00',
            'current_stock': '150.00',
            'min_stock_level': '25.00',
            'max_stock_level': '250.00',
            'reorder_point': '40.00',
        }
        
        response = authenticated_client.post('/api/inventory/items/', data)
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['item_id'] == 'TEST-002'
        assert response.data['name'] == 'New Test Item'
    
    def test_retrieve_inventory_item(self, authenticated_client, inventory_item):
        """Test retrieving a single inventory item."""
        response = authenticated_client.get(
            f'/api/inventory/items/{inventory_item.id}/'
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['item_id'] == 'TEST-001'
    
    def test_update_inventory_item(self, authenticated_client, inventory_item):
        """Test updating an inventory item."""
        data = {
            'name': 'Updated Test Item',
            'min_stock_level': '30.00'
        }
        
        response = authenticated_client.patch(
            f'/api/inventory/items/{inventory_item.id}/',
            data
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['name'] == 'Updated Test Item'
    
    def test_low_stock_endpoint(self, authenticated_client):
        """Test low stock items endpoint."""
        # Create item with low stock
        InventoryItem.objects.create(
            item_id='LOW-001',
            name='Low Stock Item',
            item_type='raw_material',
            unit='kg',
            current_stock=Decimal('5.00'),
            min_stock_level=Decimal('20.00'),
        )
        
        response = authenticated_client.get('/api/inventory/items/low_stock/')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] > 0
    
    def test_stock_levels_endpoint(self, authenticated_client, inventory_item):
        """Test stock levels summary endpoint."""
        response = authenticated_client.get('/api/inventory/items/stock_levels/')
        
        assert response.status_code == status.HTTP_200_OK
        assert 'total_items' in response.data
        assert 'items' in response.data
    
    def test_transaction_history_endpoint(self, authenticated_client, inventory_item, user):
        """Test transaction history endpoint."""
        # Create some transactions
        StockTransaction.objects.create(
            transaction_id='ST202410220001',
            item=inventory_item,
            transaction_type='purchase',
            transaction_date=timezone.now(),
            quantity=Decimal('50.00'),
            is_addition=True,
            stock_before=Decimal('100.00'),
            stock_after=Decimal('150.00'),
            unit_cost=Decimal('50.00'),
            total_cost=Decimal('2500.00'),
            performed_by=user
        )
        
        response = authenticated_client.get(
            f'/api/inventory/items/{inventory_item.id}/transaction_history/'
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert 'transactions' in response.data
        assert len(response.data['transactions']) > 0


@pytest.mark.django_db
class TestStockTransactionAPI:
    """Tests for StockTransaction API endpoints."""
    
    def test_list_transactions(self, authenticated_client, inventory_item, user):
        """Test listing stock transactions."""
        StockTransaction.objects.create(
            transaction_id='ST202410220001',
            item=inventory_item,
            transaction_type='purchase',
            transaction_date=timezone.now(),
            quantity=Decimal('50.00'),
            is_addition=True,
            stock_before=Decimal('100.00'),
            stock_after=Decimal('150.00'),
            unit_cost=Decimal('50.00'),
            total_cost=Decimal('2500.00'),
            performed_by=user
        )
        
        response = authenticated_client.get('/api/inventory/transactions/')
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) > 0
    
    def test_create_transaction(self, authenticated_client, inventory_item):
        """Test creating a stock transaction."""
        data = {
            'item': inventory_item.id,
            'transaction_type': 'purchase',
            'transaction_date': timezone.now().isoformat(),
            'quantity': '50.00',
            'is_addition': True,
            'unit_cost': '50.00',
        }
        
        response = authenticated_client.post('/api/inventory/transactions/', data)
        
        assert response.status_code == status.HTTP_201_CREATED
        assert 'transaction_id' in response.data
        assert response.data['stock_after'] is not None
    
    def test_transaction_stats_endpoint(self, authenticated_client, inventory_item, user):
        """Test transaction statistics endpoint."""
        # Create some transactions
        StockTransaction.objects.create(
            transaction_id='ST202410220001',
            item=inventory_item,
            transaction_type='purchase',
            transaction_date=timezone.now(),
            quantity=Decimal('50.00'),
            is_addition=True,
            stock_before=Decimal('100.00'),
            stock_after=Decimal('150.00'),
            unit_cost=Decimal('50.00'),
            total_cost=Decimal('2500.00'),
            performed_by=user
        )
        
        response = authenticated_client.get('/api/inventory/transactions/stats/')
        
        assert response.status_code == status.HTTP_200_OK
        assert 'total_transactions' in response.data
        assert 'total_in' in response.data
        assert 'total_out' in response.data
        assert 'by_type' in response.data


@pytest.mark.django_db
class TestStockAlertAPI:
    """Tests for StockAlert API endpoints."""
    
    def test_list_alerts(self, authenticated_client, inventory_item):
        """Test listing stock alerts."""
        StockAlert.objects.create(
            item=inventory_item,
            alert_type='low_stock',
            message='Low stock alert'
        )
        
        response = authenticated_client.get('/api/inventory/alerts/')
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) > 0
    
    def test_acknowledge_alert(self, authenticated_client, inventory_item):
        """Test acknowledging an alert."""
        alert = StockAlert.objects.create(
            item=inventory_item,
            alert_type='low_stock',
            message='Low stock alert',
            status='active'
        )
        
        response = authenticated_client.post(
            f'/api/inventory/alerts/{alert.id}/acknowledge/'
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'acknowledged'
    
    def test_resolve_alert(self, authenticated_client, inventory_item):
        """Test resolving an alert."""
        alert = StockAlert.objects.create(
            item=inventory_item,
            alert_type='low_stock',
            message='Low stock alert',
            status='acknowledged'
        )
        
        response = authenticated_client.post(
            f'/api/inventory/alerts/{alert.id}/resolve/'
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'resolved'
    
    def test_cannot_acknowledge_non_active_alert(self, authenticated_client, inventory_item):
        """Test that non-active alerts cannot be acknowledged."""
        alert = StockAlert.objects.create(
            item=inventory_item,
            alert_type='low_stock',
            message='Low stock alert',
            status='resolved'
        )
        
        response = authenticated_client.post(
            f'/api/inventory/alerts/{alert.id}/acknowledge/'
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestInventoryPermissions:
    """Tests for inventory API permissions."""
    
    def test_unauthenticated_access_denied(self, api_client):
        """Test that unauthenticated users cannot access inventory."""
        response = api_client.get('/api/inventory/items/')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_authenticated_access_allowed(self, authenticated_client):
        """Test that authenticated users can access inventory."""
        response = authenticated_client.get('/api/inventory/items/')
        
        assert response.status_code == status.HTTP_200_OK
