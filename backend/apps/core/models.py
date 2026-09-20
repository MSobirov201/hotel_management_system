import uuid
from datetime import date

from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

class Room(models.Model):
    """
    Mehmonxona xonasi modeli.
    Enterprise darajadagi maydonlar va indekslar bilan.
    """

    class Status(models.TextChoices):
        AVAILABLE = 'available', _('Bo\'sh')
        BOOKED = 'booked', _('Band qilingan')
        OCCUPIED = 'occupied', _('Band (mehmon joylashgan)')
        CLEANING = 'cleaning', _('Tozalashda')
        MAINTENANCE = 'maintenance', _('Ta\'mirlanmoqda')
        OUT_OF_SERVICE = 'out_of_service', _('Foydalanishdan chiqarilgan')

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text=_('Unique identifier for the room.')
    )
    number = models.CharField(
        max_length=10,
        unique=True,
        db_index=True,
        help_text=_('Room number (e.g., 101, 202).')
    )
    floor = models.PositiveSmallIntegerField(
        help_text=_('Floor number where the room is located.')
    )
    room_type = models.CharField(
        max_length=50,
        db_index=True,
        help_text=_('Type of room (e.g., Standard, Deluxe, Suite).')
    )
    capacity = models.PositiveSmallIntegerField(
        default=5,
        help_text=_('Maximum number of guests (1-5).')
    )
    price_per_night = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text=_('Price per night in USD.')
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.AVAILABLE,
        db_index=True,
        help_text=_('Current status of the room.')
    )
    description = models.TextField(
        blank=True,
        help_text=_('Additional details about the room.')
    )
    is_active = models.BooleanField(
        default=True,
        db_index=True,
        help_text=_('Soft delete flag. Inactive rooms are hidden from public.')
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text=_('Timestamp when the room was created.')
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text=_('Timestamp when the room was last updated.')
    )

    class Meta:
        ordering = ['number']
        indexes = [
            models.Index(fields=['status', 'is_active']),
            models.Index(fields=['room_type', 'price_per_night']),
        ]
        verbose_name = _('Room')
        verbose_name_plural = _('Rooms')

    def __str__(self):
        return f'Room {self.number} ({self.get_status_display()})'

    def clean(self):
        """Model validation (to be used in serializers/forms)."""
        from django.core.exceptions import ValidationError
        if self.price_per_night < 0:
            raise ValidationError({'price_per_night': _('Price cannot be negative.')})
        if self.capacity < 1:
            raise ValidationError({'capacity': _('Capacity must be at least 1.')})

    def save(self, *args, **kwargs):
        self.full_clean()  # triggers clean() before saving
        super().save(*args, **kwargs)










