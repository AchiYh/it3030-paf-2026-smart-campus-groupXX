import axios from "axios";

// Unified API instance for UniSphere
const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api",
    withCredentials: true, // Crucial for HttpOnly cookies
});

// Flag to prevent infinite retry loops
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const requestUrl = originalRequest?.url || "";
        const isRefreshRequest = requestUrl.includes("/auth/refresh");

        if (isRefreshRequest) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise(function(resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(() => {
                    return API(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Call the UniSphere refresh endpoint
                await API.post('/auth/refresh');

                isRefreshing = false;
                processQueue(null, 'refreshed');

                // Retry the original request
                return API(originalRequest);
            } catch (err) {
                isRefreshing = false;
                processQueue(err, null);
                
                // Only redirect to login if we are not already there
                if (!window.location.pathname.includes('/login')) {
                    // Optional: window.location.href = '/login';
                }
                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    }
);

export default API;
