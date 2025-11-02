"""
Admin configuration for authentication app.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import User, RefreshToken
from apps.core.models import AuditLog


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom admin for User model."""
    
    list_display = [
        'username', 'email', 'full_name_display', 'role', 
        'department', 'is_active', 'date_joined'
    ]
    
    list_filter = [
        'role', 'is_active', 'is_staff', 'is_superuser', 
        'department', 'date_joined'
    ]
    
    search_fields = [
        'username', 'email', 'first_name', 'last_name', 
        'phone', 'employee_id'
    ]
    
    ordering = ['-date_joined']
    
    readonly_fields = [
        'date_joined', 'last_login', 'created_at', 'updated_at',
        'last_login_ip'
    ]
    
    fieldsets = (
        ('Authentication', {
            'fields': ('username', 'password')
        }),
        ('Personal Information', {
            'fields': ('first_name', 'last_name', 'email', 'phone', 'profile_picture')
        }),
        ('Employee Information', {
            'fields': ('employee_id', 'role', 'department', 'permissions')
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
            'classes': ('collapse',)
        }),
        ('Important Dates', {
            'fields': ('last_login', 'last_login_ip', 'date_joined', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'username', 'email', 'password1', 'password2',
                'first_name', 'last_name', 'phone', 'employee_id',
                'role', 'department', 'is_active', 'is_staff'
            ),
        }),
    )
    
    def full_name_display(self, obj):
        """Display full name."""
        full_name = obj.get_full_name()
        if full_name:
            return full_name
        return '-'
    full_name_display.short_description = 'Full Name'
    
    def get_queryset(self, request):
        """Optimize queryset with select_related."""
        qs = super().get_queryset(request)
        return qs.select_related()


@admin.register(RefreshToken)
class RefreshTokenAdmin(admin.ModelAdmin):
    """Admin for RefreshToken model."""
    
    list_display = [
        'user', 'token_preview', 'is_revoked', 
        'created_at', 'expires_at', 'is_expired_display'
    ]
    
    list_filter = ['is_revoked', 'created_at', 'expires_at']
    
    search_fields = ['user__username', 'user__email', 'token']
    
    readonly_fields = ['user', 'token', 'created_at', 'expires_at']
    
    ordering = ['-created_at']
    
    date_hierarchy = 'created_at'
    
    def token_preview(self, obj):
        """Show preview of token."""
        if len(obj.token) > 50:
            return f"{obj.token[:25]}...{obj.token[-25:]}"
        return obj.token
    token_preview.short_description = 'Token'
    
    def is_expired_display(self, obj):
        """Display if token is expired."""
        if obj.is_expired():
            return format_html('<span style="color: red;">Expired</span>')
        return format_html('<span style="color: green;">Valid</span>')
    is_expired_display.short_description = 'Status'
    
    def has_add_permission(self, request):
        """Disable manual token creation."""
        return False
    
    def has_change_permission(self, request, obj=None):
        """Disable token editing."""
        return False


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    """Admin for AuditLog model."""
    
    list_display = [
        'timestamp', 'user', 'action', 'model_name', 
        'object_id', 'ip_address'
    ]
    
    list_filter = [
        'action', 'model_name', 'timestamp'
    ]
    
    search_fields = [
        'user__username', 'user__email', 'model_name', 
        'object_id', 'ip_address'
    ]
    
    readonly_fields = [
        'user', 'action', 'model_name', 'object_id', 
        'changes', 'ip_address', 'user_agent', 'timestamp'
    ]
    
    ordering = ['-timestamp']
    
    date_hierarchy = 'timestamp'
    
    def has_add_permission(self, request):
        """Disable manual log creation."""
        return False
    
    def has_change_permission(self, request, obj=None):
        """Disable log editing."""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Only superusers can delete logs."""
        return request.user.is_superuser
