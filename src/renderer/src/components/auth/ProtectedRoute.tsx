import React from 'react';
import { Navigate } from 'react-router-dom';
import { AuthService, ROLES } from '../../services/auth.service';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps): React.JSX.Element => {
  const user = AuthService.getCurrentUser();

  if (!AuthService.isAuthenticated() || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== ROLES.ADMIN) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};
