import axios, { AxiosInstance } from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';
export const SOCKET_URL = API_BASE_URL.replace(/\/api$/, '');
export const ASSETS_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '') || 'http://localhost:3333';

export function resolveApiAssetUrl(path?: unknown): string | undefined {
  if (typeof path !== 'string') return undefined;

  const trimmedPath = path.trim();
  if (!trimmedPath) return undefined;

  if (
    trimmedPath.startsWith('http') ||
    trimmedPath.startsWith('blob:') ||
    trimmedPath.startsWith('data:')
  ) {
    return trimmedPath;
  }

  const normalizedPath =
    trimmedPath.startsWith('/')
      ? trimmedPath
      : trimmedPath.includes('/')
        ? `/${trimmedPath}`
        : `/uploads/${trimmedPath}`;

  return `${ASSETS_BASE_URL}${normalizedPath}`;
}

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Interceptor para adicionar token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para handle de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
