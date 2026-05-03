import React, { useState, useEffect } from 'react';
import AppRoutes from './routes/Routes';
import { ToastProvider } from './lib/ToastContext';
import { api } from './lib/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
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
      <ToastProvider>
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading...</p>
        </div>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <AppRoutes
        isAuthenticated={isAuthenticated}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
      />
    </ToastProvider>
  );
}

export default App;
