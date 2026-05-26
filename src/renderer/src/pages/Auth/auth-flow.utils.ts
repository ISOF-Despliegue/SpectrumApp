import { NavigateFunction } from 'react-router-dom';
import { ROLES } from '../../services/auth.service';

export const routeUserByRole = (role: string, navigate: NavigateFunction): void => {
  if (role === ROLES.ADMIN) {
    navigate('/admin/my-profile', { replace: true });
    return;
  }

  navigate('/home', { replace: true });
};

export const getApiErrorKey = (error: unknown, fallback: string): string => {
  const maybeError = error as { response?: { data?: { detail?: string; title?: string } } };
  return maybeError.response?.data?.detail || maybeError.response?.data?.title || fallback;
};

export const isStrongPassword = (password: string): boolean => {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
};
