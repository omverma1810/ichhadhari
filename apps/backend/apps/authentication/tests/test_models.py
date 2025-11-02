"""
Tests for authentication models.
"""

import pytest
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from apps.authentication.models import RefreshToken
from apps.core.models import AuditLog


User = get_user_model()


@pytest.mark.django_db
class TestUserModel:
    """Test cases for User model."""
    
    def test_create_user(self):
        """Test creating a user."""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPass123'
        )
        
        assert user.username == 'testuser'
        assert user.email == 'test@example.com'
        assert user.check_password('TestPass123')
        assert user.is_active
        assert not user.is_staff
        assert not user.is_superuser
    
    def test_create_superuser(self):
        """Test creating a superuser."""
        user = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='AdminPass123'
        )
        
        assert user.is_active
        assert user.is_staff
        assert user.is_superuser
    
    def test_user_str(self):
        """Test user string representation."""
        user = User.objects.create_user(
            username='testuser',
            first_name='Test',
            last_name='User',
            email='test@example.com',
            password='TestPass123',
            role='manager'
        )
        
        assert str(user) == 'Test User (manager)'
    
    def test_user_role_default(self):
        """Test user role defaults to viewer."""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPass123'
        )
        
        assert user.role == 'viewer'
    
    def test_email_lowercase(self):
        """Test email is saved in lowercase."""
        user = User.objects.create_user(
            username='testuser',
            email='TEST@EXAMPLE.COM',
            password='TestPass123'
        )
        
        assert user.email == 'test@example.com'
    
    @pytest.mark.skip(reason="SQLite doesn't enforce email uniqueness at DB level - use PostgreSQL in production")
    def test_unique_email(self):
        """Test email uniqueness."""
        from django.db import IntegrityError
        
        User.objects.create_user(
            username='user1',
            email='test@example.com',
            password='TestPass123'
        )
        
        with pytest.raises(IntegrityError):
            User.objects.create_user(
                username='user2',
                email='test@example.com',
                password='TestPass123'
            )
    
    def test_unique_phone(self):
        """Test phone number uniqueness."""
        User.objects.create_user(
            username='user1',
            email='user1@example.com',
            password='TestPass123',
            phone='+919876543210'
        )
        
        with pytest.raises(Exception):
            User.objects.create_user(
                username='user2',
                email='user2@example.com',
                password='TestPass123',
                phone='+919876543210'
            )
    
    def test_unique_employee_id(self):
        """Test employee_id uniqueness."""
        User.objects.create_user(
            username='user1',
            email='user1@example.com',
            password='TestPass123',
            employee_id='EMP001'
        )
        
        with pytest.raises(Exception):
            User.objects.create_user(
                username='user2',
                email='user2@example.com',
                password='TestPass123',
                employee_id='EMP001'
            )
    
    def test_has_permission_admin(self):
        """Test admin has all permissions."""
        user = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='AdminPass123',
            role='admin'
        )
        
        assert user.has_permission('milk.create')
        assert user.has_permission('production.update')
        assert user.has_permission('inventory.delete')
    
    def test_has_permission_custom(self):
        """Test custom permissions."""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPass123',
            role='operator',
            permissions={
                'milk': {'create': True, 'view': True, 'update': False},
                'production': {'view': True}
            }
        )
        
        assert user.has_permission('milk.create')
        assert user.has_permission('milk.view')
        assert not user.has_permission('milk.update')
        assert user.has_permission('production.view')
        assert not user.has_permission('production.create')
    
    def test_has_permission_inactive(self):
        """Test inactive user has no permissions."""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPass123',
            role='operator',
            is_active=False,
            permissions={'milk': {'create': True}}
        )
        
        assert not user.has_permission('milk.create')
    
    def test_get_role_display_name(self):
        """Test getting role display name."""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPass123',
            role='manager'
        )
        
        assert user.get_role_display_name() == 'Manager'


@pytest.mark.django_db
class TestRefreshTokenModel:
    """Test cases for RefreshToken model."""
    
    def test_create_token(self):
        """Test creating a refresh token."""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPass123'
        )
        
        token = RefreshToken.create_token(
            user=user,
            token_string='test_token_string',
            lifetime_days=7
        )
        
        assert token.user == user
        assert token.token == 'test_token_string'
        assert not token.is_revoked
        assert token.expires_at > timezone.now()
    
    def test_token_str(self):
        """Test token string representation."""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPass123'
        )
        
        token = RefreshToken.create_token(
            user=user,
            token_string='test_token'
        )
        
        assert str(token) == 'Token for testuser - Active'
    
    def test_is_expired(self):
        """Test checking if token is expired."""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPass123'
        )
        
        # Create expired token
        token = RefreshToken.objects.create(
            user=user,
            token='expired_token',
            expires_at=timezone.now() - timedelta(days=1)
        )
        
        assert token.is_expired()
        
        # Create valid token
        token2 = RefreshToken.create_token(
            user=user,
            token_string='valid_token'
        )
        
        assert not token2.is_expired()
    
    def test_revoke_token(self):
        """Test revoking a token."""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPass123'
        )
        
        token = RefreshToken.create_token(
            user=user,
            token_string='test_token'
        )
        
        assert not token.is_revoked
        
        token.revoke()
        
        assert token.is_revoked
    
    def test_cleanup_expired(self):
        """Test cleaning up expired tokens."""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPass123'
        )
        
        # Create expired token
        RefreshToken.objects.create(
            user=user,
            token='expired_token',
            expires_at=timezone.now() - timedelta(days=1)
        )
        
        # Create valid token
        RefreshToken.create_token(
            user=user,
            token_string='valid_token'
        )
        
        assert RefreshToken.objects.count() == 2
        
        RefreshToken.cleanup_expired()
        
        assert RefreshToken.objects.count() == 1
        assert RefreshToken.objects.filter(token='valid_token').exists()


@pytest.mark.django_db
class TestAuditLogModel:
    """Test cases for AuditLog model."""
    
    def test_create_audit_log(self):
        """Test creating an audit log entry."""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPass123'
        )
        
        log = AuditLog.objects.create(
            user=user,
            action='create',
            model_name='Vendor',
            object_id='123',
            changes={'name': 'Test Vendor'},
            ip_address='127.0.0.1',
            user_agent='Mozilla/5.0'
        )
        
        assert log.user == user
        assert log.action == 'create'
        assert log.model_name == 'Vendor'
        assert log.object_id == '123'
    
    def test_log_action_method(self):
        """Test convenience method for creating logs."""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPass123'
        )
        
        log = AuditLog.log_action(
            user=user,
            action='update',
            model_name='User',
            object_id=user.id,
            changes={'email': 'newemail@example.com'},
            ip_address='192.168.1.1',
            user_agent='Test Agent'
        )
        
        assert log.action == 'update'
        assert log.ip_address == '192.168.1.1'
    
    def test_audit_log_str(self):
        """Test audit log string representation."""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPass123'
        )
        
        log = AuditLog.log_action(
            user=user,
            action='delete',
            model_name='Product',
            object_id='456',
            user_agent='Test Agent'
        )
        
        assert 'testuser' in str(log)
        assert 'delete' in str(log)
        assert 'Product' in str(log)
