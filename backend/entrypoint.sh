#!/bin/sh

echo "🚀 Starting Steel Factory Level 2 System..."
echo "⏳ Waiting for PostgreSQL..."

# انتظار ساده برای دیتابیس
sleep 5

# اجرای migrations
echo "📦 Running database migrations..."
python manage.py migrate --noinput

# جمع‌آوری فایل‌های استاتیک
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput

# ایجاد superuser خودکار
echo "👤 Setting up admin user..."
python manage.py shell -c "
from django.contrib.auth import get_user_model;
User = get_user_model();
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@steel.com', 'admin123');
    print('✅ Superuser created');
else:
    print('ℹ️ Superuser already exists')
"

# اجرای سرور
echo "🌐 Starting Django server on http://0.0.0.0:8000"
echo "📊 Admin panel: http://localhost:8000/admin"
exec python manage.py runserver 0.0.0.0:8000