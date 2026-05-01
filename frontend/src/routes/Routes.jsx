import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DeanDashboard from '../components/DeanDashboard';
import ClientForms from '../components/ClientForms';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<DeanDashboard />} />
      <Route path="/client-forms" element={<ClientForms />} />
    </Routes>
  );
};

export default AppRoutes;
