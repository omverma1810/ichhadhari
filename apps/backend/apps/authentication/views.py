"""
Authentication views.

Handles user registration, login, logout, and profile management.
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.utils import timezone
from django.contrib.auth import login as django_login

from .models import User, RefreshToken as RefreshTokenModel
from apps.core.models import AuditLog
from .serializers import (
    UserRegistrationSerializer,
    UserSerializer,
    UserUpdateSerializer,
    UserLoginSerializer,
    ChangePasswordSerializer,
    CustomTokenObtainPairSerializer
)


def get_client_ip(request):
    """Extract client IP address from request."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def get_user_agent(request):
    """Extract user agent from request."""
    return request.META.get('HTTP_USER_AGENT', '')


def generate_tokens(user):
    """
    Generate JWT access and refresh tokens for user.
    
    Args:
        user: User instance
    
    Returns:
        dict: Contains 'access' and 'refresh' tokens
    """
    refresh = RefreshToken.for_user(user)
    
    # Add custom claims
    refresh['user_id'] = user.id
    refresh['username'] = user.username
    refresh['email'] = user.email
    refresh['role'] = user.role
    refresh['permissions'] = user.permissions
    
    return {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    Register a new user.
    
    POST /api/auth/register/
    
    Body:
        {
            "username": "johndoe",
            "email": "john@example.com",
            "password": "SecurePass123",
            "confirm_password": "SecurePass123",
            "first_name": "John",
            "last_name": "Doe",
            "phone": "+919876543210",
            "role": "viewer",
            "department": "Production"
        }
    
    Returns:
        201: User created successfully with tokens
        400: Validation error
    """
    serializer = UserRegistrationSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.save()
        
        # Generate JWT tokens
        tokens = generate_tokens(user)
        
        # Store refresh token in database
        RefreshTokenModel.create_token(
            user=user,
            token_string=tokens['refresh']
        )
        
        # Get client IP and user agent
        ip_address = get_client_ip(request)
        user_agent = get_user_agent(request)
        
        # Log the registration
        AuditLog.log_action(
            user=user,
            action='create',
            model_name='User',
            object_id=user.id,
            changes={'action': 'user_registration'},
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        # Prepare response
        user_data = UserSerializer(user).data
        
        return Response({
            'message': 'User registered successfully',
            'user': user_data,
            'tokens': tokens
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'message': 'Registration failed',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    Authenticate user and return JWT tokens.
    
    POST /api/auth/login/
    
    Body:
        {
            "username": "johndoe",  // or email
            "password": "SecurePass123"
        }
    
    Returns:
        200: Login successful with tokens
        400: Invalid credentials
    """
    serializer = UserLoginSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # Update last login time
        user.last_login = timezone.now()
        
        # Update last login IP
        ip_address = get_client_ip(request)
        user.last_login_ip = ip_address
        user.save(update_fields=['last_login', 'last_login_ip'])
        
        # Generate JWT tokens
        tokens = generate_tokens(user)
        
        # Store refresh token in database
        RefreshTokenModel.create_token(
            user=user,
            token_string=tokens['refresh']
        )
        
        # Get user agent
        user_agent = get_user_agent(request)
        
        # Log the login
        AuditLog.log_action(
            user=user,
            action='login',
            model_name='User',
            object_id=user.id,
            changes={'action': 'user_login'},
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        # Prepare response
        user_data = UserSerializer(user).data
        
        return Response({
            'message': 'Login successful',
            'user': user_data,
            'tokens': tokens
        }, status=status.HTTP_200_OK)
    
    return Response({
        'message': 'Login failed',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """
    Logout user by blacklisting refresh token.
    
    POST /api/auth/logout/
    
    Body:
        {
            "refresh": "refresh_token_string"
        }
    
    Returns:
        200: Logout successful
        400: Invalid token
    """
    try:
        refresh_token = request.data.get('refresh')
        
        if not refresh_token:
            return Response({
                'message': 'Refresh token is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Revoke the token in database
        try:
            token_obj = RefreshTokenModel.objects.get(token=refresh_token, user=request.user)
            token_obj.revoke()
        except RefreshTokenModel.DoesNotExist:
            pass  # Token not found in DB, but still try to blacklist
        
        # Blacklist the token
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError:
            pass  # Token already blacklisted or invalid
        
        # Get client IP and user agent
        ip_address = get_client_ip(request)
        user_agent = get_user_agent(request)
        
        # Log the logout
        AuditLog.log_action(
            user=request.user,
            action='logout',
            model_name='User',
            object_id=request.user.id,
            changes={'action': 'user_logout'},
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        return Response({
            'message': 'Logout successful'
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'message': 'Logout failed',
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def me(request):
    """
    Get or update current user profile.
    
    GET /api/auth/me/
    Returns current user data
    
    PATCH /api/auth/me/
    Body:
        {
            "first_name": "John",
            "last_name": "Doe",
            "email": "newemail@example.com",
            "phone": "+919876543210",
            "department": "Production"
        }
    
    Returns:
        200: User data
        400: Validation error
    """
    user = request.user
    
    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response({
            'user': serializer.data
        }, status=status.HTTP_200_OK)
    
    elif request.method == 'PATCH':
        # Get old data for audit log
        old_data = {
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'phone': user.phone,
            'department': user.department
        }
        
        serializer = UserUpdateSerializer(user, data=request.data, partial=True)
        
        if serializer.is_valid():
            updated_user = serializer.save()
            
            # Get new data
            new_data = {
                'first_name': updated_user.first_name,
                'last_name': updated_user.last_name,
                'email': updated_user.email,
                'phone': updated_user.phone,
                'department': updated_user.department
            }
            
            # Find changes
            changes = {
                'old': old_data,
                'new': new_data,
                'action': 'profile_update'
            }
            
            # Get client IP and user agent
            ip_address = get_client_ip(request)
            user_agent = get_user_agent(request)
            
            # Log the update
            AuditLog.log_action(
                user=updated_user,
                action='update',
                model_name='User',
                object_id=updated_user.id,
                changes=changes,
                ip_address=ip_address,
                user_agent=user_agent
            )
            
            return Response({
                'message': 'Profile updated successfully',
                'user': UserSerializer(updated_user).data
            }, status=status.HTTP_200_OK)
        
        return Response({
            'message': 'Update failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """
    Change user password.
    
    POST /api/auth/change-password/
    
    Body:
        {
            "old_password": "OldPass123",
            "new_password": "NewPass123",
            "confirm_password": "NewPass123"
        }
    
    Returns:
        200: Password changed successfully
        400: Validation error
    """
    serializer = ChangePasswordSerializer(
        data=request.data,
        context={'request': request}
    )
    
    if serializer.is_valid():
        serializer.save()
        
        # Get client IP and user agent
        ip_address = get_client_ip(request)
        user_agent = get_user_agent(request)
        
        # Log the password change
        AuditLog.log_action(
            user=request.user,
            action='update',
            model_name='User',
            object_id=request.user.id,
            changes={'action': 'password_change'},
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        return Response({
            'message': 'Password changed successfully'
        }, status=status.HTTP_200_OK)
    
    return Response({
        'message': 'Password change failed',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_permission(request):
    """
    Check if user has a specific permission.
    
    GET /api/auth/check-permission/?permission=milk.create
    
    Returns:
        200: Permission check result
    """
    permission = request.query_params.get('permission', '')
    
    if not permission:
        return Response({
            'message': 'Permission parameter is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    has_perm = request.user.has_permission(permission)
    
    return Response({
        'permission': permission,
        'has_permission': has_perm,
        'user_role': request.user.role
    }, status=status.HTTP_200_OK)
