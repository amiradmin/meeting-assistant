# accounts/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, UserActivityLog


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'employee_id', 'department', 'role', 'is_active',
                    'is_online']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'employee_id']
    list_filter = ['role', 'department', 'shift', 'is_active', 'is_staff']
    readonly_fields = ['last_login', 'date_joined', 'last_activity', 'last_login_ip']

    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email', 'employee_id', 'phone_number')}),
        ('Work info', {'fields': ('department', 'position', 'shift', 'role')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Status', {'fields': ('is_online', 'last_login_ip', 'last_activity')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'role', 'department'),
        }),
    )


@admin.register(UserActivityLog)
class UserActivityLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'action', 'module', 'timestamp', 'ip_address']
    search_fields = ['user__username', 'action', 'module']
    list_filter = ['module', 'timestamp']
    readonly_fields = ['user', 'action', 'module', 'details', 'ip_address', 'timestamp']

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False