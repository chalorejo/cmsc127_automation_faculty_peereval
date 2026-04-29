import React from 'react';
import { Home, Bell, FileText, LayoutDashboard, Settings, ChevronDown } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { icon: Home, label: 'Home', active: true },
    { icon: Bell, label: 'Notifications' },
    { icon: FileText, label: 'Forms' },
    { icon: LayoutDashboard, label: 'Dashboard' },
    { icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="w-64 border-r border-gray-200 flex flex-col h-screen bg-white">
      {/* Logo Section */}
      <div className="p-6 flex flex-col items-center text-center border-b border-gray-100">
        <img 
          src="https://upload.wikimedia.org/wikipedia/en/thumb/9/91/UP_Mindanao_Seal.png/200px-UP_Mindanao_Seal.png" 
          alt="UP Mindanao Seal" 
          className="w-24 h-24 mb-4 object-contain"
        />
        <div className="space-y-0.5">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">University of the Philippines</p>
          <p className="text-xl font-bold text-gray-800 tracking-tight">MINDANAO</p>
          <p className="text-[10px] leading-tight text-gray-500 font-medium">Automated Faculty Peer Evaluation System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              item.active 
                ? 'bg-gray-100 text-gray-900 font-semibold shadow-sm' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-100">
        <button className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors group">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
             {/* Placeholder for avatar */}
             <div className="w-full h-full bg-gray-300 animate-pulse" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">Johnson Doe</p>
            <p className="text-xs text-gray-500 truncate">johndoe@gmail.com</p>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
