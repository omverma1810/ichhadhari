"""
Tests for authentication API endpoints.
"""

import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from apps.authentication.models import RefreshToken


User = get_user_model()


@pytest.fixture
def api_client():
    """Return API client."""
    return APIClient()


@pytest.fixture
def create_user():
    """Factory fixture for creating users."""
    def _create_user(**kwargs):
        defaults = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'TestPass123',
            'role': 'viewer'
        }
        defaults.update(kwargs)
        password = defaults.pop('password')
        user = User.objects.create(**defaults)
        user.set_password(password)
        user.save()
        return user
    return _create_user


@pytest.mark.django_db
class TestRegistrationAPI:
    """Test cases for user registration API."""
    
    def test_register_user_success(self, api_client):
        """Test successful user registration."""
        url = reverse('authentication:register')
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'SecurePass123',
            'confirm_password': 'SecurePass123',
            'first_name': 'New',
            'last_name': 'User',
            'phone': '+919876543210',
            'role': 'operator',
            'department': 'Production'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert 'user' in response.data
        assert 'tokens' in response.data
        assert response.data['user']['username'] == 'newuser'
        assert response.data['user']['email'] == 'newuser@example.com'
        assert 'access' in response.data['tokens']
        assert 'refresh' in response.data['tokens']
        
        # Verify user created in database
        user = User.objects.get(username='newuser')
        assert user.email == 'newuser@example.com'
        assert user.check_password('SecurePass123')
    
    def test_register_missing_fields(self, api_client):
        """Test registration with missing required fields."""
        url = reverse('authentication:register')
        data = {
            'username': 'newuser'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'errors' in response.data
    
    def test_register_password_mismatch(self, api_client):
        """Test registration with mismatched passwords."""
        url = reverse('authentication:register')
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'SecurePass123',
            'confirm_password': 'DifferentPass123'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'errors' in response.data
    
    def test_register_weak_password(self, api_client):
        """Test registration with weak password."""
        url = reverse('authentication:register')
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'weak',
            'confirm_password': 'weak'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_register_duplicate_email(self, api_client, create_user):
        """Test registration with duplicate email."""
        create_user(email='existing@example.com')
        
        url = reverse('authentication:register')
        data = {
            'username': 'newuser',
            'email': 'existing@example.com',
            'password': 'SecurePass123',
            'confirm_password': 'SecurePass123'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_register_duplicate_username(self, api_client, create_user):
        """Test registration with duplicate username."""
        create_user(username='existinguser')
        
        url = reverse('authentication:register')
        data = {
            'username': 'existinguser',
            'email': 'new@example.com',
            'password': 'SecurePass123',
            'confirm_password': 'SecurePass123'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestLoginAPI:
    """Test cases for user login API."""
    
    def test_login_success(self, api_client, create_user):
        """Test successful login."""
        user = create_user(username='testuser', password='TestPass123')
        
        url = reverse('authentication:login')
        data = {
            'username': 'testuser',
            'password': 'TestPass123'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert 'user' in response.data
        assert 'tokens' in response.data
        assert response.data['user']['username'] == 'testuser'
        assert 'access' in response.data['tokens']
        assert 'refresh' in response.data['tokens']
    
    def test_login_with_email(self, api_client, create_user):
        """Test login with email instead of username."""
        user = create_user(
            username='testuser',
            email='test@example.com',
            password='TestPass123'
        )
        
        url = reverse('authentication:login')
        data = {
            'username': 'test@example.com',
            'password': 'TestPass123'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['user']['email'] == 'test@example.com'
    
    def test_login_invalid_credentials(self, api_client, create_user):
        """Test login with invalid credentials."""
        create_user(username='testuser', password='TestPass123')
        
        url = reverse('authentication:login')
        data = {
            'username': 'testuser',
            'password': 'WrongPassword'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_login_inactive_user(self, api_client, create_user):
        """Test login with inactive user."""
        user = create_user(
            username='testuser',
            password='TestPass123',
            is_active=False
        )
        
        url = reverse('authentication:login')
        data = {
            'username': 'testuser',
            'password': 'TestPass123'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_login_updates_last_login(self, api_client, create_user):
        """Test login updates last_login timestamp."""
        user = create_user(username='testuser', password='TestPass123')
        assert user.last_login is None
        
        url = reverse('authentication:login')
        data = {
            'username': 'testuser',
            'password': 'TestPass123'
        }
        
        response = api_client.post(url, data, format='json')
        
        user.refresh_from_db()
        assert user.last_login is not None
        assert user.last_login_ip is not None


@pytest.mark.django_db
class TestLogoutAPI:
    """Test cases for user logout API."""
    
    def test_logout_success(self, api_client, create_user):
        """Test successful logout."""
        user = create_user(username='testuser', password='TestPass123')
        api_client.force_authenticate(user=user)
        
        # Create refresh token
        token = RefreshToken.create_token(
            user=user,
            token_string='test_refresh_token'
        )
        
        url = reverse('authentication:logout')
        data = {
            'refresh': 'test_refresh_token'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        
        # Verify token is revoked
        token.refresh_from_db()
        assert token.is_revoked
    
    def test_logout_unauthenticated(self, api_client):
        """Test logout without authentication."""
        url = reverse('authentication:logout')
        data = {
            'refresh': 'some_token'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_logout_missing_token(self, api_client, create_user):
        """Test logout without refresh token."""
        user = create_user(username='testuser', password='TestPass123')
        api_client.force_authenticate(user=user)
        
        url = reverse('authentication:logout')
        data = {}
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestUserProfileAPI:
    """Test cases for user profile API."""
    
    def test_get_profile(self, api_client, create_user):
        """Test getting current user profile."""
        user = create_user(
            username='testuser',
            email='test@example.com',
            first_name='Test',
            last_name='User'
        )
        api_client.force_authenticate(user=user)
        
        url = reverse('authentication:me')
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert 'user' in response.data
        assert response.data['user']['username'] == 'testuser'
        assert response.data['user']['email'] == 'test@example.com'
    
    def test_get_profile_unauthenticated(self, api_client):
        """Test getting profile without authentication."""
        url = reverse('authentication:me')
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_update_profile(self, api_client, create_user):
        """Test updating user profile."""
        user = create_user(username='testuser', email='test@example.com')
        api_client.force_authenticate(user=user)
        
        url = reverse('authentication:me')
        data = {
            'first_name': 'Updated',
            'last_name': 'Name',
            'department': 'Finance'
        }
        
        response = api_client.patch(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        
        user.refresh_from_db()
        assert user.first_name == 'Updated'
        assert user.last_name == 'Name'
        assert user.department == 'Finance'
    
    def test_update_email(self, api_client, create_user):
        """Test updating user email."""
        user = create_user(username='testuser', email='old@example.com')
        api_client.force_authenticate(user=user)
        
        url = reverse('authentication:me')
        data = {
            'email': 'new@example.com'
        }
        
        response = api_client.patch(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        
        user.refresh_from_db()
        assert user.email == 'new@example.com'
    
    def test_update_duplicate_email(self, api_client, create_user):
        """Test updating to duplicate email fails."""
        create_user(username='user1', email='existing@example.com')
        user2 = create_user(username='user2', email='user2@example.com')
        api_client.force_authenticate(user=user2)
        
        url = reverse('authentication:me')
        data = {
            'email': 'existing@example.com'
        }
        
        response = api_client.patch(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestChangePasswordAPI:
    """Test cases for password change API."""
    
    def test_change_password_success(self, api_client, create_user):
        """Test successful password change."""
        user = create_user(username='testuser', password='OldPass123')
        api_client.force_authenticate(user=user)
        
        url = reverse('authentication:change-password')
        data = {
            'old_password': 'OldPass123',
            'new_password': 'NewPass456',
            'confirm_password': 'NewPass456'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        
        # Verify password changed
        user.refresh_from_db()
        assert user.check_password('NewPass456')
        assert not user.check_password('OldPass123')
    
    def test_change_password_wrong_old(self, api_client, create_user):
        """Test password change with wrong old password."""
        user = create_user(username='testuser', password='OldPass123')
        api_client.force_authenticate(user=user)
        
        url = reverse('authentication:change-password')
        data = {
            'old_password': 'WrongPass',
            'new_password': 'NewPass456',
            'confirm_password': 'NewPass456'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_change_password_mismatch(self, api_client, create_user):
        """Test password change with mismatched new passwords."""
        user = create_user(username='testuser', password='OldPass123')
        api_client.force_authenticate(user=user)
        
        url = reverse('authentication:change-password')
        data = {
            'old_password': 'OldPass123',
            'new_password': 'NewPass456',
            'confirm_password': 'DifferentPass789'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_change_password_same_as_old(self, api_client, create_user):
        """Test password change to same password fails."""
        user = create_user(username='testuser', password='SamePass123')
        api_client.force_authenticate(user=user)
        
        url = reverse('authentication:change-password')
        data = {
            'old_password': 'SamePass123',
            'new_password': 'SamePass123',
            'confirm_password': 'SamePass123'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_change_password_weak(self, api_client, create_user):
        """Test password change with weak password."""
        user = create_user(username='testuser', password='OldPass123')
        api_client.force_authenticate(user=user)
        
        url = reverse('authentication:change-password')
        data = {
            'old_password': 'OldPass123',
            'new_password': 'weak',
            'confirm_password': 'weak'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_change_password_unauthenticated(self, api_client):
        """Test password change without authentication."""
        url = reverse('authentication:change-password')
        data = {
            'old_password': 'OldPass123',
            'new_password': 'NewPass456',
            'confirm_password': 'NewPass456'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestPermissionCheck:
    """Test cases for permission checking."""
    
    def test_check_permission_admin(self, api_client, create_user):
        """Test admin has all permissions."""
        user = create_user(username='admin', role='admin')
        api_client.force_authenticate(user=user)
        
        url = reverse('authentication:check-permission')
        response = api_client.get(url, {'permission': 'milk.create'})
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['has_permission'] is True
    
    def test_check_permission_custom(self, api_client, create_user):
        """Test checking custom permissions."""
        user = create_user(
            username='operator',
            role='operator',
            permissions={
                'milk': {'create': True, 'view': True}
            }
        )
        api_client.force_authenticate(user=user)
        
        url = reverse('authentication:check-permission')
        
        # Has permission
        response = api_client.get(url, {'permission': 'milk.create'})
        assert response.data['has_permission'] is True
        
        # No permission
        response = api_client.get(url, {'permission': 'milk.delete'})
        assert response.data['has_permission'] is False