class Customer(models.Model):
    """
    Mehmonxona mijozlari modeli.
    Shaxsiy ma'lumotlar, aloqa va biznes holatini o'z ichiga oladi.
    """

    class Status(models.TextChoices):
        ACTIVE = 'active', _('Active')
        INACTIVE = 'inactive', _('Inactive')
        BLOCKED = 'blocked', _('Blocked')

    # === Primary Key ===
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text=_('Unique identifier for the customer.')
    )

    # === Personal Information ===
    full_name = models.CharField(
        max_length=255,
        help_text=_('Customer\'s full legal name.')
    )

    passport = models.CharField(
        max_length=20,
        unique=True,
        db_index=True,
        help_text=_('Passport or ID number (e.g., UZ1234567).')
    )

    phone = models.CharField(
        max_length=20,
        unique=True,
        db_index=True,
        help_text=_('Phone number in international format (e.g., +998901234567).')
    )

    email = models.EmailField(
        max_length=255,
        unique=True,
        blank=True,
        null=True,
        help_text=_('Email address (optional but unique).')
    )

    gender = models.CharField(
        max_length=10,
        blank=True,
        choices=[
            ('M', _('Male')),
            ('F', _('Female')),
            ('Other', _('Other')),
        ],
        help_text=_('Gender identity.')
    )

    date_of_birth = models.DateField(
        blank=True,
        null=True,
        help_text=_('Date of birth (YYYY-MM-DD). Must not be in the future.')
    )

    nationality = models.CharField(
        max_length=50,
        blank=True,
        db_index=True,
        help_text=_('Nationality (e.g., Uzbekistan, USA).')
    )

    address = models.TextField(
        blank=True,
        help_text=_('Residential address.')
    )

    # === Emergency Contact ===
    emergency_contact = models.JSONField(
        default=dict,
        blank=True,
        help_text=_('Emergency contact: {"name": "John", "phone": "+998...", "relation": "Spouse"}')
    )

    # === Status & Soft-delete ===
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
        db_index=True,
        help_text=_('Business status of the customer.')
    )

    is_active = models.BooleanField(
        default=True,
        db_index=True,
        help_text=_('Soft-delete flag. Inactive customers are hidden from active views.')
    )

    notes = models.TextField(
        blank=True,
        help_text=_('Internal notes about the customer.')
    )

    # === Audit Fields ===
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text=_('Timestamp when the customer was created.')
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text=_('Timestamp when the customer was last updated.')
    )

    class Meta:
        ordering = ['full_name']
        indexes = [
            models.Index(fields=['status', 'is_active'], name='cust_status_active_idx'),
            models.Index(fields=['nationality'], name='cust_nationality_idx'),
            models.Index(fields=['created_at'], name='cust_created_at_idx'),
        ]
        verbose_name = _('Customer')
        verbose_name_plural = _('Customers')

    def __str__(self):
        return f'{self.full_name} ({self.phone})'

    def clean(self):
        """
        Model-level validation.
        Called automatically before save via full_clean().
        """
        # full_name validation (Unicode-aware)
        if self.full_name:
            full_name = self.full_name.strip()
            if len(full_name) < 2:
                raise ValidationError({
                    'full_name': _('Full name must be at least 2 characters.')
                })
            allowed_chars = (" ", "-", "'", ".")
            for char in full_name:
                if not (char.isalpha() or char in allowed_chars):
                    raise ValidationError({
                        'full_name': _(
                            'Full name must contain only letters, spaces, hyphens, apostrophes, and dots.'
                        )
                    })
            self.full_name = full_name

        # date_of_birth validation
        if self.date_of_birth:
            from datetime import date
            if self.date_of_birth > date.today():
                raise ValidationError({
                    'date_of_birth': _('Date of birth cannot be in the future.')
                })

        # phone validation (basic format check)
        if self.phone:
            phone = self.phone.strip()
            if not phone.startswith('+'):
                raise ValidationError({
                    'phone': _('Phone number must start with "+" (international format).')
                })
            if len(phone) < 10:
                raise ValidationError({
                    'phone': _('Phone number is too short.')
                })
            self.phone = phone

        # passport validation (basic format check)
        if self.passport:
            passport = self.passport.strip().upper()
            if len(passport) < 6:
                raise ValidationError({
                    'passport': _('Passport number must be at least 6 characters.')
                })
            self.passport = passport

        # emergency_contact validation
        if self.emergency_contact:
            ec = self.emergency_contact
            required_keys = ['name', 'phone']
            for key in required_keys:
                if key not in ec or not ec.get(key):
                    raise ValidationError({
                        'emergency_contact': _(
                            f'Emergency contact must include "{key}" field.'
                        )
                    })
            # Ensure emergency contact phone is different from customer's phone
            if ec.get('phone') == self.phone:
                raise ValidationError({
                    'emergency_contact': _(
                        'Emergency contact phone must be different from customer\'s phone.'
                    )
                })

    def save(self, *args, **kwargs):
        """
        Override save to ensure full_clean() is called before saving.
        """
        self.full_clean()
        super().save(*args, **kwargs)








class Booking(models.Model):
    """
    Mehmonxona bron qilish modeli.
    Customer va Room o‘rtasidagi bog‘lovchi.
    """

    class Status(models.TextChoices):
        PENDING = 'pending', _('Pending')
        CHECKED_IN = 'checked_in', _('Checked In')
        CHECKED_OUT = 'checked_out', _('Checked Out')
        CANCELLED = 'cancelled', _('Cancelled')
        NO_SHOW = 'no_show', _('No Show')

    # === Primary Key ===
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text=_('Unique identifier for the booking.')
    )

    # === Public Reference ===
    reference = models.CharField(
        max_length=20,
        unique=True,
        null=True,
        blank=True,
        db_index=True,
        help_text=_('Public booking reference code (e.g. HMS-2026-ABC123). Only set for public bookings.')
    )

    # === Relationships ===
    customer = models.ForeignKey(
        'Customer',
        on_delete=models.PROTECT,
        related_name='bookings',
        help_text=_('Customer who made the booking.')
    )

    room = models.ForeignKey(
        'Room',
        on_delete=models.PROTECT,
        related_name='bookings',
        help_text=_('Room being booked.')
    )

    # === Dates ===
    checkin = models.DateField(
        help_text=_('Check-in date.')
    )

    checkout = models.DateField(
        help_text=_('Check-out date.')
    )

    # === Status ===
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
        help_text=_('Current booking status.')
    )

    # === Financial ===
    total_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text=_('Total price for the stay (snapshot).')
    )

    # === Guest Info ===
    guest_count = models.PositiveSmallIntegerField(
        default=2,
        help_text=_('Number of guests.')
    )

    # === Additional Info ===
    special_requests = models.TextField(
        blank=True,
        help_text=_('Special requests from the customer.')
    )

    notes = models.TextField(
        blank=True,
        help_text=_('Internal notes about the booking.')
    )

    # === Soft Delete ===
    is_active = models.BooleanField(
        default=True,
        db_index=True,
        help_text=_('Soft-delete flag.')
    )

    # === Audit ===
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text=_('Timestamp when the booking was created.')
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        help_text=_('Timestamp when the booking was last updated.')
    )

    class Meta:
        indexes = [
            models.Index(fields=['room', 'checkin', 'checkout'], name='book_room_cin_cout_idx'),
            models.Index(fields=['customer', 'status'], name='book_cust_stat_idx'),
            models.Index(fields=['status', 'checkin'], name='book_stat_cin_idx'),
        ]
        verbose_name = _('Booking')
        verbose_name_plural = _('Bookings')

    def __str__(self):
        return f'Booking #{str(self.id)[:8]} - {self.customer.full_name}'

    def clean(self):
        """
        Model-level validation.
        """
        # 1. checkout must be after checkin
        if self.checkin and self.checkout and self.checkout <= self.checkin:
            raise ValidationError({
                'checkout': _('Check-out date must be after check-in date.')
            })

        # 2. checkin cannot be in the past — enforced only at creation time.
        # Once a booking exists, its checkin date becomes a historical fact
        # and must not block later lifecycle updates (check-in, check-out,
        # cancel, etc.) performed via save(update_fields=[...]) after that
        # date has naturally elapsed.
        if self._state.adding and self.checkin and self.checkin < date.today():
            raise ValidationError({
                'checkin': _('Check-in date cannot be in the past.')
            })

        # 3. guest_count must be at least 1
        if self.guest_count < 1:
            raise ValidationError({
                'guest_count': _('Guest count must be at least 1.')
            })

        # 4. guest_count cannot exceed room capacity
        if self.guest_count and self.room and self.guest_count > self.room.capacity:
            raise ValidationError({
                'guest_count': _(
                    f'Guest count ({self.guest_count}) exceeds room capacity ({self.room.capacity}).'
                )
            })

        # 5. Status transition validation (business rules)
        # Deferred to STEP 5, but basic check for now

    def save(self, *args, **kwargs):
        """
        Override save to:
        1. Calculate total_price from room.price_per_night
        2. Call full_clean() for validation
        """
        # Calculate total_price if not set or if room/checkin/checkout changed
        if self.room and self.checkin and self.checkout:
            nights = (self.checkout - self.checkin).days
            if nights > 0:
                self.total_price = self.room.price_per_night * nights

        self.full_clean()
        super().save(*args, **kwargs)


