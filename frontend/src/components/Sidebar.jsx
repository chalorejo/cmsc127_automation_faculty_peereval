import React from 'react';
import { Home, Bell, FileText, LayoutDashboard, Settings, ChevronDown, X } from 'lucide-react';
import logo from '../assets/website logo.svg';
import facultyIcon from '../assets/faculty-icon.svg';

const Sidebar = ({ isOpen, onClose }) => {
  const navItems = [
    { icon: Home, label: 'Home', active: true },
    { icon: Bell, label: 'Notifications' },
    { icon: FileText, label: 'Forms' },
    { icon: LayoutDashboard, label: 'Dashboard' },
    { icon: Settings, label: 'Settings' },
  ];

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 flex flex-col h-screen transition-transform duration-300 ease-in-out lg:translate-x-0 lg:sticky lg:top-0 lg:self-start lg:flex
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={sidebarClasses}>
        {/* Logo Section */}
        <div className="p-8 flex flex-col items-center text-center relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-brand-grey lg:hidden"
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={logo} 
            alt="Website Logo" 
            className="w-full object-contain mb-2"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-2 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                item.active 
                  ? 'bg-[#E5E7EB] text-brand-black font-semibold' 
                  : 'text-brand-grey hover:bg-gray-50 hover:text-brand-black'
              }`}
            >
              <item.icon className={`w-5 h-5 ${item.active ? 'text-brand-black' : 'text-brand-grey'}`} />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-100">
          <button className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors group">
            <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden">
               <img src={facultyIcon} alt="User profile" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold text-brand-black truncate">Johnson Doe</p>
              <p className="text-xs text-brand-grey truncate">johndoe@gmail.com</p>
            </div>
            <ChevronDown className="w-4 h-4 text-brand-grey group-hover:text-brand-black transition-colors" />
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
