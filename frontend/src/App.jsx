import React from 'react';
import DeanDashboard from './components/admin/DeanDashboard';
import { ToastProvider } from './lib/ToastContext';

function App() {
  return (
    <ToastProvider>
      <div className="App">
        <DeanDashboard />
      </div>
    </ToastProvider>
  );
}

export default App;
