# accounts/views.py
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import viewsets, status, generics, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi  # Add this import
from .models import User, UserActivityLog
from .serializers import (
    UserSerializer, UserCreateSerializer, UserUpdateSerializer,
    UserRoleUpdateSerializer, LoginSerializer, ChangePasswordSerializer,
    UserActivityLogSerializer, UserProfileSerializer
)
from .permissions import IsAdmin

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom serializer to include user data in token response"""

    def validate(self, attrs):
        data = super().validate(attrs)

        # Add user data to response
        user_serializer = UserSerializer(self.user)
        data['user'] = user_serializer.data
        data['role'] = self.user.role
        data['role_display'] = self.user.get_role_display()

        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom view to return user data along with tokens"""
    serializer_class = CustomTokenObtainPairSerializer


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing users (Admin only).
    """
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated, IsAdmin]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['department', 'shift', 'is_active', 'is_staff', 'role']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'employee_id']
    ordering_fields = ['username', 'date_joined', 'employee_id', 'last_login']
    ordering = ['-date_joined']

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserSerializer

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Get current logged-in user"""
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['put', 'patch'], permission_classes=[IsAuthenticated])
    def update_profile(self, request):
        """Update current user's own profile"""
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def change_role(self, request, pk=None):
        """Change user role (Admin only)"""
        user = self.get_object()
        serializer = UserRoleUpdateSerializer(data=request.data, context={'request': request, 'instance': user})

        if serializer.is_valid():
            old_role = user.role
            new_role = serializer.validated_data['role']
            user.role = new_role
            user.save()

            # Log activity
            UserActivityLog.objects.create(
                user=request.user,
                action=f"Changed role of {user.username} from {old_role} to {new_role}",
                module='user_management',
                details={'old_role': old_role, 'new_role': new_role},
                ip_address=request.META.get('REMOTE_ADDR')
            )

            return Response({
                'message': 'Role updated successfully',
                'role': user.role,
                'role_display': user.get_role_display()
            })

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate user account"""
        user = self.get_object()
        user.is_active = True
        user.save()

        UserActivityLog.objects.create(
            user=request.user,
            action=f"Activated user {user.username}",
            module='user_management',
            ip_address=request.META.get('REMOTE_ADDR')
        )

        return Response({'message': 'User activated successfully'})

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate user account"""
        user = self.get_object()

        # Prevent deactivating yourself
        if user.id == request.user.id:
            return Response({'error': 'You cannot deactivate your own account'}, status=status.HTTP_400_BAD_REQUEST)

        user.is_active = False
        user.save()

        UserActivityLog.objects.create(
            user=request.user,
            action=f"Deactivated user {user.username}",
            module='user_management',
            ip_address=request.META.get('REMOTE_ADDR')
        )

        return Response({'message': 'User deactivated successfully'})


class UserActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing user activity logs (Admin only)"""
    queryset = UserActivityLog.objects.all()
    serializer_class = UserActivityLogSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['user', 'module']
    search_fields = ['action', 'user__username']
    ordering_fields = ['timestamp']
    ordering = ['-timestamp']

    def get_queryset(self):
        queryset = super().get_queryset()
        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        module = self.request.query_params.get('module')
        if module:
            queryset = queryset.filter(module=module)
        return queryset[:500]  # Limit to last 500 records


@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    """
    Login endpoint for user authentication

    POST /api/login/
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        request_body=LoginSerializer,
        responses={
            200: openapi.Response(
                description="Successful login",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'access': openapi.Schema(type=openapi.TYPE_STRING, description='JWT access token'),
                        'refresh': openapi.Schema(type=openapi.TYPE_STRING, description='JWT refresh token'),
                        'user': openapi.Schema(type=openapi.TYPE_OBJECT, description='User data'),
                        'role': openapi.Schema(type=openapi.TYPE_STRING, description='User role'),
                        'role_display': openapi.Schema(type=openapi.TYPE_STRING, description='User role display name'),
                    }
                )
            ),
            400: "Bad request - Invalid credentials",
        },
        operation_description="Login with username and password to get JWT tokens",
        operation_summary="User login"
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})

        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)

            # Log login activity
            UserActivityLog.objects.create(
                user=user,
                action="User logged in",
                module='authentication',
                details={'ip': request.META.get('REMOTE_ADDR')},
                ip_address=request.META.get('REMOTE_ADDR')
            )

            # Update user online status
            user.is_online = True
            user.last_login_ip = request.META.get('REMOTE_ADDR')
            user.save(update_fields=['is_online', 'last_login_ip'])

            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'employee_id': user.employee_id,
                    'department': user.department,
                    'position': user.position,
                    'role': user.role,
                    'role_display': user.get_role_display()
                }
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class LogoutView(APIView):
    """
    Logout endpoint to blacklist refresh token

    POST /api/logout/
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'refresh': openapi.Schema(type=openapi.TYPE_STRING, description='Refresh token to blacklist'),
            },
            required=['refresh']
        ),
        responses={
            200: "Successfully logged out",
            400: "Bad request",
        }
    )
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()

            # Log logout activity
            user = request.user
            UserActivityLog.objects.create(
                user=user,
                action="User logged out",
                module='authentication',
                ip_address=request.META.get('REMOTE_ADDR')
            )

            # Update user online status
            user.is_online = False
            user.save(update_fields=['is_online'])

            return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get and update current user profile"""
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


