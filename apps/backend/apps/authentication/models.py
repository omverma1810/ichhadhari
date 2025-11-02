"""
Authentication models for user management and token handling.
"""

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from datetime import timedelta
from apps.core.models import TimeStampedModel


class User(AbstractUser, TimeStampedModel):
    """
    Custom User model extending Django's AbstractUser.
    
    Adds additional fields for role-based access control, employee management,
    and audit tracking.
    """
    
    ROLE_CHOICES = [
        ('admin', 'Administrator'),
        ('manager', 'Manager'),
        ('supervisor', 'Supervisor'),
        ('operator', 'Operator'),
        ('viewer', 'Viewer'),
        ('finance', 'Finance'),
        ('hr', 'Human Resources'),
    ]
    
    # Contact Information
    phone = models.CharField(
        max_length=15,
        unique=True,
        null=True,
        blank=True,
        help_text='Phone number with country code'
    )
    
    # Employee Information
    employee_id = models.CharField(
        max_length=20,
        unique=True,
        null=True,
        blank=True,
        help_text='Unique employee identifier'
    )
    
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='viewer',
        help_text='User role determines access level'
    )
    
    department = models.CharField(
        max_length=50,
        blank=True,
        help_text='Department the user belongs to'
    )
    
    # Profile
    profile_picture = models.ImageField(
        upload_to='profiles/',
        null=True,
        blank=True,
        help_text='User profile picture'
    )
    
    # Audit Fields
    last_login_ip = models.GenericIPAddressField(
        null=True,
        blank=True,
        help_text='IP address of last login'
    )
    
    # Custom Permissions (stored as JSON)
    permissions = models.JSONField(
        default=dict,
        blank=True,
        help_text='Custom permissions dictionary'
    )
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-date_joined']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['phone']),
            models.Index(fields=['employee_id']),
            models.Index(fields=['role']),
        ]
    
    def __str__(self):
        """String representation of user."""
        full_name = self.get_full_name()
        if full_name:
            return f"{full_name} ({self.role})"
        return f"{self.username} ({self.role})"
    
    def has_permission(self, permission: str) -> bool:
        """
        Check if user has a specific permission.
        
        Args:
            permission: Permission string to check (e.g., 'milk.create')
        
        Returns:
            bool: True if user has permission, False otherwise
        """
        # Admins have all permissions
        if self.role == 'admin':
            return True
        
        # Check if user is active
        if not self.is_active:
            return False
        
        # Check custom permissions
        if not self.permissions:
            return False
        
        # Split permission into module and action
        try:
            module, action = permission.split('.')
            module_perms = self.permissions.get(module, {})
            return module_perms.get(action, False)
        except (ValueError, AttributeError):
            return False
    
    def get_role_display_name(self):
        """Get human-readable role name."""
        return dict(self.ROLE_CHOICES).get(self.role, self.role)
    
    def save(self, *args, **kwargs):
        """Override save to ensure email is lowercase."""
        if self.email:
            self.email = self.email.lower()
        super().save(*args, **kwargs)


class RefreshToken(models.Model):
    """
    Model to track JWT refresh tokens for logout functionality.
    
    Allows tokens to be revoked before their natural expiry.
    """
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='refresh_tokens',
        help_text='User this token belongs to'
    )
    
    token = models.CharField(
        max_length=255,
        unique=True,
        help_text='The refresh token string'
    )
    
    is_revoked = models.BooleanField(
        default=False,
        help_text='Whether this token has been revoked'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text='When the token was created'
    )
    
    expires_at = models.DateTimeField(
        help_text='When the token expires'
    )
    
    class Meta:
        db_table = 'refresh_tokens'
        verbose_name = 'Refresh Token'
        verbose_name_plural = 'Refresh Tokens'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['token']),
            models.Index(fields=['user', 'is_revoked']),
            models.Index(fields=['expires_at']),
        ]
    
    def __str__(self):
        """String representation of token."""
        return f"Token for {self.user.username} - {'Revoked' if self.is_revoked else 'Active'}"
    
    def is_expired(self):
        """Check if token has expired."""
        return timezone.now() > self.expires_at
    
    def revoke(self):
        """Revoke this token."""
        self.is_revoked = True
        self.save(update_fields=['is_revoked'])
    
    @classmethod
    def create_token(cls, user, token_string, lifetime_days=7):
        """
        Create a new refresh token.
        
        Args:
            user: User instance
            token_string: The token string
            lifetime_days: Number of days until expiry
        
        Returns:
            RefreshToken instance
        """
        expires_at = timezone.now() + timedelta(days=lifetime_days)
        return cls.objects.create(
            user=user,
            token=token_string,
            expires_at=expires_at
        )
    
    @classmethod
    def cleanup_expired(cls):
        """Delete expired tokens (can be run as a periodic task)."""
        cls.objects.filter(expires_at__lt=timezone.now()).delete()
