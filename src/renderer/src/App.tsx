import React from 'react';
import { useLocation, Routes, Route, Navigate, HashRouter } from 'react-router-dom';
import { Home } from './pages/Home';
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { Games } from './pages/Games';
import { MainLayout } from './components/ui/MainLayout';
import { Admin } from './pages/Admin';
import { AdminMyProfile } from './pages/Admin/Admin_MyProfile';
import { AdminGlobalMetrics } from './pages/Admin/Admin_GlobalMetrics';
import { AdminManageUsers } from './pages/Admin/Admin_ManageUsers';
import { AdminManageReviews } from './pages/Admin/Admin_ManageReviews';
import { AdminManageEvents } from './pages/Admin/Admin_ManageEvents';
import { AdminManageAdmins } from './pages/Admin/Admin_ManageAdmins';

function AppContent(): React.JSX.Element {
  const location = useLocation();
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/';
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
        <Route path="/home" element={<Home />} />
        <Route path="/games" element={<Games />} />

        <Route path="/admin" element={<Admin />}>
          <Route index element={<Navigate to="my-profile" replace />} />
          <Route path="my-profile" element={<AdminMyProfile />} />
          <Route path="global-metrics" element={<AdminGlobalMetrics />} />
          <Route path="manage-users" element={<AdminManageUsers />} />
          <Route path="manage-reviews" element={<AdminManageReviews />} />
          <Route path="manage-events" element={<AdminManageEvents />} />
          <Route path="manage-admins" element={<AdminManageAdmins />} />
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
