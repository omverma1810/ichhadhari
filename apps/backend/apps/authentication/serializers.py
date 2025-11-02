"""
Serializers for authentication app.

Handles serialization and validation of user data, authentication, and tokens.
"""

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.validators import EmailValidator, RegexValidator
from .models import User
import re


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    
    Handles user creation with password validation and hashing.
    """
    
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        help_text='Password must be at least 8 characters'
    )
    
    confirm_password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        help_text='Must match password'
    )
    
    phone = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
        validators=[
            RegexValidator(
                regex=r'^\+?1?\d{9,15}$',
                message='Phone number must be entered in the format: "+999999999". Up to 15 digits allowed.'
            )
        ]
    )
    
    email = serializers.EmailField(
        required=True,
        validators=[EmailValidator()]
    )
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password', 'confirm_password',
            'first_name', 'last_name', 'phone', 'role', 'department',
            'employee_id'
        ]
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
            'employee_id': {'required': False},
            'department': {'required': False},
        }
    
    def validate_email(self, value):
        """Validate email is unique and properly formatted."""
        value = value.lower()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def validate_username(self, value):
        """Validate username is unique and meets requirements."""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        
        # Username must be alphanumeric with optional underscores/hyphens
        if not re.match(r'^[\w-]+$', value):
            raise serializers.ValidationError(
                "Username can only contain letters, numbers, underscores, and hyphens."
            )
        
        return value
    
    def validate_employee_id(self, value):
        """Validate employee_id is unique if provided."""
        if value and User.objects.filter(employee_id=value).exists():
            raise serializers.ValidationError("A user with this employee ID already exists.")
        return value
    
    def validate_phone(self, value):
        """Validate phone is unique if provided."""
        if value and User.objects.filter(phone=value).exists():
            raise serializers.ValidationError("A user with this phone number already exists.")
        return value
    
    def validate_password(self, value):
        """Validate password meets strength requirements."""
        # Use Django's built-in password validators
        validate_password(value)
        
        # Additional custom validation
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter.")
        
        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError("Password must contain at least one lowercase letter.")
        
        if not re.search(r'\d', value):
            raise serializers.ValidationError("Password must contain at least one digit.")
        
        return value
    
    def validate(self, attrs):
        """Validate that passwords match."""
        if attrs.get('password') != attrs.get('confirm_password'):
            raise serializers.ValidationError({
                'confirm_password': "Passwords do not match."
            })
        return attrs
    
    def create(self, validated_data):
        """Create user with hashed password."""
        # Remove confirm_password from validated data
        validated_data.pop('confirm_password', None)
        
        # Extract password
        password = validated_data.pop('password')
        
        # Create user
        user = User.objects.create(**validated_data)
        
        # Set password (this hashes it)
        user.set_password(password)
        user.save()
        
        return user


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for user data (excluding password).
    
    Used for retrieving and updating user information.
    """
    
    full_name = serializers.SerializerMethodField()
    role_display = serializers.CharField(source='get_role_display_name', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'phone', 'role', 'role_display', 'department', 'employee_id',
            'profile_picture', 'is_active', 'last_login', 'last_login_ip',
            'date_joined', 'created_at', 'updated_at', 'permissions'
        ]
        read_only_fields = [
            'id', 'date_joined', 'created_at', 'updated_at', 'last_login',
            'last_login_ip', 'full_name', 'role_display'
        ]
    
    def get_full_name(self, obj):
        """Get user's full name."""
        return obj.get_full_name() or obj.username


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user profile.
    
    Allows users to update their own information (excluding role and permissions).
    """
    
    email = serializers.EmailField(
        required=False,
        validators=[EmailValidator()]
    )
    
    phone = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
        validators=[
            RegexValidator(
                regex=r'^\+?1?\d{9,15}$',
                message='Phone number must be entered in the format: "+999999999". Up to 15 digits allowed.'
            )
        ]
    )
    
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'email', 'phone', 'department', 'profile_picture'
        ]
    
    def validate_email(self, value):
        """Validate email is unique."""
        value = value.lower()
        user = self.instance
        if User.objects.filter(email=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def validate_phone(self, value):
        """Validate phone is unique if provided."""
        if value:
            user = self.instance
            if User.objects.filter(phone=value).exclude(pk=user.pk).exists():
                raise serializers.ValidationError("A user with this phone number already exists.")
        return value


class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user login.
    
    Accepts username/email and password for authentication.
    """
    
    username = serializers.CharField(
        required=True,
        help_text='Username or email address'
    )
    
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        """Validate credentials and authenticate user."""
        username = attrs.get('username')
        password = attrs.get('password')
        
        if not username or not password:
            raise serializers.ValidationError("Must include username and password.")
        
        # Try to authenticate with username or email
        user = None
        
        # Check if username is an email
        if '@' in username:
            try:
                user_obj = User.objects.get(email=username.lower())
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                pass
        else:
            user = authenticate(username=username, password=password)
        
        if not user:
            raise serializers.ValidationError("Invalid credentials.")
        
        if not user.is_active:
            raise serializers.ValidationError("User account is disabled.")
        
        attrs['user'] = user
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for changing user password.
    
    Requires old password and validates new password.
    """
    
    old_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    confirm_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate_old_password(self, value):
        """Validate old password is correct."""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value
    
    def validate_new_password(self, value):
        """Validate new password meets strength requirements."""
        # Use Django's built-in password validators
        validate_password(value)
        
        # Additional custom validation
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter.")
        
        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError("Password must contain at least one lowercase letter.")
        
        if not re.search(r'\d', value):
            raise serializers.ValidationError("Password must contain at least one digit.")
        
        return value
    
    def validate(self, attrs):
        """Validate that new passwords match and is different from old."""
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({
                'confirm_password': "New passwords do not match."
            })
        
        if attrs['old_password'] == attrs['new_password']:
            raise serializers.ValidationError({
                'new_password': "New password must be different from old password."
            })
        
        return attrs
    
    def save(self):
        """Save new password."""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT token serializer.
    
    Adds custom claims to the token payload.
    """
    
    @classmethod
    def get_token(cls, user):
        """Add custom claims to token."""
        token = super().get_token(user)
        
        # Add custom claims
        token['user_id'] = user.id
        token['username'] = user.username
        token['email'] = user.email
        token['role'] = user.role
        token['permissions'] = user.permissions
        token['full_name'] = user.get_full_name() or user.username
        
        return token
    
    def validate(self, attrs):
        """Validate and add user data to response."""
        data = super().validate(attrs)
        
        # Add user data to response
        data['user'] = UserSerializer(self.user).data
        
        return data
