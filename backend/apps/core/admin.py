from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import Room, Customer, Booking, Payment


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    """
    Admin panel uchun Room boshqaruvi.
    """

    list_display = (
        'number',
        'room_type',
        'floor',
        'capacity',
        'price_per_night',
        'status',
        'is_active',
        'created_at',
    )
    list_filter = (
        'status',
        'room_type',
        'floor',
        'is_active',
    )
    search_fields = (
        'number',
        'room_type',
        'description',
    )
    ordering = ('number',)
    readonly_fields = ('id', 'created_at', 'updated_at')
    fieldsets = (
        (None, {
            'fields': ('id', 'number', 'floor', 'room_type', 'capacity', 'price_per_night', 'status', 'description')
        }),
        ('Audit', {
            'fields': ('is_active', 'created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )





@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    """
    Customer admin configuration.
    """

    list_display = (
        'full_name',
        'phone',
        'email',
        'passport',
        'nationality',
        'status',
        'is_active',
        'created_at',
    )

    list_filter = (
        'status',
        'is_active',
        'nationality',
        'gender',
        'created_at',
    )

    search_fields = (
        'full_name',
        'phone',
        'email',
        'passport',
    )

    ordering = ('-created_at',)

    readonly_fields = ('id', 'created_at', 'updated_at')

    fieldsets = (
        (_('Personal Information'), {
            'fields': (
                'id',
                'full_name',
                'passport',
                'phone',
                'email',
                'gender',
                'date_of_birth',
                'nationality',
                'address'
            )
        }),
        (_('Emergency Contact'), {
            'fields': ('emergency_contact',),
            'classes': ('collapse',)
        }),
        (_('Status & Notes'), {
            'fields': ('status', 'is_active', 'notes')
        }),
        (_('Audit'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    actions = ['soft_delete_selected', 'reactivate_selected']

    @admin.action(description=_('Soft-delete selected customers'))
    def soft_delete_selected(self, request, queryset):
        """
        Set is_active=False for selected customers.
        """
        count = queryset.update(is_active=False)
        self.message_user(
            request,
            _('{count} customers soft-deleted.').format(count=count)
        )

    @admin.action(description=_('Reactivate selected customers'))
    def reactivate_selected(self, request, queryset):
        """
        Set is_active=True for selected customers.
        """
        count = queryset.update(is_active=True)
        self.message_user(
            request,
            _('{count} customers reactivated.').format(count=count)
        )





@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    """
    Booking admin configuration.
    Follows the same pattern as RoomAdmin and CustomerAdmin.
    """

    list_display = (
        'id',
        'customer',
        'room',
        'checkin',
        'checkout',
        'status',
        'total_price',
        'guest_count',
        'is_active',
        'created_at',
    )

    list_filter = (
        'status',
        'checkin',
        'checkout',
        'is_active',
        'guest_count',
    )

    search_fields = (
        'customer__full_name',
        'customer__phone',
        'customer__email',
        'room__number',
        'id',
    )

    ordering = ('-created_at',)

    readonly_fields = ('id', 'total_price', 'created_at', 'updated_at')

    fieldsets = (
        (_('Customer & Room'), {
            'fields': ('id', 'customer', 'room', 'guest_count')
        }),
        (_('Dates'), {
            'fields': ('checkin', 'checkout')
        }),
        (_('Financial'), {
            'fields': ('total_price',),
            'classes': ('collapse',)
        }),
        (_('Status & Notes'), {
            'fields': ('status', 'special_requests', 'notes', 'is_active')
        }),
        (_('Audit'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    """
    Payment admin configuration.
    """

    list_display = (
        'id',
        'booking',
        'amount',
        'currency',
        'method',
        'status',
        'payment_date',
        'is_active',
        'created_at',
    )

    list_filter = (
        'status',
        'method',
        'currency',
        'payment_date',
        'is_active',
    )

    search_fields = (
        'booking__id',
        'transaction_id',
        'notes',
    )

    ordering = ('-payment_date',)

    readonly_fields = ('id', 'created_at', 'updated_at')

    fieldsets = (
        (_('Payment Details'), {
            'fields': ('id', 'booking', 'amount', 'currency', 'method', 'status')
        }),
        (_('Transaction'), {
            'fields': ('transaction_id', 'payment_date', 'notes')
        }),
        (_('Audit'), {
            'fields': ('is_active', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )