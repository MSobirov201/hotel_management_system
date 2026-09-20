from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from rest_framework.test import APIClient
from rest_framework import status
from datetime import date, timedelta, timezone
from django.utils import timezone
from rest_framework import status

from .models import Customer, Booking, Room, Payment
from .serializers import (
    CustomerListSerializer,
    CustomerDetailSerializer,
    CustomerCreateUpdateSerializer,
    BookingListSerializer,
    BookingDetailSerializer,
    BookingCreateUpdateSerializer, PaymentCreateUpdateSerializer, PaymentDetailSerializer, PaymentListSerializer,
)

User = get_user_model()





from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from rest_framework.test import APIClient
from rest_framework import status
from datetime import date, timedelta

from .models import Customer, Room, Booking, Payment
from .serializers import (
    # Customer serializers
    CustomerListSerializer,
    CustomerDetailSerializer,
    CustomerCreateUpdateSerializer,
    # Booking serializers
    BookingListSerializer,
    BookingDetailSerializer,
    BookingCreateUpdateSerializer,
    # Payment serializers
    PaymentListSerializer,
    PaymentDetailSerializer,
    PaymentCreateUpdateSerializer,
    # Room serializer (agar ishlatilsa)
    RoomSerializer,
)

User = get_user_model()









# ============================================================
# CUSTOMER MODEL TESTS
# ============================================================

class CustomerModelTest(TestCase):
    """Customer modeli uchun testlar."""

    def setUp(self):
        self.customer_data = {
            'full_name': 'John Doe',
            'passport': 'UZ1234567',
            'phone': '+998901234567',
            'email': 'john@example.com',
            'nationality': 'Uzbekistan',
            'emergency_contact': {
                'name': 'Jane Doe',
                'phone': '+998907654321',
                'relation': 'Spouse'
            }
        }

    def test_create_customer(self):
        customer = Customer.objects.create(**self.customer_data)
        self.assertIsNotNone(customer.id)
        self.assertEqual(customer.full_name, 'John Doe')
        self.assertEqual(customer.status, Customer.Status.ACTIVE)
        self.assertTrue(customer.is_active)

    def test_customer_str_method(self):
        customer = Customer.objects.create(**self.customer_data)
        self.assertEqual(str(customer), 'John Doe (+998901234567)')

    def test_full_name_validation(self):
        data = self.customer_data.copy()
        data['full_name'] = 'John123'
        customer = Customer(**data)
        with self.assertRaises(ValidationError):
            customer.full_clean()

    def test_full_name_min_length(self):
        data = self.customer_data.copy()
        data['full_name'] = 'J'
        customer = Customer(**data)
        with self.assertRaises(ValidationError):
            customer.full_clean()

    def test_passport_unique(self):
        Customer.objects.create(**self.customer_data)
        data = self.customer_data.copy()
        data['phone'] = '+998901234568'
        data['email'] = 'john2@example.com'
        data['passport'] = 'UZ1234567'  # same
        customer = Customer(**data)
        with self.assertRaises(ValidationError):
            customer.full_clean()

    def test_phone_unique(self):
        Customer.objects.create(**self.customer_data)
        data = self.customer_data.copy()
        data['passport'] = 'UZ1234568'
        data['email'] = 'john2@example.com'
        data['phone'] = '+998901234567'  # same
        customer = Customer(**data)
        with self.assertRaises(ValidationError):
            customer.full_clean()

    def test_email_unique(self):
        Customer.objects.create(**self.customer_data)
        data = self.customer_data.copy()
        data['passport'] = 'UZ1234568'
        data['phone'] = '+998901234568'
        data['email'] = 'john@example.com'  # same
        customer = Customer(**data)
        with self.assertRaises(ValidationError):
            customer.full_clean()

    def test_soft_delete(self):
        customer = Customer.objects.create(**self.customer_data)
        self.assertTrue(customer.is_active)
        customer.is_active = False
        customer.save()
        self.assertFalse(customer.is_active)


# ============================================================
# CUSTOMER SERIALIZER TESTS
# ============================================================

class CustomerSerializerTest(TestCase):
    """Customer serializerlar uchun testlar."""

    def setUp(self):
        self.valid_data = {
            'full_name': 'John Doe',
            'passport': 'UZ1234567',
            'phone': '+998901234567',
            'email': 'john@example.com',
            'nationality': 'Uzbekistan',
            'emergency_contact': {
                'name': 'Jane Doe',
                'phone': '+998907654321',
                'relation': 'Spouse'
            }
        }

    def test_list_serializer_fields(self):
        customer = Customer.objects.create(**self.valid_data)
        serializer = CustomerListSerializer(customer)
        data = serializer.data
        self.assertIn('id', data)
        self.assertIn('full_name', data)
        self.assertIn('phone', data)
        self.assertIn('email', data)
        self.assertNotIn('passport', data)
        self.assertNotIn('date_of_birth', data)
        self.assertNotIn('emergency_contact', data)
        self.assertNotIn('address', data)

    def test_detail_serializer_fields(self):
        customer = Customer.objects.create(**self.valid_data)
        serializer = CustomerDetailSerializer(customer)
        data = serializer.data
        self.assertIn('passport', data)
        self.assertIn('emergency_contact', data)
        self.assertIn('address', data)
        self.assertIn('date_of_birth', data)

    def test_create_serializer_valid(self):
        serializer = CustomerCreateUpdateSerializer(data=self.valid_data)
        self.assertTrue(serializer.is_valid())
        customer = serializer.save()
        self.assertEqual(customer.full_name, 'John Doe')
        self.assertTrue(customer.is_active)
        self.assertEqual(customer.status, Customer.Status.ACTIVE)

    def test_create_serializer_invalid_full_name(self):
        data = self.valid_data.copy()
        data['full_name'] = 'John123'
        serializer = CustomerCreateUpdateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('full_name', serializer.errors)

    def test_create_serializer_full_name_min_length(self):
        data = self.valid_data.copy()
        data['full_name'] = 'J'
        serializer = CustomerCreateUpdateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('full_name', serializer.errors)

    def test_create_serializer_invalid_phone_format(self):
        data = self.valid_data.copy()
        data['phone'] = '901234567'
        serializer = CustomerCreateUpdateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('phone', serializer.errors)

    def test_create_serializer_phone_too_short(self):
        data = self.valid_data.copy()
        data['phone'] = '+99890'
        serializer = CustomerCreateUpdateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('phone', serializer.errors)

    def test_create_serializer_phone_invalid_chars(self):
        data = self.valid_data.copy()
        data['phone'] = '+99890abc567'
        serializer = CustomerCreateUpdateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('phone', serializer.errors)

    def test_create_serializer_passport_invalid(self):
        data = self.valid_data.copy()
        data['passport'] = 'UZ-123456'
        serializer = CustomerCreateUpdateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('passport', serializer.errors)

    def test_create_serializer_passport_too_short(self):
        data = self.valid_data.copy()
        data['passport'] = 'UZ123'
        serializer = CustomerCreateUpdateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('passport', serializer.errors)

    def test_create_serializer_email_invalid(self):
        data = self.valid_data.copy()
        data['email'] = 'invalid-email'
        serializer = CustomerCreateUpdateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('email', serializer.errors)

    def test_create_serializer_date_of_birth_future(self):
        data = self.valid_data.copy()
        data['date_of_birth'] = date.today() + timedelta(days=1)
        serializer = CustomerCreateUpdateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('date_of_birth', serializer.errors)

    def test_create_serializer_status_invalid(self):
        data = self.valid_data.copy()
        data['status'] = 'invalid_status'
        serializer = CustomerCreateUpdateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('status', serializer.errors)

    def test_create_serializer_emergency_contact_missing_name(self):
        data = self.valid_data.copy()
        data['emergency_contact'] = {'phone': '+998907654321'}
        serializer = CustomerCreateUpdateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('emergency_contact', serializer.errors)

    def test_create_serializer_emergency_contact_invalid_phone(self):
        data = self.valid_data.copy()
        data['emergency_contact'] = {
            'name': 'Jane Doe',
            'phone': '907654321'
        }
        serializer = CustomerCreateUpdateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('emergency_contact', serializer.errors)

    def test_create_serializer_emergency_contact_same_phone(self):
        data = self.valid_data.copy()
        data['emergency_contact'] = {
            'name': 'Jane Doe',
            'phone': '+998901234567',
            'relation': 'Spouse'
        }
        serializer = CustomerCreateUpdateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('emergency_contact', serializer.errors)

    def test_create_serializer_is_active_read_only(self):
        data = self.valid_data.copy()
        data['is_active'] = False
        serializer = CustomerCreateUpdateSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        customer = serializer.save()
        self.assertTrue(customer.is_active)

    def test_duplicate_passport(self):
        Customer.objects.create(**self.valid_data)
        data = self.valid_data.copy()
        data['phone'] = '+998901234568'
        data['email'] = 'john2@example.com'
        serializer = CustomerCreateUpdateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('passport', serializer.errors)

    def test_duplicate_phone(self):
        Customer.objects.create(**self.valid_data)
        data = self.valid_data.copy()
        data['passport'] = 'UZ1234568'
        data['email'] = 'john2@example.com'
        data['phone'] = '+998901234567'
        serializer = CustomerCreateUpdateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('phone', serializer.errors)

    def test_duplicate_email(self):
        Customer.objects.create(**self.valid_data)
        data = self.valid_data.copy()
        data['passport'] = 'UZ1234568'
        data['phone'] = '+998901234568'
        data['email'] = 'john@example.com'
        serializer = CustomerCreateUpdateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('email', serializer.errors)

    def test_update_customer_unique_constraints(self):
        customer1 = Customer.objects.create(**self.valid_data)
        data2 = self.valid_data.copy()
        data2['passport'] = 'UZ1234568'
        data2['phone'] = '+998901234568'
        data2['email'] = 'john2@example.com'
        customer2 = Customer.objects.create(**data2)

        update_data = {
            'full_name': 'John Doe 2',
            'passport': 'UZ1234567',
            'phone': '+998901234567',
            'email': 'john@example.com',
        }
        serializer = CustomerCreateUpdateSerializer(
            instance=customer2,
            data=update_data,
            partial=True
        )
        self.assertFalse(serializer.is_valid())
        self.assertIn('passport', serializer.errors)


