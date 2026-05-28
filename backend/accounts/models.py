# accounts/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.utils.translation import gettext_lazy as _
from django.core.validators import FileExtensionValidator
from django.core.exceptions import ValidationError
import os


def validate_avatar_size(value):
    """Validate avatar file size (max 5MB)"""
    filesize = value.size
    if filesize > 5 * 1024 * 1024:
        raise ValidationError("Avatar image size cannot exceed 5MB")


def avatar_upload_path(instance, filename):
    """Generate upload path for avatar images"""
    ext = filename.split('.')[-1]
    return f'avatars/{instance.username}_{instance.id}.{ext}'


class UserRole(models.TextChoices):
    """User roles for access control"""
    ADMIN = 'admin', 'Administrator'
    PRODUCTION_MANAGER = 'production_manager', 'Production Manager'
    PRODUCTION_PLANNER = 'production_planner', 'Production Planner'
    LF_OPERATOR = 'lf_operator', 'LF Operator'
    EAF_OPERATOR = 'eaf_operator', 'EAF Operator'
    CCM_OPERATOR = 'ccm_operator', 'CCM Operator'
    QUALITY_ENGINEER = 'quality_engineer', 'Quality Engineer'
    MAINTENANCE = 'maintenance', 'Maintenance'
    VIEWER = 'viewer', 'Viewer (Read Only)'


class User(AbstractUser):
    """
    Custom User model for the steel factory system
    """
    # Additional fields for steel factory employees
    employee_id = models.CharField(max_length=50, unique=True, null=True, blank=True)
    department = models.CharField(max_length=100, null=True, blank=True)
    position = models.CharField(max_length=100, null=True, blank=True)
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    shift = models.CharField(max_length=20, choices=[
        ('MORNING', 'شیفت صبح'),
        ('AFTERNOON', 'شیفت عصر'),
        ('NIGHT', 'شیفت شب'),
    ], null=True, blank=True)

    # Avatar/Profile picture field
    avatar = models.ImageField(
        upload_to=avatar_upload_path,
        null=True,
        blank=True,
        validators=[
            FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'gif']),
            validate_avatar_size
        ],
        verbose_name="Profile Picture"
    )

    # Role-based access control
    role = models.CharField(
        max_length=30,
        choices=UserRole.choices,
        default=UserRole.VIEWER,
        verbose_name="User Role"
    )

    # Track user activity
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    is_online = models.BooleanField(default=False)
    last_activity = models.DateTimeField(null=True, blank=True)

    # Fix reverse accessor clashes
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='accounts_user_set',
        blank=True,
        verbose_name=_('groups'),
        help_text=_('The groups this user belongs to.'),
        related_query_name='user',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='accounts_user_set',
        blank=True,
        verbose_name=_('user permissions'),
        help_text=_('Specific permissions for this user.'),
        related_query_name='user',
    )

    class Meta:
        verbose_name = _('User')
        verbose_name_plural = _('Users')
        permissions = [
            # Production Plan permissions
            ("can_view_orders", "Can view production orders"),
            ("can_edit_orders", "Can edit production orders"),
            ("can_delete_orders", "Can delete production orders"),
            ("can_view_buckets", "Can view production buckets"),
            ("can_edit_buckets", "Can edit production buckets"),
            ("can_delete_buckets", "Can delete production buckets"),
            ("can_view_heats", "Can view heats"),
            ("can_edit_heats", "Can edit heats"),
            ("can_delete_heats", "Can delete heats"),

            # LF permissions
            ("can_view_lf", "Can view LF pages"),
            ("can_control_lf", "Can control LF operations"),
            ("can_record_temperature", "Can record temperature"),
            ("can_record_analysis", "Can record analysis"),
            ("can_add_alloys", "Can add alloys"),
            ("can_confirm_alloys", "Can confirm alloys"),

            # EAF permissions
            ("can_view_eaf", "Can view EAF pages"),
            ("can_control_eaf", "Can control EAF operations"),

            # CCM permissions
            ("can_view_ccm", "Can view CCM pages"),
            ("can_control_ccm", "Can control CCM operations"),

            # Quality permissions
            ("can_view_quality", "Can view quality data"),
            ("can_edit_quality", "Can edit quality data"),

            # Reports permissions
            ("can_view_reports", "Can view reports"),
            ("can_export_reports", "Can export reports"),

            # Admin permissions
            ("can_manage_users", "Can manage users"),
            ("can_view_audit_log", "Can view audit logs"),
        ]

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

    def get_avatar_url(self):
        """Get avatar URL or return default"""
        if self.avatar:
            return self.avatar.url
        return None

    def has_module_permission(self, module):
        """Check if user has permission to access a module"""
        role_permissions = {
            UserRole.ADMIN: ['all'],
            UserRole.PRODUCTION_MANAGER: ['production', 'reports', 'quality'],
            UserRole.PRODUCTION_PLANNER: ['production'],
            UserRole.LF_OPERATOR: ['lf', 'quality'],
            UserRole.EAF_OPERATOR: ['eaf'],
            UserRole.CCM_OPERATOR: ['ccm'],
            UserRole.QUALITY_ENGINEER: ['quality', 'reports'],
            UserRole.MAINTENANCE: ['eaf', 'lf', 'ccm'],
            UserRole.VIEWER: ['reports'],
        }

        permissions = role_permissions.get(self.role, [])
        return 'all' in permissions or module in permissions


class UserActivityLog(models.Model):
    """Track user activities for audit"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    action = models.CharField(max_length=255)
    module = models.CharField(max_length=100)
    details = models.JSONField(default=dict)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'User Activity Log'
        verbose_name_plural = 'User Activity Logs'

    def __str__(self):
        return f"{self.user.username} - {self.action} - {self.timestamp}"