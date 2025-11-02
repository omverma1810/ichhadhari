# Authentication System - Quick Reference

## 🚀 Quick Start

```bash
# 1. Run migrations
python manage.py makemigrations
python manage.py migrate

# 2. Create superuser
python manage.py createsuperuser

# 3. Start server
python manage.py runserver

# 4. Test endpoints
curl http://localhost:8000/api/docs/
```

## 📡 API Endpoints

### Register User

```bash
POST /api/auth/register/
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "confirm_password": "SecurePass123",
  "role": "operator"
}
```

### Login

```bash
POST /api/auth/login/
{
  "username": "johndoe",
  "password": "SecurePass123"
}
# Returns: { user: {...}, tokens: { access, refresh } }
```

### Get Profile

```bash
GET /api/auth/me/
Authorization: Bearer <access_token>
```

### Update Profile

```bash
PATCH /api/auth/me/
Authorization: Bearer <access_token>
{
  "first_name": "John",
  "email": "newemail@example.com"
}
```

### Change Password

```bash
POST /api/auth/change-password/
Authorization: Bearer <access_token>
{
  "old_password": "OldPass123",
  "new_password": "NewPass456",
  "confirm_password": "NewPass456"
}
```

### Logout

```bash
POST /api/auth/logout/
Authorization: Bearer <access_token>
{
  "refresh": "<refresh_token>"
}
```

### Refresh Token

```bash
POST /api/auth/token/refresh/
{
  "refresh": "<refresh_token>"
}
```

## 👥 User Roles

| Role         | Permissions           |
| ------------ | --------------------- |
| `admin`      | All permissions       |
| `manager`    | Most operations       |
| `supervisor` | Department management |
| `operator`   | Create/update data    |
| `viewer`     | Read-only             |
| `finance`    | Financial data        |
| `hr`         | Employee management   |

## 🔑 Permission System

### Check Permission in Code

```python
if request.user.has_permission('milk.create'):
    # Allow action
    pass
```

### Set Permissions

```python
user.permissions = {
    'milk': {'create': True, 'view': True, 'update': False},
    'production': {'view': True}
}
user.save()
```

### Use in Views

```python
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def my_view(request):
    user = request.user  # Authenticated user
    # Your code
```

## 🧪 Testing

```bash
# All tests
pytest apps/authentication/tests/ -v

# With coverage
pytest apps/authentication/tests/ --cov=apps.authentication

# Specific test
pytest apps/authentication/tests/test_api.py::TestLoginAPI::test_login_success
```

## 🎯 Common Tasks

### Create User Programmatically

```python
from django.contrib.auth import get_user_model

User = get_user_model()
user = User.objects.create_user(
    username='operator1',
    email='operator1@example.com',
    password='SecurePass123',
    role='operator',
    permissions={'milk': {'create': True, 'view': True}}
)
```

### Get Current User in View

```python
def my_view(request):
    user = request.user
    print(user.username)
    print(user.role)
    print(user.email)
```

### Log Action

```python
from apps.core.models import AuditLog

AuditLog.log_action(
    user=request.user,
    action='create',
    model_name='Vendor',
    object_id=vendor.id,
    changes={'name': 'New Vendor'},
    ip_address='192.168.1.1'
)
```

### Get User's IP

```python
def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip
```

## 🔐 Security Checklist

- [ ] Strong SECRET_KEY in production
- [ ] DEBUG=False in production
- [ ] HTTPS enabled
- [ ] CORS configured properly
- [ ] Token expiration set appropriately
- [ ] Rate limiting enabled
- [ ] Audit logs monitored
- [ ] Regular token cleanup

## 📊 Admin URLs

- Django Admin: http://localhost:8000/admin/
- API Docs: http://localhost:8000/api/docs/
- ReDoc: http://localhost:8000/api/redoc/

## 🐛 Troubleshooting

### Token Invalid

- Check expiration (12h access, 7d refresh)
- Verify not blacklisted
- Correct header format: `Bearer <token>`

### Permission Denied

- Check user role
- Verify permissions JSON
- Admins have all permissions

### Tests Failing

```bash
pytest apps/authentication/tests/ --create-db -vv
```

## 📚 Documentation

- **README.md** - Full API docs
- **SETUP_GUIDE.md** - Setup instructions
- **IMPLEMENTATION_SUMMARY.md** - What was built

## 🎯 Key Files

```
apps/authentication/
├── models.py          # User, RefreshToken
├── serializers.py     # 5 serializers
├── views.py           # 6 API views
├── urls.py            # URL routing
├── permissions.py     # Permission classes
├── admin.py           # Admin config
└── tests/             # Test suite
```

## ⚡ Password Requirements

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 digit
- Cannot reuse old password

## 🔄 Token Lifecycle

1. User logs in → Receive access + refresh tokens
2. Use access token for API calls (12 hours)
3. Access token expires → Use refresh token to get new access token
4. Refresh token expires (7 days) → User must login again
5. User logs out → Refresh token blacklisted

---

**Quick Reference for Ichhadhari Dairy Management Authentication System**
