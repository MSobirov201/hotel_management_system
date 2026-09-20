/**
 * public.js — HotelMS Public sahifa interaktivligi
 * API bilan bog‘lanish, xonalarni yuklash, bron qilish
 */

function _pLocalDateStr(d) {
    d = d || new Date();
    return d.getFullYear() + '-' +
           String(d.getMonth() + 1).padStart(2, '0') + '-' +
           String(d.getDate()).padStart(2, '0');
}
function _pParseLocalDate(s) {
    if (!s) return null;
    var p = String(s).split('-');
    if (p.length !== 3) return new Date(s);
    return new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
}
function _pStatusLabel(status) {
    var m = {
        available: 'Bo\u2018sh', booked: 'Band', occupied: 'Band (mehmon)',
        cleaning: 'Tozalashda', maintenance: 'Ta\u2019mirlashda',
        out_of_service: 'Xizmatdan chiqarilgan'
    };
    return m[status] || status || 'Mavjud';
}
function _pStatusClass(status) { return status || 'available'; }




const Public = {
    // Holat
    state: {
        rooms: [],
        filteredRooms: [],
        selectedRoom: null,
        checkin: null,
        checkout: null,
        guests: 2,
        isLoading: false,
        isSubmitting: false,
    },

    // DOM referanslari
    els: {},

    init() {
        // DOM elementlarini yig‘ish
        this.els = {
            roomsGrid: document.getElementById('roomsGrid'),
            roomsLoading: document.getElementById('roomsLoading'),
            roomsEmpty: document.getElementById('roomsEmpty'),
            roomsError: document.getElementById('roomsError'),
            roomSubtitle: document.getElementById('roomSubtitle'),

            searchForm: document.getElementById('searchForm'),
            searchCheckin: document.getElementById('searchCheckin'),
            searchCheckout: document.getElementById('searchCheckout'),
            searchGuests: document.getElementById('searchGuests'),

            bookingSection: document.getElementById('bookingSection'),
            bookingForm: document.getElementById('bookingForm'),
            bookingRoomId: document.getElementById('bookingRoomId'),
            selectedRoomName: document.getElementById('selectedRoomName'),
            bookCheckin: document.getElementById('bookCheckin'),
            bookCheckout: document.getElementById('bookCheckout'),
            guestCount: document.getElementById('guestCount'),
            guestFullName: document.getElementById('guestFullName'),
            guestPassport: document.getElementById('guestPassport'),
            guestPhone: document.getElementById('guestPhone'),
            guestEmail: document.getElementById('guestEmail'),
            specialRequests: document.getElementById('specialRequests'),
            bookingTotalPrice: document.getElementById('bookingTotalPrice'),

            confirmationSection: document.getElementById('confirmationSection'),
            confId: document.getElementById('confId'),
            confRoom: document.getElementById('confRoom'),
            confCheckin: document.getElementById('confCheckin'),
            confCheckout: document.getElementById('confCheckout'),
            confGuests: document.getElementById('confGuests'),
            confTotal: document.getElementById('confTotal'),
            confStatus: document.getElementById('confStatus'),
        };

        // Sanalarni sozlash
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

                this.els.searchCheckin.value = _pLocalDateStr(today);
        this.els.searchCheckout.value = _pLocalDateStr(tomorrow);
        this.els.searchCheckin.min = _pLocalDateStr(today);

        // Event listenerlar
        this.els.searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.searchAvailability();
        });

        this.els.bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitBooking();
        });

        // Xona kartalaridagi tugmalar uchun event delegation.
        // UUID id'larni inline onclick ichiga qo'shish xavfli (UUID ichidagi
        // "-" belgilari JS operatoriga o'xshab qoladi), shuning uchun
        // data-* atributlar va bitta delegatsiyalangan listener ishlatiladi.
        this.els.roomsGrid.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;
            const roomId = btn.dataset.roomId;
            if (!roomId) return;
            if (btn.dataset.action === 'view') {
                this.viewRoom(roomId);
            } else if (btn.dataset.action === 'book') {
                this.openBooking(roomId);
            }
        });





        this.setupBookingValidation();
        this.setupPhoneFormatting();
        this.setupBookingDates();
        this._bindEscapeClose();

        // Xonalarni yuklash
        this.loadRooms();
    },

    _bindEscapeClose: function () {
        if (Public._escapeBound) return;
        Public._escapeBound = true;
        document.addEventListener('keydown', function (e) {
            if (e.key !== 'Escape') return;
            var bm = document.getElementById('bookingSection');
            var rm = document.getElementById('roomDetailsModal');
            if (rm && !rm.classList.contains('d-none')) {
                Public.closeRoomDetails();
            } else if (bm && !bm.classList.contains('d-none')) {
                Public.closeBookingForm();
            }
        });
    },

    // ===== Xonalarni yuklash =====
    // Eslatma: public sahifada "barcha xonalar" ro'yxati yo'q — narx va
    // mavjudlik faqat sana oralig'i uchun ma'noli, shuning uchun bu metod
    // joriy qidiruv sanalari bo'yicha /api/v1/public/rooms/availability/
    // (yagona autentifikatsiyasiz endpoint) orqali xonalarni yuklaydi.
    async loadRooms() {
        await this.searchAvailability();
    },

    // ===== Mavjudlikni qidirish =====
    async searchAvailability() {
        if (this.state.isLoading) return;

        const checkin = this.els.searchCheckin.value;
        const checkout = this.els.searchCheckout.value;
        const guests = parseInt(this.els.searchGuests.value, 10);

        if (!checkin || !checkout) {
            this.showToast('Iltimos, kirish va chiqish sanalarini tanlang', 'warning');
            return;
        }

        if (new Date(checkin) >= new Date(checkout)) {
            this.showToast('Chiqish sanasi kirish sanasidan keyin bo‘lishi kerak', 'warning');
            return;
        }

        this.state.checkin = checkin;
        this.state.checkout = checkout;
        this.state.guests = guests;
        this.state.isLoading = true;

        this.showState('loading');

        try {
            const params = new URLSearchParams({ checkin, checkout, guests: String(guests) });
            const response = await apiRequest(`/api/v1/public/rooms/availability/?${params.toString()}`);

            const rooms = response.rooms || [];
            this.state.rooms = rooms;
            this.state.filteredRooms = rooms;
            this.renderRooms(this.state.filteredRooms);

            if (this.state.filteredRooms.length === 0) {
                this.showState('empty');
            } else {
                this.showState('grid');
                this.els.roomSubtitle.textContent =
                    `${this.state.filteredRooms.length} ta xona topildi`;
            }
        } catch (error) {
            console.error('Qidiruvda xatolik:', error);
            this.showState('error');
            this.showToast(this.friendlyErrorMessage(error, 'Xonalarni qidirishda xatolik yuz berdi.'), 'error');
        } finally {
            this.state.isLoading = false;
        }
    },

    // ===== Xonalarni render qilish =====
    renderRooms(rooms) {
        const grid = this.els.roomsGrid;
        grid.innerHTML = '';

        if (!rooms || rooms.length === 0) {
            this.showState('empty');
            return;
        }

        rooms.forEach((room) => {
            const statusMap = {
                available: 'Bo‘sh',
                booked: 'Band',
                occupied: 'Band',
                maintenance: 'Taʼmirda',
                unavailable: 'Mavjud emas',
            };

            const statusClass = room.status || 'available';
            const statusLabel = statusMap[statusClass] || statusClass;

            const card = document.createElement('div');
            card.className = 'ds-room-card';
            card.setAttribute('data-scrolly-down', 'fadeInUp');
            card.style.animationDelay = (rooms.indexOf(room) * 50) + 'ms';

            card.innerHTML = `
                <div class="ds-room-img">
                    <i class="fas fa-bed"></i>
                    <span class="ds-room-badge ${statusClass}">${statusLabel}</span>
                </div>
                <div class="ds-room-body">
                    <div class="ds-room-header">
                        <span class="ds-room-name">${room.number || 'Xona'}</span>
                        <span class="ds-room-type">${room.room_type || 'Standart'}</span>
                    </div>
                    <div class="ds-room-meta">
                                                <span class="ds-room-capacity">
                            <i class="fas fa-user"></i> ${room.capacity || 5} kishi
                        </span>
                        <span class="ds-room-price">
                            $${room.price_per_night || 0} <small>/ kecha</small>
                        </span>
                    </div>
                    <div class="ds-room-actions">
                        <button class="ds-btn-ghost" data-action="view" data-room-id="${room.id}">
                            <i class="fas fa-eye"></i> Ko‘rish
                        </button>
                        <button class="ds-btn-primary" data-action="book" data-room-id="${room.id}"
                            ${statusClass !== 'available' ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
                            <i class="fas fa-pen-alt"></i> Bron qilish
                        </button>
                    </div>
                </div>
            `;

            grid.appendChild(card);
        });

        // ScrollyJS yangi elementlarni qayta ishlashi uchun
        if (typeof Scrolly !== 'undefined') {
            Scrolly.init();
        }
    },

    // ===== Holatni ko‘rsatish =====
    showState(state) {
        const loading = this.els.roomsLoading;
        const grid = this.els.roomsGrid;
        const empty = this.els.roomsEmpty;
        const error = this.els.roomsError;

        loading.classList.add('d-none');
        grid.classList.add('d-none');
        empty.classList.add('d-none');
        error.classList.add('d-none');

        if (state === 'loading') {
            loading.classList.remove('d-none');
        } else if (state === 'grid') {
            grid.classList.remove('d-none');
        } else if (state === 'empty') {
            empty.classList.remove('d-none');
        } else if (state === 'error') {
            error.classList.remove('d-none');
        }
    },

    // ===== Xona haqida =====
