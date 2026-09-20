from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import UserSerializer, ProfileUpdateSerializer


class HealthCheckView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({'status': 'ok', 'message': 'Authentication app is working'})


class MeView(APIView):
    """
    GET   /api/auth/me/  -> joriy user ma'lumotlari
    PATCH /api/auth/me/  -> FAQAT xavfsiz profil maydonlari
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = ProfileUpdateSerializer(
            request.user, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(request.user).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    """
    POST /api/auth/change-password/
    Django AUTH_PASSWORD_VALIDATORS ishlatiladi.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        current = (request.data.get('current_password') or '').strip()
        new_pwd = (request.data.get('new_password') or '').strip()

        if not current or not new_pwd:
            return Response(
                {'detail': 'Joriy va yangi parol kiritilishi shart.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not request.user.check_password(current):
            return Response(
                {'detail': "Joriy parol noto'g'ri."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            validate_password(new_pwd, user=request.user)
        except DjangoValidationError as e:
            return Response(
                {'detail': ' '.join(e.messages)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        request.user.set_password(new_pwd)
        request.user.save(update_fields=['password'])
        return Response({'detail': 'Parol muvaffaqiyatli yangilandi.'})