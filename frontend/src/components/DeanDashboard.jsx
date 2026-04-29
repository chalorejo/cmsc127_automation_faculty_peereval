import React from 'react';
import Sidebar from './Sidebar';
import FacultyTable from './FacultyTable';

const DeanDashboard = () => {
  return (
    <div className="flex min-h-screen bg-white font-sans text-gray-900 antialiased">
      <Sidebar />
      <FacultyTable />
    </div>
  );
};

export default DeanDashboard;
