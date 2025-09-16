import React, { useState, useEffect, useContext } from 'react';
import TabButton from './components/common/TabButton';
import WorkersTab from './components/workers/WorkersTab';
import RolesTab from './components/roles/RolesTab';
import ConfigTab from './components/config/ConfigTab';
import ScheduleTab from './components/schedule/ScheduleTab';
import DashboardTab from './components/dashboard/DashboardTab'; // Import DashboardTab
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Users, Settings, Calendar, Clock, LogOut, RefreshCw, LayoutDashboard } from 'lucide-react'; // Import LayoutDashboard
import { DataContext } from './context/DataContext';
import { getMe } from './services/api';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('workers');
  const [authView, setAuthView] = useState('login');
  const { refreshData, setUser, user } = useContext(DataContext);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const fetchUser = async () => {
        try {
          const res = await getMe();
          const userData = await res.json();
          if (userData.success) {
            setUser(userData.data);
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('token');
          }
        } catch (error) {
          localStorage.removeItem('token');
        }
      };
      fetchUser();
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    setAuthView('login');
  };

  if (!isAuthenticated) {
    if (authView === 'login') {
      return <LoginPage onLogin={handleLogin} onNavigateToRegister={() => setAuthView('register')} />;
    }
    return <RegisterPage onNavigateToLogin={() => setAuthView('login')} />;
  }

  console.log('User object:', user);
  const TABS = {
    workers: { label: 'Trabajadores', icon: Users, component: <WorkersTab /> },
    roles: { label: 'Roles', icon: Settings, component: <RolesTab /> },
    schedule: { label: 'Horarios', icon: Clock, component: <ScheduleTab /> },
  };

  // Add admin/manager only tabs
  if (user && (user.role === 'admin' || user.role === 'manager')) {
    TABS.dashboard = { label: 'Dashboard', icon: LayoutDashboard, component: <DashboardTab /> };
  }
  
  // Add admin-only tabs
  if (user && user.role === 'admin') {
    TABS.config = { label: 'Configuración', icon: Calendar, component: <ConfigTab /> };
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Sistema de Gestión de Horarios</h1>
          <div className="flex items-center gap-4">
            {user && (
              <span className="text-gray-600">
                Hola, <span className="font-bold">{user.username}</span> ({user.role})
              </span>
            )}
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
          {TABS[activeTab] ? TABS[activeTab].component : <div>Cargando...</div>}
        </div>
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
};

export default App;
