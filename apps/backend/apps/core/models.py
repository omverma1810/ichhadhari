"""
Core abstract models for the Ichhadhari Dairy Management System.

This module provides reusable abstract base models that can be inherited
by other models throughout the application.
"""

from django.db import models
from django.utils.translation import gettext_lazy as _


class TimeStampedModel(models.Model):
    """
    An abstract base model that provides self-managed 'created_at' and
    'updated_at' fields.
    
    This model should be inherited by any model that needs to track when
    records are created and updated.
    
    Attributes:
        created_at (DateTimeField): Timestamp when the record was created
        updated_at (DateTimeField): Timestamp when the record was last updated
    
    Example:
        class Vendor(TimeStampedModel):
            name = models.CharField(max_length=255)
            # Will automatically have created_at and updated_at fields
    """
    
    created_at = models.DateTimeField(
        _('created at'),
        auto_now_add=True,
        help_text=_('Timestamp when this record was created')
    )
    
    updated_at = models.DateTimeField(
        _('updated at'),
        auto_now=True,
        help_text=_('Timestamp when this record was last updated')
    )
    
    class Meta:
        abstract = True
        ordering = ['-created_at']
        get_latest_by = 'created_at'
    
    def save(self, *args, **kwargs):
        """
        Override save to perform any additional operations before saving.
        
        This can be extended by child classes to add custom validation
        or processing logic.
        """
        super().save(*args, **kwargs)


class SoftDeleteModel(models.Model):
    """
    An abstract base model that provides soft delete functionality.
    
    Instead of actually deleting records from the database, this model
    marks them as deleted by setting the 'deleted_at' field. This allows
    for potential recovery and maintains data integrity.
    
    Attributes:
        is_deleted (BooleanField): Whether the record is deleted
        deleted_at (DateTimeField): Timestamp when the record was deleted
    
    Example:
        class Product(SoftDeleteModel):
            name = models.CharField(max_length=255)
            # Can be soft-deleted instead of hard-deleted
    """
    
    is_deleted = models.BooleanField(
        _('is deleted'),
        default=False,
        help_text=_('Whether this record is soft-deleted')
    )
    
    deleted_at = models.DateTimeField(
        _('deleted at'),
        null=True,
        blank=True,
        help_text=_('Timestamp when this record was deleted')
    )
    
    class Meta:
        abstract = True
    
    def delete(self, using=None, keep_parents=False, soft=True):
        """
        Override delete to implement soft delete by default.
        
        Args:
            using: Database alias to use
            keep_parents: Whether to keep parent models
            soft (bool): If True, soft delete. If False, hard delete.
        """
        if soft:
            self.is_deleted = True
            from django.utils import timezone
            self.deleted_at = timezone.now()
            self.save()
        else:
            super().delete(using=using, keep_parents=keep_parents)
    
    def restore(self):
        """Restore a soft-deleted record."""
        self.is_deleted = False
        self.deleted_at = None
        self.save()


class UUIDModel(models.Model):
    """
    An abstract base model that uses UUID as the primary key.
    
    This is useful for distributed systems and when you don't want
    to expose sequential IDs.
    
    Attributes:
        id (UUIDField): UUID primary key
    
    Example:
        class Order(UUIDModel):
            # Will have UUID as primary key instead of integer
            customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    """
    
    import uuid
    
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text=_('Unique identifier for this record')
    )
    
    class Meta:
        abstract = True


class BaseModel(TimeStampedModel, SoftDeleteModel):
    """
    A comprehensive base model that combines timestamps and soft delete.
    
    This model provides both timestamp tracking and soft delete functionality.
    Most models in the application should inherit from this.
    
    Example:
        class Vendor(BaseModel):
            name = models.CharField(max_length=255)
            # Has created_at, updated_at, is_deleted, deleted_at
    """
    
    class Meta:
        abstract = True


class StatusChoices(models.TextChoices):
    """
    Common status choices that can be reused across different models.
    
    Example:
        class Vendor(models.Model):
            status = models.CharField(
                max_length=20,
                choices=StatusChoices.choices,
                default=StatusChoices.ACTIVE
            )
    """
    
    ACTIVE = 'active', _('Active')
    INACTIVE = 'inactive', _('Inactive')
    PENDING = 'pending', _('Pending')
    APPROVED = 'approved', _('Approved')
    REJECTED = 'rejected', _('Rejected')
    ARCHIVED = 'archived', _('Archived')


class AuditLog(models.Model):
    """
    Model to track all user actions in the system.
    
    Provides comprehensive audit trail for compliance and debugging.
    """
    
    ACTION_CHOICES = [
        ('create', 'Create'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('view', 'View'),
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('export', 'Export'),
        ('import', 'Import'),
    ]
    
    user = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs',
        help_text='User who performed the action'
    )
    
    action = models.CharField(
        max_length=20,
        choices=ACTION_CHOICES,
        help_text='Type of action performed'
    )
    
    model_name = models.CharField(
        max_length=50,
        help_text='Name of the model affected'
    )
    
    object_id = models.CharField(
        max_length=50,
        blank=True,
        help_text='ID of the object affected'
    )
    
    changes = models.JSONField(
        default=dict,
        blank=True,
        help_text='Details of changes made'
    )
    
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        help_text='IP address of the user'
    )
    
    user_agent = models.TextField(
        blank=True,
        help_text='User agent string from the request'
    )
    
    timestamp = models.DateTimeField(
        auto_now_add=True,
        help_text='When the action occurred'
    )
    
    class Meta:
        db_table = 'audit_logs'
        verbose_name = 'Audit Log'
        verbose_name_plural = 'Audit Logs'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['model_name', 'object_id']),
            models.Index(fields=['user', 'action']),
            models.Index(fields=['timestamp']),
            models.Index(fields=['action']),
        ]
    
    def __str__(self):
        """String representation of audit log."""
        user_str = self.user.username if self.user else 'Anonymous'
        return f"{user_str} - {self.action} - {self.model_name} - {self.timestamp}"
    
    @classmethod
    def log_action(cls, user, action, model_name, object_id=None, changes=None, 
                   ip_address=None, user_agent=None):
        """
        Convenience method to create an audit log entry.
        
        Args:
            user: User instance who performed the action
            action: Action type (create, update, delete, view)
            model_name: Name of the model affected
            object_id: ID of the object affected
            changes: Dictionary of changes made
            ip_address: IP address of the user
            user_agent: User agent string
        
        Returns:
            AuditLog instance
        """
        return cls.objects.create(
            user=user,
            action=action,
            model_name=model_name,
            object_id=str(object_id) if object_id else '',
            changes=changes or {},
            ip_address=ip_address,
            user_agent=user_agent
        )
