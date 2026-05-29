from django.db import models
from django.contrib.auth.models import User


class Meeting(models.Model):
    STATUS_CHOICES = [
        ('pending', 'در انتظار'),
        ('processing', 'در حال پردازش'),
        ('transcribing', 'در حال تبدیل به متن'),
        ('summarizing', 'در حال خلاصه‌سازی'),
        ('completed', 'تکمیل شده'),
        ('failed', 'خطا'),
    ]

    title = models.CharField(max_length=255, verbose_name='عنوان جلسه')
    description = models.TextField(blank=True, verbose_name='توضیحات')
    audio_file = models.FileField(upload_to='audio/%Y/%m/%d/', verbose_name='فایل صوتی', null=True, blank=True)
    audio_duration = models.IntegerField(default=0, verbose_name='مدت زمان (ثانیه)')

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name='وضعیت')
    transcription = models.TextField(blank=True, verbose_name='متن پیاده شده')
    summary = models.TextField(blank=True, verbose_name='خلاصه جلسه')
    action_items = models.JSONField(default=list, blank=True, verbose_name='اقدامات')
    decisions = models.JSONField(default=list, blank=True, verbose_name='تصمیمات')
    key_points = models.JSONField(default=list, blank=True, verbose_name='نکات کلیدی')

    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='meetings', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'جلسه'
        verbose_name_plural = 'جلسات'
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    @property
    def get_audio_url(self):
        if self.audio_file:
            return self.audio_file.url
        return None