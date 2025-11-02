"""
Custom permission classes for the Ichhadhari Dairy Management System.

This module provides reusable permission classes for controlling access
to API endpoints based on user roles and module-specific permissions.
"""

from rest_framework import permissions
from typing import Any


class IsAdminOrManager(permissions.BasePermission):
    """
    Permission class that allows access only to admin or manager users.
    
    This permission checks if the user has either 'admin' or 'manager' role.
    Use this for endpoints that require elevated privileges.
    
    Example:
        class VendorViewSet(viewsets.ModelViewSet):
            permission_classes = [IsAdminOrManager]
    """
    
    message = 'Only administrators and managers can perform this action.'
    
    def has_permission(self, request, view) -> bool:
        """
        Check if user has admin or manager role.
        
        Args:
            request: The incoming request
            view: The view being accessed
            
        Returns:
            bool: True if user is admin or manager, False otherwise
        """
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if user has role attribute (custom user model)
        if hasattr(request.user, 'role'):
            return request.user.role in ['admin', 'manager']
        
        # Fallback to staff status
        return request.user.is_staff or request.user.is_superuser


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permission class that allows owners to edit, but others only to read.
    
    Object-level permission that allows:
    - Read operations (GET, HEAD, OPTIONS) for all authenticated users
    - Write operations (POST, PUT, PATCH, DELETE) only for the owner
    
    Example:
        class ProfileViewSet(viewsets.ModelViewSet):
            permission_classes = [IsOwnerOrReadOnly]
    """
    
    message = 'You must be the owner to modify this resource.'
    
    def has_object_permission(self, request, view, obj) -> bool:
        """
        Check if user is owner for write operations.
        
        Args:
            request: The incoming request
            view: The view being accessed
            obj: The object being accessed
            
        Returns:
            bool: True if allowed, False otherwise
        """
        # Read permissions are allowed for any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only for the owner
        # Assumes the object has a 'user' or 'owner' attribute
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'owner'):
            return obj.owner == request.user
        elif hasattr(obj, 'created_by'):
            return obj.created_by == request.user
        
        return False


class HasModulePermission(permissions.BasePermission):
    """
    Base permission class for module-specific permissions.
    
    This is a base class that should be inherited by specific module
    permission classes. It provides a framework for checking permissions
    based on user roles and specific module access.
    
    Attributes:
        module_name (str): Name of the module (e.g., 'milk', 'production')
        required_roles (list): List of roles that have access
    """
    
    module_name = None
    required_roles = ['admin', 'manager']
    
    def has_permission(self, request, view) -> bool:
        """
        Check if user has permission for the module.
        
        Args:
            request: The incoming request
            view: The view being accessed
            
        Returns:
            bool: True if user has permission, False otherwise
        """
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Superuser always has access
        if request.user.is_superuser:
            return True
        
        # Check role-based access
        if hasattr(request.user, 'role'):
            # Read-only access for viewers
            if request.method in permissions.SAFE_METHODS:
                return True
            
            # Write access for specified roles
            return request.user.role in self.required_roles
        
        # Fallback to staff status
        return request.user.is_staff
    
    def has_object_permission(self, request, view, obj) -> bool:
        """
        Check object-level permissions.
        
        Args:
            request: The incoming request
            view: The view being accessed
            obj: The object being accessed
            
        Returns:
            bool: True if user has permission, False otherwise
        """
        return self.has_permission(request, view)


class MilkManagementPermission(HasModulePermission):
    """
    Permission class for milk management module.
    
    Allows:
    - Admin and Manager: Full access
    - Operator: Create and update milk intake records
    - Viewer: Read-only access
    
    Example:
        class MilkIntakeViewSet(viewsets.ModelViewSet):
            permission_classes = [MilkManagementPermission]
    """
    
    module_name = 'milk'
    required_roles = ['admin', 'manager', 'operator']
    
    def has_permission(self, request, view) -> bool:
        """Check milk management permissions."""
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.is_superuser:
            return True
        
        if hasattr(request.user, 'role'):
            # All authenticated users can read
            if request.method in permissions.SAFE_METHODS:
                return True
            
            # Operators can create and update
            if request.method in ['POST', 'PUT', 'PATCH']:
                return request.user.role in self.required_roles
            
            # Only admin/manager can delete
            if request.method == 'DELETE':
                return request.user.role in ['admin', 'manager']
        
        return super().has_permission(request, view)


class ProductionPermission(HasModulePermission):
    """
    Permission class for production module.
    
    Controls access to production batch management.
    """
    
    module_name = 'production'
    required_roles = ['admin', 'manager', 'production_manager']


class InventoryPermission(HasModulePermission):
    """
    Permission class for inventory module.
    
    Controls access to inventory management.
    """
    
    module_name = 'inventory'
    required_roles = ['admin', 'manager', 'warehouse_manager']


class VendorPermission(HasModulePermission):
    """
    Permission class for vendor module.
    
    Controls access to vendor management.
    """
    
    module_name = 'vendor'
    required_roles = ['admin', 'manager']


class EmployeePermission(HasModulePermission):
    """
    Permission class for employee module.
    
    Controls access to employee management.
    Only admin and HR managers can manage employees.
    """
    
    module_name = 'employee'
    required_roles = ['admin', 'hr_manager']
    
    def has_permission(self, request, view) -> bool:
        """Check employee management permissions."""
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.is_superuser:
            return True
        
        if hasattr(request.user, 'role'):
            # All authenticated users can read their own profile
            if request.method in permissions.SAFE_METHODS:
                return True
            
            # Only admin/HR can modify employee records
            return request.user.role in self.required_roles
        
        return False
    
    def has_object_permission(self, request, view, obj) -> bool:
        """Check object-level employee permissions."""
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Users can always read their own record
        if request.method in permissions.SAFE_METHODS:
            if hasattr(obj, 'user') and obj.user == request.user:
                return True
        
        # Admin/HR can modify any employee
        if hasattr(request.user, 'role'):
            return request.user.role in self.required_roles
        
        return request.user.is_superuser


class IsAuthenticatedOrReadOnly(permissions.BasePermission):
    """
    Permission class that allows authenticated users full access
    and unauthenticated users read-only access.
    
    Use this for public-facing endpoints that should be readable
    by anyone but only modifiable by authenticated users.
    """
    
    def has_permission(self, request, view) -> bool:
        """Check if user is authenticated for write operations."""
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return request.user and request.user.is_authenticated
