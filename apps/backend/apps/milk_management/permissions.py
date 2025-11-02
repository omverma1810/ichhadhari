"""
Custom permissions for Milk Management System
"""

from rest_framework import permissions


class MilkManagementPermission(permissions.BasePermission):
    """
    Custom permission class for milk management operations.
    
    Checks if the user has appropriate permissions for milk management
    based on their role and assigned permissions.
    """
    
    def has_permission(self, request, view):
        """
        Check if the user has permission to access the view.
        
        Args:
            request: The HTTP request
            view: The view being accessed
            
        Returns:
            bool: True if user has permission, False otherwise
        """
        # Unauthenticated users have no access
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Superusers and admins have full access
        if request.user.is_superuser or request.user.role == 'admin':
            return True
        
        # Check for specific permissions
        if request.method in permissions.SAFE_METHODS:
            # Read operations
            return request.user.has_permission('milk_management.view')
        else:
            # Write operations
            return request.user.has_permission('milk_management.manage')
    
    def has_object_permission(self, request, view, obj):
        """
        Check if the user has permission to access a specific object.
        
        Args:
            request: The HTTP request
            view: The view being accessed
            obj: The object being accessed
            
        Returns:
            bool: True if user has permission, False otherwise
        """
        # Same logic as has_permission for now
        return self.has_permission(request, view)
