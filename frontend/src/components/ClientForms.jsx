import React, { useState } from 'react';
import Sidebar from './admin/Sidebar';
import logo from '../assets/website logo.svg';

const ClientForms = () => {

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-brand-bg relative">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        </div>
  );
};

export default ClientForms;
