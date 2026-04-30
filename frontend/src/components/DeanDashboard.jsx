import React from 'react';
import Sidebar from './Sidebar';
import FacultyTable from './FacultyTable';

const DeanDashboard = () => {
  return (
    <div className="flex min-h-screen bg-brand-bg">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <FacultyTable />
      </main>
    </div>
  );
};

export default DeanDashboard;
