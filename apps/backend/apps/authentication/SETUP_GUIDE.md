# Authentication System Setup Guide

Complete guide to set up and use the authentication system.

## ✅ What Was Created

### File Structure

```
apps/backend/apps/authentication/
├── __init__.py                    # App initialization
├── apps.py                        # App configuration
├── models.py                      # User, RefreshToken models
├── serializers.py                 # 5 serializers for auth flows
├── views.py                       # 6 API view functions
├── urls.py                        # URL routing
├── permissions.py                 # Custom permission classes
├── admin.py                       # Django admin configuration
├── README.md                      # Comprehensive documentation
└── tests/
    ├── __init__.py
    ├── test_models.py            # Model tests (90+ assertions)
    └── test_api.py               # API tests (120+ assertions)

apps/backend/apps/core/models.py   # Added AuditLog model
```

## 🚀 Setup Instructions

### Step 1: Run Migrations

The authentication app includes a custom User model, so migrations must be run before creating any users.

```bash
cd apps/backend

# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate
```

### Step 2: Create Superuser

Create an admin user to access Django admin:

```bash
python manage.py createsuperuser
```

Enter:

- Username: `admin`
- Email: `admin@ichhadhari.com`
- Password: (choose a strong password)

### Step 3: Start Development Server

```bash
python manage.py runserver
```

### Step 4: Test the API

Visit these URLs in your browser:

1. **API Documentation**: http://localhost:8000/api/docs/
2. **Django Admin**: http://localhost:8000/admin/
3. **Register Endpoint**: http://localhost:8000/api/auth/register/

## 🧪 Testing the System

### 1. Register a Test User

```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123",
    "confirm_password": "TestPass123",
    "first_name": "Test",
    "last_name": "User",
    "role": "operator",
    "department": "Production"
  }'
```

You'll receive:

- User data
- Access token (valid 12 hours)
- Refresh token (valid 7 days)

### 2. Login

```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "TestPass123"
  }'
```

### 3. Get Profile (Authenticated)

```bash
# Replace YOUR_ACCESS_TOKEN with the token from login/register
curl -X GET http://localhost:8000/api/auth/me/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Update Profile

```bash
curl -X PATCH http://localhost:8000/api/auth/me/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Updated",
    "department": "Quality Control"
  }'
```

### 5. Change Password

```bash
curl -X POST http://localhost:8000/api/auth/change-password/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "old_password": "TestPass123",
    "new_password": "NewPass456",
    "confirm_password": "NewPass456"
  }'
```

### 6. Logout

```bash
curl -X POST http://localhost:8000/api/auth/logout/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "YOUR_REFRESH_TOKEN"
  }'
```

## 🧪 Run Tests

Run the comprehensive test suite:

```bash
# All authentication tests
pytest apps/authentication/tests/ -v

# With coverage report
pytest apps/authentication/tests/ --cov=apps.authentication --cov-report=html

# Run specific test class
pytest apps/authentication/tests/test_api.py::TestLoginAPI -v
```

Expected results:

- **Model Tests**: ~20 test cases
- **API Tests**: ~30 test cases
- **Coverage**: >90%

## 📝 Usage in Other Apps

### Protect Views with Authentication

```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def my_view(request):
    user = request.user
    # User is guaranteed to be authenticated
    return Response({'message': f'Hello {user.username}'})
```

### Use Custom Permissions

```python
from apps.authentication.permissions import IsAdminUser, HasModulePermission

# Only admins can access
@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_something(request):
    pass

# Module-specific permissions
class VendorViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, HasModulePermission]
    module_name = 'vendors'  # Checks vendors.create, vendors.view, etc.
```

### Check Permissions Programmatically

```python
from django.contrib.auth import get_user_model

User = get_user_model()
user = User.objects.get(username='testuser')

# Check if user has permission
if user.has_permission('milk.create'):
    # Allow action
    pass
else:
    # Deny action
    pass

# Admins always return True
admin = User.objects.get(role='admin')
admin.has_permission('any.permission')  # Always True
```

### Log Actions

```python
from apps.core.models import AuditLog

# Automatic logging in views
AuditLog.log_action(
    user=request.user,
    action='create',
    model_name='Vendor',
    object_id=vendor.id,
    changes={'name': 'New Vendor'},
    ip_address=get_client_ip(request),
    user_agent=get_user_agent(request)
)
```

## 🎯 Next Steps

### 1. Configure Frontend Integration

Update your Next.js frontend to use these endpoints:

```typescript
// src/lib/api/auth.ts
const API_URL = "http://localhost:8000/api/auth";

