import { api } from './api';

export const ROLES = {
  ADMIN: 'ADMIN',
  REVIEWER: 'REVIEWER',
  READER: 'READER'
};

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
  role: string;
}

export const AuthService = {
  login: async (credentials: any): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);

    localStorage.setItem('token', response.data.token);
    localStorage.setItem(
      'user',
      JSON.stringify({
        username: response.data.username,
        email: response.data.email,
        role: response.data.role
      })
    );
    return response.data;
  },

  register: async (userData: any): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', userData);

    localStorage.setItem('token', response.data.token);
    localStorage.setItem(
      'user',
      JSON.stringify({
        username: response.data.username,
        email: response.data.email,
        role: response.data.role
      })
    );
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  googleLogin: async (data: { credential: string }): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/google', {
      credential: data.credential
    });

    localStorage.setItem('token', response.data.token);
    localStorage.setItem(
      'user',
      JSON.stringify({
        username: response.data.username,
        email: response.data.email,
        role: response.data.role
      })
    );
    return response.data;
  }
};