class Payment(models.Model):
    """
    To'lov modeli. Booking bilan bog'liq moliyaviy tranzaksiyalar.
    """

    class Status(models.TextChoices):
        PENDING = 'pending', _('Pending')
        COMPLETED = 'completed', _('Completed')
        FAILED = 'failed', _('Failed')
        REFUNDED = 'refunded', _('Refunded')

    class Method(models.TextChoices):
        CASH = 'cash', _('Cash')
        CARD = 'card', _('Card')
        BANK_TRANSFER = 'bank_transfer', _('Bank Transfer')
        ONLINE = 'online', _('Online')

    class Currency(models.TextChoices):
        USD = 'USD', 'USD'
        EUR = 'EUR', 'EUR'
        UZS = 'UZS', 'UZS'

    # === Primary Key ===
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text=_('Unique identifier for the payment.')
    )

    # === Relationships ===
    booking = models.ForeignKey(
        'Booking',
        on_delete=models.PROTECT,
        related_name='payments',
        help_text=_('Associated booking.')
    )

    # === Financial ===
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text=_('Payment amount.')
    )

    currency = models.CharField(
        max_length=3,
        choices=Currency.choices,
        default=Currency.USD,
        help_text=_('Currency of the payment.')
    )

    # === Payment Details ===
    method = models.CharField(
        max_length=20,
        choices=Method.choices,
        help_text=_('Payment method.')
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
        help_text=_('Payment status.')
    )

    transaction_id = models.CharField(
        max_length=100,
        unique=True,
        blank=True,
        null=True,
        help_text=_('External transaction reference (optional).')
    )

    payment_date = models.DateTimeField(
        default=timezone.now,
        help_text=_('Date and time of payment.')
    )

    notes = models.TextField(
        blank=True,
        help_text=_('Internal notes.')
    )

    # === Soft Delete ===
    is_active = models.BooleanField(
        default=True,
        db_index=True,
        help_text=_('Soft-delete flag.')
    )

    # === Audit ===
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text=_('Timestamp when the payment was created.')
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text=_('Timestamp when the payment was last updated.')
    )

    class Meta:
        ordering = ['-payment_date']
        indexes = [
            models.Index(fields=['booking', 'status'], name='pay_booking_status_idx'),
            models.Index(fields=['status'], name='pay_status_idx'),
            models.Index(fields=['payment_date'], name='pay_payment_date_idx'),
        ]
        verbose_name = _('Payment')
        verbose_name_plural = _('Payments')

    def __str__(self):
        return f'Payment #{str(self.id)[:8]} - {self.amount} {self.currency} ({self.status})'

    def clean(self):
        """
        Model-level validation.
        """
        # amount must be positive
        if self.amount is not None and self.amount <= 0:
            raise ValidationError({
                'amount': _('Payment amount must be greater than zero.')
            })

        # payment_date cannot be in the future
        if self.payment_date and self.payment_date > timezone.now():
            raise ValidationError({
                'payment_date': _('Payment date cannot be in the future.')
            })

        # booking must exist and be active (checked by FK)

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)