from rest_framework import permissions


def _role(user):
    if not user or not user.is_authenticated:
        return None
    return getattr(user, 'role', None)


class IsSuperAdmin(permissions.BasePermission):
    message = 'Faqat super admin uchun.'

    def has_permission(self, request, view):
        return _role(request.user) == 'super_admin'


class IsAdmin(permissions.BasePermission):
    message = 'Admin huquqi talab qilinadi.'

    def has_permission(self, request, view):
        return _role(request.user) in ('super_admin', 'admin')


class IsManager(permissions.BasePermission):
    message = 'Manager huquqi talab qilinadi.'

    def has_permission(self, request, view):
        return _role(request.user) in ('super_admin', 'admin', 'manager')


class IsStaffOrManager(permissions.BasePermission):
    message = 'Xodim huquqi talab qilinadi.'

    def has_permission(self, request, view):
        return _role(request.user) in (
            'super_admin', 'admin', 'manager', 'receptionist'
        )


class CanManagePayments(permissions.BasePermission):
    message = "To'lovlarni boshqarish uchun huquq yo'q."

    def has_permission(self, request, view):
        return _role(request.user) in (
            'super_admin', 'admin', 'manager', 'accountant'
        )


class IsAdminOrReadOnly(permissions.BasePermission):
    message = 'Faqat admin yozishi mumkin.'

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return bool(request.user and request.user.is_authenticated)
        return _role(request.user) in ('super_admin', 'admin')