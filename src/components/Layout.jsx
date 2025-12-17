import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, ListTodo, History, BarChart3, Settings, LogOut } from 'lucide-react';
import { clearCurrentUser } from '../utils/auth';
import { motion } from 'framer-motion';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearCurrentUser();
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Accueil' },
    { path: '/tasks', icon: ListTodo, label: 'Tâches' },
    { path: '/history', icon: History, label: 'Historique' },
    { path: '/stats', icon: BarChart3, label: 'Statistiques' },
    { path: '/settings', icon: Settings, label: 'Paramètres' },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Navigation top */}
      <nav className="sticky top-0 bg-ebt-gray border-b border-ebt-gray-light z-50 backdrop-blur-sm bg-opacity-95">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 mr-4">
              <img 
                src="/logo.png" 
                alt="EBT Logo" 
                className="h-10 w-10 object-contain"
              />
            </div>
            <div className="flex items-center gap-1 flex-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors relative ${
                      isActive
                        ? 'text-white bg-ebt-gray-light'
                        : 'text-gray-400 hover:text-white hover:bg-ebt-gray-light/50'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-sm font-medium">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-ebt-gray-light/50 transition-colors"
            >
              <LogOut size={20} />
              <span className="text-sm font-medium">Déconnexion</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

