// ============================================================
// PUBLIC.JS — Hotel Management Public Website
// ============================================================

// ===== CONFIGURATION =====
const CONFIG = {
    USE_API: false,                     // false = localStorage fallback, true = Django REST API
    API_BASE_URL: '/api/v1/',
    STORAGE_PREFIX: 'hms_',             // same as admin panel
    DEFAULT_LANG: 'uz',
    DEFAULT_THEME: 'dark'
};

// ============================================================
// UTILITY HELPERS
// ============================================================
function escapeHtml(str) {
    if (!str) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(str).replace(/[&<>"']/g, m => map[m]);
}

function getRelativeTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const s = Math.floor(diff / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    const lang = Lang.current || 'uz';
    const tbl = {
        uz: { now: 'Hozirgina', m: n => n + ' daqiqa oldin', h: n => n + ' soat oldin', d: n => n + ' kun oldin' },
        en: { now: 'Just now', m: n => n + 'm ago', h: n => n + 'h ago', d: n => n + 'd ago' },
        ru: { now: 'Только что', m: n => n + ' мин. назад', h: n => n + ' ч. назад', d: n => n + ' дн. назад' }
    };
    const t = tbl[lang] || tbl.uz;
    if (s < 60) return t.now;
    if (m < 60) return t.m(m);
    if (h < 24) return t.h(h);
    if (d < 7) return t.d(d);
    return new Date(timestamp).toLocaleDateString(lang === 'ru' ? 'ru-RU' : lang === 'en' ? 'en-US' : 'uz-UZ');
}

function formatCurrency(amount, currency = 'USD') {
    const rates = getCurrencyRates();
    const rate = rates[currency] || 1;
    const converted = amount * rate;
    if (currency === 'UZS') {
        return new Intl.NumberFormat('uz-UZ').format(Math.round(converted)) + ' so\'m';
    }
    if (currency === 'EUR') {
        return '\u20AC' + converted.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    }
    return '$' + converted.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function getCurrencyRates() {
    try {
        const saved = JSON.parse(localStorage.getItem('hms_currency_rates'));
        if (saved && typeof saved === 'object') {
            return { USD: 1, EUR: 0.92, UZS: 12700, ...saved };
        }
    } catch (_) {}
    return { USD: 1, EUR: 0.92, UZS: 12700 };
}

function debounce(fn, delay = 250) {
    let timer = null;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

// ============================================================
// TOAST (public)
// ============================================================
const PublicToast = {
    container: null,
    init() {
        this.container = document.getElementById('publicToastContainer');
        if (!this.container) {
            const c = document.createElement('div');
            c.id = 'publicToastContainer';
            c.setAttribute('aria-live', 'polite');
            c.setAttribute('aria-atomic', 'true');
            document.body.appendChild(c);
            this.container = c;
        }
    },
    show(msg, type = 'info') {
        const div = document.createElement('div');
        const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
        div.className = 'toast-msg ' + type;
        div.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> ${escapeHtml(msg)}`;
        this.container.appendChild(div);
        setTimeout(() => {
            div.classList.add('fade-out');
            setTimeout(() => div.remove(), 300);
        }, 4000);
    },
    success(m) { this.show(m, 'success'); },
    error(m) { this.show(m, 'error'); },
    warning(m) { this.show(m, 'warning'); },
    info(m) { this.show(m, 'info'); }
};

// ============================================================
// TRANSLATIONS (public only)
// ============================================================
const PUBLIC_T = {
    uz: {
        hero_title: 'O‘zingizni uydagidek his qiling',
        hero_subtitle: 'Zamonaviy qulaylik, samimiy mehmondo‘stlik va unutilmas tajriba.',
        hero_rooms: 'Xonalarni ko‘rish',
        hero_booking: 'Bron qilish',
        quick_search: 'Tez bron',
        checkin: 'Kirish',
        checkout: 'Chiqish',
        guests: 'Mehmonlar soni',
        check_availability: 'Mavjudlikni tekshirish',
        rooms_title: 'Xonalar',
        rooms_subtitle: 'O‘zingizga mos variantni tanlang',
        room_type: 'Tur',
        min_price: 'Min narx',
        max_price: 'Max narx',
        sort: 'Saralash',
        price_asc: 'Narx (o‘sish)',
        price_desc: 'Narx (kamayish)',
        room_number: 'Raqam',
        services_title: 'Xizmatlarimiz',
        services_subtitle: 'Sizning qulayligingiz uchun hamma narsa',
        gallery_title: 'Galereya',
        gallery_subtitle: 'Mehmonxonamizdan lavhalar',
        about_title: 'Biz haqimizda',
        about_text1: 'Mehmonxonamiz 2010-yildan buyon mehmonlarga eng yaxshi xizmatni taqdim etadi. Har bir tafsilot sizning qulayligingiz uchun.',
        about_text2: 'Professional xodimlar, zamonaviy jihozlar va jozibali manzil – biz sizning ikkinchi uyingiz bo‘lishga tayyormiz.',
        about_mission: 'Bizning vazifamiz',
        about_mission_text: 'Har bir mehmonga ajoyib tajriba va iliq muhit yaratish.',
        contact_title: 'Aloqa',
        contact_subtitle: 'Savollaringiz bo‘lsa, biz bilan bog‘laning',
        address: 'Manzil',
        phone: 'Telefon',
        working_hours: 'Ish vaqti',
        hours: '24/7',
        full_name: 'To‘liq ism',
        subject: 'Mavzu',
        message: 'Xabar',
        send: 'Yuborish',
        booking_status_title: 'Bron holatini tekshirish',
        booking_status_subtitle: 'Bron raqamingiz va email orqali holatni bilib oling',
        booking_reference: 'Bron raqami',
        check_status: 'Tekshirish',
        footer_tagline: 'Qulaylik va samimiylik manzili',
        quick_links: 'Tez o‘tish',
        contact_info: 'Aloqa ma\'lumotlari',
        all_rights: 'Barcha huquqlar himoyalangan.',
        privacy: 'Maxfiylik siyosati',
        terms: 'Foydalanish shartlari',
        book_now: 'Bron qilish',
        select_room: 'Xonani tanlang',
        next: 'Keyingi',
        back: 'Orqaga',
        confirm_booking: 'Tasdiqlash',
        booking_success: 'Bron muvaffaqiyatli yaratildi!',
        booking_ref: 'Sizning bron raqamingiz:',
        close: 'Yopish',
        special_requests: 'Maxsus talablar',
        privacy_consent: 'Ma\'lumotlarimni qayta ishlashga roziman',
        // status messages
        no_rooms: 'Hozircha xonalar mavjud emas.',
        loading: 'Yuklanmoqda...',
        error_generic: 'Xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.',
        booking_conflict: 'Bu xona tanlangan sanalarda band bo‘lib qoldi. Iltimos, boshqa sanani tanlang.',
        server_down: 'Xizmat vaqtincha mavjud emas. Keyinroq qayta urinib ko‘ring.',
        invalid_dates: 'Chiqish sanasi kirish sanasidan keyin bo‘lishi kerak.',
        required_field: 'Bu maydon majburiy.',
        valid_email: 'To‘g‘ri email kiriting.',
        phone_format: 'Telefon +998 bilan boshlanishi kerak.',
        booking_not_found: 'Bron topilmadi. Iltimos, ma\'lumotlarni tekshiring.'
    },
    en: {
        hero_title: 'Feel at home',
        hero_subtitle: 'Modern comfort, genuine hospitality and unforgettable experience.',
        hero_rooms: 'View Rooms',
        hero_booking: 'Book Now',
        quick_search: 'Quick Search',
        checkin: 'Check-in',
        checkout: 'Check-out',
        guests: 'Guests',
        check_availability: 'Check Availability',
        rooms_title: 'Rooms',
        rooms_subtitle: 'Choose the perfect option for you',
        room_type: 'Type',
        min_price: 'Min price',
        max_price: 'Max price',
        sort: 'Sort',
        price_asc: 'Price (low to high)',
        price_desc: 'Price (high to low)',
        room_number: 'Number',
        services_title: 'Our Services',
        services_subtitle: 'Everything for your comfort',
        gallery_title: 'Gallery',
        gallery_subtitle: 'Photos from our hotel',
        about_title: 'About Us',
        about_text1: 'Our hotel has been providing the best service to guests since 2010. Every detail is for your comfort.',
        about_text2: 'Professional staff, modern facilities and attractive location – we are ready to be your second home.',
        about_mission: 'Our Mission',
        about_mission_text: 'To create an amazing experience and warm atmosphere for every guest.',
        contact_title: 'Contact',
        contact_subtitle: 'Get in touch with us',
        address: 'Address',
        phone: 'Phone',
        working_hours: 'Working Hours',
        hours: '24/7',
        full_name: 'Full Name',
        subject: 'Subject',
        message: 'Message',
        send: 'Send',
        booking_status_title: 'Check Booking Status',
        booking_status_subtitle: 'Check your booking status with reference and email',
        booking_reference: 'Booking Reference',
        check_status: 'Check Status',
        footer_tagline: 'Comfort and sincerity',
        quick_links: 'Quick Links',
        contact_info: 'Contact Info',
        all_rights: 'All rights reserved.',
        privacy: 'Privacy Policy',
        terms: 'Terms of Service',
        book_now: 'Book Now',
        select_room: 'Select Room',
        next: 'Next',
        back: 'Back',
        confirm_booking: 'Confirm',
        booking_success: 'Booking successfully created!',
        booking_ref: 'Your booking reference:',
        close: 'Close',
        special_requests: 'Special Requests',
        privacy_consent: 'I agree to the processing of my data',
        no_rooms: 'No rooms available yet.',
        loading: 'Loading...',
        error_generic: 'An error occurred. Please try again.',
        booking_conflict: 'This room is already booked for the selected dates. Please choose other dates.',
        server_down: 'Service temporarily unavailable. Please try again later.',
        invalid_dates: 'Check-out must be after check-in.',
        required_field: 'This field is required.',
        valid_email: 'Please enter a valid email.',
        phone_format: 'Phone must start with +998.',
        booking_not_found: 'Booking not found. Please check your details.'
    },
    ru: {
        hero_title: 'Почувствуйте себя как дома',
        hero_subtitle: 'Современный комфорт, искреннее гостеприимство и незабываемые впечатления.',
        hero_rooms: 'Посмотреть номера',
        hero_booking: 'Забронировать',
        quick_search: 'Быстрый поиск',
        checkin: 'Заезд',
        checkout: 'Выезд',
        guests: 'Количество гостей',
        check_availability: 'Проверить наличие',
        rooms_title: 'Номера',
        rooms_subtitle: 'Выберите идеальный вариант для себя',
        room_type: 'Тип',
        min_price: 'Мин. цена',
        max_price: 'Макс. цена',
        sort: 'Сортировка',
        price_asc: 'Цена (по возрастанию)',
        price_desc: 'Цена (по убыванию)',
        room_number: 'Номер',
        services_title: 'Наши услуги',
        services_subtitle: 'Всё для вашего комфорта',
        gallery_title: 'Галерея',
        gallery_subtitle: 'Фотографии нашего отеля',
        about_title: 'О нас',
        about_text1: 'Наш отель с 2010 года предоставляет гостям наилучший сервис. Каждая деталь для вашего комфорта.',
        about_text2: 'Профессиональный персонал, современное оснащение и привлекательное расположение – мы готовы стать вашим вторым домом.',
        about_mission: 'Наша миссия',
        about_mission_text: 'Создать незабываемые впечатления и тёплую атмосферу для каждого гостя.',
        contact_title: 'Контакты',
        contact_subtitle: 'Свяжитесь с нами',
        address: 'Адрес',
        phone: 'Телефон',
        working_hours: 'Часы работы',
        hours: '24/7',
        full_name: 'Полное имя',
        subject: 'Тема',
        message: 'Сообщение',
        send: 'Отправить',
        booking_status_title: 'Проверка статуса брони',
        booking_status_subtitle: 'Проверьте статус брони по номеру и email',
        booking_reference: 'Номер брони',
        check_status: 'Проверить',
        footer_tagline: 'Комфорт и душевность',
        quick_links: 'Быстрые ссылки',
        contact_info: 'Контактная информация',
        all_rights: 'Все права защищены.',
        privacy: 'Политика конфиденциальности',
        terms: 'Условия использования',
        book_now: 'Забронировать',
        select_room: 'Выберите номер',
        next: 'Далее',
        back: 'Назад',
        confirm_booking: 'Подтвердить',
        booking_success: 'Бронь успешно создана!',
        booking_ref: 'Ваш номер брони:',
        close: 'Закрыть',
        special_requests: 'Особые пожелания',
        privacy_consent: 'Я согласен на обработку моих данных',
        no_rooms: 'Нет доступных номеров.',
        loading: 'Загрузка...',
        error_generic: 'Произошла ошибка. Пожалуйста, попробуйте снова.',
        booking_conflict: 'Этот номер уже забронирован на выбранные даты. Пожалуйста, выберите другие даты.',
        server_down: 'Сервис временно недоступен. Пожалуйста, попробуйте позже.',
        invalid_dates: 'Дата выезда должна быть позже даты заезда.',
        required_field: 'Это поле обязательно.',
        valid_email: 'Введите корректный email.',
        phone_format: 'Телефон должен начинаться с +998.',
        booking_not_found: 'Бронь не найдена. Проверьте введённые данные.'
    }
};

// ============================================================
// LANGUAGE
// ============================================================
const Lang = {
    current: 'uz',
    t(key) {
        return PUBLIC_T[this.current]?.[key] || PUBLIC_T.uz[key] || key;
    },
    apply() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            el.textContent = this.t(el.dataset.i18n);
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            el.placeholder = this.t(el.dataset.i18nPlaceholder);
        });
        // Update language label
        const label = document.getElementById('currentLangLabel');
        if (label) {
            const map = { uz: 'UZ', en: 'EN', ru: 'RU' };
            label.textContent = map[this.current] || 'UZ';
        }
        // Update dropdown active item
        document.querySelectorAll('[data-lang]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === this.current);
        });
    },
    set(lang) {
        if (PUBLIC_T[lang]) {
            this.current = lang;
            localStorage.setItem('hms_public_lang', lang);
            this.apply();
            // Re-render dynamic content
            App.renderRooms();
            App.renderServices();
            App.renderGallery();
            App.renderAbout();
        }
    },
    init() {
        this.current = localStorage.getItem('hms_public_lang') || CONFIG.DEFAULT_LANG;
        this.apply();
    }
};

// ============================================================
// THEME
// ============================================================
const Theme = {
    current: 'dark',
    apply(theme) {
        this.current = theme || this.current;
        document.documentElement.setAttribute('data-theme', this.current);
        localStorage.setItem('hms_public_theme', this.current);
        const icon = document.querySelector('#publicThemeToggle i');
        if (icon) icon.className = this.current === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    },
    toggle() {
        this.apply(this.current === 'dark' ? 'light' : 'dark');
    },
    init() {
        this.apply(localStorage.getItem('hms_public_theme') || CONFIG.DEFAULT_THEME);
    }
};

// ============================================================
// DATA API (abstraction layer)
// ============================================================
const DataAPI = {
    // ---------- LocalStorage helpers ----------
    _get(key) {
        try {
            return JSON.parse(localStorage.getItem(CONFIG.STORAGE_PREFIX + key)) || [];
        } catch (_) { return []; }
    },
    _set(key, data) {
        localStorage.setItem(CONFIG.STORAGE_PREFIX + key, JSON.stringify(data));
    },
    _getSettings() {
        try {
            return JSON.parse(localStorage.getItem('hms_settings')) || {};
        } catch (_) { return {}; }
    },

    // ---------- Public methods ----------
    getHotelInfo() {
        const settings = this._getSettings();
        return {
            name: settings.hotelName || 'HMS Hotel',
            address: settings.hotelAddress || 'Toshkent, Amir Temur ko‘chasi, 123',
            phone: settings.hotelPhone || '+998 90 123 45 67',
            email: 'info@hms.uz',
            currency: settings.currency || 'USD'
        };
    },

    getRooms() {
        return this._get('rooms');
    },

    getRoom(id) {
        const rooms = this.getRooms();
        return rooms.find(r => r.id === id) || null;
    },

    getAvailableRooms(checkin, checkout) {
        // If USE_API is true, this would call the backend.
        // For fallback, we filter from localStorage.
        const rooms = this.getRooms();
        const bookings = this._get('bookings');
        const checkinDate = new Date(checkin);
        const checkoutDate = new Date(checkout);

        // Filter rooms that are not in maintenance and not booked for overlapping dates
        return rooms.filter(room => {
            if (room.status === 'Maintenance') return false;

            // Check for overlapping bookings
            const overlapping = bookings.some(b => {
                if (b.roomId !== room.id) return false;
                if (b.status === 'Cancelled' || b.status === 'Checked-out') return false;
                const bCheckin = new Date(b.checkin);
                const bCheckout = new Date(b.checkout);
                return (checkinDate < bCheckout && checkoutDate > bCheckin);
            });
            if (overlapping) return false;

            return true;
        });
    },

    getRoomAvailability(roomId, checkin, checkout) {
        const rooms = this.getRooms();
        const room = rooms.find(r => r.id === roomId);
        if (!room) return { available: false, reason: 'Room not found' };
        if (room.status === 'Maintenance') return { available: false, reason: 'Under maintenance' };

        const bookings = this._get('bookings');
        const checkinDate = new Date(checkin);
        const checkoutDate = new Date(checkout);
        const overlapping = bookings.some(b => {
            if (b.roomId !== roomId) return false;
            if (b.status === 'Cancelled' || b.status === 'Checked-out') return false;
            const bCheckin = new Date(b.checkin);
            const bCheckout = new Date(b.checkout);
            return (checkinDate < bCheckout && checkoutDate > bCheckin);
        });
        if (overlapping) return { available: false, reason: 'Already booked' };

        return { available: true };
    },

    createBooking(data) {
        // In fallback mode, we save to localStorage.
        // In API mode, we would POST to backend.
        // IMPORTANT: Backend should calculate total_price.
        // Here we simulate.

        const rooms = this.getRooms();
        const room = rooms.find(r => r.id === data.roomId);
        if (!room) throw new Error('Room not found');

        // Calculate nights (frontend preview, but backend will recalc)
        const checkin = new Date(data.checkin);
        const checkout = new Date(data.checkout);
        const nights = Math.max(1, Math.ceil((checkout - checkin) / (1000*60*60*24)));
        const totalPrice = room.price * nights;

        // Generate reference (backed would do this)
        const ref = 'HMS-' + new Date().getFullYear() + '-' +
            String(Math.floor(Math.random() * 1000000)).padStart(6, '0');

        const booking = {
            id: 'pub_' + Date.now() + Math.random().toString(36).substr(2,6),
            reference: ref,
            customerId: data.customerId || null,
            roomId: data.roomId,
            checkin: data.checkin,
            checkout: data.checkout,
            guests: data.guests || 1,
            status: 'Pending',
            totalPrice: totalPrice,
            date: new Date().toISOString().split('T')[0],
            notes: data.notes || '',
            customerName: data.customerName,
            customerEmail: data.customerEmail,
            customerPhone: data.customerPhone
        };

        // Save to bookings
        const bookings = this._get('bookings');
        bookings.push(booking);
        this._set('bookings', bookings);

        // Also update room status if needed (but keep as Booked)
        // We'll set room status to Booked (if not already)
        const roomIdx = rooms.findIndex(r => r.id === data.roomId);
        if (roomIdx !== -1 && rooms[roomIdx].status === 'Available') {
            rooms[roomIdx].status = 'Booked';
            this._set('rooms', rooms);
        }

        return booking;
    },

    getBookingStatus(reference, email) {
        const bookings = this._get('bookings');
        const booking = bookings.find(b => b.reference === reference && b.customerEmail === email);
        if (!booking) return null;

        // Return a safe subset (no internal IDs etc)
        return {
            reference: booking.reference,
            customerName: booking.customerName,
            roomId: booking.roomId,
            checkin: booking.checkin,
            checkout: booking.checkout,
            status: booking.status,
            totalPrice: booking.totalPrice,
            guests: booking.guests
        };
    },

    submitContact(data) {
        // In fallback mode, save to localStorage 'hms_contacts'
        const contacts = JSON.parse(localStorage.getItem('hms_contacts') || '[]');
        contacts.push({
            id: 'cnt_' + Date.now(),
            name: data.name,
            email: data.email,
            phone: data.phone,
            subject: data.subject,
            message: data.message,
            date: new Date().toISOString()
        });
        localStorage.setItem('hms_contacts', JSON.stringify(contacts));
        return { success: true };
    }
};

// ============================================================
// PUBLIC APP
// ============================================================
const App = {
    init() {
        // Init theme & language
        Theme.init();
        Lang.init();
        PublicToast.init();

        // Bind events
        this.bindEvents();

        // Render initial content
        this.renderRooms();
        this.renderServices();
        this.renderGallery();
        this.renderAbout();
        this.updateHotelInfo();

        // Set footer year
        document.getElementById('footerYear').textContent = new Date().getFullYear();

        // Quick search
        document.getElementById('quickSearchForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const checkin = document.getElementById('qsCheckin').value;
            const checkout = document.getElementById('qsCheckout').value;
            if (!checkin || !checkout) {
                PublicToast.warning(Lang.t('required_field'));
                return;
            }
            if (new Date(checkout) <= new Date(checkin)) {
                PublicToast.warning(Lang.t('invalid_dates'));
                return;
            }
            // Scroll to rooms and apply filters? For now just open booking modal with dates.
            const modal = new bootstrap.Modal(document.getElementById('bookingModal'));
            document.getElementById('bookCheckin').value = checkin;
            document.getElementById('bookCheckout').value = checkout;
            modal.show();
        });

        // Booking wizard steps
        this.initBookingWizard();

        // Booking status form
        document.getElementById('bookingStatusForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.checkBookingStatus();
        });

        // Contact form
        document.getElementById('contactForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitContact();
        });

        // Navbar scroll active link
        document.querySelectorAll('[data-scroll]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                // Close mobile menu if open
                const collapse = document.getElementById('navbarNav');
                if (collapse && collapse.classList.contains('show')) {
                    const toggler = document.getElementById('navbarToggler');
                    if (toggler) toggler.click();
                }
            });
        });

        // Navbar toggler icon swap
        document.getElementById('navbarToggler').addEventListener('click', function() {
            const icon = this.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });

        // Theme toggle
        document.getElementById('publicThemeToggle').addEventListener('click', () => Theme.toggle());

        // Language dropdown
        document.querySelectorAll('[data-lang]').forEach(btn => {
            btn.addEventListener('click', () => {
                Lang.set(btn.dataset.lang);
            });
        });

        // Listen for storage changes from admin panel
        window.addEventListener('storage', (e) => {
            if (e.key === 'hms_rooms' || e.key === 'hms_bookings') {
                this.renderRooms();
                this.updateRoomSelect();
            }
        });
    },

    bindEvents() {
        // Room filter changes
        document.getElementById('roomTypeFilter').addEventListener('change', () => this.renderRooms());
        document.getElementById('minPriceFilter').addEventListener('input', debounce(() => this.renderRooms(), 300));
        document.getElementById('maxPriceFilter').addEventListener('input', debounce(() => this.renderRooms(), 300));
        document.getElementById('roomSort').addEventListener('change', () => this.renderRooms());
    },

    // ---------- RENDER: ROOMS ----------
    renderRooms() {
        const container = document.getElementById('roomCardsContainer');
        const rooms = DataAPI.getRooms();

        // Apply filters
        let filtered = rooms;
        const typeFilter = document.getElementById('roomTypeFilter').value;
        const minPrice = parseFloat(document.getElementById('minPriceFilter').value) || 0;
        const maxPrice = parseFloat(document.getElementById('maxPriceFilter').value) || Infinity;
        const sort = document.getElementById('roomSort').value;

        if (typeFilter !== 'all') {
            filtered = filtered.filter(r => r.type === typeFilter);
        }
        filtered = filtered.filter(r => r.price >= minPrice && r.price <= maxPrice);

        // Sort
        if (sort === 'price_asc') filtered.sort((a,b) => a.price - b.price);
        else if (sort === 'price_desc') filtered.sort((a,b) => b.price - a.price);
        else filtered.sort((a,b) => parseInt(a.number) - parseInt(b.number));

        if (filtered.length === 0) {
            container.innerHTML = `<div class="col-12"><div class="glass-card text-center p-4"><p class="text-muted">${Lang.t('no_rooms')}</p></div></div>`;
            return;
        }

        container.innerHTML = filtered.map((room, i) => {
            const statusClass = room.status === 'Available' ? 'available' :
                               room.status === 'Booked' ? 'booked' :
                               room.status === 'Occupied' ? 'occupied' : 'maintenance';
            const statusLabel = room.status;
            const priceFormatted = formatCurrency(room.price);
            // Simple amenities (mock)
            const amenities = ['Wi-Fi', 'TV', 'Konditsioner', 'Mini-bar'].slice(0, 2 + (i % 3));
            return `
                <div class="col-md-4 col-sm-6">
                    <div class="glass-card room-card" style="animation: cardEnter 0.4s cubic-bezier(0.34,1.56,0.64,1) ${i*50}ms forwards; opacity:0;">
                        <div class="d-flex justify-content-between align-items-start">
                            <span class="room-number">#${escapeHtml(room.number)}</span>
                            <span class="badge-status ${statusClass}">${escapeHtml(statusLabel)}</span>
                        </div>
                        <h5 class="mt-2">${escapeHtml(room.type)}</h5>
                        <div class="room-price">${priceFormatted} <span class="text-muted" style="font-size:0.8rem;">/ kecha</span></div>
                        <div class="room-amenities mt-2">
                            ${amenities.map(a => `<span class="badge bg-secondary me-1">${escapeHtml(a)}</span>`).join('')}
                        </div>
                        <div class="mt-3 d-flex gap-2 flex-wrap">
                            <button class="btn-glass btn-glass-sm view-room-detail" data-id="${escapeHtml(room.id)}" data-i18n="view_details">Batafsil</button>
                            ${room.status === 'Available' ? `<button class="btn-glass btn-glass-sm btn-glass-primary book-room" data-id="${escapeHtml(room.id)}" data-i18n="book_now">Bron</button>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Event listeners for detail / book buttons
        container.querySelectorAll('.view-room-detail').forEach(btn => {
            btn.addEventListener('click', () => this.showRoomDetail(btn.dataset.id));
        });
        container.querySelectorAll('.book-room').forEach(btn => {
            btn.addEventListener('click', () => {
                const roomId = btn.dataset.id;
                const modal = new bootstrap.Modal(document.getElementById('bookingModal'));
                document.getElementById('bookRoomSelect').value = roomId;
                modal.show();
            });
        });

        // Also update the booking room select
        this.updateRoomSelect();
    },

    updateRoomSelect() {
        const select = document.getElementById('bookRoomSelect');
        if (!select) return;
        const rooms = DataAPI.getRooms();
        const currentVal = select.value;
        select.innerHTML = `<option value="">${Lang.t('select_room')}</option>` +
            rooms.filter(r => r.status === 'Available').map(r =>
                `<option value="${escapeHtml(r.id)}">#${escapeHtml(r.number)} - ${escapeHtml(r.type)} (${formatCurrency(r.price)}/kecha)</option>`
            ).join('');
        if (currentVal) select.value = currentVal;
    },

    showRoomDetail(roomId) {
        const room = DataAPI.getRoom(roomId);
        if (!room) return;
        // For now, show a simple toast with info
        PublicToast.info(`Xona #${room.number} (${room.type}) — ${formatCurrency(room.price)}/kecha`);
        // In a full implementation, this could open a modal with more details.
    },

    // ---------- RENDER: SERVICES ----------
    renderServices() {
        const container = document.getElementById('servicesContainer');
        const services = [
            { icon: 'fa-utensils', label: 'Restoran' },
            { icon: 'fa-coffee', label: 'Nonushta' },
            { icon: 'fa-swimmer', label: 'Basseyin' },
            { icon: 'fa-spa', label: 'SPA' },
            { icon: 'fa-dumbbell', label: 'Fitnes' },
            { icon: 'fa-parking', label: 'Avtoturargoh' },
            { icon: 'fa-shuttle-van', label: 'Transafer' },
            { icon: 'fa-concierge-bell', label: '24/7 xizmat' }
        ];
        container.innerHTML = services.map(s => `
            <div class="col-md-3 col-sm-6">
                <div class="glass-card service-card text-center p-3">
                    <div class="service-icon"><i class="fas ${s.icon}"></i></div>
                    <h5>${s.label}</h5>
                </div>
            </div>
        `).join('');
    },

    // ---------- RENDER: GALLERY ----------
    renderGallery() {
        const container = document.getElementById('galleryContainer');
        const items = [
            { label: 'Lobby', icon: 'fa-hotel' },
            { label: 'Xona', icon: 'fa-bed' },
            { label: 'Basseyin', icon: 'fa-swimmer' },
            { label: 'Restoran', icon: 'fa-utensils' },
            { label: 'SPA', icon: 'fa-spa' },
            { label: 'Teras', icon: 'fa-umbrella-beach' }
        ];
        container.innerHTML = items.map(item => `
            <div class="col-md-4 col-sm-6">
                <div class="gallery-item" role="img" aria-label="${escapeHtml(item.label)}">
                    <i class="fas ${item.icon}"></i>
                    <div class="gallery-label">${escapeHtml(item.label)}</div>
                </div>
            </div>
        `).join('');

        // Click for lightbox simulation
        container.querySelectorAll('.gallery-item').forEach(el => {
            el.addEventListener('click', () => {
                PublicToast.info('Rasm: ' + el.querySelector('.gallery-label').textContent);
            });
        });
    },

    // ---------- RENDER: ABOUT ----------
    renderAbout() {
        const statsContainer = document.getElementById('aboutStats');
        const stats = [
            { label: 'Xonalar', value: DataAPI.getRooms().length },
            { label: 'Mehmonlar', value: DataAPI._get('bookings').length * 2 }, // approximate
            { label: 'Tajriba', value: '12+ yil' },
            { label: 'Reyting', value: '⭐ 4.8' }
        ];
        statsContainer.innerHTML = stats.map(s => `
            <div class="col-6 col-md-3 text-center">
                <div class="glass-card p-2">
                    <div class="h3 fw-bold">${escapeHtml(String(s.value))}</div>
                    <div class="text-muted">${escapeHtml(s.label)}</div>
                </div>
            </div>
        `).join('');
    },

    // ---------- UPDATE HOTEL INFO ----------
    updateHotelInfo() {
        const info = DataAPI.getHotelInfo();
        document.getElementById('hotelNameDisplay').textContent = info.name;
        document.getElementById('footerHotelName').textContent = info.name;
        document.getElementById('contactAddress').textContent = info.address;
        document.getElementById('contactPhone').textContent = info.phone;
        document.getElementById('contactEmail').textContent = info.email;
        document.getElementById('footerAddress').textContent = info.address;
        document.getElementById('footerPhone').textContent = info.phone;
        document.getElementById('footerEmail').textContent = info.email;
    },

    // ---------- BOOKING WIZARD ----------
    initBookingWizard() {
        let currentStep = 1;
        const step1 = document.getElementById('bookingStep1');
        const step2 = document.getElementById('bookingStep2');
        const step3 = document.getElementById('bookingStep3');
        const success = document.getElementById('bookingSuccess');
        const indicators = document.querySelectorAll('.step-indicator');

        function showStep(step) {
            step1.style.display = step === 1 ? 'block' : 'none';
            step2.style.display = step === 2 ? 'block' : 'none';
            step3.style.display = step === 3 ? 'block' : 'none';
            success.style.display = 'none';
            indicators.forEach((ind, idx) => {
                const num = idx + 1;
                ind.classList.toggle('active', num === step);
                ind.classList.toggle('done', num < step);
            });
            currentStep = step;
        }

        // Step 1 -> Step 2
        document.getElementById('bookStep1Next').addEventListener('click', () => {
            const roomId = document.getElementById('bookRoomSelect').value;
            const checkin = document.getElementById('bookCheckin').value;
            const checkout = document.getElementById('bookCheckout').value;
            const guests = parseInt(document.getElementById('bookGuests').value) || 1;

            if (!roomId || !checkin || !checkout) {
                PublicToast.warning(Lang.t('required_field'));
                return;
            }
            if (new Date(checkout) <= new Date(checkin)) {
                PublicToast.warning(Lang.t('invalid_dates'));
                return;
            }

            // Check availability (frontend check)
            const availability = DataAPI.getRoomAvailability(roomId, checkin, checkout);
            if (!availability.available) {
                PublicToast.warning(Lang.t('booking_conflict'));
                return;
            }

            // Store selected data temporarily
            this._bookingData = { roomId, checkin, checkout, guests };
            showStep(2);
        });

        // Step 2 -> Step 3
        document.getElementById('bookStep2Next').addEventListener('click', () => {
            const name = document.getElementById('bookName').value.trim();
            const email = document.getElementById('bookEmail').value.trim();
            const phone = document.getElementById('bookPhone').value.trim();
            const notes = document.getElementById('bookNotes').value.trim();
            const privacy = document.getElementById('bookPrivacy').checked;

            if (!name || !email || !phone) {
                PublicToast.warning(Lang.t('required_field'));
                return;
            }
            if (!email.includes('@')) {
                PublicToast.warning(Lang.t('valid_email'));
                return;
            }
            if (!phone.startsWith('+998')) {
                PublicToast.warning(Lang.t('phone_format'));
                return;
            }
            if (!privacy) {
                PublicToast.warning(Lang.t('privacy_consent'));
                return;
            }

            this._bookingData.customerName = name;
            this._bookingData.customerEmail = email;
            this._bookingData.customerPhone = phone;
            this._bookingData.notes = notes;

            // Render summary
            this.renderBookingSummary();
            showStep(3);
        });

        // Step 3 -> Confirm
        document.getElementById('bookStep3Confirm').addEventListener('click', () => {
            this.submitBooking();
        });

        // Back buttons
        document.getElementById('bookStep2Back').addEventListener('click', () => showStep(1));
        document.getElementById('bookStep3Back').addEventListener('click', () => showStep(2));

        // Reset when modal is closed
        document.getElementById('bookingModal').addEventListener('hidden.bs.modal', () => {
            showStep(1);
            success.style.display = 'none';
            this._bookingData = null;
            // Reset form fields if needed
        });

        // Step 1 room change -> update price preview
        document.getElementById('bookRoomSelect').addEventListener('change', () => this.updatePricePreview());
        document.getElementById('bookCheckin').addEventListener('change', () => this.updatePricePreview());
        document.getElementById('bookCheckout').addEventListener('change', () => this.updatePricePreview());

        showStep(1);
        this.updateRoomSelect();
    },

    updatePricePreview() {
        const roomId = document.getElementById('bookRoomSelect').value;
        const checkin = document.getElementById('bookCheckin').value;
        const checkout = document.getElementById('bookCheckout').value;
        const preview = document.getElementById('bookPricePreview');

        if (!roomId || !checkin || !checkout) {
            preview.textContent = '';
            return;
        }
        const room = DataAPI.getRoom(roomId);
        if (!room) { preview.textContent = ''; return; }
        const nights = Math.max(1, Math.ceil((new Date(checkout) - new Date(checkin)) / (1000*60*60*24)));
        const total = room.price * nights;
        preview.textContent = `${nights} kecha × ${formatCurrency(room.price)} = ${formatCurrency(total)} (taxminiy)`;
    },

    renderBookingSummary() {
        const data = this._bookingData;
        if (!data) return;
        const room = DataAPI.getRoom(data.roomId);
        const nights = Math.max(1, Math.ceil((new Date(data.checkout) - new Date(data.checkin)) / (1000*60*60*24)));
        const total = room ? room.price * nights : 0;
        const container = document.getElementById('bookingSummary');
        container.innerHTML = `
            <div class="glass-card p-3">
                <div class="row g-2">
                    <div class="col-6"><strong>${Lang.t('room')}:</strong> #${escapeHtml(room ? room.number : 'N/A')} (${escapeHtml(room ? room.type : 'N/A')})</div>
                    <div class="col-6"><strong>${Lang.t('guests')}:</strong> ${escapeHtml(String(data.guests))}</div>
                    <div class="col-6"><strong>${Lang.t('checkin')}:</strong> ${escapeHtml(data.checkin)}</div>
                    <div class="col-6"><strong>${Lang.t('checkout')}:</strong> ${escapeHtml(data.checkout)}</div>
                    <div class="col-12"><strong>${Lang.t('full_name')}:</strong> ${escapeHtml(data.customerName)}</div>
                    <div class="col-6"><strong>Email:</strong> ${escapeHtml(data.customerEmail)}</div>
                    <div class="col-6"><strong>${Lang.t('phone')}:</strong> ${escapeHtml(data.customerPhone)}</div>
                    <div class="col-12"><strong>${Lang.t('total_price')}:</strong> ${formatCurrency(total)}</div>
                    ${data.notes ? `<div class="col-12"><strong>${Lang.t('special_requests')}:</strong> ${escapeHtml(data.notes)}</div>` : ''}
                </div>
            </div>
        `;
    },

    submitBooking() {
        const data = this._bookingData;
        if (!data) return;

        // Disable button to prevent double submit
        const btn = document.getElementById('bookStep3Confirm');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + Lang.t('loading');

        // Simulate API call
        setTimeout(() => {
            try {
                const result = DataAPI.createBooking({
                    roomId: data.roomId,
                    checkin: data.checkin,
                    checkout: data.checkout,
                    guests: data.guests,
                    customerName: data.customerName,
                    customerEmail: data.customerEmail,
                    customerPhone: data.customerPhone,
                    notes: data.notes
                });
                document.getElementById('bookingReferenceDisplay').textContent = result.reference;
                document.getElementById('bookingStep3').style.display = 'none';
                document.getElementById('bookingSuccess').style.display = 'block';
                PublicToast.success(Lang.t('booking_success'));
                // Reset room list
                this.renderRooms();
                this.updateRoomSelect();
            } catch (err) {
                PublicToast.error(err.message || Lang.t('error_generic'));
            } finally {
                btn.disabled = false;
                btn.innerHTML = Lang.t('confirm_booking');
            }
        }, 800);
    },

    // ---------- BOOKING STATUS ----------
    checkBookingStatus() {
        const ref = document.getElementById('statusReference').value.trim();
        const email = document.getElementById('statusEmail').value.trim();
        const resultContainer = document.getElementById('bookingStatusResult');

        if (!ref || !email) {
            PublicToast.warning(Lang.t('required_field'));
            return;
        }

        resultContainer.innerHTML = '<div class="text-center"><i class="fas fa-spinner fa-spin"></i> ' + Lang.t('loading') + '</div>';

        setTimeout(() => {
            const booking = DataAPI.getBookingStatus(ref, email);
            if (!booking) {
                resultContainer.innerHTML = `<div class="alert alert-warning mt-3">${Lang.t('booking_not_found')}</div>`;
                return;
            }
            const room = DataAPI.getRoom(booking.roomId);
            resultContainer.innerHTML = `
                <div class="glass-card mt-3 p-3">
                    <p><strong>${Lang.t('booking_reference')}:</strong> ${escapeHtml(booking.reference)}</p>
                    <p><strong>${Lang.t('full_name')}:</strong> ${escapeHtml(booking.customerName)}</p>
                    <p><strong>${Lang.t('room')}:</strong> #${escapeHtml(room ? room.number : 'N/A')}</p>
                    <p><strong>${Lang.t('checkin')}:</strong> ${escapeHtml(booking.checkin)}</p>
                    <p><strong>${Lang.t('checkout')}:</strong> ${escapeHtml(booking.checkout)}</p>
                    <p><strong>${Lang.t('guests')}:</strong> ${escapeHtml(String(booking.guests))}</p>
                    <p><strong>${Lang.t('status')}:</strong> <span class="badge-status ${booking.status === 'Pending' ? 'pending' : booking.status === 'Checked-in' ? 'active' : 'completed'}">${escapeHtml(booking.status)}</span></p>
                    <p><strong>${Lang.t('total_price')}:</strong> ${formatCurrency(booking.totalPrice)}</p>
                </div>
            `;
        }, 500);
    },

    // ---------- CONTACT ----------
    submitContact() {
        const name = document.getElementById('contactName').value.trim();
        const email = document.getElementById('contactEmailInput').value.trim();
        const phone = document.getElementById('contactPhoneInput').value.trim();
        const subject = document.getElementById('contactSubject').value.trim();
        const message = document.getElementById('contactMessage').value.trim();

        if (!name || !email || !message) {
            PublicToast.warning(Lang.t('required_field'));
            return;
        }
        if (!email.includes('@')) {
            PublicToast.warning(Lang.t('valid_email'));
            return;
        }

        const btn = document.querySelector('#contactForm button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + Lang.t('loading');

        setTimeout(() => {
            try {
                DataAPI.submitContact({ name, email, phone, subject, message });
                PublicToast.success('Xabaringiz yuborildi!');
                document.getElementById('contactForm').reset();
            } catch (_) {
                PublicToast.error(Lang.t('error_generic'));
            } finally {
                btn.disabled = false;
                btn.innerHTML = Lang.t('send');
            }
        }, 600);
    }
};

// ============================================================
// BOOT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});