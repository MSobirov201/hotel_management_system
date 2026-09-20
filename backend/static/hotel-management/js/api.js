// ============================================================
// API CLIENT — Dynamic URL Resolution
// ============================================================
function _resolveApiOrigin() {
    if (typeof window !== 'undefined' && window.HMS_API_BASE) {
        return String(window.HMS_API_BASE).replace(/\/+$/, '');
    }
    if (typeof document !== 'undefined') {
        var _m = document.querySelector('meta[name="hms-api-base"]');
        if (_m && _m.content && String(_m.content).trim()) {
            return String(_m.content).trim().replace(/\/+$/, '');
        }
    }
    if (typeof window !== 'undefined' && window.location) {
        if (window.location.protocol !== 'file:') {
            return window.location.origin;
        }
    }
    return 'http://127.0.0.1:8000';
}

const API_ORIGIN = _resolveApiOrigin();
const API_BASE_URL = API_ORIGIN + '/api/v1';
const TOKEN_URL = API_ORIGIN + '/api/token/';
const REFRESH_URL = API_ORIGIN + '/api/token/refresh/';

let refreshPromise = null;
let isRefreshing = false;
let pendingRequests = [];

class ApiClient {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.accessToken = localStorage.getItem('hms_access_token') || null;
        this.refreshToken = localStorage.getItem('hms_refresh_token') || null;
    }

    setTokens(access, refresh) {
        this.accessToken = access;
        this.refreshToken = refresh;
        if (access) localStorage.setItem('hms_access_token', access);
        else localStorage.removeItem('hms_access_token');
        if (refresh) localStorage.setItem('hms_refresh_token', refresh);
        else localStorage.removeItem('hms_refresh_token');
    }

    clearTokens() {
        this.accessToken = null;
        this.refreshToken = null;
        localStorage.removeItem('hms_access_token');
        localStorage.removeItem('hms_refresh_token');
    }

    getHeaders(includeAuth = true) {
        const headers = { 'Content-Type': 'application/json' };
        if (includeAuth && this.accessToken) {
            headers['Authorization'] = `Bearer ${this.accessToken}`;
        }
        return headers;
    }

    async request(method, endpoint, data = null, includeAuth = true, retry = true) {
        const url = `${this.baseURL}${endpoint}`;
        const options = { method, headers: this.getHeaders(includeAuth) };
        if (data) options.body = JSON.stringify(data);

        try {
            const response = await fetch(url, options);

            if (response.status === 401 && includeAuth && retry) {
                const refreshed = await this.refreshTokenFlow();
                if (refreshed) {
                    return this.request(method, endpoint, data, includeAuth, false);
                } else {
                    this.clearTokens();
                    if (typeof Auth !== 'undefined' && Auth.logout) Auth.logout();
                    throw new Error('Session expired. Please login again.');
                }
            }

            if (response.status === 204) return null;

            const responseData = await response.json();

            if (!response.ok) {
                throw {
                    status: response.status,
                    data: responseData,
                    message: responseData.error?.message || responseData.detail || 'Request failed',
                };
            }

            return responseData;
        } catch (error) {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw { message: 'Network error. Please check your connection.' };
            }
            throw error;
        }
    }

    async refreshTokenFlow() {
        if (isRefreshing) {
            return new Promise((resolve) => { pendingRequests.push(resolve); });
        }
        isRefreshing = true;
        refreshPromise = null;

        try {
            if (!this.refreshToken) throw new Error('No refresh token available');

            const response = await fetch(REFRESH_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh: this.refreshToken }),
            });

            if (!response.ok) throw new Error('Refresh failed');

            const data = await response.json();
            this.setTokens(data.access, this.refreshToken);

            pendingRequests.forEach(resolve => resolve(true));
            pendingRequests = [];
            return true;
        } catch (error) {
            this.clearTokens();
            pendingRequests.forEach(resolve => resolve(false));
            pendingRequests = [];
            return false;
        } finally {
            isRefreshing = false;
        }
    }

    async get(endpoint, includeAuth = true) { return this.request('GET', endpoint, null, includeAuth); }
    async post(endpoint, data, includeAuth = true) { return this.request('POST', endpoint, data, includeAuth); }
    async put(endpoint, data, includeAuth = true) { return this.request('PUT', endpoint, data, includeAuth); }
    async patch(endpoint, data, includeAuth = true) { return this.request('PATCH', endpoint, data, includeAuth); }
    async delete(endpoint, includeAuth = true) { return this.request('DELETE', endpoint, null, includeAuth); }
}

const apiClient = new ApiClient();

// ============================================================
// ROOM SERVICE
// ============================================================
const roomService = {
    _pagination: { count: 0, next: null, previous: null, currentPage: 1, pageSize: 25 },
    getPagination() { return this._pagination; },

    async getRooms(page = 1) {
        const response = await apiClient.get(`/rooms/?page=${page}`);
        this._pagination = {
            count: response.count || 0,
            next: response.next,
            previous: response.previous,
            currentPage: page,
            pageSize: 25,
        };
        return response.results || [];
    },

    async getRoom(id) { return await apiClient.get(`/rooms/${id}/`); },
    async createRoom(data) { return await apiClient.post('/rooms/', data); },
    async updateRoom(id, data) { return await apiClient.put(`/rooms/${id}/`, data); },
    async deleteRoom(id) { await apiClient.delete(`/rooms/${id}/`); return true; },
};

