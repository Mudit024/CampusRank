import axios from 'axios';

// Base API configuration. Points to relative dev proxy path or production URL.
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api/v1',
    withCredentials: true, // Enables sharing HttpOnly session cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

// Global interceptor to handle token expirations and automatic rotation
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Check if backend returned 401 with standard TOKEN_EXPIRED code
        const isExpiredError = 
            error.response?.status === 401 && 
            error.response?.data?.errors?.some(e => e.code === 'TOKEN_EXPIRED');

        if (isExpiredError && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Post request to refresh token endpoint. Browser automatically carries HttpOnly refreshToken cookie.
                const response = await axios.post(
                    `${import.meta.env.VITE_API_URL || '/api/v1'}/auth/refresh-token`,
                    {},
                    { withCredentials: true }
                );

                const { accessToken } = response.data.data;

                // Bind new token to headers for retry if authorization header was present
                if (accessToken) {
                    originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
                }

                // Retry original request
                return apiClient(originalRequest);
            } catch (refreshError) {
                console.error("🔒 Session expired. Redirecting to login page...", refreshError);
                localStorage.removeItem("user");
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
