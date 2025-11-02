"""
Test settings for Ichhadhari Dairy Management.

These settings are used when running tests with pytest or Django's test runner.
"""

from .base import *

# ==============================================================================
# DEBUG SETTINGS
# ==============================================================================

DEBUG = True

ALLOWED_HOSTS = ['*']

# ==============================================================================
# MIDDLEWARE - Test (Disable Debug Toolbar)
# ==============================================================================

# Remove debug toolbar middleware for tests
MIDDLEWARE = [m for m in MIDDLEWARE if 'debug_toolbar' not in m]

# ==============================================================================
# INSTALLED APPS - Test (Disable Debug Toolbar)
# ==============================================================================

# Remove debug toolbar from installed apps for tests
INSTALLED_APPS = [app for app in INSTALLED_APPS if 'debug_toolbar' not in app]

# ==============================================================================
# DATABASE - Test (In-memory SQLite for speed)
# ==============================================================================

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
        'ATOMIC_REQUESTS': True,
    }
}

# ==============================================================================
# PASSWORD HASHING - Test (Faster hashing for tests)
# ==============================================================================

PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]

# ==============================================================================
# EMAIL CONFIGURATION - Test
# ==============================================================================

EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'

# ==============================================================================
# CACHE - Test (Dummy cache)
# ==============================================================================

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
    }
}

# ==============================================================================
# CELERY - Test (Run tasks synchronously)
# ==============================================================================

CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True
CELERY_BROKER_URL = 'memory://'
CELERY_RESULT_BACKEND = 'cache+memory://'

# ==============================================================================
# REST FRAMEWORK - Test
# ==============================================================================

REST_FRAMEWORK['DEFAULT_THROTTLE_CLASSES'] = []
REST_FRAMEWORK['DEFAULT_THROTTLE_RATES'] = {}

REST_FRAMEWORK['TEST_REQUEST_DEFAULT_FORMAT'] = 'json'

# ==============================================================================
# LOGGING - Test (Minimal logging)
# ==============================================================================

LOGGING = {
    'version': 1,
    'disable_existing_loggers': True,
    'handlers': {
        'null': {
            'class': 'logging.NullHandler',
        },
    },
    'root': {
        'handlers': ['null'],
        'level': 'CRITICAL',
    },
}

# ==============================================================================
# SECURITY - Test (Relaxed)
# ==============================================================================

SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
SECURE_HSTS_SECONDS = 0

# ==============================================================================
# MEDIA FILES - Test
# ==============================================================================

MEDIA_ROOT = BASE_DIR / 'test_media'

# ==============================================================================
# STATICFILES - Test
# ==============================================================================

STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'

# ==============================================================================
# TEST SETTINGS
# ==============================================================================

# Faster test execution
MIGRATION_MODULES = {
    # Disable migrations for tests
    # 'auth': None,
    # 'contenttypes': None,
    # Add your apps here if you want to disable migrations
}

print("=" * 80)
print("TEST SETTINGS LOADED")
print("=" * 80)
