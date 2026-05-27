// Detecta la URL del backend automáticamente
const detectBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL as string;
  if (typeof window !== 'undefined' && window.location.hostname && window.location.hostname !== 'localhost') {
    return `http://${window.location.hostname}:4001`;
  }
  return 'http://localhost:4001';
};

export const BASE_URL = detectBaseUrl();
export const API_URL = `${BASE_URL}/api`;
