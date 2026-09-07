import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, PlusCircle, LayoutDashboard, LogOut, LogIn, UserPlus, Menu, X, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-sky-600 text-white p-2 rounded-xl group-hover:bg-sky-700 transition-colors shadow-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">
              Civic<span className="text-sky-600">Fix</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-sm font-semibold text-slate-600 hover:text-sky-600 transition-colors">
              Home
            </Link>
            
            {user && (
              <Link to="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-sky-600 transition-colors flex items-center space-x-1">
                <LayoutDashboard className="w-4 h-4" />
                <span>My Dashboard</span>
              </Link>
            )}

            {isAdmin && (
              <Link to="/admin" className="text-sm font-semibold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg hover:bg-purple-100 transition-colors flex items-center space-x-1 border border-purple-200">
                <Shield className="w-4 h-4" />
                <span>Admin Panel</span>
              </Link>
            )}
          </nav>

          {/* Action Button & Auth */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/report"
              className="inline-flex items-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:shadow transition-all duration-150 transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report an Issue</span>
            </Link>

            {user ? (
              <div className="flex items-center space-x-3 pl-2 border-l border-slate-200">
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-900 leading-tight">{user.name}</div>
                  <div className="text-xs font-semibold text-slate-500 capitalize">{user.role.toLowerCase()}</div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-sky-600 transition-colors flex items-center space-x-1"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Log in</span>
                </Link>
                <Link
                  to="/signup"
                  className="px-3.5 py-2 text-sm font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center space-x-1"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Sign up</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <Link
              to="/report"
              className="bg-sky-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Report</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-700 py-2 border-b border-slate-100"
          >
            Home
          </Link>
          {user && (
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-700 py-2 border-b border-slate-100"
            >
              My Dashboard
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-bold text-purple-700 py-2 border-b border-slate-100"
            >
              Admin Panel
            </Link>
          )}

          {user ? (
            <div className="pt-2 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="pt-2 flex space-x-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 text-sm font-semibold text-white bg-sky-600 rounded-lg"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
