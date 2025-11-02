"""
URL configuration for authentication app.
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views


app_name = 'authentication'

urlpatterns = [
    # Authentication endpoints
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    
    # User profile endpoints
    path('me/', views.me, name='me'),
    path('change-password/', views.change_password, name='change-password'),
    path('check-permission/', views.check_permission, name='check-permission'),
    
    # JWT token endpoints
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
]
