"""
Production settings for Ichhadhari Dairy Management.
Optimized for Google Cloud Run + Supabase deployment.
"""

from .base import *
import dj_database_url

# ==============================================================================
# DEBUG SETTINGS
# ==============================================================================

DEBUG = False

# ==============================================================================
# CLOUD RUN DETECTION
# ==============================================================================

IS_CLOUD_RUN = os.getenv('K_SERVICE') is not None

if IS_CLOUD_RUN:
    print("🚀 Running on Google Cloud Run")
    
    # ==============================================================================
    # ALLOWED HOSTS
    # ==============================================================================
    
    ALLOWED_HOSTS = [
        '.run.app',
        '.a.run.app',
        'localhost',
        '127.0.0.1',
    ]
    
    # Add custom domain if provided
    custom_domain = os.getenv('CUSTOM_DOMAIN')
    if custom_domain:
        ALLOWED_HOSTS.append(custom_domain)
    
    # ==============================================================================
    # CORS SETTINGS
    # ==============================================================================
    
    CORS_ALLOWED_ORIGINS = [
        'https://ichhadhari-dairy.vercel.app',
        'https://ichhadhari-dairy-omvermas-projects.vercel.app',
        'https://ichhadhari-dairy-git-main-omvermas-projects.vercel.app',
        'http://localhost:3000',
    ]
    
    CORS_ALLOW_CREDENTIALS = True
    CORS_ALLOW_ALL_ORIGINS = False
    
    # ==============================================================================
    # SECURITY SETTINGS
    # ==============================================================================
    
    SECURE_SSL_REDIRECT = True
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'  # Changed from 'Strict' for better compatibility
    
    CSRF_COOKIE_SECURE = True
    CSRF_COOKIE_HTTPONLY = True
    CSRF_COOKIE_SAMESITE = 'Lax'
    CSRF_TRUSTED_ORIGINS = [
        'https://*.run.app',
        'https://*.vercel.app',
    ]
    
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_BROWSER_XSS_FILTER = True
    X_FRAME_OPTIONS = 'DENY'
    
    # ==============================================================================
    # DATABASE - Use DATABASE_URL from environment
    # ==============================================================================
    
    DATABASES = {
        'default': dj_database_url.config(
            default=os.getenv('DATABASE_URL'),
            conn_max_age=600,
            conn_health_checks=True,
            ssl_require=True,
        )
    }

    # ==============================================================================
    # CACHE - Use Redis only if configured, otherwise fall back to local memory
    # ==============================================================================

    REDIS_URL = os.getenv('REDIS_URL')
    if REDIS_URL:
        CACHES = {
            'default': {
                'BACKEND': 'django.core.cache.backends.redis.RedisCache',
                'LOCATION': REDIS_URL,
                'KEY_PREFIX': 'dairy',
                'TIMEOUT': 300,
            }
        }
    else:
        CACHES = {
            'default': {
                'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
                'LOCATION': 'dairy-local-cache',
                'TIMEOUT': 300,
            }
        }
    
    # ==============================================================================
    # STATIC & MEDIA FILES - Cloud Run with WhiteNoise
    # ==============================================================================
    
    STATIC_ROOT = '/tmp/staticfiles'
    STATIC_URL = '/static/'
    
    # WhiteNoise configuration for serving static files
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
    WHITENOISE_USE_FINDERS = True
    WHITENOISE_AUTOREFRESH = False
    WHITENOISE_MAX_AGE = 31536000  # Cache static files for 1 year
    
    MEDIA_ROOT = '/tmp/media'
    MEDIA_URL = '/media/'
    
    # ==============================================================================
    # LOGGING - Cloud Run (JSON format for Cloud Logging)
    # ==============================================================================
    
    LOGGING = {
        'version': 1,
        'disable_existing_loggers': False,
        'formatters': {
            'verbose': {
                'format': '[{levelname}] {asctime} {name} {message}',
                'style': '{',
            },
        },
        'handlers': {
            'console': {
                'class': 'logging.StreamHandler',
                'formatter': 'verbose',
            },
        },
        'root': {
            'handlers': ['console'],
            'level': 'INFO',
        },
        'loggers': {
            'django': {
                'handlers': ['console'],
                'level': 'INFO',
                'propagate': False,
            },
            'django.request': {
                'handlers': ['console'],
                'level': 'ERROR',
                'propagate': False,
            },
        },
    }
    
    print("✅ Cloud Run production settings configured")

else:
    # Standard production settings (non-Cloud Run)
    ALLOWED_HOSTS = config('ALLOWED_HOSTS', cast=Csv())
    
    # Use DATABASE_URL if provided, otherwise individual DB vars
    if os.getenv('DATABASE_URL'):
        DATABASES = {
            'default': dj_database_url.config(
                default=os.getenv('DATABASE_URL'),
                conn_max_age=600,
                conn_health_checks=True,
                ssl_require=True,
            )
        }
    else:
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.postgresql',
                'NAME': config('DB_NAME'),
                'USER': config('DB_USER'),
                'PASSWORD': config('DB_PASSWORD'),
                'HOST': config('DB_HOST'),
                'PORT': config('DB_PORT', default='5432'),
                'ATOMIC_REQUESTS': True,
                'CONN_MAX_AGE': 600,
                'OPTIONS': {
                    'sslmode': 'require',
                },
            }
        }
    
    print("✅ Standard production settings configured")

# ==============================================================================
# REST FRAMEWORK - Production
# ==============================================================================

REST_FRAMEWORK['DEFAULT_RENDERER_CLASSES'] = (
    'rest_framework.renderers.JSONRenderer',
)