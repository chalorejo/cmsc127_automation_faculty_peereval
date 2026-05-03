import React, { useEffect, useState } from 'react';
import DeanDashboard from './admin/DeanDashboard';
import AdminLogin from './AdminLogin';
import { api } from '../lib/api';

const AuthGate = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isLoggedIn = api.auth.isAuthenticated();
    setIsAuthenticated(isLoggedIn);
    setLoading(false);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    api.auth.logout();
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return isAuthenticated ? (
    <DeanDashboard onLogout={handleLogout} />
  ) : (
    <AdminLogin onLoginSuccess={handleLoginSuccess} />
  );
};

export default AuthGate;
