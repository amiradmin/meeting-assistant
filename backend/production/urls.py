# production/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'orders', views.ProductionOrderViewSet, basename='production-order')
router.register(r'buckets', views.ProductionBucketViewSet, basename='production-bucket')
router.register(r'buckets', views.ProductionBucketViewSet, basename='production-bucket')
urlpatterns = [
    path('', include(router.urls)),
]