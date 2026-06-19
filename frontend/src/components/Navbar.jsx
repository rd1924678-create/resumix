import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, LogOut, LayoutDashboard, Shield, Menu, X } from 'lucide-react';
import logo from '../assets/resumixlogo-removebg-preview.png';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className="bg-slate-950/80 backdrop-blur-md border-b border-slate-900 no-print sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center" onClick={closeMobile}>
              <img src={logo} alt="Resumix Logo" className="h-8 w-auto object-contain -mr-1" />
              <span className="font-bold text-xl sm:text-2xl tracking-tight text-white font-sans mt-0.5">esumix</span>
              <span className="ml-2 bg-blue-950/60 text-blue-400 text-[10px] px-2 py-0.5 rounded-full font-semibold border border-blue-900/50 hidden sm:inline-block">
                ATS Scorer
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden sm:flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-slate-350 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors duration-200"
                >
                  <LayoutDashboard className="h-4 w-4 text-blue-500" />
                  Dashboard
                </Link>

                <Link
                  to="/ats-scorer"
                  className="text-slate-350 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors duration-200"
                >
                  <FileText className="h-4 w-4 text-emerald-500" />
                  ATS Scorer
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
                  to="/ats-scorer"
                  className="text-slate-350 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  ATS Scorer
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

          {/* Mobile hamburger button */}
          <div className="flex items-center sm:hidden">
            {user && (
              <div className="h-7 w-7 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-xs shadow-md mr-3">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-900/50 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      <div
        className={`sm:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 px-4 py-4 space-y-1 safe-bottom">
          {user ? (
            <>
              {/* User info */}
              <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-slate-900/60 rounded-xl border border-slate-800">
                <div className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>

              <Link
                to="/dashboard"
                onClick={closeMobile}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                  location.pathname === '/dashboard'
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <LayoutDashboard className="h-4 w-4 text-blue-500" />
                Dashboard
              </Link>

              <Link
                to="/ats-scorer"
                onClick={closeMobile}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                  location.pathname === '/ats-scorer'
                    ? 'bg-emerald-600/15 text-emerald-400 border border-emerald-500/20'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <FileText className="h-4 w-4 text-emerald-500" />
                ATS Scorer
              </Link>

              <Link
                to="/select-template"
                onClick={closeMobile}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-900 hover:text-white transition-colors"
              >
                <FileText className="h-4 w-4 text-violet-500" />
                Build New Resume
              </Link>

              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={closeMobile}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-amber-400 hover:bg-slate-900 transition-colors"
                >
                  <Shield className="h-4 w-4 text-amber-400" />
                  Admin Panel
                </Link>
              )}

              <div className="pt-2 mt-2 border-t border-slate-800">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-950/30 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={closeMobile}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-900 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/ats-scorer"
                onClick={closeMobile}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-900 hover:text-white transition-colors"
              >
                ATS Scorer
              </Link>
              <Link
                to="/register"
                onClick={closeMobile}
                className="block mt-2 text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/25"
              >
                Get Started — Free
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
