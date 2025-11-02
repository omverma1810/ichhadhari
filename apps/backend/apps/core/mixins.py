"""
Reusable mixins for Django models and viewsets.

This module provides mixins that add common functionality to models
and viewsets, promoting code reuse and consistency.
"""

from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from typing import Any, Optional


class UserTrackingMixin(models.Model):
    """
    Mixin that tracks which user created and last modified a record.
    
    Adds created_by and updated_by fields to track user actions.
    
    Attributes:
        created_by (ForeignKey): User who created the record
        updated_by (ForeignKey): User who last updated the record
    
    Example:
        class Vendor(UserTrackingMixin, models.Model):
            name = models.CharField(max_length=255)
            # Automatically tracks created_by and updated_by
    """
    
    created_by = models.ForeignKey(
        get_user_model(),
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='%(class)s_created',
        verbose_name='Created by',
        help_text='User who created this record'
    )
    
    updated_by = models.ForeignKey(
        get_user_model(),
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='%(class)s_updated',
        verbose_name='Updated by',
        help_text='User who last updated this record'
    )
    
    class Meta:
        abstract = True


class ActiveModelMixin(models.Model):
    """
    Mixin that adds an active/inactive status to models.
    
    Provides is_active field and methods to activate/deactivate records.
    
    Attributes:
        is_active (BooleanField): Whether the record is active
    
    Example:
        class Product(ActiveModelMixin, models.Model):
            name = models.CharField(max_length=255)
            # Can be activated/deactivated
    """
    
    is_active = models.BooleanField(
        default=True,
        verbose_name='Is active',
        help_text='Whether this record is active'
    )
    
    class Meta:
        abstract = True
    
    def activate(self) -> None:
        """Activate this record."""
        self.is_active = True
        self.save(update_fields=['is_active'])
    
    def deactivate(self) -> None:
        """Deactivate this record."""
        self.is_active = False
        self.save(update_fields=['is_active'])


class BulkActionsMixin:
    """
    Mixin for viewsets that adds bulk action endpoints.
    
    Provides endpoints for bulk delete, bulk update, and bulk activate/deactivate.
    
    Example:
        class VendorViewSet(BulkActionsMixin, viewsets.ModelViewSet):
            # Inherits bulk_delete, bulk_activate, etc.
    """
    
    @action(detail=False, methods=['post'])
    def bulk_delete(self, request) -> Response:
        """
        Bulk delete multiple records.
        
        Expected payload:
            {
                "ids": [1, 2, 3, 4]
            }
        """
        ids = request.data.get('ids', [])
        if not ids:
            return Response(
                {'error': 'No IDs provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset().filter(id__in=ids)
        count = queryset.count()
        queryset.delete()
        
        return Response(
            {'message': f'{count} records deleted successfully'},
            status=status.HTTP_204_NO_CONTENT
        )
    
    @action(detail=False, methods=['post'])
    def bulk_activate(self, request) -> Response:
        """
        Bulk activate multiple records.
        
        Expected payload:
            {
                "ids": [1, 2, 3, 4]
            }
        """
        ids = request.data.get('ids', [])
        if not ids:
            return Response(
                {'error': 'No IDs provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset().filter(id__in=ids)
        count = queryset.update(is_active=True)
        
        return Response(
            {'message': f'{count} records activated successfully'},
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['post'])
    def bulk_deactivate(self, request) -> Response:
        """
        Bulk deactivate multiple records.
        
        Expected payload:
            {
                "ids": [1, 2, 3, 4]
            }
        """
        ids = request.data.get('ids', [])
        if not ids:
            return Response(
                {'error': 'No IDs provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset().filter(id__in=ids)
        count = queryset.update(is_active=False)
        
        return Response(
            {'message': f'{count} records deactivated successfully'},
            status=status.HTTP_200_OK
        )


class ExportMixin:
    """
    Mixin for viewsets that adds export functionality.
    
    Provides an endpoint to export data in various formats (CSV, Excel).
    
    Example:
        class VendorViewSet(ExportMixin, viewsets.ModelViewSet):
            # Inherits export endpoint
    """
    
    @action(detail=False, methods=['get'])
    def export(self, request) -> Response:
        """
        Export data to CSV or Excel format.
        
        Query parameters:
            format: 'csv' or 'excel' (default: csv)
        """
        export_format = request.query_params.get('format', 'csv')
        queryset = self.filter_queryset(self.get_queryset())
        
        if export_format == 'csv':
            # Implementation would use csv module or pandas
            return Response(
                {'message': 'CSV export not yet implemented'},
                status=status.HTTP_501_NOT_IMPLEMENTED
            )
        elif export_format == 'excel':
            # Implementation would use openpyxl or xlsxwriter
            return Response(
                {'message': 'Excel export not yet implemented'},
                status=status.HTTP_501_NOT_IMPLEMENTED
            )
        else:
            return Response(
                {'error': 'Invalid format. Use csv or excel'},
                status=status.HTTP_400_BAD_REQUEST
            )


class AuditMixin(models.Model):
    """
    Mixin that adds comprehensive audit trail fields.
    
    Combines timestamp tracking, user tracking, and IP address tracking.
    
    Attributes:
        created_at: When record was created
        updated_at: When record was last updated
        created_by: User who created
        updated_by: User who last updated
        created_ip: IP address of creator
        updated_ip: IP address of last updater
    
    Example:
        class SensitiveData(AuditMixin, models.Model):
            # Full audit trail automatically tracked
    """
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    created_by = models.ForeignKey(
        get_user_model(),
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='%(class)s_created'
    )
    
    updated_by = models.ForeignKey(
        get_user_model(),
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='%(class)s_updated'
    )
    
    created_ip = models.GenericIPAddressField(null=True, blank=True)
    updated_ip = models.GenericIPAddressField(null=True, blank=True)
    
    class Meta:
        abstract = True


class SoftDeleteQuerySet(models.QuerySet):
    """
    Custom QuerySet for soft delete functionality.
    
    Provides methods to filter active/deleted records and restore them.
    """
    
    def active(self):
        """Return only non-deleted records."""
        return self.filter(is_deleted=False)
    
    def deleted(self):
        """Return only deleted records."""
        return self.filter(is_deleted=True)
    
    def delete(self):
        """Soft delete all records in queryset."""
        return self.update(is_deleted=True, deleted_at=timezone.now())
    
    def hard_delete(self):
        """Permanently delete all records in queryset."""
        return super().delete()
    
    def restore(self):
        """Restore all soft-deleted records in queryset."""
        return self.update(is_deleted=False, deleted_at=None)


class SoftDeleteManager(models.Manager):
    """
    Custom Manager for soft delete functionality.
    
    Automatically filters out soft-deleted records unless explicitly requested.
    
    Example:
        class Product(models.Model):
            objects = SoftDeleteManager()
            all_objects = models.Manager()  # To access deleted items
    """
    
    def get_queryset(self):
        """Return only non-deleted records by default."""
        return SoftDeleteQuerySet(self.model, using=self._db).active()
    
    def deleted(self):
        """Return only deleted records."""
        return SoftDeleteQuerySet(self.model, using=self._db).deleted()
    
    def with_deleted(self):
        """Return all records including deleted ones."""
        return SoftDeleteQuerySet(self.model, using=self._db)
