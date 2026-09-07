import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Shield, User, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const Login = () => {
  const { login, adminLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const from = location.state?.from?.pathname || (isAdminMode ? '/admin' : '/dashboard');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      let userObj;
      if (isAdminMode) {
        userObj = await adminLogin(email.trim(), password);
      } else {
        userObj = await login(email.trim(), password);
      }

      if (userObj.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate(from);
      }
    } catch (err) {
      console.error('Login Error:', err);
      setError(err.response?.data?.message || 'Invalid credentials or connection error.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillCitizenDemo = () => {
    setIsAdminMode(false);
    setEmail('citizen@civicfix.local');
    setPassword('Citizen@12345');
    setError(null);
  };

  const fillAdminDemo = () => {
    setIsAdminMode(true);
    setEmail('admin@civicfix.local');
    setPassword('Admin@12345');
    setError(null);
  };

  return (
    <div className="flex-1 bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Card Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {isAdminMode ? 'Admin Portal Access' : 'Sign in to CivicFix'}
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {isAdminMode ? 'Manage municipal issues & analytics' : 'Access your reported issues and community upvotes'}
          </p>
        </div>

        {/* Quick Demo Fill Pill Buttons */}
        <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 mb-6">
          <span className="text-xs font-bold text-sky-800 uppercase tracking-wider block mb-2 text-center">
            One-Click Demo Credentials
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={fillCitizenDemo}
              className="py-2 px-3 bg-white hover:bg-sky-100 text-sky-900 rounded-xl text-xs font-bold border border-sky-200 shadow-sm flex items-center justify-center space-x-1"
            >
              <User className="w-3.5 h-3.5" />
              <span>Citizen Demo</span>
            </button>
            <button
              type="button"
              onClick={fillAdminDemo}
              className="py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center space-x-1"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Demo</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          {/* Mode Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setIsAdminMode(false)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                !isAdminMode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Citizen Login
            </button>
            <button
              type="button"
              onClick={() => setIsAdminMode(true)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                isAdminMode ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              Admin Login
            </button>
          </div>

          {error && (
            <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Email Address</label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3.5 font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center space-x-2 ${
                isAdminMode
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-sky-600 hover:bg-sky-700 text-white'
              }`}
            >
              {submitting ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {!isAdminMode && (
            <div className="mt-6 text-center text-xs text-slate-500">
              Don't have an account?{' '}
              <Link to="/signup" className="font-bold text-sky-600 hover:underline">
                Sign up as Citizen
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
