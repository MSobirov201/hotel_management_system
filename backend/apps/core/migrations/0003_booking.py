from django.db import migrations, models
import uuid


class Migration(migrations.Migration):
    dependencies = [
        ('core', '0002_customer'),
    ]

    operations = [
        migrations.CreateModel(
            name='Booking',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False, help_text='Unique identifier for the booking.')),
                ('checkin', models.DateField(help_text='Check-in date.')),
                ('checkout', models.DateField(help_text='Check-out date.')),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('checked_in', 'Checked In'), ('checked_out', 'Checked Out'), ('cancelled', 'Cancelled'), ('no_show', 'No Show')], db_index=True, default='pending', help_text='Current booking status.', max_length=20)),
                ('total_price', models.DecimalField(decimal_places=2, help_text='Total price for the stay (snapshot).', max_digits=10)),
                ('guest_count', models.PositiveSmallIntegerField(default=2, help_text='Number of guests.')),
                ('special_requests', models.TextField(blank=True, help_text='Special requests from the customer.')),
                ('notes', models.TextField(blank=True, help_text='Internal notes about the booking.')),
                ('is_active', models.BooleanField(db_index=True, default=True, help_text='Soft-delete flag.')),
                ('created_at', models.DateTimeField(auto_now_add=True, help_text='Timestamp when the booking was created.')),
                ('updated_at', models.DateTimeField(auto_now=True, help_text='Timestamp when the booking was last updated.')),
                ('customer', models.ForeignKey(help_text='Customer who made the booking.', on_delete=models.PROTECT, related_name='bookings', to='core.customer')),
                ('room', models.ForeignKey(help_text='Room being booked.', on_delete=models.PROTECT, related_name='bookings', to='core.room')),
            ],
            options={
                'verbose_name': 'Booking',
                'verbose_name_plural': 'Bookings',
                'ordering': ['-created_at'],
                'indexes': [
                    models.Index(fields=['room', 'checkin', 'checkout'], name='book_room_cin_cout_idx'),
                    models.Index(fields=['customer', 'status'], name='book_cust_stat_idx'),
                    models.Index(fields=['status', 'checkin'], name='book_stat_cin_idx'),
                ],
            },
        ),
    ]