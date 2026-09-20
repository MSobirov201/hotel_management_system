from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db import transaction
from django.db.models import Q
from django.core.exceptions import ValidationError
from datetime import date

from .models import Room, Customer, Booking, Payment
from .services import PublicBookingService
from .serializers import (
    RoomSerializer,
    CustomerListSerializer,
    CustomerDetailSerializer,
    CustomerCreateUpdateSerializer,
    BookingListSerializer,
    BookingDetailSerializer,
    BookingCreateUpdateSerializer,
    PaymentListSerializer,
    PaymentDetailSerializer,
    PaymentCreateUpdateSerializer,
    PublicAvailabilitySerializer,
    PublicBookingRequestSerializer,
    PublicBookingStatusResponseSerializer,
)


# ============================================================
# ROOM VIEWSET
# ============================================================
class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.filter(is_active=True)
    serializer_class = RoomSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['number', 'room_type', 'description']
    ordering_fields = ['number', 'price_per_night', 'floor', 'created_at']
    ordering = ['number']

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'availability']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        queryset = Room.objects.filter(is_active=True)
        status_param = self.request.query_params.get('status')
        room_type = self.request.query_params.get('room_type')
        floor = self.request.query_params.get('floor')
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')

        if status_param:
            queryset = queryset.filter(status=status_param)
        if room_type:
            queryset = queryset.filter(room_type=room_type)
        if floor:
            queryset = queryset.filter(floor=floor)
        if min_price:
            queryset = queryset.filter(price_per_night__gte=min_price)
        if max_price:
            queryset = queryset.filter(price_per_night__lte=max_price)

        return queryset

    @action(detail=False, methods=['get'], url_path='availability')
    def availability(self, request):
        checkin_str = request.query_params.get('checkin')
        checkout_str = request.query_params.get('checkout')

        if not checkin_str or not checkout_str:
            return Response(
                {"error": "Both checkin and checkout dates are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            from django.utils.dateparse import parse_date
            checkin = parse_date(checkin_str)
            checkout = parse_date(checkout_str)
        except (ValueError, TypeError):
            return Response(
                {"error": "Invalid date format. Use YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not checkin or not checkout:
            return Response(
                {"error": "Invalid date format. Use YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if checkin >= checkout:
            return Response(
                {"error": "Checkin date must be before checkout date."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if checkin < date.today():
            return Response(
                {"error": "Checkin date cannot be in the past."},
                status=status.HTTP_400_BAD_REQUEST
            )

        available_rooms = Room.objects.filter(
            status=Room.Status.AVAILABLE,
            is_active=True
        )
        serializer = self.get_serializer(available_rooms, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=['is_active'])

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"detail": "Room deactivated successfully."},
            status=status.HTTP_204_NO_CONTENT
        )


# ============================================================
# CUSTOMER VIEWSET
# ============================================================
class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.filter(is_active=True)
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['full_name', 'phone', 'email', 'passport']
    ordering_fields = ['full_name', 'created_at', 'nationality']
    ordering = ['full_name']

    def get_serializer_class(self):
        if self.action == 'list':
            return CustomerListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return CustomerCreateUpdateSerializer
        return CustomerDetailSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        queryset = Customer.objects.filter(is_active=True)
        status_param = self.request.query_params.get('status')
        nationality = self.request.query_params.get('nationality')
        gender = self.request.query_params.get('gender')
        is_active = self.request.query_params.get('is_active')

        if status_param:
            queryset = queryset.filter(status=status_param)
        if nationality:
            queryset = queryset.filter(nationality=nationality)
        if gender:
            queryset = queryset.filter(gender=gender)
        if is_active is not None:
            is_active_bool = is_active.lower() == 'true'
            queryset = queryset.filter(is_active=is_active_bool)

        return queryset

    @action(detail=True, methods=['post'], url_path='reactivate')
    def reactivate(self, request, pk=None):
        try:
            customer = Customer.objects.get(pk=pk, is_active=False)
        except Customer.DoesNotExist:
            return Response(
                {"detail": "Customer not found or already active."},
                status=status.HTTP_404_NOT_FOUND
            )

        customer.is_active = True
        customer.save(update_fields=['is_active'])
        return Response(
            {"detail": "Customer reactivated successfully."},
            status=status.HTTP_200_OK
        )

    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=['is_active'])

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"detail": "Customer deactivated successfully."},
            status=status.HTTP_204_NO_CONTENT
        )


# ============================================================
# BOOKING VIEWSET
# ============================================================
class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.filter(is_active=True)
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['customer__full_name', 'room__number']
    ordering_fields = ['checkin', 'checkout', 'created_at', 'total_price']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return BookingListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return BookingCreateUpdateSerializer
        return BookingDetailSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'availability']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in permission_classes]

    # ========== CUSTOM ACTIONS ==========

    @action(detail=True, methods=['post'], url_path='check-in')
    def check_in(self, request, pk=None):
        booking = self.get_object()

        if booking.status == Booking.Status.CHECKED_IN:
            return Response(
                {"detail": "Booking is already checked in."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if booking.status == Booking.Status.CHECKED_OUT:
            return Response(
                {"detail": "Cannot check in a checked out booking."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if booking.status == Booking.Status.CANCELLED:
            return Response(
                {"detail": "Cannot check in a cancelled booking."},
                status=status.HTTP_400_BAD_REQUEST
            )

        booking.status = Booking.Status.CHECKED_IN
        booking.save(update_fields=['status'])

        room = booking.room
        room.status = Room.Status.OCCUPIED
        room.save(update_fields=['status'])

        return Response(
            {"detail": "Booking checked in successfully.", "status": booking.status},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'], url_path='check-out')
    def check_out(self, request, pk=None):
        booking = self.get_object()

        if booking.status != Booking.Status.CHECKED_IN:
            return Response(
                {"detail": "Only checked in bookings can be checked out."},
                status=status.HTTP_400_BAD_REQUEST
            )

        booking.status = Booking.Status.CHECKED_OUT
        booking.save(update_fields=['status'])

        room = booking.room
        room.status = Room.Status.AVAILABLE
        room.save(update_fields=['status'])

        return Response(
            {"detail": "Booking checked out successfully.", "status": booking.status},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel(self, request, pk=None):
        booking = self.get_object()

        if booking.status == Booking.Status.CANCELLED:
            return Response(
                {"detail": "Booking is already cancelled."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if booking.status == Booking.Status.CHECKED_OUT:
            return Response(
                {"detail": "Cannot cancel a checked out booking."},
                status=status.HTTP_400_BAD_REQUEST
            )

        booking.status = Booking.Status.CANCELLED
        booking.save(update_fields=['status'])

        room = booking.room
        if room.status == Room.Status.OCCUPIED:
            room.status = Room.Status.AVAILABLE
            room.save(update_fields=['status'])

        return Response(
            {"detail": "Booking cancelled successfully.", "status": booking.status},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'], url_path='availability')
    def availability(self, request):
        room_id = request.query_params.get('room')
        checkin_str = request.query_params.get('checkin')
        checkout_str = request.query_params.get('checkout')

        if not all([room_id, checkin_str, checkout_str]):
            return Response(
                {"error": "room, checkin, and checkout are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        import uuid
        try:
            uuid.UUID(room_id)
        except ValueError:
            return Response(
                {"error": "Invalid room UUID."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            checkin = date.fromisoformat(checkin_str)
            checkout = date.fromisoformat(checkout_str)
        except ValueError:
            return Response(
                {"error": "Invalid date format. Use YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            room = Room.objects.get(id=room_id, is_active=True)
        except Room.DoesNotExist:
            return Response(
                {"error": "Room not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        if room.status != Room.Status.AVAILABLE:
            return Response({
                "available": False,
                "reason": f"Room is currently {room.status}.",
                "conflicting_bookings": []
            }, status=status.HTTP_200_OK)

        overlapping = Booking.objects.filter(
            room=room,
            checkin__lt=checkout,
            checkout__gt=checkin,
            status__in=[Booking.Status.PENDING, Booking.Status.CHECKED_IN],
            is_active=True
        )

        if overlapping.exists():
            return Response({
                "available": False,
                "reason": "Room is already booked for these dates.",
                "conflicting_bookings": [
                    {
                        "id": str(b.id),
                        "checkin": str(b.checkin),
                        "checkout": str(b.checkout),
                        "status": b.status
                    } for b in overlapping
                ]
            }, status=status.HTTP_200_OK)

        return Response({
            "available": True,
            "room": {
                "id": str(room.id),
                "number": room.number,
                "price_per_night": str(room.price_per_night)
            },
            "checkin": checkin_str,
            "checkout": checkout_str,
            "nights": (checkout - checkin).days,
            "total_price": str(room.price_per_night * (checkout - checkin).days)
        }, status=status.HTTP_200_OK)

    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=['is_active'])

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"detail": "Booking deactivated successfully."},
            status=status.HTTP_204_NO_CONTENT
        )


# ============================================================
# PAYMENT VIEWSET
# ============================================================
class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.filter(is_active=True)
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['transaction_id', 'notes']
    ordering_fields = ['payment_date', 'amount', 'created_at']
    ordering = ['-payment_date']

    def get_serializer_class(self):
        if self.action == 'list':
            return PaymentListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return PaymentCreateUpdateSerializer
        return PaymentDetailSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        queryset = Payment.objects.filter(is_active=True)
        status_param = self.request.query_params.get('status')
        method = self.request.query_params.get('method')
        booking_id = self.request.query_params.get('booking')
        payment_date_after = self.request.query_params.get('payment_date_after')
        payment_date_before = self.request.query_params.get('payment_date_before')

        if status_param:
            queryset = queryset.filter(status=status_param)
        if method:
            queryset = queryset.filter(method=method)
        if booking_id:
            queryset = queryset.filter(booking_id=booking_id)
        if payment_date_after:
            queryset = queryset.filter(payment_date__date__gte=payment_date_after)
        if payment_date_before:
            queryset = queryset.filter(payment_date__date__lte=payment_date_before)

        return queryset

    @action(detail=True, methods=['post'], url_path='refund')
    @transaction.atomic
    def refund(self, request, pk=None):
        payment = self.get_object()

        if payment.status != Payment.Status.COMPLETED:
            return Response(
                {"detail": "Only completed payments can be refunded."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if payment.status == Payment.Status.REFUNDED:
            return Response(
                {"detail": "Payment is already refunded."},
                status=status.HTTP_400_BAD_REQUEST
            )

        Payment.objects.select_for_update().get(id=payment.id)

        payment.status = Payment.Status.REFUNDED
        payment.save(update_fields=['status'])

        return Response(
            {
                "detail": "Payment refunded successfully.",
                "payment_id": str(payment.id),
                "amount": str(payment.amount),
                "currency": payment.currency,
                "status": payment.status
            },
            status=status.HTTP_200_OK
        )

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=['is_active'])

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"detail": "Payment deactivated successfully."},
            status=status.HTTP_204_NO_CONTENT
        )


# ============================================================
# PUBLIC VIEWS
# ============================================================

class PublicRoomAvailabilityView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        checkin = request.query_params.get('checkin')
        checkout = request.query_params.get('checkout')

        if not checkin or not checkout:
            return Response(
                {"error": "checkin and checkout parameters are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            guest_count = int(request.query_params.get('guests', 1))
        except (TypeError, ValueError):
            return Response(
                {"error": "guests must be a valid integer."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            checkin_date = date.fromisoformat(checkin)
            checkout_date = date.fromisoformat(checkout)
        except ValueError:
            return Response(
                {"error": "Invalid date format. Use YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if checkin_date < date.today():
            return Response(
                {"error": "Check-in date cannot be in the past."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if checkout_date <= checkin_date:
            return Response(
                {"error": "Check-out must be after check-in."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if guest_count < 1:
            return Response(
                {"error": "Guest count must be at least 1."},
                status=status.HTTP_400_BAD_REQUEST
            )

        rooms = Room.objects.filter(
            is_active=True,
            status=Room.Status.AVAILABLE,
            capacity__gte=guest_count
        )

        overlapping_bookings = Booking.objects.filter(
            room__in=rooms,
            checkin__lt=checkout_date,
            checkout__gt=checkin_date,
            status__in=[Booking.Status.PENDING, Booking.Status.CHECKED_IN],
            is_active=True
        ).values_list('room_id', flat=True)

        available_rooms = rooms.exclude(id__in=overlapping_bookings)

        nights = (checkout_date - checkin_date).days
        result = []
        for room in available_rooms:
            total_price = room.price_per_night * nights
            room_data = {
                'id': room.id,
                'number': room.number,
                'room_type': room.room_type,
                'capacity': room.capacity,
                'price_per_night': room.price_per_night,
                'description': room.description,
                'total_price': total_price,
            }
            result.append(room_data)

        serializer = PublicAvailabilitySerializer(result, many=True)
        return Response({
            'checkin': checkin,
            'checkout': checkout,
            'guests': guest_count,
            'rooms': serializer.data
        })


class PublicBookingCreateView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PublicBookingRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"error": "Validation failed", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            result = PublicBookingService.create_public_booking(serializer.validated_data)
            booking = result['booking']
            reference = result['reference']

            response_data = {
                'id': booking.id,
                'reference': reference,
                'room': {
                    'id': str(booking.room.id),
                    'number': booking.room.number,
                    'type': booking.room.room_type,
                },
                'checkin': booking.checkin,
                'checkout': booking.checkout,
                'guest_count': booking.guest_count,
                'total_price': booking.total_price,
                'currency': 'USD',
                'status': booking.status,
                'created_at': booking.created_at,
            }

            return Response({
                'success': True,
                'booking': response_data
            }, status=status.HTTP_201_CREATED)

        except ValidationError as e:
            return Response({
                'error': 'Validation error',
                'details': e.message_dict if hasattr(e, 'message_dict') else str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({
                'error': 'An unexpected error occurred. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PublicBookingStatusView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        reference = request.query_params.get('reference')
        booking_id = request.query_params.get('id')

        if not reference or not booking_id:
            return Response({
                'error': 'Both reference and id are required.'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            booking = Booking.objects.select_related('room').get(
                id=booking_id,
                reference=reference,
                is_active=True
            )
        except (Booking.DoesNotExist, ValidationError, ValueError, TypeError):
            return Response({
                'error': 'Booking not found.'
            }, status=status.HTTP_404_NOT_FOUND)

        response_data = {
            'reference': booking.reference,
            'room_number': booking.room.number,
            'checkin': booking.checkin,
            'checkout': booking.checkout,
            'guest_count': booking.guest_count,
            'total_price': booking.total_price,
            'status': booking.status,
            'created_at': booking.created_at,
        }

        serializer = PublicBookingStatusResponseSerializer(response_data)
        return Response(serializer.data, status=status.HTTP_200_OK)