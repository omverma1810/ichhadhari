from django.apps import AppConfig


class VendorsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.vendors'
    verbose_name = 'Vendor Management'

    def ready(self):
        pass  # Import signals here if needed
