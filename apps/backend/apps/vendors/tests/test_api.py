import pytest
from rest_framework.test import APIClient
from rest_framework import status
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
        category='raw_material',
        status='active',
        contact_person='John Doe',
        phone='9876543210',
        email='john@testsupplier.com',
        billing_address='123 Test Street, Test City'
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


@pytest.mark.django_db
class TestVendorAPI:
    """Tests for Vendor API endpoints."""
    
    def test_list_vendors(self, authenticated_client, vendor):
        """Test listing vendors."""
        response = authenticated_client.get('/api/vendors/vendors/')
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) > 0
    
    def test_create_vendor(self, authenticated_client):
        """Test creating a vendor."""
        data = {
            'vendor_id': 'VEN-002',
            'company_name': 'New Supplier Co',
            'category': 'packaging',
            'status': 'active',
            'contact_person': 'Jane Smith',
            'phone': '9876543211',
            'email': 'jane@newsupplier.com',
            'billing_address': '456 New Street, New City',
            'credit_period_days': 45,
            'credit_limit': '150000.00'
        }
        
        response = authenticated_client.post('/api/vendors/vendors/', data)
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['vendor_id'] == 'VEN-002'
        assert response.data['company_name'] == 'New Supplier Co'
    
    def test_retrieve_vendor(self, authenticated_client, vendor):
        """Test retrieving a single vendor."""
        response = authenticated_client.get(f'/api/vendors/vendors/{vendor.id}/')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['vendor_id'] == 'VEN-001'
    
    def test_update_vendor(self, authenticated_client, vendor):
        """Test updating a vendor."""
        data = {
            'status': 'inactive',
            'rating': '4.50'
        }
        
        response = authenticated_client.patch(
            f'/api/vendors/vendors/{vendor.id}/',
            data
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'inactive'
    
    def test_vendor_purchase_orders_endpoint(self, authenticated_client, vendor, user):
        """Test vendor purchase orders endpoint."""
        # Create a PO for vendor
        PurchaseOrder.objects.create(
            po_number='PO202510220001',
            vendor=vendor,
            po_date=timezone.now().date(),
            expected_delivery_date=timezone.now().date(),
            status='approved',
            created_by=user,
            delivery_address='Test Address'
        )
        
        response = authenticated_client.get(
            f'/api/vendors/vendors/{vendor.id}/purchase_orders/'
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert 'purchase_orders' in response.data
        assert response.data['count'] > 0
    
    def test_vendor_stats_endpoint(self, authenticated_client, vendor):
        """Test vendor statistics endpoint."""
        response = authenticated_client.get(
            f'/api/vendors/vendors/{vendor.id}/stats/'
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert 'vendor_info' in response.data
        assert 'financial' in response.data
        assert 'purchase_orders' in response.data
        assert 'payments' in response.data


@pytest.mark.django_db
class TestPurchaseOrderAPI:
    """Tests for PurchaseOrder API endpoints."""
    
    def test_list_purchase_orders(self, authenticated_client, vendor, user):
        """Test listing purchase orders."""
        PurchaseOrder.objects.create(
            po_number='PO202510220001',
            vendor=vendor,
            po_date=timezone.now().date(),
            expected_delivery_date=timezone.now().date(),
            status='draft',
            created_by=user,
            delivery_address='Test Address'
        )
        
        response = authenticated_client.get('/api/vendors/purchase-orders/')
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) > 0
    
    def test_create_purchase_order(self, authenticated_client, vendor, inventory_item):
        """Test creating a purchase order with items."""
        data = {
            'vendor': vendor.id,
            'po_date': timezone.now().date().isoformat(),
            'expected_delivery_date': timezone.now().date().isoformat(),
            'delivery_address': 'Factory Warehouse',
            'items': [
                {
                    'item_name': 'Test Raw Material',
                    'quantity': '100.00',
                    'unit': 'kg',
                    'unit_price': '50.00',
                    'tax_percentage': '18.00',
                    'discount_percentage': '5.00',
                    'inventory_item': inventory_item.id
                },
                {
                    'item_name': 'Another Material',
                    'quantity': '50.00',
                    'unit': 'kg',
                    'unit_price': '80.00',
                    'tax_percentage': '18.00',
                    'discount_percentage': '0.00'
                }
            ]
        }
        
        response = authenticated_client.post(
            '/api/vendors/purchase-orders/',
            data,
            format='json'
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        assert 'po_number' in response.data
        assert response.data['po_number'].startswith('PO')
    
    def test_approve_purchase_order(self, authenticated_client, vendor, user):
        """Test approving a purchase order."""
        po = PurchaseOrder.objects.create(
            po_number='PO202510220001',
            vendor=vendor,
            po_date=timezone.now().date(),
            expected_delivery_date=timezone.now().date(),
            status='draft',
            created_by=user,
            delivery_address='Test Address'
        )
        
        response = authenticated_client.post(
            f'/api/vendors/purchase-orders/{po.id}/approve/'
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'approved'
        assert response.data['approved_by'] is not None
    
    def test_send_purchase_order(self, authenticated_client, vendor, user):
        """Test sending a purchase order."""
        po = PurchaseOrder.objects.create(
            po_number='PO202510220001',
            vendor=vendor,
            po_date=timezone.now().date(),
            expected_delivery_date=timezone.now().date(),
            status='approved',
            created_by=user,
            approved_by=user,
            approved_at=timezone.now(),
            delivery_address='Test Address'
        )
        
        response = authenticated_client.post(
            f'/api/vendors/purchase-orders/{po.id}/send/'
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'sent'
    
    def test_confirm_purchase_order(self, authenticated_client, vendor, user):
        """Test confirming a purchase order."""
        po = PurchaseOrder.objects.create(
            po_number='PO202510220001',
            vendor=vendor,
            po_date=timezone.now().date(),
            expected_delivery_date=timezone.now().date(),
            status='sent',
            created_by=user,
            delivery_address='Test Address'
        )
        
        response = authenticated_client.post(
            f'/api/vendors/purchase-orders/{po.id}/confirm/'
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'confirmed'
    
    def test_cancel_purchase_order(self, authenticated_client, vendor, user):
        """Test cancelling a purchase order."""
        po = PurchaseOrder.objects.create(
            po_number='PO202510220001',
            vendor=vendor,
            po_date=timezone.now().date(),
            expected_delivery_date=timezone.now().date(),
            status='draft',
            created_by=user,
            delivery_address='Test Address'
        )
        
        response = authenticated_client.post(
            f'/api/vendors/purchase-orders/{po.id}/cancel/'
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'cancelled'


@pytest.mark.django_db
class TestVendorPaymentAPI:
    """Tests for VendorPayment API endpoints."""
    
    def test_create_payment(self, authenticated_client, vendor):
        """Test creating a vendor payment."""
        data = {
            'vendor': vendor.id,
            'payment_date': timezone.now().date().isoformat(),
            'amount': '5000.00',
            'payment_method': 'bank_transfer',
            'status': 'completed',
            'transaction_reference': 'TXN123456'
        }
        
        response = authenticated_client.post(
            '/api/vendors/payments/',
            data
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        assert 'payment_id' in response.data
        assert response.data['payment_id'].startswith('VP')
    
    def test_list_payments(self, authenticated_client, vendor, user):
        """Test listing vendor payments."""
        VendorPayment.objects.create(
            payment_id='VP202510220001',
            vendor=vendor,
            payment_date=timezone.now().date(),
            amount=Decimal('5000.00'),
            payment_method='bank_transfer',
            status='completed',
            processed_by=user
        )
        
        response = authenticated_client.get('/api/vendors/payments/')
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) > 0


@pytest.mark.django_db
class TestGoodsReceiptNoteAPI:
    """Tests for GoodsReceiptNote API endpoints."""
    
    def test_create_grn(self, authenticated_client, vendor, user, inventory_item):
        """Test creating a GRN."""
        # Create PO with item
        po = PurchaseOrder.objects.create(
            po_number='PO202510220001',
            vendor=vendor,
            po_date=timezone.now().date(),
            expected_delivery_date=timezone.now().date(),
            status='confirmed',
            created_by=user,
            delivery_address='Test Address'
        )
        
        po_item = PurchaseOrderItem.objects.create(
            purchase_order=po,
            item_name='Test Item',
            quantity=Decimal('100.00'),
            unit='kg',
            unit_price=Decimal('50.00'),
            inventory_item=inventory_item
        )
        
        # Create GRN
        data = {
            'purchase_order': po.id,
            'receipt_date': timezone.now().date().isoformat(),
            'quality_status': 'approved',
            'items': [
                {
                    'po_item': po_item.id,
                    'ordered_quantity': '100.00',
                    'received_quantity': '100.00',
                    'accepted_quantity': '100.00',
                    'rejected_quantity': '0.00',
                    'quality_check_passed': True
                }
            ]
        }
        
        response = authenticated_client.post(
            '/api/vendors/grns/',
            data,
            format='json'
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        assert 'grn_number' in response.data
        assert response.data['grn_number'].startswith('GRN')
    
    def test_list_grns(self, authenticated_client, vendor, user):
        """Test listing GRNs."""
        po = PurchaseOrder.objects.create(
            po_number='PO202510220001',
            vendor=vendor,
            po_date=timezone.now().date(),
            expected_delivery_date=timezone.now().date(),
            status='confirmed',
            created_by=user,
            delivery_address='Test Address'
        )
        
        GoodsReceiptNote.objects.create(
            grn_number='GRN202510220001',
            purchase_order=po,
            receipt_date=timezone.now().date(),
            received_by=user,
            quality_status='approved'
        )
        
        response = authenticated_client.get('/api/vendors/grns/')
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) > 0


@pytest.mark.django_db
class TestVendorPermissions:
    """Tests for vendor API permissions."""
    
    def test_unauthenticated_access_denied(self, api_client):
        """Test that unauthenticated users cannot access vendor APIs."""
        response = api_client.get('/api/vendors/vendors/')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_authenticated_access_allowed(self, authenticated_client):
        """Test that authenticated users can access vendor APIs."""
        response = authenticated_client.get('/api/vendors/vendors/')
        
        assert response.status_code == status.HTTP_200_OK
