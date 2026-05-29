"""
URL configuration for meeting_assistant project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse


# یک view ساده برای سلامت سرویس
def health_check(request):
    return JsonResponse({
        'status': 'ok',
        'service': 'backend',
        'version': '1.0.0'
    })


def api_root(request):
    return JsonResponse({
        'message': 'Welcome to Meeting Assistant API',
        'endpoints': {
            'admin': '/admin/',
            'api': '/api/',
            'api/meetings': '/api/meetings/',
            'health': '/health/',
        },
        'version': '1.0.0'
    })


urlpatterns = [
    # Admin panel
    path('admin/', admin.site.urls),

    # API root
    path('', api_root, name='api-root'),

    # Health check
    path('health/', health_check, name='health'),

    # Meetings app APIs
    path('api/', include('meetings.urls')),

    # برای دسترسی به فایل‌های مدیا
    *static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT),
    *static('/uploads/',
            document_root=settings.UPLOAD_ROOT if hasattr(settings, 'UPLOAD_ROOT') else settings.MEDIA_ROOT),
]

# در حالت توسعه، دسترسی به فایل‌های استاتیک را هم اضافه کن
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)