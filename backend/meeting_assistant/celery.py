import os
from celery import Celery

# تنظیم ماژول settings برای Celery
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'meeting_assistant.settings')

app = Celery('meeting_assistant')

# بارگذاری تنظیمات از فایل settings.py با پیشوند CELERY_
app.config_from_object('django.conf:settings', namespace='CELERY')

# کشف خودکار تسک‌ها از همه اپلیکیشن‌های نصب شده
app.autodiscover_tasks()

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')