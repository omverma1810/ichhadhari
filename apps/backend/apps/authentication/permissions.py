"""
Custom permissions for authentication app.
"""

from rest_framework import permissions


class IsOwner(permissions.BasePermission):
    """
    Permission to only allow owners of an object to access it.
    """
    
    def has_object_permission(self, request, view, obj):
        """Check if user is the owner of the object."""
        return obj == request.user


class IsAdminUser(permissions.BasePermission):
    """
    Permission to only allow admin users.
    """
    
    message = 'Admin access required.'
    
    def has_permission(self, request, view):
        """Check if user is an admin."""
        return request.user and request.user.is_authenticated and request.user.role == 'admin'


class IsManagerOrAdmin(permissions.BasePermission):
    """
    Permission to allow manager or admin users.
    """
    
    message = 'Manager or admin access required.'
    
    def has_permission(self, request, view):
        """Check if user is a manager or admin."""
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['admin', 'manager']
        )


class IsActiveUser(permissions.BasePermission):
    """
    Permission to only allow active users.
    """
    
    message = 'Your account is inactive. Please contact an administrator.'
    
    def has_permission(self, request, view):
        """Check if user is active."""
        return request.user and request.user.is_authenticated and request.user.is_active


class HasModulePermission(permissions.BasePermission):
    """
    Base permission class for module-specific permissions.
    
    Subclasses should set the module_name and action attributes.
    """
    
    module_name = None
    
    def has_permission(self, request, view):
        """Check if user has permission for the module action."""
        if not request.user or not request.user.is_authenticated:
            return False
        
        if not request.user.is_active:
            return False
        
        # Admins have all permissions
        if request.user.role == 'admin':
            return True
        
        if not self.module_name:
            return False
        
        # Map HTTP methods to actions
        action_map = {
            'GET': 'view',
            'POST': 'create',
            'PUT': 'update',
            'PATCH': 'update',
            'DELETE': 'delete',
        }
        
        action = action_map.get(request.method, 'view')
        permission = f"{self.module_name}.{action}"
        
        return request.user.has_permission(permission)


class CanViewUsers(HasModulePermission):
    """Permission to view users."""
    module_name = 'users'
    
    def has_permission(self, request, view):
        """Allow GET requests for managers and admins."""
        if request.method == 'GET':
            return request.user.role in ['admin', 'manager', 'hr']
        return super().has_permission(request, view)


class CanManageUsers(HasModulePermission):
    """Permission to manage users."""
    module_name = 'users'
    
    def has_permission(self, request, view):
        """Allow user management for admins and HR."""
        return request.user.role in ['admin', 'hr']
