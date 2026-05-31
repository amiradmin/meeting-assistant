#!/bin/bash

# منتظر PostgreSQL
echo "Waiting for PostgreSQL..."
while ! nc -z postgres 5432; do
  sleep 0.1
done
echo "PostgreSQL started"

# اجرای مهاجرت‌ها
echo "Running migrations..."
python manage.py migrate --noinput

# جمع‌آوری فایل‌های استاتیک
echo "Collecting static files..."
python manage.py collectstatic --noinput

# ایجاد superuser اگر وجود نداشت
echo "Creating superuser..."
python manage.py shell -c "
from django.contrib.auth import get_user_model;
User = get_user_model();
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Superuser created')
else:
    print('Superuser already exists')
"

echo "Starting Django server..."
exec python manage.py runserver 0.0.0.0:8000