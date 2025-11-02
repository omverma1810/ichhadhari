"""
Employee Management App Configuration
"""

from django.apps import AppConfig


class EmployeesConfig(AppConfig):
    """Configuration for employees app."""
    
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.employees'
    verbose_name = 'Employee Management'
    
    def ready(self):
        """Import signals when app is ready."""
        pass  # Import signals here if needed in future
