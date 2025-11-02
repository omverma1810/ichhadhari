"""
Development settings for Ichhadhari Dairy Management.

These settings are for local development only.
"""

from .base import *

# ==============================================================================
# DEBUG SETTINGS
# ==============================================================================

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', '*']

# ==============================================================================
# INSTALLED APPS - Development Tools
# ==============================================================================

INSTALLED_APPS += [
    'django_extensions',  # Provides shell_plus and other utilities
    'debug_toolbar',      # Django Debug Toolbar
]

MIDDLEWARE += [
    'debug_toolbar.middleware.DebugToolbarMiddleware',
]

# ==============================================================================
# DEBUG TOOLBAR CONFIGURATION
# ==============================================================================

INTERNAL_IPS = [
    '127.0.0.1',
    'localhost',
]

DEBUG_TOOLBAR_CONFIG = {
    'SHOW_TOOLBAR_CALLBACK': lambda request: DEBUG,
}

# ==============================================================================
# DATABASE - Development (SQLite for quick setup)
# ==============================================================================

# Use SQLite for development (easier setup)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# ==============================================================================
# EMAIL CONFIGURATION - Development (Console backend)
# ==============================================================================

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# ==============================================================================
# REST FRAMEWORK - Development
# ==============================================================================

REST_FRAMEWORK['DEFAULT_RENDERER_CLASSES'] = (
    'rest_framework.renderers.JSONRenderer',
    'rest_framework.renderers.BrowsableAPIRenderer',  # Enable browsable API
)

# Disable throttling in development
REST_FRAMEWORK['DEFAULT_THROTTLE_CLASSES'] = []
REST_FRAMEWORK['DEFAULT_THROTTLE_RATES'] = {}

# ==============================================================================
# CORS - Development (More permissive)
# ==============================================================================

CORS_ALLOW_ALL_ORIGINS = True  # Allow all origins in development

# ==============================================================================
# LOGGING - Development (More verbose)
# ==============================================================================

LOGGING['handlers']['console']['level'] = 'DEBUG'
LOGGING['root']['level'] = 'DEBUG'
LOGGING['loggers']['django']['level'] = 'DEBUG'

# ==============================================================================
# CELERY - Development
# ==============================================================================

CELERY_TASK_ALWAYS_EAGER = False  # Set to True to run tasks synchronously
CELERY_TASK_EAGER_PROPAGATES = True

# ==============================================================================
# SECURITY - Development (Relaxed)
# ==============================================================================

SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
SECURE_HSTS_SECONDS = 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = False
SECURE_HSTS_PRELOAD = False

# ==============================================================================
# DEVELOPMENT UTILITIES
# ==============================================================================

# Show SQL queries in console (useful for debugging)
# LOGGING['loggers']['django.db.backends'] = {
#     'level': 'DEBUG',
#     'handlers': ['console'],
# }

# Shell Plus configuration
SHELL_PLUS_PRINT_SQL = True
SHELL_PLUS_PRINT_SQL_TRUNCATE = 1000

print("=" * 80)
print("DEVELOPMENT SETTINGS LOADED")
print("=" * 80)
print(f"DEBUG: {DEBUG}")
print(f"ALLOWED_HOSTS: {ALLOWED_HOSTS}")
print(f"DATABASE: {DATABASES['default']['ENGINE']}")
print("=" * 80)
