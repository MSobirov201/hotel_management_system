// ============================================================
// AUTHENTICATION SERVICE — JWT based
// ============================================================
const AuthService = {
    _authState: null,

    getAuthState() { return this._authState; },

    async login(username, password) {
        try {
            const response = await fetch(TOKEN_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw {
                    status: response.status,
                    message: data.detail || "Login yoki parol noto'g'ri",
                };
            }

            const data = await response.json();
            apiClient.setTokens(data.access, data.refresh);
            this._authState = 'AUTHENTICATED';
            sessionStorage.setItem('hms_session_login', 'true');
            return { success: true, data };
        } catch (error) {
            this._authState = 'UNAUTHENTICATED';
            throw error;
        }
    },

    logout() {
        apiClient.clearTokens();
        this._authState = 'UNAUTHENTICATED';
        sessionStorage.removeItem('hms_session_login');

        if (typeof AppState !== 'undefined' && AppState && AppState.data) {
            try {
                AppState.data = {
                    rooms: [], customers: [], bookings: [],
                    payments: [], notifications: []
                };
            } catch (e) {}
        }

        var loginPage = document.getElementById('loginPage');
        var app = document.getElementById('app');
        if (loginPage) loginPage.style.display = 'flex';
        if (app) app.style.display = 'none';
    },

    check() {
        const access = localStorage.getItem('hms_access_token');
        if (!access) {
            this._authState = 'NO_TOKEN';
            return false;
        }
        try {
            const payload = JSON.parse(atob(access.split('.')[1]));
            const exp = payload.exp * 1000;
            if (Date.now() > exp) {
                const refresh = localStorage.getItem('hms_refresh_token');
                if (refresh) {
                    this._authState = 'ACCESS_EXPIRED_REFRESH_AVAILABLE';
                    return true;
                }
                this._authState = 'UNAUTHENTICATED';
                return false;
            }
            this._authState = 'VALID_ACCESS';
            return true;
        } catch (e) {
            this._authState = 'UNAUTHENTICATED';
            return false;
        }
    },

    isAuthenticated() { return this.check(); }
};

// ============================================================
// AUTH — HIGH LEVEL API
// ============================================================
var Auth = {
    hashPassword: function (pwd) {
        var hash = 0;
        for (var i = 0; i < pwd.length; i++) {
            var c = pwd.charCodeAt(i);
            hash = ((hash << 5) - hash) + c;
            hash = hash & hash;
        }
        return 'h_' + Math.abs(hash).toString(36);
    },

    isLoggedIn: function () { return AuthService.isAuthenticated(); },

    login: async function (username, password, remember) {
        try {
            await AuthService.login(username, password);
            if (remember) {
                localStorage.setItem('hms_remember', 'true');
                localStorage.setItem('hms_user', username);
            } else {
                localStorage.removeItem('hms_remember');
                localStorage.removeItem('hms_user');
            }
            return true;
        } catch (error) {
            if (typeof Toast !== 'undefined') {
                Toast.error(error.message || 'Login amalga oshmadi');
            }
            return false;
        }
    },

    logout: function () {
        AuthService.logout();
        localStorage.removeItem('hms_logged_in');
        localStorage.removeItem('hms_remember');
        localStorage.removeItem('hms_user');
        sessionStorage.removeItem('hms_logged_in');
        sessionStorage.removeItem('hms_session_login');

        var app = document.getElementById('app');
        if (app) {
            app.style.animation = 'loginFadeOut 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
            setTimeout(function () { window.location.reload(); }, 500);
        } else {
            window.location.reload();
        }
    },

    resetPassword: function () {
        var defaultHash = this.hashPassword('admin123');
        localStorage.setItem('hms_password_hash', defaultHash);
        localStorage.removeItem('hms_logged_in');
        sessionStorage.removeItem('hms_logged_in');
        sessionStorage.removeItem('hms_session_login');
        Toast.success('Parol default holatga qaytarildi: admin123');
        setTimeout(function () { window.location.reload(); }, 500);
    },

    clearStorage: function () {
        AuthService.logout();
        localStorage.clear();
        sessionStorage.clear();
        Toast.success("Barcha ma'lumotlar tozalandi");
        setTimeout(function () { window.location.reload(); }, 500);
    },

    check: function () { return AuthService.isAuthenticated(); }
};