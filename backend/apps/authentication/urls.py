from django.urls import path
from .views import HealthCheckView, MeView, ChangePasswordView

urlpatterns = [
    path('health/', HealthCheckView.as_view(), name='health'),
    path('me/', MeView.as_view(), name='me'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
]