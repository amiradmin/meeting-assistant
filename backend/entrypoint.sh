#!/bin/bash

echo "🚀 Starting..."

# منتظر PostgreSQL
while ! nc -z postgres 5432; do
  sleep 0.1
done

# اگر argument داده شده باشد
case "$1" in
    celery-worker)
        echo "🐍 Starting Celery Worker..."
        exec celery -A meeting_assistant worker --loglevel=info --concurrency=2
        ;;
    celery-beat)
        echo "⏰ Starting Celery Beat..."
        exec celery -A meeting_assistant beat --loglevel=info
        ;;
    *)
        # اجرای مهاجرت‌ها
        python manage.py migrate --noinput
        python manage.py collectstatic --noinput

        # ایجاد superuser
        python manage.py shell -c "
from django.contrib.auth import get_user_model;
User = get_user_model();
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
"
        echo "🌐 Starting Django server..."
        exec python manage.py runserver 0.0.0.0:8000
        ;;
esac