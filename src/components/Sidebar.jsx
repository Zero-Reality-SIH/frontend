import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FiSearch, FiDatabase, FiUpload, FiMenu, FiX } from 'react-icons/fi';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  
  const menuItems = [
    { path: '/search', label: 'Code Search', icon: FiSearch },
    { path: '/fhir', label: 'FHIR Generator', icon: FiDatabase },
    { path: '/upload', label: 'CSV Upload', icon: FiUpload }
  ];

  const isActivePath = (path) => location.pathname === path;

  return (
    <div
      className={`${
        sidebarOpen ? "w-64" : "w-16"
      } glass border-r border-background-200 transition-all duration-300 h-screen flex flex-col`}
    >
      {/* Header */}
      <div className="p-4 border-b border-background-200">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-background-100 hover:bg-background-200 transition-colors text-text-400 hover:text-text-200"
        >
          {sidebarOpen ? <FiX className="w-4 h-4" /> : <FiMenu className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(item.path);
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-primary text-white shadow-medical'
                      : 'text-text-400 hover:bg-background-100 hover:text-text-200'
                  }`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${
                    isActive ? 'text-white' : 'text-text-500 group-hover:text-text-300'
                  }`} />
                  {sidebarOpen && (
                    <span className="font-medium truncate">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      {sidebarOpen && (
        <div className="p-4 border-t border-background-200">
          <div className="text-xs text-text-500 text-center">
            <p className="text-text-800 font-medium">Medical Code Mapper</p>
            <p className="mt-1">v2.1.0 • Dark Edition</p>
            <div className="mt-2 flex items-center justify-center space-x-1">
              <div className="w-2 h-2 bg-secondary-500 rounded-full animate-pulse"></div>
              <span className="text-secondary-400">Live</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
