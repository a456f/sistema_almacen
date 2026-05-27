import { API_URL } from '../config/api';

export interface User {
  id: number;
  username: string;
  nombre: string | null;
  rol: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  user?: User;
}

export const loginUser = async (username: string, password: string): Promise<LoginResponse> => {
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok) return { success: true, message: data.message, user: data.user };
    return { success: false, message: data.message || 'Error desconocido.' };
  } catch {
    return { success: false, message: 'No se pudo conectar con el servidor.' };
  }
};
