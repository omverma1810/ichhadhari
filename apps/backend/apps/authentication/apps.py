"""App configuration for authentication app."""

from django.apps import AppConfig


class AuthenticationConfig(AppConfig):
    """Configuration for authentication app."""
    
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.authentication'
    verbose_name = 'Authentication'
    
    def ready(self):
        """Import signals when app is ready."""
        # Import signals here if needed
        pass
