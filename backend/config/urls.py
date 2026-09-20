"""
URL Configuration for Hotel Management System Backend.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.shortcuts import redirect
from drf_yasg import openapi
from drf_yasg.views import get_schema_view   # <-- BU TO'G'RI
from rest_framework import permissions

from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.views import TokenObtainPairView as _BaseTokenView
from rest_framework.throttling import ScopedRateThrottle


class ThrottledTokenObtainPairView(_BaseTokenView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'login'


TokenObtainPairView = ThrottledTokenObtainPairView

# API Schema View for Swagger (DRF-YASG)
schema_view = get_schema_view(
    openapi.Info(
        title="Hotel Management System API",
        default_version='v1',
        description="Hotel Management System Backend API",
        terms_of_service="https://www.example.com/terms/",
        contact=openapi.Contact(email="contact@hms.uz"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/v1/', include('apps.core.urls')),
    path('api/auth/', include('apps.authentication.urls')),
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    # Root -> public.html ga redirect
    path('', lambda request: redirect('/static/public.html')),
]

# Debug rejimida static va media fayllarni serve qilish
if settings.DEBUG:
    if settings.STATIC_URL:
        urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    if settings.MEDIA_URL:
        urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
















































# """
# URL Configuration for Hotel Management System Backend.
# """
#
# from django.contrib import admin
# from django.urls import path, include
# from django.conf import settings
# from django.conf.urls.static import static
# from django.shortcuts import redirect
# from drf_yasg import openapi
# from drf_yasg.views import get_schema_view
# from drf_yasg.views import schema_view
# from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
# from rest_framework import permissions
# from django.views.static import serve
#
# from config.settings import BASE_DIR
#
# # Agar apps.common dan biror narsa kerak bo‘lsa, uni ham qo‘shing, lekin hozircha olib tashlaymiz
# # from apps.common import apps   # <-- BU KERAK EMAS, O‘CHIRING
#
# urlpatterns = [
#     path('admin/', admin.site.urls),
#     path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
#     path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
#     path('api/v1/', include('apps.core.urls')),
#     path('api/auth/', include('apps.authentication.urls')),
#     # path('', lambda request: redirect('/api/docs/')),
#     # path('', lambda request: redirect('/static/public.html')),
#     path('', lambda request: redirect('/static/hotel-management/public.html')),
#     # path('hotel-management/<path:path>', serve, {'document_root': BASE_DIR.parent / 'hotel-management'}),
#     path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
#     path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
# ]
#
# # Debug rejimida static va media fayllarni serve qilish
# if settings.DEBUG:
#     if settings.STATIC_URL:
#         urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
#     if settings.MEDIA_URL:
#         urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
#
#
# # ============================================================
# # API Schema View for Swagger (DRF-YASG)
# # ============================================================
# schema_view = get_schema_view(
#     openapi.Info(
#         title="Hotel Management System API",
#         default_version='v1',
#         description="Hotel Management System Backend API",
#         terms_of_service="https://www.example.com/terms/",
#         contact=openapi.Contact(email="contact@hms.uz"),
#         license=openapi.License(name="MIT License"),
#     ),
#     public=True,
#     permission_classes=(permissions.AllowAny,),   # <-- ENDI ISHLAYDI
# )
#
# # Swagger va Redoc uchun yo‘nalishlarni qo‘shamiz
# urlpatterns += [
#     path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
#     path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
# ]


































































































# """
# URL Configuration for Hotel Management System Backend.
# """
#
# from django.contrib import admin
# from django.urls import path, include
# from django.conf import settings
# from django.conf.urls.static import static
# from django.shortcuts import redirect
# from django.views.generic import TemplateView
# from drf_yasg import openapi
# from drf_yasg.views import get_schema_view
# from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
#
# # from backend.apps.authentication import permissions
#
# # from apps.authentication.permissions import get_schema_view
# # from apps.authentication.permissions import schema_view
#
# # from backend.apps.common import apps
# from apps.common import apps
#
# urlpatterns = [
#     path('admin/', admin.site.urls),
#     # Token endpointlari
#     path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
#     path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
#     # API v1
#     path('api/v1/', include('apps.core.urls')),
#     # Root -> public.html ga redirect
#     path('', lambda request: redirect('/static/public.html')),
# ]
#
#
# # Debug rejimida static fayllarni serve qilish
# if settings.DEBUG:
#     urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
#
# # ============================================================
# # API Schema View for Swagger
# # ============================================================
# schema_view = get_schema_view(
#     openapi.Info(
#         title="Hotel Management System API",
#         default_version='v1',
#         description="Hotel Management System Backend API",
#         terms_of_service="https://www.example.com/terms/",
#         contact=openapi.Contact(email="contact@hms.uz"),
#         license=openapi.License(name="MIT License"),
#     ),
#     public=True,
#     permission_classes=(permissions.AllowAny,),
# )
#
# urlpatterns = [
#
# path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
#     path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
#
#     # Admin
#     path('admin/', admin.site.urls),
#
#     path('api/v1/', include('apps.core.urls')),  # <-- v1 qo‘shildi
#
#     # Authentication
#     path('api/auth/', include('apps.authentication.urls')),
#
#     # API Documentation
#     path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
#     path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
#     path('api/', include('apps.core.urls')),
#     path('', lambda request: redirect('/static/public.html')),
#
# ]
#
# # Serve media files in development
# if settings.DEBUG:
#     urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
#     urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
#     urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)