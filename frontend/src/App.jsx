import React, { useState, useEffect } from 'react';
import TabButton from './components/common/TabButton';
import WorkersTab from './components/workers/WorkersTab';
import RolesTab from './components/roles/RolesTab';
import ConfigTab from './components/config/ConfigTab';
import ScheduleTab from './components/schedule/ScheduleTab';
import ExportTab from './components/common/ExportTab';
import LoginPage from './components/auth/LoginPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Placeholder icons
const Users = ({ size }) => <span style={{ fontSize: size ? size + 'px' : '20px' }}>👥</span>;
const Settings = ({ size }) => <span style={{ fontSize: size ? size + 'px' : '20px' }}>⚙️</span>;
const Calendar = ({ size }) => <span style={{ fontSize: size ? size + 'px' : '20px' }}>📅</span>;
const Clock = ({ size }) => <span style={{ fontSize: size ? size + 'px' : '20px' }}>🕐</span>;
const FileDown = ({ size }) => <span style={{ fontSize: size ? size + 'px' : '20px' }}>📥</span>;
const LogOut = ({ size }) => <span style={{ fontSize: size ? size + 'px' : '20px' }}>🚪</span>;

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('workers');

  useEffect(() => {
    const token = localStorage.getItem('token'); // Use token for auth
    setIsAuthenticated(!!token);
  }, []);

  const handleLogin = () => {
    // isAuthenticated is now derived from token presence in localStorage
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAuthenticated'); // Remove old flag as well
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const TABS = {
    workers: { label: 'Trabajadores', icon: Users, component: <WorkersTab /> },
    roles: { label: 'Roles', icon: Settings, component: <RolesTab /> },
    config: { label: 'Configuración', icon: Calendar, component: <ConfigTab /> },
    schedule: { label: 'Horarios', icon: Clock, component: <ScheduleTab /> },
    export: { label: 'Exportar', icon: FileDown, component: <ExportTab /> },
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Sistema de Gestión de Horarios</h1>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white bg-red-500 hover:bg-red-600 transition-all"
          >
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </header>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(TABS).map(([tabId, tabData]) => (
            <TabButton
              key={tabId}
              id={tabId}
              label={tabData.label}
              icon={tabData.icon}
              active={activeTab === tabId}
              onClick={setActiveTab}
            />
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          {TABS[activeTab].component}
        </div>
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
};

export default App;