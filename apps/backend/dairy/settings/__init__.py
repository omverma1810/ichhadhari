"""Django settings package initialization."""

# Import settings based on environment
import os
from decouple import config

# Determine which settings module to use
ENVIRONMENT = config('ENVIRONMENT', default='development')

if ENVIRONMENT == 'production':
    from .production import *
elif ENVIRONMENT == 'test':
    from .test import *
else:
    from .development import *
