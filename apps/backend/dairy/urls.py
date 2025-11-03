"""
URL Configuration for Ichhadhari Dairy Management.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/

Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from apps.core.views import health_check
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from django.views.generic import RedirectView
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

def api_root(request):
    """API root endpoint showing available endpoints"""
    return JsonResponse({
        'message': 'Welcome to Ichhadhari Dairy Management API',
        'version': '1.0.0',
        'endpoints': {
            'admin': '/admin/',
            'api_documentation': {
                'swagger': '/api/docs/',
                'redoc': '/api/redoc/',
                'schema': '/api/schema/',
            },
            'authentication': {
                'login': '/api/auth/login/',
                'logout': '/api/auth/logout/',
                'register': '/api/auth/register/',
                'token': '/api/auth/token/',
            },
            'api': {
                'milk_management': '/api/milk/',
                'production': '/api/production/',
                'inventory': '/api/inventory/',
                'vendors': '/api/vendors/',
                'employees': '/api/employees/',
            }
        },
        'status': 'operational'
    })

urlpatterns = [
    # Health check endpoint
    path('health/', health_check, name='health-check'),
    path('api/health/', health_check, name='api-health-check'),
    
    # Root endpoint
    path('', api_root, name='api-root'),
    
    # Django Admin
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # Authentication endpoints
    path('api/auth/', include('apps.authentication.urls')),
    
    # JWT Authentication (legacy - use custom auth views instead)
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # API v1 endpoints
    path('api/v1/', include('apps.dashboard.urls')),
    path('api/milk/', include('apps.milk_management.urls')),
    path('api/production/', include('apps.production.urls')),
    path('api/inventory/', include('apps.inventory.urls')),
    path('api/vendors/', include('apps.vendors.urls')),
    path('api/employees/', include('apps.employees.urls')),
    # Future API endpoints (to be created):
    # path('api/analytics/', include('apps.analytics.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    
    # Django Debug Toolbar
    import debug_toolbar
    urlpatterns = [
        path('__debug__/', include(debug_toolbar.urls)),
    ] + urlpatterns

# Admin site customization
admin.site.site_header = "Ichhadhari Dairy Management"
admin.site.site_title = "Dairy Admin Portal"
admin.site.index_title = "Welcome to Dairy Management System"
