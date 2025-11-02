"""App configuration for Milk Management."""

from django.apps import AppConfig


class MilkManagementConfig(AppConfig):
    """Configuration for the Milk Management application."""
    
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.milk_management'
    verbose_name = 'Milk Management'
    
    def ready(self):
        """Import signals when the app is ready."""
        import apps.milk_management.signals  # noqa
