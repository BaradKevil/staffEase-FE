/**
 * ===========================================
 *  Axios API Client with Token Refresh & Interceptors
 * ===========================================
 */

import axios from 'axios';

const baseURL = import.meta.env.VITE_BASEURL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error, token = null) => {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  refreshQueue = [];
};

const clearSessionAndRedirect = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('role');
  localStorage.removeItem('user');
  window.location.href = '/';
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config: originalRequest } = error;

    if (!response) {
      return Promise.reject(error);
    }

    // 403 Forbidden
    if (response.status === 403) {
      const message = response.data?.message || 'Access denied.';

      // Handle pending approval explicitly
      if (message.toLowerCase().includes('pending') || message.toLowerCase().includes('review')) {
        window.location.href = '/pending-approval';
        return Promise.reject(error);
      }

      try {
        sessionStorage.setItem('not_authorized_message', message);
      } catch {
        // ignore
      }
      window.location.href = `/not-authorized?error=${encodeURIComponent(message)}`;
      return Promise.reject(error);
    }

    // 401 Unauthorized token refresh
    const isAuthEndpoint =
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/refresh-token') ||
      originalRequest.url?.includes('/auth/register');

    if (response.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        clearSessionAndRedirect();
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${baseURL}/auth/refresh-token`, {
          refresh_token: refreshToken,
          refreshToken,
        });

        const { access_token, refresh_token } = data.data;
        localStorage.setItem('accessToken', access_token);
        localStorage.setItem('refreshToken', refresh_token);

        processQueue(null, access_token);
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearSessionAndRedirect();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
