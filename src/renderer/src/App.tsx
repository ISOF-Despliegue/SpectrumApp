import React from 'react';
import { useLocation, Routes, Route, Navigate, HashRouter } from 'react-router-dom';
import { Home } from './pages/Home';
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { VerifyRegistration } from './pages/Auth/VerifyRegistration';
import { ForgotPassword } from './pages/Auth/ForgotPassword';
import { ResetPassword } from './pages/Auth/ResetPassword';
import { Games } from './pages/Games';
import { MainLayout } from './components/ui/MainLayout';
import { Admin } from './pages/Admin';
import { AdminMyProfile } from './pages/Admin/MyProfile';
import { AdminGlobalMetrics } from './pages/Admin/GlobalMetrics';
import { ManageUsers } from './pages/Admin/ManageUsers';
import { AdminManageReviews } from './pages/Admin/ManageReviews';
import { AdminManageEvents } from './pages/Admin/ManageEvents';
import { AdminManageAdmins } from './pages/Admin/ManageAdmins';
import { ManageReports } from './pages/Admin/ManageReports';
import { GameReviews } from './pages/Games/GameReviews';
import { Profile } from './pages/Profile';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function AppContent(): React.JSX.Element {
  const location = useLocation();
  const isAuthRoute = ['/', '/login', '/register', '/register/verify', '/forgot-password', '/reset-password'].includes(location.pathname);
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <MainLayout
      isScrollable={true}
      showNavbar={!isAuthRoute}
      hideNavigation={isAdminRoute}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/verify" element={<VerifyRegistration />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/games" element={<ProtectedRoute><Games /></ProtectedRoute>} />
        <Route path="/games/:gameId/reviews" element={<ProtectedRoute><GameReviews /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        <Route path="/admin" element={<ProtectedRoute requireAdmin><Admin /></ProtectedRoute>}>
          <Route index element={<Navigate to="my-profile" replace />} />
          <Route path="my-profile" element={<AdminMyProfile />} />
          <Route path="global-metrics" element={<AdminGlobalMetrics />} />
          <Route path="manage-users" element={<ManageUsers />} />
          <Route path="manage-reviews" element={<AdminManageReviews />} />
          <Route path="manage-events" element={<AdminManageEvents />} />
          <Route path="manage-admins" element={<AdminManageAdmins />} />
          <Route path="manage-reports" element={<ManageReports />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </MainLayout>
  );
}

function App(): React.JSX.Element {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}

export default App;
