import React, { useState, useEffect, useContext } from 'react';
import TabButton from './components/common/TabButton';
import WorkersTab from './components/workers/WorkersTab';
import RolesTab from './components/roles/RolesTab';
import ConfigTab from './components/config/ConfigTab';
import ScheduleTab from './components/schedule/ScheduleTab';
import LoginPage from './components/auth/LoginPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Users, Settings, Calendar, Clock, LogOut, RefreshCw } from 'lucide-react';
import { DataContext } from './context/DataContext';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('workers');
  const { refreshData } = useContext(DataContext);

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
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Sistema de Gestión de Horarios</h1>
          <div className="flex items-center gap-4">
            <button 
              onClick={refreshData}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white bg-blue-500 hover:bg-blue-600 transition-all"
            >
              <RefreshCw size={20} />
              Actualizar Datos
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white bg-red-500 hover:bg-red-600 transition-all"
            >
              <LogOut size={20} />
              Cerrar Sesión
            </button>
          </div>
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