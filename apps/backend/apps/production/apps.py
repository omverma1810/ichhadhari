"""
Django app configuration for Production Management.
"""

from django.apps import AppConfig


class ProductionConfig(AppConfig):
    """Production app configuration."""
    
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.production'
    verbose_name = 'Production Management'
    
    def ready(self):
        """Import signal handlers when app is ready."""
        pass
