import React from 'react';
import AuthGate from './components/AuthGate';
import { ToastProvider } from './lib/ToastContext';

function App() {
  return (
    <ToastProvider>
      <AuthGate />
    </ToastProvider>
  );
}

export default App;
