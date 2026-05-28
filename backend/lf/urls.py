# lf/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'steel-grades', views.SteelGradeViewSet, basename='steel-grade')
router.register(r'heats', views.LFHeatViewSet, basename='heat')

urlpatterns = [
    path('', include(router.urls)),
    path('current-heat/<int:furnace_id>/', views.CurrentHeatView.as_view(), name='current-heat'),

    # Temperature endpoints
    path('temperatures/<int:heat_id>/', views.TemperatureHistoryView.as_view(), name='temperature-history'),
    path('temperature/<int:pk>/', views.TemperatureDetailView.as_view(), name='temperature-detail'),

    # Analysis endpoints
    path('analyses/<int:heat_id>/', views.AnalysisHistoryView.as_view(), name='analysis-history'),

    # Additions endpoints - IMPORTANT: Order matters! Put specific paths first
    path('additions/<int:pk>/', views.AdditionDetailView.as_view(), name='addition-detail'),  # Single addition
    path('additions/<int:heat_id>/', views.AdditionsView.as_view(), name='additions'),  # List/Create

    # Delays endpoints
    path('delays/<int:heat_id>/', views.DelaysView.as_view(), name='delays'),
    path('delays/<int:heat_id>/active/', views.ActiveDelayView.as_view(), name='active-delay'),

    # Phases
    path('phases/', views.ProcessPhasesView.as_view(), name='phases'),
]