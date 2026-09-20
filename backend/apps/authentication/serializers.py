from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """
    Read-only serializer — user profilini ko'rish uchun.
    Sensitive fields (role, is_staff, is_superuser, is_active) READ-ONLY.
    """
    class Meta:
        model = User
        fields = [
            'id', 'username', 'full_name', 'email', 'phone', 'role',
            'avatar', 'department', 'position', 'address', 'bio',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'username', 'role',
            'is_active', 'created_at', 'updated_at'
        ]


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Faqat xavfsiz profil maydonlari — role, is_staff, is_superuser
    HECH QACHON bu yerdan o'zgartirilmaydi (privilege escalation oldini olish).
    """
    class Meta:
        model = User
        fields = [
            'full_name', 'email', 'phone', 'avatar',
            'department', 'position', 'address', 'bio'
        ]