// ================================================================
// XAVFSIZLIK: escapeHtml
// ================================================================
function escapeHtml(str) {
    if (!str) return '';
    var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(str).replace(/[&<>"']/g, function (m) { return map[m]; });
}

// ================================================================
// VALYUTA KURSLARI
// ================================================================
function getCurrencyRates() {
    try {
        var saved = JSON.parse(localStorage.getItem('hms_currency_rates'));
        if (saved && typeof saved === 'object') {
            return { USD: 1, EUR: 0.92, UZS: 12700, ...saved };
        }
    } catch (e) { }
    return { USD: 1, EUR: 0.92, UZS: 12700 };
}

function saveCurrencyRates(rates) {
    try {
        localStorage.setItem('hms_currency_rates', JSON.stringify(rates));
    } catch (e) { }
}

var CURRENCY_RATES = getCurrencyRates();

// // ================================================================
// // AUTH (QO‘SHILDI)
// // ================================================================
// var Auth = {
//     hashPassword: function(password) {
//         // Oddiy hash (base64) – real loyihada SHA-256 ishlatish tavsiya etiladi
//         return btoa(unescape(encodeURIComponent(password)));
//     },
//     check: function() {
//         // Agar parol hash mavjud bo‘lsa va login session belgisi o‘rnatilgan bo‘lsa
//         var hash = localStorage.getItem('hms_password_hash');
//         var loggedIn = localStorage.getItem('hms_logged_in') === 'true';
//         return !!(hash && loggedIn);
//     },
//     login: function(username, password, remember) {
//         var storedHash = localStorage.getItem('hms_password_hash');
//         if (!storedHash) {
//             // Agar hash yo‘q bo‘lsa, default parolni o‘rnatamiz
//             storedHash = this.hashPassword('admin123');
//             localStorage.setItem('hms_password_hash', storedHash);
//         }
//         var inputHash = this.hashPassword(password);
//         if (inputHash === storedHash) {
//             localStorage.setItem('hms_logged_in', 'true');
//             if (remember) {
//                 localStorage.setItem('hms_remember', 'true');
//             } else {
//                 localStorage.removeItem('hms_remember');
//             }
//             return true;
//         }
//         return false;
//     },
//     logout: function() {
//         localStorage.removeItem('hms_logged_in');
//         localStorage.removeItem('hms_remember');
//     },
//     resetPassword: function() {
//         var defaultHash = this.hashPassword('admin123');
//         localStorage.setItem('hms_password_hash', defaultHash);
//         Toast.success('Parol default (admin123) holatiga qaytarildi');
//     },
//     clearStorage: function() {
//         var keys = Object.keys(localStorage);
//         keys.forEach(function(key) {
//             if (key.startsWith('hms_')) {
//                 localStorage.removeItem(key);
//             }
//         });
//         window.location.reload();
//     }
// };

// ================================================================
// XONA SERVISI (QO‘SHILDI)
// ================================================================
// var roomService = {
//     _pagination: { count: 0, next: null, previous: null, currentPage: 1 },
//     _getRooms: function() {
//         try {
//             return JSON.parse(localStorage.getItem('hms_rooms')) || [];
//         } catch (e) { return []; }
//     },
//     _saveRooms: function(rooms) {
//         localStorage.setItem('hms_rooms', JSON.stringify(rooms));
//     },
//     getPagination: function() {
//         return this._pagination;
//     },
//     getRooms: function(page, limit) {
//         var all = this._getRooms();
//         var total = all.length;
//         var perPage = limit || 25;
//         var totalPages = Math.ceil(total / perPage) || 1;
//         var currentPage = Math.min(Math.max(page || 1, 1), totalPages);
//         var start = (currentPage - 1) * perPage;
//         var end = Math.min(start + perPage, total);
//         var paged = all.slice(start, end);

//         this._pagination.count = total;
//         this._pagination.currentPage = currentPage;
//         this._pagination.next = (currentPage < totalPages) ? currentPage + 1 : null;
//         this._pagination.previous = (currentPage > 1) ? currentPage - 1 : null;

//         return paged;
//     },
//     createRoom: function(roomData) {
//         var rooms = this._getRooms();
//         var newRoom = {
//             id: Date.now() + Math.random().toString(36).substr(2, 6),
//             number: roomData.number,
//             type: roomData.room_type || roomData.type || 'Standard',
//             price: roomData.price_per_night || roomData.price || 80,
//             status: roomData.status || 'Available',
//             description: roomData.description || ''
//         };
//         // Xona raqami takrorlanmasligini tekshirish
//         var exists = rooms.some(function(r) { return r.number === newRoom.number; });
//         if (exists) {
//             throw new Error('Xona raqami allaqachon mavjud');
//         }
//         rooms.push(newRoom);
//         this._saveRooms(rooms);
//         return newRoom;
//     },
//     updateRoom: function(id, roomData) {
//         var rooms = this._getRooms();
//         var index = rooms.findIndex(function(r) { return r.id === id; });
//         if (index === -1) throw new Error('Xona topilmadi');
//         var existing = rooms[index];
//         // Raqam takrorlanishini tekshirish
//         var duplicate = rooms.some(function(r) {
//             return r.number === roomData.number && r.id !== id;
//         });
//         if (duplicate) throw new Error('Xona raqami allaqachon mavjud');

//         var updated = {
//             ...existing,
//             number: roomData.number || existing.number,
//             type: roomData.room_type || roomData.type || existing.type,
//             price: roomData.price_per_night || roomData.price || existing.price,
//             status: roomData.status || existing.status,
//             description: roomData.description || existing.description || ''
//         };
//         rooms[index] = updated;
//         this._saveRooms(rooms);
//         return updated;
//     },
//     deleteRoom: function(id) {
//         var rooms = this._getRooms();
//         var filtered = rooms.filter(function(r) { return r.id !== id; });
//         if (filtered.length === rooms.length) throw new Error('Xona topilmadi');
//         this._saveRooms(filtered);
//     }
// };

// ================================================================
// TRANSLATIONS
// ================================================================
var T = {
    uz: {
        nav_dashboard: 'Boshqaruv',
        nav_rooms: 'Xonalar',
        nav_customers: 'Mijozlar',
        nav_bookings: 'Bronlar',
        nav_payments: 'To\'lovlar',
        nav_reports: 'Hisobotlar',
        nav_profile: 'Profil',
        nav_settings: 'Sozlamalar',
        total_rooms: 'Jami Xonalar',
        available: 'Bo\'sh',
        booked: 'Band',
        customers: 'Mijozlar',
        recent_bookings: 'So\'nggi bronlar',
        add_room: 'Xona qo\'shish',
        add_customer: 'Mijoz qo\'shish',
        create_booking: 'Bron yaratish',
        add_payment: 'To\'lov qo\'shish',
        revenue_summary: 'Daromad xulosasi',
        room: 'Xona',
        number: 'Raqam',
        type: 'Tur',
        price: 'Narx',
        status: 'Holat',
        cancel: 'Bekor qilish',
        save: 'Saqlash',
        customer: 'Mijoz',
        name: 'Ism',
        email: 'Email',
        phone: 'Telefon',
        booking: 'Bron',
        checkin: 'Kirish',
        checkout: 'Chiqish',
        payment: 'To\'lov',
        amount: 'Miqdor',
        method: 'Usul',
        new_password: 'Yangi parol',
        update_profile: 'Profilni yangilash',
        dark_mode: 'Tungi rejim',
        hotel_name: 'Mehmonxona nomi',
        save_settings: 'Sozlamalarni saqlash',
        total_revenue: 'Jami daromad',
        today_revenue: 'Bugungi daromad',
        paid_payments: 'To\'langan to\'lovlar',
        occupancy_rate: 'Bandlik darajasi',
        no_notifications: 'Xabarlar yo\'q',
        language: 'Til',
        hotel_address: 'Manzil',
        hotel_phone: 'Telefon',
        active_bookings: 'Faol bronlar',
        notifications: 'Xabarlar',
        mark_all_read: 'Hammasini o\'qish',
        clear_all: 'Tozalash',
        logout: 'Chiqish',
        nights: 'kecha',
        total_price: 'Jami narx',
        all: 'Barcha',
        upcoming: 'Kelgusi',
        active: 'Faol',
        checked_in: 'Kirgan',
        checked_out: 'Chiqgan',
        no_booking: 'Bronsiz',
        active_booking: 'Faol bron',
        unpaid: 'To\'lanmagan',
        today_filter: 'Bugun',
        this_week: 'Bu hafta',
        this_month: 'Bu oy',
        maintenance: 'Ta\'mirlash',
        enter_name: 'Ism familiyani kiriting...',
        enter_email: 'Email kiriting...',
        enter_phone: '+998 90 123 45 67',
        enter_password: 'Yangi parol kiriting...',
        enter_room_number: 'Xona raqamini kiriting...',
        enter_price: 'Narx kiriting...',
        enter_amount: 'Miqdor kiriting...',
        required_field: 'Bu maydon majburiy',
        valid_email: 'To\'g\'ri email kiriting',
        phone_format: 'Telefon +998 bilan boshlanishi kerak',
        duplicate_room: 'Xona raqami allaqachon mavjud',
        room_added: 'Xona qo\'shildi',
        room_updated: 'Xona yangilandi',
        room_deleted: 'Xona o\'chirildi',
        customer_added: 'Mijoz qo\'shildi',
        customer_updated: 'Mijoz yangilandi',
        customer_deleted: 'Mijoz o\'chirildi',
        booking_created: 'Bron yaratildi',
        booking_updated: 'Bron yangilandi',
        booking_deleted: 'Bron o\'chirildi',
        payment_added: 'To\'lov qo\'shildi',
        payment_updated: 'To\'lov yangilandi',
        payment_deleted: 'To\'lov o\'chirildi',
        success: 'Muvaffaqiyat',
        info: 'Ma\'lumot',
        warning: 'Ogohlantirish',
        empty_rooms: 'Hozircha xonalar yo\'q',
        empty_rooms_desc: 'Birinchi xonani qo\'shish orqali boshlang.',
        empty_customers: 'Hozircha mijozlar yo\'q',
        empty_customers_desc: 'Birinchi mijozni qo\'shish orqali boshlang.',
        empty_bookings: 'Hozircha bronlar yo\'q',
        empty_bookings_desc: 'Birinchi bronni yaratish orqali boshlang.',
        empty_payments: 'Hozircha to\'lovlar yo\'q',
        empty_payments_desc: 'Birinchi to\'lovni qo\'shish orqali boshlang.',
        username: 'Foydalanuvchi nomi',
        password: 'Parol',
        remember_me: 'Eslab qolish',
        login: 'Kirish',
        recent_activity: 'So\'nggi faoliyat',
        no_recent_activity: 'So\'nggi faoliyat yo\'q',
        guest: 'Mehmon',
        view_all: 'Hammasini ko\'rish',
        edit: 'Tahrirlash',
        delete: 'O\'chirish',
        actions: 'Amallar',
        no_data: 'Ma\'lumotlar mavjud emas',
        pdf_export: 'PDF eksport',
        excel_export: 'Excel eksport',
        print: 'Chop etish',
        outstanding: "To'lanmagan",
        payment_history: "To'lov tarixi",
        due_date: "To'lov muddati",
        search: "Qidirish",
        year: "Yil",
        select_customer: "Mijozni tanlang",
        select_room: "Xonani tanlang",
        select_booking: "Bronni tanlang",
        report_title: "Mehmonxona Hisoboti",
        report_generated: "Yaratilgan",
        report_metrics: "Ko'rsatkichlar",
        report_value: "Qiymat",
        total_rooms_metric: "Jami Xonalar",
        customers_metric: "Mijozlar",
        bookings_metric: "Bronlar",
        revenue_metric: "Jami Daromad",
        paid_payments_metric: "To'langan To'lovlar",
        occupancy_metric: "Bandlik Darajasi",
        report_details: "Batafsil ma'lumotlar",
        room_list: "Xonalar ro'yxati",
        booking_list: "Bronlar ro'yxati",
        payment_list: "To'lovlar ro'yxati",
        days: "Kunlar",
        daily_price: "Kunlik narx",
        paid_amount: "To'langan miqdor",
        remaining_amount: "Qolgan miqdor",
        booking_already_paid: "Bu bron allaqachon to'langan",
        cannot_pay_more: "To'lov miqdori jami narxdan oshib ketadi",
        payment_exceeds_total: "To'lov miqdori jami narxdan katta bo'lishi mumkin emas",
        payment_history_title: "To'lov tarixi",
        partially_paid: "Qisman to'langan",
        total: "Jami",
        room_booked: "Xona allaqachon band",
        duplicate_phone: "Bu telefon raqami allaqachon ro'yxatdan o'tgan",
        invalid_date: "Noto'g'ri sana",
        today_checkins: "Bugungi kirishlar",
        today_checkouts: "Bugungi chiqishlar",
        pending_payments: "Kutilayotgan to'lovlar",
        popular_room: "Eng mashhur xona",
        filter_all: "Barcha",
        filter_unread: "O'qilmagan",
        filter_booking: "Bronlar",
        filter_payment: "To'lovlar",
        filter_customer: "Mijozlar",
        filter_system: "Tizim",
        search_notifications: "Xabarlarni qidirish...",
        no_notifications_found: "Xabarlar topilmadi",
        load_more: "Yana yuklash...",
        confirm_logout: "Chiqishni tasdiqlaysizmi?",
        logout_confirm: "Ha, chiqish",
        next_room: "Keyingi xona: ",
        price_currency: "Narx (USD)",
        export_data: "Ma'lumotlarni eksport qilish (JSON)",
        import_data: "Ma'lumotlarni import qilish (JSON)",
        history: "Tarix",
        no_history: "Tarix mavjud emas",
        removed_at: "O'chirilgan vaqt"
    },
    en: {
        nav_dashboard: 'Dashboard',
        nav_rooms: 'Rooms',
        nav_customers: 'Customers',
        nav_bookings: 'Bookings',
        nav_payments: 'Payments',
        nav_reports: 'Reports',
        nav_profile: 'Profile',
        nav_settings: 'Settings',
        total_rooms: 'Total Rooms',
        available: 'Available',
        booked: 'Booked',
        customers: 'Customers',
        recent_bookings: 'Recent Bookings',
        add_room: 'Add Room',
        add_customer: 'Add Customer',
        create_booking: 'Create Booking',
        add_payment: 'Add Payment',
        revenue_summary: 'Revenue Summary',
        room: 'Room',
        number: 'Number',
        type: 'Type',
        price: 'Price',
        status: 'Status',
        cancel: 'Cancel',
        save: 'Save',
        customer: 'Customer',
        name: 'Name',
        email: 'Email',
        phone: 'Phone',
        booking: 'Booking',
        checkin: 'Check-in',
        checkout: 'Check-out',
        payment: 'Payment',
        amount: 'Amount',
        method: 'Method',
        new_password: 'New Password',
        update_profile: 'Update Profile',
        dark_mode: 'Dark Mode',
        hotel_name: 'Hotel Name',
        save_settings: 'Save Settings',
        total_revenue: 'Total Revenue',
        today_revenue: 'Today\'s Revenue',
        paid_payments: 'Paid Payments',
        occupancy_rate: 'Occupancy Rate',
        no_notifications: 'No notifications',
        language: 'Language',
        hotel_address: 'Address',
        hotel_phone: 'Phone',
        active_bookings: 'Active Bookings',
        notifications: 'Notifications',
        mark_all_read: 'Mark all read',
        clear_all: 'Clear all',
        logout: 'Logout',
        nights: 'nights',
        total_price: 'Total price',
        all: 'All',
        upcoming: 'Upcoming',
        active: 'Active',
        checked_in: 'Checked In',
        checked_out: 'Checked Out',
        no_booking: 'No Booking',
        active_booking: 'Active Booking',
        unpaid: 'Unpaid',
        today_filter: 'Today',
        this_week: 'This Week',
        this_month: 'This Month',
        maintenance: 'Maintenance',
        enter_name: 'Enter full name...',
        enter_email: 'Enter email...',
        enter_phone: '+998 90 123 45 67',
        enter_password: 'Enter new password...',
        enter_room_number: 'Enter room number...',
        enter_price: 'Enter price...',
        enter_amount: 'Enter amount...',
        required_field: 'This field is required',
        valid_email: 'Please enter a valid email',
        phone_format: 'Phone must start with +998',
        duplicate_room: 'Room number already exists',
        room_added: 'Room added',
        room_updated: 'Room updated',
        room_deleted: 'Room deleted',
        customer_added: 'Customer added',
        customer_updated: 'Customer updated',
        customer_deleted: 'Customer deleted',
        booking_created: 'Booking created',
        booking_updated: 'Booking updated',
        booking_deleted: 'Booking deleted',
        payment_added: 'Payment added',
        payment_updated: 'Payment updated',
        payment_deleted: 'Payment deleted',
        success: 'Success',
        info: 'Info',
        warning: 'Warning',
        empty_rooms: 'No rooms yet',
        empty_rooms_desc: 'Add your first room to get started.',
        empty_customers: 'No customers yet',
        empty_customers_desc: 'Add your first customer to get started.',
        empty_bookings: 'No bookings yet',
        empty_bookings_desc: 'Create your first booking to get started.',
        empty_payments: 'No payments yet',
        empty_payments_desc: 'Add your first payment to get started.',
        username: 'Username',
        password: 'Password',
        remember_me: 'Remember me',
        login: 'Login',
        recent_activity: 'Recent Activity',
        no_recent_activity: 'No recent activity',
        guest: 'Guest',
        view_all: 'View All',
        edit: 'Edit',
        delete: 'Delete',
        actions: 'Actions',
        no_data: 'No data available',
        pdf_export: 'PDF Export',
        excel_export: 'Excel Export',
        print: 'Print',
        outstanding: "Outstanding",
        payment_history: "Payment History",
        due_date: "Due Date",
        search: "Search",
        year: "Year",
        select_customer: "Select customer",
        select_room: "Select room",
        select_booking: "Select booking",
        report_title: "Hotel Report",
        report_generated: "Generated",
        report_metrics: "Metrics",
        report_value: "Value",
        total_rooms_metric: "Total Rooms",
        customers_metric: "Customers",
        bookings_metric: "Bookings",
        revenue_metric: "Total Revenue",
        paid_payments_metric: "Paid Payments",
        occupancy_metric: "Occupancy Rate",
        report_details: "Detailed Information",
        room_list: "Room List",
        booking_list: "Booking List",
        payment_list: "Payment List",
        days: "Days",
        daily_price: "Daily Price",
        paid_amount: "Paid Amount",
        remaining_amount: "Remaining Amount",
        booking_already_paid: "This booking has already been paid",
        cannot_pay_more: "Payment cannot exceed total amount",
        payment_exceeds_total: "Payment amount cannot be greater than the total price",
        payment_history_title: "Payment History",
        partially_paid: "Partially Paid",
        total: "Total",
        room_booked: "Room is already booked",
        duplicate_phone: "This phone number is already registered",
        invalid_date: "Invalid date",
        today_checkins: "Today's Check-ins",
        today_checkouts: "Today's Check-outs",
        pending_payments: "Pending Payments",
        popular_room: "Most Popular Room",
        filter_all: "All",
        filter_unread: "Unread",
        filter_booking: "Bookings",
        filter_payment: "Payments",
        filter_customer: "Customers",
        filter_system: "System",
        search_notifications: "Search notifications...",
        no_notifications_found: "No notifications found",
        load_more: "Load more...",
        confirm_logout: "Are you sure you want to logout?",
        logout_confirm: "Yes, logout",
        next_room: "Next room: ",
        price_currency: "Price (USD)",
        export_data: "Export Data (JSON)",
        import_data: "Import Data (JSON)",
        history: "History",
        no_history: "No history available",
        removed_at: "Removed at"
    },
    ru: {
        // Russian translations (compact for brevity)
        nav_dashboard: 'Панель',
        nav_rooms: 'Номера',
        nav_customers: 'Клиенты',
        nav_bookings: 'Брони',
        nav_payments: 'Платежи',
        nav_reports: 'Отчёты',
        nav_profile: 'Профиль',
        nav_settings: 'Настройки',
        total_rooms: 'Всего номеров',
        available: 'Свободно',
        booked: 'Занято',
        customers: 'Клиенты',
        recent_bookings: 'Последние брони',
        add_room: 'Добавить номер',
        add_customer: 'Добавить клиента',
        create_booking: 'Создать бронь',
        add_payment: 'Добавить платеж',
        revenue_summary: 'Сводка доходов',
        room: 'Номер',
        number: 'Номер',
        type: 'Тип',
        price: 'Цена',
        status: 'Статус',
        cancel: 'Отмена',
        save: 'Сохранить',
        customer: 'Клиент',
        name: 'Имя',
        email: 'Email',
        phone: 'Телефон',
        booking: 'Бронь',
        checkin: 'Заезд',
        checkout: 'Выезд',
        payment: 'Платёж',
        amount: 'Сумма',
        method: 'Метод',
        new_password: 'Новый пароль',
        update_profile: 'Обновить профиль',
        dark_mode: 'Тёмный режим',
        hotel_name: 'Название отеля',
        save_settings: 'Сохранить настройки',
        total_revenue: 'Общий доход',
        today_revenue: 'Доход сегодня',
        paid_payments: 'Оплаченные платежи',
        occupancy_rate: 'Заполняемость',
        no_notifications: 'Нет уведомлений',
        language: 'Язык',
        hotel_address: 'Адрес',
        hotel_phone: 'Телефон',
        active_bookings: 'Активные брони',
        notifications: 'Уведомления',
        mark_all_read: 'Отметить все прочитанными',
        clear_all: 'Очистить всё',
        logout: 'Выйти',
        nights: 'ночей',
        total_price: 'Общая цена',
        all: 'Все',
        upcoming: 'Предстоящие',
        active: 'Активные',
        checked_in: 'Заехали',
        checked_out: 'Выехали',
        no_booking: 'Без брони',
        active_booking: 'Активная бронь',
        unpaid: 'Неоплаченные',
        today_filter: 'Сегодня',
        this_week: 'Эта неделя',
        this_month: 'Этот месяц',
        maintenance: 'Ремонт',
        enter_name: 'Введите полное имя...',
        enter_email: 'Введите email...',
        enter_phone: '+998 90 123 45 67',
        enter_password: 'Введите новый пароль...',
        enter_room_number: 'Введите номер...',
        enter_price: 'Введите цену...',
        enter_amount: 'Введите сумму...',
        required_field: 'Обязательное поле',
        valid_email: 'Введите корректный email',
        phone_format: 'Телефон должен начинаться с +998',
        duplicate_room: 'Номер уже существует',
        room_added: 'Номер добавлен',
        room_updated: 'Номер обновлён',
        room_deleted: 'Номер удалён',
        customer_added: 'Клиент добавлен',
        customer_updated: 'Клиент обновлён',
        customer_deleted: 'Клиент удалён',
        booking_created: 'Бронь создана',
        booking_updated: 'Бронь обновлена',
        booking_deleted: 'Бронь удалена',
        payment_added: 'Платёж добавлен',
        payment_updated: 'Платёж обновлён',
        payment_deleted: 'Платёж удалён',
        success: 'Успешно',
        info: 'Информация',
        warning: 'Предупреждение',
        empty_rooms: 'Нет номеров',
        empty_rooms_desc: 'Добавьте первый номер для начала.',
        empty_customers: 'Нет клиентов',
        empty_customers_desc: 'Добавьте первого клиента для начала.',
        empty_bookings: 'Нет броней',
        empty_bookings_desc: 'Создайте первую бронь для начала.',
        empty_payments: 'Нет платежей',
        empty_payments_desc: 'Добавьте первый платёж для начала.',
        username: 'Имя пользователя',
        password: 'Пароль',
        remember_me: 'Запомнить меня',
        login: 'Войти',
        recent_activity: 'Недавняя активность',
        no_recent_activity: 'Нет недавней активности',
        guest: 'Гость',
        view_all: 'Показать все',
        edit: 'Редактировать',
        delete: 'Удалить',
        actions: 'Действия',
        no_data: 'Нет данных',
        pdf_export: 'Экспорт PDF',
        excel_export: 'Экспорт Excel',
        print: 'Печать',
        outstanding: "Неоплаченные",
        payment_history: "История платежей",
        due_date: "Дата оплаты",
        search: "Поиск",
        year: "Год",
        select_customer: "Выберите клиента",
        select_room: "Выберите номер",
        select_booking: "Выберите бронь",
        report_title: "Отчет отеля",
        report_generated: "Создан",
        report_metrics: "Показатели",
        report_value: "Значение",
        total_rooms_metric: "Всего номеров",
        customers_metric: "Клиенты",
        bookings_metric: "Брони",
        revenue_metric: "Общий доход",
        paid_payments_metric: "Оплаченные платежи",
        occupancy_metric: "Заполняемость",
        report_details: "Детальная информация",
        room_list: "Список номеров",
        booking_list: "Список броней",
        payment_list: "Список платежей",
        days: "Дни",
        daily_price: "Цена за день",
        paid_amount: "Оплаченная сумма",
        remaining_amount: "Остаток",
        booking_already_paid: "Эта бронь уже оплачена",
        cannot_pay_more: "Сумма не может превышать общую стоимость",
        payment_exceeds_total: "Сумма платежа не может быть больше общей стоимости",
        payment_history_title: "История платежей",
        partially_paid: "Частично оплачено",
        total: "Итого",
        room_booked: "Номер уже забронирован",
        duplicate_phone: "Этот номер телефона уже зарегистрирован",
        invalid_date: "Неверная дата",
        today_checkins: "Заезды сегодня",
        today_checkouts: "Выезды сегодня",
        pending_payments: "Ожидающие платежи",
        popular_room: "Самый популярный номер",
        filter_all: "Все",
        filter_unread: "Непрочитанные",
        filter_booking: "Брони",
        filter_payment: "Платежи",
        filter_customer: "Клиенты",
        filter_system: "Система",
        search_notifications: "Поиск уведомлений...",
        no_notifications_found: "Уведомления не найдены",
        load_more: "Загрузить ещё...",
        confirm_logout: "Вы уверены, что хотите выйти?",
        logout_confirm: "Да, выйти",
        next_room: "Следующий номер: ",
        price_currency: "Цена (USD)",
        export_data: "Экспорт данных (JSON)",
        import_data: "Импорт данных (JSON)",
        history: "История",
        no_history: "Нет истории",
        removed_at: "Удалено в"
    }
};

// ================================================================
// HELPERS
// ================================================================
function formatCurrency(amountInUSD, forceCurrency) {
    var state = AppState ? AppState.get() : null;
    var curr = forceCurrency || state?.currency || 'USD';
    var amount = parseFloat(amountInUSD) || 0;
    var rates = getCurrencyRates();
    var rate = rates[curr] || 1;
    var converted = amount * rate;
    if (curr === 'UZS') {
        return new Intl.NumberFormat('uz-UZ').format(Math.round(converted)) + ' so\'m';
    }
    if (curr === 'EUR') {
        return '\u20AC' + converted.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    }
    return '$' + converted.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function getRelativeTime(timestamp) {
    var now = Date.now();
    var diff = now - timestamp;
    var s = Math.floor(diff / 1000);
    var m = Math.floor(s / 60);
    var h = Math.floor(m / 60);
    var d = Math.floor(h / 24);
    var lang = Lang?.current || 'uz';
    var tbl = {
        uz: { now: 'Hozirgina', m: function (n) { return n + ' daqiqa oldin'; }, h: function (n) { return n + ' soat oldin'; }, d: function (n) { return n + ' kun oldin'; } },
        en: { now: 'Just now', m: function (n) { return n + 'm ago'; }, h: function (n) { return n + 'h ago'; }, d: function (n) { return n + 'd ago'; } },
        ru: { now: 'Только что', m: function (n) { return n + ' мин. назад'; }, h: function (n) { return n + ' ч. назад'; }, d: function (n) { return n + ' дн. назад'; } }
    };
    var t = tbl[lang] || tbl.uz;
    if (s < 60) return t.now;
    if (m < 60) return t.m(m);
    if (h < 24) return t.h(h);
    if (d < 7) return t.d(d);
    return new Date(timestamp).toLocaleDateString(lang === 'ru' ? 'ru-RU' : lang === 'en' ? 'en-US' : 'uz-UZ');
}

function getStatusKey(status) {
    var map = {
        // Legacy/capitalized (kept for backward compatibility)
        'Available': 'available',
        'Booked': 'booked',
        'Occupied': 'occupied',
        'Maintenance': 'cancelled',
        'Checked-in': 'active',
        'Checked-out': 'completed',
        'Pending': 'pending',
        'Cancelled': 'cancelled',
        'Paid': 'paid',
        'Unpaid': 'unpaid',
        'Refunded': 'cancelled',
        'Partially Paid': 'partial',
        // Real backend lowercase enum values
        'available': 'available',
        'booked': 'booked',
        'occupied': 'occupied',
        'cleaning': 'pending',
        'maintenance': 'pending',
        'out_of_service': 'pending',
        'active': 'active',
        'inactive': 'pending',
        'blocked': 'cancelled',
        'pending': 'pending',
        'checked_in': 'active',
        'checked_out': 'completed',
        'cancelled': 'cancelled',
        'no_show': 'cancelled',
        'completed': 'paid',
        'failed': 'cancelled',
        'refunded': 'cancelled'
    };
    return map[status] || 'pending';
}

// Backenddan kelgan lowercase/underscore status qiymatini foydalanuvchiga
// ko'rsatish uchun o'qilishi qulay yorliqqa aylantiradi (masalan
// 'out_of_service' -> 'Out Of Service'). Faqat DISPLAY uchun — backendga
// yuboriladigan qiymat har doim asl (lowercase) status bo'lishi kerak.
function roomStatusLabel(status) {
    if (!status) return '';
    return String(status).split('_').map(function (w) {
        return w.charAt(0).toUpperCase() + w.slice(1);
    }).join(' ');
}

var ROOM_STATUS_I18N = {
    uz: { available: "Bo'sh", booked: 'Band', occupied: 'Band (mehmon)', cleaning: 'Tozalashda', maintenance: "Ta'mirlashda", out_of_service: 'Xizmatdan chiqarilgan' },
    en: { available: 'Available', booked: 'Booked', occupied: 'Occupied', cleaning: 'Cleaning', maintenance: 'Maintenance', out_of_service: 'Out of Service' },
    ru: { available: 'Свободно', booked: 'Занято', occupied: 'Занято', cleaning: 'Уборка', maintenance: 'Ремонт', out_of_service: 'Не обслуживается' }
};
var BOOKING_STATUS_I18N = {
    uz: { pending: 'Kutilmoqda', checked_in: 'Joylashgan', checked_out: 'Chiqib ketgan', cancelled: 'Bekor qilingan', no_show: 'Kelmadi', completed: 'Yakunlangan' },
    en: { pending: 'Pending', checked_in: 'Checked In', checked_out: 'Checked Out', cancelled: 'Cancelled', no_show: 'No Show', completed: 'Completed' },
    ru: { pending: 'Ожидание', checked_in: 'Заселён', checked_out: 'Выселен', cancelled: 'Отменён', no_show: 'Не явился', completed: 'Завершён' }
};
var PAYMENT_METHOD_I18N = {
    uz: { cash: 'Naqd', card: 'Karta', bank_transfer: "Bank o'tkazmasi", online: 'Onlayn' },
    en: { cash: 'Cash', card: 'Card', bank_transfer: 'Bank Transfer', online: 'Online' },
    ru: { cash: 'Наличные', card: 'Карта', bank_transfer: 'Банк', online: 'Онлайн' }
};
var PAYMENT_STATUS_I18N = {
    uz: { pending: 'Kutilmoqda', completed: "To'landi", failed: 'Muvaffaqiyatsiz', refunded: 'Qaytarilgan' },
    en: { pending: 'Pending', completed: 'Completed', failed: 'Failed', refunded: 'Refunded' },
    ru: { pending: 'Ожидание', completed: 'Оплачено', failed: 'Ошибка', refunded: 'Возврат' }
};
function _i18nLang() { return (typeof Lang !== 'undefined' && Lang.current) ? Lang.current : 'uz'; }
function _i18nLookup(d, k, fb) {
    var dd = d[_i18nLang()] || d.uz;
    return (k && dd[k]) || (fb ? fb(k) : (k || ''));
}
function roomStatusI18n(s)    { return _i18nLookup(ROOM_STATUS_I18N, s, roomStatusLabel); }
function bookingStatusI18n(s) { return _i18nLookup(BOOKING_STATUS_I18N, s, roomStatusLabel); }
function paymentMethodI18n(m) { return _i18nLookup(PAYMENT_METHOD_I18N, m, roomStatusLabel); }
function paymentStatusI18n(s) { return _i18nLookup(PAYMENT_STATUS_I18N, s, roomStatusLabel); }

function calculateBookingTotal(booking, state) {
    var room = state.rooms.find(function (r) { return r.id === booking.room; });
    if (!room) return 0;
    var checkin = new Date(booking.checkin);
    var checkout = new Date(booking.checkout);
    var days = Math.max(1, Math.ceil((checkout - checkin) / (1000 * 60 * 60 * 24)));
    return room.price_per_night * days;
}

function getBookingPaymentStatus(booking, state) {
    var payments = state.payments.filter(function (p) { return p.booking === booking.id; });
    var totalPaid = payments.reduce(function (sum, p) { return sum + (p.status === 'completed' ? Number(p.amount) : 0); }, 0);
    var totalPrice = Number(booking.total_price) || calculateBookingTotal(booking, state);
    if (totalPaid === 0) return { status: 'Unpaid', paid: 0, remaining: totalPrice, total: totalPrice };
    if (totalPaid >= totalPrice) return { status: 'Paid', paid: totalPaid, remaining: 0, total: totalPrice };
    return { status: 'Partially Paid', paid: totalPaid, remaining: totalPrice - totalPaid, total: totalPrice };
}

function applyStagger(selector, delay) {
    if (delay === undefined) delay = 50;
    document.querySelectorAll(selector).forEach(function (el, i) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px) scale(0.97)';
        el.style.transition = 'opacity 0.35s ease ' + (i * delay) + 'ms, transform 0.35s cubic-bezier(0.34,1.56,0.64,1) ' + (i * delay) + 'ms';
        requestAnimationFrame(function () {
            setTimeout(function () {
                el.style.opacity = '1';
                el.style.transform = 'none';
            }, 10);
        });
    });
}

function showConfirm(message, onConfirm, isDanger) {
    if (isDanger === undefined) isDanger = true;
    var id = 'dlg_' + Date.now();
    var icon = isDanger ? 'fa-trash-alt' : 'fa-question-circle';
    var btnCls = isDanger ? 'btn-glass-danger' : 'btn-glass-primary';
    var iconColor = isDanger ? 'var(--color-danger)' : 'var(--accent-1)';
    var container = document.getElementById('modal-container');
    if (!container) return;
    container.insertAdjacentHTML('beforeend',
        '<div class="modal fade" id="' + id + '" tabindex="-1" role="dialog" aria-modal="true" aria-label="Tasdiqlash">' +
        '<div class="modal-dialog modal-dialog-centered" style="max-width:320px;">' +
        '<div class="modal-content glass">' +
        '<div class="modal-body text-center" style="padding:2rem 1.5rem;">' +
        '<div style="width:56px;height:56px;border-radius:18px;background:rgba(239,68,68,0.12);display:flex;align-items:center;justify-content:center;margin:0 auto 1.2rem;font-size:1.6rem;color:' + iconColor + ';">' +
        '<i class="fas ' + icon + '"></i>' +
        '</div>' +
        '<p style="color:var(--text-primary);font-size:0.92rem;line-height:1.55;margin-bottom:1.5rem;">' + escapeHtml(message) + '</p>' +
        '<div style="display:flex;gap:10px;">' +
        '<button class="btn-glass flex-1" style="flex:1;" data-bs-dismiss="modal">Bekor</button>' +
        '<button class="btn-glass ' + btnCls + ' flex-1" id="' + id + '_ok" style="flex:1;">Tasdiqlash</button>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>'
    );
    var el = document.getElementById(id);
    if (!el) return;
    var modal = new bootstrap.Modal(el);
    modal.show();
    document.getElementById(id + '_ok').onclick = function () { modal.hide(); setTimeout(onConfirm, 180); };
    el.addEventListener('hidden.bs.modal', function () { el.remove(); });
}

function debounce(fn, delay) {
    if (delay === undefined) delay = 250;
    var timer = null;
    return function () {
        var args = arguments;
        var context = this;
        clearTimeout(timer);
        timer = setTimeout(function () { fn.apply(context, args); }, delay);
    };
}

// ================================================================
// CONFIG
// ================================================================
const ROOMS_USE_API = true;  // Rooms moduli API dan ishlaydi (endi roomService localStorage bilan ishlaydi)

// ================================================================
// APP STATE
// ================================================================
var AppState = {
    data: {
        rooms: [],
        customers: [],
        bookings: [],
        payments: [],
        notifications: [],
        theme: 'dark',
        language: 'uz',
        currentPage: 'dashboard',
        currency: 'USD'
    },
    roomsPagination: { count: 0, next: null, previous: null, currentPage: 1 },

    load: function () {
        try {
            var saved = localStorage.getItem('hms_state');
            if (saved) this.data = { ...this.data, ...JSON.parse(saved) };
            this.data.rooms = [];
            this.data.customers = [];
            this.data.bookings = [];
            this.data.payments = [];
                        this.data.notifications = JSON.parse(localStorage.getItem('hms_notifications')) || [];
            if (localStorage.getItem('hms_notif_migrated_v2') !== '1') {
                this.data.notifications.forEach(function (n) {
                    if (n && typeof n.message === 'string') {
                        n.message = n.message
                            .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
                            .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'")
                            .replace(/&#x27;/gi, "'").replace(/&apos;/g, "'");
                    }
                });
                localStorage.setItem('hms_notif_migrated_v2', '1');
            }
            if (localStorage.getItem('hms_notif_migrated_v2') !== '1') {
                this.data.notifications.forEach(function (n) {
                    if (n && typeof n.message === 'string') {
                        n.message = n.message
                            .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
                            .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'")
                            .replace(/&#x27;/gi, "'").replace(/&apos;/g, "'");
                    }
                });
                localStorage.setItem('hms_notif_migrated_v2', '1');
            }
            var settings = JSON.parse(localStorage.getItem('hms_settings')) || {};
            this.data.currency = settings.currency || 'USD';
            if (!localStorage.getItem('hms_password_hash')) {
                localStorage.setItem('hms_password_hash', Auth.hashPassword('admin123'));
            }

            var now = Date.now();
            var ninetyDays = 90 * 24 * 60 * 60 * 1000;
            this.data.notifications = this.data.notifications.filter(function (n) {
                return (now - n.time) < ninetyDays;
            });

            this.save();
        } catch (e) { console.warn(e); }
    },

    save: function () {
        try {
            localStorage.setItem('hms_state', JSON.stringify({ theme: this.data.theme, language: this.data.language, currentPage: this.data.currentPage }));
            localStorage.setItem('hms_notifications', JSON.stringify(this.data.notifications));
        } catch (e) { console.warn(e); }
    },

    get: function () { return this.data; },

    set: function (newData) { this.data = { ...this.data, ...newData }; this.save(); },

    genId: function () { return Date.now() + Math.random().toString(36).substr(2, 6); },

    addNotification: function (message, type, category) {
        if (type === undefined) type = 'info';
        if (category === undefined) category = 'system';
        var notif = {
            id: this.genId(),
            message: String(message || ''),
            type: type,
            category: category,
            time: Date.now(),
            read: false
        };
        if (this.data.notifications.length > 200) this.data.notifications = this.data.notifications.slice(0, 200);
        this.save();
        return notif;
    }
};

// ================================================================
// LANG
// ================================================================
var Lang = {
    current: 'uz',
    t: function (key) { return T[this.current]?.[key] || T.uz[key] || key; },
    apply: function () {
        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            el.textContent = Lang.t(el.dataset.i18n);
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
            el.placeholder = Lang.t(el.dataset.i18nPlaceholder);
        });
        var sel = document.getElementById('langSelect');
        if (sel) sel.value = Lang.current;
        Lang.updateNotificationFilterLabels();
        var searchInput = document.getElementById('notifSearch');
        if (searchInput) searchInput.placeholder = Lang.t('search_notifications');
        var loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) loadMoreBtn.textContent = Lang.t('load_more');
        var notifTitle = document.querySelector('.notif-header .title span');
        if (notifTitle) notifTitle.textContent = Lang.t('notifications');
        var markAllBtn = document.querySelector('#notifMarkAllRead span');
        if (markAllBtn) markAllBtn.textContent = Lang.t('mark_all_read');
        var clearAllBtn = document.querySelector('#notifClearAll span');
        if (clearAllBtn) clearAllBtn.textContent = Lang.t('clear_all');
        var logoutBtn = document.getElementById('logoutSettingsBtn');
        if (logoutBtn) {
            var span = logoutBtn.querySelector('span');
            if (span) span.textContent = Lang.t('logout');
        }
        var currentPage = AppState.get().currentPage;
        var iconMap = {
            dashboard: 'fa-chart-pie',
            rooms: 'fa-door-open',
            customers: 'fa-users',
            bookings: 'fa-calendar-check',
            payments: 'fa-credit-card',
            reports: 'fa-file-alt',
            profile: 'fa-user-cog',
            settings: 'fa-sliders-h'
        };
        var titleEl = document.getElementById('pageTitle');
        if (titleEl && iconMap[currentPage]) {
            titleEl.innerHTML = '<i class="fas ' + iconMap[currentPage] + '"></i>';
        }
        var exportBtn = document.getElementById('exportDataBtn');
        if (exportBtn) {
            var span = exportBtn.querySelector('span');
            if (span) span.textContent = Lang.t('export_data');
        }
        var importBtn = document.getElementById('importDataBtn');
        if (importBtn) {
            var span = importBtn.querySelector('span');
            if (span) span.textContent = Lang.t('import_data');
        }
        var historyTitle = document.getElementById('historyTitle');
        if (historyTitle) historyTitle.textContent = Lang.t('history');
    },
    updateNotificationFilterLabels: function () {
        var filters = document.querySelectorAll('#notifFilters .filter-btn');
        var filterMap = {
            'all': 'filter_all',
            'unread': 'filter_unread',
            'booking': 'filter_booking',
            'payment': 'filter_payment',
            'customer': 'filter_customer',
            'system': 'filter_system'
        };
        filters.forEach(function (btn) {
            var key = btn.dataset.filter;
            if (filterMap[key]) {
                var text = Lang.t(filterMap[key]);
                var icon = btn.querySelector('i');
                if (icon) {
                    btn.innerHTML = '';
                    btn.appendChild(icon);
                    btn.appendChild(document.createTextNode(' ' + text));
                } else {
                    btn.textContent = text;
                }
            }
        });
    },
    set: function (lang) {
        if (T[lang]) {
            this.current = lang;
            localStorage.setItem('hms_lang', lang);
            AppState.set({ language: lang });
            this.apply();
            if (typeof App !== 'undefined' && App.renderPage) {
                setTimeout(function () { App.renderPage(AppState.get().currentPage); }, 50);
            }
        }
    }
};

