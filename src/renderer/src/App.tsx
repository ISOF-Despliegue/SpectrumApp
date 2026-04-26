import React from 'react';
import { HashRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { MainLayout } from './components/ui/MainLayout';
import { Admin } from './pages/Admin';
import { AdminMyProfile } from './pages/Admin/Admin_MyProfile';
import { AdminGlobalMetrics } from './pages/Admin/Admin_GlobalMetrics';
import { AdminManageUsers } from './pages/Admin/Admin_ManageUsers';
import { AdminManageReviews } from './pages/Admin/Admin_ManageReviews';
import { AdminManageEvents } from './pages/Admin/Admin_ManageEvents';
import { AdminManageAdmins } from './pages/Admin/Admin_ManageAdmins';

const HomePage = (): React.JSX.Element => {
  const navigate = useNavigate();

  return (
    <MainLayout isScrollable={true}>
      <button
        style={{
          position: 'absolute',
          top: '260px',
          right: '20px',
          padding: '0.5rem',
          background: '#e53e3e',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          zIndex: 10
        }}
        onClick={() => navigate('/login')}
      >
        Cerrar Sesión (Demo)
      </button>

      <Home />
    </MainLayout>
  );
};

function App(): React.JSX.Element {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/home" element={<HomePage />} />

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
    </HashRouter>
  );
}

export default App;
