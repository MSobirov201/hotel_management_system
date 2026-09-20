import random
import string

from django.db import transaction, IntegrityError
from django.core.exceptions import ValidationError
from datetime import date
from .models import Room, Customer, Booking


class PublicBookingService:
    """
    Public booking business logic.
    Handles customer creation, availability check, and booking creation with double-booking protection.
    """

    @staticmethod
    def get_or_create_customer(data):
        """
        Find existing customer by phone or email, or create a new one.

        When enriching an existing customer's profile with newly-supplied
        contact details, any value that already belongs to a *different*
        customer is skipped rather than applied, since phone/email/passport
        are unique fields and blindly overwriting would raise an
        IntegrityError and abort the whole booking. The booking still
        proceeds using the originally matched customer record.
        """
        phone = data.get('phone')
        email = data.get('email')
        full_name = data.get('full_name')
        passport = data.get('passport')

        def _safe_enrich(customer, updates):
            """
            Apply only the fields in `updates` that don't collide with a
            different existing customer, then save. Falls back to a no-op
            save-skip on an unexpected IntegrityError so booking creation
            is never blocked by a profile-enrichment conflict.
            """
            fields_to_update = []
            for field_name, value in updates.items():
                if not value:
                    continue
                if getattr(customer, field_name):
                    continue  # already set, don't overwrite
                conflict = Customer.objects.filter(
                    **{field_name: value}
                ).exclude(pk=customer.pk).exists()
                if conflict:
                    continue  # belongs to a different customer, skip
                setattr(customer, field_name, value)
                fields_to_update.append(field_name)

            if full_name and customer.full_name != full_name:
                customer.full_name = full_name
                fields_to_update.append('full_name')

            if fields_to_update:
                try:
                    customer.save(update_fields=fields_to_update)
                except IntegrityError:
                    # Extremely unlikely race between the check above and
                    # this save; keep the customer usable for the booking
                    # without the enrichment rather than failing the flow.
                    pass
            return customer

        # Try to find by phone
        if phone:
            customer = Customer.objects.filter(phone=phone).first()
            if customer:
                return _safe_enrich(customer, {'email': email, 'passport': passport})

        # Try by email
        if email:
            customer = Customer.objects.filter(email=email).first()
            if customer:
                return _safe_enrich(customer, {'phone': phone, 'passport': passport})

        # Create new customer
        customer_data = {
            'full_name': full_name,
            'passport': passport,
            'phone': phone,
            'status': Customer.Status.ACTIVE,
            'is_active': True,
        }
        if email:
            customer_data['email'] = email

        customer = Customer(**customer_data)
        customer.full_clean()
        customer.save()
        return customer

    @staticmethod
    def _generate_unique_reference():
        """
        Generate a booking reference in the form HMS-{year}-{6 random
        alphanumeric chars}, retrying on the astronomically unlikely
        chance of a collision with an existing reference.
        """
        for _ in range(5):
            ref_suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            candidate = f"HMS-{date.today().year}-{ref_suffix}"
            if not Booking.objects.filter(reference=candidate).exists():
                return candidate
        # Fall back to a longer suffix if we somehow collided 5 times in a row
        ref_suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
        return f"HMS-{date.today().year}-{ref_suffix}"

    @classmethod
    def create_public_booking(cls, data):
        """
        Main public booking creation flow with double-booking protection.
        """
        room_id = data.get('room')
        checkin = data.get('checkin')
        checkout = data.get('checkout')
        guest_count = data.get('guest_count', 1)
        special_requests = data.get('special_requests', '')

        # Basic validation
        if checkin < date.today():
            raise ValidationError({'checkin': 'Check-in date cannot be in the past.'})
        if checkout <= checkin:
            raise ValidationError({'checkout': 'Check-out must be after check-in.'})
        if guest_count < 1:
            raise ValidationError({'guest_count': 'Guest count must be at least 1.'})

        with transaction.atomic():
            # Lock room row
            try:
                room = Room.objects.select_for_update().get(id=room_id, is_active=True)
            except Room.DoesNotExist:
                raise ValidationError({'room': 'Room not found or unavailable.'})

            # Check room status
            if room.status != Room.Status.AVAILABLE:
                raise ValidationError({'room': 'Room is not currently available for booking.'})

            # Check guest count vs capacity
            if guest_count > room.capacity:
                raise ValidationError({
                    'guest_count': f'Guest count ({guest_count}) exceeds room capacity ({room.capacity}).'
                })

            # Re-check availability inside transaction (double-booking protection)
            overlapping = Booking.objects.filter(
                room=room,
                checkin__lt=checkout,
                checkout__gt=checkin,
                status__in=[Booking.Status.PENDING, Booking.Status.CHECKED_IN],
                is_active=True
            ).exists()

            if overlapping:
                raise ValidationError({'room': 'Room is already booked for the selected dates.'})

            # Get or create customer
            customer = cls.get_or_create_customer(data)

            # Calculate total price
            nights = (checkout - checkin).days
            if nights <= 0:
                raise ValidationError({'checkout': 'Check-out must be after check-in.'})
            total_price = room.price_per_night * nights

            # Generate the public reference before creating the booking so
            # it can be persisted on the row itself (needed for the public
            # status-lookup endpoint to query by reference directly).
            booking_reference = cls._generate_unique_reference()

            # Create booking
            booking = Booking(
                customer=customer,
                room=room,
                checkin=checkin,
                checkout=checkout,
                guest_count=guest_count,
                special_requests=special_requests,
                status=Booking.Status.PENDING,
                total_price=total_price,
                reference=booking_reference,
                is_active=True
            )
            booking.full_clean()
            booking.save()

            # MUHIM: Xona statusini "booked" qilish
            room.status = Room.Status.BOOKED
            room.save(update_fields=['status'])

            return {
                'booking': booking,
                'reference': booking_reference,
            }