export async function register(userData) {
  const response = await fetch(`${API_URL}/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  return response.json();
}

export async function login(credentials) {
  const response = await fetch(`${API_URL}/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  const data = await response.json();

  // Store tokens
  localStorage.setItem("access_token", data.tokens.access);
  localStorage.setItem("refresh_token", data.tokens.refresh);

  return data;
}

export async function getProfile() {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_URL}/me/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
}
```

### 2. Create More User Roles

Edit user permissions in Django admin or programmatically:

```python
from django.contrib.auth import get_user_model

User = get_user_model()

# Create operator with specific permissions
operator = User.objects.create_user(
    username='operator1',
    email='operator1@example.com',
    password='SecurePass123',
    role='operator',
    permissions={
        'milk': {
            'create': True,
            'view': True,
            'update': True,
            'delete': False
        },
        'production': {
            'view': True,
            'create': False
        }
    }
)
```

### 3. Set Up Periodic Token Cleanup

Add to your Celery beat schedule (in `dairy/settings/base.py`):

```python
from celery.schedules import crontab

CELERY_BEAT_SCHEDULE = {
    'cleanup-expired-tokens': {
        'task': 'apps.authentication.tasks.cleanup_expired_tokens',
        'schedule': crontab(hour=3, minute=0),  # Daily at 3 AM
    },
}
```

Create the task:

```python
# apps/authentication/tasks.py
from celery import shared_task
from .models import RefreshToken

@shared_task
def cleanup_expired_tokens():
    """Delete expired refresh tokens."""
    RefreshToken.cleanup_expired()
```

### 4. Add More Apps

Now that authentication is set up, create more apps:

```bash
# Create vendors app
python manage.py startapp apps/vendors

# Create milk intake app
python manage.py startapp apps/milk

# Create production app
python manage.py startapp apps/production
```

Use the authentication system in these apps with permission decorators.

## ⚠️ Important Notes

### Security

1. **Never commit `.env` file** - Contains SECRET_KEY
2. **Change SECRET_KEY in production** - Generate a new one
3. **Use HTTPS in production** - Protect tokens in transit
4. **Rotate tokens regularly** - Implement token refresh
5. **Monitor audit logs** - Check for suspicious activity

### Production Checklist

- [ ] Generate new SECRET_KEY
- [ ] Set DEBUG=False
- [ ] Configure ALLOWED_HOSTS
- [ ] Enable HTTPS
- [ ] Set up secure session cookies
- [ ] Configure CORS properly
- [ ] Set up token expiration
- [ ] Enable rate limiting
- [ ] Set up monitoring
- [ ] Regular audit log review

### Database

The custom User model must be set up **before** running any migrations. If you already ran migrations with the default User model:

1. Drop the database
2. Recreate it
3. Run migrations again

```bash
# PostgreSQL
dropdb ichhadhari_db
createdb ichhadhari_db
python manage.py migrate
```

## 🐛 Troubleshooting

### "User already exists"

If you created users before setting up the custom model, you need to:

1. Clear the database
2. Run fresh migrations
3. Create new users

### "Token is invalid"

- Check token expiration (12 hours for access, 7 days for refresh)
- Verify token wasn't blacklisted after logout
- Ensure Authorization header format: `Bearer <token>`

### "Permission denied"

- Check user role and permissions
- Admins have all permissions automatically
- Other roles need explicit permissions in `permissions` JSON field

### Tests failing

```bash
# Ensure test database is clean
pytest apps/authentication/tests/ --create-db

# Run with verbose output
pytest apps/authentication/tests/ -vv

# Run single failing test
pytest apps/authentication/tests/test_api.py::TestLoginAPI::test_login_success -vv
```

## 📚 Additional Resources

- [Authentication README](./README.md) - Full API documentation
- [Django Admin](http://localhost:8000/admin/) - Manage users
- [API Docs](http://localhost:8000/api/docs/) - Interactive API explorer
- [Backend README](../../README.md) - General backend setup

## ✅ Verification Checklist

After setup, verify:

- [ ] Migrations applied successfully
- [ ] Superuser created and can login to admin
- [ ] Can register a new user via API
- [ ] Can login and receive tokens
- [ ] Can access authenticated endpoints with token
- [ ] Can update profile
- [ ] Can change password
- [ ] Can logout (token blacklisted)
- [ ] All tests pass
- [ ] Audit logs visible in admin

---

**Setup complete! Authentication system ready to use. 🎉**
