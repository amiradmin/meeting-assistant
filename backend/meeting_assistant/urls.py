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
from django.views.static import serve
import os
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

def health_check(request):
    return JsonResponse({'status': 'ok', 'service': 'backend'})


def api_root(request):
    return JsonResponse({
        'message': 'Meeting Assistant API',
        'endpoints': {
            'auth': {
                'token': '/api/token/',
                'refresh': '/api/token/refresh/',
                'verify': '/api/token/verify/',
            },
            'api': '/api/',
            'admin': '/admin/',
            'health': '/health/',
            'media': '/media/',
        }
    })


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', api_root),
    path('health/', health_check),

    # JWT Authentication endpoints
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),

    # Meetings app APIs
    path('api/', include('meetings.urls')),
]

# سرویس فایل‌های مدیا در حالت DEBUG
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static('/uploads/', document_root=settings.UPLOAD_ROOT)

    # همچنین یک مسیر مستقیم برای دسترسی به فایل‌ها
    urlpatterns += [
        path('media/<path:path>', serve, {'document_root': settings.MEDIA_ROOT}),
    ]