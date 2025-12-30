import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, FileText, Settings, 
  LogOut, User, ChevronDown, Users
} from 'lucide-react';
import { useState } from 'react';

const BLUM_LOGO = "https://customer-assets.emergentagent.com/job_9070e371-71fc-4a23-b411-e6a30412bc7d/artifacts/04io5yv7_blum-logo.svg";

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/deals', label: 'Deals', icon: FileText },
  { path: '/templates', label: 'Templates', icon: FileText, adminOnly: true },
  { path: '/users', label: 'Benutzer', icon: Users, adminOnly: true },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-slate-100">
        <Link to="/dashboard" className="flex items-center justify-center">
          <img 
            src={BLUM_LOGO} 
            alt="Blum Verwaltungs- und Treuhand AG" 
            className="h-12 w-auto"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
            (item.path === '/deals' && location.pathname.startsWith('/deals'));
          
          // Only show admin items to admin
          if (item.adminOnly && !isAdmin) return null;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all ${
                isActive
                  ? 'bg-bronze/10 text-bronze font-medium'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-bronze' : ''}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Menu */}
      <div className="p-4 border-t border-slate-100">
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center gap-3 p-3 rounded-md hover:bg-slate-50 transition-all"
            data-testid="user-menu-btn"
          >
            <div className="w-9 h-9 bg-bronze/10 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-bronze" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>
          
          {showUserMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-slate-200 rounded-md shadow-lg overflow-hidden animate-scale-in">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors"
                data-testid="logout-btn"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Abmelden</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
