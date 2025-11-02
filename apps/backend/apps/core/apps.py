"""Core app configuration."""

from django.apps import AppConfig


class CoreConfig(AppConfig):
    """Configuration for the core app."""
    
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.core'
    verbose_name = 'Core'
    
    def ready(self):
        """
        Run code when the app is ready.
        
        This method is called when Django starts. It's used to perform
        initialization tasks like importing signals.
        """
        # Import signals here if needed
        # import apps.core.signals
        pass
