import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, LogOut, LayoutDashboard, Shield } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-slate-950/80 backdrop-blur-md border-b border-slate-900 no-print sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center space-x-2">
              <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white font-sans">Resumix</span>
              <span className="bg-blue-950/60 text-blue-400 text-[10px] px-2 py-0.5 rounded-full font-semibold border border-blue-900/50 hidden sm:inline-block">
                ATS Scorer
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-slate-350 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors duration-200"
                >
                  <LayoutDashboard className="h-4 w-4 text-blue-500" />
                  Dashboard
                </Link>

                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="text-amber-400 hover:text-amber-300 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1 transition-colors duration-200"
                  >
                    <Shield className="h-4 w-4 text-amber-400" />
                    Admin
                  </Link>
                )}

                <div className="h-6 w-px bg-slate-800" />

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1.5">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-slate-300 text-sm font-medium hidden md:inline">
                      {user.name}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="text-slate-400 hover:text-white p-1.5 rounded-md text-sm font-medium flex items-center gap-1 hover:bg-slate-900/50 transition-all duration-200"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-slate-350 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 px-4 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  Get Started
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