viewRoom(roomId) {
    const room = this.state.rooms.find(
        r => String(r.id) === String(roomId)
    );

    if (!room) return;

    const modal = document.getElementById('roomDetailsModal');
    const content = document.getElementById('roomDetailsContent');
    const bookBtn = document.getElementById('roomDetailsBookBtn');

    if (!modal || !content) return;

    content.innerHTML = `
        <div class="ds-room-details">

            <div class="ds-room-details-icon">
                <i class="fas fa-bed"></i>
            </div>

            <div class="ds-room-details-main">
                <span class="ds-room-details-badge ${_pStatusClass(room.status)}">
                    ${this.escapeHtml(_pStatusLabel(room.status))}
                </span>

                <h2>Xona ${this.escapeHtml(room.number)}</h2>

                <p class="ds-room-details-type">
                    ${this.escapeHtml(room.room_type)}
                </p>
            </div>

            <div class="ds-room-details-info">

                <div class="ds-detail-item">
                    <i class="fas fa-users"></i>
                    <span>
                        <small>Sig‘imi</small>
                        <strong>${room.capacity} mehmon</strong>
                    </span>
                </div>

                <div class="ds-detail-item">
                    <i class="fas fa-money-bill-wave"></i>
                    <span>
                        <small>Narxi</small>
                        <strong>$${Number(room.price_per_night).toFixed(2)} / kecha</strong>
                    </span>
                </div>

            </div>

            ${
                room.description
                    ? `
                        <div class="ds-room-description">
                            <h4>Xona haqida</h4>
                            <p>${this.escapeHtml(room.description)}</p>
                        </div>
                    `
                    : ''
            }

        </div>
    `;

    bookBtn.onclick = () => {
        this.closeRoomDetails();
        this.openBooking(room.id);
    };

    modal.classList.remove('d-none');
    document.body.classList.add('ds-modal-open');
},


    closeRoomDetails() {
    const modal = document.getElementById('roomDetailsModal');

    if (modal) {
        modal.classList.add('d-none');
    }

    document.body.classList.remove('ds-modal-open');
},

escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
},



    // ===== Bron formasini ochish =====
    openBooking(roomId) {
    const room = this.state.rooms.find(r => r.id === roomId);

    if (!room) {
        this.showToast('Xona topilmadi', 'error');
        return;
    }

    this.state.selectedRoom = room;

    this.els.bookingRoomId.value = room.id;
const selectedRoomName = document.getElementById('bookingSelectedRoom');

if (selectedRoomName) {
    selectedRoomName.textContent =
        `${room.number} (${room.room_type})`;
}

    // Sanalarni formaga o'tkazish
    this.els.bookCheckin.value =
        this.state.checkin || this.els.searchCheckin.value;

    this.els.bookCheckout.value =
        this.state.checkout || this.els.searchCheckout.value;

    var _cap = Math.min(parseInt(room.capacity, 10) || 1, 5);
    var _sel = this.els.guestCount;
    _sel.innerHTML = '';
    for (var _g = 1; _g <= _cap; _g++) {
        var _opt = document.createElement('option');
        _opt.value = String(_g);
        _opt.textContent = _g + ' mehmon';
        _sel.appendChild(_opt);
    }
    var _pref = Math.min(parseInt(this.state.guests, 10) || 1, _cap);
    _sel.value = String(_pref);

    // Formani tozalash
    this.els.guestFullName.value = '';
    this.els.guestPassport.value = '';
    this.els.guestPhone.value = '';
    this.els.guestEmail.value = '';
    this.els.specialRequests.value = '';

    // Eski validation ranglarini olib tashlash
    [
        this.els.guestFullName,
        this.els.guestPassport,
        this.els.guestPhone,
        this.els.guestEmail,
        this.els.guestCount,
        this.els.bookCheckin,
        this.els.bookCheckout
    ].forEach(field => {
        if (field) {
            field.classList.remove('is-invalid', 'is-valid');
        }
    });

    // Narxni hisoblash
    this.calculateTotal();

    // Booking modalni ochish
    this.els.bookingSection.classList.remove('d-none');
    document.body.classList.add('ds-modal-open');
},


    // ===== Umumiy narxni hisoblash =====
        calculateTotal() {
        const room = this.state.selectedRoom;
        if (!room) return;

        const checkin = _pParseLocalDate(this.els.bookCheckin.value);
        const checkout = _pParseLocalDate(this.els.bookCheckout.value);
        if (!checkin || !checkout) {
            this.els.bookingTotalPrice.textContent = '$0';
            return 0;
        }
        const nights = Math.max(1, Math.round((checkout - checkin) / 86400000));
        const total = Number(room.price_per_night || 0) * nights;
        this.els.bookingTotalPrice.textContent = `$${total.toFixed(2)}`;
        return total;
    },

    // ===== Bronni yuborish =====
    async submitBooking() {

            if (!this.validateBookingForm()) {
        this.showToast(
            'Iltimos, qizil bilan belgilangan maydonlarni to‘g‘rilang.',
            'error'
        );
        return;
    }



        if (this.state.isSubmitting) return;

        const roomId = this.els.bookingRoomId.value; // UUID string — parseInt qilinmaydi
        const fullName = this.els.guestFullName.value.trim();
        const passport = this.els.guestPassport.value.trim();
        const phone = this.els.guestPhone.value.trim().replace(/\s/g, '');
        const email = this.els.guestEmail.value.trim(); // ixtiyoriy
        const guestCount = parseInt(this.els.guestCount.value, 10);
        const checkin = this.els.bookCheckin.value;
        const checkout = this.els.bookCheckout.value;
        const specialRequests = this.els.specialRequests.value.trim();

        // Validatsiya (backend kontraktiga mos: passport majburiy, email ixtiyoriy)
        if (!roomId) {
            this.showToast('Xona tanlanmagan. Iltimos, avval xonani tanlang.', 'warning');
            return;
        }
        if (!fullName) {
            this.showToast('Iltimos, to‘liq ismingizni kiriting', 'warning');
            return;
        }
        if (!passport) {
            this.showToast('Iltimos, passport ma’lumotini kiriting', 'warning');
            return;
        }
        if (!phone) {
            this.showToast('Iltimos, telefon raqamingizni kiriting', 'warning');
            return;
        }
        if (email && !email.includes('@')) {
            this.showToast('Iltimos, to‘g‘ri email manzilini kiriting yoki bo‘sh qoldiring', 'warning');
            return;
        }

        const bookingData = {
            room: roomId,
            full_name: fullName,
            passport: passport,
            phone: phone,
            checkin: checkin,
            checkout: checkout,
            guest_count: guestCount,
            special_requests: specialRequests,
        };
        if (email) {
            bookingData.email = email;
        }

        this.state.isSubmitting = true;
        const submitBtn = this.els.bookingForm.querySelector('[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;

        try {
            const response = await apiRequest('/api/v1/public/bookings/', {
                method: 'POST',
                body: JSON.stringify(bookingData),
            });

            // Tasdiqlashni ko‘rsatish (haqiqiy javob: {success, booking: {...}})
            this.showConfirmation(response.booking);
            this.els.bookingSection.classList.add('d-none');

            // Xonalarni qayta yuklash (band bo'lgan xona ro'yxatdan chiqishi uchun)
            this.loadRooms();

        } catch (error) {
            console.error('Bron qilishda xatolik:', error);
            this.showToast(
                this.friendlyErrorMessage(error, 'Bron qilish amalga oshmadi. Iltimos, qayta urinib ko‘ring.'),
                'error'
            );
        } finally {
            this.state.isSubmitting = false;
            if (submitBtn) submitBtn.disabled = false;
        }
    },

    // ===== Backend xatosidan foydalanuvchiga tushunarli xabar chiqarish =====
    // Ichki server xatoliklarini (stack trace va h.k.) hech qachon
    // to'g'ridan-to'g'ri ko'rsatmaydi — faqat backend qaytargan
     // validatsiya xabarlarini yoki umumiy fallback matnni ko'rsatadi.
    friendlyErrorMessage(error, fallback) {
        if (!error) return fallback;

        // Tarmoq xatosi (server bilan aloqa umuman o'rnatilmagan)
        if (!error.status) {
            return 'Internet aloqasi bilan muammo. Iltimos, ulanishni tekshirib qayta urinib ko‘ring.';
        }

        if (error.status === 400 && error.data) {
            const details = error.data.details || error.data.error;
            if (details && typeof details === 'object') {
                const firstKey = Object.keys(details)[0];
                const firstMsg = Array.isArray(details[firstKey]) ? details[firstKey][0] : details[firstKey];
                if (firstMsg) return String(firstMsg);
            }
            if (typeof error.data.error === 'string') return error.data.error;
        }

        if (error.status === 404) {
            return 'So‘ralgan ma’lumot topilmadi.';
        }

        if (error.status >= 500) {
            return fallback;
        }

        return fallback;
    },

    // ===== Tasdiqlashni ko‘rsatish =====
    showConfirmation(data) {
        if (!data) return;
        this.els.confId.textContent = data.reference || data.id || '—';
        this.els.confRoom.textContent = data.room?.number || '—';
        this.els.confCheckin.textContent = data.checkin || '—';
        this.els.confCheckout.textContent = data.checkout || '—';
        this.els.confGuests.textContent = data.guest_count || '—';
        this.els.confTotal.textContent = `$${data.total_price || 0}`;
        this.els.confStatus.textContent = data.status || 'pending';

        this.els.confirmationSection.classList.remove('d-none');
        this.els.confirmationSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },

    // ===== Bron formasini yopish =====
closeBookingForm() {
    const modal = document.getElementById('bookingSection');

    if (modal) {
        modal.classList.add('d-none');
    }

    document.body.classList.remove('ds-modal-open');

    this.state.selectedRoom = null;
},


    setupBookingValidation() {
    const form = document.getElementById('bookingForm');
    if (!form) return;

    const fields = [
        'guestFullName',
        'guestPassport',
        'guestPhone',
        'guestEmail',
        'guestCount',
        'bookCheckin',
        'bookCheckout'
    ];

    fields.forEach(id => {
        const field = document.getElementById(id);
        if (!field) return;

        field.addEventListener('input', () => {
            this.validateField(field);
        });

        field.addEventListener('change', () => {
            this.validateField(field);
        });
    });
},

validateField(field) {
    if (!field) return true;

    let valid = true;

    if (field.required && !String(field.value || '').trim()) {
        valid = false;
    }

    if (field.id === 'guestFullName' && field.value.trim()) {
        valid = /^[A-Za-zА-Яа-яЁёЎўҚқҒғҲҳ\s.'-]{2,}$/.test(field.value.trim());
    }

    if (field.id === 'guestPassport' && field.value.trim()) {
        valid = /^[A-Za-z0-9]{6,}$/.test(field.value.trim());
    }

    if (field.id === 'guestPhone' && field.value.trim()) {
        valid = /^\+[0-9]{10,15}$/.test(field.value.replace(/\s/g, ''));
    }

    if (field.id === 'guestEmail' && field.value.trim()) {
        valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
    }

    if (field.id === 'bookCheckin' || field.id === 'bookCheckout') {
        const checkin = document.getElementById('bookCheckin')?.value;
        const checkout = document.getElementById('bookCheckout')?.value;

        if (field.value) {
            valid = true;
        }

        if (checkin && checkout && checkout <= checkin) {
            if (field.id === 'bookCheckout') valid = false;
        }
    }

    field.classList.toggle('is-invalid', !valid);
    field.classList.toggle('is-valid', valid && !!field.value);

    return valid;
},

validateBookingForm() {
    const ids = [
        'guestFullName',
        'guestPassport',
        'guestPhone',
        'guestCount',
        'bookCheckin',
        'bookCheckout'
    ];

    let valid = true;

    ids.forEach(id => {
        const field = document.getElementById(id);
        if (field && !this.validateField(field)) {
            valid = false;
        }
    });

    const email = document.getElementById('guestEmail');
    if (email && email.value.trim() && !this.validateField(email)) {
        valid = false;
    }

    const checkin = document.getElementById('bookCheckin')?.value;
    const checkout = document.getElementById('bookCheckout')?.value;

    if (checkin && checkout && checkout <= checkin) {
        const checkoutField = document.getElementById('bookCheckout');
        checkoutField?.classList.add('is-invalid');
        valid = false;
    }

    return valid;
},

setupPhoneFormatting() {
    const phone = document.getElementById('guestPhone');
    if (!phone) return;

    phone.setAttribute('placeholder', '+998 93 256 70 93');

    phone.addEventListener('input', () => {
        const rawValue = phone.value;

        // Agar foydalanuvchi hammasini o'chirsa — bo'sh qoldiramiz
        if (!rawValue || rawValue === '+' || rawValue === '+9' || rawValue === '+99') {
            if (rawValue === '' || rawValue === '+') {
                phone.value = rawValue;
                this.validateField(phone);
                return;
            }
        }

        // Faqat raqam, + va bo'sh joy qoldiramiz
        let value = rawValue.replace(/[^\d+\s]/g, '');

        // + bilan boshlanishini ta'minlaymiz
        if (value && !value.startsWith('+')) {
            value = '+' + value.replace(/\+/g, '');
        }

        // O'zbek raqami formati: +998 XX XXX XX XX
        if (value.startsWith('+998')) {
            const digits = value.slice(4).replace(/\D/g, '').slice(0, 9);
            if (digits.length === 0 && value === '+998') {
                // Faqat +998 qolgan bo'lsa, keyingi belgini kutamiz
                phone.value = '+998';
            } else {
                let formatted = '+998';
                if (digits.length > 0) formatted += ' ' + digits.slice(0, 2);
                if (digits.length > 2) formatted += ' ' + digits.slice(2, 5);
                if (digits.length > 5) formatted += ' ' + digits.slice(5, 7);
                if (digits.length > 7) formatted += ' ' + digits.slice(7, 9);
                phone.value = formatted;
            }
        } else {
            // Boshqa xalqaro raqam — majburan formatlamaymiz
            phone.value = value.slice(0, 18);
        }

        this.validateField(phone);
    });

    phone.addEventListener('focus', () => {
        if (!phone.value || phone.value === '+') {
            phone.value = '+998 ';
            try { phone.setSelectionRange(phone.value.length, phone.value.length); } catch(e){}
        }
    });

    phone.addEventListener('blur', () => {
        if (phone.value === '+998 ' || phone.value === '+998') {
            phone.value = '';
        }
    });
},
setupBookingDates() {
    const checkin = document.getElementById('bookCheckin');
    const checkout = document.getElementById('bookCheckout');

    if (!checkin || !checkout) return;

    const today = new Date().toISOString().split('T')[0];

    checkin.min = today;
    checkout.min = today;

    checkin.addEventListener('change', () => {
        if (!checkin.value) return;

        const nextDay = new Date(checkin.value + 'T00:00:00');
        nextDay.setDate(nextDay.getDate() + 1);

        const minCheckout = nextDay.toISOString().split('T')[0];

        checkout.min = minCheckout;

        if (!checkout.value || checkout.value < minCheckout) {
            checkout.value = minCheckout;
        }

        this.calculateTotal();
        this.validateField(checkin);
        this.validateField(checkout);
    });

    checkout.addEventListener('change', () => {
        this.calculateTotal();
        this.validateField(checkout);
    });
},



    // ===== Qayta o‘rnatish =====
    resetBooking() {
        this.els.confirmationSection.classList.add('d-none');
        this.closeBookingForm();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.loadRooms();
    },

    // ===== Toast xabar =====
    showToast(message, type = 'info') {
        // Mavjud toastlarni o‘chirish
        const container = document.getElementById('toastContainer') || this.createToastContainer();

        const toast = document.createElement('div');
        toast.className = `ds-toast ds-toast-${type}`;
        toast.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('ds-toast-out');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.style.cssText = `
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 99999;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            max-width: 420px;
            width: calc(100% - 32px);
            pointer-events: none;
        `;
        document.body.appendChild(container);
        return container;
    }
};

// ===== API so‘rov yordamchisi =====
async function apiRequest(url, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...(options.headers || {}),
        },
    };

    let response;
    try {
        response = await fetch(url, mergedOptions);
    } catch (networkError) {
        // fetch o'zi network darajasida muvaffaqiyatsiz bo'lsa (server
        // umuman javob bermagan) — status yo'q xato uchraydi.
        const err = new Error('Network request failed');
        err.status = null;
        err.data = null;
        throw err;
    }

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
        const err = new Error(body.message || body.error || `HTTP ${response.status}`);
        err.status = response.status;
        err.data = body;
        throw err;
    }

    return body;
}

