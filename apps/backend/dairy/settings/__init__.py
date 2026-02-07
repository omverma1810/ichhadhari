"""Django settings package initialization."""

import os
from decouple import config

# Determine which settings module to use
# Check ENVIRONMENT env var, but also detect Cloud Run (K_SERVICE) and
# DJANGO_SETTINGS_MODULE to avoid accidentally loading development settings in production.
ENVIRONMENT = config('ENVIRONMENT', default='')

if not ENVIRONMENT:
    # Auto-detect production if running on Cloud Run or if DJANGO_SETTINGS_MODULE says so
    if os.getenv('K_SERVICE') or 'production' in os.getenv('DJANGO_SETTINGS_MODULE', ''):
        ENVIRONMENT = 'production'
    else:
        ENVIRONMENT = 'development'

if ENVIRONMENT == 'production':
    from .production import *
elif ENVIRONMENT == 'test':
    from .test import *
else:
    from .development import *