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

export interface RegisterResponse {
  email: string;
  requiresVerification: boolean;
  message: string;
}

export interface SessionUser {
  username: string;
  email: string;
  role: string;
}

export interface PasswordCodeVerifiedResponse {
  verificationToken: string;
  message: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  username: string;
}

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

const saveSession = (response: AuthResponse): void => {
  localStorage.setItem(TOKEN_KEY, response.token);
  localStorage.setItem(
    USER_KEY,
    JSON.stringify({
      username: response.username,
      email: response.email,
      role: response.role
    })
  );
};

export const AuthService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    saveSession(response.data);
    return response.data;
  },

  register: async (userData: RegisterData): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('/auth/register', userData);
    return response.data;
  },

  verifyRegistration: async (data: { email: string; code: string }): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register/verify', data);
    saveSession(response.data);
    return response.data;
  },

  resendRegistrationCode: async (email: string): Promise<void> => {
    await api.post('/auth/register/resend-code', { email });
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/password/forgot', { email });
  },

  verifyPasswordResetCode: async (data: { email: string; code: string }): Promise<PasswordCodeVerifiedResponse> => {
    const response = await api.post<PasswordCodeVerifiedResponse>('/auth/password/verify-code', data);
    return response.data;
  },

  resetPassword: async (data: { email: string; verificationToken: string; newPassword: string }): Promise<void> => {
    await api.post('/auth/password/reset', data);
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  googleLogin: async (data: { credential: string }): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/google', {
      credential: data.credential
    });

    saveSession(response.data);
    return response.data;
  },

  isAuthenticated: (): boolean => Boolean(localStorage.getItem(TOKEN_KEY)),

  getCurrentUser: (): SessionUser | null => {
    const serializedUser = localStorage.getItem(USER_KEY);
    if (!serializedUser) return null;

    try {
      return JSON.parse(serializedUser) as SessionUser;
    } catch {
      AuthService.logout();
      return null;
    }
  }
};
