# Authentication App

Complete authentication system with custom User model, JWT tokens, and audit logging.

## 📋 Overview

This app provides:

- **Custom User Model** with role-based access control
- **JWT Authentication** with token blacklisting
- **Audit Logging** for all user actions
- **Permission System** with granular control
- **Comprehensive API** for authentication flows

## 🏗️ Models

### User Model

Custom user model extending Django's `AbstractUser` with additional fields:

```python
from apps.authentication.models import User

# Fields
- username (inherited)
- email (inherited)
- password (inherited, hashed)
- first_name, last_name (inherited)
- phone: unique phone number
- role: admin/manager/supervisor/operator/viewer/finance/hr
- employee_id: unique employee identifier
- department: user's department
- profile_picture: user's profile image
- is_active: account status
- last_login_ip: IP of last login
- permissions: JSON dict of custom permissions
- created_at, updated_at: timestamps
```

**Methods:**

- `has_permission(permission)`: Check if user has specific permission
- `get_role_display_name()`: Get human-readable role name

### RefreshToken Model

Tracks JWT refresh tokens for logout/revocation:

```python
from apps.authentication.models import RefreshToken

# Fields
- user: ForeignKey to User
- token: unique token string
- is_revoked: revocation status
- created_at, expires_at: timestamps

# Methods
- revoke(): Revoke the token
- is_expired(): Check if token expired
- cleanup_expired(): Class method to delete expired tokens
```

### AuditLog Model (in core app)

Logs all user actions:

```python
from apps.core.models import AuditLog

# Fields
- user: who performed action
- action: create/update/delete/view/login/logout
- model_name: affected model
- object_id: affected object
- changes: JSON dict of changes
- ip_address: user's IP
- user_agent: user's browser
- timestamp: when action occurred
```

## 🔐 API Endpoints

### POST /api/auth/register/

Register a new user.

