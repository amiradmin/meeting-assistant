"""
URL configuration for steel_middleeast project.

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
from rest_framework_simplejwt.views import TokenRefreshView
from accounts.views import CustomTokenObtainPairView
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions

# Swagger/OpenAPI schema view
schema_view = get_schema_view(
    openapi.Info(
        title="Steel Factory Level 2 API",
        default_version='v1',
        description="API documentation for EAF (Electric Arc Furnace) Level 2 Control System",
        terms_of_service="https://www.mite.com/terms/",
        contact=openapi.Contact(email="info@mite.com"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)


urlpatterns = [
    path('admin/', admin.site.urls),

    # API Documentation
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),

    # JWT Authentication endpoints
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Your app URLs
    path('api/', include('accounts.urls')),
    path('api/lf/', include('lf.urls')),
    path('api/accounts/', include('accounts.urls')),
    path('api/production/', include('production.urls')),
    path('api/eaf/', include('eaf.urls')),
    path('api/plc_communication/', include('plc_communication.urls')),
]
