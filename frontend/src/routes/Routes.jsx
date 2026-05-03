import React from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import DeanDashboard from '../components/admin/DeanDashboard';
import ClientForms from '../components/ClientForms';
import AdminLogin from '../components/AdminLogin';

const AppRoutes = ({ isAuthenticated, onLoginSuccess, onLogout }) => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dean-dashboard" replace />
          ) : (
            <AdminLogin onLoginSuccess={onLoginSuccess} />
          )
        }
      />
      <Route path="/dean-dashboard" element={<DeanDashboard onLogout={onLogout} />} />
      <Route path="/client-forms" element={<ClientForms />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
