import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DeanDashboard from '../components/admin/DeanDashboard';
import ClientForms from '../components/ClientForms';
import AdminLogin from '../components/AdminLogin';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminLogin />} />
      <Route path="/dean-dashboard" element={<DeanDashboard />} />
      <Route path="/client-forms" element={<ClientForms />} />
    </Routes>
  );
};

export default AppRoutes;
