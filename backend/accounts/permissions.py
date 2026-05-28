# accounts/permissions.py
from rest_framework import permissions


class IsAdminOrReadOnly(permissions.BasePermission):
    """Allow admin users to edit, others can only view"""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


class IsOwnerOrAdmin(permissions.BasePermission):
    """Allow users to edit their own data, admin can edit all"""

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        return obj == request.user


class IsInDepartment(permissions.BasePermission):
    """Check if user belongs to specific department"""

    def has_permission(self, request, view):
        allowed_departments = getattr(view, 'allowed_departments', [])
        if not allowed_departments:
            return True
        return request.user.department in allowed_departments


class IsAdmin(permissions.BasePermission):
    """Allow access only to admin users (role-based)"""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role == 'admin' or request.user.is_superuser

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role == 'admin' or request.user.is_superuser


class IsProductionManager(permissions.BasePermission):
    """Allow access to production managers and admins"""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in ['admin', 'production_manager'] or request.user.is_superuser

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in ['admin', 'production_manager'] or request.user.is_superuser


class IsProductionPlanner(permissions.BasePermission):
    """Allow access to production planners and admins"""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in ['admin', 'production_planner'] or request.user.is_superuser


class IsLFOperator(permissions.BasePermission):
    """Allow access to LF operators, production managers, and admins"""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in ['admin', 'lf_operator', 'production_manager'] or request.user.is_superuser


class IsEAFOperator(permissions.BasePermission):
    """Allow access to EAF operators, production managers, and admins"""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in ['admin', 'eaf_operator', 'production_manager'] or request.user.is_superuser


class IsCCMOperator(permissions.BasePermission):
    """Allow access to CCM operators, production managers, and admins"""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in ['admin', 'ccm_operator', 'production_manager'] or request.user.is_superuser


class IsQualityEngineer(permissions.BasePermission):
    """Allow access to quality engineers, production managers, and admins"""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in ['admin', 'quality_engineer', 'production_manager'] or request.user.is_superuser


class IsViewer(permissions.BasePermission):
    """Allow read-only access to viewers, full access to admins"""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return True

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        # Admin has full access
        if request.user.role == 'admin' or request.user.is_superuser:
            return True

        # Viewers can only read
        if request.user.role == 'viewer':
            return request.method in permissions.SAFE_METHODS

        return True


class HasModulePermission(permissions.BasePermission):
    """Check if user has permission to access a specific module"""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Get module name from view or from request path
        module = getattr(view, 'module_name', None)
        if not module:
            # Try to extract from path
            path = request.path
            if '/production/' in path:
                module = 'production'
            elif '/lf/' in path:
                module = 'lf'
            elif '/eaf/' in path:
                module = 'eaf'
            elif '/ccm/' in path:
                module = 'ccm'
            elif '/quality/' in path:
                module = 'quality'
            elif '/reports/' in path:
                module = 'reports'
            elif '/settings/' in path or '/accounts/' in path:
                module = 'settings'
            else:
                return True

        # Admin has access to everything
        if request.user.role == 'admin' or request.user.is_superuser:
            return True

        # Module permissions based on role
        module_permissions = {
            'production': ['admin', 'production_manager', 'production_planner'],
            'lf': ['admin', 'production_manager', 'lf_operator'],
            'eaf': ['admin', 'production_manager', 'eaf_operator'],
            'ccm': ['admin', 'production_manager', 'ccm_operator'],
            'quality': ['admin', 'production_manager', 'quality_engineer'],
            'reports': ['admin', 'production_manager', 'viewer'],
            'settings': ['admin'],
            'users': ['admin'],
        }

        allowed_roles = module_permissions.get(module, ['admin'])
        return request.user.role in allowed_roles


class CanEditProduction(permissions.BasePermission):
    """Permission to edit production data (orders, buckets, heats)"""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Read-only for viewers and read-only methods
        if request.method in permissions.SAFE_METHODS:
            return True

        # Edit permissions
        return request.user.role in ['admin', 'production_manager', 'production_planner']

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.method in permissions.SAFE_METHODS:
            return True

        return request.user.role in ['admin', 'production_manager', 'production_planner']


class CanControlLF(permissions.BasePermission):
    """Permission to control LF operations (temperature, alloys, etc.)"""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Read-only for viewers
        if request.method in permissions.SAFE_METHODS:
            return request.user.role in ['admin', 'production_manager', 'lf_operator', 'viewer']

        # Write/control permissions
        return request.user.role in ['admin', 'production_manager', 'lf_operator']

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.method in permissions.SAFE_METHODS:
            return request.user.role in ['admin', 'production_manager', 'lf_operator', 'viewer']

        return request.user.role in ['admin', 'production_manager', 'lf_operator']