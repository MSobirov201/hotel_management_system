from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RoomViewSet, CustomerViewSet, BookingViewSet, PaymentViewSet,
    PublicRoomAvailabilityView, PublicBookingCreateView, PublicBookingStatusView,
)

router = DefaultRouter()
router.register(r'rooms', RoomViewSet, basename='room')
router.register(r'customers', CustomerViewSet, basename='customer')
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'payments', PaymentViewSet, basename='payment')

urlpatterns = [
    # Public endpoints (AllowAny — no JWT required). Listed before the
    # router include so they're matched first; no overlap exists with
    # router-registered paths (rooms/customers/bookings/payments) since
    # these are namespaced under 'public/'.
    path('public/rooms/availability/', PublicRoomAvailabilityView.as_view(), name='public-rooms-availability'),
    path('public/bookings/status/', PublicBookingStatusView.as_view(), name='public-booking-status'),
    path('public/bookings/', PublicBookingCreateView.as_view(), name='public-booking-create'),

    path('', include(router.urls)),
]













































































# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from .views import HotelRoomViewSet, BookingViewSet, GuestViewSet
#
# router = DefaultRouter()
# router.register(r'rooms', HotelRoomViewSet, basename='room')
# router.register(r'bookings', BookingViewSet, basename='booking')
# router.register(r'guests', GuestViewSet, basename='guest')
#
# urlpatterns = [
#     path('', include(router.urls)),
# ]
#
#
#
#
#
#
# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from .views import RoomViewSet, CustomerViewSet, BookingViewSet, PaymentViewSet
#
# router = DefaultRouter()
# router.register(r'rooms', RoomViewSet, basename='room')
# router.register(r'customers', CustomerViewSet, basename='customer')
# router.register(r'bookings', BookingViewSet, basename='booking')
# router.register(r'payments', PaymentViewSet, basename='payment')  # <-- QO‘SHILDI
#
# urlpatterns = [
#     path('', include(router.urls)),
# ]


























# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from .views import (
#     RoomViewSet, CustomerViewSet, BookingViewSet, PaymentViewSet,
#     PublicRoomAvailabilityView, PublicBookingCreateView, PublicBookingStatusView
# )
#
# router = DefaultRouter()
# router.register(r'rooms', RoomViewSet, basename='room')
# router.register(r'customers', CustomerViewSet, basename='customer')
# router.register(r'bookings', BookingViewSet, basename='booking')
# router.register(r'payments', PaymentViewSet, basename='payment')
#
# urlpatterns = [
#     path('', include(router.urls)),
#     # Public endpoints
#     path('public/rooms/availability/', PublicRoomAvailabilityView.as_view(), name='public-rooms-availability'),
#     path('public/bookings/', PublicBookingCreateView.as_view(), name='public-booking-create'),
#     path('public/bookings/status/', PublicBookingStatusView.as_view(), name='public-booking-status'),
# ]