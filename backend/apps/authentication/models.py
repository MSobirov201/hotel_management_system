import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from phonenumber_field.modelfields import PhoneNumberField

class UserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not username:
            raise ValueError('Username is required')
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', 'super_admin')
        return self.create_user(username, email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=30, unique=True, db_index=True)
    full_name = models.CharField(max_length=100, blank=True)
    email = models.EmailField(max_length=100, unique=True, db_index=True)
    phone = PhoneNumberField(blank=True, null=True, region='UZ')
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    department = models.CharField(max_length=100, blank=True)
    position = models.CharField(max_length=100, blank=True)
    address = models.TextField(blank=True)
    bio = models.TextField(blank=True)
    ROLE_CHOICES = (
        ('super_admin', 'Super Admin'),
        ('admin', 'Admin'),
        ('manager', 'Manager'),
        ('receptionist', 'Receptionist'),
        ('accountant', 'Accountant'),
        ('guest', 'Guest'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='guest')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    last_login = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    is_deleted = models.BooleanField(default=False)

    objects = UserManager()
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    class Meta:
        db_table = 'users'   # Bu jadval allaqachon mavjud
        ordering = ['-created_at']

    def __str__(self):
        return self.username














































































# import uuid
# from django.contrib.auth.models import AbstractUser
# from django.db import models
#
# class User(AbstractUser):
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     phone = models.CharField(max_length=20, unique=True, null=True, blank=True)
#
#     # ManyToMany maydonlarini aniq belgilaymiz (ziddiyatni oldini olish uchun)
#     groups = models.ManyToManyField(
#         'auth.Group',
#         related_name='authentication_user_groups',
#         blank=True,
#         verbose_name='groups',
#         help_text='The groups this user belongs to.',
#     )
#     user_permissions = models.ManyToManyField(
#         'auth.Permission',
#         related_name='authentication_user_permissions',
#         blank=True,
#         verbose_name='user permissions',
#         help_text='Specific permissions for this user.',
#     )
#
#     def __str__(self):
#         return self.username
#
#     class Meta:
#         verbose_name = 'Foydalanuvchi'
#         verbose_name_plural = 'Foydalanuvchilar'
#         # db_table ni olib tashladik – Django yangi jadval yaratadi
#
#
#
#
#
#
#
#
#
#
#
#
#
#
#
#
#
#
#
#
#
#
#
#
#
# import uuid
# from django.db import models
# from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
# from django.utils import timezone
# from phonenumber_field.modelfields import PhoneNumberField
#
#
# class UserManager(BaseUserManager):
#     def create_user(self, username, email, password=None, **extra_fields):
#         if not username:
#             raise ValueError('Username is required')
#         if not email:
#             raise ValueError('Email is required')
#         email = self.normalize_email(email)
#         user = self.model(username=username, email=email, **extra_fields)
#         user.set_password(password)
#         user.save(using=self._db)
#         return user
#
#     def create_superuser(self, username, email, password=None, **extra_fields):
#         extra_fields.setdefault('is_staff', True)
#         extra_fields.setdefault('is_superuser', True)
#         extra_fields.setdefault('is_active', True)
#         extra_fields.setdefault('role', 'super_admin')
#         return self.create_user(username, email, password, **extra_fields)
#
#
# class User(AbstractBaseUser, PermissionsMixin):
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     username = models.CharField(max_length=30, unique=True, db_index=True)
#     full_name = models.CharField(max_length=100, blank=True)
#     email = models.EmailField(max_length=100, unique=True, db_index=True)
#     phone = PhoneNumberField(blank=True, null=True, region='UZ')
#     avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
#     department = models.CharField(max_length=100, blank=True)
#     position = models.CharField(max_length=100, blank=True)
#     address = models.TextField(blank=True)
#     bio = models.TextField(blank=True)
#     ROLE_CHOICES = (
#         ('super_admin', 'Super Admin'),
#         ('admin', 'Admin'),
#         ('manager', 'Manager'),
#         ('receptionist', 'Receptionist'),
#         ('accountant', 'Accountant'),
#         ('guest', 'Guest'),
#     )
#     role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='guest')
#     is_active = models.BooleanField(default=True)
#     is_staff = models.BooleanField(default=False)
#     is_superuser = models.BooleanField(default=False)
#     last_login = models.DateTimeField(null=True, blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
#     deleted_at = models.DateTimeField(null=True, blank=True)
#     is_deleted = models.BooleanField(default=False)
#
#     objects = UserManager()
#     USERNAME_FIELD = 'username'
#     REQUIRED_FIELDS = ['email']
#
#     class Meta:
#         db_table = 'users'
#         ordering = ['-created_at']
#
#     def __str__(self):
#         return self.username