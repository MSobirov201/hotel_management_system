from rest_framework import serializers
from .models import Room, Customer, Booking, Payment

# ============================================================
# ROOM SERIALIZER
# ============================================================

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = [
            'id', 'number', 'floor', 'room_type', 'capacity',
            'price_per_night', 'status', 'description',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_price_per_night(self, value):
        if value < 0:
            raise serializers.ValidationError("Price per night cannot be negative.")
        return value

    def validate_capacity(self, value):
        if value < 1:
            raise serializers.ValidationError("Capacity must be at least 1.")
        return value


# ============================================================
# CUSTOMER SERIALIZERS
# ============================================================

class CustomerListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['id', 'full_name', 'phone', 'email', 'gender', 'nationality', 'status', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class CustomerDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class CustomerCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_active']

    def validate_full_name(self, value):
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError("Full name must be at least 2 characters.")
        allowed_chars = (" ", "-", "'", ".")
        for char in value:
            if not (char.isalpha() or char in allowed_chars):
                raise serializers.ValidationError(
                    "Full name must contain only letters, spaces, hyphens, apostrophes, and dots."
                )
        return value

    def validate_passport(self, value):
        value = value.strip().upper()
        if len(value) < 6:
            raise serializers.ValidationError("Passport number must be at least 6 characters.")
        if not value.isalnum():
            raise serializers.ValidationError("Passport number must contain only letters and numbers.")
        return value

    def validate_phone(self, value):
        import re as _re
        value = (value or '').strip()
        normalized = _re.sub(r'[\s\-\(\)]', '', value)
        if not normalized.startswith('+'):
            raise serializers.ValidationError("Telefon '+' bilan boshlanishi kerak.")
        if len(normalized) < 10:
            raise serializers.ValidationError("Telefon raqami juda qisqa.")
        if not normalized[1:].isdigit():
            raise serializers.ValidationError("Faqat raqamlar bo'lishi kerak.")
        return normalized

    def validate_date_of_birth(self, value):
        if value:
            from datetime import date
            if value > date.today():
                raise serializers.ValidationError("Date of birth cannot be in the future.")
        return value

    def validate_emergency_contact(self, value):
        if not value:
            return value
        if not isinstance(value, dict):
            raise serializers.ValidationError("Emergency contact must be a JSON object.")
        required_keys = ['name', 'phone']
        for key in required_keys:
            if key not in value or not value.get(key):
                raise serializers.ValidationError(f'Emergency contact must include "{key}" field.')
        ec_phone = value.get('phone', '').strip()
        if not ec_phone.startswith('+'):
            raise serializers.ValidationError('Emergency contact phone must be in international format.')
        return value

    def validate(self, data):
        phone = data.get('phone')
        emergency_contact = data.get('emergency_contact')
        if phone and emergency_contact and isinstance(emergency_contact, dict):
            ec_phone = emergency_contact.get('phone')
            if ec_phone and ec_phone == phone:
                raise serializers.ValidationError({
                    'emergency_contact': 'Emergency contact phone must be different from customer\'s phone.'
                })
        return data


# ============================================================
# BOOKING SERIALIZERS
# ============================================================

class BookingListSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    room_number = serializers.CharField(source='room.number', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'customer_name', 'room_number', 'checkin', 'checkout',
            'status', 'total_price', 'guest_count', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class BookingDetailSerializer(serializers.ModelSerializer):
    customer = CustomerDetailSerializer(read_only=True)
    room = RoomSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ['id', 'total_price', 'created_at', 'updated_at', 'is_active']


class BookingCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ['id', 'total_price', 'created_at', 'updated_at', 'is_active']

    def validate_checkin(self, value):
        from datetime import date
        if self.instance is None and value < date.today():
            raise serializers.ValidationError("Check-in date cannot be in the past.")
        return value

    def validate_guest_count(self, value):
        if value < 1:
            raise serializers.ValidationError("Guest count must be at least 1.")
        return value

    def validate(self, data):
        checkin = data.get('checkin')
        checkout = data.get('checkout')
        guest_count = data.get('guest_count')
        room = data.get('room')

        if checkin and checkout and checkout <= checkin:
            raise serializers.ValidationError({
                'checkout': 'Check-out date must be after check-in date.'
            })

        if guest_count and room and guest_count > room.capacity:
            raise serializers.ValidationError({
                'guest_count': f'Guest count ({guest_count}) exceeds room capacity ({room.capacity}).'
            })

        return data






class PaymentListSerializer(serializers.ModelSerializer):
    """
    Payment list view uchun serializer.
    """

    class Meta:
        model = Payment
        fields = [
            'id',
            'booking',
            'amount',
            'currency',
            'method',
            'status',
            'payment_date',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PaymentDetailSerializer(serializers.ModelSerializer):
    """
    Payment detail view uchun serializer.
    Nested booking ma'lumotlari bilan.
    """

    booking = BookingDetailSerializer(read_only=True)

    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class PaymentCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Payment create/update uchun serializer.
    Validatsiyalar bilan.
    Completed payment immutability: amount, currency, transaction_id, payment_date, booking
    o'zgartirilmaydi.
    """

    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

    # ========== FIELD VALIDATIONS ==========

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Payment amount must be greater than zero."
            )
        return value

    def validate_payment_date(self, value):
        from django.utils import timezone
        if value > timezone.now():
            raise serializers.ValidationError(
                "Payment date cannot be in the future."
            )
        return value

    def validate_transaction_id(self, value):
        if value:
            # Check uniqueness (excluding current instance if updating)
            instance = getattr(self, 'instance', None)
            qs = Payment.objects.filter(transaction_id=value)
            if instance:
                qs = qs.exclude(id=instance.id)
            if qs.exists():
                raise serializers.ValidationError(
                    "Transaction ID must be unique."
                )
        return value

    # ========== CROSS-FIELD VALIDATION ==========

    def validate(self, data):
        instance = getattr(self, 'instance', None)

        # 1. Completed payment immutability
        if instance and instance.status == Payment.Status.COMPLETED:
            immutable_fields = ['amount', 'currency', 'transaction_id', 'payment_date', 'booking']
            for field in immutable_fields:
                if field in data and getattr(instance, field) != data[field]:
                    raise serializers.ValidationError({
                        field: f'Cannot change {field} for a completed payment.'
                    })

        # 2. Overpayment validation
        # Determine final status (from data or existing instance)
        final_status = data.get('status') or (instance and instance.status)
        booking = data.get('booking') or (instance and instance.booking)
        amount = data.get('amount') or (instance and instance.amount)

        # Only validate if final_status is COMPLETED
        if booking and amount and final_status == Payment.Status.COMPLETED:
            from django.db.models import Sum
            completed_total = Payment.objects.filter(
                booking=booking,
                status=Payment.Status.COMPLETED,
                is_active=True
            ).aggregate(total=Sum('amount'))['total'] or 0

            # If updating, exclude current payment if it was completed
            # (but if we are updating a PENDING payment, it's not completed, so no need to exclude)
            if instance and instance.status == Payment.Status.COMPLETED:
                completed_total -= instance.amount

            new_total = completed_total + amount

            if new_total > booking.total_price:
                raise serializers.ValidationError({
                    'amount': (
                        f'Overpayment detected. Total completed payments ({completed_total}) '
                        f'+ new amount ({amount}) = {new_total} exceeds booking total ({booking.total_price}).'
                    )
                })

        return data

    # ... rest of the serializer ...




# ============================================================
# PUBLIC BOOKING SERIALIZERS
# ============================================================

from datetime import date


class PublicAvailabilitySerializer(serializers.Serializer):
    """
    Public room availability response serializer.
    """
    id = serializers.UUIDField()
    number = serializers.CharField()
    room_type = serializers.CharField()
    capacity = serializers.IntegerField()
    price_per_night = serializers.DecimalField(max_digits=10, decimal_places=2)
    description = serializers.CharField(allow_blank=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)


class PublicBookingRequestSerializer(serializers.Serializer):
    """
    Public booking request validation serializer.
    """
    room = serializers.UUIDField(required=True)
    full_name = serializers.CharField(max_length=255, required=True)
    passport = serializers.CharField(max_length=20, required=True)
    phone = serializers.CharField(max_length=20, required=True)
    email = serializers.EmailField(max_length=255, required=False, allow_blank=True)
    checkin = serializers.DateField(required=True)
    checkout = serializers.DateField(required=True)
    guest_count = serializers.IntegerField(required=False, default=1, min_value=1)
    special_requests = serializers.CharField(required=False, allow_blank=True)

    def validate_full_name(self, value):
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError("Full name must be at least 2 characters.")
        allowed = (" ", "-", "'", ".")
        for char in value:
            if not (char.isalpha() or char in allowed):
                raise serializers.ValidationError(
                    "Full name must contain only letters, spaces, hyphens, apostrophes, and dots."
                )
        return value

    def validate_passport(self, value):
        value = value.strip().upper()
        if len(value) < 6:
            raise serializers.ValidationError("Passport number must be at least 6 characters.")
        if not value.isalnum():
            raise serializers.ValidationError("Passport must contain only letters and numbers.")
        return value

    def validate_phone(self, value):
        import re as _re
        value = (value or '').strip()
        normalized = _re.sub(r'[\s\-\(\)]', '', value)
        if not normalized.startswith('+'):
            raise serializers.ValidationError("Telefon '+' bilan boshlanishi kerak.")
        if len(normalized) < 10:
            raise serializers.ValidationError("Telefon raqami juda qisqa.")
        if not normalized[1:].isdigit():
            raise serializers.ValidationError("Faqat raqamlar bo'lishi kerak.")
        return normalized

    def validate_email(self, value):
        if value and '@' not in value:
            raise serializers.ValidationError("Please enter a valid email address.")
        return value

    def validate(self, data):
        checkin = data.get('checkin')
        checkout = data.get('checkout')
        guest_count = data.get('guest_count', 1)

        if checkin and checkout and checkout <= checkin:
            raise serializers.ValidationError({
                'checkout': 'Check-out must be after check-in.'
            })

        if checkin and checkin < date.today():
            raise serializers.ValidationError({
                'checkin': 'Check-in date cannot be in the past.'
            })

        if guest_count < 1:
            raise serializers.ValidationError({
                'guest_count': 'Guest count must be at least 1.'
            })

        return data


class PublicBookingResponseSerializer(serializers.Serializer):
    """
    Public booking response serializer (excludes admin/internal fields).
    """
    id = serializers.UUIDField()
    reference = serializers.CharField()
    room = serializers.SerializerMethodField()
    checkin = serializers.DateField()
    checkout = serializers.DateField()
    guest_count = serializers.IntegerField()
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    currency = serializers.CharField(default='USD')
    status = serializers.CharField()
    created_at = serializers.DateTimeField()

    def get_room(self, obj):
        booking = obj.get('booking') if isinstance(obj, dict) else obj
        return {
            'id': str(booking.room.id),
            'number': booking.room.number,
            'type': booking.room.room_type,
        }


class PublicBookingStatusResponseSerializer(serializers.Serializer):
    """
    Public booking status response (secure, minimal fields).
    """
    reference = serializers.CharField()
    room_number = serializers.CharField()
    checkin = serializers.DateField()
    checkout = serializers.DateField()
    guest_count = serializers.IntegerField()
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    status = serializers.CharField()
    created_at = serializers.DateTimeField()