// ============================================================
// Toast stillari (inline)
// ============================================================
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    .ds-toast {
        pointer-events: auto;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 0.6rem 1.4rem;
        border-radius: var(--ds-radius-pill, 9999px);
        background: var(--ds-glass-bg, rgba(255,255,255,0.06));
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid var(--ds-glass-border, rgba(255,255,255,0.08));
        color: var(--ds-text-primary, #F1F5F9);
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        font-weight: 500;
        font-size: 0.9rem;
        animation: dsToastIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        min-height: 44px;
        width: 100%;
    }
    .ds-toast.ds-toast-success { border-left: 4px solid #10B981; }
    .ds-toast.ds-toast-error { border-left: 4px solid #EF4444; }
    .ds-toast.ds-toast-warning { border-left: 4px solid #F59E0B; }
    .ds-toast.ds-toast-info { border-left: 4px solid #5B5FFF; }
    .ds-toast.ds-toast-out {
        animation: dsToastOut 0.3s ease forwards;
    }
    @keyframes dsToastIn {
        from { opacity: 0; transform: translateY(20px) scale(0.95); }
        to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes dsToastOut {
        from { opacity: 1; transform: scale(1); }
        to { opacity: 0; transform: scale(0.9); }
    }
    [data-theme="light"] .ds-toast {
        background: rgba(255,255,255,0.92);
        color: #0A1628;
        border-color: rgba(0,0,0,0.06);
    }
`;
document.head.appendChild(toastStyles);