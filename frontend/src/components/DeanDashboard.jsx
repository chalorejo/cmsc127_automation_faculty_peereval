import React, { useState } from 'react';
import Sidebar from './Sidebar';
import FacultyTable from './FacultyTable';
import { Menu } from 'lucide-react';
import logo from '../assets/website logo.svg';

const DeanDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-brand-bg relative">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-100 sticky top-0 z-30">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-brand-grey hover:text-brand-black transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <img src={logo} alt="Logo" className="h-8 object-contain" />
          <div className="w-10" /> {/* Spacer for balance */}
        </header>

        <div className="flex-1 overflow-y-auto">
          <FacultyTable />
        </div>
      </main>
    </div>
  );
};

export default DeanDashboard;
