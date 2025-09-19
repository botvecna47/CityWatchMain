import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import { Shield, Menu, X } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-primary-600 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                CityWatch
              </span>
            </Link>
          </motion.div>
          
          <motion.div 
            className="hidden md:flex space-x-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive('/dashboard') 
                      ? 'text-primary-600 bg-primary-50 shadow-sm' 
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/reports"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive('/reports') 
                      ? 'text-primary-600 bg-primary-50 shadow-sm' 
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  Reports
                </Link>
                <Link
                  to="/settings"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/settings') 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  Settings
                </Link>
                <Link
                  to="/events"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/events') 
                      ? 'text-green-600 bg-green-50' 
                      : 'text-green-700 hover:text-green-600 hover:bg-gray-50'
                  }`}
                >
                  Events
                </Link>
                <Link
                  to="/announcements"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/announcements') 
                      ? 'text-purple-600 bg-purple-50' 
                      : 'text-purple-700 hover:text-purple-600 hover:bg-gray-50'
                  }`}
                >
                  Announcements
                </Link>
                {['authority', 'admin'].includes(user.role) && (
                  <Link
                    to="/alerts"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/alerts') 
                        ? 'text-yellow-600 bg-yellow-50' 
                        : 'text-yellow-700 hover:text-yellow-600 hover:bg-gray-50'
                    }`}
                  >
                    Alerts
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/admin/dashboard') 
                        ? 'text-red-600 bg-red-50' 
                        : 'text-red-700 hover:text-red-600 hover:bg-gray-50'
                    }`}
                  >
                    Admin Dashboard
                  </Link>
                )}
                <div className="flex items-center space-x-4">
                  <NotificationDropdown />
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                      {user.profilePictureUrl ? (
                        <img
                          src={`http://localhost:5000${user.profilePictureUrl}`}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-gray-700">
                      Welcome, <span className="font-medium">{user.username}</span>
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/') 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/login"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/login') 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/signup') 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  Sign Up
                </Link>
              </>
            )}
          </motion.div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/dashboard') 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/reports"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/reports') 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  Reports
                </Link>
                <Link
                  to="/events"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/events') 
                      ? 'text-green-600 bg-green-50' 
                      : 'text-green-700 hover:text-green-600 hover:bg-gray-50'
                  }`}
                >
                  Events
                </Link>
                <Link
                  to="/announcements"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/announcements') 
                      ? 'text-purple-600 bg-purple-50' 
                      : 'text-purple-700 hover:text-purple-600 hover:bg-gray-50'
                  }`}
                >
                  Announcements
                </Link>
                {['authority', 'admin'].includes(user.role) && (
                  <Link
                    to="/alerts"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive('/alerts') 
                        ? 'text-yellow-600 bg-yellow-50' 
                        : 'text-yellow-700 hover:text-yellow-600 hover:bg-gray-50'
                    }`}
                  >
                    Alerts
                  </Link>
                )}
                <div className="flex items-center space-x-3 px-3 py-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    {user.profilePictureUrl ? (
                      <img
                        src={`http://localhost:5000${user.profilePictureUrl}`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="text-sm text-gray-700">
                    Welcome, <span className="font-medium">{user.username}</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/') 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/login"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/login') 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/signup') 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
