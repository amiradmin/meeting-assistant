# accounts/serializers.py
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.models import update_last_login
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, UserActivityLog, UserRole


class UserSerializer(serializers.ModelSerializer):
    """Base User Serializer"""
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    full_name = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'employee_id', 'department', 'position', 'phone_number', 'shift',
            'role', 'role_display', 'is_active', 'is_online', 'last_login',
            'date_joined', 'last_activity', 'avatar', 'avatar_url'
        )
        read_only_fields = ('id', 'last_login', 'date_joined', 'is_online', 'last_activity')

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username

    def get_avatar_url(self, obj):
        if obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new users"""
    password = serializers.CharField(write_only=True, required=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, required=True)
    role = serializers.ChoiceField(choices=UserRole.choices, default=UserRole.VIEWER)

    class Meta:
        model = User
        fields = (
            'username', 'email', 'password', 'confirm_password',
            'first_name', 'last_name', 'employee_id', 'department',
            'position', 'phone_number', 'shift', 'role', 'is_active'
        )

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match"})

        if User.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError({"username": "Username already exists"})

        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({"email": "Email already exists"})

        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating users (Admin only)"""

    class Meta:
        model = User
        fields = (
            'email', 'first_name', 'last_name', 'employee_id',
            'department', 'position', 'phone_number', 'shift', 'is_active', 'role'
        )

    def validate_email(self, value):
        # Check if email is taken by another user
        user = self.instance
        if user and User.objects.exclude(id=user.id).filter(email=value).exists():
            raise serializers.ValidationError("Email already in use")
        return value


class UserRoleUpdateSerializer(serializers.Serializer):
    """Serializer for updating user role"""
    role = serializers.ChoiceField(choices=UserRole.choices, required=True)

    def validate_role(self, value):
        # Prevent changing own role to something else if you're not admin
        request = self.context.get('request')
        if request and request.user.id == self.instance.id and value != 'admin':
            if request.user.role != 'admin':
                raise serializers.ValidationError("You cannot change your own role")
        return value


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile (self)"""
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'employee_id', 'department', 'position', 'phone_number',
            'shift', 'role', 'role_display', 'last_login', 'is_online',
            'avatar', 'avatar_url'
        )
        read_only_fields = ('id', 'username', 'role', 'last_login', 'is_online')

    def get_avatar_url(self, obj):
        if obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile (self)"""

    class Meta:
        model = User
        fields = (
            'email', 'first_name', 'last_name', 'employee_id',
            'department', 'position', 'phone_number', 'shift', 'avatar'
        )

    def validate_email(self, value):
        user = self.context['request'].user
        if User.objects.exclude(id=user.id).filter(email=value).exists():
            raise serializers.ValidationError("Email already in use")
        return value


class LoginSerializer(serializers.Serializer):
    """Login serializer with JWT tokens"""
    username = serializers.CharField(
        required=True,
        help_text="Username or employee ID",
        label="Username"
    )
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'},
        help_text="Your password",
        label="Password"
    )

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        if username and password:
            user = authenticate(request=self.context.get('request'),
                                username=username, password=password)
            if not user:
                raise serializers.ValidationError('نام کاربری یا رمز عبور اشتباه است')
            if not user.is_active:
                raise serializers.ValidationError('این کاربر غیرفعال شده است')
        else:
            raise serializers.ValidationError('لطفاً نام کاربری و رمز عبور را وارد کنید')

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        # Update last login
        update_last_login(None, user)

        data['user'] = user
        data['access_token'] = str(refresh.access_token)
        data['refresh_token'] = str(refresh)
        data['role'] = user.role
        data['role_display'] = user.get_role_display()

        return data


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing user password"""
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, min_length=6, write_only=True)
    confirm_password = serializers.CharField(required=True, write_only=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match"})

        user = self.context['request'].user
        if not user.check_password(data['old_password']):
            raise serializers.ValidationError({"old_password": "Incorrect password"})

        return data


class UserActivityLogSerializer(serializers.ModelSerializer):
    """Serializer for User Activity Log"""
    username = serializers.CharField(source='user.username', read_only=True)
    user_full_name = serializers.SerializerMethodField()

    class Meta:
        model = UserActivityLog
        fields = (
            'id', 'user', 'username', 'user_full_name', 'action',
            'module', 'details', 'ip_address', 'timestamp'
        )
        read_only_fields = ('id', 'timestamp')

    def get_user_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username