**Request:**

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "confirm_password": "SecurePass123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+919876543210",
  "role": "operator",
  "department": "Production",
  "employee_id": "EMP001"
}
```

**Response (201):**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "full_name": "John Doe",
    "role": "operator",
    "role_display": "Operator",
    "department": "Production",
    "is_active": true
  },
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

### POST /api/auth/login/

Login with username/email and password.

**Request:**

```json
{
  "username": "johndoe", // or email
  "password": "SecurePass123"
}
```

**Response (200):**

```json
{
  "message": "Login successful",
  "user": {
    /* user data */
  },
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

### POST /api/auth/logout/

Logout and blacklist refresh token.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request:**

```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response (200):**

```json
{
  "message": "Logout successful"
}
```

### GET /api/auth/me/

Get current user profile.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "full_name": "John Doe",
    "role": "operator",
    "permissions": {
      "milk": { "create": true, "view": true },
      "production": { "view": true }
    }
  }
}
```

### PATCH /api/auth/me/

Update current user profile.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request:**

```json
{
  "first_name": "Jane",
  "email": "jane@example.com",
  "phone": "+919999999999",
  "department": "Quality Control"
}
```

**Response (200):**

```json
{
  "message": "Profile updated successfully",
  "user": {
    /* updated user data */
  }
}
```

### POST /api/auth/change-password/

Change user password.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request:**

```json
{
  "old_password": "OldPass123",
  "new_password": "NewPass456",
  "confirm_password": "NewPass456"
}
```

**Response (200):**

```json
{
  "message": "Password changed successfully"
}
```

### GET /api/auth/check-permission/

Check if user has a specific permission.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Query Params:**

```
permission=milk.create
```

**Response (200):**

```json
{
  "permission": "milk.create",
  "has_permission": true,
  "user_role": "operator"
}
```

### POST /api/auth/token/refresh/

Refresh access token.

**Request:**

```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response (200):**

```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

## 👥 User Roles

| Role           | Description     | Typical Permissions                |
| -------------- | --------------- | ---------------------------------- |
| **admin**      | Administrator   | All permissions                    |
| **manager**    | Manager         | Most permissions, no system config |
| **supervisor** | Supervisor      | Department-specific management     |
| **operator**   | Operator        | Create and update operations       |
| **viewer**     | Viewer          | Read-only access                   |
| **finance**    | Finance         | Financial data access              |
| **hr**         | Human Resources | Employee management                |

## 🔑 Permissions System

Permissions are stored as JSON in the `permissions` field:

```json
{
  "milk": {
    "create": true,
    "view": true,
    "update": true,
    "delete": false
  },
  "production": {
    "view": true,
    "create": false
  }
}
```

**Check permissions:**

```python
from django.contrib.auth import get_user_model

User = get_user_model()
user = User.objects.get(username='johndoe')

# Check permission
if user.has_permission('milk.create'):
    # Allow milk intake creation
    pass
```

**Admins automatically have all permissions.**

## 🛡️ Security Features

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one digit
- Cannot be same as old password (on change)

### Token Security

- Access tokens expire in 12 hours (configurable)
- Refresh tokens expire in 7 days (configurable)
- Tokens can be blacklisted on logout
- Old expired tokens are cleaned up automatically

### Audit Logging

All authentication actions are logged:

- User registration
- Login/logout
- Profile updates
- Password changes
- Permission checks

View audit logs in Django admin.

## 📝 Usage Examples

### Register and Login Flow

```python
import requests

# 1. Register
response = requests.post('http://localhost:8000/api/auth/register/', json={
    'username': 'johndoe',
    'email': 'john@example.com',
    'password': 'SecurePass123',
    'confirm_password': 'SecurePass123',
    'role': 'operator'
})

tokens = response.json()['tokens']
access_token = tokens['access']
refresh_token = tokens['refresh']

# 2. Use access token for authenticated requests
headers = {'Authorization': f'Bearer {access_token}'}
response = requests.get('http://localhost:8000/api/auth/me/', headers=headers)

# 3. Refresh token when access token expires
response = requests.post('http://localhost:8000/api/auth/token/refresh/', json={
    'refresh': refresh_token
})
new_access_token = response.json()['access']

# 4. Logout
response = requests.post('http://localhost:8000/api/auth/logout/',
    headers=headers,
    json={'refresh': refresh_token}
)
```

### Create User in Django Shell

```python
from django.contrib.auth import get_user_model

User = get_user_model()

# Create regular user
user = User.objects.create_user(
    username='operator1',
    email='operator1@example.com',
    password='SecurePass123',
    role='operator',
    department='Production',
    permissions={
        'milk': {'create': True, 'view': True, 'update': True},
        'production': {'view': True}
    }
)

# Create admin user
admin = User.objects.create_superuser(
    username='admin',
    email='admin@example.com',
    password='AdminPass123'
)
```

### Custom Permissions

```python
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from apps.authentication.permissions import HasModulePermission

class MilkIntakeViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, HasModulePermission]
    module_name = 'milk'  # Will check milk.create, milk.view, etc.

    # Your viewset implementation
```

## 🧪 Testing

Run authentication tests:

```bash
# All authentication tests
pytest apps/authentication/tests/

# Model tests only
pytest apps/authentication/tests/test_models.py

# API tests only
pytest apps/authentication/tests/test_api.py

# Specific test
pytest apps/authentication/tests/test_api.py::TestLoginAPI::test_login_success

# With coverage
pytest apps/authentication/tests/ --cov=apps.authentication
```

## 🔧 Configuration

### Settings (in base.py)

```python
# Custom user model
AUTH_USER_MODEL = 'authentication.User'

# JWT settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=12),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}
```

### Environment Variables

```bash
# No additional env vars required for authentication
# Uses existing Django settings
```

## 📊 Admin Interface

Access Django admin at `/admin/`:

- **Users**: Manage all users, search, filter by role
- **Refresh Tokens**: View active tokens, revoke manually
- **Audit Logs**: View all logged actions (read-only)

## 🚀 Next Steps

After setting up authentication:

1. **Create initial admin user:**

   ```bash
   python manage.py createsuperuser
   ```

2. **Run migrations:**

   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

3. **Test the endpoints:**

   - Visit `/api/docs/` for interactive API docs
   - Register a test user
   - Login and get tokens
   - Test authenticated endpoints

4. **Create more apps** and use `@permission_classes` decorators with custom permissions

## 📚 Related Documentation

- [JWT Documentation](https://django-rest-framework-simplejwt.readthedocs.io/)
- [DRF Authentication](https://www.django-rest-framework.org/api-guide/authentication/)
- [Django Custom User Model](https://docs.djangoproject.com/en/5.0/topics/auth/customizing/)

---

**Built with Django 5.0, DRF, and Simple JWT**
