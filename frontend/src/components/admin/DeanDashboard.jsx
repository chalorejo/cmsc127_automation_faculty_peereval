import React, { useState } from 'react';
import Sidebar from './Sidebar';
import FacultyTable from './FacultyTable';
import EvaluatorSelection from './EvaluatorSelection';
import ProgressDashboard from './ProgressDashboard';
import QuestionsPage from './QuestionsPage';
import { Menu } from 'lucide-react';
import logo from '../../assets/website logo.svg';

const DeanDashboard = ({ onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('select-faculty');

  const renderView = () => {
    switch (currentView) {
      case 'select-faculty':
        return <FacultyTable onComplete={() => setCurrentView('select-evaluators')} />;
      case 'select-evaluators':
        return <EvaluatorSelection onConfirm={() => setCurrentView('progress')} />;
      case 'questions':
        return <QuestionsPage />;
      case 'progress':
        return <ProgressDashboard />;
      default:
        return <FacultyTable />;
    }
  };

  return (
    <div className="flex min-h-screen bg-brand-bg relative">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onLogout={onLogout}
      />
      
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
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default DeanDashboard;
