import React, { useState, useEffect } from 'react';
import AppRoutes from './routes/Routes';
import { ToastProvider } from './lib/ToastContext';
import { api } from './lib/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(api.auth.isAuthenticated());
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    api.auth.logout();
    setIsAuthenticated(false);
  };

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