// ============================================================
// AUTH / PROFILE SERVICE
// ============================================================
const AUTH_BASE_URL = API_ORIGIN + '/api/auth';

async function authApiRequest(method, endpoint, data) {
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('hms_access_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const options = { method, headers };
    if (data) options.body = JSON.stringify(data);

    let response = await fetch(AUTH_BASE_URL + endpoint, options);

    if (response.status === 401) {
        try {
            const refreshed = await apiClient.refreshTokenFlow();
            if (refreshed) {
                const newToken = localStorage.getItem('hms_access_token');
                if (newToken) headers['Authorization'] = `Bearer ${newToken}`;
                response = await fetch(AUTH_BASE_URL + endpoint, { ...options, headers });
            }
        } catch (e) {}
    }

    const responseData = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw {
            status: response.status,
            data: responseData,
            message: responseData.detail || responseData.message || ('HTTP ' + response.status),
        };
    }
    return responseData;
}

const authProfileService = {
    async getMe() { return await authApiRequest('GET', '/me/'); },
    async updateMe(data) { return await authApiRequest('PATCH', '/me/', data); },
    async changePassword(currentPassword, newPassword) {
        return await authApiRequest('POST', '/change-password/', {
            current_password: currentPassword,
            new_password: newPassword,
        });
    },
};

// ============================================================
// CUSTOMER SERVICE
// ============================================================
const customerService = {
    _pagination: { count: 0, next: null, previous: null, currentPage: 1, pageSize: 25 },
    getPagination() { return this._pagination; },

    async getCustomers(page = 1, search = '') {
        const params = new URLSearchParams({ page: String(page) });
        if (search) params.set('search', search);
        const response = await apiClient.get(`/customers/?${params.toString()}`);
        this._pagination = {
            count: response.count || 0, next: response.next,
            previous: response.previous, currentPage: page, pageSize: 25,
        };
        return response.results || [];
    },

    async getCustomer(id) { return await apiClient.get(`/customers/${id}/`); },
    async createCustomer(data) { return await apiClient.post('/customers/', data); },
    async updateCustomer(id, data) { return await apiClient.put(`/customers/${id}/`, data); },
    async deleteCustomer(id) { await apiClient.delete(`/customers/${id}/`); return true; },
    async reactivateCustomer(id) { return await apiClient.post(`/customers/${id}/reactivate/`, {}); },
};

// ============================================================
// BOOKING SERVICE
// ============================================================
const bookingService = {
    _pagination: { count: 0, next: null, previous: null, currentPage: 1, pageSize: 25 },
    getPagination() { return this._pagination; },

    async getBookings(page = 1) {
        const response = await apiClient.get(`/bookings/?page=${page}`);
        this._pagination = {
            count: response.count || 0, next: response.next,
            previous: response.previous, currentPage: page, pageSize: 25,
        };
        return response.results || [];
    },

    async getBooking(id) { return await apiClient.get(`/bookings/${id}/`); },
    async createBooking(data) { return await apiClient.post('/bookings/', data); },
    async updateBooking(id, data) { return await apiClient.put(`/bookings/${id}/`, data); },
    async deleteBooking(id) { await apiClient.delete(`/bookings/${id}/`); return true; },
    async checkIn(id) { return await apiClient.post(`/bookings/${id}/check-in/`, {}); },
    async checkOut(id) { return await apiClient.post(`/bookings/${id}/check-out/`, {}); },
    async cancelBooking(id) { return await apiClient.post(`/bookings/${id}/cancel/`, {}); },
    async checkAvailability(room, checkin, checkout) {
        const params = new URLSearchParams({ room, checkin, checkout });
        return await apiClient.get(`/bookings/availability/?${params.toString()}`);
    },
};

// ============================================================
// PAYMENT SERVICE
// ============================================================
const paymentService = {
    _pagination: { count: 0, next: null, previous: null, currentPage: 1, pageSize: 25 },
    getPagination() { return this._pagination; },

    async getPayments(page = 1) {
        const response = await apiClient.get(`/payments/?page=${page}`);
        this._pagination = {
            count: response.count || 0, next: response.next,
            previous: response.previous, currentPage: page, pageSize: 25,
        };
        return response.results || [];
    },

    async getPayment(id) { return await apiClient.get(`/payments/${id}/`); },
    async createPayment(data) { return await apiClient.post('/payments/', data); },
    async updatePayment(id, data) { return await apiClient.put(`/payments/${id}/`, data); },
    async deletePayment(id) { await apiClient.delete(`/payments/${id}/`); return true; },
    async refundPayment(id) { return await apiClient.post(`/payments/${id}/refund/`, {}); },
};