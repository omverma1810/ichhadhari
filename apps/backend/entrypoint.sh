#!/bin/bash
set -e

echo "🚀 Starting Ichhadhari Dairy Management Backend..."

# Set production settings
export DJANGO_SETTINGS_MODULE=dairy.settings.production

# Wait for database with retry logic
echo "⏳ Waiting for database..."
python << END
import sys
import time
import psycopg2
import os

db_url = os.environ.get('DATABASE_URL', '')
max_retries = 10
retry_count = 0

if not db_url:
    print("⚠️  DATABASE_URL not set, skipping database connection check")
    sys.exit(0)

while retry_count < max_retries:
    try:
        conn = psycopg2.connect(db_url)
        conn.close()
        print("✅ Database is ready!")
        sys.exit(0)
    except Exception as e:
        retry_count += 1
        if retry_count < max_retries:
            print(f"⏳ Database not ready yet (attempt {retry_count}/{max_retries})...")
            time.sleep(1)
        else:
            print(f"⚠️  Database connection failed after {max_retries} attempts, but continuing anyway...")
            sys.exit(0)
END

# Run migrations (but don't fail if database is unavailable)
echo "📊 Running database migrations..."
python manage.py migrate --noinput 2>/dev/null || echo "⚠️  Migrations failed - continuing without them"

# Collect static files
echo "📦 Collecting static files..."
python manage.py collectstatic --noinput --clear 2>/dev/null || echo "⚠️  Static files collection failed"

# Create superuser (optional)
echo "👤 Creating superuser..."
python manage.py shell << END
from django.contrib.auth import get_user_model
User = get_user_model()

username = 'omverma'
email = 'omverma1234q@gmail.com'
password = 'Omverma@1810'

if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username=username, email=email, password=password)
    print(f'✅ Superuser {username} created successfully')
else:
    print(f'ℹ️ Superuser {username} already exists')
END

echo "🎉 Initialization complete!"
echo "🚀 Starting Gunicorn server..."

# Start Gunicorn
exec gunicorn dairy.wsgi:application \
    --bind 0.0.0.0:${PORT:-8000} \
    --workers 2 \
    --threads 4 \
    --timeout 60 \
    --access-logfile - \
    --error-logfile - \
    --log-level info