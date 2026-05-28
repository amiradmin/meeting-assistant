# eaf/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'heats', views.EAFHeatViewSet, basename='eaf-heat')
router.register(r'electrical-profiles', views.EAFElectricalProfileViewSet, basename='electrical-profile')
router.register(r'delays', views.EAFDelayViewSet, basename='eaf-delay')

urlpatterns = [
    path('', include(router.urls)),
]