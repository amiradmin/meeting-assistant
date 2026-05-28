# accounts/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, LoginView, LogoutView,
    UserProfileView, RefreshTokenView, ChangePasswordView,
    UserActivityLogViewSet, CustomTokenObtainPairView, UploadAvatarView, DeleteAvatarView
)

# Create router for ViewSets
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'activity-logs', UserActivityLogViewSet, basename='activity-log')

urlpatterns = [
    # ViewSet URLs
    path('', include(router.urls)),

    # Authentication URLs
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('refresh/', RefreshTokenView.as_view(), name='refresh'),
    path('upload-avatar/', UploadAvatarView.as_view(), name='upload-avatar'),
    path('delete-avatar/', DeleteAvatarView.as_view(), name='delete-avatar'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
]