// ================================================================
// THEME
// ================================================================
var Theme = {
    current: 'dark',
    apply: function (theme) {
        this.current = theme || this.current;
        document.documentElement.setAttribute('data-theme', this.current);
        localStorage.setItem('hms_theme', this.current);
        AppState.set({ theme: this.current });
        var icon = document.querySelector('#themeToggle i');
        if (icon) icon.className = this.current === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        var cb = document.getElementById('settingsDarkMode');
        if (cb) cb.checked = this.current === 'dark';
        var page = AppState.get().currentPage;
        if (page === 'dashboard' || page === 'reports' || page === 'settings') {
            setTimeout(function () { App.renderPage(page); }, 60);
        }
        if (page === 'settings') {
            setTimeout(function () { App.renderSettings(); }, 80);
        }
    },
    toggle: function () { this.apply(this.current === 'dark' ? 'light' : 'dark'); },
    init: function () { this.apply(localStorage.getItem('hms_theme') || 'dark'); }
};

// ================================================================
// TOAST
// ================================================================
var Toast = {
    container: null,
    MAX_VISIBLE: 2,
    DURATION: 4000,

    init: function () {
        this.container = document.getElementById('toast-container');
    },

    _makeRoom: function () {
        if (!this.container) return;
        var visible = this.container.querySelectorAll('.toast-msg:not(.fade-out)');
        while (visible.length >= this.MAX_VISIBLE) {
            var oldest = visible[0];
            oldest.classList.add('fade-out');
            (function (el) {
                setTimeout(function () { if (el && el.parentNode) el.remove(); }, 300);
            })(oldest);
            visible = this.container.querySelectorAll('.toast-msg:not(.fade-out)');
        }
    },

    _isDuplicate: function (msg, type) {
        if (!this.container) return false;
        var visible = this.container.querySelectorAll('.toast-msg.' + type + ':not(.fade-out)');
        var normalized = String(msg || '').trim();
        for (var i = 0; i < visible.length; i++) {
            if (String(visible[i].dataset.msg || '').trim() === normalized) return true;
        }
        return false;
    },

    show: function (msg, type) {
        if (type === undefined) type = 'info';
        if (!this.container) this.container = document.getElementById('toast-container');
        if (!this.container) return;
        if (this._isDuplicate(msg, type)) return;
        this._makeRoom();

        var div = document.createElement('div');
        var icons = {
            success: 'fa-check-circle',
            error: 'fa-times-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        div.className = 'toast-msg ' + type;
        div.dataset.msg = String(msg || '');
        div.dataset.type = type;
        div.innerHTML = '<i class="fas ' + (icons[type] || icons.info) + '"></i> ' + escapeHtml(msg);

        if (this.container.firstChild) {
            this.container.insertBefore(div, this.container.firstChild);
        } else {
            this.container.appendChild(div);
        }

        setTimeout(function () {
            div.classList.add('fade-out');
            setTimeout(function () {
                if (div && div.parentNode) div.remove();
            }, 300);
        }, this.DURATION);
    },

    success: function (m) { this.show(m, 'success'); },
    error: function (m) { this.show(m, 'error'); },
    warning: function (m) { this.show(m, 'warning'); },
    info: function (m) { this.show(m, 'info'); }
};

// ================================================================
// APP
// ================================================================
var App = {
    charts: {},
    currentSort: { field: 'number', direction: 'asc' },
    notifPage: 0,
    notifLimit: 10,
    notifFilter: 'all',
    notifSearch: '',
    roomFilter: 'all',
    bookingFilter: 'all',
    paymentFilter: 'all',
    customerFilter: 'all',
    roomSearch: '',
    resizeObserver: null,
    sidebarOpen: false,

    init: function () {
        Toast.init();

        var loginPage = document.getElementById('loginPage');
        var appEl = document.getElementById('app');
        var sessionLoggedIn = sessionStorage.getItem('hms_session_login') === 'true';

        // Reset/clear tugmalar
        document.getElementById('resetPasswordBtn').addEventListener('click', function (e) {
            e.preventDefault();            if (confirm('Parolni default holatga (admin123) qaytarishni tasdiqlaysizmi?')) {
                Auth.resetPassword();
            }
        });
        document.getElementById('clearStorageBtn').addEventListener('click', function (e) {
            e.preventDefault();
            if (confirm('Barcha lokal ma\'lumotlar tozalanadi. Davom etasizmi?')) {
                Auth.clearStorage();
            }
        });
                    // Sahifa refresh bo'lganda ham state to'g'ri yuklanadi
        document.documentElement.style.setProperty('visibility', 'visible');
        // Har doim login talab qilish — sessiyada login qilingan bo'lsa ham
        if (!sessionLoggedIn || !Auth.check()) {
            if (loginPage) {
                loginPage.style.display = 'flex';
                loginPage.classList.remove('fade-out');
            }
            if (appEl) appEl.style.display = 'none';
            this.bindLoginEvents();
            return;
        }

        // Session davomida login qilingan
        if (loginPage) loginPage.style.display = 'none';
        if (appEl) appEl.style.display = 'flex';
        this.initializeApp();
        },

    initializeApp: function() {
        AppState.load();
        var self = this;

        if (ROOMS_USE_API) {
            Promise.all([
                this.hydrateRooms(),
                this.hydrateCustomers(),
                this.hydrateBookings(),
                this.hydratePayments(),
            ])
                .then(function () {
                    Theme.init();
                    Lang.current = localStorage.getItem('hms_lang') || 'uz';
                    Lang.apply();
                    Toast.init();
                    self.bindEvents();
                    self.renderPage('dashboard');
                    self.updateNotifications();
                    self.startDataSyncPoll();
                    setTimeout(function () { Toast.info('HMS ga xush kelibsiz'); }, 500);
                    self.startDataSyncPoll();
                })
                .catch(function (error) {
                    if (error && error.status === 401) {
                        if (typeof Auth !== 'undefined' && Auth.logout) Auth.logout();
                        return;
                    }
                    Toast.error("Ma'lumotlarni yuklashda xatolik: " + (error.message || "Noma'lum xato"));
                    Theme.init();
                    Lang.current = localStorage.getItem('hms_lang') || 'uz';
                    Lang.apply();
                    Toast.init();
                    self.bindEvents();
                    self.renderPage('dashboard');
                    self.updateNotifications();
                });
        } else {
            Theme.init();
            Lang.current = localStorage.getItem('hms_lang') || 'uz';
            Lang.apply();
            Toast.init();
            this.bindEvents();
            this.seedData();
            this.renderPage('dashboard');
            this.updateNotifications();
            setTimeout(function () { Toast.info('HMS ga xush kelibsiz'); }, 500);
        }

        this.resizeObserver = new ResizeObserver(debounce(function () {
            App.resizeCharts();
        }, 200));

        window.addEventListener('orientationchange', function () {
            setTimeout(function () { App.resizeCharts(); }, 400);
        });

        var toggleBtn = document.getElementById('sidebarToggle');
        if (toggleBtn) {
            toggleBtn.classList.remove('open');
            var icon = toggleBtn.querySelector('i');
            if (icon) icon.className = 'fas fa-bars';
        }
    },    // ============================================================
    // DATA POLLING — yangi booking/customer/payment kelganda
    // admin panelni avtomatik yangilash
    // ============================================================
    _dataSyncTimer: null,

    startDataSyncPoll: function () {
        if (this._dataSyncTimer) return;  // takroriy timer bo'lmasin
        var self = this;

        this._dataSyncTimer = setInterval(function () {
            // Tab fokusda emas — o'tkazib yuborish
            if (document.hidden) return;
            self.refreshAllData();
        }, 30000);  // 30 sekundda bir marta

        // Qo'shimcha: sahifa fokusga qaytganda darhol yangilash
        window.addEventListener('focus', function () {
            if (!document.hidden) self.refreshAllData();
        });
    },

    refreshAllData: async function () {
        try {
            await Promise.all([
                this.hydrateRooms(),
                this.hydrateCustomers(),
                this.hydrateBookings(),
                this.hydratePayments(),
            ]);

            // Joriy sahifani qayta render qilish
            var page = AppState.get().currentPage;
            var renderMap = {
                dashboard: function () { App.renderDashboard(); },
                rooms: function () { App.renderRooms(); },
                customers: function () { App.renderCustomers(); },
                bookings: function () { App.renderBookings(); },
                payments: function () { App.renderPayments(); },
                reports: function () { App.renderReports(); },
            };
            if (renderMap[page]) renderMap[page]();
            this.updateNotifications();
        } catch (e) {
            // Silently fail — keyingi poll'da qayta urinadi
            console.warn('Data sync xato:', e);
        }
    },

    hydrateRooms: async function () {
        try {
            const rooms = await roomService.getRooms(1);
            AppState.data.rooms = rooms;
            AppState.roomsPagination = roomService.getPagination();
            return rooms;
        } catch (error) {
            if (error.status === 401) {
                throw error;
            }
            throw error;
        }
    },

    // Customers/Bookings/Payments — ilgari localStorage-only edi, endi
    // haqiqiy backend API'dan yuklanadi (source of truth backend).
    hydrateCustomers: async function () {
        const customers = await customerService.getCustomers(1);
        AppState.data.customers = customers;
        return customers;
    },

    hydrateBookings: async function () {
        const bookings = await bookingService.getBookings(1);
        AppState.data.bookings = bookings;
        return bookings;
    },

    hydratePayments: async function () {
        const payments = await paymentService.getPayments(1);
        AppState.data.payments = payments;
        return payments;
    },

    resizeCharts: function () {
        Object.keys(this.charts).forEach(function (key) {
            if (App.charts[key] && typeof App.charts[key].resize === 'function') {
                App.charts[key].resize();
            }
        });
    },

    bindLoginEvents: function () {
        document.getElementById('loginForm').addEventListener('submit', async function (e) {
            e.preventDefault();
            var username = document.getElementById('loginUsername').value;
            var password = document.getElementById('loginPassword').value;
            var remember = document.getElementById('loginRemember').checked;

            var submitBtn = this.querySelector('button[type="submit"]');
            var originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Kirish...';

            try {
                var success = await Auth.login(username, password, remember);
                if (success) {
                    sessionStorage.setItem('hms_session_login', 'true');
                    var loginPage = document.getElementById('loginPage');
                    if (loginPage) {
                        loginPage.classList.add('fade-out');
                        setTimeout(function () { window.location.reload(); }, 500);
                    } else {
                        window.location.reload();
                    }
                }
            } catch (error) {
                Toast.error(error.message || 'Login failed');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    },

    bindEvents: function () {
        document.getElementById('themeToggle').addEventListener('click', function () { Theme.toggle(); });

                var refreshBtn = document.getElementById('refreshDataBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', function () {
                var icon = this.querySelector('i');
                if (icon) icon.classList.add('fa-spin');
                App.refreshAllData().finally(function () {
                    if (icon) setTimeout(function () { icon.classList.remove('fa-spin'); }, 500);
                });
            });
        }

        var langSel = document.getElementById('langSelect');
        if (langSel) {
            langSel.value = Lang.current;
            langSel.addEventListener('change', function () {
                Lang.set(this.value);
            });
        }

        document.querySelectorAll('.sidebar .nav-link[data-page]').forEach(function (link) {
            link.addEventListener('click', function () {
                var page = this.dataset.page;
                App.renderPage(page);
                if (window.innerWidth <= 992) {
                    App.closeSidebar();
                }
            });
        });

        // Mobile bottom nav olib tashlangan — listener kerak emas

        document.getElementById('sidebarCloseBtn').addEventListener('click', function () {
            App.closeSidebar();
        });

        document.getElementById('sidebarToggle').addEventListener('click', function () {
            App.toggleSidebar();
        });

        document.getElementById('sidebarOverlay').addEventListener('click', function () {
            App.closeSidebar();
        });

        document.getElementById('notifBell').addEventListener('click', function (e) {
            e.stopPropagation();
            var dropdown = document.getElementById('notifDropdown');
            if (dropdown.classList.contains('open')) {
                App.closeNotifDropdown();
            } else {
                dropdown.classList.add('open');
                dropdown.classList.remove('closing');
                App.notifPage = 0;
                App.updateNotifications();
            }
        });

        document.addEventListener('click', function (e) {
            var dropdown = document.getElementById('notifDropdown');
            var bell = document.getElementById('notifBell');
            var isInside = dropdown && dropdown.contains(e.target);
            var isBell = bell && bell.contains(e.target);
            if (dropdown && dropdown.classList.contains('open') && !isInside && !isBell) {
                App.closeNotifDropdown();
            }
        });

        document.addEventListener('touchstart', function (e) {
            var dropdown = document.getElementById('notifDropdown');
            var bell = document.getElementById('notifBell');
            var isInside = dropdown && dropdown.contains(e.target);
            var isBell = bell && bell.contains(e.target);
            if (dropdown && dropdown.classList.contains('open') && !isInside && !isBell) {
                App.closeNotifDropdown();
            }
        }, { passive: true });

        document.getElementById('notifMarkAllRead').addEventListener('click', function (e) {
            e.stopPropagation();
            App.markAllNotificationsRead();
        });
        document.getElementById('notifClearAll').addEventListener('click', function (e) {
            e.stopPropagation();
            App.clearAllNotifications();
        });

        document.querySelectorAll('#notifFilters .filter-btn').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                document.querySelectorAll('#notifFilters .filter-btn').forEach(function (b) {
                    b.classList.remove('active');
                });
                this.classList.add('active');
                App.notifFilter = this.dataset.filter;
                App.notifPage = 0;
                App.updateNotifications();
            });
        });

        var searchInput = document.getElementById('notifSearch');
        if (searchInput) {
            searchInput.addEventListener('input', debounce(function (e) {
                e.stopPropagation();
                App.notifSearch = this.value.toLowerCase();
                App.notifPage = 0;
                App.updateNotifications();
            }, 250));
        }

        document.getElementById('loadMoreBtn').addEventListener('click', function (e) {
            e.stopPropagation();
            App.notifPage++;
            App.updateNotifications(true);
        });
    },

    toggleSidebar: function () {
        var sidebar = document.getElementById('sidebar');
        var overlay = document.getElementById('sidebarOverlay');
        var toggleBtn = document.getElementById('sidebarToggle');
        var isOpen = sidebar.classList.contains('open');

        if (isOpen) {
            this.closeSidebar();
        } else {
            sidebar.classList.add('open');
            overlay.classList.add('active');
            toggleBtn.classList.add('open');
            var icon = toggleBtn.querySelector('i');
            if (icon) {
                icon.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
                icon.style.transform = 'scale(0) rotate(90deg)';
                icon.style.opacity = '0';
                setTimeout(function () {
                    icon.className = 'fas fa-times';
                    icon.style.transform = 'scale(1) rotate(0)';
                    icon.style.opacity = '1';
                }, 300);
            }
        }
    },

    closeSidebar: function () {
        var sidebar = document.getElementById('sidebar');
        var overlay = document.getElementById('sidebarOverlay');
        var toggleBtn = document.getElementById('sidebarToggle');
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        toggleBtn.classList.remove('open');
        var icon = toggleBtn.querySelector('i');
        if (icon) {
            icon.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
            icon.style.transform = 'scale(0) rotate(-90deg)';
            icon.style.opacity = '0';
            setTimeout(function () {
                icon.className = 'fas fa-bars';
                icon.style.transform = 'scale(1) rotate(0)';
                icon.style.opacity = '1';
            }, 300);
        }
    },

    closeNotifDropdown: function () {
        var dropdown = document.getElementById('notifDropdown');
        if (!dropdown.classList.contains('open')) return;
        dropdown.classList.add('closing');
        setTimeout(function () {
            dropdown.classList.remove('open', 'closing');
        }, 300);
    },

        renderPage: function (page) {
        AppState.set({ currentPage: page });

        document.querySelectorAll('.sidebar .nav-link').forEach(function (l) { l.classList.remove('active'); });
        document.querySelector('.sidebar .nav-link[data-page="' + page + '"]')?.classList.add('active');

        document.querySelectorAll('.page-section').forEach(function (p) { p.classList.remove('active-page'); });
        document.getElementById('page-' + page)?.classList.add('active-page');

        document.querySelectorAll('.mob-nav-item').forEach(function (item) {
            item.classList.toggle('active', item.dataset.page === page);
        });

        var iconMap = {
            dashboard: 'fa-chart-pie',
            rooms: 'fa-door-open',
            customers: 'fa-users',
            bookings: 'fa-calendar-check',
            payments: 'fa-credit-card',
            reports: 'fa-file-alt',
            profile: 'fa-user-cog',
            settings: 'fa-sliders-h'
        };
        var titleEl = document.getElementById('pageTitle');
        if (titleEl) {
            titleEl.classList.add('changing');
            setTimeout(function () {
                titleEl.innerHTML = '<i class="fas ' + (iconMap[page] || 'fa-home') + '"></i>';
                titleEl.classList.remove('changing');
            }, 150);
        }

        var renderMap = {
            dashboard: function () { App.renderDashboard(); },
            rooms: function () { App.renderRooms(); },
            customers: function () { App.renderCustomers(); },
            bookings: function () { App.renderBookings(); },
            payments: function () { App.renderPayments(); },
            reports: function () { App.renderReports(); },
            profile: function () { App.renderProfile(); },
            settings: function () { App.renderSettings(); }
        };
        if (renderMap[page]) renderMap[page]();
        this.updateNotifications();

        // Muhim: sahifa almashganda eng so'nggi data'ni yuklash
        if (['dashboard', 'rooms', 'customers', 'bookings', 'payments', 'reports'].indexOf(page) !== -1) {
            this.refreshAllData();
        }
    },

    // ===== DATA MANAGEMENT =====
    exportData: function () {
        var state = AppState.get();
        var history = JSON.parse(localStorage.getItem('hms_history') || '[]');
        var data = {
            rooms: state.rooms,
            customers: state.customers,
            bookings: state.bookings,
            payments: state.payments,
            history: history,
            settings: JSON.parse(localStorage.getItem('hms_settings') || '{}'),
            currencyRates: getCurrencyRates(),
            exportedAt: new Date().toISOString()
        };
        var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'hms_backup_' + new Date().toISOString().split('T')[0] + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        Toast.success('Ma\'lumotlar eksport qilindi');
    },

    importData: function (file) {
        var reader = new FileReader();
        reader.onload = function (e) {
            try {
                var data = JSON.parse(e.target.result);
                var hasBusinessData = data.rooms || data.customers || data.bookings || data.payments;
                var hasSettings = data.settings || data.currencyRates;

                if (!hasBusinessData && !hasSettings) {
                    Toast.error('Noto\'g\'ri fayl formati');
                    return;
                }

                var message = hasBusinessData
                    ? 'Bu fayldagi xonalar/mijozlar/bronlar/to\'lovlar ma\'lumotlari endi qo\'llab-quvvatlanmaydi, chunki bu ma\'lumotlar endi serverdan boshqariladi (faqat sozlamalar import qilinadi). Davom etasizmi?'
                    : 'Sozlamalarni import qilmoqchimisiz?';

                showConfirm(message, function () {
                    if (data.settings) {
                        localStorage.setItem('hms_settings', JSON.stringify(data.settings));
                    }
                    if (data.currencyRates) {
                        saveCurrencyRates(data.currencyRates);
                        CURRENCY_RATES = getCurrencyRates();
                    }
                    Toast.success('Sozlamalar import qilindi');
                    App.renderPage(AppState.get().currentPage);
                }, false);
            } catch (err) {
                Toast.error('Faylni o\'qib bo\'lmadi: ' + err.message);
            }
        };
        reader.readAsText(file);
    },

    // ===== NOTIFICATIONS =====
    updateNotifications: function (append) {
        if (append === undefined) append = false;
        var notifs = AppState.get().notifications;
        var settings = JSON.parse(localStorage.getItem('hms_settings') || '{}');
        var notifSettings = settings.notifications || {};
        var allowedCategories = [];
        if (notifSettings.bookings !== false) allowedCategories.push('booking');
        if (notifSettings.payments !== false) allowedCategories.push('payment');
        if (notifSettings.customers !== false) allowedCategories.push('customer');
        allowedCategories.push('system');
        allowedCategories.push('public_booking');

        var unread = notifs.filter(function (n) { return !n.read; });
        var badge = document.getElementById('notifBadge');
        var list = document.getElementById('notifList');
        var loadMore = document.getElementById('notifLoadMore');

        badge.style.display = unread.length > 0 ? 'flex' : 'none';
        if (unread.length > 0) badge.textContent = unread.length;

        var filtered = notifs.filter(function (n) { return allowedCategories.includes(n.category); });

        if (this.notifFilter === 'unread') filtered = filtered.filter(function (n) { return !n.read; });
                else if (this.notifFilter === 'booking') filtered = filtered.filter(function (n) { return n.category === 'booking'; });
        else if (this.notifFilter === 'public_booking') filtered = filtered.filter(function (n) { return n.category === 'public_booking'; });
        else if (this.notifFilter === 'payment') filtered = filtered.filter(function (n) { return n.category === 'payment'; });
        else if (this.notifFilter === 'customer') filtered = filtered.filter(function (n) { return n.category === 'customer'; });
        else if (this.notifFilter === 'system') filtered = filtered.filter(function (n) { return n.category === 'system'; });

        if (this.notifSearch) filtered = filtered.filter(function (n) { return n.message.toLowerCase().includes(App.notifSearch); });

        var start = this.notifPage * this.notifLimit;
        var end = start + this.notifLimit;
        var pageItems = filtered.slice(start, end);

        document.querySelectorAll('#notifFilters .filter-btn').forEach(function (btn) {
            var cat = btn.dataset.filter;
            if (cat === 'all' || cat === 'unread' || allowedCategories.includes(cat)) {
                btn.style.display = '';
            } else {
                btn.style.display = 'none';
            }
        });

        if (append) {
            pageItems.forEach(function (n) { list.appendChild(App.createNotifItem(n)); });
        } else {
            list.innerHTML = '';
            if (filtered.length === 0) {
                list.innerHTML = '<div class="notif-empty"><i class="fas fa-bell-slash"></i><div>' + Lang.t('no_notifications') + '</div></div>';
            } else {
                pageItems.forEach(function (n) { list.appendChild(App.createNotifItem(n)); });
            }
        }
        loadMore.style.display = end < filtered.length ? 'block' : 'none';
        var loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) loadMoreBtn.textContent = Lang.t('load_more');

        document.querySelectorAll('#notifFilters .filter-btn').forEach(function (btn) {
            btn.classList.toggle('active', btn.dataset.filter === App.notifFilter);
        });
    },

    createNotifItem: function (notif) {
        var div = document.createElement('div');
        div.className = 'notif-item' + (notif.read ? '' : ' unread');
        div.dataset.id = notif.id;

        var iconMap = {
            booking:        { icon: 'fa-calendar-check', cls: 'booking' },
            public_booking: { icon: 'fa-globe',          cls: 'booking' },
            payment:        { icon: 'fa-credit-card',    cls: 'payment' },
            customer:       { icon: 'fa-user',           cls: 'customer' },
            system:         { icon: 'fa-cog',            cls: 'system' },
            error:          { icon: 'fa-exclamation-circle', cls: 'error' }
        };
        var mapped = iconMap[notif.category] || { icon: 'fa-bell', cls: 'system' };

        div.innerHTML =
            '<div class="notif-icon ' + mapped.cls + '">' +
            '<i class="fas ' + mapped.icon + '"></i>' +
            '</div>' +
            '<div class="content">' +
            '<div class="notif-message">' + escapeHtml(notif.message) + '</div>' +
            '<div class="time"><i class="fas fa-clock"></i>' + getRelativeTime(notif.time) + '</div>' +
            '</div>' +
            '<div class="actions" style="display:flex;gap:4px;flex-shrink:0;">' +
            (!notif.read ? '<button class="read-btn notif-action-btn" title="O\'qildi deb belgilash" data-id="' + notif.id + '"><i class="fas fa-check"></i></button>' : '') +
            '<button class="delete-btn notif-action-btn" title="O\'chirish" data-id="' + notif.id + '" style="color:var(--color-danger);"><i class="fas fa-times"></i></button>' +
            '</div>';

        div.querySelector('.read-btn')?.addEventListener('click', function (e) {
            e.stopPropagation();
            App.markNotificationRead(this.dataset.id);
        });
        div.querySelector('.delete-btn').addEventListener('click', function (e) {
            e.stopPropagation();
            App.deleteNotification(this.dataset.id);
        });

        div.addEventListener('click', function (e) {
            e.stopPropagation();
            var id = this.dataset.id;
            if (id) {
                App.markNotificationRead(id);
                App.closeNotifDropdown();
            }
        });

        div.addEventListener('touchstart', function (e) {
            e.stopPropagation();
            var id = this.dataset.id;
            if (id) {
                App.markNotificationRead(id);
                App.closeNotifDropdown();
            }
        }, { passive: true });

        return div;
    },

    markNotificationRead: function (id) {
        var state = AppState.get();
        var notif = state.notifications.find(function (n) { return n.id === id; });
        if (notif) { notif.read = true; AppState.set({ notifications: state.notifications }); this.updateNotifications(); }
    },

    markAllNotificationsRead: function () {
        var state = AppState.get();
        state.notifications.forEach(function (n) { n.read = true; });
        AppState.set({ notifications: state.notifications });
        this.updateNotifications();
        Toast.success('Barcha xabarlar o\'qildi');
    },

    deleteNotification: function (id) {
        var state = AppState.get();
        state.notifications = state.notifications.filter(function (n) { return n.id !== id; });
        AppState.set({ notifications: state.notifications });
        this.updateNotifications();
    },

    clearAllNotifications: function () {
        AppState.set({ notifications: [] });
        this.updateNotifications();
        Toast.success('Barcha xabarlar tozalandi');
    },

    addNotification: function (message, type, category) {
        if (type === undefined) type = 'info';
        if (category === undefined) category = 'system';
        try {
            var settings = JSON.parse(localStorage.getItem('hms_settings') || '{}');
            var notifSettings = settings.notifications || {};
            if (category === 'booking' && notifSettings.bookings === false) return null;
            if (category === 'payment' && notifSettings.payments === false) return null;
            if (category === 'customer' && notifSettings.customers === false) return null;
        } catch (e) { }

        var notif = AppState.addNotification(message, type, category);
        this.updateNotifications();

        try {
            var settings = JSON.parse(localStorage.getItem('hms_settings') || '{}');
            if (settings.notifications?.browser &&
                'Notification' in window &&
                Notification.permission === 'granted') {
                new Notification('HMS Xabari', { body: message });
            }
        } catch (e) { }

        return notif;
    },

    // ===== DASHBOARD =====
    renderDashboard: function () {
        var state = AppState.get();
        var total = state.rooms.length;
        var available = state.rooms.filter(function (r) { return r.status === 'available'; }).length;
        var booked = state.rooms.filter(function (r) { return r.status === 'booked' || r.status === 'occupied'; }).length;

        var totalRevenue = state.payments.reduce(function (sum, p) { return sum + (p.status === 'completed' ? Number(p.amount) : 0); }, 0);
        var todayRevenue = state.payments.filter(function (p) { return p.status === 'completed' && p.payment_date && p.payment_date.slice(0, 10) === new Date().toISOString().split('T')[0]; }).reduce(function (sum, p) { return sum + Number(p.amount); }, 0);
        var occupancyRate = total > 0 ? Math.round((booked / total) * 100) : 0;
        var activeBookings = state.bookings.filter(function (b) { return b.status === 'checked_in'; }).length;

        var today = new Date().toISOString().split('T')[0];
        var todayCheckins = state.bookings.filter(function (b) { return b.checkin === today; }).length;
        var todayCheckouts = state.bookings.filter(function (b) { return b.checkout === today; }).length;
        var pendingPayments = state.bookings.filter(function (b) {
            var ps = getBookingPaymentStatus(b, state);
            return ps.status !== 'Paid' && b.status === 'checked_out';
        }).length;

        var roomTypeCount = {};
        state.bookings.forEach(function (b) {
            var r = state.rooms.find(function (room) { return room.id === b.room; });
            if (r) {
                roomTypeCount[r.room_type] = (roomTypeCount[r.room_type] || 0) + 1;
            }
        });
        var popularType = 'N/A';
        var maxCount = 0;
        for (var type in roomTypeCount) {
            if (roomTypeCount[type] > maxCount) { maxCount = roomTypeCount[type]; popularType = type; }
        }

        var outstanding = state.bookings.filter(function (b) {
            if (b.status !== 'checked_out') return false;
            var paymentStatus = getBookingPaymentStatus(b, state);
            return paymentStatus.status !== 'Paid';
        });

        document.getElementById('page-dashboard').innerHTML =
            '<div class="dashboard-stats">' +
            '<div class="glass-card text-center stat-card-rooms" data-accent="green">' +
            '<div class="stat-icon-wrapper green"><i class="fas fa-door-open stat-icon green"></i></div>' +
            '<div class="stat-value">' + total + '</div>' +
            '<div class="stat-label">' + Lang.t('total_rooms') + '</div>' +
            '</div>' +
            '<div class="glass-card text-center stat-card-available" data-accent="emerald">' +
            '<div class="stat-icon-wrapper emerald"><i class="fas fa-check-circle stat-icon emerald"></i></div>' +
            '<div class="stat-value">' + available + '</div>' +
            '<div class="stat-label">' + Lang.t('available') + '</div>' +
            '</div>' +
            '<div class="glass-card text-center stat-card-bookings" data-accent="yellow">' +
            '<div class="stat-icon-wrapper yellow"><i class="fas fa-bookmark stat-icon yellow"></i></div>' +
            '<div class="stat-value">' + booked + '</div>' +
            '<div class="stat-label">' + Lang.t('booked') + '</div>' +
            '</div>' +
            '<div class="glass-card text-center stat-card-customers" data-accent="purple">' +
            '<div class="stat-icon-wrapper purple"><i class="fas fa-user-friends stat-icon purple"></i></div>' +
            '<div class="stat-value">' + state.customers.length + '</div>' +
            '<div class="stat-label">' + Lang.t('customers') + '</div>' +
            '</div>' +
            '</div>' +
            '<div class="dashboard-stats">' +
            '<div class="glass-card text-center stat-card-revenue" data-accent="emerald">' +
            '<div class="stat-icon-wrapper emerald"><i class="fas fa-dollar-sign stat-icon emerald"></i></div>' +
            '<div class="stat-value">' + formatCurrency(totalRevenue) + '</div>' +
            '<div class="stat-label">' + Lang.t('total_revenue') + '</div>' +
            '</div>' +
            '<div class="glass-card text-center stat-card-today" data-accent="blue">' +
            '<div class="stat-icon-wrapper blue"><i class="fas fa-calendar-day stat-icon blue"></i></div>' +
            '<div class="stat-value">' + formatCurrency(todayRevenue) + '</div>' +
            '<div class="stat-label">' + Lang.t('today_revenue') + '</div>' +
            '</div>' +
            '<div class="glass-card text-center stat-card-occupancy" data-accent="yellow">' +
            '<div class="stat-icon-wrapper yellow"><i class="fas fa-percent stat-icon yellow"></i></div>' +
            '<div class="stat-value">' + occupancyRate + '%</div>' +
            '<div class="stat-label">' + Lang.t('occupancy_rate') + '</div>' +
            '</div>' +
            '<div class="glass-card text-center stat-card-active" data-accent="blue">' +
            '<div class="stat-icon-wrapper blue"><i class="fas fa-calendar-check stat-icon blue"></i></div>' +
            '<div class="stat-value">' + activeBookings + '</div>' +
            '<div class="stat-label">' + Lang.t('active_bookings') + '</div>' +
            '</div>' +
            '</div>' +

            '<div class="dashboard-widgets">' +
            '<div class="glass-card text-center">' +
            '<div class="widget-icon green"><i class="fas fa-sign-in-alt"></i></div>' +
            '<div class="stat-value" style="font-size:1.3rem;">' + todayCheckins + '</div>' +
            '<div class="stat-label">' + Lang.t('today_checkins') + '</div>' +
            '</div>' +
            '<div class="glass-card text-center">' +
            '<div class="widget-icon blue"><i class="fas fa-sign-out-alt"></i></div>' +
            '<div class="stat-value" style="font-size:1.3rem;">' + todayCheckouts + '</div>' +
            '<div class="stat-label">' + Lang.t('today_checkouts') + '</div>' +
            '</div>' +
            '<div class="glass-card text-center">' +
            '<div class="widget-icon yellow"><i class="fas fa-clock"></i></div>' +
            '<div class="stat-value" style="font-size:1.3rem;">' + pendingPayments + '</div>' +
            '<div class="stat-label">' + Lang.t('pending_payments') + '</div>' +
            '</div>' +
            '<div class="glass-card text-center">' +
            '<div class="widget-icon purple"><i class="fas fa-crown"></i></div>' +
            '<div class="stat-value" style="font-size:1rem;">' + escapeHtml(popularType) + '</div>' +
            '<div class="stat-label">' + Lang.t('popular_room') + '</div>' +
            '</div>' +
            '</div>';

        if (outstanding.length > 0) {
            var outstandingHtml =
                '<div class="outstanding-section glass-card mb-3">' +
                '<h6 class="text-muted mb-2"><i class="fas fa-exclamation-triangle" style="color:var(--color-danger);"></i> ' + Lang.t('outstanding') + ' (' + outstanding.length + ')</h6>';
            outstanding.forEach(function (b) {
                var c = state.customers.find(function (c) { return c.id === b.customer; });
                var r = state.rooms.find(function (r) { return r.id === b.room; });
                var paymentStatus = getBookingPaymentStatus(b, state);
                outstandingHtml +=
                    '<div class="outstanding-item d-flex justify-content-between align-items-center">' +
                    '<span>' + escapeHtml(c?.full_name || 'N/A') + ' - Xona ' + escapeHtml(r?.number || 'N/A') + '</span>' +
                    '<span class="due-amount">' + formatCurrency(paymentStatus.remaining) + '</span>' +
                    '<span class="badge-status ' + (paymentStatus.status === 'Paid' ? 'paid' : 'pending') + '">' + (paymentStatus.status === 'Paid' ? Lang.t('paid_payments') : Lang.t('unpaid')) + '</span>' +
                    '</div>';
            });
            outstandingHtml +=
                '<small class="text-muted">' + Lang.t('due_date') + ': ' + new Date().toLocaleDateString() + '</small>' +
                '</div>';
            document.getElementById('page-dashboard').innerHTML += outstandingHtml;
        }

        document.getElementById('page-dashboard').innerHTML +=
            '<div class="row g-3 mb-3">' +
            '<div class="col-md-7"><div class="glass-card"><div class="chart-container"><canvas id="revenueChart"></canvas></div></div></div>' +
            '<div class="col-md-5"><div class="glass-card"><div class="chart-container"><canvas id="occupancyChart"></canvas></div></div></div>' +
            '</div>' +
            '<div class="glass-card">' +
            '<h5 class="fw-light mb-3"><i class="fas fa-clock me-2"></i>' + Lang.t('recent_bookings') + '</h5>' +
            '<div id="recentBookingsTable" class="table-responsive"></div>' +
            '</div>';

        var html = '<table class="table"><thead><tr><th>' + Lang.t('customer') + '</th><th>' + Lang.t('room') + '</th><th>' + Lang.t('status') + '</th></tr></thead><tbody>';
        if (state.bookings.length === 0) {
            html += '<tr><td colspan="3" class="text-center text-muted">' + Lang.t('no_recent_activity') + '</td></tr>';
        } else {
            state.bookings.slice(-5).reverse().forEach(function (b) {
                var c = state.customers.find(function (c) { return c.id === b.customer; });
                var r = state.rooms.find(function (r) { return r.id === b.room; });
                var statusMap = { 'checked_in': 'Faol', 'checked_out': 'Tugagan', 'pending': 'Kutilmoqda', 'cancelled': 'Bekor qilingan', 'no_show': 'Kelmadi' };
                var statusClass = getStatusKey(b.status);
                html += '<tr><td>' + escapeHtml(c ? c.full_name : 'N/A') + '</td><td>' + escapeHtml(r ? r.number : 'N/A') + '</td><td><span class="badge-status ' + statusClass + '">' + (statusMap[b.status] || b.status) + '</span></td></tr>';
            });
        }
        html += '</tbody></table>';
        document.getElementById('recentBookingsTable').innerHTML = html;

        var isDark = Theme.current === 'dark';
        var chartTextColor = isDark ? '#CBD5E1' : '#334155';
        var chartGridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

        var chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: chartTextColor,
                        font: { size: 12 }
                    }
                }
            },
            scales: {
                y: {
                    grid: { color: chartGridColor },
                    ticks: { color: chartTextColor }
                },
                x: {
                    grid: { color: 'transparent' },
                    ticks: { color: chartTextColor }
                }
            }
        };

        var ctx1 = document.getElementById('revenueChart')?.getContext('2d');
        if (ctx1) {
            if (this.charts.revenue) this.charts.revenue.destroy();
        var _now = new Date();
        var _labels = [];
        var _data = [];
        var _loc = Lang.current === 'ru' ? 'ru-RU' : Lang.current === 'en' ? 'en-US' : 'uz-UZ';
        for (var _mi = 5; _mi >= 0; _mi--) {
            var _d = new Date(_now.getFullYear(), _now.getMonth() - _mi, 1);
            var _ym = _d.getFullYear() + '-' + String(_d.getMonth() + 1).padStart(2, '0');
            _labels.push(_d.toLocaleDateString(_loc, { month: 'short' }));
            var _sum = state.payments
                .filter(function (p) {
                    if (p.status !== 'completed' || !p.payment_date) return false;
                    var pd = new Date(p.payment_date);
                    if (isNaN(pd.getTime())) return false;
                    var pdym = pd.getFullYear() + '-' + String(pd.getMonth() + 1).padStart(2, '0');
                    return pdym === _ym;
                })
                .reduce(function (s, p) { return s + Number(p.amount || 0); }, 0);
            _data.push(_sum);
        }
        this.charts.revenue = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: _labels,
                datasets: [{
                    label: Lang.t('total_revenue'),
                    data: _data,
                    backgroundColor: [
                        'rgba(91,95,255,0.5)',
                        'rgba(124,58,237,0.5)',
                        'rgba(59,130,246,0.5)',
                        'rgba(6,182,212,0.5)',
                        'rgba(16,185,129,0.5)',
                        'rgba(245,158,11,0.5)'
                    ],
                    borderColor: ['#5B5FFF', '#7C3AED', '#3B82F6', '#06B6D4', '#10B981', '#F59E0B'],
                    borderWidth: 2,
                    borderRadius: 6
                }]
            },
            options: chartOptions
        });
        }
        var ctx2 = document.getElementById('occupancyChart')?.getContext('2d');
        if (ctx2) {
            if (this.charts.occupancy) this.charts.occupancy.destroy();
            this.charts.occupancy = new Chart(ctx2, {
                type: 'doughnut',
                data: {
                    labels: ['Bo\'sh', 'Band'],
                    datasets: [{
                        data: [available, booked],
                        backgroundColor: ['#34D399', '#F59E0B'],
                        borderColor: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.1)'],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: {
                                color: chartTextColor
                            }
                        }
                    },
                    cutout: '65%'
                }
            });
        }
    },

    // ===== ROOMS =====
    renderRooms: function () {
        var state = AppState.get();
        var rooms = ROOMS_USE_API ? state.rooms : state.rooms;
        var search = this.roomSearch || '';
        var filtered = rooms;

        if (search) filtered = filtered.filter(function (r) { return r.number?.toLowerCase().includes(search) || r.room_type?.toLowerCase().includes(search); });

        if (this.roomFilter === 'available') filtered = filtered.filter(function (r) { return r.status === 'available'; });
        else if (this.roomFilter === 'booked') filtered = filtered.filter(function (r) { return r.status === 'booked' || r.status === 'occupied'; });
        else if (this.roomFilter === 'vip') filtered = filtered.filter(function (r) { return r.room_type === 'VIP'; });
        else if (this.roomFilter === 'maintenance') filtered = filtered.filter(function (r) { return r.status === 'maintenance'; });

        var field = this.currentSort.field;
        var direction = this.currentSort.direction;
        filtered.sort(function (a, b) {
            var valA = a[field] || '', valB = b[field] || '';
            if (field === 'number') { valA = parseInt(valA) || 0; valB = parseInt(valB) || 0; }
            if (typeof valA === 'string') { valA = valA.toLowerCase(); valB = valB.toLowerCase(); }
            if (valA < valB) return direction === 'asc' ? -1 : 1;
            if (valA > valB) return direction === 'asc' ? 1 : -1;
            return 0;
        });

        var nextNumber = '101';
        if (state.rooms.length > 0) {
            var nums = state.rooms.map(function (r) { return parseInt(r.number); }).filter(function (n) { return !isNaN(n); }).sort(function (a, b) { return a - b; });
            var found = null;
            for (var i = 0; i < nums.length - 1; i++) {
                if (nums[i + 1] - nums[i] > 1) { found = nums[i] + 1; break; }
            }
            nextNumber = String(found || nums[nums.length - 1] + 1);
        }

        var paginationInfo = '';
        if (ROOMS_USE_API && AppState.roomsPagination) {
            var p = AppState.roomsPagination;
            if (p && p.count > 25) {
                paginationInfo = '<div class="text-muted text-center mt-2" style="font-size:0.8rem;">' +
                    'Jami: ' + p.count + ' ta xona | ' +
                    'Sahifa: ' + p.currentPage +
                    (p.next ? ' | <button class="btn-glass btn-glass-sm" onclick="App.loadRoomsPage(' + (p.currentPage + 1) + ')">Keyingi</button>' : '') +
                    (p.previous ? ' | <button class="btn-glass btn-glass-sm" onclick="App.loadRoomsPage(' + (p.currentPage - 1) + ')">Oldingi</button>' : '') +
                    '</div>';
            }
        }

        document.getElementById('page-rooms').innerHTML =
            '<div class="page-header-row">' +
            '<h2 class="fw-light mb-0"><i class="fas fa-door-open me-2"></i>' + Lang.t('nav_rooms') + '</h2>' +
            '<div class="d-flex gap-2 align-items-center flex-wrap">' +
            '<button class="btn-glass btn-glass-primary" id="addRoomBtn"><i class="fas fa-plus"></i> ' + Lang.t('add_room') + '</button>' +
            '</div>' +
            '</div>' +

            '<div class="d-flex gap-2 align-items-center mb-2 flex-wrap">' +
            '<input id="roomSearch" class="form-control room-search-input" placeholder="' + Lang.t('search') + '" value="' + escapeHtml(this.roomSearch) + '">' +
            '<div class="d-flex gap-1 align-items-center">' +
            '<button class="sort-btn ' + (field === 'number' ? 'active' : '') + '" data-sort="number" title="Raqam bo\'yicha"><i class="fas fa-sort-numeric-down"></i></button>' +
            '<button class="sort-btn ' + (field === 'room_type' ? 'active' : '') + '" data-sort="room_type" title="Tur bo\'yicha"><i class="fas fa-sort-alpha-down"></i></button>' +
            '<button class="sort-btn ' + (field === 'price_per_night' ? 'active' : '') + '" data-sort="price_per_night" title="Narx bo\'yicha"><i class="fas fa-sort-amount-down"></i></button>' +
            '</div>' +
            '</div>' +

            '<div class="filter-row mb-3">' +
            '<button class="filter-btn room-filter-btn ' + (this.roomFilter === 'all' ? 'active' : '') + '" data-filter="all"><i class="fas fa-list"></i> ' + Lang.t('all') + '</button>' +
            '<button class="filter-btn room-filter-btn ' + (this.roomFilter === 'available' ? 'active' : '') + '" data-filter="available"><i class="fas fa-check-circle" style="color:var(--color-success);"></i> ' + Lang.t('available') + '</button>' +
            '<button class="filter-btn room-filter-btn ' + (this.roomFilter === 'booked' ? 'active' : '') + '" data-filter="booked"><i class="fas fa-bookmark" style="color:var(--color-warning);"></i> ' + Lang.t('booked') + '</button>' +
            '<button class="filter-btn room-filter-btn ' + (this.roomFilter === 'vip' ? 'active' : '') + '" data-filter="vip"><i class="fas fa-crown" style="color:var(--color-warning);"></i> VIP</button>' +
            '<button class="filter-btn room-filter-btn ' + (this.roomFilter === 'maintenance' ? 'active' : '') + '" data-filter="maintenance"><i class="fas fa-tools" style="color:var(--color-danger);"></i> ' + Lang.t('maintenance') + '</button>' +
            '</div>' +
            '<div id="roomCards" class="row g-3"></div>' +
            (paginationInfo ? '<div id="roomPagination">' + paginationInfo + '</div>' : '');

        document.querySelectorAll('.room-filter-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                App.roomFilter = this.dataset.filter;
                App.renderRooms();
            });
        });

        document.querySelectorAll('.sort-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var field = this.dataset.sort;
                if (App.currentSort.field === field) App.currentSort.direction = App.currentSort.direction === 'asc' ? 'desc' : 'asc';
                else { App.currentSort.field = field; App.currentSort.direction = 'asc'; }
                App.renderRooms();
            });
        });

        var searchInput = document.getElementById('roomSearch');
        if (searchInput) {
            searchInput.addEventListener('input', debounce(function () {
                App.roomSearch = this.value.toLowerCase();
                App.renderRooms();
            }, 250));
        }

        document.getElementById('addRoomBtn')?.addEventListener('click', function () { App.openRoomModal(); });

        var cards = document.getElementById('roomCards');

        if (filtered.length === 0 && state.rooms.length === 0) {
            cards.innerHTML =
                '<div class="col-12">' +
                '<div class="glass-card text-center p-5">' +
                '<div class="empty-state">' +
                '<div class="icon"><i class="fas fa-door-open"></i></div>' +
                '<h5>' + Lang.t('empty_rooms') + '</h5>' +
                '<p>' + Lang.t('empty_rooms_desc') + '</p>' +
                '<button class="btn-glass btn-glass-primary" id="addRoomBtnEmpty"><i class="fas fa-plus"></i> ' + Lang.t('add_room') + '</button>' +
                '<div class="mt-2 text-muted" style="font-size:0.8rem;">' + Lang.t('next_room') + nextNumber + '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
            document.getElementById('addRoomBtnEmpty')?.addEventListener('click', function () { App.openRoomModal(); });
        } else if (filtered.length === 0 && state.rooms.length > 0) {
            cards.innerHTML =
                '<div class="col-12">' +
                '<div class="glass-card text-center p-5">' +
                '<div class="empty-state">' +
                '<div class="icon"><i class="fas fa-search"></i></div>' +
                '<h5>' + Lang.t('no_data') + '</h5>' +
                '<p class="text-muted">' + Lang.t('no_recent_activity') + '</p>' +
                '<button class="btn-glass" onclick="App.roomFilter=\'all\'; App.roomSearch=\'\'; App.renderRooms();">' +
                '<i class="fas fa-undo"></i> Filtrlarni tiklash' +
                '</button>' +
                '</div>' +
                '</div>' +
                '</div>';
        } else {
            cards.innerHTML = filtered.map(function (r, i) {
                var statusKey = getStatusKey(r.status);
                var statusLabel = roomStatusI18n(r.status);
                var cap = r.capacity || 5;
                return '<div class="col-md-4 col-sm-6">' +
                    '<div class="glass-card room-card" style="animation: cardEnter 0.4s cubic-bezier(0.34,1.56,0.64,1) ' + (i * 50) + 'ms forwards; opacity:0;">' +
                        '<div class="room-card-header">' +
                            '<h5 class="room-card-number">#' + escapeHtml(r.number) + '</h5>' +
                            '<span class="badge-status ' + statusKey + '">' + escapeHtml(statusLabel) + '</span>' +
                        '</div>' +
                        '<div class="room-card-meta">' +
                            '<span class="room-card-type"><i class="fas fa-tag"></i> ' + escapeHtml(r.room_type || '—') + '</span>' +
                            '<span class="room-card-capacity"><i class="fas fa-user"></i> ' + cap + ' kishi</span>' +
                        '</div>' +
                        '<div class="room-card-price">' +
                            formatCurrency(r.price_per_night) +
                            ' <small>/ kecha</small>' +
                        '</div>' +
                        '<div class="room-card-actions">' +
                            '<button class="btn-glass btn-glass-sm editRoom" data-id="' + escapeHtml(r.id) + '"><i class="fas fa-edit"></i> ' + Lang.t('edit') + '</button>' +
                            '<button class="btn-glass btn-glass-sm deleteRoom" data-id="' + escapeHtml(r.id) + '"><i class="fas fa-trash"></i> ' + Lang.t('delete') + '</button>' +
                        '</div>' +
                    '</div>' +
                '</div>';
            }).join('');
        }
        document.querySelectorAll('.editRoom').forEach(function (btn) { btn.addEventListener('click', function () { App.openRoomModal(this.dataset.id); }); });
        document.querySelectorAll('.deleteRoom').forEach(function (btn) { btn.addEventListener('click', function () { App.deleteRoom(this.dataset.id); }); });
    },

    loadRoomsPage: async function (page) {
        try {
            const rooms = await roomService.getRooms(page);
            AppState.data.rooms = rooms;
            AppState.roomsPagination = roomService.getPagination();
            this.renderRooms();
        } catch (error) {
            Toast.error('Sahifani yuklashda xatolik: ' + (error.message || 'Noma\'lum xato'));
        }
    },

    openRoomModal: function (id) {
        if (id === undefined) id = null;
        var state = AppState.get();
        var room = id ? state.rooms.find(function (r) { return r.id === id; }) : null;
        var oldModal = document.getElementById('roomModal');
        if (oldModal) oldModal.remove();

        var nextNumber = '101';
        if (!id && state.rooms.length > 0) {
            var nums = state.rooms.map(function (r) { return parseInt(r.number); }).filter(function (n) { return !isNaN(n); }).sort(function (a, b) { return a - b; });
            var found = null;
            for (var i = 0; i < nums.length - 1; i++) {
                if (nums[i + 1] - nums[i] > 1) { found = nums[i] + 1; break; }
            }
            nextNumber = String(found || nums[nums.length - 1] + 1);
        }

        var defaultNumber = room ? room.number : nextNumber;
        var defaultPrice = room ? room.price_per_night : 80;
        var defaultType = room?.room_type || 'Standard';
        var DEFAULT_PRICES = { Standard: 80, Deluxe: 120, Luxury: 180, Suite: 250, VIP: 380 };

        var modalHtml =
            '<div class="modal fade" id="roomModal" tabindex="-1" role="dialog" aria-modal="true" aria-label="' + (room ? 'Xonani tahrirlash' : 'Xona qo\'shish') + '">' +
            '<div class="modal-dialog modal-dialog-centered">' +
            '<div class="modal-content glass">' +
            '<div class="modal-header">' +
            '<h5 class="modal-title">' + (room ? 'Xonani tahrirlash' : 'Xona qo\'shish') + '</h5>' +
            '<button type="button" class="btn-close" data-bs-dismiss="modal"></button>' +
            '</div>' +
            '<div class="modal-body">' +
            '<form id="roomForm" novalidate>' +
            '<input type="hidden" id="roomId" value="' + escapeHtml(room?.id || '') + '">' +
            '<div class="mb-3">' +
            '<label class="form-label">' + Lang.t('number') + '</label>' +
            '<input id="roomNumber" class="form-control" value="' + escapeHtml(defaultNumber) + '" placeholder="' + Lang.t('enter_room_number') + '">' +
            (!room ? '<div class="room-number-hint"><i class="fas fa-info-circle"></i> ' + Lang.t('next_room') + nextNumber + '</div>' : '') +
            '</div>' +
            '<div class="mb-3">' +
            '<label class="form-label">' + Lang.t('type') + '</label>' +
            '<select id="roomType" class="form-select">' +
            '<option value="Standard" ' + (defaultType === 'Standard' ? 'selected' : '') + '>Standard</option>' +
            '<option value="Deluxe" ' + (defaultType === 'Deluxe' ? 'selected' : '') + '>Deluxe</option>' +
            '<option value="Luxury" ' + (defaultType === 'Luxury' ? 'selected' : '') + '>Luxury</option>' +
            '<option value="Suite" ' + (defaultType === 'Suite' ? 'selected' : '') + '>Suite</option>' +
            '<option value="VIP" ' + (defaultType === 'VIP' ? 'selected' : '') + '>VIP</option>' +
            '</select>' +
            '</div>' +
                        '<div class="mb-3">' +
            '<label class="form-label">Sig\'im (mehmonlar soni)</label>' +
            '<input id="roomCapacity" type="number" min="1" max="5" class="form-control" value="' + escapeHtml(room?.capacity || 2) + '" placeholder="1-5">' +
            '<div class="room-number-hint"><i class="fas fa-info-circle"></i> Maksimal 5 mehmon</div>' +
            '</div>' +
            '<div class="mb-3">' +
            '<label class="form-label">' + Lang.t('price') + '</label>' +'<input id="roomPrice" type="number" class="form-control" value="' + (room ? escapeHtml(room.price_per_night) : '') + '" placeholder="Standart: $' + (DEFAULT_PRICES[defaultType] || 80) + ' (USD)">' +
            (!room ? '<div class="room-price-hint"><i class="fas fa-info-circle"></i> ' + Lang.t('price_currency') + '</div>' : '') +
            '</div>' +
            '<div class="mb-3">' +
            '<label class="form-label">' + Lang.t('status') + '</label>' +
            '<select id="roomStatus" class="form-select">' +
            '<option value="available" ' + (room?.status === 'available' ? 'selected' : '') + '>' + Lang.t('available') + '</option>' +
            '<option value="booked" ' + (room?.status === 'booked' ? 'selected' : '') + '>' + Lang.t('booked') + '</option>' +
                        '<option value="occupied" ' + (room?.status === 'occupied' ? 'selected' : '') + '>' + roomStatusI18n('occupied') + '</option>' +
            '<option value="cleaning" ' + (room?.status === 'cleaning' ? 'selected' : '') + '>' + roomStatusI18n('cleaning') + '</option>' +
            '<option value="maintenance" ' + (room?.status === 'maintenance' ? 'selected' : '') + '>' + roomStatusI18n('maintenance') + '</option>' +
            '<option value="out_of_service" ' + (room?.status === 'out_of_service' ? 'selected' : '') + '>' + roomStatusI18n('out_of_service') + '</option>' +'</select>' +
            '</div>' +
            '</form>' +
            '</div>' +
            '<div class="modal-footer">' +
            '<button class="btn-glass" data-bs-dismiss="modal">' + Lang.t('cancel') + '</button>' +
            '<button class="btn-glass btn-glass-primary" id="saveRoomBtn">' + Lang.t('save') + '</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';

        document.getElementById('modal-container').insertAdjacentHTML('beforeend', modalHtml);
        var modal = new bootstrap.Modal(document.getElementById('roomModal'), { backdrop: 'static', keyboard: true });
        modal.show();

        document.getElementById('roomType').addEventListener('change', function () {
            var priceInput = document.getElementById('roomPrice');
            if (priceInput && !priceInput.value) {
                var p = DEFAULT_PRICES[this.value] || 80;
                priceInput.placeholder = 'Standart: $' + p + ' (USD)';
            }
        });

        document.getElementById('saveRoomBtn').addEventListener('click', async function () {
            var id = document.getElementById('roomId').value;
            var number = document.getElementById('roomNumber').value.trim();
            var type = document.getElementById('roomType').value;
            var price = parseFloat(document.getElementById('roomPrice').value);
            var status = document.getElementById('roomStatus').value;

            if (!number || !price) { Toast.warning(Lang.t('required_field')); return; }
            var state = AppState.get();
            var existingRoom = state.rooms.find(function (r) { return r.number === number && r.id !== id; });
            if (existingRoom) { Toast.warning(Lang.t('duplicate_room')); return; }

                        var capacityVal = parseInt(document.getElementById('roomCapacity').value, 10) || 2;
            capacityVal = Math.max(1, Math.min(capacityVal, 5));
            var roomData = {
                number: number, floor: 1, room_type: type,
                capacity: capacityVal, price_per_night: price,
                status: status, description: ''
            };
            if (ROOMS_USE_API) {
                try {
                    var submitBtn = document.getElementById('saveRoomBtn');
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saqlanmoqda...';

                    if (id) {
                        var updatedRoom = await roomService.updateRoom(id, roomData);
                        var idx = state.rooms.findIndex(function (r) { return r.id === id; });
                        if (idx > -1) { state.rooms[idx] = updatedRoom; }
                        Toast.success(Lang.t('room_updated'));
                        App.addNotification('Xona #' + number + ' yangilandi', 'success', 'system');
                    } else {
                        var newRoom = await roomService.createRoom(roomData);
                        state.rooms.push(newRoom);
                        Toast.success(Lang.t('room_added'));
                        App.addNotification('Xona #' + number + ' qo\'shildi', 'success', 'system');
                    }
                    AppState.set(state);
                    modal.hide();
                    App.renderRooms();
                    App.renderDashboard();
                } catch (error) {
                    if (error.data && error.data.errors) {
                        var errMsg = Object.values(error.data.errors).flat().join(' ');
                        Toast.error(errMsg);
                    } else {
                        Toast.error(error.message || 'Xatolik yuz berdi');
                    }
                } finally {
                    var submitBtn = document.getElementById('saveRoomBtn');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = Lang.t('save');
                }
            } else {
                // Original localStorage logic
                var roomData = { number: escapeHtml(number), type: escapeHtml(type), price: price, status: escapeHtml(status) };
                if (id) {
                    var idx = state.rooms.findIndex(function (r) { return r.id === id; });
                    if (idx > -1) { state.rooms[idx] = { ...state.rooms[idx], ...roomData }; Toast.success(Lang.t('room_updated')); App.addNotification('Xona #' + number + ' yangilandi', 'success', 'system'); }
                } else {
                    roomData.id = AppState.genId();
                    state.rooms.push(roomData);
                    Toast.success(Lang.t('room_added'));
                    App.addNotification('Xona #' + number + ' qo\'shildi', 'success', 'system');
                }
                AppState.set(state);
                modal.hide();
                App.renderRooms();
                App.renderDashboard();
            }
        });

        document.getElementById('roomModal').addEventListener('hidden.bs.modal', function () {
            document.getElementById('roomModal').remove();
        });
    },

    deleteRoom: function (id) {
        showConfirm('Bu xonani o\'chirmoqchimisiz?', async function () {
            var state = AppState.get();
            var room = state.rooms.find(function (r) { return r.id === id; });

            if (ROOMS_USE_API) {
                try {
                    await roomService.deleteRoom(id);
                    state.rooms = state.rooms.filter(function (r) { return r.id !== id; });
                    AppState.set(state);
                    Toast.success(Lang.t('room_deleted'));
                    App.addNotification('Xona #' + (room?.number || '') + ' o\'chirildi', 'info', 'system');
                    App.renderRooms();
                    App.renderDashboard();
                } catch (error) {
                    Toast.error(error.message || 'Xatolik yuz berdi');
                }
            } else {
                state.rooms = state.rooms.filter(function (r) { return r.id !== id; });
                AppState.set(state);
                Toast.success(Lang.t('room_deleted'));
                App.addNotification('Xona #' + (room?.number || '') + ' o\'chirildi', 'info', 'system');
                App.renderRooms();
                App.renderDashboard();
            }
        });
    },

    // ===== CUSTOMERS =====
    renderCustomers: function () {
        var state = AppState.get();
        var filtered = state.customers;

        if (this.customerFilter === 'checked_in') {
            var bookedIds = state.bookings.filter(function (b) { return b.status === 'checked_in'; }).map(function (b) { return b.customer; });
            filtered = filtered.filter(function (c) { return bookedIds.includes(c.id); });
        } else if (this.customerFilter === 'checked_out') {
            var bookedIds = state.bookings.filter(function (b) { return b.status === 'checked_out'; }).map(function (b) { return b.customer; });
            filtered = filtered.filter(function (c) { return bookedIds.includes(c.id); });
        } else if (this.customerFilter === 'no_booking') {
            var bookedIds = state.bookings.map(function (b) { return b.customer; });
            filtered = filtered.filter(function (c) { return !bookedIds.includes(c.id); });
        } else if (this.customerFilter === 'active_booking') {
            var bookedIds = state.bookings.filter(function (b) { return b.status === 'checked_in' || b.status === 'pending'; }).map(function (b) { return b.customer; });
            filtered = filtered.filter(function (c) { return bookedIds.includes(c.id); });
        }

        var rowsHtml = '';
        if (filtered.length === 0) {
            rowsHtml = '<tr><td colspan="7" class="text-center text-muted">' + Lang.t('no_data') + '</td></tr>';
        } else {
            rowsHtml = filtered.map(function (c) {
                var activeBooking = state.bookings.find(function (b) {
                    return b.customer === c.id && (b.status === 'checked_in' || b.status === 'pending');
                });
                var anyBooking = activeBooking || state.bookings
                    .filter(function (b) { return b.customer === c.id; })
                    .sort(function (a, b) { return new Date(b.created_at || 0) - new Date(a.created_at || 0); })[0];
                var booking = activeBooking || anyBooking;
                var room = booking ? state.rooms.find(function (r) { return r.id === booking.room; }) : null;
                var statusLabel = booking ? bookingStatusI18n(booking.status) : 'Bronsiz';
                var statusKey = booking ? getStatusKey(booking.status) : 'pending';
                var roomCell = '—';
                if (room) {
                    roomCell = '<strong>#' + escapeHtml(room.number) + '</strong>';
                    if (booking && booking.checkin && booking.checkout) {
                        roomCell += '<br><small style="opacity:0.6;">' + escapeHtml(booking.checkin) + ' → ' + escapeHtml(booking.checkout) + '</small>';
                    }
                }
                return '<tr>' +
                    '<td data-label="Mijoz"><strong>' + escapeHtml(c.full_name || '—') + '</strong></td>' +
                    '<td data-label="Passport">' + escapeHtml(c.passport || '—') + '</td>' +
                    '<td data-label="Telefon">' + escapeHtml(c.phone || '—') + '</td>' +
                    '<td data-label="Email">' + escapeHtml(c.email || '—') + '</td>' +
                    '<td data-label="Xona">' + roomCell + '</td>' +
                    '<td data-label="Holat"><span class="badge-status ' + statusKey + '">' + escapeHtml(statusLabel) + '</span></td>' +
                    '<td data-label="Amallar">' +
                        '<div class="actions-cell">' +
                            '<button type="button" class="btn-glass btn-glass-sm editCust" data-id="' + escapeHtml(c.id) + '" title="Tahrirlash"><i class="fas fa-edit"></i></button>' +
                            '<button type="button" class="btn-glass btn-glass-sm deleteCust" data-id="' + escapeHtml(c.id) + '" title="O\'chirish"><i class="fas fa-trash"></i></button>' +
                        '</div>' +
                    '</td>' +
                '</tr>';
            }).join('');
        }

        document.getElementById('page-customers').innerHTML =
            '<div class="page-header-row">' +
                '<h2 class="fw-light mb-0"><i class="fas fa-users me-2"></i>' + Lang.t('nav_customers') + '</h2>' +
                '<button class="btn-glass btn-glass-primary" id="addCustomerBtn"><i class="fas fa-plus"></i> ' + Lang.t('add_customer') + '</button>' +
            '</div>' +
            '<div class="d-flex gap-2 mb-3 filter-row">' +
                '<button class="filter-btn customer-filter-btn ' + (this.customerFilter === 'all' ? 'active' : '') + '" data-filter="all"><i class="fas fa-list"></i> ' + Lang.t('all') + '</button>' +
                '<button class="filter-btn customer-filter-btn ' + (this.customerFilter === 'checked_in' ? 'active' : '') + '" data-filter="checked_in"><i class="fas fa-sign-in-alt" style="color:var(--color-success);"></i> ' + Lang.t('checked_in') + '</button>' +
                '<button class="filter-btn customer-filter-btn ' + (this.customerFilter === 'checked_out' ? 'active' : '') + '" data-filter="checked_out"><i class="fas fa-sign-out-alt" style="color:#8B8E98;"></i> ' + Lang.t('checked_out') + '</button>' +
                '<button class="filter-btn customer-filter-btn ' + (this.customerFilter === 'no_booking' ? 'active' : '') + '" data-filter="no_booking"><i class="fas fa-user-slash" style="color:var(--color-warning);"></i> ' + Lang.t('no_booking') + '</button>' +
                '<button class="filter-btn customer-filter-btn ' + (this.customerFilter === 'active_booking' ? 'active' : '') + '" data-filter="active_booking"><i class="fas fa-calendar-check" style="color:var(--accent-1);"></i> ' + Lang.t('active_booking') + '</button>' +
            '</div>' +
            '<div id="customerTableContainer" class="table-responsive glass-card">' +
                '<table class="table table-to-cards">' +
                    '<thead><tr>' +
                        '<th>' + Lang.t('name') + '</th>' +
                        '<th>Passport</th>' +
                        '<th>' + Lang.t('phone') + '</th>' +
                        '<th>' + Lang.t('email') + '</th>' +
                        '<th>' + Lang.t('room') + '</th>' +
                        '<th>' + Lang.t('status') + '</th>' +
                        '<th>' + Lang.t('actions') + '</th>' +
                    '</tr></thead>' +
                    '<tbody>' + rowsHtml + '</tbody>' +
                '</table>' +
            '</div>';

        document.querySelectorAll('.customer-filter-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                App.customerFilter = this.dataset.filter;
                App.renderCustomers();
            });
        });

        document.getElementById('addCustomerBtn')?.addEventListener('click', function () { App.openCustomerModal(); });
        document.querySelectorAll('.editCust').forEach(function (btn) { btn.addEventListener('click', function () { App.openCustomerModal(this.dataset.id); }); });
        document.querySelectorAll('.deleteCust').forEach(function (btn) { btn.addEventListener('click', function () { App.deleteCustomer(this.dataset.id); }); });
    },
    openCustomerModal: function (id) {
        if (id === undefined) id = null;
        var state = AppState.get();
        var customer = id ? state.customers.find(function (c) { return c.id === id; }) : null;
        var oldModal = document.getElementById('customerModal');
        if (oldModal) oldModal.remove();

        var modalHtml =
            '<div class="modal fade" id="customerModal" tabindex="-1" role="dialog" aria-modal="true" aria-label="' + (customer ? 'Mijozni tahrirlash' : 'Mijoz qo\'shish') + '">' +
            '<div class="modal-dialog modal-dialog-centered">' +
            '<div class="modal-content glass">' +
            '<div class="modal-header">' +
            '<h5 class="modal-title">' + (customer ? 'Mijozni tahrirlash' : 'Mijoz qo\'shish') + '</h5>' +
            '<button type="button" class="btn-close" data-bs-dismiss="modal"></button>' +
            '</div>' +
            '<div class="modal-body">' +
            '<form id="customerForm" novalidate>' +
            '<input type="hidden" id="custId" value="' + escapeHtml(customer?.id || '') + '">' +
            '<div class="mb-3">' +
            '<label class="form-label">' + Lang.t('name') + '</label>' +
            '<input id="custName" class="form-control" value="' + escapeHtml(customer?.full_name || '') + '" placeholder="' + Lang.t('enter_name') + '" required>' +
            '</div>' +
            '<div class="mb-3">' +
            '<label class="form-label">Passport</label>' +
            '<input id="custPassport" class="form-control" value="' + escapeHtml(customer?.passport || '') + '" placeholder="AB1234567" required>' +
            '</div>' +
            '<div class="mb-3">' +
            '<label class="form-label">' + Lang.t('email') + '</label>' +
            '<input id="custEmail" type="email" class="form-control" value="' + escapeHtml(customer?.email || '') + '" placeholder="' + Lang.t('enter_email') + '">' +
            '</div>' +
            '<div class="mb-3">' +
            '<label class="form-label">' + Lang.t('phone') + '</label>' +
            '<input id="custPhone" class="form-control" value="' + escapeHtml(customer?.phone || '+998') + '" placeholder="' + Lang.t('enter_phone') + '" required>' +
            '</div>' +
            '</form>' +
            '</div>' +
            '<div class="modal-footer">' +
            '<button class="btn-glass" data-bs-dismiss="modal">' + Lang.t('cancel') + '</button>' +
            '<button class="btn-glass btn-glass-primary" id="saveCustomerBtn">' + Lang.t('save') + '</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';

        document.getElementById('modal-container').insertAdjacentHTML('beforeend', modalHtml);
        var modal = new bootstrap.Modal(document.getElementById('customerModal'), { backdrop: 'static', keyboard: true });
        modal.show();

        var phoneInput = document.getElementById('custPhone');
        phoneInput.addEventListener('focus', function () { if (this.value === '') this.value = '+998'; });
        phoneInput.addEventListener('blur', function () { if (this.value === '+998') this.value = ''; });

        document.getElementById('saveCustomerBtn').addEventListener('click', async function () {
            var id = document.getElementById('custId').value;
            var name = document.getElementById('custName').value.trim();
            var passport = document.getElementById('custPassport').value.trim();
            var email = document.getElementById('custEmail').value.trim();
            var phone = document.getElementById('custPhone').value.trim();

            if (!name || !passport) { Toast.warning(Lang.t('required_field')); return; }
            if (!phone.startsWith('+998')) phone = '+998' + phone.replace(/[^0-9]/g, '');
            if (phone.length < 13) { Toast.warning(Lang.t('phone_format')); return; }

            var custData = { full_name: name, passport: passport, phone: phone };
            if (email) custData.email = email;

            var submitBtn = document.getElementById('saveCustomerBtn');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saqlanmoqda...';

            try {
                var state = AppState.get();
                if (id) {
                    var updated = await customerService.updateCustomer(id, custData);
                    var idx = state.customers.findIndex(function (c) { return c.id === id; });
                    if (idx > -1) { state.customers[idx] = updated; }
                    Toast.success(Lang.t('customer_updated'));
                    App.addNotification('Mijoz ' + name + ' yangilandi', 'success', 'customer');
                } else {
                    var created = await customerService.createCustomer(custData);
                    state.customers.push(created);
                    Toast.success(Lang.t('customer_added'));
                    App.addNotification('Mijoz ' + name + ' qo\'shildi', 'success', 'customer');
                }
                AppState.set(state);
                modal.hide();
                App.renderCustomers();
                App.renderDashboard();
            } catch (error) {
                if (error.data && error.data.error && error.data.error.errors) {
                    var errs = error.data.error.errors;
                    var msg = Object.keys(errs).map(function (k) {
                        var v = errs[k];
                        return Array.isArray(v) ? v.join(' ') : v;
                    }).join(' ');
                    Toast.error(msg || 'Xatolik yuz berdi');
                } else {
                    Toast.error(error.message || 'Xatolik yuz berdi');
                }
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = Lang.t('save');
            }
        });

        document.getElementById('customerModal').addEventListener('hidden.bs.modal', function () {
            document.getElementById('customerModal').remove();
        });
    },

    deleteCustomer: function (id) {
        showConfirm('Bu mijozni o\'chirmoqchimisiz?', async function () {
            try {
                await customerService.deleteCustomer(id);
                var state = AppState.get();
                state.customers = state.customers.filter(function (c) { return c.id !== id; });
                AppState.set(state);
                Toast.success(Lang.t('customer_deleted'));
                App.addNotification('Mijoz o\'chirildi', 'info', 'customer');
                App.renderCustomers();
                App.renderDashboard();
            } catch (error) {
                Toast.error(error.message || 'Xatolik yuz berdi');
            }
        });
    },

    // ===== BOOKINGS =====
    renderBookings: function () {
        var state = AppState.get();

        var filtered = state.bookings;
        if (this.bookingFilter === 'active') filtered = filtered.filter(function (b) { return b.status === 'checked_in'; });
        else if (this.bookingFilter === 'upcoming') filtered = filtered.filter(function (b) { return b.status === 'pending'; });
        else if (this.bookingFilter === 'completed') filtered = filtered.filter(function (b) { return b.status === 'checked_out'; });
        else if (this.bookingFilter === 'cancelled') filtered = filtered.filter(function (b) { return b.status === 'cancelled'; });

        document.getElementById('page-bookings').innerHTML =
            '<div class="page-header-row">' +
            '<h2 class="fw-light mb-0"><i class="fas fa-calendar-check me-2"></i>' + Lang.t('nav_bookings') + '</h2>' +
            '<button class="btn-glass btn-glass-primary" id="addBookingBtn"><i class="fas fa-plus"></i> ' + Lang.t('create_booking') + '</button>' +
            '</div>' +
            '<div class="d-flex gap-2 mb-3 filter-row">' +
            '<button class="filter-btn booking-filter-btn ' + (this.bookingFilter === 'all' ? 'active' : '') + '" data-filter="all"><i class="fas fa-list"></i> ' + Lang.t('all') + '</button>' +
            '<button class="filter-btn booking-filter-btn ' + (this.bookingFilter === 'active' ? 'active' : '') + '" data-filter="active"><i class="fas fa-play" style="color:var(--color-success);"></i> ' + Lang.t('active') + '</button>' +
            '<button class="filter-btn booking-filter-btn ' + (this.bookingFilter === 'upcoming' ? 'active' : '') + '" data-filter="upcoming"><i class="fas fa-clock" style="color:var(--accent-1);"></i> ' + Lang.t('upcoming') + '</button>' +
            '<button class="filter-btn booking-filter-btn ' + (this.bookingFilter === 'completed' ? 'active' : '') + '" data-filter="completed"><i class="fas fa-check" style="color:#8B8E98;"></i> ' + Lang.t('checked_out') + '</button>' +
            '<button class="filter-btn booking-filter-btn ' + (this.bookingFilter === 'cancelled' ? 'active' : '') + '" data-filter="cancelled"><i class="fas fa-times" style="color:var(--color-danger);"></i> ' + Lang.t('cancel') + '</button>' +
            '</div>' +
            '<div id="bookingTableContainer" class="table-responsive glass-card">' +
            '<table class="table table-to-cards">' +
                        '<thead><tr>' +
            '<th>' + Lang.t('customer') + '</th>' +
            '<th>' + Lang.t('room') + '</th>' +
            '<th>' + Lang.t('checkin') + '</th>' +
            '<th>' + Lang.t('checkout') + '</th>' +
            '<th>Mehmonlar</th>' +
            '<th>Jami narx</th>' +
            '<th>Reference</th>' +
            '<th>' + Lang.t('status') + '</th>' +
            '<th style="min-width:200px;">' + Lang.t('actions') + '</th>' +
            '</tr></thead>' +
            '<tbody>' +
            (filtered.length === 0 ? '<tr><td colspan="7" class="text-center text-muted">' + Lang.t('no_data') + '</td></tr>' :
                                filtered.map(function (b) {
                    var c = state.customers.find(function (x) { return x.id === b.customer; });
                    var r = state.rooms.find(function (x) { return x.id === b.room; });
                    var refLabel = b.reference || ('#' + String(b.id || '').slice(0, 8));
                    var nights = 0;
                    try { nights = Math.max(1, Math.round((new Date(b.checkout) - new Date(b.checkin)) / 86400000)); } catch(e) { nights = 0; }
                    var totalPrice = b.total_price ? formatCurrency(b.total_price) : (r && r.price_per_night ? formatCurrency(Number(r.price_per_night) * nights) : '—');
                    var actions = '<div class="actions-cell">' +
                        '<button type="button" class="btn-glass btn-glass-sm editBook" data-id="' + escapeHtml(b.id) + '" title="Tahrirlash"><i class="fas fa-edit"></i></button>';
                    if (b.status === 'pending') {
                        actions += '<button type="button" class="btn-glass btn-glass-sm checkInBook" data-id="' + escapeHtml(b.id) + '" title="Check-in qilish"><i class="fas fa-sign-in-alt"></i></button>';
                        actions += '<button type="button" class="btn-glass btn-glass-sm cancelBook" data-id="' + escapeHtml(b.id) + '" title="Bekor qilish"><i class="fas fa-times"></i></button>';
                    } else if (b.status === 'checked_in') {
                        actions += '<button type="button" class="btn-glass btn-glass-sm checkOutBook" data-id="' + escapeHtml(b.id) + '" title="Check-out qilish"><i class="fas fa-sign-out-alt"></i></button>';
                    }
                    actions += '<button type="button" class="btn-glass btn-glass-sm deleteBook" data-id="' + escapeHtml(b.id) + '" title="O\'chirish"><i class="fas fa-trash"></i></button></div>';
                    return '<tr>' +
                        '<td data-label="Mijoz"><strong>' + escapeHtml(c ? c.full_name : '—') + '</strong>' + (c && c.phone ? '<br><small style="opacity:0.6;">' + escapeHtml(c.phone) + '</small>' : '') + '</td>' +
                        '<td data-label="Xona">' + (r ? '<strong>#' + escapeHtml(r.number) + '</strong><br><small style="opacity:0.6;">' + escapeHtml(r.room_type || '') + '</small>' : '—') + '</td>' +
                        '<td data-label="Kirish">' + escapeHtml(b.checkin) + '</td>' +
                        '<td data-label="Chiqish">' + escapeHtml(b.checkout) + '</td>' +
                        '<td data-label="Mehmonlar">' + (b.guest_count || 1) + ' kishi</td>' +
                        '<td data-label="Jami narx"><strong>' + totalPrice + '</strong></td>' +
                        '<td data-label="Reference"><code style="font-size:0.78rem;">' + escapeHtml(refLabel) + '</code></td>' +
                        '<td data-label="Holat"><span class="badge-status ' + getStatusKey(b.status) + '">' + escapeHtml(bookingStatusI18n(b.status)) + '</span></td>' +
                        '<td data-label="Amallar">' + actions + '</td></tr>';
                }).join(''))
            '</tbody>' +
            '</table>' +
            '</div>';

        document.querySelectorAll('.booking-filter-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                App.bookingFilter = this.dataset.filter;
                App.renderBookings();
            });
        });

        document.getElementById('addBookingBtn')?.addEventListener('click', function () { App.openBookingModal(); });
        document.querySelectorAll('.editBook').forEach(function (btn) { btn.addEventListener('click', function () { App.openBookingModal(this.dataset.id); }); });
        document.querySelectorAll('.deleteBook').forEach(function (btn) { btn.addEventListener('click', function () { App.deleteBooking(this.dataset.id); }); });
        document.querySelectorAll('.checkInBook').forEach(function (btn) { btn.addEventListener('click', function () { App.bookingAction(this.dataset.id, 'checkIn'); }); });
        document.querySelectorAll('.checkOutBook').forEach(function (btn) { btn.addEventListener('click', function () { App.bookingAction(this.dataset.id, 'checkOut'); }); });
        document.querySelectorAll('.cancelBook').forEach(function (btn) { btn.addEventListener('click', function () { App.bookingAction(this.dataset.id, 'cancel'); }); });
    },

    // Booking lifecycle: pending -> checked_in -> checked_out, yoki pending -> cancelled.
    // Backendning maxsus action endpointlari orqali (raw status PUT emas),
    // shunda server tomonidagi room-status side-effectlar va validatsiya
    // to'g'ri ishlaydi.
    bookingAction: async function (id, action) {
        var labels = { checkIn: 'Check-in', checkOut: 'Check-out', cancel: 'Bekor qilish' };
        try {
            var updated;
            if (action === 'checkIn') updated = await bookingService.checkIn(id);
            else if (action === 'checkOut') updated = await bookingService.checkOut(id);
            else if (action === 'cancel') updated = await bookingService.cancelBooking(id);

            var state = AppState.get();
            var idx = state.bookings.findIndex(function (b) { return b.id === id; });
            if (idx > -1 && updated) state.bookings[idx] = { ...state.bookings[idx], ...updated };
            AppState.set(state);
            Toast.success(labels[action] + ' muvaffaqiyatli bajarildi');
            App.addNotification('Bron: ' + labels[action], 'success', 'booking');
            await App.hydrateRooms();
            App.renderBookings();
            App.renderDashboard();
        } catch (error) {
            Toast.error(error.message || (labels[action] + ' amalga oshmadi'));
        }
    },

    openBookingModal: function (id) {
        if (id === undefined) id = null;
        var state = AppState.get();
        var booking = id ? state.bookings.find(function (b) { return b.id === id; }) : null;
        var availableRooms = state.rooms.filter(function (r) { return r.status === 'available'; });
        if (booking) {
            var currentRoom = state.rooms.find(function (r) { return r.id === booking.room; });
            if (currentRoom && !availableRooms.find(function (r) { return r.id === currentRoom.id; })) {
                availableRooms.push(currentRoom);
            }
        }
        var oldModal = document.getElementById('bookingModal');
        if (oldModal) oldModal.remove();

        var modalHtml =
            '<div class="modal fade" id="bookingModal" tabindex="-1" role="dialog" aria-modal="true" aria-label="' + (booking ? 'Bronni tahrirlash' : 'Bron yaratish') + '">' +
            '<div class="modal-dialog modal-dialog-centered">' +
            '<div class="modal-content glass">' +
            '<div class="modal-header">' +
            '<h5 class="modal-title">' + (booking ? 'Bronni tahrirlash' : 'Bron yaratish') + '</h5>' +
            '<button type="button" class="btn-close" data-bs-dismiss="modal"></button>' +
            '</div>' +
            '<div class="modal-body">' +
            '<form id="bookingForm" novalidate>' +
            '<input type="hidden" id="bookId" value="' + escapeHtml(booking?.id || '') + '">' +
            '<div class="mb-3">' +
            '<label class="form-label">' + Lang.t('customer') + '</label>' +
            '<select id="bookCustomer" class="form-select" required>' +
            '<option value="">' + Lang.t('select_customer') + '</option>' +
            state.customers.map(function (c) { return '<option value="' + escapeHtml(c.id) + '" ' + (booking?.customer === c.id ? 'selected' : '') + '>' + escapeHtml(c.full_name) + '</option>'; }).join('') +
            '</select>' +
            '</div>' +
            '<div class="mb-3">' +
            '<label class="form-label">' + Lang.t('room') + '</label>' +
            '<select id="bookRoom" class="form-select" required>' +
            '<option value="">' + Lang.t('select_room') + '</option>' +
            availableRooms.map(function (r) { return '<option value="' + escapeHtml(r.id) + '" ' + (booking?.room === r.id ? 'selected' : '') + '>#' + escapeHtml(r.number) + ' (' + escapeHtml(r.room_type) + ') - ' + escapeHtml(roomStatusLabel(r.status)) + '</option>'; }).join('') +
            (availableRooms.length === 0 ? '<option value="" disabled>Bo\'sh xonalar yo\'q</option>' : '') +
            '</select>' +
            '</div>' +
            '<div class="mb-3">' +
            '<label class="form-label">' + Lang.t('checkin') + '</label>' +
            '<input id="bookCheckin" type="date" class="form-control" value="' + escapeHtml(booking?.checkin || '') + '" required>' +
            '</div>' +
            '<div class="mb-3">' +
            '<label class="form-label">' + Lang.t('checkout') + '</label>' +
            '<input id="bookCheckout" type="date" class="form-control" value="' + escapeHtml(booking?.checkout || '') + '" required>' +
            '</div>' +
            '<div class="mb-3">' +
            '<label class="form-label">Mehmonlar soni</label>' +
            '<input id="bookGuestCount" type="number" min="1" class="form-control" value="' + escapeHtml(booking?.guest_count || 1) + '" required>' +
            '</div>' +
            '<div class="mb-3">' +
            '<label class="form-label">Qo\'shimcha so\'rovlar</label>' +
            '<textarea id="bookSpecialRequests" class="form-control" rows="2">' + escapeHtml(booking?.special_requests || '') + '</textarea>' +
            '</div>' +
            (booking ? '<div class="text-muted" style="font-size:0.85rem;">Status: ' + escapeHtml(booking.status) + ' — statusni o\'zgartirish uchun jadvaldagi Check-in/Check-out/Bekor qilish tugmalarini ishlating.</div>' : '') +
            '</form>' +
            '</div>' +
            '<div class="modal-footer">' +
            '<button class="btn-glass" data-bs-dismiss="modal">' + Lang.t('cancel') + '</button>' +
            '<button class="btn-glass btn-glass-primary" id="saveBookingBtn">' + Lang.t('save') + '</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';

        document.getElementById('modal-container').insertAdjacentHTML('beforeend', modalHtml);
        var modal = new bootstrap.Modal(document.getElementById('bookingModal'), { backdrop: 'static', keyboard: true });
        modal.show();

        document.getElementById('saveBookingBtn').addEventListener('click', async function () {
            var id = document.getElementById('bookId').value;
            var customerId = document.getElementById('bookCustomer').value;
            var roomId = document.getElementById('bookRoom').value;
            var checkin = document.getElementById('bookCheckin').value;
            var checkout = document.getElementById('bookCheckout').value;
            var guestCount = parseInt(document.getElementById('bookGuestCount').value, 10) || 1;
            var specialRequests = document.getElementById('bookSpecialRequests').value.trim();

            if (!customerId || !roomId || !checkin || !checkout) { Toast.warning(Lang.t('required_field')); return; }
            if (checkout <= checkin) { Toast.warning('Chiqish sanasi kirish sanasidan keyin bo\'lishi kerak'); return; }

            // Muhim: yakuniy double-booking va narx tekshiruvi backendda
            // amalga oshiriladi (transaction.atomic + select_for_update) —
            // bu yerda faqat backend javobini kutamiz, frontend o'zi
            // "authority" sifatida ishlamaydi.
            var bookingData = {
                customer: customerId,
                room: roomId,
                checkin: checkin,
                checkout: checkout,
                guest_count: guestCount,
                special_requests: specialRequests,
            };

            var submitBtn = document.getElementById('saveBookingBtn');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saqlanmoqda...';

            try {
                var state = AppState.get();
                if (id) {
                    var updated = await bookingService.updateBooking(id, bookingData);
                    var idx = state.bookings.findIndex(function (b) { return b.id === id; });
                    if (idx > -1) { state.bookings[idx] = updated; }
                    Toast.success(Lang.t('booking_updated'));
                    App.addNotification('Bron yangilandi', 'success', 'booking');
                } else {
                    var created = await bookingService.createBooking(bookingData);
                    state.bookings.push(created);
                    Toast.success(Lang.t('booking_created'));
                    App.addNotification('Bron yaratildi', 'success', 'booking');
                }
                AppState.set(state);
                modal.hide();
                await App.hydrateRooms();
                App.renderBookings();
                App.renderDashboard();
            } catch (error) {
                if (error.data && error.data.error && error.data.error.errors) {
                    var errs = error.data.error.errors;
                    var msg = Object.keys(errs).map(function (k) {
                        var v = errs[k];
                        return Array.isArray(v) ? v.join(' ') : v;
                    }).join(' ');
                    Toast.error(msg || 'Xatolik yuz berdi');
                } else {
                    Toast.error(error.message || 'Xatolik yuz berdi');
                }
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = Lang.t('save');
            }
        });

        document.getElementById('bookingModal').addEventListener('hidden.bs.modal', function () {
            document.getElementById('bookingModal').remove();
        });
    },

    deleteBooking: function (id) {
        showConfirm('Bu bronni o\'chirmoqchimisiz?', async function () {
            try {
                await bookingService.deleteBooking(id);
                var state = AppState.get();
                state.bookings = state.bookings.filter(function (b) { return b.id !== id; });
                AppState.set(state);
                Toast.success(Lang.t('booking_deleted'));
                App.addNotification('Bron o\'chirildi', 'info', 'booking');
                await App.hydrateRooms();
                App.renderBookings();
                App.renderDashboard();
            } catch (error) {
                Toast.error(error.message || 'Xatolik yuz berdi');
            }
        });
    },

    // ===== PAYMENTS =====
    renderPayments: function () {
        var state = AppState.get();

        var totalRevenue = state.payments.reduce(function (s, p) { return s + (p.status === 'completed' ? Number(p.amount) : 0); }, 0);
        var todayStr = new Date().toISOString().split('T')[0];
        var todayRevenue = state.payments.filter(function (p) { return p.status === 'completed' && p.payment_date && p.payment_date.slice(0, 10) === todayStr; }).reduce(function (s, p) { return s + Number(p.amount); }, 0);

        var bookingsWithStatus = state.bookings.map(function (b) {
            var paymentStatus = getBookingPaymentStatus(b, state);
            return { ...b, paymentStatus: paymentStatus };
        });

        var outstanding = bookingsWithStatus.filter(function (b) {
            return b.status === 'checked_out' && b.paymentStatus.status !== 'Paid';
        });

        var filtered = state.payments;
        if (this.paymentFilter === 'paid') filtered = filtered.filter(function (p) { return p.status === 'completed'; });
        else if (this.paymentFilter === 'unpaid') filtered = filtered.filter(function (p) { return p.status === 'pending' || p.status === 'refunded' || p.status === 'failed'; });
        else if (this.paymentFilter === 'today') filtered = filtered.filter(function (p) { return p.payment_date && p.payment_date.slice(0, 10) === todayStr; });

        document.getElementById('page-payments').innerHTML =
            '<div class="page-header-row">' +
            '<h2 class="fw-light mb-0"><i class="fas fa-credit-card me-2"></i>' + Lang.t('nav_payments') + '</h2>' +
            '<button class="btn-glass btn-glass-primary" id="addPaymentBtn"><i class="fas fa-plus"></i> ' + Lang.t('add_payment') + '</button>' +
            '</div>' +
            '<div class="payment-filters-wrapper">' +
            '<div class="d-flex gap-2 mb-3 filter-row">' +
            '<button class="filter-btn payment-filter-btn ' + (this.paymentFilter === 'all' ? 'active' : '') + '" data-filter="all"><i class="fas fa-list"></i> ' + Lang.t('all') + '</button>' +
            '<button class="filter-btn payment-filter-btn ' + (this.paymentFilter === 'paid' ? 'active' : '') + '" data-filter="paid"><i class="fas fa-check" style="color:var(--color-success);"></i> ' + Lang.t('paid_payments') + '</button>' +
            '<button class="filter-btn payment-filter-btn ' + (this.paymentFilter === 'unpaid' ? 'active' : '') + '" data-filter="unpaid"><i class="fas fa-exclamation" style="color:var(--color-warning);"></i> ' + Lang.t('unpaid') + '</button>' +
            '<button class="filter-btn payment-filter-btn ' + (this.paymentFilter === 'today' ? 'active' : '') + '" data-filter="today"><i class="fas fa-calendar-day" style="color:var(--accent-1);"></i> ' + Lang.t('today_filter') + '</button>' +
            '</div>' +
            '</div>' +
            '<div class="dashboard-stats">' +
            '<div class="glass-card text-center stat-card-revenue" data-accent="emerald">' +
            '<div class="stat-icon-wrapper emerald"><i class="fas fa-dollar-sign stat-icon emerald"></i></div>' +
            '<h6 class="text-muted">' + Lang.t('total_revenue') + '</h6>' +
            '<div class="stat-value">' + formatCurrency(totalRevenue) + '</div>' +
            '</div>' +
            '<div class="glass-card text-center stat-card-today" data-accent="blue">' +
            '<div class="stat-icon-wrapper blue"><i class="fas fa-calendar-day stat-icon blue"></i></div>' +
            '<h6 class="text-muted">' + Lang.t('today_revenue') + '</h6>' +
            '<div class="stat-value">' + formatCurrency(todayRevenue) + '</div>' +
            '</div>' +
            '<div class="glass-card text-center stat-card-paid" data-accent="green">' +
            '<div class="stat-icon-wrapper green"><i class="fas fa-check-circle stat-icon green"></i></div>' +
            '<h6 class="text-muted">' + Lang.t('paid_payments') + '</h6>' +
            '<div class="stat-value">' + state.payments.filter(function (p) { return p.status === 'completed'; }).length + '</div>' +
            '</div>' +
            '<div class="glass-card text-center stat-card-outstanding" data-accent="red">' +
            '<div class="stat-icon-wrapper red"><i class="fas fa-exclamation-triangle stat-icon red"></i></div>' +
            '<h6 class="text-muted">' + Lang.t('outstanding') + '</h6>' +
            '<div class="stat-value" style="color:var(--color-danger);">' + outstanding.length + '</div>' +
            '</div>' +
            '</div>';

        if (outstanding.length > 0) {
            var outstandingHtml =
                '<div class="glass-card mb-3 outstanding-section">' +
                '<h6 class="text-muted"><i class="fas fa-exclamation-triangle" style="color:var(--color-danger);"></i> ' + Lang.t('outstanding') + ' (' + outstanding.length + ')</h6>';
            outstanding.forEach(function (b) {
                var c = state.customers.find(function (c) { return c.id === b.customer; });
                var r = state.rooms.find(function (r) { return r.id === b.room; });
                outstandingHtml +=
                    '<div class="outstanding-item d-flex justify-content-between align-items-center">' +
                    '<span>' + escapeHtml(c?.full_name || 'N/A') + ' - Xona ' + escapeHtml(r?.number || 'N/A') + '</span>' +
                    '<span class="due-amount">' + formatCurrency(b.paymentStatus.remaining) + '</span>' +
                    '<span class="badge-status ' + (b.paymentStatus.status === 'Paid' ? 'paid' : 'pending') + '">' + (b.paymentStatus.status === 'Paid' ? Lang.t('paid_payments') : Lang.t('unpaid')) + '</span>' +
                    '<button class="btn-glass btn-glass-sm payOutstanding" data-booking="' + escapeHtml(b.id) + '" data-amount="' + b.paymentStatus.remaining + '">' +
                    '<i class="fas fa-credit-card"></i> To\'lash' +
                    '</button>' +
                    '</div>';
            });
            outstandingHtml += '</div>';
            document.getElementById('page-payments').innerHTML += outstandingHtml;
        }

        var statusLabelMap = { 'pending': 'Kutilmoqda', 'completed': 'To\'landi', 'failed': 'Muvaffaqiyatsiz', 'refunded': 'Qaytarilgan' };

        document.getElementById('page-payments').innerHTML +=
            '<div id="paymentTableContainer" class="table-responsive glass-card">' +
            '<table class="table table-to-cards">' +
            '<thead><tr><th>' + Lang.t('booking') + '</th><th>' + Lang.t('customer') + '</th><th>' + Lang.t('room') + '</th><th>' + Lang.t('amount') + '</th><th>' + Lang.t('method') + '</th><th>' + Lang.t('status') + '</th><th>' + Lang.t('actions') + '</th></tr></thead>' +
            '<tbody>' +
            (filtered.length === 0 ? '<tr><td colspan="9" class="text-center text-muted">' + Lang.t('no_data') + '</td></tr>' :
                filtered.map(function (p, i) {
                    var b = state.bookings.find(function (b) { return b.id === p.booking; });
                    var r = b ? state.rooms.find(function (r) { return r.id === b.room; }) : null;
                    var c = b ? state.customers.find(function (c) { return c.id === b.customer; }) : null;
                    var payId = 'PAY-' + String(i + 1).padStart(3, '0');
                    var actions = '<button class="btn-glass btn-glass-sm editPay" data-id="' + escapeHtml(p.id) + '"><i class="fas fa-edit"></i></button>';
                    if (p.status === 'completed') {
                        actions += '<button class="btn-glass btn-glass-sm refundPay" data-id="' + escapeHtml(p.id) + '" title="Refund"><i class="fas fa-undo"></i></button>';
                    }
                    actions += '<button class="btn-glass btn-glass-sm deletePay" data-id="' + escapeHtml(p.id) + '"><i class="fas fa-trash"></i></button>';
                    return '<tr>' +
                        '<td data-label="' + Lang.t('booking') + '">' + payId + '</td>' +
                        '<td data-label="' + Lang.t('customer') + '">' + escapeHtml(c ? c.full_name : 'N/A') + '</td>' +
                        '<td data-label="' + Lang.t('room') + '">' + (r ? '#' + escapeHtml(r.number) : 'N/A') + '</td>' +
                        '<td data-label="' + Lang.t('amount') + '">' + formatCurrency(p.amount) + '</td>' +
                                                '<td data-label="' + Lang.t('method') + '">' + escapeHtml(paymentMethodI18n(p.method)) + '</td>' +
                        '<td data-label="' + Lang.t('status') + '"><span class="badge-status ' + getStatusKey(p.status) + '">' + escapeHtml(paymentStatusI18n(p.status)) + '</span></td>' +'<td data-label="' + Lang.t('actions') + '">' + actions + '</td>' +
                        '</tr>';
                }).join('')) +
            '</tbody>' +
            '</table>' +
            '</div>' +
            '<div class="mt-3 glass-card"><h5 class="fw-light">' + Lang.t('revenue_summary') + '</h5><div class="chart-container chart-container-sm"><canvas id="paymentChart"></canvas></div></div>';

        document.querySelectorAll('.payOutstanding').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var bookingId = this.dataset.booking;
                var amount = this.dataset.amount;
                App.openPaymentModal(null, bookingId, parseFloat(amount));
            });
        });

        document.querySelectorAll('.payment-filter-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                App.paymentFilter = this.dataset.filter;
                App.renderPayments();
            });
        });

        document.getElementById('addPaymentBtn')?.addEventListener('click', function () { App.openPaymentModal(); });
        document.querySelectorAll('.editPay').forEach(function (btn) { btn.addEventListener('click', function () { App.openPaymentModal(this.dataset.id); }); });
        document.querySelectorAll('.deletePay').forEach(function (btn) { btn.addEventListener('click', function () { App.deletePayment(this.dataset.id); }); });
        document.querySelectorAll('.refundPay').forEach(function (btn) { btn.addEventListener('click', function () { App.refundPaymentAction(this.dataset.id); }); });

        var ctx = document.getElementById('paymentChart')?.getContext('2d');
        if (ctx) {
            if (this.charts.payment) this.charts.payment.destroy();
            var isDark = Theme.current === 'dark';
            var chartTextColor = isDark ? '#CBD5E1' : '#334155';
            var chartGridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
            this.charts.payment = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: state.payments.map(function (_, i) { return 'PAY-' + String(i + 1).padStart(3, '0'); }),
                    datasets: [{
                        label: 'To\'lovlar',
                        data: state.payments.map(function (p) { return Number(p.amount); }),
                        borderColor: '#5B5FFF',
                        backgroundColor: 'rgba(91,95,255,0.10)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: {
                                color: chartTextColor,
                                font: { size: 12 }
                            }
                        }
                    },
                    scales: {
                        y: {
                            grid: { color: chartGridColor },
                            ticks: { color: chartTextColor }
                        },
                        x: {
                            grid: { color: 'transparent' },
                            ticks: { color: chartTextColor }
                        }
                    }
                }
            });
        }
    },

    refundPaymentAction: function (id) {
        showConfirm('Bu to\'lovni qaytarmoqchimisiz (refund)?', async function () {
            try {
                var updated = await paymentService.refundPayment(id);
                var state = AppState.get();
                var idx = state.payments.findIndex(function (p) { return p.id === id; });
                if (idx > -1 && updated) state.payments[idx] = { ...state.payments[idx], ...updated };
                AppState.set(state);
                Toast.success('To\'lov qaytarildi');
                App.addNotification('To\'lov refund qilindi', 'info', 'payment');
                App.renderPayments();
                App.renderDashboard();
            } catch (error) {
                Toast.error(error.message || 'Refund amalga oshmadi');
            }
        }, false);
    },

    openPaymentModal: function (id, bookingId, amount) {
        if (id === undefined) id = null;
        if (bookingId === undefined) bookingId = null;
        if (amount === undefined) amount = null;

        var state = AppState.get();
        var payment = id ? state.payments.find(function (p) { return p.id === id; }) : null;
        var booking = bookingId ? state.bookings.find(function (b) { return b.id === bookingId; }) : (payment ? state.bookings.find(function (b) { return b.id === payment.booking; }) : null);

        var oldModal = document.getElementById('paymentModal');
        if (oldModal) oldModal.remove();

        var defaultAmount = amount || payment?.amount || '';
        var defaultMethod = payment?.method || 'cash';
        var defaultStatus = payment?.status || 'pending';
        var isCompleted = payment && payment.status === 'completed';

        var allBookings = state.bookings.map(function (b) {
            var c = state.customers.find(function (c) { return c.id === b.customer; });
            var r = state.rooms.find(function (r) { return r.id === b.room; });
            return {
                ...b,
                customerName: c ? (c.full_name || c.phone || 'Mijoz') : 'Mijoz',
                roomNumber: r ? r.number : '—'
            };
        });

        var modalHtml =
            '<div class="modal fade" id="paymentModal" tabindex="-1" role="dialog" aria-modal="true" aria-label="' + (payment ? 'To\'lovni tahrirlash' : 'To\'lov qo\'shish') + '">' +
            '<div class="modal-dialog modal-dialog-centered">' +
            '<div class="modal-content glass">' +
            '<div class="modal-header">' +
            '<h5 class="modal-title">' + (payment ? 'To\'lovni tahrirlash' : 'To\'lov qo\'shish') + '</h5>' +
            '<button type="button" class="btn-close" data-bs-dismiss="modal"></button>' +
            '</div>' +
            '<div class="modal-body">' +
            (isCompleted ? '<div class="alert alert-warning" style="font-size:0.85rem;">Bu to\'lov "completed" holatida — asosiy maydonlarni o\'zgartirib bo\'lmaydi. Bekor qilish uchun Refund tugmasidan foydalaning.</div>' : '') +
            '<form id="paymentForm" novalidate>' +
            '<input type="hidden" id="payId" value="' + escapeHtml(payment?.id || '') + '">' +
            '<input type="hidden" id="payBookingHidden" value="' + escapeHtml(booking?.id || '') + '">' +
            '<div class="mb-3">' +
            '<label class="form-label">' + Lang.t('booking') + '</label>';
        if (bookingId || isCompleted) {
            var b = state.bookings.find(function (b) { return b.id === (bookingId || booking?.id); });
            var c = b ? state.customers.find(function (c) { return c.id === b.customer; }) : null;
            var r = b ? state.rooms.find(function (r) { return r.id === b.room; }) : null;
            modalHtml += '<div id="payBookingLabel" class="form-control" style="border-radius:var(--radius-full);background:var(--input-bg);padding:0.6rem 1.2rem;">' + escapeHtml(c ? c.full_name : 'N/A') + ' - Xona ' + escapeHtml(r ? r.number : 'N/A') + '</div>';
            modalHtml += '<input type="hidden" id="payBooking" value="' + escapeHtml(b ? b.id : '') + '">';
        } else {
            modalHtml +=
                '<select id="payBooking" class="form-select" required>' +
                '<option value="">' + Lang.t('select_booking') + '</option>' +
                            allBookings.map(function (b) {
                var isRelevant = b.status === 'checked_in' || b.status === 'pending' || b.status === 'checked_out';
                var isCurrent = payment && b.id === payment.booking;
                if (!isRelevant && !isCurrent) return '';
                var _n = 0;
                try { _n = Math.max(0, Math.round((new Date(b.checkout) - new Date(b.checkin)) / 86400000)); } catch (e) {}
                var _ref = b.reference || ('#' + String(b.id).slice(0, 8));
                var _total = b.total_price ? formatCurrency(b.total_price) : '—';
                var label = _ref + ' — ' + b.customerName + ' — Xona ' + b.roomNumber +
                            ' — ' + _n + ' ' + Lang.t('nights') + ' — ' + _total;
                return '<option value="' + escapeHtml(b.id) + '" ' + (booking?.id === b.id || payment?.booking === b.id ? 'selected' : '') + '>' + escapeHtml(label) + '</option>';
            }).join('') +
                '</select>';
        }
        modalHtml +=
            '</div>' +
            '<div class="mb-3">' +
            '<label class="form-label">' + Lang.t('amount') + ' (USD)</label>' +
            '<input id="payAmount" type="number" step="0.01" class="form-control" value="' + escapeHtml(defaultAmount) + '" placeholder="' + Lang.t('enter_amount') + '" ' + (isCompleted ? 'disabled' : '') + ' required>' +
            '</div>' +
            '<div class="mb-3">' +
            '<label class="form-label">' + Lang.t('method') + '</label>' +
            '<select id="payMethod" class="form-select" ' + (isCompleted ? 'disabled' : '') + '>' +
            '<option value="cash" ' + (defaultMethod === 'cash' ? 'selected' : '') + '>Cash</option>' +
            '<option value="card" ' + (defaultMethod === 'card' ? 'selected' : '') + '>Card</option>' +
            '<option value="bank_transfer" ' + (defaultMethod === 'bank_transfer' ? 'selected' : '') + '>Bank Transfer</option>' +
            '<option value="online" ' + (defaultMethod === 'online' ? 'selected' : '') + '>Online</option>' +
            '</select>' +
            '</div>' +
            '<div class="mb-3">' +
            '<label class="form-label">' + Lang.t('status') + '</label>' +
            '<select id="payStatus" class="form-select" ' + (isCompleted ? 'disabled' : '') + '>' +
                        '<option value="pending" ' + (defaultStatus === 'pending' ? 'selected' : '') + '>' + paymentStatusI18n('pending') + '</option>' +
            '<option value="completed" ' + (defaultStatus === 'completed' ? 'selected' : '') + '>' + paymentStatusI18n('completed') + '</option>' +
            '<option value="failed" ' + (defaultStatus === 'failed' ? 'selected' : '') + '>' + paymentStatusI18n('failed') + '</option>' +'</select>' +
            '</div>' +
            '</form>' +
            '</div>' +
            '<div class="modal-footer">' +
            '<button class="btn-glass" data-bs-dismiss="modal">' + Lang.t('cancel') + '</button>' +
            '<button class="btn-glass btn-glass-primary" id="savePaymentBtn">' + Lang.t('save') + '</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';

        document.getElementById('modal-container').insertAdjacentHTML('beforeend', modalHtml);
        var modal = new bootstrap.Modal(document.getElementById('paymentModal'), { backdrop: 'static', keyboard: true });
        modal.show();

        document.getElementById('savePaymentBtn').addEventListener('click', async function () {
            var id = document.getElementById('payId').value;
            var bookingId = document.getElementById('payBookingHidden').value || document.getElementById('payBooking').value;
            var amount = parseFloat(document.getElementById('payAmount').value);
            var method = document.getElementById('payMethod').value;
            var status = document.getElementById('payStatus').value;

            if (!bookingId || !amount || amount <= 0) { Toast.warning(Lang.t('required_field')); return; }

            // Muhim: overpayment va completed-payment immutability
            // qoidalari backendda (PaymentCreateUpdateSerializer) authority
            // sifatida tekshiriladi — bu yerda faqat backend javobi kutiladi.
            var payData = { booking: bookingId, amount: amount, method: method, status: status, currency: 'USD' };

            var submitBtn = document.getElementById('savePaymentBtn');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saqlanmoqda...';

            try {
                var state = AppState.get();
                if (id) {
                    var updated = await paymentService.updatePayment(id, payData);
                    var idx = state.payments.findIndex(function (p) { return p.id === id; });
                    if (idx > -1) { state.payments[idx] = updated; }
                    Toast.success(Lang.t('payment_updated'));
                    App.addNotification('To\'lov yangilandi', 'success', 'payment');
                } else {
                    var created = await paymentService.createPayment(payData);
                    state.payments.push(created);
                    Toast.success(Lang.t('payment_added'));
                    App.addNotification('To\'lov qo\'shildi', 'success', 'payment');
                }
                AppState.set(state);
                modal.hide();
                App.renderPayments();
                App.renderDashboard();
            } catch (error) {
                if (error.data && error.data.error && error.data.error.errors) {
                    var errs = error.data.error.errors;
                    var msg = Object.keys(errs).map(function (k) {
                        var v = errs[k];
                        return Array.isArray(v) ? v.join(' ') : v;
                    }).join(' ');
                    Toast.error(msg || 'Xatolik yuz berdi');
                } else {
                    Toast.error(error.message || 'Xatolik yuz berdi');
                }
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = Lang.t('save');
            }
        });

        document.getElementById('paymentModal').addEventListener('hidden.bs.modal', function () {
            document.getElementById('paymentModal').remove();
        });
    },

    deletePayment: function (id) {
        showConfirm('Bu to\'lovni o\'chirmoqchimisiz?', async function () {
            try {
                await paymentService.deletePayment(id);
                var state = AppState.get();
                state.payments = state.payments.filter(function (p) { return p.id !== id; });
                AppState.set(state);
                Toast.success(Lang.t('payment_deleted'));
                App.addNotification('To\'lov o\'chirildi', 'info', 'payment');
                App.renderPayments();
                App.renderDashboard();
            } catch (error) {
                Toast.error(error.message || 'Xatolik yuz berdi');
            }
        });
    },

    // ===== REPORTS =====
    renderReports: function () {
        var state = AppState.get();
        var totalRooms = state.rooms.length;
        var totalCustomers = state.customers.length;
        var booked = state.rooms.filter(function (r) { return r.status === 'booked' || r.status === 'occupied'; }).length;
        var occupancy = totalRooms > 0 ? Math.round((booked / totalRooms) * 100) : 0;

        var history = JSON.parse(localStorage.getItem('hms_history') || '[]');

        // Sana filtri: agar tanlangan bo'lsa, faqat shu oraliqdagi checkin
        // sanasiga ega bookinglar va shu oraliqdagi payment_date'ga ega
        // to'lovlar hisoblanadi. Tanlanmagan bo'lsa - barcha vaqt (all-time).
        var dateFrom = this.reportDateFrom || '';
        var dateTo = this.reportDateTo || '';

        var filteredBookings = state.bookings.filter(function (b) {
            if (dateFrom && b.checkin < dateFrom) return false;
            if (dateTo && b.checkin > dateTo) return false;
            return true;
        });
        var filteredPayments = state.payments.filter(function (p) {
            var d = p.payment_date ? p.payment_date.slice(0, 10) : '';
            if (dateFrom && d < dateFrom) return false;
            if (dateTo && d > dateTo) return false;
            return true;
        });

        var totalBookings = filteredBookings.length;
        var totalRevenue = filteredPayments.reduce(function (sum, p) { return sum + (p.status === 'completed' ? Number(p.amount) : 0); }, 0);
        var paidPaymentsCount = filteredPayments.filter(function (p) { return p.status === 'completed'; }).length;
        var paidPaymentsAmount = filteredPayments
            .filter(function (p) { return p.status === 'completed'; })
            .reduce(function (s, p) { return s + Number(p.amount || 0); }, 0);
        var paidPayments = paidPaymentsCount;

        var statusCounts = { pending: 0, checked_in: 0, checked_out: 0, cancelled: 0, no_show: 0 };
        filteredBookings.forEach(function (b) { if (statusCounts[b.status] !== undefined) statusCounts[b.status]++; });

        document.getElementById('page-reports').innerHTML =
            '<div class="mb-3">' +
            '<h2 class="fw-light mb-2"><i class="fas fa-file-alt me-2"></i>' + Lang.t('nav_reports') + '</h2>' +
            '<div class="d-flex gap-2 flex-wrap" style="width:100%;">' +
            '<button class="btn-glass btn-glass-primary" id="pdfReportBtn" style="flex:1;min-width:80px;">' +
            '<i class="fas fa-file-pdf"></i> ' + Lang.t('pdf_export') +
            '</button>' +
            '<button class="btn-glass btn-glass-primary" id="excelReportBtn" style="flex:1;min-width:80px;">' +
            '<i class="fas fa-file-excel"></i> ' + Lang.t('excel_export') +
            '</button>' +
            '<button class="btn-glass btn-glass-primary" id="printReportBtn" style="flex:1;min-width:80px;">' +
            '<i class="fas fa-print"></i> ' + Lang.t('print') +
            '</button>' +
            '</div>' +
            '</div>' +

            '<div class="glass-card mb-3 report-date-filter">' +
            '<div class="d-flex gap-2 flex-wrap align-items-end">' +
            '<div><label class="form-label mb-1" style="font-size:0.8rem;">Dan</label><input type="date" id="reportDateFrom" class="form-control" value="' + escapeHtml(dateFrom) + '"></div>' +
            '<div><label class="form-label mb-1" style="font-size:0.8rem;">Gacha</label><input type="date" id="reportDateTo" class="form-control" value="' + escapeHtml(dateTo) + '"></div>' +
            '<button class="btn-glass btn-glass-primary" id="applyReportFilter"><i class="fas fa-filter"></i> Filtrlash</button>' +
            (dateFrom || dateTo ? '<button class="btn-glass" id="clearReportFilter"><i class="fas fa-times"></i> Tozalash</button>' : '') +
            '</div>' +
            (dateFrom || dateTo ? '<p class="text-muted mt-2 mb-0" style="font-size:0.8rem;">Bronlar va to\'lovlar shu sana oralig\'i bo\'yicha filtrlangan. Xonalar/mijozlar/bandlik darajasi har doim joriy holatni ko\'rsatadi.</p>' : '') +
            '</div>' +

            '<div class="dashboard-stats">' +
            '<div class="glass-card text-center" data-accent="blue"><div class="stat-value">' + totalRooms + '</div><div class="stat-label">' + Lang.t('total_rooms_metric') + '</div></div>' +
            '<div class="glass-card text-center" data-accent="purple"><div class="stat-value">' + totalCustomers + '</div><div class="stat-label">' + Lang.t('customers_metric') + '</div></div>' +
            '<div class="glass-card text-center" data-accent="green"><div class="stat-value">' + totalBookings + '</div><div class="stat-label">' + Lang.t('bookings_metric') + '</div></div>' +
            '<div class="glass-card text-center" data-accent="emerald"><div class="stat-value">' + formatCurrency(totalRevenue) + '</div><div class="stat-label">' + Lang.t('revenue_metric') + '</div></div>' +
            '</div>' +
            '<div class="dashboard-stats">' +
            '<div class="glass-card text-center" data-accent="green"><div class="stat-value">' + formatCurrency(paidPaymentsAmount) + '</div><div class="stat-label">' + Lang.t('paid_payments_metric') + ' (' + paidPaymentsCount + ')</div></div>' +
            '<div class="glass-card text-center" data-accent="yellow"><div class="stat-value">' + occupancy + '%</div><div class="stat-label">' + Lang.t('occupancy_metric') + '</div></div>' +
            '</div>' +

            '<div class="glass-card mb-3">' +
            '<h6 class="fw-light mb-3">Bronlar holati bo\'yicha taqsimot' + (dateFrom || dateTo ? ' (tanlangan oraliqda)' : ' (barcha vaqt)') + '</h6>' +
            '<div class="dashboard-stats">' +
            '<div class="glass-card text-center" data-accent="blue"><div class="stat-value">' + statusCounts.pending + '</div><div class="stat-label">Kutilmoqda</div></div>' +
            '<div class="glass-card text-center" data-accent="green"><div class="stat-value">' + statusCounts.checked_in + '</div><div class="stat-label">Faol (Checked-in)</div></div>' +
            '<div class="glass-card text-center" data-accent="purple"><div class="stat-value">' + statusCounts.checked_out + '</div><div class="stat-label">Tugagan (Checked-out)</div></div>' +
            '<div class="glass-card text-center" data-accent="red"><div class="stat-value">' + statusCounts.cancelled + '</div><div class="stat-label">Bekor qilingan</div></div>' +
            '</div>' +
            '</div>' +

            '<div class="row g-3">' +
            '<div class="col-md-4"><div class="glass-card"><h6 class="fw-light">' + Lang.t('room_list') + '</h6><div class="table-responsive" style="max-height:200px;overflow-y:auto;">' +
            '<table class="table table-sm"><thead><tr><th>#</th><th>' + Lang.t('type') + '</th><th>' + Lang.t('status') + '</th></tr></thead><tbody>' +
            (state.rooms.length === 0 ? '<tr><td colspan="3" class="text-muted">' + Lang.t('no_data') + '</td></tr>' :
                state.rooms.map(function (r) {
                    return '<tr><td>' + escapeHtml(r.number) + '</td><td>' + escapeHtml(r.room_type) + '</td><td><span class="badge-status ' + getStatusKey(r.status) + '">' + escapeHtml(roomStatusLabel(r.status)) + '</span></td></tr>';
                }).join('')) +
            '</tbody></table></div></div></div>' +

            '<div class="col-md-4"><div class="glass-card"><h6 class="fw-light">' + Lang.t('booking_list') + (dateFrom || dateTo ? ' (filtrlangan)' : '') + '</h6><div class="table-responsive" style="max-height:200px;overflow-y:auto;">' +
            '<table class="table table-sm"><thead><tr><th>' + Lang.t('customer') + '</th><th>' + Lang.t('status') + '</th></tr></thead><tbody>' +
            (filteredBookings.length === 0 ? '<tr><td colspan="2" class="text-muted">' + Lang.t('no_data') + '</td></tr>' :
                filteredBookings.slice(-10).reverse().map(function (b) {
                    var c = state.customers.find(function (c) { return c.id === b.customer; });
                    return '<tr><td>' + escapeHtml(c ? c.full_name : 'N/A') + '</td><td><span class="badge-status ' + getStatusKey(b.status) + '">' + escapeHtml(roomStatusLabel(b.status)) + '</span></td></tr>';
                }).join('')) +
            '</tbody></table></div></div></div>' +

            '<div class="col-md-4"><div class="glass-card"><h6 class="fw-light">' + Lang.t('payment_list') + (dateFrom || dateTo ? ' (filtrlangan)' : '') + '</h6><div class="table-responsive" style="max-height:200px;overflow-y:auto;">' +
            '<table class="table table-sm"><thead><tr><th>' + Lang.t('amount') + '</th><th>' + Lang.t('status') + '</th></tr></thead><tbody>' +
            (filteredPayments.length === 0 ? '<tr><td colspan="2" class="text-muted">' + Lang.t('no_data') + '</td></tr>' :
                filteredPayments.slice(-10).reverse().map(function (p) {
                    return '<tr><td>' + formatCurrency(p.amount) + '</td><td><span class="badge-status ' + getStatusKey(p.status) + '">' + escapeHtml(roomStatusLabel(p.status)) + '</span></td></tr>';
                }).join('')) +
            '</tbody></table></div></div></div>' +
            '</div>' +

            (history.length > 0 ? '<div class="history-section glass-card mt-3"><h6 class="fw-light mb-2" id="historyTitle"><i class="fas fa-history me-2"></i>' + Lang.t('history') + ' (' + history.length + ')</h6>' +
                '<div class="table-responsive" style="max-height:300px;overflow-y:auto;">' +
                '<table class="table table-sm"><thead><tr><th>' + Lang.t('customer') + '</th><th>' + Lang.t('room') + '</th><th>' + Lang.t('checkin') + '</th><th>' + Lang.t('checkout') + '</th><th>' + Lang.t('status') + '</th><th>' + Lang.t('removed_at') + '</th></tr></thead><tbody>' +
                history.slice(-20).reverse().map(function (h) {
                    var b = h.booking;
                    var c = state.customers.find(function (c) { return c.id === b.customer; });
                    var r = state.rooms.find(function (r) { return r.id === b.room; });
                    return '<tr><td>' + escapeHtml(c ? c.full_name : 'N/A') + '</td><td>' + (r ? '#' + escapeHtml(r.number) : 'N/A') + '</td><td>' + escapeHtml(b.checkin) + '</td><td>' + escapeHtml(b.checkout) + '</td><td><span class="badge-status ' + getStatusKey(b.status) + '">' + escapeHtml(roomStatusLabel(b.status)) + '</span></td><td>' + new Date(h.removedAt).toLocaleDateString() + '</td></tr>';
                }).join('') +
                '</tbody></table></div></div>' : '') +

            (history.length > 0 ? '<button class="btn-glass btn-glass-primary mt-2" id="exportHistoryBtn"><i class="fas fa-file-pdf"></i> Tarixni PDF qilib yuklab olish</button>' : '');

        document.getElementById('pdfReportBtn').addEventListener('click', function () { App.exportPDFReport(); });
        document.getElementById('excelReportBtn').addEventListener('click', function () { App.exportExcelReport(); });
        document.getElementById('printReportBtn').addEventListener('click', function () { window.print(); });
        document.getElementById('exportHistoryBtn')?.addEventListener('click', function () { App.exportHistoryPDF(); });

        document.getElementById('applyReportFilter').addEventListener('click', function () {
            App.reportDateFrom = document.getElementById('reportDateFrom').value;
            App.reportDateTo = document.getElementById('reportDateTo').value;
            App.renderReports();
        });
        document.getElementById('clearReportFilter')?.addEventListener('click', function () {
            App.reportDateFrom = '';
            App.reportDateTo = '';
            App.renderReports();
        });
    },

    exportPDFReport: function () {
        var state = AppState.get();
        var totalRooms = state.rooms.length;
        var totalCustomers = state.customers.length;
        var totalBookings = state.bookings.length;
        var totalRevenue = state.payments.reduce(function (sum, p) { return sum + (p.status === 'completed' ? Number(p.amount) : 0); }, 0);
        var paidPayments = state.payments.filter(function (p) { return p.status === 'completed'; }).length;
        var booked = state.rooms.filter(function (r) { return r.status === 'booked' || r.status === 'occupied'; }).length;
        var occupancy = totalRooms > 0 ? Math.round((booked / totalRooms) * 100) : 0;

        var doc = new jspdf.jsPDF();
        doc.text('Mehmonxona Hisoboti', 20, 20);
        doc.text('Yaratilgan: ' + new Date().toLocaleString(), 20, 30);

        doc.autoTable({
            startY: 40,
            head: [['Ko\'rsatkich', 'Qiymat']],
            body: [
                ['Jami Xonalar', totalRooms],
                ['Mijozlar', totalCustomers],
                ['Bronlar', totalBookings],
                ['Jami Daromad', formatCurrency(totalRevenue)],
                ["To'langan To'lovlar", paidPayments],
                ['Bandlik Darajasi', occupancy + '%']
            ],
            theme: 'grid',
            styles: { fontSize: 10 }
        });

        var finalY = doc.lastAutoTable.finalY + 10;

        doc.text('Xonalar ro\'yxati', 20, finalY);
        doc.autoTable({
            startY: finalY + 5,
            head: [['Raqam', 'Tur', 'Narx', 'Holat']],
            body: state.rooms.map(function (r) { return [r.number, r.room_type, '$' + r.price_per_night, roomStatusLabel(r.status)]; }),
            theme: 'grid',
            styles: { fontSize: 9 }
        });

        finalY = doc.lastAutoTable.finalY + 10;
        if (finalY > 270) { doc.addPage(); finalY = 20; }

        doc.text('Bronlar ro\'yxati', 20, finalY);
        doc.autoTable({
            startY: finalY + 5,
            head: [['Mijoz', 'Xona', 'Kirish', 'Chiqish', 'Holat']],
            body: state.bookings.slice(0, 15).map(function (b) {
                var c = state.customers.find(function (c) { return c.id === b.customer; });
                var r = state.rooms.find(function (r) { return r.id === b.room; });
                return [c ? c.full_name : 'N/A', r ? r.number : 'N/A', b.checkin, b.checkout, roomStatusLabel(b.status)];
            }),
            theme: 'grid',
            styles: { fontSize: 9 }
        });

        finalY = doc.lastAutoTable.finalY + 10;
        if (finalY > 270) { doc.addPage(); finalY = 20; }

        doc.text('To\'lovlar ro\'yxati', 20, finalY);
        doc.autoTable({
            startY: finalY + 5,
            head: [['Bron', 'Miqdor', 'Usul', 'Holat', 'Sana']],
            body: state.payments.slice(0, 15).map(function (p) {
                var b = state.bookings.find(function (b) { return b.id === p.booking; });
                return [b ? (b.reference || b.id) : 'N/A', '$' + p.amount, roomStatusLabel(p.method), roomStatusLabel(p.status), p.payment_date ? p.payment_date.slice(0, 10) : ''];
            }),
            theme: 'grid',
            styles: { fontSize: 9 }
        });

        doc.save('hms_report.pdf');
        Toast.success('PDF eksport qilindi');
    },

    exportHistoryPDF: function () {
        var history = JSON.parse(localStorage.getItem('hms_history') || '[]');
        if (history.length === 0) { Toast.warning('Tarix mavjud emas'); return; }
        var doc = new jspdf.jsPDF();
        doc.text('Mehmonxona Tarix Hisoboti', 20, 20);
        doc.text('Yaratilgan: ' + new Date().toLocaleString(), 20, 30);

        var body = history.slice(-50).reverse().map(function (h) {
            var b = h.booking;
            var c = AppState.get().customers.find(function (c) { return c.id === b.customerId; });
            var r = AppState.get().rooms.find(function (r) { return r.id === b.roomId; });
            return [c ? c.name : 'N/A', r ? r.number : 'N/A', b.checkin, b.checkout, b.status, new Date(h.removedAt).toLocaleDateString()];
        });

        doc.autoTable({
            startY: 40,
            head: [['Mijoz', 'Xona', 'Kirish', 'Chiqish', 'Holat', 'O\'chirilgan']],
            body: body,
            theme: 'grid',
            styles: { fontSize: 9 }
        });

        doc.save('hms_history.pdf');
        Toast.success('Tarix PDF eksport qilindi');
    },

    exportExcelReport: function () {
        var state = AppState.get();
        var data = [
            ['Mehmonxona Hisoboti'],
            ['Yaratilgan', new Date().toLocaleString()],
            [],
            ['Ko\'rsatkich', 'Qiymat'],
            ['Jami Xonalar', state.rooms.length],
            ['Mijozlar', state.customers.length],
            ['Bronlar', state.bookings.length],
            ['Jami Daromad', formatCurrency(state.payments.reduce(function (s, p) { return s + (p.status === 'completed' ? Number(p.amount) : 0); }, 0))],
            ["To'langan To'lovlar", state.payments.filter(function (p) { return p.status === 'completed'; }).length],
            ['Bandlik Darajasi', Math.round((state.rooms.filter(function (r) { return r.status === 'booked' || r.status === 'occupied'; }).length / (state.rooms.length || 1)) * 100) + '%'],
            [],
            ['Xonalar'],
            ['Raqam', 'Tur', 'Narx', 'Holat'],
            ...state.rooms.map(function (r) { return [r.number, r.room_type, r.price_per_night, roomStatusLabel(r.status)]; }),
            [],
            ['Bronlar'],
            ['Mijoz', 'Xona', 'Kirish', 'Chiqish', 'Holat'],
            ...state.bookings.map(function (b) {
                var c = state.customers.find(function (c) { return c.id === b.customer; });
                var r = state.rooms.find(function (r) { return r.id === b.room; });
                return [c ? c.full_name : 'N/A', r ? r.number : 'N/A', b.checkin, b.checkout, roomStatusLabel(b.status)];
            }),
            [],
            ['To\'lovlar'],
            ['Bron', 'Miqdor', 'Usul', 'Holat', 'Sana'],
            ...state.payments.map(function (p) {
                var b = state.bookings.find(function (b) { return b.id === p.booking; });
                return [b ? (b.reference || b.id) : 'N/A', p.amount, roomStatusLabel(p.method), roomStatusLabel(p.status), p.payment_date ? p.payment_date.slice(0, 10) : ''];
            })
        ];

        var wb = XLSX.utils.book_new();
        var ws = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'Hisobot');
        XLSX.writeFile(wb, 'hms_report.xlsx');
        Toast.success('Excel eksport qilindi');
    },

    // ===== PROFILE =====
    renderProfile: function () {
        document.getElementById('page-profile').innerHTML =
            '<div class="glass-card text-center" style="max-width:800px;margin:0 auto;">' +
            '<i class="fas fa-spinner fa-spin" style="font-size:1.5rem;"></i> Yuklanmoqda...' +
            '</div>';

        authProfileService.getMe().then(function (user) {
            App.currentUser = user;
            App._renderProfileForm(user);
        }).catch(function (error) {
            document.getElementById('page-profile').innerHTML =
                '<div class="glass-card text-center" style="max-width:800px;margin:0 auto;">' +
                '<p class="text-danger">Profil ma\'lumotlarini yuklab bo\'lmadi: ' + escapeHtml(error.message || 'Xatolik') + '</p>' +
                '<button class="btn-glass btn-glass-primary" id="retryProfileBtn">Qayta urinish</button>' +
                '</div>';
            document.getElementById('retryProfileBtn')?.addEventListener('click', function () { App.renderProfile(); });
        });
    },

    _renderProfileForm: function (user) {
        document.getElementById('page-profile').innerHTML =
            '<div class="glass-card" style="max-width:800px;margin:0 auto;">' +
            '<div class="text-center mb-4">' +
            '<div class="avatar-upload" id="avatarUpload">' +
            '<i class="fas fa-user-circle" style="font-size:3rem;"></i>' +
            '<input type="file" accept="image/*" id="avatarInput">' +
            '</div>' +
            '<h5 class="fw-light mt-3">' + escapeHtml(user.full_name || user.username) + '</h5>' +
            '<p class="text-muted">' + escapeHtml(user.email) + ' &middot; ' + escapeHtml(roomStatusLabel(user.role)) + '</p>' +
            '</div>' +

            '<form id="profileForm" novalidate>' +
            '<div class="mb-3">' +
            '<label class="form-label">' + Lang.t('name') + '</label>' +
            '<input id="profileName" class="form-control" value="' + escapeHtml(user.full_name || '') + '" placeholder="' + Lang.t('enter_name') + '">' +
            '</div>' +
            '<div class="mb-3">' +
            '<label class="form-label">Email</label>' +
            '<input id="profileEmail" type="email" class="form-control" value="' + escapeHtml(user.email || '') + '" placeholder="' + Lang.t('enter_email') + '">' +
            '</div>' +
            '<div class="mb-3">' +
            '<label class="form-label">' + Lang.t('phone') + '</label>' +
            '<input id="profilePhone" class="form-control" value="' + escapeHtml(user.phone || '') + '" placeholder="' + Lang.t('enter_phone') + '">' +
            '</div>' +
            '<button type="submit" class="btn-glass btn-glass-primary w-100" id="profileSaveBtn">' +
            '<i class="fas fa-save"></i> ' + Lang.t('update_profile') +
            '</button>' +
            '</form>' +

            '<hr>' +
            '<form id="passwordForm" novalidate>' +
            '<div class="mb-3">' +
            '<label class="form-label">Joriy parol</label>' +
            '<input id="currentPassword" type="password" class="form-control" placeholder="Joriy parolingiz">' +
            '</div>' +
            '<div class="mb-3">' +
            '<label class="form-label">' + Lang.t('new_password') + '</label>' +
            '<input id="profilePassword" type="password" class="form-control" placeholder="' + Lang.t('enter_password') + '">' +
            '</div>' +
            '<button type="submit" class="btn-glass w-100" id="passwordSaveBtn">' +
            '<i class="fas fa-key"></i> Parolni yangilash' +
            '</button>' +
            '</form>' +

            '<div class="logout-setting-btn">' +
            '<button class="btn-glass btn-glass-danger" id="logoutSettingsBtn"><i class="fas fa-sign-out-alt"></i> <span data-i18n="logout">Chiqish</span></button>' +
            '</div>' +
            '</div>';

        document.getElementById('avatarInput').addEventListener('change', function (e) {
            if (e.target.files.length > 0) {
                var reader = new FileReader();
                reader.onload = function (ev) {
                    var img = document.querySelector('#avatarUpload img') || document.createElement('img');
                    if (!img.parentNode) document.getElementById('avatarUpload').appendChild(img);
                    img.src = ev.target.result;
                    img.style.width = '100%';
                    img.style.height = '100%';
                    img.style.objectFit = 'cover';
                    document.querySelector('#avatarUpload i').style.display = 'none';
                    Toast.info('Rasm ko\'rsatildi (saqlash uchun serverga yuklash hali qo\'llab-quvvatlanmaydi)');
                };
                reader.readAsDataURL(e.target.files[0]);
            }
        });

        document.getElementById('profileForm').addEventListener('submit', async function (e) {
            e.preventDefault();
            var name = document.getElementById('profileName').value.trim();
            var email = document.getElementById('profileEmail').value.trim();
            var phone = document.getElementById('profilePhone').value.trim();

            if (!name || !email) { Toast.warning(Lang.t('required_field')); return; }

            var btn = document.getElementById('profileSaveBtn');
            btn.disabled = true;
            try {
                var updated = await authProfileService.updateMe({ full_name: name, email: email, phone: phone });
                App.currentUser = updated;
                Toast.success(Lang.t('update_profile') + ' muvaffaqiyatli');
                App._renderProfileForm(updated);
            } catch (error) {
                var msg = (error.data && (error.data.email || error.data.phone || error.data.full_name)) || error.message || 'Xatolik yuz berdi';
                Toast.error(Array.isArray(msg) ? msg.join(' ') : String(msg));
                btn.disabled = false;
            }
        });

        document.getElementById('passwordForm').addEventListener('submit', async function (e) {
            e.preventDefault();
            var current = document.getElementById('currentPassword').value;
            var newPass = document.getElementById('profilePassword').value;
            if (!current || !newPass) { Toast.warning(Lang.t('required_field')); return; }
            if (newPass.length < 6) { Toast.warning('Yangi parol kamida 6 belgidan iborat bo\'lishi kerak'); return; }

            var btn = document.getElementById('passwordSaveBtn');
            btn.disabled = true;
            try {
                await authProfileService.changePassword(current, newPass);
                Toast.success('Parol muvaffaqiyatli yangilandi');
                document.getElementById('passwordForm').reset();
            } catch (error) {
                Toast.error((error.data && error.data.detail) || error.message || 'Parolni yangilab bo\'lmadi');
            } finally {
                btn.disabled = false;
            }
        });

        document.getElementById('logoutSettingsBtn').addEventListener('click', function () {
            showConfirm(Lang.t('confirm_logout'), function () {
                Auth.logout();
            }, false);
        });
    },

    // ===== SETTINGS =====
    renderSettings: function () {
        var state = AppState.get();
        var settings = JSON.parse(localStorage.getItem('hms_settings') || '{}');
        var hotelName = settings.hotelName || 'HMS';
        var hotelAddress = settings.hotelAddress || '';
        var hotelPhone = settings.hotelPhone || '';
        var currency = settings.currency || 'USD';
        var notifBookings = settings.notifications?.bookings !== false;
        var notifPayments = settings.notifications?.payments !== false;
        document.getElementById('page-settings').innerHTML =
            '<div class="glass-card mb-3" style="max-width:800px;margin:0 auto 1rem;">' +
            '<h5 class="fw-light mb-4"><i class="fas fa-sliders-h me-2"></i>' + Lang.t('nav_settings') + '</h5>' +

            '<form id="settingsForm" novalidate>' +

            '<div class="mb-3">' +
            '<label class="form-label">' + Lang.t('hotel_address') + '</label>' +
            '<input id="settingsHotelAddress" class="form-control" value="' + escapeHtml(hotelAddress) + '">' +
            '</div>' +
            '<div class="mb-3">' +
            '<label class="form-label">' + Lang.t('hotel_phone') + '</label>' +
            '<input id="settingsHotelPhone" class="form-control" value="' + escapeHtml(hotelPhone) + '">' +
            '</div>' +
            '<div class="mb-3">' +
            '<label class="form-label">' + Lang.t('language') + '</label>' +
            '<select id="settingsLang" class="form-select">' +
            '<option value="uz" ' + (Lang.current === 'uz' ? 'selected' : '') + '>O\'zbek</option>' +
            '<option value="en" ' + (Lang.current === 'en' ? 'selected' : '') + '>English</option>' +
            '<option value="ru" ' + (Lang.current === 'ru' ? 'selected' : '') + '>Русский</option>' +
            '</select>' +
            '</div>' +
            '<div class="mb-3">' +
            '<label class="form-label">' + Lang.t('currency') + '</label>' +
            '<select id="settingsCurrency" class="form-select">' +
            '<option value="USD" ' + (currency === 'USD' ? 'selected' : '') + '>USD</option>' +
            '<option value="EUR" ' + (currency === 'EUR' ? 'selected' : '') + '>EUR</option>' +
            '<option value="UZS" ' + (currency === 'UZS' ? 'selected' : '') + '>UZS</option>' +
            '</select>' +
            '</div>' +
            '<div class="mb-3">' +
            '<div class="form-check form-switch">' +
            '<input class="form-check-input" type="checkbox" id="settingsDarkMode" ' + (Theme.current === 'dark' ? 'checked' : '') + '>' +
            '<label class="form-check-label">' + Lang.t('dark_mode') + '</label>' +
            '</div>' +
            '</div>' +
            '<div class="mb-3">' +
            '<label class="form-label fw-bold">' + Lang.t('notifications') + '</label>' +
            '<div class="form-check form-switch">' +
            '<input class="form-check-input" type="checkbox" id="settingsNotifBookings" ' + (notifBookings ? 'checked' : '') + '>' +
            '<label class="form-check-label">Bronlar</label>' +
            '</div>' +
            '<div class="form-check form-switch">' +
            '<input class="form-check-input" type="checkbox" id="settingsNotifPayments" ' + (notifPayments ? 'checked' : '') + '>' +
            '<label class="form-check-label">To\'lovlar</label>' +
            '</div>' +
            '<div class="form-check form-switch">' +
            '<input class="form-check-input" type="checkbox" id="settingsNotifCustomers" ' + (notifCustomers ? 'checked' : '') + '>' +
            '<label class="form-check-label">Mijozlar</label>' +
            '</div>' +
            '<div class="form-check form-switch">' +
            '<input class="form-check-input" type="checkbox" id="settingsNotifBrowser" ' + (notifBrowser ? 'checked' : '') + '>' +
            '<label class="form-check-label">Brauzer xabarlari</label>' +
            '</div>' +
            '</div>' +
            '<button type="submit" class="btn-glass btn-glass-primary w-100">' +
            '<i class="fas fa-save"></i> ' + Lang.t('save_settings') +
            '</button>' +
            '</form>' +
            '</div>' +

            '<div class="glass-card" style="max-width:800px;margin:0 auto;">' +
            '<h6 class="fw-light mb-3"><i class="fas fa-database me-2"></i>Ma\'lumotlar boshqaruvi</h6>' +
            '<p class="text-muted mb-3" style="font-size:0.82rem;">Barcha ma\'lumotlarni JSON formatda eksport yoki import qiling.</p>' +
            '<div class="d-flex flex-wrap gap-2">' +
            '<button class="btn-glass btn-glass-primary flex-1" id="exportDataBtn" style="min-width:180px;">' +
            '<i class="fas fa-download me-2"></i><span>' + Lang.t('export_data') + '</span>' +
            '</button>' +
            '<button class="btn-glass btn-glass-primary flex-1" id="importDataBtn" style="min-width:180px;">' +
            '<i class="fas fa-upload me-2"></i><span>' + Lang.t('import_data') + '</span>' +
            '</button>' +
            '<input type="file" id="importFileInput" accept=".json" style="display:none;">' +
            '</div>' +
            '</div>';
        var notifCustomers = settings.notifications?.customers !== false;

        var notifBrowser = settings.notifications?.browser !== false;

        document.getElementById('exportDataBtn')?.addEventListener('click', function () { App.exportData(); });
        document.getElementById('importDataBtn')?.addEventListener('click', function () {
            document.getElementById('importFileInput')?.click();
        });
        document.getElementById('importFileInput')?.addEventListener('change', function (e) {
            if (e.target.files.length > 0) { App.importData(e.target.files[0]); e.target.value = ''; }
        });

        var darkModeCheckbox = document.getElementById('settingsDarkMode');
        if (darkModeCheckbox) {
            darkModeCheckbox.addEventListener('change', function () {
                Theme.apply(this.checked ? 'dark' : 'light');
            });
        }

        document.getElementById('settingsLang')?.addEventListener('change', function () {
            Lang.set(this.value);
            App.renderSettings();
        });

        document.getElementById('settingsCurrency')?.addEventListener('change', function () {
            AppState.set({ currency: this.value });
        });

        document.getElementById('settingsForm').addEventListener('submit', function (e) {
            e.preventDefault();
            var hotelName = 'HMS';
            var hotelAddress = document.getElementById('settingsHotelAddress').value.trim();
            var hotelPhone = document.getElementById('settingsHotelPhone').value.trim();
            var currency = document.getElementById('settingsCurrency').value;
            var lang = document.getElementById('settingsLang').value;
            var notifBookings = document.getElementById('settingsNotifBookings').checked;
            var notifPayments = document.getElementById('settingsNotifPayments').checked;
            var notifCustomers = document.getElementById('settingsNotifCustomers').checked;
            var notifBrowser = document.getElementById('settingsNotifBrowser').checked;

                        var settings = {
                hotelName: 'HMS',
                hotelAddress: hotelAddress,
                hotelPhone: hotelPhone,
                currency: currency,
                notifications: { bookings: notifBookings, payments: notifPayments, customers: notifCustomers, browser: notifBrowser }
            };
            localStorage.setItem('hms_settings', JSON.stringify(settings));
            AppState.set({ currency: currency });
            Toast.success(Lang.t('save_settings') + ' muvaffaqiyatli');
            if (lang && lang !== Lang.current) {
                Lang.set(lang);
            }
            App.renderSettings();
            App.updateNotifications();
        });
    },

    seedData: function () {
        var state = AppState.get();
        if (state.rooms.length > 0) return;

        var rooms = [];
        for (var i = 1; i <= 15; i++) {
            var types = ['Standard', 'Deluxe', 'Luxury', 'Suite', 'VIP'];
            var type = types[Math.floor(Math.random() * types.length)];
            var priceMap = { Standard: 80, Deluxe: 120, Luxury: 180, Suite: 250, VIP: 380 };
            var status = 'Available';
            if (i % 5 === 0) status = 'Maintenance';
            rooms.push({
                id: AppState.genId(),
                number: String(100 + i),
                type: type,
                price: priceMap[type] || 80,
                status: status
            });
        }

        var customers = [];
        var names = ['Ali Valiyev', 'Gulnora Karimova', 'Shoxruh Saidov', 'Dilnoza Azimova', 'Jasur Qodirov', 'Madina Rustamova', 'Bobur Mirzayev', 'Sevara Abdullayeva', 'Otabek Alimov', 'Nigora Ismoilova'];
        names.forEach(function (name, i) {
            customers.push({
                id: AppState.genId(),
                name: name,
                email: name.toLowerCase().replace(/\s/g, '') + '@mail.uz',
                phone: '+99890' + String(1000000 + i * 111111).slice(0, 7)
            });
        });

        var today = new Date().toISOString().split('T')[0];
        var bookings = [];
        var paymentMethods = ['Cash', 'Card', 'Bank Transfer', 'Online'];
        var payments = [];
        for (var i = 0; i < 15; i++) {
            var customer = customers[i % customers.length];
            var room = rooms[i % rooms.length];
            var checkin = new Date();
            checkin.setDate(checkin.getDate() + i * 2);
            var checkout = new Date(checkin);
            checkout.setDate(checkout.getDate() + 2 + Math.floor(Math.random() * 3));
            var statuses = ['Checked-in', 'Checked-out', 'Pending', 'Cancelled'];
            var status = statuses[Math.floor(Math.random() * statuses.length)];
            if (i < 3) status = 'Checked-in';
            if (i > 7 && i < 10) status = 'Pending';
            var b = {
                id: AppState.genId(),
                customerId: customer.id,
                roomId: room.id,
                checkin: checkin.toISOString().split('T')[0],
                checkout: checkout.toISOString().split('T')[0],
                status: status,
                date: checkin.toISOString().split('T')[0]
            };
            bookings.push(b);

            if (status !== 'Cancelled' && Math.random() > 0.3) {
                var total = calculateBookingTotal(b, { rooms: rooms });
                var paidAmount = total * (0.5 + Math.random() * 0.5);
                var payStatus = 'Paid';
                if (paidAmount < total) payStatus = 'Partially Paid';
                if (status === 'Checked-out' && Math.random() > 0.6) payStatus = 'Unpaid';
                payments.push({
                    id: AppState.genId(),
                    bookingId: b.id,
                    amount: Math.round(paidAmount * 100) / 100,
                    method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
                    status: payStatus === 'Partially Paid' ? 'Partial' : payStatus,
                    date: b.checkin
                });
            }
        }

        AppState.set({ rooms: rooms, customers: customers, bookings: bookings, payments: payments });
        AppState.save();
    }
};