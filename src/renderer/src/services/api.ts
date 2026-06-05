import axios from 'axios';

const getBaseUrl = () => {
  if (typeof window !== 'undefined' && (window as any).electron) {
    return "https://spectrum-server.tail0eee51.ts.net/api";
  }
  return import.meta.env.VITE_API_URL || "http://localhost:5283/api";
};

const API_BASE_URL = getBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || '';
    const isCodeVerification =
      requestUrl.includes('/auth/password/verify-code') ||
      requestUrl.includes('/auth/register/verify') ||
      requestUrl.includes('/profile/me/password/change/verify-code');

    if (error.response?.status === 401 && !isCodeVerification) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }

    return Promise.reject(error);
  }
);
