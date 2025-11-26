import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, LogOut, User, FileText, Bell, Home, Users, Calendar, HeartPulse, Pill, Star, MessageCircle } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    if (user?.role === 'patient') {
      return [
        { to: '/patient/dashboard', icon: Home, label: 'Dashboard' },
        { to: '/patient/reports', icon: FileText, label: 'Reports' },
        { to: '/appointments', icon: Calendar, label: 'Appointments' },
        { to: '/prescriptions', icon: Pill, label: 'Prescriptions' },
        { to: '/health-metrics', icon: HeartPulse, label: 'Health' },
        { to: '/messages', icon: MessageCircle, label: 'Messages' },
        { to: '/reviews', icon: Star, label: 'Reviews' }
      ];
    } else if (user?.role === 'doctor') {
      return [
        { to: '/doctor/dashboard', icon: Home, label: 'Dashboard' },
        { to: '/doctor/access', icon: FileText, label: 'Patients' },
        { to: '/appointments', icon: Calendar, label: 'Appointments' },
        { to: '/prescriptions', icon: Pill, label: 'Prescriptions' },
        { to: '/messages', icon: MessageCircle, label: 'Messages' },
        { to: '/reviews', icon: Star, label: 'Reviews' }
      ];
    } else if (user?.role === 'admin') {
      return [
        { to: '/admin/dashboard', icon: Home, label: 'Dashboard' },
        { to: '/notifications', icon: Bell, label: 'Notifications' }
      ];
    }
    return [];
  };

  const navLinks = getNavLinks();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group flex-shrink-0">
            <div className="h-11 w-11 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-glow transition-all duration-300 transform group-hover:scale-110">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">MediChain</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 flex-1 justify-center max-w-4xl mx-8">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                    active 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium text-sm">{link.label}</span>
                </Link>
              );
            })}
          </div>
          
          {/* User Menu */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Link
              to="/profile"
              className={`hidden md:flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-300 ${
                isActive('/profile')
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-md'
                  : 'bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100'
              }`}
            > 
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                isActive('/profile')
                  ? 'bg-white/20'
                  : 'bg-gradient-to-br from-blue-600 to-purple-600'
              }`}>
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="text-left">
                <p className={`text-xs font-semibold ${isActive('/profile') ? 'text-white' : 'text-gray-900'}`}>
                  {user?.name}
                </p>
                <p className={`text-xs capitalize flex items-center gap-1 ${isActive('/profile') ? 'text-white/80' : 'text-gray-600'}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  {user?.role}
                </p>
              </div>
            </Link>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-300 transform hover:scale-105 border-2 border-transparent hover:border-red-200"
            >
              <LogOut className="h-5 w-5" />
              <span className="hidden lg:inline font-medium text-sm">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-3 flex space-x-2 overflow-x-auto scrollbar-hide">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                  active
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