@method_decorator(csrf_exempt, name='dispatch')
class RefreshTokenView(APIView):
    """
    Refresh access token endpoint

    POST /api/refresh/
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'refresh': openapi.Schema(type=openapi.TYPE_STRING, description='Refresh token'),
            },
            required=['refresh']
        ),
        responses={
            200: openapi.Response(
                description="New access token",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'access': openapi.Schema(type=openapi.TYPE_STRING, description='New JWT access token'),
                    }
                )
            ),
            401: "Invalid refresh token",
        }
    )
    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'error': 'Refresh token required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            refresh = RefreshToken(refresh_token)
            access_token = str(refresh.access_token)
            return Response({'access': access_token}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': 'Invalid refresh token'}, status=status.HTTP_401_UNAUTHORIZED)


class ChangePasswordView(APIView):
    """Change password endpoint"""
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'old_password': openapi.Schema(type=openapi.TYPE_STRING, description='Current password'),
                'new_password': openapi.Schema(type=openapi.TYPE_STRING, description='New password'),
                'confirm_password': openapi.Schema(type=openapi.TYPE_STRING, description='Confirm new password'),
            },
            required=['old_password', 'new_password', 'confirm_password']
        ),
        responses={
            200: "Password changed successfully",
            400: "Bad request",
        }
    )
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()

            # Log activity
            UserActivityLog.objects.create(
                user=user,
                action="Changed password",
                module='authentication',
                ip_address=request.META.get('REMOTE_ADDR')
            )

            return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# accounts/views.py - Add these views

from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated


class UploadAvatarView(APIView):
    """Upload user avatar"""
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        if 'avatar' not in request.FILES:
            return Response(
                {'error': 'No avatar file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )

        avatar = request.FILES['avatar']

        # Validate file type
        allowed_types = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif']
        if avatar.content_type not in allowed_types:
            return Response(
                {'error': 'Invalid file type. Only JPEG, PNG, and GIF are allowed.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate file size (max 5MB)
        if avatar.size > 5 * 1024 * 1024:
            return Response(
                {'error': 'File too large. Maximum size is 5MB.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = request.user

        # Delete old avatar if exists
        if user.avatar:
            user.avatar.delete(save=False)

        user.avatar = avatar
        user.save()

        # Log activity
        UserActivityLog.objects.create(
            user=user,
            action="Uploaded avatar",
            module='profile',
            ip_address=request.META.get('REMOTE_ADDR')
        )

        return Response({
            'message': 'Avatar uploaded successfully',
            'avatar_url': user.avatar.url if user.avatar else None
        }, status=status.HTTP_200_OK)


class DeleteAvatarView(APIView):
    """Delete user avatar"""
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user
        if user.avatar:
            user.avatar.delete()
            user.avatar = None
            user.save()

            # Log activity
            UserActivityLog.objects.create(
                user=user,
                action="Deleted avatar",
                module='profile',
                ip_address=request.META.get('REMOTE_ADDR')
            )

            return Response(
                {'message': 'Avatar deleted successfully'},
                status=status.HTTP_200_OK
            )

        return Response(
            {'message': 'No avatar to delete'},
            status=status.HTTP_200_OK
        )