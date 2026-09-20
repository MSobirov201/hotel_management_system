from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'full_name', 'role', 'is_staff', 'is_active')
    search_fields = ('username', 'email', 'full_name')
    list_filter = ('role', 'is_active', 'is_staff')
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('full_name', 'email', 'phone', 'avatar', 'bio')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'role', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'role', 'is_staff', 'is_active')}
        ),
    )
    readonly_fields = ('created_at', 'updated_at')

admin.site.register(User, UserAdmin)































# from django.contrib import admin
# from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
# from .models import User
#
#
# @admin.register(User)
# class UserAdmin(BaseUserAdmin):
#     list_display = ['username', 'email', 'full_name', 'role', 'is_active', 'created_at']
#     list_filter = ['role', 'is_active', 'is_staff', 'is_superuser']
#     search_fields = ['username', 'email', 'full_name', 'phone']
#     ordering = ['-created_at']
#
#     fieldsets = (
#         ('Login Credentials', {'fields': ('username', 'password')}),
#         ('Personal Info', {'fields': ('full_name', 'email', 'phone', 'avatar')}),
#         ('Profile', {'fields': ('department', 'position', 'address', 'bio')}),
#         ('Permissions', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
#         ('Important Dates', {'fields': ('last_login', 'created_at', 'updated_at')}),
#     )
#
#     add_fieldsets = (
#         (None, {
#             'classes': ('wide',),
#             'fields': ('username', 'email', 'password1', 'password2', 'role'),
#         }),
#     )