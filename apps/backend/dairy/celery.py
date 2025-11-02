"""
Celery configuration for Ichhadhari Dairy Management.

This module configures Celery for asynchronous task processing.
"""

import os
from celery import Celery
from decouple import config

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dairy.settings.development')

# Create Celery app
app = Celery('dairy')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys
#   should have a `CELERY_` prefix.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

# Celery Beat Schedule (for periodic tasks)
app.conf.beat_schedule = {
    # Example: Generate daily milk intake reports
    'generate-daily-milk-report': {
        'task': 'apps.milk.tasks.generate_daily_report',
        'schedule': 3600.0,  # Every hour
    },
    # Example: Check inventory levels
    'check-inventory-levels': {
        'task': 'apps.inventory.tasks.check_low_stock',
        'schedule': 1800.0,  # Every 30 minutes
    },
}

@app.task(bind=True, ignore_result=True)
def debug_task(self):
    """Debug task for testing Celery configuration."""
    print(f'Request: {self.request!r}')
