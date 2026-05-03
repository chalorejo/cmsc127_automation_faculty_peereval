import React, { useState, useEffect } from 'react';
import AppRoutes from './routes/Routes';
import { ToastProvider } from './lib/ToastContext';

function App() {
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