# ============================================================
# CUSTOMER VIEWSET TESTS
# ============================================================

class CustomerViewSetTest(TestCase):
    """Customer ViewSet uchun testlar."""

    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_superuser(
            username='admin',
            password='admin123',
            email='admin@example.com'
        )
        self.normal_user = User.objects.create_user(
            username='user',
            password='user123',
            email='user@example.com'
        )

        self.customer = Customer.objects.create(
            full_name='John Doe',
            passport='UZ1234567',
            phone='+998901234567',
            email='john@example.com',
            nationality='Uzbekistan'
        )
        self.customer_url = f'/api/v1/customers/{self.customer.id}/'
        self.customer2 = Customer.objects.create(
            full_name='Jane Smith',
            passport='UZ1234568',
            phone='+998901234568',
            email='jane@example.com',
            nationality='USA'
        )

    def test_list_customers_authenticated(self):
        self.client.force_authenticate(user=self.normal_user)
        response = self.client.get('/api/v1/customers/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)

    def test_list_customers_unauthenticated(self):
        response = self.client.get('/api/v1/customers/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_retrieve_customer_authenticated(self):
        self.client.force_authenticate(user=self.normal_user)
        response = self.client.get(self.customer_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['full_name'], 'John Doe')
        self.assertIn('passport', response.data)  # <-- TUZATILDI: passport mavjud bo'lishi kerak

    def test_retrieve_customer_unauthenticated(self):
        response = self.client.get(self.customer_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_customer_as_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        data = {
            'full_name': 'Alice Brown',
            'passport': 'UZ1234569',
            'phone': '+998901234569',
            'email': 'alice@example.com',
            'nationality': 'Uzbekistan'
        }
        response = self.client.post('/api/v1/customers/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Customer.objects.count(), 3)

    def test_create_customer_as_normal_user(self):
        self.client.force_authenticate(user=self.normal_user)
        data = {
            'full_name': 'Bob Wilson',
            'passport': 'UZ1234570',
            'phone': '+998901234570',
            'email': 'bob@example.com'
        }
        response = self.client.post('/api/v1/customers/', data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_customer_as_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        data = {
            'full_name': 'John Smith',
            'passport': 'UZ1234567',
            'phone': '+998901234567',
            'email': 'john@example.com',
            'nationality': 'USA'
        }
        response = self.client.put(self.customer_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.customer.refresh_from_db()
        self.assertEqual(self.customer.full_name, 'John Smith')
        self.assertEqual(self.customer.nationality, 'USA')

    def test_update_customer_as_normal_user(self):
        self.client.force_authenticate(user=self.normal_user)
        data = {
            'full_name': 'John Smith',
            'passport': 'UZ1234567',
            'phone': '+998901234567',
            'email': 'john@example.com'
        }
        response = self.client.put(self.customer_url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_customer_as_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.delete(self.customer_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.customer.refresh_from_db()
        self.assertFalse(self.customer.is_active)
        list_response = self.client.get('/api/v1/customers/')
        self.assertEqual(len(list_response.data['results']), 1)

    def test_delete_customer_as_normal_user(self):
        self.client.force_authenticate(user=self.normal_user)
        response = self.client.delete(self.customer_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_reactivate_customer_as_admin(self):
        self.customer.is_active = False
        self.customer.save()
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post(f'/api/v1/customers/{self.customer.id}/reactivate/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['detail'], 'Customer reactivated successfully.')
        self.customer.refresh_from_db()
        self.assertTrue(self.customer.is_active)

    def test_reactivate_customer_as_normal_user(self):
        self.customer.is_active = False
        self.customer.save()
        self.client.force_authenticate(user=self.normal_user)
        response = self.client.post(f'/api/v1/customers/{self.customer.id}/reactivate/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_reactivate_already_active_customer(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post(f'/api/v1/customers/{self.customer.id}/reactivate/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['detail'], 'Customer not found or already active.')

    def test_reactivate_nonexistent_customer(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post('/api/v1/customers/99999999-9999-9999-9999-999999999999/reactivate/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


# ============================================================
# CUSTOMER FILTER/SEARCH/ORDER TESTS
# ============================================================

class CustomerFilterSearchOrderTest(TestCase):
    """Filtering, searching, ordering testlari."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='test123',
            email='test@example.com'
        )
        self.client.force_authenticate(user=self.user)

        Customer.objects.create(
            full_name='John Doe',
            passport='UZ1234567',
            phone='+998901234567',
            email='john@example.com',
            nationality='Uzbekistan',
            status=Customer.Status.ACTIVE
        )
        Customer.objects.create(
            full_name='Jane Smith',
            passport='US1234567',
            phone='+998901234568',
            email='jane@example.com',
            nationality='USA',
            status=Customer.Status.INACTIVE
        )
        Customer.objects.create(
            full_name='Ali Karimov',
            passport='UZ1234569',
            phone='+998901234569',
            email='ali@example.com',
            nationality='Uzbekistan',
            status=Customer.Status.ACTIVE
        )

    def test_filter_by_status(self):
        response = self.client.get('/api/v1/customers/?status=active')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)
        for item in response.data['results']:
            self.assertEqual(item['status'], 'active')

    def test_filter_by_nationality(self):
        response = self.client.get('/api/v1/customers/?nationality=Uzbekistan')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)
        for item in response.data['results']:
            self.assertEqual(item['nationality'], 'Uzbekistan')

    def test_search_by_full_name(self):
        response = self.client.get('/api/v1/customers/?search=John')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['full_name'], 'John Doe')

    def test_search_by_phone(self):
        response = self.client.get('/api/v1/customers/?search=901234567')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['full_name'], 'John Doe')

    def test_search_by_email(self):
        response = self.client.get('/api/v1/customers/?search=jane@example.com')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['full_name'], 'Jane Smith')

    def test_ordering_by_full_name_asc(self):
        response = self.client.get('/api/v1/customers/?ordering=full_name')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results']
        self.assertEqual(results[0]['full_name'], 'Ali Karimov')
        self.assertEqual(results[1]['full_name'], 'Jane Smith')
        self.assertEqual(results[2]['full_name'], 'John Doe')

    def test_ordering_by_full_name_desc(self):
        response = self.client.get('/api/v1/customers/?ordering=-full_name')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results']
        self.assertEqual(results[0]['full_name'], 'John Doe')
        self.assertEqual(results[1]['full_name'], 'Jane Smith')
        self.assertEqual(results[2]['full_name'], 'Ali Karimov')


# ============================================================
# CUSTOMER INTEGRATION TESTS
# ============================================================

class CustomerIntegrationTest(TestCase):
    """To'liq flow integration testi."""

    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_superuser(
            username='admin',
            password='admin123',
            email='admin@example.com'
        )
        self.client.force_authenticate(user=self.admin_user)

    def test_full_customer_flow(self):
        data = {
            'full_name': 'Test User',
            'passport': 'UZ9999999',
            'phone': '+998909999999',
            'email': 'test@example.com',
            'nationality': 'Uzbekistan'
        }

        # 1. Create
        create_response = self.client.post('/api/v1/customers/', data)
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        customer_id = create_response.data['id']

        # 2. List
        list_response = self.client.get('/api/v1/customers/')
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(list_response.data['results']), 1)

        # 3. Detail
        detail_response = self.client.get(f'/api/v1/customers/{customer_id}/')
        self.assertEqual(detail_response.status_code, status.HTTP_200_OK)
        self.assertEqual(detail_response.data['full_name'], 'Test User')

        # 4. Update
        update_data = data.copy()
        update_data['full_name'] = 'Updated User'
        update_response = self.client.put(f'/api/v1/customers/{customer_id}/', update_data)
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data['full_name'], 'Updated User')

        # 5. Delete (soft-delete)
        delete_response = self.client.delete(f'/api/v1/customers/{customer_id}/')
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)

        # 6. Verify soft-delete
        list_after_delete = self.client.get('/api/v1/customers/')
        customer_ids = [item['id'] for item in list_after_delete.data['results']]
        self.assertNotIn(customer_id, customer_ids)

        # 7. Reactivate
        reactivate_response = self.client.post(f'/api/v1/customers/{customer_id}/reactivate/')
        self.assertEqual(reactivate_response.status_code, status.HTTP_200_OK)

        # 8. Verify reactivated
        customer = Customer.objects.get(pk=customer_id)
        self.assertTrue(customer.is_active)

        list_after_reactivate = self.client.get('/api/v1/customers/')
        customer_ids_after = [item['id'] for item in list_after_reactivate.data['results']]
        self.assertIn(customer_id, customer_ids_after)







class BookingModelTest(TestCase):
    """Booking modeli uchun testlar."""

    def setUp(self):
        # Create test customer
        self.customer = Customer.objects.create(
            full_name='Test Customer',
            passport='UZ1234567',
            phone='+998901234567',
            email='test@example.com',
            nationality='Uzbekistan'
        )
        # Create test room
        self.room = Room.objects.create(
            number='101',
            floor=1,
            room_type='Standard',
            capacity=2,
            price_per_night=80.00,
            status=Room.Status.AVAILABLE,
            description='Test room'
        )

    def test_create_booking(self):
        """Booking yaratish."""
        booking = Booking.objects.create(
            customer=self.customer,
            room=self.room,
            checkin=date.today(),
            checkout=date.today() + timedelta(days=3),
            guest_count=2,
            special_requests='Test request'
        )
        self.assertIsNotNone(booking.id)
        self.assertEqual(booking.customer, self.customer)
        self.assertEqual(booking.room, self.room)
        self.assertEqual(booking.status, Booking.Status.PENDING)
        self.assertTrue(booking.is_active)
        self.assertEqual(booking.guest_count, 2)

    def test_booking_str_method(self):
        """__str__ metodi."""
        booking = Booking.objects.create(
            customer=self.customer,
            room=self.room,
            checkin=date.today(),
            checkout=date.today() + timedelta(days=2),
            guest_count=2
        )
        self.assertIn(str(booking.id)[:8], str(booking))
        self.assertIn(self.customer.full_name, str(booking))

    def test_total_price_calculation(self):
        """total_price avtomatik hisoblanishi."""
        booking = Booking.objects.create(
            customer=self.customer,
            room=self.room,
            checkin=date.today(),
            checkout=date.today() + timedelta(days=3),
            guest_count=2
        )
        # 3 nights * 80 = 240
        self.assertEqual(booking.total_price, 240.00)

    def test_checkout_after_checkin_validation(self):
        """checkout checkindan keyin bo'lishi."""
        booking = Booking(
            customer=self.customer,
            room=self.room,
            checkin=date.today(),
            checkout=date.today() - timedelta(days=1),  # past
            guest_count=2
        )
        with self.assertRaises(ValidationError):
            booking.full_clean()

    def test_checkin_not_in_past(self):
        """checkin o'tmishda bo'lmasligi."""
        booking = Booking(
            customer=self.customer,
            room=self.room,
            checkin=date.today() - timedelta(days=1),  # past
            checkout=date.today() + timedelta(days=2),
            guest_count=2
        )
        with self.assertRaises(ValidationError):
            booking.full_clean()

    def test_full_clean_allows_past_checkin_on_existing_booking(self):
        """
        Regression test: the 'checkin cannot be in the past' rule must only
        apply at creation time. Once a booking exists, calling full_clean()
        again later (as save() does on every update) must not fail merely
        because time has passed and checkin is now in the past.
        """
        booking = Booking.objects.create(
            customer=self.customer,
            room=self.room,
            checkin=date.today(),
            checkout=date.today() + timedelta(days=3),
            guest_count=2
        )
        # Simulate time passing since creation: move checkin into the past
        # via a direct queryset update, bypassing model validation, exactly
        # as would happen naturally as real time elapses.
        Booking.objects.filter(pk=booking.pk).update(
            checkin=date.today() - timedelta(days=10)
        )
        booking.refresh_from_db()
        self.assertLess(booking.checkin, date.today())

        # Should not raise, since this is now an existing (not adding) instance.
        booking.full_clean()

    def test_guest_count_minimum(self):
        """guest_count kamida 1 bo'lishi."""
        booking = Booking(
            customer=self.customer,
            room=self.room,
            checkin=date.today(),
            checkout=date.today() + timedelta(days=2),
            guest_count=0
        )
        with self.assertRaises(ValidationError):
            booking.full_clean()

    def test_guest_count_exceeds_capacity(self):
        """guest_count xona sig'imidan oshmasligi."""
        booking = Booking(
            customer=self.customer,
            room=self.room,
            checkin=date.today(),
            checkout=date.today() + timedelta(days=2),
            guest_count=5  # capacity is 2
        )
        with self.assertRaises(ValidationError):
            booking.full_clean()

    def test_status_choices(self):
        """Status choices ishlashi."""
        booking = Booking.objects.create(
            customer=self.customer,
            room=self.room,
            checkin=date.today(),
            checkout=date.today() + timedelta(days=2),
            guest_count=2,
            status=Booking.Status.CHECKED_IN
        )
        self.assertEqual(booking.status, Booking.Status.CHECKED_IN)

    def test_soft_delete(self):
        """Soft-delete is_active=False qilishi."""
        booking = Booking.objects.create(
            customer=self.customer,
            room=self.room,
            checkin=date.today(),
            checkout=date.today() + timedelta(days=2),
            guest_count=2
        )
        self.assertTrue(booking.is_active)
        booking.is_active = False
        booking.save()
        self.assertFalse(booking.is_active)










class BookingSerializerTest(TestCase):
    """Booking serializerlar uchun testlar."""

    def setUp(self):
        # Create test customer
        self.customer = Customer.objects.create(
            full_name='Test Customer',
            passport='UZ1234567',
            phone='+998901234567',
            email='test@example.com',
            nationality='Uzbekistan'
        )
        # Create test room
        self.room = Room.objects.create(
            number='101',
            floor=1,
            room_type='Standard',
            capacity=2,
            price_per_night=80.00,
            status=Room.Status.AVAILABLE,
            description='Test room'
        )
        # Valid booking data
        self.valid_data = {
            'customer': self.customer.id,
            'room': self.room.id,
            'checkin': date.today(),
            'checkout': date.today() + timedelta(days=3),
            'guest_count': 2,
            'special_requests': 'Test request',
            'notes': 'Test notes'
        }

    def test_list_serializer_fields(self):
        """BookingListSerializer fields."""
        booking = Booking.objects.create(
            customer=self.customer,
            room=self.room,
            checkin=date.today(),
            checkout=date.today() + timedelta(days=3),
            guest_count=2
        )
        serializer = BookingListSerializer(booking)
        data = serializer.data
        self.assertIn('id', data)
        self.assertIn('customer_name', data)
        self.assertIn('room_number', data)
        self.assertIn('checkin', data)
        self.assertIn('checkout', data)
        self.assertIn('status', data)
        self.assertIn('total_price', data)
        self.assertIn('guest_count', data)
        self.assertNotIn('special_requests', data)
        self.assertNotIn('notes', data)

    def test_detail_serializer_fields(self):
        """BookingDetailSerializer barcha fields."""
        booking = Booking.objects.create(
            customer=self.customer,
            room=self.room,
            checkin=date.today(),
            checkout=date.today() + timedelta(days=3),
            guest_count=2
        )
        serializer = BookingDetailSerializer(booking)
        data = serializer.data
        self.assertIn('customer', data)
        self.assertIn('room', data)
        self.assertIn('checkin', data)
        self.assertIn('checkout', data)
        self.assertIn('total_price', data)
        self.assertIn('special_requests', data)
        self.assertIn('notes', data)
        self.assertIn('is_active', data)

    def test_create_serializer_valid(self):
        """BookingCreateUpdateSerializer valid data."""
        serializer = BookingCreateUpdateSerializer(data=self.valid_data)
        self.assertTrue(serializer.is_valid())
        booking = serializer.save()
        self.assertEqual(booking.customer, self.customer)
        self.assertEqual(booking.room, self.room)
        self.assertEqual(booking.guest_count, 2)
        self.assertEqual(booking.total_price, 240.00)  # 3 nights * 80

    def test_create_serializer_checkin_past(self):
        """checkin o'tmishda bo'lmasligi (faqat CREATE paytida)."""
        data = self.valid_data.copy()
        data['checkin'] = date.today() - timedelta(days=1)
        serializer = BookingCreateUpdateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('checkin', serializer.errors)

    def test_update_serializer_allows_past_checkin_on_existing_instance(self):
        """
        Regression test: PUT/PATCH orqali mavjud bookingni yangilashda,
        checkin sanasi endi o'tmishda bo'lsa ham (masalan admin panelidan
        guest_count yoki special_requests o'zgartirilganda), serializer
        buni rad etmasligi kerak. Bu qoida faqat booking birinchi marta
        yaratilganda ishlashi kerak edi (Phase 1'dagi model darajasidagi
        tuzatish bilan bir xil sabab, endi serializer darajasida ham).
        """
        booking = Booking.objects.create(
            customer=self.customer,
            room=self.room,
            checkin=date.today(),
            checkout=date.today() + timedelta(days=3),
            guest_count=2
        )
        Booking.objects.filter(pk=booking.pk).update(
            checkin=date.today() - timedelta(days=10)
        )
        booking.refresh_from_db()
        self.assertLess(booking.checkin, date.today())

        update_data = {
            'customer': self.customer.id,
            'room': self.room.id,
            'checkin': booking.checkin,
            'checkout': booking.checkout,
            'guest_count': 2,
            'special_requests': 'Updated after checkin has passed',
            'status': booking.status,
        }
        serializer = BookingCreateUpdateSerializer(instance=booking, data=update_data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        updated = serializer.save()
        self.assertEqual(updated.special_requests, 'Updated after checkin has passed')

    def test_create_serializer_checkout_after_checkin(self):
        """checkout checkindan keyin bo'lishi."""
        data = self.valid_data.copy()
        data['checkout'] = date.today()  # same as checkin
        serializer = BookingCreateUpdateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('checkout', serializer.errors)

    def test_create_serializer_guest_count_minimum(self):
        """guest_count kamida 1 bo'lishi."""
        data = self.valid_data.copy()
        data['guest_count'] = 0
        serializer = BookingCreateUpdateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('guest_count', serializer.errors)

    def test_create_serializer_guest_count_exceeds_capacity(self):
        """guest_count xona sig'imidan oshmasligi."""
        data = self.valid_data.copy()
        data['guest_count'] = 5  # capacity is 2
        serializer = BookingCreateUpdateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('guest_count', serializer.errors)

    def test_create_serializer_total_price_read_only(self):
        """total_price read-only bo'lishi."""
        data = self.valid_data.copy()
        data['total_price'] = 999.00  # user tries to set
        serializer = BookingCreateUpdateSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        booking = serializer.save()
        # total_price should be calculated, not user-provided
        self.assertEqual(booking.total_price, 240.00)




class BookingBusinessLogicTest(TestCase):
    """Booking business logic testlari."""

    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_superuser(
            username='admin',
            password='admin123',
            email='admin@example.com'
        )
        self.client.force_authenticate(user=self.admin_user)

        self.customer = Customer.objects.create(
            full_name='Test Customer',
            passport='UZ1234567',
            phone='+998901234567',
            email='test@example.com'
        )
        self.room = Room.objects.create(
            number='101',
            floor=1,
            room_type='Standard',
            capacity=2,
            price_per_night=80.00,
            status=Room.Status.AVAILABLE
        )
        self.booking = Booking.objects.create(
            customer=self.customer,
            room=self.room,
            checkin=date.today(),
            checkout=date.today() + timedelta(days=3),
            guest_count=2,
            status=Booking.Status.PENDING
        )

    def test_check_in_success(self):
        """Check-in endpoint ishlashi."""
        response = self.client.post(f'/api/v1/bookings/{self.booking.id}/check-in/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.status, Booking.Status.CHECKED_IN)
        self.room.refresh_from_db()
        self.assertEqual(self.room.status, Room.Status.OCCUPIED)

    def test_check_in_already_checked_in(self):
        """Allaqachon check-in qilingan bookingni qayta check-in qilish mumkin emas."""
        self.booking.status = Booking.Status.CHECKED_IN
        self.booking.save()
        response = self.client.post(f'/api/v1/bookings/{self.booking.id}/check-in/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_check_in_cancelled_booking(self):
        """Bekor qilingan bookingni check-in qilish mumkin emas."""
        self.booking.status = Booking.Status.CANCELLED
        self.booking.save()
        response = self.client.post(f'/api/v1/bookings/{self.booking.id}/check-in/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_check_out_success(self):
        """Check-out endpoint ishlashi."""
        self.booking.status = Booking.Status.CHECKED_IN
        self.booking.save()
        response = self.client.post(f'/api/v1/bookings/{self.booking.id}/check-out/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.status, Booking.Status.CHECKED_OUT)
        self.room.refresh_from_db()
        self.assertEqual(self.room.status, Room.Status.AVAILABLE)

    def test_check_out_success_with_past_checkin_date(self):
        """
        Regression test for the checkout bug: a booking whose check-in
        date has already elapsed (the normal case for any completed stay,
        since checkout happens after checkin) must still be checkable-out
        via the API, not rejected by full_clean()'s past-date validation.
        """
        self.booking.status = Booking.Status.CHECKED_IN
        self.booking.save()
        # Simulate real time having passed since the booking was created:
        # move checkin into the past via a direct queryset update.
        Booking.objects.filter(pk=self.booking.pk).update(
            checkin=date.today() - timedelta(days=5)
        )
        self.booking.refresh_from_db()
        self.assertLess(self.booking.checkin, date.today())

        response = self.client.post(f'/api/v1/bookings/{self.booking.id}/check-out/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.status, Booking.Status.CHECKED_OUT)
        self.room.refresh_from_db()
        self.assertEqual(self.room.status, Room.Status.AVAILABLE)

    def test_check_in_success_with_past_checkin_date(self):
        """
        Regression test: check-in itself must also succeed if, for any
        reason, the booking's checkin date is already in the past at the
        time the action runs (e.g. a late check-in processed the next day).
        """
        Booking.objects.filter(pk=self.booking.pk).update(
            checkin=date.today() - timedelta(days=1)
        )
        self.booking.refresh_from_db()
        response = self.client.post(f'/api/v1/bookings/{self.booking.id}/check-in/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.status, Booking.Status.CHECKED_IN)

    def test_cancel_success_with_past_checkin_date(self):
        """
        Regression test: cancelling a booking (e.g. a no-show) must still
        succeed once its checkin date has already passed.
        """
        Booking.objects.filter(pk=self.booking.pk).update(
            checkin=date.today() - timedelta(days=2)
        )
        self.booking.refresh_from_db()
        response = self.client.post(f'/api/v1/bookings/{self.booking.id}/cancel/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.status, Booking.Status.CANCELLED)

    def test_check_out_not_checked_in(self):
        """Faqat CHECKED_IN statusdagi bookingni check-out qilish mumkin."""
        response = self.client.post(f'/api/v1/bookings/{self.booking.id}/check-out/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cancel_success(self):
        """Cancel endpoint ishlashi."""
        response = self.client.post(f'/api/v1/bookings/{self.booking.id}/cancel/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.status, Booking.Status.CANCELLED)
        self.room.refresh_from_db()
        self.assertEqual(self.room.status, Room.Status.AVAILABLE)

    def test_cancel_checked_in_booking(self):
        """CHECKED_IN bookingni bekor qilish mumkin."""
        self.booking.status = Booking.Status.CHECKED_IN
        self.booking.save()
        response = self.client.post(f'/api/v1/bookings/{self.booking.id}/cancel/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.status, Booking.Status.CANCELLED)

    def test_cancel_checked_out_booking(self):
        """CHECKED_OUT bookingni bekor qilish mumkin emas."""
        self.booking.status = Booking.Status.CHECKED_OUT
        self.booking.save()
        response = self.client.post(f'/api/v1/bookings/{self.booking.id}/cancel/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_availability_success(self):
        """Availability endpoint ishlashi."""
        url = f'/api/v1/bookings/availability/?room={self.room.id}&checkin={date.today()+timedelta(days=5)}&checkout={date.today()+timedelta(days=7)}'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['available'])

    def test_availability_conflict(self):
        """Availability endpoint - conflict detection."""
        # Create overlapping booking
        Booking.objects.create(
            customer=self.customer,
            room=self.room,
            checkin=date.today() + timedelta(days=1),
            checkout=date.today() + timedelta(days=4),
            guest_count=2,
            status=Booking.Status.PENDING
        )
        url = f'/api/v1/bookings/availability/?room={self.room.id}&checkin={date.today()+timedelta(days=2)}&checkout={date.today()+timedelta(days=5)}'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['available'])
        self.assertGreater(len(response.data['conflicting_bookings']), 0)

    def test_availability_room_not_found(self):
        """Availability - room not found."""
        url = '/api/v1/bookings/availability/?room=99999999-9999-9999-9999-999999999999&checkin=2026-08-10&checkout=2026-08-12'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_availability_invalid_uuid(self):
        """Availability - invalid UUID."""
        url = '/api/v1/bookings/availability/?room=invalid-uuid&checkin=2026-08-10&checkout=2026-08-12'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)






class PaymentModelTest(TestCase):
    """Payment modeli uchun testlar."""

    def setUp(self):
        # Create test customer
        self.customer = Customer.objects.create(
            full_name='Test Customer',
            passport='UZ1234567',
            phone='+998901234567',
            email='test@example.com',
            nationality='Uzbekistan'
        )
        # Create test room
        self.room = Room.objects.create(
            number='101',
            floor=1,
            room_type='Standard',
            capacity=2,
            price_per_night=80.00,
            status=Room.Status.AVAILABLE,
            description='Test room'
        )
        # Create test booking
        self.booking = Booking.objects.create(
            customer=self.customer,
            room=self.room,
            checkin=date.today(),
            checkout=date.today() + timedelta(days=3),
            guest_count=2,
            total_price=240.00,
            status=Booking.Status.PENDING
        )

    def test_create_payment(self):
        """Payment yaratish."""
        payment = Payment.objects.create(
            booking=self.booking,
            amount=120.00,
            currency=Payment.Currency.USD,
            method=Payment.Method.CASH,
            status=Payment.Status.COMPLETED,
            transaction_id='TXN123456',
            notes='Test payment'
        )
        self.assertIsNotNone(payment.id)
        self.assertEqual(payment.booking, self.booking)
        self.assertEqual(payment.amount, 120.00)
        self.assertEqual(payment.status, Payment.Status.COMPLETED)
        self.assertTrue(payment.is_active)

    def test_payment_str_method(self):
        payment = Payment.objects.create(
            booking=self.booking,
            amount=100.00,
            currency=Payment.Currency.USD,
            method=Payment.Method.CARD,
            status=Payment.Status.PENDING
        )
        self.assertIn('100 USD', str(payment))  # <-- '100.00 USD' emas
        self.assertIn('pending', str(payment))

    def test_amount_positive_validation(self):
        """amount positive bo'lishi kerak."""
        payment = Payment(
            booking=self.booking,
            amount=-10.00,
            currency=Payment.Currency.USD,
            method=Payment.Method.CASH,
            status=Payment.Status.PENDING
        )
        with self.assertRaises(ValidationError):
            payment.full_clean()

    def test_payment_date_not_future(self):
        """payment_date kelajakda bo'lmasligi."""
        payment = Payment(
            booking=self.booking,
            amount=50.00,
            currency=Payment.Currency.USD,
            method=Payment.Method.CASH,
            status=Payment.Status.PENDING,
            payment_date=timezone.now() + timedelta(days=1)
        )
        with self.assertRaises(ValidationError):
            payment.full_clean()

    def test_status_choices(self):
        """Status choices ishlashi."""
        payment = Payment.objects.create(
            booking=self.booking,
            amount=100.00,
            currency=Payment.Currency.USD,
            method=Payment.Method.CARD,
            status=Payment.Status.COMPLETED
        )
        self.assertEqual(payment.status, Payment.Status.COMPLETED)

    def test_currency_choices(self):
        """Currency choices ishlashi."""
        payment = Payment.objects.create(
            booking=self.booking,
            amount=100.00,
            currency=Payment.Currency.UZS,
            method=Payment.Method.CASH,
            status=Payment.Status.PENDING
        )
        self.assertEqual(payment.currency, Payment.Currency.UZS)

    def test_soft_delete(self):
        """Soft-delete is_active=False qilishi."""
        payment = Payment.objects.create(
            booking=self.booking,
            amount=100.00,
            currency=Payment.Currency.USD,
            method=Payment.Method.CASH,
            status=Payment.Status.PENDING
        )
        self.assertTrue(payment.is_active)
        payment.is_active = False
        payment.save()
        self.assertFalse(payment.is_active)







class PaymentSerializerTest(TestCase):
    """Payment serializerlar uchun testlar."""

    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_superuser(
            username='admin',
            password='admin123',
            email='admin@example.com'
        )
        self.client.force_authenticate(user=self.admin_user)

        self.customer = Customer.objects.create(
            full_name='Test Customer',
            passport='UZ1234567',
            phone='+998901234567',
            email='test@example.com'
        )
        self.room = Room.objects.create(
            number='101',
            floor=1,
            room_type='Standard',
            capacity=2,
            price_per_night=80.00,
            status=Room.Status.AVAILABLE
        )
        self.booking = Booking.objects.create(
            customer=self.customer,
            room=self.room,
            checkin=date.today(),
            checkout=date.today() + timedelta(days=3),
            guest_count=2,
            total_price=240.00,
            status=Booking.Status.PENDING
        )
        self.valid_data = {
            'booking': self.booking.id,
            'amount': 100.00,
            'currency': Payment.Currency.USD,
            'method': Payment.Method.CASH,
            'status': Payment.Status.PENDING,
            'payment_date': timezone.now(),
            'transaction_id': 'TXN123456',
            'notes': 'Test payment'
        }

    def test_list_serializer_fields(self):
        """PaymentListSerializer fields."""
        payment = Payment.objects.create(
            booking=self.booking,
            amount=100.00,
            currency=Payment.Currency.USD,
            method=Payment.Method.CARD,
            status=Payment.Status.COMPLETED,
            payment_date=timezone.now()
        )
        serializer = PaymentListSerializer(payment)
        data = serializer.data
        self.assertIn('id', data)
        self.assertIn('booking', data)
        self.assertIn('amount', data)
        self.assertIn('currency', data)
        self.assertIn('method', data)
        self.assertIn('status', data)
        self.assertIn('payment_date', data)
        self.assertNotIn('notes', data)

    def test_detail_serializer_fields(self):
        """PaymentDetailSerializer barcha fields."""
        payment = Payment.objects.create(
            booking=self.booking,
            amount=100.00,
            currency=Payment.Currency.USD,
            method=Payment.Method.CARD,
            status=Payment.Status.COMPLETED,
            payment_date=timezone.now()
        )
        serializer = PaymentDetailSerializer(payment)
        data = serializer.data
        self.assertIn('id', data)
        self.assertIn('booking', data)
        self.assertIn('amount', data)
        self.assertIn('currency', data)
        self.assertIn('method', data)
        self.assertIn('status', data)
        self.assertIn('payment_date', data)
        self.assertIn('notes', data)
        self.assertIn('transaction_id', data)

    def test_create_serializer_valid(self):
        """PaymentCreateUpdateSerializer valid data."""
        serializer = PaymentCreateUpdateSerializer(data=self.valid_data)
        self.assertTrue(serializer.is_valid())
        payment = serializer.save()
        self.assertEqual(payment.amount, 100.00)
        self.assertEqual(payment.currency, Payment.Currency.USD)
        self.assertEqual(payment.status, Payment.Status.PENDING)

    def test_create_serializer_amount_zero(self):
        """amount > 0 bo'lishi."""
        data = self.valid_data.copy()
        data['amount'] = 0
        serializer = PaymentCreateUpdateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('amount', serializer.errors)

    def test_create_serializer_amount_negative(self):
        """amount > 0 bo'lishi."""
        data = self.valid_data.copy()
        data['amount'] = -10.00
        serializer = PaymentCreateUpdateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('amount', serializer.errors)

    def test_create_serializer_future_payment_date(self):
        """payment_date kelajakda bo'lmasligi."""
        data = self.valid_data.copy()
        data['payment_date'] = timezone.now() + timedelta(days=1)
        serializer = PaymentCreateUpdateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('payment_date', serializer.errors)

    def test_create_serializer_invalid_currency(self):
        """currency faqat USD/EUR/UZS."""
        data = self.valid_data.copy()
        data['currency'] = 'XXX'
        serializer = PaymentCreateUpdateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('currency', serializer.errors)

    def test_create_serializer_transaction_id_unique(self):
        """transaction_id unique bo'lishi."""
        Payment.objects.create(
            booking=self.booking,
            amount=100.00,
            currency=Payment.Currency.USD,
            method=Payment.Method.CARD,
            status=Payment.Status.COMPLETED,
            transaction_id='TXN123456',
            payment_date=timezone.now()
        )
        data = self.valid_data.copy()
        data['transaction_id'] = 'TXN123456'
        serializer = PaymentCreateUpdateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('transaction_id', serializer.errors)

    def test_update_completed_payment_immutability(self):
        payment = Payment.objects.create(
            booking=self.booking,
            amount=100.00,
            currency=Payment.Currency.USD,
            method=Payment.Method.CARD,
            status=Payment.Status.COMPLETED,
            transaction_id='TXN123456',
            payment_date=timezone.now()
        )
        data = {
            'booking': self.booking.id,  # <-- QO‘SHILDI
            'amount': 200.00,
            'currency': Payment.Currency.USD,
            'method': Payment.Method.CARD,
            'status': Payment.Status.COMPLETED,
            'payment_date': timezone.now()
        }
        serializer = PaymentCreateUpdateSerializer(instance=payment, data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('amount', serializer.errors)

    def test_update_pending_payment_allowed(self):
        """PENDING payment - update allowed."""
        payment = Payment.objects.create(
            booking=self.booking,
            amount=100.00,
            currency=Payment.Currency.USD,
            method=Payment.Method.CARD,
            status=Payment.Status.PENDING,
            payment_date=timezone.now()
        )
        data = {
            'booking': self.booking.id,
            'amount': 150.00,
            'currency': Payment.Currency.USD,
            'method': Payment.Method.CASH,
            'status': Payment.Status.COMPLETED,
            'payment_date': timezone.now(),
            'notes': 'Updated'
        }
        serializer = PaymentCreateUpdateSerializer(instance=payment, data=data)
        self.assertTrue(serializer.is_valid())
        updated = serializer.save()
        self.assertEqual(updated.amount, 150.00)
        self.assertEqual(updated.method, Payment.Method.CASH)
        self.assertEqual(updated.status, Payment.Status.COMPLETED)







class PaymentViewSetTest(TestCase):
    """Payment ViewSet uchun testlar."""

    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_superuser(
            username='admin',
            password='admin123',
            email='admin@example.com'
        )
        self.normal_user = User.objects.create_user(
            username='user',
            password='user123',
            email='user@example.com'
        )
        self.client.force_authenticate(user=self.admin_user)

        self.customer = Customer.objects.create(
            full_name='Test Customer',
            passport='UZ1234567',
            phone='+998901234567',
            email='test@example.com'
        )
        self.room = Room.objects.create(
            number='101',
            floor=1,
            room_type='Standard',
            capacity=2,
            price_per_night=80.00,
            status=Room.Status.AVAILABLE
        )
        self.booking = Booking.objects.create(
            customer=self.customer,
            room=self.room,
            checkin=date.today(),
            checkout=date.today() + timedelta(days=3),
            guest_count=2,
            total_price=240.00,
            status=Booking.Status.PENDING
        )
        self.payment = Payment.objects.create(
            booking=self.booking,
            amount=100.00,
            currency=Payment.Currency.USD,
            method=Payment.Method.CASH,
            status=Payment.Status.PENDING,
            payment_date=timezone.now()
        )
        self.payment_url = f'/api/v1/payments/{self.payment.id}/'

    def test_list_payments_authenticated(self):
        """GET /api/v1/payments/ - authenticated user."""
        self.client.force_authenticate(user=self.normal_user)
        response = self.client.get('/api/v1/payments/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_list_payments_unauthenticated(self):
        """GET /api/v1/payments/ - unauthenticated user."""
        self.client.logout()
        response = self.client.get('/api/v1/payments/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_retrieve_payment_authenticated(self):
        """GET /api/v1/payments/{id}/ - authenticated user."""
        self.client.force_authenticate(user=self.normal_user)
        response = self.client.get(self.payment_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['amount'], '100.00')

    def test_create_payment_as_admin(self):
        """POST /api/v1/payments/ - admin user."""
        self.client.force_authenticate(user=self.admin_user)
        data = {
            'booking': self.booking.id,
            'amount': 50.00,
            'currency': Payment.Currency.USD,
            'method': Payment.Method.CARD,
            'status': Payment.Status.PENDING,
            'payment_date': timezone.now().isoformat()
        }
        response = self.client.post('/api/v1/payments/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Payment.objects.count(), 2)

    def test_create_payment_as_normal_user(self):
        """POST /api/v1/payments/ - normal user (forbidden)."""
        self.client.force_authenticate(user=self.normal_user)
        data = {
            'booking': self.booking.id,
            'amount': 50.00,
            'currency': Payment.Currency.USD,
            'method': Payment.Method.CARD,
            'status': Payment.Status.PENDING,
            'payment_date': timezone.now().isoformat()
        }
        response = self.client.post('/api/v1/payments/', data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_payment_as_admin(self):
        """PUT /api/v1/payments/{id}/ - admin user."""
        self.client.force_authenticate(user=self.admin_user)
        data = {
            'booking': self.booking.id,
            'amount': 150.00,
            'currency': Payment.Currency.USD,
            'method': Payment.Method.CARD,
            'status': Payment.Status.PENDING,
            'payment_date': timezone.now().isoformat()
        }
        response = self.client.put(self.payment_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.payment.refresh_from_db()
        self.assertEqual(self.payment.amount, 150.00)

    def test_update_payment_as_normal_user(self):
        """PUT /api/v1/payments/{id}/ - normal user (forbidden)."""
        self.client.force_authenticate(user=self.normal_user)
        data = {
            'booking': self.booking.id,
            'amount': 150.00,
            'currency': Payment.Currency.USD,
            'method': Payment.Method.CARD,
            'status': Payment.Status.PENDING,
            'payment_date': timezone.now().isoformat()
        }
        response = self.client.put(self.payment_url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_payment_as_admin(self):
        """DELETE /api/v1/payments/{id}/ - admin user (soft-delete)."""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.delete(self.payment_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.payment.refresh_from_db()
        self.assertFalse(self.payment.is_active)

        # Not in list
        list_response = self.client.get('/api/v1/payments/')
        self.assertEqual(len(list_response.data['results']), 0)

    def test_delete_payment_as_normal_user(self):
        """DELETE /api/v1/payments/{id}/ - normal user (forbidden)."""
        self.client.force_authenticate(user=self.normal_user)
        response = self.client.delete(self.payment_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_filter_by_status(self):
        """Filter by status."""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/v1/payments/?status=pending')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['status'], 'pending')

    def test_filter_by_method(self):
        """Filter by method."""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/v1/payments/?method=cash')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['method'], 'cash')

    def test_filter_by_booking(self):
        """Filter by booking."""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(f'/api/v1/payments/?booking={self.booking.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)






class PaymentBusinessLogicTest(TestCase):
    """Payment business logic testlari (Refund, Overpayment)."""

    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_superuser(
            username='admin',
            password='admin123',
            email='admin@example.com'
        )
        self.normal_user = User.objects.create_user(
            username='user',
            password='user123',
            email='user@example.com'
        )
        self.client.force_authenticate(user=self.admin_user)

        self.customer = Customer.objects.create(
            full_name='Test Customer',
            passport='UZ1234567',
            phone='+998901234567',
            email='test@example.com'
        )
        self.room = Room.objects.create(
            number='101',
            floor=1,
            room_type='Standard',
            capacity=2,
            price_per_night=80.00,
            status=Room.Status.AVAILABLE
        )
        self.booking = Booking.objects.create(
            customer=self.customer,
            room=self.room,
            checkin=date.today(),
            checkout=date.today() + timedelta(days=3),
            guest_count=2,
            total_price=240.00,
            status=Booking.Status.PENDING
        )
        self.payment = Payment.objects.create(
            booking=self.booking,
            amount=100.00,
            currency=Payment.Currency.USD,
            method=Payment.Method.CASH,
            status=Payment.Status.COMPLETED,
            payment_date=timezone.now()
        )

    def test_refund_completed_payment(self):
        """COMPLETED paymentni refund qilish."""
        response = self.client.post(f'/api/v1/payments/{self.payment.id}/refund/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.payment.refresh_from_db()
        self.assertEqual(self.payment.status, Payment.Status.REFUNDED)

    def test_refund_pending_payment(self):
        """PENDING paymentni refund qilish mumkin emas."""
        payment = Payment.objects.create(
            booking=self.booking,
            amount=50.00,
            currency=Payment.Currency.USD,
            method=Payment.Method.CARD,
            status=Payment.Status.PENDING,
            payment_date=timezone.now()
        )
        response = self.client.post(f'/api/v1/payments/{payment.id}/refund/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_refund_already_refunded_payment(self):
        """Allaqachon refunded paymentni qayta refund qilish mumkin emas."""
        self.payment.status = Payment.Status.REFUNDED
        self.payment.save()
        response = self.client.post(f'/api/v1/payments/{self.payment.id}/refund/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_refund_permission_normal_user(self):
        """Oddiy foydalanuvchi refund qila olmasligi."""
        self.client.force_authenticate(user=self.normal_user)
        response = self.client.post(f'/api/v1/payments/{self.payment.id}/refund/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_overpayment_validation_create(self):
        data = {
            'booking': self.booking.id,
            'amount': 150.00,
            'currency': Payment.Currency.USD,
            'method': Payment.Method.CASH,
            'status': Payment.Status.COMPLETED,
            'payment_date': timezone.now().isoformat()
        }
        response = self.client.post('/api/v1/payments/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('amount', response.data['error']['errors'])

    def test_overpayment_validation_update(self):
        # Create PENDING payment
        payment = Payment.objects.create(
            booking=self.booking,
            amount=50.00,
            currency=Payment.Currency.USD,
            method=Payment.Method.CARD,
            status=Payment.Status.PENDING,
            payment_date=timezone.now()
        )

        # Try to update to COMPLETED with overpayment
        data = {
            'booking': self.booking.id,
            'amount': 200.00,
            'currency': Payment.Currency.USD,
            'method': Payment.Method.CASH,
            'status': Payment.Status.COMPLETED,
            'payment_date': timezone.now().isoformat()
        }
        response = self.client.put(f'/api/v1/payments/{payment.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('amount', response.data['error']['errors'])

    def test_overpayment_validation_update_allowed(self):
        # Create PENDING payment
        payment = Payment.objects.create(
            booking=self.booking,
            amount=50.00,
            currency=Payment.Currency.USD,
            method=Payment.Method.CARD,
            status=Payment.Status.PENDING,
            payment_date=timezone.now()
        )

        # Update to COMPLETED with allowed amount
        data = {
            'booking': self.booking.id,
            'amount': 140.00,
            'currency': Payment.Currency.USD,
            'method': Payment.Method.CASH,
            'status': Payment.Status.COMPLETED,
            'payment_date': timezone.now().isoformat()
        }
        response = self.client.put(f'/api/v1/payments/{payment.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payment.refresh_from_db()
        self.assertEqual(payment.amount, 140.00)
        self.assertEqual(payment.status, Payment.Status.COMPLETED)

        def test_overpayment_validation_update_allowed(self):
            """
            Overpayment validation - update PENDING to COMPLETED with allowed amount.
            """
            # Create a PENDING payment
            payment = Payment.objects.create(
                booking=self.booking,
                amount=50.00,
                currency=Payment.Currency.USD,
                method=Payment.Method.CARD,
                status=Payment.Status.PENDING,
                payment_date=timezone.now()
            )

            # Update to COMPLETED with amount 140 (100 existing + 140 = 240 → allowed)
            data = {
                'booking': self.booking.id,
                'amount': 140.00,
                'currency': Payment.Currency.USD,
                'method': Payment.Method.CASH,
                'status': Payment.Status.COMPLETED,
                'payment_date': timezone.now().isoformat()
            }
            response = self.client.put(f'/api/v1/payments/{payment.id}/', data)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            payment.refresh_from_db()
            self.assertEqual(payment.amount, 140.00)
            self.assertEqual(payment.status, Payment.Status.COMPLETED)


    def test_overpayment_validation_pending_payment(self):
        """PENDING payment overpayment validation qilmasligi."""
        # Create a pending payment (should not be validated)
        data = {
            'booking': self.booking.id,
            'amount': 300.00,
            'currency': Payment.Currency.USD,
            'method': Payment.Method.CASH,
            'status': Payment.Status.PENDING,
            'payment_date': timezone.now().isoformat()
        }
        response = self.client.post('/api/v1/payments/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)  # Allowed because status is PENDING

# ============================================================
# PUBLIC BOOKING TESTS (Phase 2)
# ============================================================
# Note: as of this step, apps/core/urls.py has not been wired to the
# public views yet (by design, per the approved Phase 2 plan), so the
# view-level tests below call the view classes directly via
# RequestFactory rather than through self.client + a URL path.

from django.test import RequestFactory
from .services import PublicBookingService
from .views import (
    PublicRoomAvailabilityView,
    PublicBookingCreateView,
    PublicBookingStatusView,
)


class PublicBookingServiceTest(TestCase):
    """PublicBookingService — reference generation/persistence, customer
    conflict handling, double-booking protection, and validation."""

    def setUp(self):
        self.room = Room.objects.create(
            number='201',
            floor=2,
            room_type='Standard',
            capacity=2,
            price_per_night=100.00,
            status=Room.Status.AVAILABLE
        )
        self.valid_data = {
            'room': self.room.id,
            'full_name': 'Ali Valiyev',
            'passport': 'AA1234567',
            'phone': '+998901112233',
            'email': 'ali@example.com',
            'checkin': date.today() + timedelta(days=1),
            'checkout': date.today() + timedelta(days=3),
            'guest_count': 2,
            'special_requests': '',
        }

    def test_create_public_booking_success_persists_reference(self):
        """Muvaffaqiyatli booking reference bilan DBga saqlanishi."""
        result = PublicBookingService.create_public_booking(self.valid_data)
        booking = result['booking']
        reference = result['reference']

        self.assertIsNotNone(reference)
        self.assertTrue(reference.startswith(f'HMS-{date.today().year}-'))

        # Reload from DB to confirm it was actually persisted, not just
        # returned in-memory.
        booking.refresh_from_db()
        self.assertEqual(booking.reference, reference)

    def test_reference_is_unique_across_multiple_bookings(self):
        """Ketma-ket yaratilgan bookinglar turli, unique reference olishi."""
        room2 = Room.objects.create(
            number='202', floor=2, room_type='Standard',
            capacity=2, price_per_night=100.00, status=Room.Status.AVAILABLE
        )
        data2 = self.valid_data.copy()
        data2['room'] = room2.id
        data2['passport'] = 'AA7654321'
        data2['phone'] = '+998907778899'
        data2['email'] = 'boshqa@example.com'

        result1 = PublicBookingService.create_public_booking(self.valid_data)
        result2 = PublicBookingService.create_public_booking(data2)

        self.assertNotEqual(result1['reference'], result2['reference'])
        self.assertEqual(
            Booking.objects.filter(reference__isnull=False).distinct().count(), 2
        )

    def test_double_booking_protection_still_enforced(self):
        """Bir xonaga bir xil sanalarga ikkinchi booking rad etilishi (mavjud himoya buzilmagan)."""
        PublicBookingService.create_public_booking(self.valid_data)

        conflicting_data = self.valid_data.copy()
        conflicting_data['phone'] = '+998909998877'
        conflicting_data['email'] = 'ikkinchi@example.com'

        with self.assertRaises(ValidationError):
            PublicBookingService.create_public_booking(conflicting_data)

    def test_create_public_booking_checkin_in_past(self):
        data = self.valid_data.copy()
        data['checkin'] = date.today() - timedelta(days=1)
        with self.assertRaises(ValidationError):
            PublicBookingService.create_public_booking(data)

    def test_create_public_booking_checkout_before_checkin(self):
        data = self.valid_data.copy()
        data['checkout'] = data['checkin']
        with self.assertRaises(ValidationError):
            PublicBookingService.create_public_booking(data)

    def test_create_public_booking_guest_count_exceeds_capacity(self):
        data = self.valid_data.copy()
        data['guest_count'] = 10  # room capacity is 2
        with self.assertRaises(ValidationError):
            PublicBookingService.create_public_booking(data)

    def test_create_public_booking_room_not_available_status(self):
        self.room.status = Room.Status.MAINTENANCE
        self.room.save(update_fields=['status'])
        with self.assertRaises(ValidationError):
            PublicBookingService.create_public_booking(self.valid_data)

    def test_create_public_booking_room_does_not_exist(self):
        import uuid
        data = self.valid_data.copy()
        data['room'] = uuid.uuid4()
        with self.assertRaises(ValidationError):
            PublicBookingService.create_public_booking(data)

    def test_get_or_create_customer_creates_new(self):
        customer = PublicBookingService.get_or_create_customer({
            'full_name': 'Yangi Mijoz',
            'passport': 'BB9998887',
            'phone': '+998901010101',
            'email': 'yangi@example.com',
        })
        self.assertIsNotNone(customer.pk)
        self.assertEqual(Customer.objects.filter(phone='+998901010101').count(), 1)

    def test_get_or_create_customer_finds_existing_by_phone(self):
        existing = Customer.objects.create(
            full_name='Mavjud Mijoz', passport='CC1112223', phone='+998905554433'
        )
        customer = PublicBookingService.get_or_create_customer({
            'full_name': 'Mavjud Mijoz',
            'phone': '+998905554433',
            'email': 'yangi-email@example.com',
        })
        self.assertEqual(customer.pk, existing.pk)
        customer.refresh_from_db()
        self.assertEqual(customer.email, 'yangi-email@example.com')

    def test_get_or_create_customer_phone_match_conflicting_email_no_crash(self):
        """
        Regression test: telefon bo'yicha mijoz A topiladi, lekin berilgan
        email allaqachon mijoz B'ga tegishli. IntegrityError chiqmasligi va
        booking oqimi davom etishi kerak.
        """
        customer_a = Customer.objects.create(
            full_name='Mijoz A', passport='DD1231231', phone='+998901112200'
        )
        Customer.objects.create(
            full_name='Mijoz B', passport='EE3213214',
            phone='+998909998811', email='band@example.com'
        )

        # Should not raise IntegrityError
        result_customer = PublicBookingService.get_or_create_customer({
            'full_name': 'Mijoz A',
            'phone': '+998901112200',
            'email': 'band@example.com',  # already belongs to Mijoz B
        })
        self.assertEqual(result_customer.pk, customer_a.pk)
        result_customer.refresh_from_db()
        # Email must NOT have been overwritten with a conflicting value
        self.assertNotEqual(result_customer.email, 'band@example.com')

    def test_get_or_create_customer_email_match_conflicting_passport_no_crash(self):
        """
        Email orqali mijoz topiladi (telefon berilmagan, shuning uchun
        telefon-birinchi qidiruv shoxobchasi ishlamaydi), lekin berilgan
        passport allaqachon boshqa mijozga tegishli bo'lsa ham crash
        bo'lmasligi kerak.
        """
        customer_a = Customer.objects.create(
            full_name='Mijoz C', passport='FF4564567',
            phone='+998900004444', email='mijozc@example.com'
        )
        Customer.objects.create(
            full_name='Mijoz D', passport='GG7897890',
            phone='+998901119999', email='mijozd@example.com'
        )

        # phone berilmagan -> lookup email shoxobchasiga tushadi -> customer_a topiladi
        result_customer = PublicBookingService.get_or_create_customer({
            'full_name': 'Mijoz C',
            'email': 'mijozc@example.com',
            'passport': 'GG7897890',  # already belongs to Mijoz D
        })
        self.assertEqual(result_customer.pk, customer_a.pk)
        result_customer.refresh_from_db()
        self.assertNotEqual(result_customer.passport, 'GG7897890')

    def test_public_booking_end_to_end_with_conflicting_contact_info(self):
        """
        To'liq oqim: mavjud mijoz + conflicting email berilgan holatda ham
        booking muvaffaqiyatli yaratilishi kerak (crash bo'lmasligi).
        """
        Customer.objects.create(
            full_name='Boshqa Mijoz', passport='HH1112223',
            phone='+998900001111', email=self.valid_data['email']  # conflicts
        )
        data = self.valid_data.copy()
        data['phone'] = '+998900002222'  # new phone, but email already taken
        result = PublicBookingService.create_public_booking(data)
        self.assertIsNotNone(result['booking'].pk)
        self.assertIsNotNone(result['reference'])


class PublicBookingViewsTest(TestCase):
    """
    Public view-level tests via RequestFactory (urls.py not yet wired for
    these views at this step, per the approved Phase 2 plan).
    """

    def setUp(self):
        self.factory = RequestFactory()
        self.room = Room.objects.create(
            number='301', floor=3, room_type='Deluxe',
            capacity=3, price_per_night=150.00, status=Room.Status.AVAILABLE
        )
        self.checkin = (date.today() + timedelta(days=2)).isoformat()
        self.checkout = (date.today() + timedelta(days=5)).isoformat()

    # --- PublicRoomAvailabilityView ---

    def test_availability_view_success_no_auth_needed(self):
        request = self.factory.get(
            '/fake-public/rooms/availability/',
            {'checkin': self.checkin, 'checkout': self.checkout, 'guests': 2}
        )
        response = PublicRoomAvailabilityView.as_view()(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['rooms']), 1)
        self.assertEqual(response.data['rooms'][0]['room_type'], 'Deluxe')

    def test_availability_view_missing_params(self):
        request = self.factory.get('/fake-public/rooms/availability/')
        response = PublicRoomAvailabilityView.as_view()(request)
        self.assertEqual(response.status_code, 400)

    def test_availability_view_invalid_date_format(self):
        request = self.factory.get(
            '/fake-public/rooms/availability/',
            {'checkin': '02-09-2026', 'checkout': self.checkout}
        )
        response = PublicRoomAvailabilityView.as_view()(request)
        self.assertEqual(response.status_code, 400)

    def test_availability_view_checkin_in_past(self):
        past = (date.today() - timedelta(days=1)).isoformat()
        request = self.factory.get(
            '/fake-public/rooms/availability/',
            {'checkin': past, 'checkout': self.checkout}
        )
        response = PublicRoomAvailabilityView.as_view()(request)
        self.assertEqual(response.status_code, 400)

    def test_availability_view_invalid_guests_param(self):
        """Regression: son bo'lmagan 'guests' 500 emas, 400 qaytarishi kerak."""
        request = self.factory.get(
            '/fake-public/rooms/availability/',
            {'checkin': self.checkin, 'checkout': self.checkout, 'guests': 'abc'}
        )
        response = PublicRoomAvailabilityView.as_view()(request)
        self.assertEqual(response.status_code, 400)

    # --- PublicBookingCreateView ---

    def _valid_booking_payload(self):
        return {
            'room': str(self.room.id),
            'full_name': 'Test Mehmon',
            'passport': 'ZZ1231231',
            'phone': '+998901234500',
            'email': 'mehmon@example.com',
            'checkin': self.checkin,
            'checkout': self.checkout,
            'guest_count': 2,
            'special_requests': '',
        }

    def test_booking_create_view_success_no_auth_needed(self):
        request = self.factory.post(
            '/fake-public/bookings/', self._valid_booking_payload(), format='json'
        )
        response = PublicBookingCreateView.as_view()(request)
        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data['success'])
        self.assertIn('reference', response.data['booking'])

        # Confirm it's really in the DB with the reference persisted.
        booking = Booking.objects.get(id=response.data['booking']['id'])
        self.assertEqual(booking.reference, response.data['booking']['reference'])

    def test_booking_create_view_missing_required_field(self):
        payload = self._valid_booking_payload()
        del payload['passport']  # required field
        request = self.factory.post('/fake-public/bookings/', payload, format='json')
        response = PublicBookingCreateView.as_view()(request)
        self.assertEqual(response.status_code, 400)

    def test_booking_create_view_room_unavailable(self):
        self.room.status = Room.Status.OCCUPIED
        self.room.save(update_fields=['status'])
        request = self.factory.post(
            '/fake-public/bookings/', self._valid_booking_payload(), format='json'
        )
        response = PublicBookingCreateView.as_view()(request)
        self.assertEqual(response.status_code, 400)

    # --- PublicBookingStatusView ---

    def test_booking_status_view_success(self):
        create_request = self.factory.post(
            '/fake-public/bookings/', self._valid_booking_payload(), format='json'
        )
        create_response = PublicBookingCreateView.as_view()(create_request)
        booking_id = create_response.data['booking']['id']
        reference = create_response.data['booking']['reference']

        status_request = self.factory.get(
            '/fake-public/bookings/status/', {'reference': reference, 'id': booking_id}
        )
        response = PublicBookingStatusView.as_view()(status_request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['reference'], reference)
        self.assertEqual(response.data['status'], Booking.Status.PENDING)

    def test_booking_status_view_wrong_reference(self):
        create_request = self.factory.post(
            '/fake-public/bookings/', self._valid_booking_payload(), format='json'
        )
        create_response = PublicBookingCreateView.as_view()(create_request)
        booking_id = create_response.data['booking']['id']

        status_request = self.factory.get(
            '/fake-public/bookings/status/',
            {'reference': 'HMS-2026-WRONG1', 'id': booking_id}
        )
        response = PublicBookingStatusView.as_view()(status_request)
        self.assertEqual(response.status_code, 404)

    def test_booking_status_view_missing_params(self):
        request = self.factory.get('/fake-public/bookings/status/')
        response = PublicBookingStatusView.as_view()(request)
        self.assertEqual(response.status_code, 400)

    def test_booking_status_view_malformed_id_does_not_500(self):
        """Regression: noto'g'ri UUID format 500 emas, 404 qaytarishi kerak."""
        request = self.factory.get(
            '/fake-public/bookings/status/',
            {'reference': 'HMS-2026-ABC123', 'id': 'not-a-uuid'}
        )
        response = PublicBookingStatusView.as_view()(request)
        self.assertEqual(response.status_code, 404)


class PublicBookingURLIntegrationTest(TestCase):
    """
    Real HTTP-path integration tests (STEP 3): hits the actual wired
    /api/v1/public/... routes via APIClient, exactly as a real browser
    request would, rather than calling the view classes directly.
    """

    def setUp(self):
        self.client = APIClient()  # no credentials/token ever set here
        self.room = Room.objects.create(
            number='401', floor=4, room_type='Suite',
            capacity=2, price_per_night=200.00, status=Room.Status.AVAILABLE
        )
        self.checkin = (date.today() + timedelta(days=10)).isoformat()
        self.checkout = (date.today() + timedelta(days=12)).isoformat()

    def _valid_payload(self):
        return {
            'room': str(self.room.id),
            'full_name': 'URL Test Mehmon',
            'passport': 'UT1112223',
            'phone': '+998901230000',
            'email': 'urltest@example.com',
            'checkin': self.checkin,
            'checkout': self.checkout,
            'guest_count': 2,
            'special_requests': '',
        }

    def test_availability_via_real_url_no_auth(self):
        response = self.client.get(
            '/api/v1/public/rooms/availability/',
            {'checkin': self.checkin, 'checkout': self.checkout, 'guests': 2}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['rooms']), 1)

    def test_availability_via_real_url_invalid_request(self):
        response = self.client.get('/api/v1/public/rooms/availability/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_booking_create_via_real_url_no_auth(self):
        response = self.client.post(
            '/api/v1/public/bookings/', self._valid_payload(), format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertIn('reference', response.data['booking'])
        booking = Booking.objects.get(id=response.data['booking']['id'])
        self.assertEqual(booking.reference, response.data['booking']['reference'])

    def test_booking_create_via_real_url_invalid_request(self):
        payload = self._valid_payload()
        del payload['passport']
        response = self.client.post('/api/v1/public/bookings/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_booking_create_via_real_url_invalid_uuid_room(self):
        payload = self._valid_payload()
        payload['room'] = 'not-a-valid-uuid'
        response = self.client.post('/api/v1/public/bookings/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_booking_status_via_real_url_no_auth(self):
        create_response = self.client.post(
            '/api/v1/public/bookings/', self._valid_payload(), format='json'
        )
        booking_id = create_response.data['booking']['id']
        reference = create_response.data['booking']['reference']

        response = self.client.get(
            '/api/v1/public/bookings/status/', {'reference': reference, 'id': booking_id}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['reference'], reference)

    def test_booking_status_via_real_url_wrong_reference(self):
        create_response = self.client.post(
            '/api/v1/public/bookings/', self._valid_payload(), format='json'
        )
        booking_id = create_response.data['booking']['id']

        response = self.client.get(
            '/api/v1/public/bookings/status/',
            {'reference': 'HMS-2026-NOPE99', 'id': booking_id}
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_public_endpoints_work_without_any_authorization_header(self):
        """Explicitly confirm no Authorization header is needed anywhere in the flow."""
        self.assertNotIn('HTTP_AUTHORIZATION', self.client._credentials)
        avail = self.client.get(
            '/api/v1/public/rooms/availability/',
            {'checkin': self.checkin, 'checkout': self.checkout}
        )
        create = self.client.post('/api/v1/public/bookings/', self._valid_payload(), format='json')
        self.assertEqual(avail.status_code, status.HTTP_200_OK)
        self.assertEqual(create.status_code, status.HTTP_201_CREATED)

    def test_admin_endpoints_still_require_auth_after_public_routes_added(self):
        """
        Regression guard: adding public routes must not have loosened
        the existing authenticated admin endpoints.
        """
        response = self.client.get('/api/v1/rooms/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_no_duplicate_route_conflict_for_bookings(self):
        """
        '/api/v1/public/bookings/' and the router's '/api/v1/bookings/'
        must be distinct, non-colliding routes.
        """
        response = self.client.get('/api/v1/bookings/')
        # Still requires auth (router-registered, unauthenticated -> 401),
        # proving it was NOT accidentally shadowed by the public path.
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
